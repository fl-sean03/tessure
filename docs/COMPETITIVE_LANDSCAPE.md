# Competitive Landscape

Three buckets + adjacencies. Figures verified against `../research/COMPETITIVE_VALIDATION.md` (Pass 2 research, 2024–2026 sources). Pass 1 draft had stale numbers and missed two players entirely; this revision fixes both.

---

## Bucket 1 — Legacy VMS / PSIM incumbents

The category leaders on the workflow layer. Strong channel, deep customer entrenchment, architectural debt.

| Company | HQ | Est. funding / rev | Wedge vs Tessure |
|---|---|---|---|
| **Genetec** | Montreal | Private, ~$600M rev | Owns VMS layer. Tessure **reads from them**, not against them. Opportunity: Genetec Security Center partner program. |
| **Milestone Systems** | DK / Canon-owned | Subsidiary, ~$290M rev | Same — Tessure overlays. XProtect API is well-documented. |
| **Axis Communications** | Sweden / Canon-owned | ~$2.3B rev | Camera OEM + ACAP analytics. Single-modality; doesn't fuse radar natively. |
| **Avigilon** | Motorola Solutions | Acquired 2018 ($1B) | Cloud-leaning; Motorola's mass-notification angle. Overlaps on "verified alarm" but is camera-centric. |

**Tessure's stance:** partner posture toward VMS. Sell the fusion brain, let the customer keep their VMS. Write adapters, not replacements.

---

## Bucket 2 — AI-video pure-plays (camera-first)

The "ambient/autonomous" wave of 2018–2025. Strong narrative, high burn, camera-modality-limited — but the category has **consolidated upward** since Pass 1 drafted: leaders are now large-enterprise, not SMB.

| Company | Funding | Status 2026 | Wedge vs Tessure |
|---|---|---|---|
| **Ambient.ai** | **$146M total** (incl. $74M Series B, April 2025) | Active, hyperscale + retail wins | Closest conceptual competitor on "verified response." Camera-only; cloud-leaning; does not fuse radar/thermal natively. **Argument: multi-modal fusion is fundamentally more accurate on outdoor perimeters.** |
| **Verkada** | **$5.8B valuation** (Dec 2025, CapitalG round; passed through $4.5B Series E Feb 2025); **>$1B ARR; ~17,000 customers** | Active, **enterprise-scale now, not just SMB** | Cloud-first, camera-first, hostile to on-prem fusion architectures. Larger than Pass 1 assumed; the "SMB-only" framing is wrong. **Tessure's wedge vs. Verkada is architecture (edge+overlay) and modality (multi-sensor), not segment.** |
| **Deep Sentinel** | **$15M Series B June 2025; $50M+ total** | **Active commercial — launched SentinelNow 2025** targeting warehouses, office parks, medical, retail, auto, multi-tenant | Pass 1 had them written off as residential-only. **Wrong.** Deep Sentinel is now a direct competitor at the low end of the logistics/commercial segment. Their wedge: human-in-loop monitored response ("cloud guards"). Different posture — we're edge-fusion brain, they're cloud+human-monitored. |
| **Hakimo** | **Series A Q1 2025**, $15M+ | Active, SMB + mid-market | Alarm-verification SaaS layered on existing cameras. No sensor fusion; no edge; cloud-only. |
| **Turing AI** | $10M+ | Active | Camera-analytics; similar to Verkada for SMB. |
| **Actuate AI** | $10M+ | Active | Weapon-detection-focused. Narrow. |
| **Coram AI** | **Series A Q1 2025**, $20M+ | Growing | Cloud VMS + analytics. Will sharpen over 2026–2027. |

**Tessure's stance:** multi-modal fusion is the defensible moat. Any single-modality system bottoms out at 80–90% accuracy on outdoor perimeter. Fusion hits 98%+ (design target: FP rate <5% after 30-day tune). Also: Tessure is edge-first and overlay; these are cloud-first and often lock-in.

---

## Bucket 3 — Radar / sensor-tier specialists

Strong in their modality, not fusion platforms.

| Company | Funding | Notes |
|---|---|---|
| **Echodyne** | **~$195M total**, last round 2022 | Metamaterial ESA radar. Tier-1 perimeter radar. **Potential OEM partner or acquisition target for Tessure's radar input.** Funding has not freshened recently — watch for distress or strategic M&A. |
| **Fortem Technologies** | $80M+ | Counter-UAS radar + interceptor. Tessure integrates, does not replace. |
| **SpotterRF** | Reportedly acquired by CGSecurity (unconfirmed in public sources) | Compact perimeter radar; common in military. Integration partner. |
| **FLIR / Teledyne** | Public (Teledyne $30B cap) | Thermal OEM leader. Integration partner. |
| **Axis (thermal line)** | see Bucket 1 | Thermal cameras. Integration partner. |
| **Dedrone / Axon** | Acquired by Axon 2024 (**deal value undisclosed by Axon**; some reports cite $600M+ but unverified) | Counter-UAS (RF + camera). **Adjacency**, could collaborate or overlap on UAS-heavy sites. |

**Tessure's stance:** treat these as sensor OEMs. Buy, don't build. Partner programs (Echodyne has one) reduce BOM and accelerate cert.

---

## Bucket 4 — Category consolidators (new in Pass 2)

Pass 1 missed this bucket. These are **well-capitalized platforms** whose current buyer differs from Tessure's but whose lateral expansion is plausible.

| Company | Notes |
|---|---|
| **Flock Safety** | **$275M raised Mar 2025 at $7.5B valuation**. **$300M+ acquisition of Aerodome Oct 2024**. Current buyer: law enforcement + municipal. Not a direct Tessure competitor today — **but the capital base and the aerial-response acquisition signal category-consolidator ambition.** Watch for commercial/enterprise expansion: that would put them in Tessure's wedge. |

---

## Bucket 5 — PSIM / SOC orchestration

The legacy layer Tessure overlaps with on the workflow side.

| Company | Notes |
|---|---|
| **Vidsys** | PSIM incumbent. Fat, customizable, slow. Tessure's event output can flow into Vidsys. |
| **SureView Response** | Alarm-response SaaS for central stations. Partner opportunity. |
| **Immix** | Alarm monitoring platform. Partner. |

---

## Bucket 6 — Defense-tech adjacencies (revised — Anduril is ACTIVE commercial, not speculative)

Pass 1 treated Anduril's commercial expansion as rumored. Pass 2 research confirms it is **current and marketed**. This materially changes the competitive timeline.

| Company | Notes |
|---|---|
| **Anduril** | **Already markets Lattice for commercial critical infrastructure** — oil & gas pipelines, wind farms, utilities. **$20B Army enterprise contract awarded Mar 2026.** Rumored **$4B raise at $60B valuation**. Not a theoretical future competitor — an actual one today. The commercial-buyer overlap with Tessure is real and growing. **Mitigation: civilian-first brand, faster enterprise land, overlay (not platform) posture with customers who have Tessure + Anduril both deployed.** See `RISK_ANALYSIS.md` R1 for full risk scoring. |
| **Shield AI** | Autonomous aircraft. Not competitive. |
| **Skydio** | Autonomous drones. Tessure dispatches Skydio as a response. Partner. |
| **Palantir** | Analytics platform, sometimes physical-security adjacent (Foundry deployments). Could be a platform customer of Tessure events. |

---

## White space (narrower than Pass 1 framed)

**No credible competitor occupies all four of:** edge-first multi-modal fusion + VMS-agnostic overlay + evidence-grade chain of custody + commercial-enterprise (non-defense) pricing and brand.

- Genetec/Milestone won't rebuild edge-first; their business model requires VMS primacy.
- Ambient.ai is single-modality by design.
- Verkada is cloud-first camera-only, even at enterprise scale.
- Deep Sentinel is human-cloud-monitored, not edge-fusion.
- Echodyne is a sensor OEM.
- Anduril is the closest architectural analog but its brand + buyer + pricing are DoD-heritage.
- Flock Safety is well-capitalized but currently LEO/municipal.

**The white space is real but narrower than Pass 1 claimed.** Specifically:
1. Anduril's active commercial presence compresses the timeline. Tessure has **12–18 months** to lock 5–10 lighthouse enterprise logos before Anduril's enterprise-land motion scales.
2. Verkada's $5.8B / 17K-customer footprint means "AI-video alternative" framing is harder — Tessure must lean harder on *multi-modal* and *outdoor-perimeter-specific* differentiation, not just "verified response."
3. Flock Safety's capital base is a strategic overhang. If they enter commercial, they arrive with a platform, aerial response (Aerodome), and LEO credibility most startups can't match.

Defense mechanism is architectural choice, not IP — which means speed to entrenchment in key accounts matters more than patents.

---

## Dominant-competitor kill-switch check

Playbook Phase 1 Pass 2 kill-switch: "dominant well-funded competitor (>$50M funding or >1M users) with no differentiation from Tessure."

- **Ambient.ai ($146M):** camera-only, cloud-leaning. **Differentiation: multi-modal fusion + overlay + edge autonomy.** Not a kill-switch.
- **Verkada ($5.8B val, 17K customers):** cloud-first, camera-first, SMB-to-enterprise but not outdoor-perimeter-specialized. **Differentiation: edge fusion, outdoor perimeter, commercial critical-infra focus.** Not a kill-switch.
- **Deep Sentinel ($50M+):** cloud + human-in-the-loop monitored response, low-end commercial. **Differentiation: edge architecture, enterprise-scale, evidence-grade packaging, no human-monitoring cost structure.** Not a kill-switch.
- **Anduril (well over $50M):** different buyer brand (DoD-heritage, military pastiche). **Differentiation: civilian-first brand, VMS-overlay, commercial pricing.** Not a kill-switch.
- **Flock Safety ($7.5B val):** different current buyer (LEO/municipal), could expand. **Differentiation today: commercial-enterprise segment not yet their market.** Not a kill-switch.

**No kill-switch fires.** White space is real but has narrowed; execution urgency is higher than Pass 1 framed.

---

## Recent shifts to track (2024–2026, Pass 2 verified)

- **Axon acquired Dedrone (2024).** Deal value not publicly disclosed by Axon; trade-press figures vary. Signals big-platform consolidation of counter-UAS into LEO/commercial stack.
- **Verkada CapitalG round (Dec 2025, $5.8B val).** Proved the cloud-AI-video thesis at scale. Also proves the category is big enough for multiple winners.
- **Ambient.ai Series B (April 2025, $74M).** Validates verified-response category. Also proves it's undersupplied — one leader can't own the whole market.
- **Deep Sentinel Series B + SentinelNow commercial launch (2025).** Signals low-end commercial compression; Tessure should not anchor on low-tier pricing.
- **Flock Safety $275M + Aerodome acquisition.** Category-consolidator pattern. Watch commercial expansion.
- **Anduril $20B Army contract (Mar 2026) + active Lattice commercial marketing.** Single largest strategic variable for Tessure.
- **NERC CIP-014 revision cycle + TSA SD02F effective May 3, 2025.** Direct regulatory tailwind on critical-infrastructure segment.
