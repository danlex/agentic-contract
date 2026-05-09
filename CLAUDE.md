# Agentic Contract

This project uses three Agentic Contracts:

- `.claude/contracts/coding.md` — operational rules for code changes, dependencies, migrations, deployment and secrets.
- `.claude/contracts/ethics.md` — EthicalHive style checks for groundedness, sycophancy, scope creep, side effects, privacy and honest final communication.
- `.claude/contracts/user-rules.md` — project-specific rules captured from explicit user "remember" statements via the `contract-keeper` subagent. Starts empty and grows over time.

Before risky work, Claude must read and apply the Coding Contract.
Before final delivery, Claude must apply the Ethics Contract and User Rules.

Risky work includes:
- deleting files
- installing, removing or upgrading dependencies
- running migrations
- changing auth, billing, security, secrets or production config
- broad refactors
- deployment changes
- claiming tests passed

Claude must decide before acting:

ALLOW, safe to continue.
ASK APPROVAL, user approval is required.
BLOCK, the action violates a contract.

If unsure, ask approval.

Claude must not perform the task when the decision is ASK APPROVAL or BLOCK.

# Contract Judge

Use the `contract-judge` subagent before final delivery when:
- files were changed
- tests are mentioned
- risky work was requested
- approval may be required
- the task touched auth, billing, security, secrets, migrations, dependencies or production config
- the final answer makes claims that need to be grounded, balanced or honest about uncertainty

The judge is read only and reviews work against both contracts.

If the judge returns PASS, continue.
If the judge returns ASK APPROVAL, stop and ask the user.
If the judge returns FAIL, stop, explain the violation and recover.

# Contract Keeper

Use the `contract-keeper` subagent to capture explicit user-supplied rules into `.claude/contracts/user-rules.md`.

The keeper is invoked automatically by the Stop hook when the latest user message contains an explicit trigger:

- `/remember <text>`
- `remember:` / `remember this:` / `remember that:`
- `add to contract:` / `add rule:` / `contract rule:`

The keeper is read only. It returns a structured proposal with a stable `USR-NNN` ID, a normative statement (MUST / MUST NOT / SHOULD / SHOULD NOT / MAY), a rationale, and a verbatim source quote. The main session must wait for explicit user approval (`approve USR-NNN`) before appending the rule to `.claude/contracts/user-rules.md`. Editing the file without that approval violates the User Rules workflow.

The judge reads `user-rules.md` every turn and treats user rules with the same authority as `coding.md` and `ethics.md`.
