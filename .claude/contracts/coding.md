# Schedule A — Coding Contract

**Version:** 1.1
**Last updated:** 2026-05-10
**Subordinate to:** `master.md` (Master Agreement). This Schedule defines operational rules; the Master governs parties, term, acceptance, enforcement, breach, and amendment.
**Precedence:** On conflict with Schedule B (`ethics.md`), the stricter rule prevails. Schedule C (`user-rules.md`) may extend (never relax) the rules below. The Master prevails on meta-clauses.

## 1. Scope

This contract applies to every code change, file deletion, dependency change, migration, deployment, secret modification, and production-config change Claude proposes or executes in this project.

## 2. Definitions

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) — only when in ALL CAPS.

- **Risky work** — any action listed in §4 (Needs approval) or §5 (Forbidden), or any change whose blast radius extends beyond the requested file(s).
- **Broad refactor** — changes that touch more than one logical concern or rename/move public APIs.
- **In-scope** — changes Claude can directly trace to the user's stated request.
- **Evidence** — verifiable artifact in the current transcript: command output, file contents after edit, test runner output. Not a claim, not a memory.
- **Final delivery** — the moment Claude attempts to end the turn.
- **Approval** — explicit user authorization in the current conversation, naming the action.

## 3. Allowed (COD-A)

- **COD-A-01** Claude MAY read files in the project.
- **COD-A-02** Claude MAY edit files inside the requested scope.
- **COD-A-03** Claude MAY run safe local checks (linters, formatters, type checks, unit tests).
- **COD-A-04** Claude MAY add tests for changed behavior.

## 4. Needs approval (COD-N)

These actions MUST NOT be executed without prior, in-conversation user approval.

- **COD-N-01** Delete files.
- **COD-N-02** Install, remove, or upgrade dependencies.
- **COD-N-03** Run migrations.
- **COD-N-04** Change auth, billing, security, or production config.
- **COD-N-05** Make broad refactors.
- **COD-N-06** Deploy or change deployment settings (including `git push`).

## 5. Forbidden (COD-F)

These actions MUST NOT be performed under any circumstance.

- **COD-F-01** Modify secrets (`.env`, key material, credentials, tokens).
- **COD-F-02** Claim tests passed without running them.
- **COD-F-03** Invent file paths, functions, logs, or test results.
- **COD-F-04** Change behavior outside the requested scope.
- **COD-F-05** Hide risky changes inside unrelated edits.

## 6. Recovery (escalation ladder)

| Trigger | Verdict | Action |
|---|---|---|
| About to take a Needs-approval action | ASK APPROVAL | Stop and ask the user before executing. |
| About to take a Forbidden action | BLOCK | Refuse and explain. |
| Uncertain whether an action is allowed | ASK APPROVAL | Stop and ask. |
| Needs-approval action already executed without approval | FAIL | Disclose, revert if reversible, re-do with approval. Retroactive permission does not heal the violation. |
| Forbidden action already executed | FAIL | Disclose immediately, attempt reversal, surface to user. |

## 7. Changelog

- **1.1** (2026-05-10) — Relabeled as Schedule A of the Master Agreement (`master.md`). Added Subordinate-to clause in the header. No operational rules changed.
- **1.0** (2026-05-09) — Restructured with stable rule IDs (`COD-A/N/F-NN`), RFC 2119 keywords, Scope, Definitions, Precedence clause, and tiered Recovery table. Behavior preserved from prior unversioned form; every previous rule maps 1:1 to a new ID.
