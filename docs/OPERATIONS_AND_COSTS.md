# Operations & Costs — Year 1

**Revision:** Pass 2. TAM/SAM/SOM revised down from Pass 1 (see `../research/MARKET_VALIDATION.md`). Still well above the $50M kill-switch. Team plan unchanged.

## Team

Target **6 FTE + 3 contractors** by end of Year 1.

| Role | Month joined | Annual cost (fully loaded) | Notes |
|---|---|---|---|
| Founder / CEO | M0 | $0 (deferred) or $120k | Sales-led Year 1. Salary reset at seed close. |
| Co-founder / CTO | M0 | $0–$120k | Architecture + hiring. |
| Founding engineer (perception / fusion) | M1 | $220k | ML + sensor integration. |
| Founding engineer (systems / edge) | M2 | $210k | Jetson + edge runtime. |
| Head of Field / Deployment | M4 | $180k | Physical-security background; own pilot installs. |
| Account Executive (enterprise) | M6 | $260k OTE ($180k base + commission) | Utility + colo hunting. |
| SE / Solutions | M9 | $200k | Demo, integration support. |
| **Contractor: firmware/RTOS** | M2 | $80k | 6-month project. |
| **Contractor: industrial design / hardware** | M3 | $100k | Fusion Node enclosure. |
| **Contractor: compliance / SOC 2** | M8 | $40k | SOC 2 Type 1 audit. |

**Total Year-1 payroll + contractors:** ~$1.4M–$1.6M, assuming founder salaries reset mid-year.

## Hardware + infrastructure

| Line item | Cost | Notes |
|---|---|---|
| Fusion Node BOM x 30 (pilot + early customer units) | $36,000 | $1,200 × 30 at pilot scale; unit cost drops to $900 at 100+ scale. |
| Test bench (indoor + outdoor lab) | $40,000 | Office lab with sensor array. |
| Colo rack for Tessure Command cloud (AWS + 1 Equinix colo for redundancy) | $30,000/yr | Low; edge-heavy architecture. |
| Dev tools, CI, storage, model-training (fal.ai, Modal, GCP A100 bursts) | $50,000/yr | |
| Office / shop space | $60,000/yr | Shared space Year 1. |
| **Hardware + infra total** | **~$216,000/yr** | |

## Go-to-market spend

| Item | Cost |
|---|---|
| Conferences (ISC West, GSX, Data Center World, CS4CA) | $80,000 |
| Content production (whitepapers, case studies, video) | $40,000 |
| Travel for pilots and sales | $60,000 |
| PR/analyst (limited; 1 retainer Mo 6–12) | $45,000 |
| Website, design, brand system assets | $30,000 |
| Tooling (HubSpot, Gong, Close.com, Figma, DocuSign, Linear, etc.) | $40,000 |
| **GTM total** | **~$295,000/yr** |

## Legal, compliance, G&A

| Item | Cost |
|---|---|
| General counsel (fractional) | $80,000 |
| IP counsel (patent filings) | $60,000 |
| SOC 2 Type 1 audit | $40,000 |
| E&O + D&O + General Liability insurance | $45,000 |
| Accounting, tax, finance tools | $35,000 |
| **G&A total** | **~$260,000/yr** |

## Total Year-1 burn

**~$2.1M–$2.4M.** Offset by ~$500k–$800k revenue, net **~$1.5M cash burn**. Pre-seed/seed of **$3M** funds ~18 months with buffer.

---

## Year-1 milestones

| Month | Milestone |
|---|---|
| M1 | Fusion Node v1 prototype running in lab |
| M2 | First pilot site signed (logistics yard) |
| M3 | First Fusion Node deployed outdoor, 30-day baseline captured |
| M4 | Second pilot (data center); Tessure Command web UI v1 |
| M6 | First paid conversion; first AE hired |
| M7 | Fusion Node v2 (field-hardened); SOC 2 audit kickoff |
| M9 | 5 paid logos; first enterprise (utility) LOI; SE hired |
| M10 | Integrator partnership with one major (Convergint likely) |
| M12 | 15 logos; $500k–$800k ARR exit; seed close / Series A prep |

---

## TAM / SAM / SOM (Pass 2 revised)

**TAM** — total addressable market, US-centric with global extrapolation:

| Segment | US universe | Avg ACV | US TAM |
|---|---|---|---|
| Critical infrastructure — **CIP-014 regulated** (narrow wedge) | 1,500 high-risk transmission substations | $250k | **$375M** |
| Critical infrastructure — **broader non-CIP** (utility, telecom, pipeline, water) | Tens of thousands of sites; conservative 10,000 addressable | $120k | **~$1.2B** (longer cycles, lower urgency) |
| Hyperscale + colocation data centers | 1,500–1,700 campuses | $200k | **~$340M** |
| Logistics yards + industrial (Prologis-scale tenants, intermodal, ports) | Conservative 2,000 addressable from a larger Prologis-tenant pool | $60k | **~$120M** |
| Private estates + family offices | ~50,000 UHNW-residence addressable | $40k | **~$2.0B** |
| Resorts + marinas + event venues | ~5,000 addressable | $60k | **~$300M** |
| **US TAM total** | | | **~$4.3B** |
| **Global TAM (2× US)** | | | **~$8.6B** |

**Pass 1 claimed $20B.** That figure overstated by ~2–3× across data-center count and logistics yard count. Pass 2 revision: **~$6B–$9B global TAM**, depending on how aggressively non-CIP utility and consumer-adjacent segments are counted. Still comfortably above the $50M kill-switch bar; still a large market; but not $20B.

**SAM — segments Tessure can credibly serve in 3 years:**
- Top 20% of each segment where pilot infrastructure and integrator coverage exist.
- ~$1B–$1.5B.

**SOM — Year 1–3 realistic:**
- Year 1: 15 logos → ~$0.5–0.8M ARR.
- Year 2: 50 logos → $3–5M ARR.
- Year 3: 150 logos → $12–20M ARR.

---

## Capital efficiency posture

- **Edge-first architecture** means low cloud spend vs. competitors. Tessure's COGS scales with hardware deployed, not events monitored.
- **Hardware as reclaimed asset.** Pilot units roll forward into paying customers or refurbish; write down over 4 years not 1.
- **Integrator channel** reduces direct sales headcount in Years 2+. Target cash-flow positive at $5M ARR if the integrator motion works.

---

## Failure modes (ops-specific)

- **Deployment is harder than modeled.** Plausible. Each install is a half-day to 2-day affair. Mitigation: standardize install kit, train integrators, target <4 hour installs by Month 9.
- **Hardware revisions required** after field deployments reveal thermal/dust/moisture issues. Build in M6–M7 for v2 hardened unit.
- **Cloud SaaS cost creep** if we over-stream to cloud instead of keeping edge. Discipline: edge-first or reject the feature.
- **Sales cycles longer than 90 days.** Plan for 120-day average; model doesn't break if cycles slip 30 days.
