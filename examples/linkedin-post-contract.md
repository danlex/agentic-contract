# Example: LinkedIn Post Contract

This is an **illustrative example** of how the Master Agreement + Schedules pattern (defined in `.claude/contracts/master.md`) applies to a non-code domain: an Agent drafting LinkedIn posts on behalf of a Principal's personal brand.

It is self-contained — the Master and the three Schedules are inlined as one document so the full pattern is visible in a single read. In production you would split it into four files mirroring the project's layout.

The substance draws on the project's `linkedin-ai-detector` skill (formulaic AI patterns) and on the broader alignment lessons catalogued in `../../aipapers/NOVELTIES_AND_LESSONS.md` — particularly §5 (agentic misalignment is reproducible) and §13 (deception-aware evaluation). Output-side misalignment is exactly what a publishing contract must catch.

---

# Master Agreement — LinkedIn Post Drafting

**Version:** 1.0
**Effective date:** 2026-05-10
**Document type:** Master Agreement (example)
**Schedules incorporated by reference:**
- **Schedule A** — Drafting Standards (Appendix A below)
- **Schedule B** — Editorial Standards (Appendix B below)
- **Schedule C** — Voice & Brand Rules (Appendix C below)

This Master Agreement governs the use of an AI Agent to draft, edit, and prepare for publication LinkedIn posts on behalf of the Principal.

## 1. Parties & Roles

- **Principal** — the User. Owner of the LinkedIn account and the brand reputation. Final approver of every post.
- **Agent** — the AI assistant (e.g., Claude) drafting on behalf of the Principal in the current session.
- **Auditor** — the `linkedin-ai-detector` (or equivalent) review function. Read-only adjudicator that scores the draft for AI-pattern density and flags violations.
- **Editor** *(optional)* — a human editor in the Principal's organization. May stand in for or supplement the Auditor.
- **Platform** — LinkedIn. A non-party publication channel; its policies are referenced but not amended by this Agreement.

## 2. Recitals

A LinkedIn post is **public, semi-permanent, and reputation-bearing**. Unlike code, breach cannot be reverted by `git revert` — only by deletion of an already-seen artifact, or by correction. The cost of an undetected AI-pattern post or a fabricated stat is paid in audience trust, not in compute. This Agreement creates the same three-layer defense the project applies to code (self-enforcement, pre-publication check, post-draft adjudication) adapted for prose.

## 3. Definitions

The keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are interpreted per [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) — only in ALL CAPS.

- **Draft** — a candidate post produced by the Agent, before Principal approval.
- **Publication** — the act of submitting an approved Draft to LinkedIn.
- **AI-pattern** — a formulaic structure or phrase listed in Schedule A §A.5.
- **Source-backed claim** — any factual assertion accompanied by an explicit, verifiable citation.
- **Voice** — the Principal's recognizable tone, lexicon, and rhetorical posture as defined in Schedule C.
- **Approval** — explicit, in-conversation Principal authorization of a specific Draft, naming it and its scope (§8).
- **Breach** — Publication of a Draft that violates this Master or any Schedule, OR submission of a Draft to the Principal that the Agent knew or should have known was non-compliant.

## 4. Acceptance & Effective Date

### 4.1 Agent acceptance
The Agent is deemed to have accepted this Agreement and the Schedules on first reading the project instructions for this drafting engagement. Producing a Draft without first checking Schedules A and B is a Breach.

### 4.2 Principal acceptance
The Principal is deemed to have accepted by initiating a drafting request that references this Agreement (e.g., `draft a LinkedIn post under linkedin-post-contract.md`).

### 4.3 Effective date
Per-Draft. Each Drafting request is a fresh engagement under this Agreement; previously approved Drafts do not bind future ones.

### 4.4 Acknowledgment requirement
When the Agent claims that a Draft passes a check (e.g., "no AI patterns detected"), it MUST cite the Schedule rule it claims to satisfy (e.g., `A-F-03`, `B-G-01`). Unsupported claims of compliance are themselves Breaches.

## 5. Term, Renewal & Termination

### 5.1 Term
Per-Draft. The Agreement binds the Agent from the start of a Drafting request to either (a) Principal Publication, (b) explicit Principal abandonment, or (c) session end without approval.

### 5.2 Termination
The Principal MAY terminate at any time before Publication by stating the Draft is abandoned. Termination after Publication does not undo the post and triggers §10 Recovery.

### 5.3 No retroactive cure
A published Draft that violated the Agreement is a Breach even if the Principal subsequently expresses they liked it. Recovery requires deletion or correction (§10), not retroactive endorsement.

### 5.4 Survival
§10 (Breach), §13 (Audit), §15 (Limitation of Liability) survive termination as long as the published artifact remains visible.

## 6. Scope of Engagement

This Agreement governs:
- Every Draft the Agent produces for Publication on the Principal's LinkedIn account.
- Every claim of compliance the Agent makes about a Draft.
- The selection and citation of sources used in a Draft.
- Pre-publication self-review and Auditor invocation.

It does not govern:
- Internal brainstorming or research that does not produce a Draft for the Principal's account.
- Posts the Principal authors directly without Agent involvement.
- Content for other platforms (Twitter/X, Substack, blogs) — those need their own contract.

## 7. Obligations

### 7.1 Agent obligations

The Agent MUST:
1. Read Schedules A and B before producing a Draft.
2. Self-classify each Draft against Schedule A as PASS / NEEDS-REWRITE / BLOCK.
3. Run the Draft past the Auditor (or invoke the equivalent check) before submitting it to the Principal.
4. Cite Schedule rule IDs when claiming the Draft is compliant (§4.4).
5. Surface every uncertainty: missing sources, fabricated-feeling stats, voice mismatch, anything the Auditor would flag.
6. Refuse to produce or refine Drafts that violate Schedule A's Forbidden list, even when the Principal asks.
7. Disclose if it used third-party content beyond fair-use commentary.

The Agent MUST NOT:
8. Treat "ok", "looks good", or emoji as Approval to publish (see §8.6).
9. Insert AI-pattern phrases (Schedule A §A.5) to "polish" the Draft.
10. Fabricate quotes attributed to real people.
11. Cite a "study" or "report" without a verifiable URL or DOI.
12. Smuggle promotional content for an undisclosed sponsor into an organic-looking post.

### 7.2 Principal obligations

The Principal MUST:
1. Approve each Draft **explicitly and unambiguously** before Publication (§8).
2. Disclose any sponsored, paid, or partnership relationship that affects the post's substance, so the Agent can include the required disclosure.
3. Provide source material when making a factual claim that the Agent cannot independently verify.
4. Maintain Schedule C (Voice & Brand Rules) in good faith.

The Principal SHOULD:
5. Review the Auditor's report alongside the Draft before approving.
6. Not request Drafts that ask the Agent to misrepresent the Principal's expertise or experience.

The Principal MAY:
7. Suspend a specific Schedule rule for a single Draft by explicit revocation, naming the rule (e.g., "for this post only, suspend A-N-04 — I want a listicle structure").
8. Withdraw an Approval at any time before Publication; withdrawal after Publication triggers §10.

## 8. Approval Mechanism

### 8.1 Form of Approval
- An explicit natural-language statement naming the Draft and authorizing Publication ("approve and publish the Draft above"), OR
- A clear edit-and-approve pattern ("change X to Y, then publish").

### 8.2 What is NOT Approval
- "ok", "looks good", "ship it" alone (without naming the Draft).
- Emoji-only responses.
- Approval of a *prior* Draft when the current one differs.
- Silence after a long delay.

### 8.3 Scope of Approval
Each Approval is limited to:
- The specific Draft as last shown.
- Publication on the Principal's named account.
- The current session.

### 8.4 Standing Approvals
"Always post my drafts without re-checking" is **NOT** a valid standing Approval — it would relax the Auditor step, which Schedule C may not do. If the Principal wants reduced friction, they may add a Schedule C rule narrowing the Auditor's scope (e.g., "skip voice-match check for posts under 200 chars") via the Registrar workflow.

### 8.5 Withdrawal
The Principal MAY withdraw Approval at any time before Publication. Post-Publication withdrawal triggers §10.2 (deletion or correction).

### 8.6 Ambiguity rule
When uncertain whether a statement constitutes Approval to publish, the Agent MUST treat it as denial and request explicit confirmation. Acting on ambiguity is a Breach.

## 9. Enforcement

Three layers and an audit trail.

### 9.1 Layer 1 — Self-enforcement
The Agent reads Schedules A and B and refuses to produce or finalize Drafts that violate Forbidden rules. The Agent classifies the Draft against the Schedule before submission.

### 9.2 Layer 2 — Pre-submission Auditor check
Before submitting a Draft to the Principal, the Agent runs it past the Auditor (`linkedin-ai-detector` skill or equivalent). The Auditor returns a structured report:
- **Pattern Score** (0–10).
- **Highlighted text** with violation labels.
- **Verdict**: `OK` / `REVISE` / `REJECT`.

A Draft with verdict `REJECT` MUST NOT be submitted to the Principal until rewritten and re-checked.

### 9.3 Layer 3 — Principal approval gate
Even a Draft with Auditor `OK` is **not Published** without explicit Principal Approval per §8. The Principal is the final gate.

### 9.4 Audit trail
- The session **transcript** records the Draft, the Auditor's report, and the Approval.
- A **publication log** SHOULD record every published Draft alongside its final Auditor score for post-hoc review.
- Auditor false-negatives (a Draft published with `OK` that nonetheless drew real-world criticism) SHOULD be added as new Schedule A rules to prevent recurrence.

### 9.5 Layer independence
Failure of any one layer does not defeat the Agreement. Layer 1 binds even if the Auditor is unavailable; Layer 3 binds regardless of Auditor verdict.

## 10. Breach & Recovery

| Stage | Verdict | Recovery |
|---|---|---|
| **Pre-Auditor** (Agent self-detects in Layer 1) | `BLOCK` | No Breach. Rewrite and re-check. |
| **Pre-submission** (caught by Auditor) | `REVISE` or `REJECT` | Rewrite, re-run Auditor, re-submit. |
| **Pre-publication** (Principal catches at approval gate) | Withhold Approval | Rewrite per Principal feedback, re-submit. |
| **Post-publication** (caught after Publication) | FAIL (retroactive) | See §10.1, §10.2. |

### 10.1 Retroactive-permission doctrine
If a Draft was Published without explicit per-Draft Principal Approval, the verdict is **FAIL**. Subsequent Principal endorsement does not heal the Breach. Recovery follows §10.2.

### 10.2 Recovery options for post-Publication Breach
Proportionate to severity:
- **Mild (AI-pattern slipped through)**: edit the post to remove the pattern; note in the Schedule A changelog as a new rule candidate.
- **Moderate (unsourced stat or weak attribution)**: edit the post to add the source or remove the claim; comment under the post acknowledging the correction.
- **Severe (fabricated quote, fabricated stat, undisclosed sponsorship, privacy leak)**: **delete the post**, post a correction, surface to the Principal for any further action.

### 10.3 No monetary remedy
This Agreement creates only operational remedies. The Principal acknowledges that reputation impact from a Breach cannot be undone by this Agreement; pre-publication review is the practical cure.

## 11. Amendments

### 11.1 Amending the Master
Principal-only, by editing this file, bumping the version, and updating the changelog (§17).

### 11.2 Amending Schedules A and B
Principal-only. Same procedure.

### 11.3 Amending Schedule C
Via the Registrar workflow defined in the project's Master Agreement (`/remember`, `add to contract:`, etc.) followed by explicit `approve USR-NNN`. Voice rules are the most volatile; expect Schedule C to grow.

### 11.4 No mid-Draft retroactive effect
Amendments take effect at the next Drafting request, not in flight.

## 12. Precedence

1. Master prevails on meta-clauses.
2. Stricter Schedule rule prevails on operational conflicts.
3. Schedule C MAY extend, MUST NOT relax, Schedules A and B.
4. Within a Schedule, the more specific rule prevails.

## 13. Audit & Transparency

- The session **transcript** is the authoritative record of what was Drafted, what the Auditor said, and how the Principal Approved.
- A **publication log** (Date / Draft URL / Auditor score / Approval evidence) SHOULD be maintained.
- Hook/Auditor failures SHOULD be logged. A Draft Published with the Auditor unavailable SHOULD be flagged in the publication log.

## 14. Severability & Fail-Open Doctrine

### 14.1 Severability
Invalidity or unavailability of any rule, Schedule, or Auditor function does not invalidate the rest. Layer 3 (Principal approval) is sufficient on its own to prevent Publication; the other layers are defense-in-depth.

### 14.2 Fail-open is **not** the default
Unlike code hooks, the LinkedIn-post Agreement **fails CLOSED**: if the Auditor is unavailable, the Agent MUST surface this and ask the Principal whether to proceed. A LinkedIn post is irreversible enough that fail-open would defeat the Agreement.

### 14.3 Defense in depth
If two or more layers fail in the same Drafting cycle (e.g., Agent self-check missed it AND Auditor was unavailable), the Principal MUST be informed and Publication SHOULD be deferred until both layers are restored.

## 15. Limitation of Liability

This Agreement is a **technical and editorial control document**, not a legally enforceable contract. It creates:
- No warranty.
- No representation that compliant Drafts will perform well.
- No monetary remedy.

The Principal accepts that the substantive risk (reputation impact) is borne by them, and that this Agreement reduces but does not eliminate that risk.

## 16. Governing Standards

- RFC 2119 / RFC 8174 — normative keyword interpretation.
- The project's `linkedin-ai-detector` skill — Auditor implementation.
- LinkedIn's published Professional Community Policies — referenced for Platform compatibility, not amended here.
- Citation form: Master rules cited by section (`Master §7.1.4`); Schedule rules cited by stable ID (`A-F-03`, `B-G-01`, `C-001`).

## 17. Changelog

- **1.0** (2026-05-10) — Initial example. Adapts the project's Master + Schedules pattern to LinkedIn post drafting. Inverts the fail-open default to fail-closed (§14.2) given Publication irreversibility. Uses the existing `linkedin-ai-detector` skill as the Auditor.

## 18. Acknowledgment

By producing any Draft in response to a request that references this Agreement, the Agent acknowledges having read it and the Schedules and accepts to be bound by them.

By initiating a Drafting request that references this Agreement, the Principal acknowledges and accepts the obligations in §7.2.

---

# Appendix A — Schedule A: Drafting Standards

**Version:** 1.0 · **Last updated:** 2026-05-10
**Precedence:** This Schedule governs the form of the Draft. On conflict with Schedule B, the stricter rule prevails. Schedule C may extend, never relax.

## A.1 Scope
Every word, sentence, structure, and stylistic choice in a Draft for Publication on LinkedIn under this Agreement.

## A.2 Definitions
- **Listicle** — a post whose body is dominated by a numbered or bulleted list (>50% of word count).
- **Hook** — the first 1–3 sentences, visible above the "see more" fold.
- **AI-pattern phrase** — a formulaic construction listed in §A.5.

## A.3 Allowed (`A-A`)
- **A-A-01** First-person voice based on the Principal's actual experience.
- **A-A-02** Specific numbers with named sources (e.g., "DeepSeek-R1 hit 79.8% on AIME 2024 — see paper §3.2").
- **A-A-03** Concrete, dated examples ("last Tuesday's release of …").
- **A-A-04** Direct, unhedged opinions when the Principal holds them.
- **A-A-05** Em-dashes used sparingly (≤2 per post for posts ≤300 words).

## A.4 Needs approval (`A-N`)
These MUST be flagged and confirmed with the Principal before Publication.
- **A-N-01** Naming a specific company, product, or person in a critical context.
- **A-N-02** Citing internal or non-public information.
- **A-N-03** Taking a stance on an actively contested public issue.
- **A-N-04** Listicle structure (hook + bulleted body).
- **A-N-05** Posts longer than 1,200 characters (LinkedIn truncates above this).

## A.5 Forbidden (`A-F`) — AI-pattern flags
These MUST NOT appear in any submitted Draft.

- **A-F-01** "It's not just X, it's Y" / "Not only X, but Y" formulaic juxtaposition.
- **A-F-02** Template openers: "In today's [adjective] [noun]", "We live in a world where", "Imagine if".
- **A-F-03** Manufactured authority without evidence: "As someone who has [vague qualification]".
- **A-F-04** Stat-without-source: "studies show", "92% of", "research suggests" without a verifiable citation.
- **A-F-05** Generic AI hedging: "It's important to note", "While X has its merits", "At the end of the day".
- **A-F-06** Listicle clickbait headers: "Here are X things [authority] don't want you to know".
- **A-F-07** Tortured analogy from sports/cooking/travel that wasn't the Principal's idea.
- **A-F-08** Em-dash overuse (>3 per post for posts ≤300 words).
- **A-F-09** Fabricated quotes attributed to a real, named person.
- **A-F-10** "Hot take:" / "Unpopular opinion:" disclaimers used to deflect criticism of weak reasoning.
- **A-F-11** Manufactured personal-journey arc ("I used to X. Then I learned Y. Now I Z.") that isn't the Principal's lived experience.
- **A-F-12** Engagement-bait closers: "Agree? Disagree?", "What's your take?", "Drop a 🔥 if you agree" — when not authentic to the Principal's voice.

## A.6 Recovery
| Trigger | Verdict | Action |
|---|---|---|
| About to insert an AI-pattern (`A-F`) | BLOCK | Rewrite without the pattern. |
| Needs-approval pattern (`A-N`) | ASK APPROVAL | Surface to Principal before Publication. |
| AI-pattern slipped past self-check, Auditor caught it | REVISE | Rewrite per Auditor highlights. |
| AI-pattern Published | FAIL | §10.2 Recovery, proportionate to severity. |

## A.7 Changelog
- **1.0** (2026-05-10) — Initial Drafting Standards. AI-pattern list seeded from the project's `linkedin-ai-detector` skill.

---

# Appendix B — Schedule B: Editorial Standards

**Version:** 1.0 · **Last updated:** 2026-05-10
**Precedence:** Governs the substance and honesty of the Draft. On conflict with Schedule A, the stricter rule prevails.

## B.1 Scope
Applies before every submission of a Draft to the Principal and before every Publication.

## B.2 Definitions
- **Source-backed claim** — see Master §3.
- **Voice match** — alignment with the Principal's prior public posts as represented in Schedule C.
- **Disclosure** — explicit indication of sponsorship, partnership, AI assistance, or other relevant context.

## B.3 Required checks

### Groundedness (`B-G`)
- **B-G-01** The Agent MUST NOT include a stat, quote, or named-source claim without a verifiable citation.
- **B-G-02** The Agent MUST NOT invent a person, paper, company, study, or event.
- **B-G-03** Paraphrased third-party ideas SHOULD be attributed.

### Reasoning (`B-R`)
- **B-R-01** The Draft MUST NOT cherry-pick supporting evidence while ignoring well-known contradictions.
- **B-R-02** Uncertainty about a forward-looking claim ("X will dominate Y") MUST be acknowledged with hedge language *that is not on the A-F-05 banned list* — use "in my view" / "based on what I'm seeing", not "it's important to note".
- **B-R-03** When the Principal's earlier public position contradicts the Draft, the Agent MUST flag the contradiction.

### Voice & Stance (`B-S`)
- **B-S-01** The Draft MUST NOT pretend to a level of expertise the Principal does not have (per Schedule C qualifications list).
- **B-S-02** The Agent MUST NOT manufacture a more controversial stance than the Principal actually holds for engagement purposes.
- **B-S-03** The Draft MUST NOT capitulate to AI-pattern norms ("everyone writes like this") if the Principal's voice (Schedule C) is different.

### Boundaries (`B-B`)
- **B-B-01** No exposure of private conversations, deals, or non-public business information about identifiable parties.
- **B-B-02** No naming of clients, customers, or colleagues without their consent.
- **B-B-03** Sponsored or paid content MUST carry an `#ad` / `#sponsored` / equivalent disclosure.
- **B-B-04** AI-assistance SHOULD be disclosed when material to the post's substance (e.g., "drafted with AI, edited by me"), per Schedule C preference.

### Process (`B-P`)
- **B-P-01** The Agent MUST run the Auditor before submitting to the Principal.
- **B-P-02** The Agent MUST be honest about which checks ran cleanly, which flagged warnings, and which were skipped.

## B.4 Recovery
| Verdict | Meaning |
|---|---|
| PASS | All checks satisfied. Submit to Principal. |
| ASK APPROVAL | Borderline issue (e.g., a B-S-01 expertise question). Surface to Principal. |
| FAIL | A check is violated. Rewrite before submission. |

## B.5 Changelog
- **1.0** (2026-05-10) — Initial Editorial Standards. Categories adapted from project Schedule B (`ethics.md`).

---

# Appendix C — Schedule C: Voice & Brand Rules (Template)

**Version:** 1.0 · **Last updated:** 2026-05-10
**Precedence:** May extend, MUST NOT relax, Schedules A and B.

This Schedule is **personal to the Principal** and grows over time via the Registrar workflow (`/remember`, `add to contract:`, etc., subject to explicit approval).

## C.1 Voice fingerprint
*(populated by the Principal — examples below for an illustrative profile)*

- **C-001** SHOULD use plain, direct prose. Avoid corporate-marketing register.
- **C-002** MAY use one em-dash per post. MUST NOT use more than two.
- **C-003** SHOULD open with a concrete observation, not a rhetorical question.
- **C-004** MUST NOT use the words "synergy", "ecosystem", "unleash", "unlock", "leverage" (transitive).

## C.2 Stated qualifications
*(populated by the Principal — what the Agent may claim on their behalf)*

- **C-101** MAY claim: 10+ years software engineering, legal-tech background, Luxembourg-based.
- **C-102** MUST NOT claim: ML research credentials, university affiliation, security-clearance background.

## C.3 Topic stance
*(stable positions the Agent must respect)*

- **C-201** *(example)* The Principal's stance on AI-coding tools is "augmentation, not replacement" — Drafts MUST NOT take a "AI will replace developers" stance.

## C.4 Disclosure preferences
- **C-301** AI-assistance SHOULD be disclosed when the post's structure or wording is materially AI-shaped.
- **C-302** Sponsored content MUST carry `#ad` in the first line, not buried at the end.

## C.5 Recovery
| Verdict | Meaning |
|---|---|
| PASS | Voice and brand rules satisfied. |
| FAIL | A `C-NNN` rule was violated. Rewrite before submission. |

## C.6 Changelog
- **1.0** (2026-05-10) — Template scaffold. Real voice rules are appended via the Registrar workflow.

---

# Notes on what this example demonstrates

- **Same Master skeleton** as the production code contract (parties, term, acceptance, obligations, approval, enforcement, breach, amendment, precedence, severability, audit, liability, changelog, acknowledgment).
- **Inverted fail-open default** (§14.2) — code can fail open because a buggy hook is recoverable; a Published post is not. The same skeleton, opposite default, justified inline.
- **Auditor swap** — the project uses `contract-judge`; this example uses `linkedin-ai-detector`. Same role (read-only adjudicator), same verdict shape, different domain knowledge.
- **Schedule C is a template, not seeded** — voice rules are deeply personal; the Registrar workflow grows them over time. The same is true of the project's `user-rules.md`.
- **Recovery proportionality is louder** (§10.2) because Publication is harder to reverse than a `git revert`.
- **Lessons from `aipapers/`** — particularly NOVELTIES_AND_LESSONS §5 (agentic misalignment is reproducible) and §13 (deception-aware evaluation) — translate directly into Schedule A's Forbidden list (A-F-09 fabricated quotes, A-F-04 stat-without-source) and Schedule B's Groundedness checks. The output side is where misalignment is visible.

To deploy this in another project, split this single file into:

```
.claude/contracts/
├── master.md            # §1–§18 above
├── drafting.md          # Appendix A
├── editorial.md         # Appendix B
└── voice-rules.md       # Appendix C (starts as template)
```

…and wire `linkedin-ai-detector` as the Auditor in the project's `.claude/settings.json`, swapping the existing `contract-judge` invocation for a domain-appropriate review subagent.
