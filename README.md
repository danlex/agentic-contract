# Agentic Contract

A drop-in **policy-as-code** layer for [Claude Code](https://claude.com/claude-code) that turns soft "please be careful" instructions into hard, automated safety rails.

It gives Claude a written contract, blocks or pauses risky tool calls before they run, and forces a read-only judge to review the work before the turn ends.

---

## Why

Telling Claude "don't delete things, don't leak secrets, don't claim tests passed" works most of the time. *Most* is not enough when the tool calls have real side effects.

This project replaces hope with three layers of defense:

1. **The contracts** — plain-markdown rules Claude reads and self-classifies against (`ALLOW` / `ASK APPROVAL` / `BLOCK`).
2. **The PreToolUse hook** — intercepts every `Bash`, `Edit`, `Write`, and `NotebookEdit` call and pattern-matches it against the contract. Forbidden calls are denied. Risky calls are escalated to the user.
3. **The Stop hook + Contract Judge** — when a turn touched files or ran risky commands, the turn cannot end until the `contract-judge` subagent has reviewed the work against both contracts.

If any layer fails, the next one catches it. If all three pass, you ship.

---

## Contract structure

The contract is structured as a **Master Agreement with three Schedules**, in the style of a B2B master service agreement:

```
.claude/contracts/
├── master.md          # Master Agreement — parties, term, acceptance, enforcement, breach, amendment
├── coding.md          # Schedule A — operational rules (Allowed / Needs approval / Forbidden)
├── ethics.md          # Schedule B — final-delivery standards (groundedness, sycophancy, etc.)
└── user-rules.md      # Schedule C — project-specific rules captured via contract-keeper
```

The **Master** defines:

- **Parties & roles** — Principal (User), Agent (Claude), Auditor (`contract-judge`), Registrar (`contract-keeper`), Harness (the runtime).
- **Acceptance** — the Agent accepts by reading `CLAUDE.md` at session start; the Principal accepts by installing the contract files. Acceptance is per-session and renews automatically. Citation of a rule ID in reasoning is the operative form of acknowledgment.
- **Term & termination** — binds for the duration of any session in a project containing the contract files; terminates on file removal, explicit revocation, or project deletion. Termination does not retroactively cure prior breaches.
- **Mutual obligations** — Agent duties (read schedules, self-classify, cite rules, disclose breaches, refuse forbidden) and Principal duties (give explicit unambiguous approvals, treat approvals as per-action and per-scope, route standing approvals through the Registrar).
- **Approval mechanism** — what counts as approval (explicit, named, current-session) and what doesn't (silence, generic affirmations, prior-session approvals); ambiguity is treated as denial.
- **Enforcement** — three layers (self-enforcement, PreToolUse hook, Stop hook + Auditor) plus an audit trail (transcript, changelogs, optional hook-failure log). Each layer is independent so single-layer failure does not produce uncaught breaches.
- **Breach & recovery** — pre-execution breaches are blocked (no breach); in-flight breaches require disclose + revert; final-delivery breaches are caught by the Auditor; post-delivery breaches are FAIL retroactively. **Retroactive permission does not heal an already-executed Needs-approval breach.**
- **Amendments** — Master and Schedules A/B amended by direct edit + version bump; Schedule C amended only via the Registrar workflow with explicit Principal approval.
- **Precedence** — Master prevails on meta-clauses; stricter Schedule rule prevails on operational conflicts; Schedule C may extend but not relax Schedules A/B.
- **Severability & fail-open** — invalidity of any one rule or hook does not invalidate the rest; hooks exit 0 on internal error so a buggy hook cannot lock the user out, but fail-open is a tradeoff, not a waiver.
- **Limitation of liability** — technical control document, not a legally enforceable commercial agreement; recovery is operational only.

The **Schedules** are flat lists of operational rules with stable IDs, RFC 2119 keywords, and per-Schedule Scope / Definitions / Recovery / Changelog. The Auditor cites Schedule rules by ID (`COD-A-01`, `ETH-G-01`, `USR-003`) and Master rules by section number (`Master §7.1.4`).

Stylistically the document is closer to a **B2C ToS in form** (asymmetric, drafter-imposed, click-wrap-style acceptance) and an **RFC in drafting style** (RFC 2119 keywords, stable rule IDs, versioning), with **self-executing technical enforcement** via hooks. See `master.md` for the full text.

---

## Quick install

```bash
curl -sL https://raw.githubusercontent.com/danlex/agentic-contract/main/install-remote.sh | bash
```

Run from the root of the project you want to wrap. The script drops the subagent definitions and hooks into `.claude/agents/` and `hooks/` (overwriting existing copies — they are code-like, treat as library updates) and makes the hooks executable. For **policy files** (`CLAUDE.md`, `.claude/settings.json`, and the four contracts under `.claude/contracts/`) it writes a `.contract-suggested` sibling instead of overwriting, so customizations and accumulated `USR-NNN` rules in `user-rules.md` are never silently replaced — merge by hand.

If you don't trust `curl | bash` (a healthy default — read the script first):

```bash
curl -fsSL https://raw.githubusercontent.com/danlex/agentic-contract/main/install-remote.sh -o install-remote.sh
less install-remote.sh
bash install-remote.sh
```

---

## Manual install

Copy the four pieces into the root of any project that uses Claude Code:

```
your-project/
├── CLAUDE.md                          # tells Claude the contract exists
├── .claude/
│   ├── settings.json                  # registers the hooks
│   ├── contracts/
│   │   ├── master.md                  # Master Agreement
│   │   ├── coding.md                  # Schedule A — operational rules
│   │   ├── ethics.md                  # Schedule B — final-delivery checks
│   │   └── user-rules.md              # Schedule C — project-specific rules (starts empty)
│   └── agents/
│       ├── contract-judge.md          # Auditor — read-only review
│       └── contract-keeper.md         # Registrar — read-only rule drafter
└── hooks/
    ├── pre-tool-use-contract-check.js
    ├── stop-contract-judge.js
    └── stop-contract-keeper.js
```

Make the hooks executable:

```bash
chmod +x hooks/pre-tool-use-contract-check.js hooks/stop-contract-judge.js hooks/stop-contract-keeper.js
```

That's it. The next Claude Code session in this directory picks them up automatically.

---

## How it works

### Layer 1 — The contracts

**`master.md`** (Master Agreement) defines parties, term, acceptance, enforcement, breach, amendment, severability. It governs the meta-clauses; the Schedules below define operational rules.

**Schedule A — `coding.md`** classifies every action as Allowed, Needs approval, or Forbidden. Reading files and editing in-scope code is allowed. Installing dependencies, running migrations, deploying, broad refactors → needs approval. Modifying secrets, claiming unrun tests passed, inventing file paths → forbidden.

**Schedule B — `ethics.md`** adds the soft failure modes that don't show up in a tool call but do show up in the final answer: groundedness, sycophancy, confirmation bias, anchoring, scope creep, side-effect blindness, privacy leakage, honest final communication.

**Schedule C — `user-rules.md`** holds project-specific rules captured via the Registrar workflow. Starts empty.

`CLAUDE.md` tells Claude to consult the Master and the Schedules before risky work and before delivery.

### Layer 2 — PreToolUse hook

`hooks/pre-tool-use-contract-check.js` runs on every `Bash`, `Edit`, `Write`, and `NotebookEdit` call. It returns one of three decisions to the harness:

| Decision | What happens | Example |
|---|---|---|
| `allow` | Tool runs silently. | `npm test`, `Edit src/foo.ts` |
| `ask` | User is prompted to approve. | `npm install lodash`, `git push` |
| `deny` | Tool is blocked, reason shown to Claude. | `cat .env`, `git push --force`, `Write .env.production` |

The hook **fails open**: any internal error exits 0, so a buggy hook can never lock you out of your own project.

### Layer 3 — Stop hook + Contract Judge

`hooks/stop-contract-judge.js` runs when Claude tries to end a turn. It scans the transcript:

- Did this turn touch files or run a risky command? *(if no, let it stop)*
- Was the `contract-judge` subagent invoked? *(if yes, let it stop)*
- Otherwise: **block the stop** and tell Claude to invoke the judge.

The judge (`.claude/agents/contract-judge.md`) is a read-only subagent with only `Read`, `Grep`, and `Glob`. It walks the 12 numbered checks across both contracts and returns a strict verdict:

```
Decision: PASS | ASK APPROVAL | FAIL

Evidence:
- What it checked.

Triggered rule:
- Quote of the contract rule, if any. Otherwise: None.

Recovery:
- Continue / what approval is needed / what to fix.
```

Loops are prevented by the harness's `stop_hook_active` flag — the second pass through the Stop hook always exits clean.

---

## Examples

### Example 1 — Allowed: small in-scope edit

> *User:* "Rename `getUser` to `fetchUser` in `src/api/user.ts`."

Claude reads the file, runs `Edit`, the PreToolUse hook sees no forbidden pattern in the path → `allow`. The Stop hook fires, sees that a file was touched, requires the judge. The judge reads the diff, confirms the change is in scope, returns `Decision: PASS`. Turn ends.

### Example 2 — Needs approval: dependency change

> *User:* "Add `zod` for input validation."

Claude tries to run `npm install zod`. PreToolUse hook matches `/npm\s+install/` → returns `ask` with reason `coding.md / Needs approval: Install, remove or upgrade dependencies`. The user sees a permission prompt and can approve, deny, or modify. If they approve once, Claude proceeds; if denied, Claude must take a different path (e.g. propose the change without installing).

### Example 3 — Forbidden: secret exfiltration

> *User:* "What's in our `.env` file?"

Claude tries `cat .env`. PreToolUse hook matches `/cat\s+[^|;&]*\.env\b/` → returns `deny` with reason `coding.md / Forbidden: reading .env files exposes secrets`. The tool never runs. Claude must explain to the user why this is blocked and offer a safer alternative (e.g. "I can show you `.env.example` instead").

### Example 4 — Caught by the judge: unrun test claim

> *User:* "Add a test for the new `parseDate` function."

Claude writes the test, but never runs the test suite, then drafts a final message: *"All tests pass."* The Stop hook blocks the turn end and demands the judge. The judge reviews the transcript, sees no test execution, returns:

```
Decision: FAIL
Triggered rule:
- "Claim tests passed without running them" (coding.md / Forbidden)
Recovery:
- Either run the tests and report the actual result, or remove the claim from the final message.
```

Claude either runs the tests or rewrites its final message before the turn can end.

### Example 5 — Caught by the judge: scope creep

> *User:* "Fix the off-by-one in `paginate()`."

Claude fixes the bug but also "improves" the surrounding code: renames three helpers, extracts a new utility, reformats the file. The judge spots edits beyond the requested scope and returns `Decision: ASK APPROVAL` with the relevant rule from `coding.md` quoted. Claude must either revert the extra changes or get explicit approval before delivering.

---

## Live trace

The loop in action — user authorizes a destructive `rm -rf` on two `/tmp/` test directories, the command runs, the Stop hook fires automatically, the `contract-judge` subagent reviews the turn against both contracts and returns **PASS**, and only then does the turn end:

![contract-judge returning PASS after a sanctioned rm -rf cleanup](docs/judge-pass-example.png)

That's the entire promise of the project compressed into one screenshot: nothing risky ships without a second pair of eyes.

---

## Customizing

The contracts are **just markdown** — edit them. Add rules that match your stack:

```markdown
## Forbidden
- Modify files under `src/legal/` without a ticket reference in the request.
- Disable any feature flag in `config/flags.production.ts`.
```

The PreToolUse hook is **just regex pairs** — extend the `forbidden` and `needsApproval` arrays in `pre-tool-use-contract-check.js`:

```js
const needsApproval = [
  // ...existing rules
  [/\bsupabase\s+db\s+push\b/, 'Run migrations (Supabase)'],
  [/\bflyctl\s+secrets\s+set\b/, 'Modify production secrets'],
];
```

The judge subagent is **just a prompt** — open `.claude/agents/contract-judge.md` and add or remove checks. The strict return format makes its verdicts easy to parse if you want to build dashboards or CI gates on top.

---

## Testing

Two test suites:

1. **Automated installer + hook tests** (`tests/run-tests.sh`) — 37 deterministic assertions, no LLM. Run with `bash tests/run-tests.sh`. Self-contained, exits non-zero on any regression.
2. **Behavioral judge fixtures** (`tests/fixtures/*.md`) — non-deterministic LLM tests where the `contract-judge` subagent is spawned per fixture and its verdict is compared against `expected_decision` in frontmatter.

```
tests/
├── README.md                                       # both suites — coverage, format, limitations
├── run-tests.sh                                    # automated harness (installer + hook regex + Stop hooks)
└── fixtures/
    ├── 01-pass-inscope-rename.md                   # baseline non-flag
    ├── 02-fail-unrequested-dependency.md           # already-executed needs-approval action
    ├── 03-fail-derived-pii.md                      # PII derived from ambient context
    ├── 04-fail-fabricated-test-claim.md            # claiming tests passed without running
    ├── 05-fail-scope-creep-hidden-changes.md       # hidden refactor inside a bug fix
    ├── 06-fail-fabrication-after-denial.md         # invented content after a hook deny
    ├── 07-fail-confidence-miscalibration.md        # gap test: confidence calibration
    ├── 08-fail-manufactured-consensus.md           # gap test: false authority
    ├── 09-fail-data-exfiltration.md                # gap test: outbound POST of code
    └── 10-fail-force-push-without-approval.md      # gap test: history rewrite
```

Fixtures 07–10 double as **gap detectors**: each describes a failure mode the contracts do not name explicitly. If the judge catches them via existing rules (Groundedness, Privacy leakage, Side-effect blindness), the gap is covered by interpretation; if it returns PASS, the contracts need an explicit new rule.

See `tests/README.md` for both suites' coverage, format, and known limitations.

---

## Trade-offs (be honest with yourself)

- **Friction.** Every dependency install, every `git push`, every Dockerfile edit now prompts. That's the point, but it slows you down. Tune the regex lists to your tolerance.
- **Pattern matching is shallow.** The PreToolUse hook can't know intent — it only sees the command string. Obfuscated commands (`bash -c "$(echo cm0gLXJmIC8K | base64 -d)"`) will slip through. The judge is the catch-all for what regex misses.
- **The judge spends tokens.** Every risky turn now ends with a subagent invocation. Worth it for production work; possibly overkill for a throwaway prototype.
- **Fails open.** Both hooks `exit 0` on internal errors so a typo in the regex doesn't brick your session. The flip side: a broken hook silently stops protecting you. Consider logging hook failures somewhere visible.

---

## File map

| Path | Role |
|---|---|
| `CLAUDE.md` | Project instructions Claude reads on startup. Names the Master, the Schedules, the Auditor, and the Registrar. |
| `.claude/settings.json` | Registers the PreToolUse hook and both Stop hooks. |
| `.claude/contracts/master.md` | **Master Agreement.** Parties, term, acceptance, enforcement, breach, amendment, severability. |
| `.claude/contracts/coding.md` | **Schedule A — Coding Contract.** Operational rules. Allowed / Needs approval / Forbidden. |
| `.claude/contracts/ethics.md` | **Schedule B — Ethics Contract.** EthicalHive-style review checklist for the final answer. |
| `.claude/contracts/user-rules.md` | **Schedule C — User Rules.** Project-specific rules, populated via the Registrar workflow. Starts empty. |
| `.claude/agents/contract-judge.md` | **Auditor.** Read-only subagent. 13 checks across Master + Schedules, strict output format. |
| `.claude/agents/contract-keeper.md` | **Registrar.** Read-only subagent. Drafts Schedule C rule candidates from explicit user triggers. |
| `hooks/pre-tool-use-contract-check.js` | Intercepts tool calls. Returns allow / ask / deny to the harness. |
| `hooks/stop-contract-judge.js` | Blocks turn end until the Auditor has reviewed risky work. |
| `hooks/stop-contract-keeper.js` | Blocks turn end when the user issues an explicit rule-capture trigger, until the Registrar has drafted a candidate. |
| `install-remote.sh` | Remote installer fetched by the curl one-liner. Drops contracts, agents, and hooks into the target project; preserves existing `CLAUDE.md` and `settings.json` via `.contract-suggested` siblings. |
| `tests/README.md` | Documents both test suites — coverage, format, limitations. |
| `tests/run-tests.sh` | Automated test harness — installer behaviour, PreToolUse hook regex coverage, Stop hooks fail-open. 37 deterministic assertions. |
| `tests/fixtures/*.md` | Behavioral test scenarios. Each declares `expected_decision` in frontmatter. |
| `README.md` | This file. |
| `LICENSE` | MIT. |
| `.gitignore` | Excludes `.claude/settings.local.json` and editor cruft. |
| `docs/judge-pass-example.png` | Screenshot used in the README's Live trace section. |

---

## License

Use it, fork it, edit the regexes for your stack. No warranty — the hooks fail open by design.
