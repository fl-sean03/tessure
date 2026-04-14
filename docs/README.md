# docs/ — Strategic Data Room

Phase 1 output from the idea-to-site playbook run. Each doc answers one strategic question; `README.md` is the index.

**Status:** Pass 2 revision complete. Pass 1 thesis drafted opinionated; Pass 2 research (competitor validation + market/regulatory validation + design research) forced revisions on TAM math, competitor landscape (Deep Sentinel active, Verkada $5.8B, Ambient $146M, Anduril active-commercial not speculative, +Flock Safety), and positioning (explicit rejection of "baby Anduril" framing in favor of civilian-enterprise posture). Pass 3 stability check pending.

## Order to read for first-time review

1. **[STARTUP_BRIEF.md](STARTUP_BRIEF.md)** — problem, insight, wedge, why now. The thesis in ~1500 words.
2. **[CUSTOMER_SEGMENTS.md](CUSTOMER_SEGMENTS.md)** — five buyer profiles with triggers and language.
3. **[COMPETITIVE_LANDSCAPE.md](COMPETITIVE_LANDSCAPE.md)** — incumbents, AI-video pure-plays, sensor specialists, defense-tech adjacencies. White-space thesis.
4. **[BUSINESS_MODEL.md](BUSINESS_MODEL.md)** — pricing tiers, unit economics, expansion.
5. **[GO_TO_MARKET.md](GO_TO_MARKET.md)** — three channels, sales motion, metrics.
6. **[RISK_ANALYSIS.md](RISK_ANALYSIS.md)** — top 12 risks, scored, with mitigations.
7. **[OPERATIONS_AND_COSTS.md](OPERATIONS_AND_COSTS.md)** — team plan, Year-1 burn, TAM/SAM/SOM.
8. **[BRAND_THESIS.md](BRAND_THESIS.md)** — voice, the category's visual traps, brand voice tests.
9. **[PITCH_DECK_OUTLINE.md](PITCH_DECK_OUTLINE.md)** — 14-slide investor narrative.
10. **[NAMING.md](NAMING.md)** — Phase 2 output: Tessure candidate exercise, domain/handle availability, registration TODOs.
11. **[TOOLING.md](TOOLING.md)** — Phase 4 output: asset inventory, model selection, API health, prompt cheat-sheet, Phase 6–8 budget (~$10 of $25 cap).
12. **[LAUNCH_NARRATIVE.md](LAUNCH_NARRATIVE.md)** — Phase 9 output: one-page reference for how to talk about / link to the (archived) project. 30-sec pitch, 3 talking points, 5-Q FAQ, social copy, UTMs, what Phase 9 explicitly doesn't do and why.

Related:
- `../specs/PRODUCT_ARCHITECTURE.md` — system architecture (hardware, fusion engine, evidence pipeline, integrations).
- `../brand/PublicBrandSystem_v1.1.md` — complete brand system (palette, typography, voice, hardware labeling).
- `../research/` — Phase 2 market validation + Phase 4 design research (in progress).
- `../SESSION_LOG.md` — chronological run log.

## Why this structure

- **Split by question, not by audience.** Each doc answers one question well. An investor reads STARTUP_BRIEF + PITCH_DECK_OUTLINE. A new hire reads STARTUP_BRIEF + CUSTOMER_SEGMENTS + PRODUCT_ARCHITECTURE. A potential partner reads GO_TO_MARKET + COMPETITIVE_LANDSCAPE. The structure serves reading order, not authorship order.

- **Product architecture lives in specs/, not docs/.** `specs/` is for engineering artifacts; `docs/` is for strategic narrative. Different life-cycles.

- **Brand system lives in brand/, brand thesis lives in docs/.** The system is the guardrails; the thesis is why those guardrails exist. Different audiences.

- **No pitch deck itself, just the outline.** Decks are rendered from this content via Gamma or manually in Keynote; the narrative structure is what's version-controlled.

## Gaps / TODOs

- **Phase 2 validation.** Citations and external evidence checks on claims in these docs. Tracked in `../research/`.
- **Customer interview transcripts.** Playbook Appendix B extension; run 5–10 interviews before Phase 8.
- **Technical white paper.** Architecture + evidence + privacy posture, publication-quality. Dependency of GTM channel 3 (insurance).
- **Financial model spreadsheet.** Unit economics + 3-year P&L + scenario sensitivity. Export to investors.
