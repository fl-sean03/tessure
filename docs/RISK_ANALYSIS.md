# Risk Analysis

Top 12 risks, each scored on probability (1–5) and impact (1–5). Product is P × I. Mitigations are concrete, not hand-wavy.

---

## R1 — Anduril Lattice in commercial critical infrastructure (P5 × I5 = 25) [PASS 2 UPGRADE]

**What:** Anduril's Lattice OS is the clearest architectural analog to Tessure. Pass 1 treated this as a 2026–2027 risk. **Pass 2 research confirms Anduril is already actively marketing Lattice for oil & gas pipelines, wind farms, and utilities — commercial critical infrastructure is not speculative, it's current.** A $20B Army contract (Mar 2026) and a rumored $4B raise at $60B valuation give them capital, brand, and contract-base leverage no startup can match.

**Probability:** 5. Current, documented, marketed.

**Impact:** 5. Could cap Tessure's enterprise-tier TAM. Forces either rapid lighthouse-account lock-in or down-market / specialized pivot.

**Mitigations:**
- **Speed.** Lock 5–10 lighthouse enterprise logos in 12–18 months with 2–3 year multi-year contracts. Switching costs are Tessure's only structural defense against Anduril's capital.
- **Civilian-first positioning (the explicit brand choice, see `docs/BRAND_THESIS.md` and the "positioning choice" section in `STARTUP_BRIEF.md`).** Anduril's DoD heritage is an asset with defense buyers but a liability with enterprise/commercial/estate buyers who distrust militarized framing for procurement, board review, and PR reasons. Enterprise-infrastructure calm is the one axis Anduril structurally cannot wear without diluting their defense identity.
- **Overlay posture, not platform-war.** If a customer has both Tessure and Lattice deployed, Tessure works as a fusion input into Lattice's workflow. Survive as a component where we must.
- **Acquisition posture.** If the economics get bad, Anduril is a credible acquirer. Tessure shouldn't bet on this but shouldn't preclude it.
- **Reject "baby Anduril" framing.** The original archive copy used "sovereign defense perimeter"; Pass 2 positioning rejects this. Being a smaller Anduril is a losing fight; being the NOT-Anduril for the same buyer is the winning one.

---

## R2 — Ambient.ai wins the category narrative before Tessure scales (P4 × I4 = 16)

**What:** Ambient.ai is 2–3 years ahead on enterprise logos (hyperscale, Fortune 500) and owns the "verified alarm" mindshare. Buyers increasingly default to "call Ambient.ai" when the problem surfaces.

**Probability:** 4. They have momentum and funding.

**Impact:** 4. Doesn't kill Tessure (different architecture) but compresses the window and forces Tessure to compete on product proof rather than category definition.

**Mitigations:**
- **Architectural differentiation is real.** Multi-modal fusion is provably more accurate on outdoor perimeters than camera-only. Buy the CAP-Theorem-style whitepaper and run it at RSAC/GSX.
- **Bucket-2 specific wins.** Target colocation/data-center campuses (Ambient's strongest) with a head-to-head proof at pilots.
- **Overlay posture.** Customers who bought Ambient.ai for interior coverage may adopt Tessure for outdoor perimeter — where Ambient is structurally weaker. Position as complementary first, competitive later.

---

## R3 — Model hallucinations produce a high-profile false escalation (P3 × I5 = 15)

**What:** Tessure dispatches a police response to a false-positive that a human operator would have caught. Media cycle. "AI security sends cops on dog walker" story.

**Probability:** 3. Possible even with fusion.

**Impact:** 5. Category damage + customer churn + insurance blowback.

**Mitigations:**
- **Human-in-the-loop above risk thresholds.** Lethal-response proxies (bollard drops, LE dispatch) require operator approval. Document thresholds publicly.
- **Evidence pipeline with full audit.** When a mistake happens, we can show the sensor evidence and the confidence score. "The system proposed; the operator decided."
- **Confidence calibration.** Fusion produces a confidence score per event. Customers set response thresholds. Low-confidence events get proposed, not auto-dispatched.
- **Incident-response playbook.** If a false escalation happens at a customer site: immediate root-cause, public post-mortem, customer-side audit.
- **Bug bounty + community scrutiny.** Public model cards + edge detection data releases to show we're not hiding failure modes.

---

## R4 — Insurance / liability exposure on missed threat (P3 × I5 = 15)

**What:** Tessure fails to detect a real intrusion and harm occurs (theft, assault, sabotage). Customer sues claiming Tessure's promises misled them.

**Probability:** 3. Physical-security products inherit this risk.

**Impact:** 5. Existential if early; manageable at scale.

**Mitigations:**
- **Explicit SLA language.** "Tessure reduces false positives and accelerates verification; it does not guarantee detection of every threat." Mirrors how every existing physical-security product sells.
- **Mutual-obligation model.** Customer agrees to specific camera/sensor placements, maintenance schedule, and response protocol. SLA voids if they break it.
- **E&O insurance from Year 1.** $5M E&O policy (cost: $15–25k/yr at early scale).
- **Legal review of every enterprise contract.** Standardize; don't re-fight per deal.

---

## R5 — Hardware supply chain disruption (Jetson, radar modules) (P3 × I4 = 12)

**What:** NVIDIA Jetson availability is volatile (2022–2023 taught this). Radar OEMs (Echodyne, TI) have their own constraints.

**Probability:** 3. Has happened, will happen again.

**Impact:** 4. Deployment slips, revenue slips.

**Mitigations:**
- **Dual-sourced compute.** Jetson Orin NX primary, Hailo-8 + standard x86 mini-PC fallback. Abstract the AI runtime so the hardware is swappable.
- **12-month safety stock** for core BOM.
- **Contract manufacturer relationship with buffer capacity** — Foxconn, Celestica, or a Tier-2 Taiwan integrator.
- **Customer waiver for supply constraints** in enterprise contracts.

---

## R6 — Regulatory overreach on private surveillance (P3 × I4 = 12)

**What:** State legislature (CA, IL, NY, MA) enacts stricter regulation on commercial security surveillance (BIPA-style), raising compliance cost or blocking deployment. EU AI Act already complicates European expansion.

**Probability:** 3. Trend is clearly this direction.

**Impact:** 4. Sharply increases compliance burden; some segments (estates) become harder to serve.

**Mitigations:**
- **Privacy-first architecture is already aligned.** On-site processing, identity masking, redaction by default. Most regulations reward this design.
- **Opt-in biometrics.** Facial recognition off by default; customer must affirmatively enable per-site with legal review.
- **Compliance-as-a-feature.** Publish per-state compliance modes (Tessure CA Mode, Tessure IL Mode) that auto-configure for local law.
- **Proactive lobby through SIA** (Security Industry Association) to shape regulation toward outcomes we already deliver (redaction, on-site, audit).

---

## R7 — Recruiting senior physical-security domain talent (P4 × I3 = 12)

**What:** The talent pool for experienced physical-security operators + ML + systems engineers is tiny. Hiring AE with utility-sales background is ~$250k+ OTE. Hard-to-hire + expensive.

**Probability:** 4. Known shortage.

**Impact:** 3. Slows GTM, not fatal.

**Mitigations:**
- **Domain-first, technical-second hires for GTM roles.** Recruit from Johnson Controls, Convergint, Genetec, Genetec-adjacent integrators. Pay above market for early hires.
- **Advisor network in lieu of hires.** Retain 3–5 veteran CSOs as paid advisors ($2–5k/mo) to bridge domain gap until first VP Sales.
- **Remote-first engineering.** Expand candidate pool beyond Bay Area / NYC.
- **Tessure as a PSIRT-adjacent brand.** Attract security-minded ML engineers by publishing on model robustness and adversarial testing.

---

## R8 — Pilot-to-paid conversion slower than modeled (P3 × I3 = 9)

**What:** Pilots drag past 60 days, don't convert, or convert at lower ACV than model assumes.

**Probability:** 3. Normal startup risk.

**Impact:** 3. Cash-runway risk; recoverable if identified early.

**Mitigations:**
- **Pilot success criteria agreed before kick-off.** Written metrics for conversion: FP rate delta, MTTA delta, operator satisfaction score.
- **60-day hard stop.** Pilot ends on day 60 regardless. Customer converts or exits with data packet.
- **Weekly pilot review** in Year 1.
- **Pricing flexibility on conversion** — downgrade Edge Mid → Small if needed; capture the logo, expand later.

---

## R9 — Tessure becomes known as "the guys with the cool demo" and nothing more (P3 × I4 = 12)

**What:** The Three.js marketing site over-indexes on visual wow, not on credibility signals (customer logos, certifications, case studies). Buyers read demo-rich, proof-poor.

**Probability:** 3. The demo exists; the proof doesn't yet.

**Impact:** 4. Deal-cycle fatal. Enterprise security teams discount demo-heavy vendors by default.

**Mitigations:**
- **Phase 8 site de-emphasizes the demo.** Move scenario visualization to a dedicated /demo route, not the hero.
- **Customer-logo / case-study rail on homepage** from Month 6.
- **Certifications visible** — SOC 2 Type 1 by Month 9, Type 2 by Month 18. ISO 27001 Year 2.
- **Trade press placement** — Security Industry Magazine, SSI, IFSEC; not TechCrunch.

---

## R10 — Open-source alternative emerges (P2 × I3 = 6)

**What:** Someone open-sources a sensor-fusion framework that does 60% of Tessure's value at $0. Frigate (already open-source, camera-only) extends.

**Probability:** 2. Fusion + evidence pipeline + edge orchestration is significant integration work; unlikely to be matched by a part-time OSS project.

**Impact:** 3. Compresses the low end of pricing; doesn't hurt mid/enterprise.

**Mitigations:**
- **Publish a limited OSS tier ourselves.** Tessure Community Edition — single-Node, single-site, no support — captures the OSS user mindshare and feeds the funnel.
- **Enterprise moats.** Evidence signing, SOC 2 compliance, SLA, multi-site management — all things OSS cannot easily replicate.

---

## R11 — Key technical dependency breakage (ONVIF, Jetson ecosystem) (P2 × I3 = 6)

**What:** NVIDIA deprecates a Jetson SDK we depend on; or ONVIF revisions break camera compatibility at scale.

**Probability:** 2. Rare but has happened.

**Impact:** 3. Engineering diversion; not business-critical.

**Mitigations:**
- **Abstraction layer for AI runtime.** Compile targets for Jetson + Hailo + x86 CUDA.
- **ONVIF abstraction** with Axis/Hanwha/Dahua-specific shims for common customer cameras.
- **Upstream participation** — contribute to ONVIF working groups; get heads-up on spec changes.

---

## R12a — Verkada lateral expansion to outdoor perimeter (P3 × I4 = 12) [NEW PASS 2]

**What:** Verkada reached $5.8B valuation and >$1B ARR with 17,000 customers by end of 2025. Their current product is cloud-first, camera-first, primarily indoor. Outdoor perimeter + multi-modal is outside their today-scope, but the capital base and customer footprint could fund a lateral expansion into Tessure's wedge.

**Probability:** 3. Verkada's narrative has been indoor-first; pivot cost is nontrivial.

**Impact:** 4. If they reach 1,000 customers deploying outdoor perimeter, they compress Tessure's growth.

**Mitigations:**
- **Architectural specialization.** Verkada's cloud-first architecture is structurally slow on outdoor-perimeter fusion latency; Tessure's edge-first 24h-offline design is a defensible moat.
- **Overlay / integration angle.** Many customers will have Verkada interior + Tessure perimeter; design the Tessure side to coexist cleanly.

---

## R12b — Deep Sentinel's commercial pivot peels low-tier logistics (P3 × I3 = 9) [NEW PASS 2]

**What:** Deep Sentinel raised $15M Series B (June 2025) and launched SentinelNow targeting warehouses, office parks, medical, retail, auto, multi-tenant. Their pitch: "cloud guards" — human-in-loop monitored response at sub-Tessure pricing.

**Probability:** 3. Active commercial launch.

**Impact:** 3. Compresses Tessure's Edge Small tier pricing at the low end of logistics.

**Mitigations:**
- **Don't anchor Year-1 pricing on Deep Sentinel's segment.** Lead with Edge Mid ($40k) targeted at mid-logistics and colo; let Deep Sentinel have sub-$12k tier.
- **Evidence-pipeline moat.** Deep Sentinel's cloud-guard service does not produce the signed, auditable evidence package that insurance and LE downstream require.

---

## R12c — Flock Safety commercial expansion (P2 × I4 = 8) [NEW PASS 2]

**What:** Flock Safety ($7.5B val, $275M Mar 2025, Aerodome acq Oct 2024) is currently LEO/municipal but has capital and aerial-response assets to enter commercial enterprise. If they do, Tessure faces a category-consolidator with platform + drone + LEO-network advantages.

**Probability:** 2. Flock's current strategy focuses on LEO/municipal; commercial expansion is plausible but not announced.

**Impact:** 4. Would materially compress Tessure's enterprise segment if Flock leans in.

**Mitigations:**
- **Civilian-enterprise brand posture** (same mitigation as R1 Anduril). Flock's brand is public-safety-LEO — different register from enterprise buyer.
- **Evidence-grade chain of custody as insurance-driven proof.** Flock's current value-prop is LPR + LEO sharing; Tessure's is multi-modal + evidence-pipeline for commercial compliance. Different wedges.
- **Watch Flock's 2026 strategy.** Re-score risk in 12 months.

---

## R12 — Founder capacity / single point of failure (P3 × I4 = 12)

**What:** Sean is the only one holding product thesis + sales narrative + technical architecture. If Sean is out for 6 weeks (health, travel, bandwidth), company stalls.

**Probability:** 3. Any early-stage company.

**Impact:** 4. Materially slows all threads simultaneously.

**Mitigations:**
- **CEO + CTO split early.** Recruit technical co-founder or first engineering hire to own architecture.
- **VP Sales by Month 9** (Year 1) to own pipeline independent of founder.
- **Documented decision rationale** — this doc set, architecture specs, brand system. Reduces key-person risk.
- **Board / advisor circle** providing continuity if founder is temporarily out.

---

## Kill-switch evaluation (Pass 2)

Playbook Phase 1 Pass 2 kill-switch: "3+ high-prob high-impact risks unmitigated."

- **R1 Anduril (25 — upgraded from 20):** Pass 2 confirms Anduril's commercial presence is active, not speculative. Mitigations (speed, civilian brand, overlay posture) are credible but **require execution discipline on the 12–18 month lighthouse-logo window.** Flagged as the single largest strategic variable. Not unmitigated — the mitigation path is clear; it's a speed test.
- R2 Ambient.ai (16): mitigations architectural. **Mitigated in thesis.**
- R3 Hallucination / false escalation (15): human-in-loop + evidence pipeline. **Mitigated.**
- R4 Insurance liability (15): E&O + SLA language. **Mitigated.**
- R12a Verkada expansion (12): architectural moat + overlay posture. **Mitigated.**

No unmitigated H×H risks. Kill-switch does not fire.

**TAM check (Pass 2):** `OPERATIONS_AND_COSTS.md` revises TAM to **$6B–$9B global** (down from Pass 1's $20B). Still comfortably above $50M bar. SAM ~$1B–$1.5B; SOM Year-3 $12M–$20M ARR.

**External evidence of problem (Pass 2):** confirmed — E-ISAC 3,500+ physical incidents 2024; Verisk CargoNet $725M cargo theft 2025 (+60% YoY); multiple named substation attacks; active NERC CIP-014-4 + TSA SD02F regulatory cycles; *Security Magazine* Annual Guarding Report operator-pressure findings. Not a manufactured problem.

**Phase 1 Pass 2 kill-switch summary: clear to proceed to Phase 2.**
