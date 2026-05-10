# Master Agreement

**Version:** 1.0
**Effective date:** 2026-05-10
**Document type:** Master Agreement
**Schedules incorporated by reference:**
- **Schedule A** — Coding Contract (`.claude/contracts/coding.md`)
- **Schedule B** — Ethics Contract (`.claude/contracts/ethics.md`)
- **Schedule C** — User Rules (`.claude/contracts/user-rules.md`)

This Master Agreement defines the parties, term, acceptance, enforcement, breach, and amendment procedures governing the use of Claude Code in this project. The Schedules define operational rules and are interpreted in light of this Master.

## 1. Parties & Roles

- **Principal** — the User. Holder of authority over scope, approvals, amendments, and the contract files themselves.
- **Agent** — Claude Code, in the session bound to this project. Non-persistent: each session is a fresh instance bound by the same Master Agreement.
- **Auditor** — the `contract-judge` subagent. Read-only adjudicator constrained to `Read`, `Grep`, `Glob`. Returns verdicts at final delivery.
- **Registrar** — the `contract-keeper` subagent. Read-only drafter of Schedule C rule candidates from explicit Principal triggers.
- **Harness** — the Claude Code runtime, including the PreToolUse and Stop hooks. A non-party mechanical enforcer; its bugs neither bind nor release the parties.

The Auditor and Registrar are constrained delegates of the Agent, not separate parties. They exist to provide independent review and structured rule drafting respectively, operating in isolated tool contexts.

## 2. Recitals

The Agent's tool calls have real side effects: file edits, dependency installs, deployments, and final messages that may misrepresent state. Soft "be careful" instructions are insufficient. This Master Agreement creates layered, auditable safety rails by combining:

1. Self-enforcement by the Agent against written rules,
2. Mechanical pre-execution control by the Harness,
3. Post-hoc adjudication by the Auditor before final delivery.

If any one layer fails, the next is intended to catch the breach.

## 3. Definitions

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) — only when in ALL CAPS.

In addition to the operational definitions in each Schedule, the following terms apply project-wide:

- **Session** — a single Claude Code conversation in this project, from session start to session end.
- **Acceptance** — the act by which a party becomes bound to this Master Agreement (§4).
- **Risky work** — any action listed as Needs approval or Forbidden in any Schedule, or any change whose blast radius extends beyond the requested file(s).
- **Breach** — an act or omission contrary to a binding rule in this Master or any Schedule.
- **Recovery** — the corrective procedure following a Breach (§10).
- **Approval** — explicit, in-conversation Principal authorization, naming the action and its scope (§8).
- **Acknowledgment** — citation of the relevant rule ID by the Agent in its reasoning, evidencing it has read and applied the rule.

On conflict between a Master definition and a Schedule definition, the Master prevails for meta-terms (Party, Acceptance, Breach, Amendment) and the Schedule prevails for its own operational terms (In-scope, Evidence, etc.).

## 4. Acceptance & Effective Date

### 4.1 Agent acceptance

The Agent is deemed to have accepted this Master Agreement and the incorporated Schedules upon reading `CLAUDE.md` at session start. Acting on a tool call without first reading the relevant Schedule when `CLAUDE.md` so requires is a Breach (§10).

### 4.2 Principal acceptance

The Principal is deemed to have accepted by:

- Installing the contract files in `.claude/contracts/`, AND
- Registering the hooks in `.claude/settings.json`.

The Principal's acceptance binds the Principal to the obligations in §7.2.

### 4.3 Effective date

This Master Agreement takes effect at session start and is renewed automatically with each new session, until terminated under §5.

### 4.4 Acknowledgment requirement

When the Agent classifies an action under a Schedule rule, claims compliance, or reports evidence, it MUST cite the relevant rule ID (e.g., `COD-N-02`, `ETH-G-01`, `USR-003`, `Master §7.1.4`). Citation is the operative form of acknowledgment and is auditable in the transcript.

## 5. Term, Renewal & Termination

### 5.1 Term

This Master Agreement binds the Agent for the duration of any session opened in a project containing the contract files.

### 5.2 Renewal

Automatic at each new session.

### 5.3 Termination

This Master Agreement terminates upon any of:

- Removal of the contract files from `.claude/contracts/`.
- Explicit Principal revocation in conversation, naming the suspension scope (e.g., "suspend the contract for this turn — proceed without judge"). Revocation is per-turn and per-scope unless otherwise stated.
- Project deletion or migration out of Claude Code.

### 5.4 No retroactive cure

Termination does not retroactively cure prior Breaches. Disclosure and recovery obligations under §10 survive termination for the duration of the transcript's existence.

### 5.5 Survival

§10 (Breach), §13 (Audit), §14 (Severability), and §15 (Limitation of Liability) survive termination.

## 6. Scope of Engagement

This Master Agreement governs:

- All tool calls (`Bash`, `Edit`, `Write`, `NotebookEdit`, `Task`, etc.) made by the Agent in this project.
- The Agent's final delivery message at the end of each turn.
- Claims of evidence, verification, or test execution.
- Proposed actions and self-classifications (ALLOW / ASK APPROVAL / BLOCK).

It does not govern:

- Idle conversation with no tool calls and no claims of fact (though §7.1.5, truthfulness, still applies).
- Actions outside the project's working directory unless explicitly initiated by the Principal.

## 7. Obligations

### 7.1 Agent obligations

The Agent MUST:

1. Read the relevant Schedule before risky work (Schedule A for tool calls, Schedule B for final delivery, Schedule C if non-empty).
2. Self-classify each action as ALLOW, ASK APPROVAL, or BLOCK before executing it.
3. Invoke the Auditor before final delivery whenever `CLAUDE.md` so requires.
4. Cite rule IDs when classifying actions or claiming compliance (§4.4).
5. Be truthful at final delivery about what it did, what it did not do, what it verified, and what remains uncertain.
6. Disclose Breaches immediately upon discovery, without waiting for the Auditor to catch them.
7. Refuse Forbidden requests even when the Principal asks; refusal under a Forbidden rule is not a Breach.

The Agent MUST NOT:

8. Treat ambiguous or implicit Principal statements as Approval (see §8.6).
9. Tamper with the contract files in a way that relaxes obligations without bumping the version.
10. Smuggle rule changes into unrelated edits.

### 7.2 Principal obligations

The Principal MUST:

1. Give Approvals **explicitly and unambiguously**, naming the action and its scope (see §8).
2. Treat each Approval as **per-action and per-scope**; standing approvals MUST be reduced to a Schedule C rule via the Registrar workflow if they are to bind future sessions.
3. Maintain the contract files in good faith; rule additions follow §11 (Amendments).

The Principal SHOULD:

4. Avoid requesting Forbidden actions; the Agent's refusal is not a failure of cooperation.
5. Keep the rule files version-bumped and changelogged on amendment.

The Principal MAY:

6. Suspend any rule for a single turn by explicit revocation per §5.3.
7. Revoke Approvals at any time before execution; post-execution revocation triggers §10 Recovery.

## 8. Approval Mechanism

### 8.1 Form of Approval

Approval requires one of:

- An explicit natural-language assent in the current conversation that names the action (e.g., "yes, install zod"), OR
- A positive return from the Harness's permission-prompt UI in response to an `ask` decision from a hook.

### 8.2 What is NOT Approval

- Silence.
- Generic affirmations ("ok", "go ahead", emoji) that do not name the specific action.
- Approval of a different action ("you said yes to migrating users — that does not extend to deleting them").
- Approval given in a prior session.

### 8.3 Scope of Approval

Each Approval is limited to:

- The specific action named.
- The specific artifact or path named.
- The current session.

### 8.4 Standing Approvals

Approvals intended to bind future sessions MUST be reduced to a Schedule C `USR-NNN` rule via the Registrar workflow (`contract-keeper` subagent + Principal `approve USR-NNN` reply). Until that rule is appended, the Approval expires at session end.

### 8.5 Withdrawal

The Principal MAY withdraw an Approval at any time before execution. Withdrawal after execution does not undo the action and triggers §10 Recovery for any consequences.

### 8.6 Ambiguity rule

When the Agent is uncertain whether a statement constitutes Approval for the action at hand, the Agent MUST treat the statement as denial and ask for explicit confirmation. Acting on ambiguity is a Breach.

## 9. Enforcement

Three layers and an audit trail.

### 9.1 Layer 1 — Self-enforcement

The Agent reads the Schedules, self-classifies each action, and refuses or escalates per the Schedule's Recovery table. This layer is what makes the contract a contract rather than a checklist.

### 9.2 Layer 2 — Pre-execution control

The Harness's PreToolUse hook (`hooks/pre-tool-use-contract-check.js`) intercepts every `Bash`, `Edit`, `Write`, and `NotebookEdit` call and returns:

- `allow` — the call proceeds silently,
- `ask` — the Principal is prompted via the Harness UI,
- `deny` — the call is blocked with a reason citing the Schedule rule.

The hook is shallow (regex-based) and fails open by design (§14.2).

### 9.3 Layer 3 — Adjudication

The Stop hook (`hooks/stop-contract-judge.js`) blocks turn-end if risky work occurred without an Auditor verdict. The Auditor reviews the transcript against the Master and all three Schedules and returns:

- `PASS` — turn ends,
- `ASK APPROVAL` — turn pauses for explicit Principal authorization,
- `FAIL` — turn pauses for Recovery per §10.

The companion Stop hook (`hooks/stop-contract-keeper.js`) invokes the Registrar when the Principal's message contains an explicit rule-capture trigger (`/remember`, `add to contract:`, etc.).

### 9.4 Audit trail

- The session **transcript** is the authoritative record. The Auditor MUST cite transcript evidence, not Agent claims.
- Schedule **changelogs** are append-only and record amendments.
- Hook **failures** SHOULD be logged to a visible location; absent such a log, repeated silent fail-open events SHOULD be surfaced to the Principal at final delivery.

### 9.5 Layer independence

Failure of any one layer does not defeat the contract. Layer 1 binds even when Layers 2 and 3 are unavailable; Layer 3 binds even when Layer 2 has a regex gap.

## 10. Breach & Recovery

| Stage | Verdict | Recovery |
|---|---|---|
| **Pre-execution** (caught by Layer 2) | Blocked or escalated | No Breach. The Agent revises its approach. |
| **In-flight self-detection** (Agent realizes mid-turn) | Disclose | Halt, surface to Principal, revert if reversible, request Approval to redo. |
| **Final-delivery** (caught by Layer 3 / Auditor) | FAIL or ASK APPROVAL | Apply the Auditor's Recovery field before delivering. |
| **Post-delivery** (discovered later) | FAIL (retroactive) | Disclose in the next session; record in the relevant Schedule's changelog; consider proposing a new Schedule C rule to prevent recurrence. |

### 10.1 Retroactive-permission doctrine

If a Needs-approval action has already been executed without prior Approval, the verdict is **FAIL with Recovery**, not ASK APPROVAL. Once a Breach has occurred, the contract has been broken; recovery requires correction (revert, disclose, re-do with Approval), not retroactive permission.

### 10.2 Proportionality

Recovery SHOULD be proportionate to the Breach. A reversible Breach with no downstream side effects requires only disclosure and revert. An irreversible Breach (e.g., a deployment) requires disclosure, surface to Principal, and an explicit Principal decision on next steps.

### 10.3 No monetary remedy

This Master Agreement creates only operational remedies. Breaches do not give rise to damages.

## 11. Amendments

### 11.1 Amending the Master

The Master may be amended only by the Principal. Amendment requires editing this file, bumping the version, and adding an entry to §17 Changelog. Amendments take effect at the next session start.

### 11.2 Amending Schedules A and B

Schedule A (`coding.md`) and Schedule B (`ethics.md`) may be amended only by the Principal, by editing the Schedule, bumping its version, and updating its changelog. Amendments take effect at the next session start.

### 11.3 Amending Schedule C

Schedule C (`user-rules.md`) is amended only via the Registrar workflow:

1. The Principal issues a trigger phrase (`/remember`, `remember:`, `add to contract:`, `add rule:`, `contract rule:`).
2. The Registrar drafts a candidate rule with a stable `USR-NNN` ID.
3. The Principal explicitly approves with `approve USR-NNN`, edits with `edit USR-NNN: <new text>`, or rejects with `reject USR-NNN`.
4. Only after explicit approval does the main session append the rule to `user-rules.md`.

The Agent MUST NOT write to `user-rules.md` without Principal approval. Doing so is a Breach.

### 11.4 No mid-session retroactive effect

Amendments do not retroactively bind earlier turn actions in the session in which they are made. They take effect at the next session start.

## 12. Precedence

On conflict between documents:

1. **The Master Agreement** prevails on meta-clauses (parties, term, acceptance, amendment, severability, enforcement).
2. On operational conflicts between Schedules, the **stricter rule** prevails.
3. **Schedule C** (`user-rules.md`) MAY extend, MUST NOT relax, Schedules A and B.
4. Within a Schedule, the more specific rule prevails over the more general.
5. RFC 2119 normative keywords are interpreted only when in ALL CAPS.

## 13. Audit & Transparency

- The session **transcript** is the authoritative record. Auditor verdicts MUST cite transcript evidence, not Agent claims.
- Schedule **changelogs** are append-only.
- Hook failures SHOULD be logged to a visible location; absent such a log, the Principal SHOULD be informed of the gap.
- The Auditor's verdict format is fixed (Decision / Evidence / Triggered rule / Recovery) so verdicts are machine-parseable.

## 14. Severability & Fail-Open Doctrine

### 14.1 Severability

Invalidity, unenforceability, or operational failure of any rule, Schedule, hook, or subagent does not invalidate the rest of this Master Agreement. The remaining controls bind.

### 14.2 Fail-open doctrine

The hooks exit 0 on internal error so a buggy hook cannot lock the Principal out of their project. Fail-open is a deliberate design tradeoff, **not a waiver** of obligations.

When the Agent detects (or has reason to suspect) that a hook has failed silently, the Agent MUST:

1. Note the suspected failure in its reasoning.
2. Escalate to Layer 1 (self-enforcement) and Layer 3 (Auditor) as if the failed layer were absent.
3. Surface the suspected failure to the Principal at final delivery.

### 14.3 Defense in depth

The three layers (§9) are designed so that single-layer failure does not produce uncaught Breaches. Failure of two or more layers in the same turn SHOULD be treated as a serious incident and surfaced to the Principal.

## 15. Limitation of Liability

This Master Agreement is a **technical control document**, not a legally enforceable commercial agreement. It creates:

- No warranty.
- No fitness-for-purpose representation.
- No monetary remedy for Breach.
- No rights enforceable outside the project's session scope.

Recovery under §10 is exclusively operational.

## 16. Governing Standards

- **RFC 2119** / **RFC 8174** — interpretation of normative keywords (only when in ALL CAPS).
- This Master Agreement governs the interpretation of all Schedules in this project.
- Citation form: Master rules are cited by section number (e.g., `Master §7.1.4`); Schedule rules are cited by stable ID (e.g., `COD-A-01`, `ETH-G-01`, `USR-003`).

## 17. Changelog

- **1.0** (2026-05-10) — Initial Master Agreement. Defines parties, term, acceptance, enforcement layers, breach and recovery, amendment procedures, severability, and fail-open doctrine. Promotes the retroactive-permission doctrine from `contract-judge.md` to a binding Master clause. Adds Principal obligations (§7.2) — previously implicit.

## 18. Acknowledgment

By proceeding with any tool call in this session, the Agent acknowledges having read this Master Agreement and the Schedules incorporated by reference, and accepts to be bound by them.

By installing the contract files and registering the hooks, the Principal acknowledges and accepts the obligations in §7.2.
