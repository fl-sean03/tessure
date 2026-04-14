# Competitive Landscape

Three buckets + adjacencies. Verified against public funding rounds and product documentation; figures are order-of-magnitude and flagged where stale.

---

## Bucket 1 — Legacy VMS / PSIM incumbents

The category leaders. Strong channel, deep customer entrenchment, architectural debt.

| Company | HQ | Est. funding / rev | Wedge vs Tessure |
|---|---|---|---|
| **Genetec** | Montreal | Private, ~$600M rev | Owns VMS layer. Tessure **reads from them**, not against them. Opportunity: Genetec Security Center partner program. |
| **Milestone Systems** | DK / Canon-owned | Subsidiary, ~$200M rev | Same — Tessure overlays. XProtect API is well-documented. |
| **Axis Communications** | Sweden / Canon-owned | ~$1.8B rev | Camera OEM + ACAP analytics. Single-modality; doesn't fuse radar natively. |
| **Avigilon** | Motorola Solutions | Acquired 2018 ($1B) | Cloud-leaning; Motorola's mass-notification angle. Overlaps on "verified alarm" but is camera-centric. |

**Tessure's stance:** partner posture toward VMS. Sell the fusion brain, let the customer keep their VMS. Write adapters, not replacements.

---

## Bucket 2 — AI-video pure-plays (camera-first)

The "ambient/autonomous" wave of 2018–2025. Strong narrative, high burn, camera-modality-limited.

| Company | Funding | Status 2026 | Wedge vs Tessure |
|---|---|---|---|
| **Ambient.ai** | $110M+ Series B (a16z, Allegion) | Active, hyperscale + retail wins | Closest conceptual competitor on "verified response." Camera-only; does not fuse radar/thermal natively. Argument: multi-modal fusion is fundamentally more accurate on outdoor perimeters. |
| **Verkada** | $3B valuation post-2024 secondary | Active, SMB-heavy | Cloud-first, camera-first, hostile to on-prem fusion architectures. Different buyer (SMB/mid-market; not critical infra). |
| **Deep Sentinel** | $50M+ raised, weak exit | Struggling; pivoted residential | Was commercial, retreated to residential DIY. Not a competitor now. |
| **Hakimo** | $12M Series A (2024) | Active, SMB | Alarm-verification SaaS layered on existing cameras. No sensor fusion; no edge; cloud-only. |
| **Turing AI** | $10M+ | Active | Camera-analytics; similar to Verkada for SMB. |
| **Actuate AI** | $10M+ | Active | Weapon-detection-focused. Narrow. |
| **Coram AI** | $10M+ Seed | Early | Cloud VMS + analytics. Early-stage, will sharpen over 2026–2027. |

**Tessure's stance:** multi-modal fusion is the defensible moat. Any single-modality system bottoms out at ~80–90% accuracy on outdoor perimeter. Fusion hits 98%+ (Tessure's design target: false-positive rate <5% after 30-day tune). Also: Tessure is edge-first and overlay; these are cloud-first and often lock-in.

---

## Bucket 3 — Radar / sensor-tier specialists

Strong in their modality, not fusion platforms.

| Company | Funding | Notes |
|---|---|---|
| **Echodyne** | $65M+ (2023 round) | Metamaterial ESA radar. Tier-1 perimeter radar. **Potential OEM partner or acquisition target for Tessure's radar input.** |
| **Fortem Technologies** | $80M+ | Counter-UAS radar + interceptor. Tessure integrates, does not replace. |
| **SpotterRF** | Acquired by CGSecurity 2024 | Compact perimeter radar; common in military. Integration partner. |
| **FLIR / Teledyne** | Public (Teledyne $30B cap) | Thermal OEM leader. Integration partner. |
| **Axis (thermal line)** | see Bucket 1 | Thermal cameras. Integration partner. |
| **Dedrone** | Acquired by Axon 2024 ($600M+) | Counter-UAS (RF + camera). **Adjacency**, could collaborate or overlap on UAS-heavy sites. |

**Tessure's stance:** treat these as sensor OEMs. Buy, don't build. Partner programs (Echodyne has one) reduce BOM and accelerate cert.

---

## Bucket 4 — PSIM / SOC orchestration

The legacy layer Tessure overlaps with on the workflow side.

| Company | Notes |
|---|---|
| **Vidsys** | PSIM incumbent. Fat, customizable, slow. Tessure's event output can flow into Vidsys. |
| **SureView Response** | Alarm-response SaaS for central stations. Partner opportunity. |
| **Immix** | Alarm monitoring platform. Partner. |

---

## Bucket 5 — Defense-tech adjacencies (not direct competitors, but boundary)

| Company | Notes |
|---|---|
| **Anduril** | Lattice OS is the clearest mental-model analog. **But** Anduril sells to DoD and DoD-adjacent (border, CBP). Tessure's buyer is civilian enterprise. Different procurement, different UX, different price point. Risk: Anduril expands downward into enterprise infra; Tessure moves first, owns the commercial data-center + utility wedge. |
| **Shield AI** | Autonomous aircraft. Not competitive. |
| **Skydio** | Autonomous drones. Tessure dispatches Skydio as a response. Partner. |
| **Palantir** | Analytics platform, sometimes physical-security adjacent (Foundry deployments). Could be a platform customer of Tessure events. |

---

## White space

**No credible competitor occupies:** *edge-first multi-modal fusion + VMS-agnostic overlay + evidence-grade chain of custody + commercial-enterprise pricing*.

- Genetec/Milestone won't rebuild edge-first; their business model requires VMS primacy.
- Ambient.ai is single-modality by design.
- Echodyne is a sensor, not a platform.
- Anduril is the closest architectural analog but sells to DoD.

This white space is the Tessure wedge. It is defensible by architectural choice, not by IP — which means speed to entrenchment in key accounts matters more than patents.

---

## Dominant-competitor kill-switch check

Playbook Phase 2 kill-switch: "direct competitor both dominant (>$50M funding or >1M users) within last year with no differentiation."

- Ambient.ai: >$50M funding, camera-only. **Differentiation: multi-modal fusion + overlay posture + edge autonomy.** Not a kill-switch.
- Verkada: >$1M users but mostly SMB; cloud-first; different buyer. **Not a kill-switch.**
- Anduril: well-funded but different buyer (DoD). **Not a kill-switch for commercial wedge.**

No kill-switch fires. White space is real.

---

## Recent shifts worth tracking (2024–2026)

- **Axon acquired Dedrone (2024, ~$600M).** Signals big-platform consolidation of counter-UAS into law-enforcement stack. Tessure benefits (Axon is a partner, not competitor, in civilian infra).
- **Verkada valuation volatility (2024 secondary).** Softened the "cloud camera narrative" premium. Favors edge-first positioning.
- **Ambient.ai hyperscale wins (2024–2025).** Proves verified-response category is real. Also proves it's undersupplied — one leader can't own the whole market.
- **NERC CIP-014 revisions (proposed 2025).** Tightening physical-security requirements on electric utilities. Direct tailwind.
- **TSA Pipeline Security Directive SD-02C (2023, iterating).** Same dynamic for pipelines.
- **Anduril's Lattice Civil (rumored 2026).** Watch closely. If they go commercial, timeline pressure increases.
