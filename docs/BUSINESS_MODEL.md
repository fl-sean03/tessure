# Business Model

## Revenue structure

**Hardware-included SaaS, per-site tier.** One line item, multi-year preferred.

| Tier | Scope | List price | Target segment |
|---|---|---|---|
| **Edge Small** | Up to 4 cameras + 1 radar + 1 thermal. Single Fusion Node. | $12,000/yr | Small yards, estates, single-building colo |
| **Edge Mid** | Up to 16 cameras + 4 radar + 4 thermal + acoustic. 1–2 Fusion Nodes + Command seat pack. | $40,000/yr | Mid logistics yards, single-campus colo, mid-size substations |
| **Edge Large** | Up to 64 cameras + 16 radar + 16 thermal + acoustic + counter-UAS integration. 3–6 Nodes clustered. Evidence API + SIEM connectors. | $120,000/yr | Hyperscale data centers, transmission substations, mid-size facility clusters |
| **Enterprise** | Multi-site, global. Custom integration with customer's PSIM/SOC. 50+ sites. | $500k–$5M/yr (site-weighted) | Utilities, hyperscale portfolios, national logistics |
| **Event Rental** | Temporary deploy (days to weeks) with Tessure field team. | $20k–$80k per engagement | Marinas, festivals, VIP events |

**All tiers include:** Fusion Node hardware (loaned, refreshed every 4 years), Tessure Command (web UI), firmware updates, Tessure Evidence signing service, standard VMS connectors, business-hours support. Optional uplift for 24/7 support + SLAs.

## Unit economics (mid-tier, $40k ACV)

| Item | Cost | Notes |
|---|---|---|
| Fusion Node hardware BOM | $1,200 | Jetson Orin NX + chassis + shielding. Amortized over 4 years = $300/yr. |
| Sensor subsidies (radar/thermal) | $0–$2,500 one-time | Some customers own; some bundled at cost or marked up 10%. |
| Cloud (Command + Evidence) | $400/yr | Modest; most compute is edge. Transcript + evidence storage. |
| Support / deployment | $2,000/yr | Remote setup + 2 service visits. |
| Software / cloud infra | $500/yr | Per-site allocation. |
| **COGS total** | **~$3,200/yr** | |
| **Gross margin** | **~92%** | before acquisition costs |
| CAC (mid-market) | $15,000 | ~40% of first-year revenue for direct sales; less through integrators. |
| **Payback** | **~6 months** | after first year. Year 2+ is close to pure margin. |

## Enterprise tier math

- $500k ACV, 20 sites
- COGS ~$60k/yr
- CAC amortized over 3 years at ~$120k (enterprise deal + SE + legal)
- Year 1 contribution: ~$320k
- Year 2+: ~$440k
- NRR target 115%+ (expansion through site adds)

## Expansion paths

1. **Site expansion.** Customer adds facilities over time. Largest vector; drives NRR.
2. **Sensor density.** Start at Edge Small, grow to Mid/Large as threats evolve.
3. **Evidence API consumption.** Customers integrating Tessure evidence into their SIEM/GRC platforms pay per-event fees above included volume.
4. **TAK/CoT bridge for public safety.** Add-on for sites that coordinate with local police (substations especially).
5. **Counter-UAS module.** Add RF spectrum analyzer + radar correlation; premium add-on.
6. **Managed detection & response (MDR).** 24/7 Tessure-staffed SOC for customers without in-house. Highest margin.

## Service revenue

- **Deployment services:** one-time, $5k–$50k per site. Target 20% of Year 1 revenue, declining to 10% as integrators ramp.
- **Integration services:** custom VMS/PSIM connectors, $20k–$200k per engagement. Mostly enterprise.
- **Training:** $3k per operator-class. Bundled into enterprise tier.

## Pricing philosophy

- **List-price transparency** on tiers up to Large. Enterprise priced. Build trust with procurement teams.
- **No price-per-camera.** Camera counts drift; sites add cameras; billing friction kills deals.
- **No price-per-event.** Customers would silence cameras to avoid fees. Opposite of our incentive.
- **Annual prepay standard.** Month-to-month priced at 1.25× to discourage. Multi-year 10–15% discount.

## Year-1 revenue plan

See `OPERATIONS_AND_COSTS.md` for ops-side detail. High-level:

| Quarter | Target | Notes |
|---|---|---|
| Q1 | 2 pilot sites, $0 (free) | Logistics + colo; proof references |
| Q2 | 4 paid sites, $100k | First design wins; convert pilots |
| Q3 | 8 sites cumulative, $250k | First mid-tier contracts signed |
| Q4 | 15 sites cumulative, $500k | First enterprise LOI |

**Year 1 exit ARR target: $500k–$800k.** Year 2: $3M ARR. Year 3: $10M ARR.

## Funding math (not a request, but for planning)

- **Pre-seed / seed: $3M** gets to $500k ARR and 15 logos.
- **Series A: $12M** at $3M ARR to push to enterprise segment.
- **Series B: $30M+** at $10M ARR.

Comparable raises: Ambient.ai raised $52M Series B at ~$4M ARR with camera-only architecture. Tessure's multi-modal claim should support similar or better metrics if execution is tight.

## What this business is not

- **Not a guard-replacement pitch.** Guards stay. We make them 10× more effective by eliminating false alarms before they dispatch.
- **Not a weapon or kinetic system.** No pursuit, no engagement. Evidence + notification + policy playbook only.
- **Not a VMS.** Genetec/Milestone/Axis partner posture.
- **Not a camera OEM.** Bring your own. We'll integrate.
- **Not DoD.** Dual-use boundary is clear — civilian critical infra. We will decline DoD work that pulls us off the wedge.
