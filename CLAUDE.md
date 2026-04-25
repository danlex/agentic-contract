# Agentic Contract

This project uses two Agentic Contracts:

- `.claude/contracts/coding.md` — operational rules for code changes, dependencies, migrations, deployment and secrets.
- `.claude/contracts/ethics.md` — EthicalHive style checks for groundedness, sycophancy, scope creep, side effects, privacy and honest final communication.

Before risky work, Claude must read and apply the Coding Contract.
Before final delivery, Claude must apply the Ethics Contract.

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
