# Phase 6 — Asset Iteration Review & Assignments

Two rounds of FLUX 2 Max runs. Tier 1 + Tier 2 sets locked. Below is the rubric, per-round review, and the section-by-section assignment table feeding Phase 7.

## Rubric (used to score each render 1–10)

| Axis | Weight | Notes |
|---|---|---|
| Photographic realism | 30% | No "AI sheen." Proper optics (DOF, chromatic behavior), plausible light. |
| Proportions / spatial plausibility | 20% | Transformers with right bushing count; containers right-proportioned; etc. |
| Brand fit (enterprise-infrastructure calm) | 25% | No tactical pastiche; no AI-slop glow; no SaaS-illustration register. |
| Hero-usability (composition, crop-flexibility) | 15% | Vanishing-point or strong subject line; room for text overlay or negative space. |
| Absence of failure modes | 10% | No hallucinated text, no wrong-side wheels, no impossible geometry. |

---

## Round 1 (8 renders, $0.80)

| File | Concept | Score | Verdict |
|---|---|---|---|
| `hero/R1-1-substation-dusk.jpg` | 138 kV substation, blue hour, fog | **8.5** | Strong. Moody. Real transformers. Could be too dark for hero-pairing with dark text. **Promoted to Tier 2 (scenario card).** |
| `hero/R1-2-data-center-aisle.jpg` | Server aisle, 4000 K daylight, cable color | **8** | Good. Slight blowout at end; distracting for hero. **Promoted to Tier 2.** |
| `hero/R1-3-logistics-yard-dawn.jpg` | Container stacks, fog, crane | **9** | Excellent mood. Seeded the hero direction — refined in R2. **Promoted to Tier 2 (scenario card).** |
| `hero/R1-4-pipeline-rowland.jpg` | Gas ground station, fog, marker post | **7.5** | Nice but less commanding. **Promoted to Tier 2.** |
| `fusion-node/R1-1-3q-front.jpg` | Workbench 3q product shot | **8** | Matte, realistic. Superseded by R2 studio shot. Archive. |
| `fusion-node/R1-2-side-profile.jpg` | Side profile studio | **7.5** | Reads as "rackmount" not "edge appliance." Archive. |
| `fusion-node/R1-3-installed.jpg` | Inside substation cabinet | **8.5** | Prompt drifted to light-grey not dark-grey. Archive as "context shot"; superseded by R2-2. |
| `fusion-node/R1-4-io-detail.jpg` | Macro IO panel | **8** | Clean detail. Keep as Tier 3 for docs/spec pages. |

## Round 2 (7 renders, $0.70)

| File | Concept | Score | Verdict |
|---|---|---|---|
| `hero/R2-1-yard-cinematic.jpg` | Vanishing corridor between containers, fog, crane | **9.5** | **HERO. Locked.** Stripe-level editorial; dark panel + single distant headlight + wet reflections; plenty of sky for hero text overlay if needed. |
| `hero/R2-2-yard-firstlight.jpg` | Wider yard with forklift | **8** | Forklift competes with subject. Backup; promote to Tier 2. |
| `fusion-node/R2-1-studio-3q.jpg` | Dark anthracite appliance on grey studio | **9** | **PRODUCT SHOT. Locked.** Matte finish, proper heatsink fins, mounting flange, blue status LED, single front RJ45. Clean. |
| `fusion-node/R2-2-substation-install.jpg` | Dark appliance pole-mounted at substation, rain | **9** | **INSTALLED-STORY SHOT. Locked.** Excellent "in the field" documentary. |
| `editorial/marina-dusk.jpg` | Motor yachts at slips, blue hour | **8.5** | Scenario card for Resort & Marina. |
| `editorial/private-estate-night.jpg` | Residence with discreet perimeter, night | **8.5** | Scenario card for Private Estate. |
| `editorial/event-venue-evening.jpg` | Empty venue with stage lighting towers | **8** | Scenario card for Event Overlay. |

No Round 3 or Round 4 needed — Tier 1 hit 9+/10 on first or second attempt. Most playbook-run FLUX iterations hover 30–50% reject rate; this run landed closer to 10%, partly because (a) the subject class (infrastructure photography) has strong training-set representation, (b) the prompt cheat-sheet in `docs/TOOLING.md` was tuned against Wayhaven's lessons, and (c) Tessure's brand target (calm enterprise-infrastructure) is visually well-served by overcast/fog/blue-hour prompts that FLUX does extremely well.

---

## Final Tier 1 set (locked)

Three load-bearing assets.

| Role | File | Notes |
|---|---|---|
| **Hero** | `renders/hero/R2-1-yard-cinematic.jpg` | Replaces the v1 gradient placeholder panel in `site/app/page.tsx` Hero section. |
| **Product primary** | `renders/fusion-node/R2-1-studio-3q.jpg` | Secondary hero visual — place as the pair/offset image in the hero or opening slot of `PlatformModules`. |
| **Product installed** | `renders/fusion-node/R2-2-substation-install.jpg` | Use in the full-bleed infrastructure panel (`InfrastructurePanel` section) as a visual grounding for the "civilian-enterprise, not defense-tech" statement. |

## Final Tier 2 set (locked, 6 editorial)

Six scenario/editorial images — one per demo archetype — feed the `ScenariosTeaser` card grid.

| Scenario | File |
|---|---|
| Critical infrastructure | `renders/hero/R1-1-substation-dusk.jpg` |
| Data center | `renders/hero/R1-2-data-center-aisle.jpg` |
| Logistics yard | `renders/hero/R1-3-logistics-yard-dawn.jpg` (R2-2 firstlight is backup) |
| Private estate | `renders/editorial/private-estate-night.jpg` |
| Resort & marina | `renders/editorial/marina-dusk.jpg` |
| Event overlay | `renders/editorial/event-venue-evening.jpg` |

Bonus: `renders/hero/R1-4-pipeline-rowland.jpg` (Tier 3) available if a pipeline-specific use-case page is ever produced.

---

## Hand-built signature assets (Phase 7 inline work)

| Asset | Status | Notes |
|---|---|---|
| **Evidence-pipeline diagram** | To build inline in `site/app/page.tsx` | 5 stages (Event → Fuse → Verify → Sign → Deliver). Trust Blue (`#1E40AF`) on Frost (`#F8FAFC`). Inter for labels, IBM Plex Mono for technical annotations. Thin geometric arcs between stages. Phase 7 component rewrite lands this. |
| **Platform-module icons** | Already in v1 via lucide-react | Keep (Cpu, LayoutDashboard, FileCheck, Workflow, Cloud). 2 px stroke matches brand doc. |
| **Cert badges** | Deferred to Phase 9 launch | SOC 2 / ISO / UL / FCC / CE official marks only once certs are actually held or formally ordered. Phase 7 keeps the text chip placeholder. |
| **OG image** | Phase 7/9 | Composite: Tessure wordmark + tagline "Trusted Autonomous Security" on a darkened crop of the hero yard image at 1200 × 630. |

---

## Budget reconciliation (Phase 6)

| Line | Spent |
|---|---|
| Round 1 (8 renders × 10 credits) | $0.80 |
| Round 2 (7 renders × 10 credits) | $0.70 |
| **Phase 6 total (image gen)** | **$1.50** |
| Initial estimate (TOOLING.md) | $2.00 |
| **Under budget** | **-25%** |

Phase 6–8 combined remaining: $6.40 (Phase 8 motion, optional) + ~$1.50 (Phase 7 Claude copy polish). Running session total still projected ~$18 / $25 cap.

---

## Kill-switch check (Phase 6)

- **80% of asset budget spent with no Tier 1 asset?** No — Tier 1 locked at $1.50/$2.00 budget (75%, with asset in hand). Not fired.
- **Same failure mode 3 rounds in a row?** No repeated failures. Color drift on Fusion Node R1 corrected by explicit "anthracite grey" anchor in R2 prompts. Not fired.

Phase 6 exits. Proceed to Phase 7 rebuild.
