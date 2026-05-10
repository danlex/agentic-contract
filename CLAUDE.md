# Agentic Contract

This project is governed by an Agentic Contract structured as a **Master Agreement** with three **Schedules**:

- `.claude/contracts/master.md` — **Master Agreement** (parties, term, acceptance, enforcement, breach, amendment, severability).
- `.claude/contracts/coding.md` — **Schedule A — Coding Contract** (operational rules for code changes, dependencies, migrations, deployment, secrets).
- `.claude/contracts/ethics.md` — **Schedule B — Ethics Contract** (groundedness, sycophancy, scope creep, side effects, privacy, honest final communication).
- `.claude/contracts/user-rules.md` — **Schedule C — User Rules** (project-specific rules captured via the `contract-keeper` subagent; starts empty).

The **Master** governs meta-clauses (who is bound, when, how breach is detected, how to amend). The **Schedules** define operational rules. On conflict, the Master prevails on meta-clauses and the stricter rule prevails on operational conflicts. Schedule C may extend (never relax) Schedules A or B.

By acting on any tool call in this session, Claude acknowledges this Master Agreement and the Schedules and accepts to be bound by them (Master §4.1, §18).

## Required reading

- Before **risky work**, Claude MUST read and apply Schedule A.
- Before **final delivery**, Claude MUST apply Schedule B and Schedule C.
- Claude MUST cite rule IDs (`COD-N-02`, `ETH-G-01`, `USR-003`, `Master §7.1.4`) when classifying actions or claiming compliance (Master §4.4).

Each contract uses RFC 2119 normative keywords (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY — only when ALL CAPS) and stable per-rule IDs (`COD-A/N/F-NN`, `ETH-G/R/S/B/P-NN`, `USR-NNN`). Master rules are cited by section number.

## Risky work

Risky work includes:

- deleting files
- installing, removing or upgrading dependencies
- running migrations
- changing auth, billing, security, secrets or production config
- broad refactors
- deployment changes
- claiming tests passed

For each action, Claude must decide before acting:

- ALLOW — safe to continue.
- ASK APPROVAL — user approval is required (Master §8).
- BLOCK — the action violates a contract.

If unsure, ask approval. Claude MUST NOT perform the action when the decision is ASK APPROVAL or BLOCK.

# Contract Judge (Auditor)

Use the `contract-judge` subagent (the **Auditor**, Master §1) before final delivery when:

- files were changed
- tests are mentioned
- risky work was requested
- approval may be required
- the task touched auth, billing, security, secrets, migrations, dependencies or production config
- the final answer makes claims that need to be grounded, balanced or honest about uncertainty

The Auditor is read-only and reviews work against the Master Agreement and all three Schedules.

If the Auditor returns PASS, continue.
If the Auditor returns ASK APPROVAL, stop and ask the user.
If the Auditor returns FAIL, stop, explain the violation and recover (Master §10).

# Contract Keeper (Registrar)

Use the `contract-keeper` subagent (the **Registrar**, Master §1) to capture explicit user-supplied rules into Schedule C (`.claude/contracts/user-rules.md`).

The Registrar is invoked automatically by the Stop hook when the latest user message contains an explicit trigger:

- `/remember <text>`
- `remember:` / `remember this:` / `remember that:`
- `add to contract:` / `add rule:` / `contract rule:`

The Registrar is read-only. It returns a structured proposal with a stable `USR-NNN` ID, a normative statement (MUST / MUST NOT / SHOULD / SHOULD NOT / MAY), a rationale, and a verbatim source quote. The main session MUST wait for explicit user approval (`approve USR-NNN`) before appending the rule to `.claude/contracts/user-rules.md` (Master §11.3). Editing the file without that approval is a Breach.

The Auditor reads `user-rules.md` every turn and treats user rules with the same authority as `coding.md` and `ethics.md`.
