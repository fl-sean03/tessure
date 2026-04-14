# Tessure — Startup Brief

**Revision:** Pass 2. Numbers and positioning tightened against `../research/COMPETITIVE_VALIDATION.md` and `../research/MARKET_VALIDATION.md`.

## Problem

Physical security at high-risk fixed facilities is drowning in false alarms. A typical enterprise site generates hundreds of perimeter alerts per week, of which **94–99%** are nuisance: wildlife, wind, shadows, birds, swaying vegetation, infrared glare, rain. Humans in GSOCs and dispatch centers become desensitized. When a real event arrives, it hides in the noise.

The operational consequences are measurable (verified):

- **Nuisance dispatch cost.** A single false guard/LE dispatch runs **$150–$500**, escalating under municipal false-alarm ordinances (Salt Lake City, Las Vegas, and a long list of mid-market cities operate graduated fine schedules).
- **Insurance pressure.** Carriers for data centers, power utilities, and logistics operators are tightening loss-control requirements around verified alarm response.
- **Guard-labor economics are breaking.** BLS data shows real wages for security officers flat over ~20 years, but operators report pay as their top challenge (**61%** in the *Security Magazine* 2024 Annual Guarding Report). Retention sits sub-50% across the industry. The combination — stagnant wages, rising operator pressure, sub-50% retention — means customers cannot hire their way out of the problem.
- **Cat-5 threats arriving.** Verified events in the last 24 months:
  - **Metcalf (2013)** — substation rifle attack; category-defining.
  - **Moore County NC (Dec 2022)** — substation gunfire; multi-day outage.
  - **Tacoma / Pierce County WA (Dec 2022)** — multiple substation attacks.
  - **Florida Duke substations (Sept 2022)** — six intrusions at Bay Ridge, Orange Blossom, Zephyrhills, East Clearwater.
  - **E-ISAC reports 3,500+ physical incidents in 2024**, rising since 2016.
  - **Verisk CargoNet cargo theft: $725M in 2025**, a record (+60% YoY).
  - Drone incursions at substations and chip fabs (Pennsylvania, North Carolina 2022–2024).

## For whom (primary buyer profiles)

See `CUSTOMER_SEGMENTS.md`. Highest level:

1. **Critical infrastructure operators** — power, water, telecom, pipelines. Regulated (NERC CIP-014-4, TSA SD02F effective May 3 2025). Must respond to verified events; penalized for outages.
2. **Hyperscale & colocation data centers** — AWS/Azure/Meta/Google build-outs plus Equinix/Digital Realty. 24/7 GSOCs, multi-km² campuses. Verified credible US universe: **~1,500–1,700 campuses** (was overstated at 3,500 in Pass 1).
3. **Logistics & freight yards** — Prologis tenants, intermodal, port operators. Cargo theft + insider threat.
4. **Private-wealth estates & family offices** — Aspen/Jackson Hole/Nantucket/Montecito. Insurance mandates.
5. **Resorts, marinas, event venues** — perimeter + overlay for transient high-value gatherings.

## Insight / wedge

**False alarms are a sensor-fusion problem, not an AI-video problem.**

The last decade of "AI video analytics" tried to squeeze verification out of a single modality — the camera. That's structurally noisy: a deer and a human produce similar pixel motion, thermal contrast can match on cold nights, and adversaries defeat vision by choosing conditions (fog, night, masks).

Radar confirms range/velocity. Thermal confirms heat signature and differentiates mammals. Acoustic confirms class (rotor, engine, gunshot). Fusing these at the edge eliminates the vast majority of false positives **before** they ever reach a human.

Second insight: **overlay, not rip-and-replace.** Every enterprise site has existing cameras, access control, VMS. Incumbents (Genetec, Milestone, Axis) sell the VMS layer. Tessure does not. Tessure is a **fusion brain** that reads from existing cameras + adds its own radar/thermal where gaps exist, corroborates, and hands verified events to the VMS/dispatch flow the customer already runs.

## The positioning choice (explicit)

There is a simpler framing floating around this concept: **"baby Anduril for fixed sites."** Tessure's original (Mar 2026) archive page used language close to it — "sovereign defense perimeter." This framing is **rejected** after Pass 2 research, for three reasons:

1. **Anduril is already here commercially.** Lattice is actively marketed for oil & gas pipelines, wind farms, and utilities as of 2025–2026. A "baby Anduril" positions Tessure as a smaller version of the incumbent in the same segment — a losing fight on capital, brand, and timeline. Anduril carries a **$60B rumored valuation and $20B Army contract**; Tessure has neither.

2. **Defense-tech aesthetics repel the civilian enterprise buyer.** The actual buyers at Equinix, Duke Energy, Prologis tenants, family offices, and insurance-driven accounts are risk-officers and facilities VPs — not operators. They distrust militarized framing for procurement, board review, and PR reasons. Anduril earns the defense aesthetic because they serve defense buyers; Tessure doesn't.

3. **The white space Anduril cannot credibly occupy is civilian-calm.** Enterprise-infrastructure brand posture (Stripe / Linear / Cloudflare aesthetic + privacy-first architecture + overlay-not-replace) is the one axis Tessure can own that Anduril structurally cannot match without diluting their defense identity.

Tessure's positioning is therefore: **Trusted Autonomous Security — civilian, commercial, evidence-first.** Not a small Anduril. An adjacent category, for the buyer Anduril's brand cannot reach.

**Why now** (same four forces, verified):
- **Edge compute is cheap.** NVIDIA Jetson Orin NX at <$800 runs 4-stream fusion locally.
- **Radar sensors commoditized.** mmWave (TI IWR6843) and FMCW solid-state units now <$500.
- **Regulatory tailwind.** TSA SD02F (May 2025), NERC CIP-014 revision cycle, EU AI Act high-risk rules live Aug 2 2026, CISA / E-ISAC publishing increasingly prescriptive guidance on physical infrastructure security.
- **Guard economics broken.** Flat real wages + sub-50% retention + operator-reported pay pressure. Automation is the only lever.
- **Foundation models solved perception fast enough.** Open-set detection (Grounding DINO, SAM 2) and lightweight classifiers make verification prompts config, not training runs.

## What is the product (short)

A **Fusion Node** — ruggedized edge appliance (NVIDIA Jetson Orin NX, IP67 housing) that ingests 4–16 video streams, up to 4 radar feeds, thermal, and acoustic inputs, corroborates detections across modalities, and emits **verified events** to the customer's VMS/SOC through open APIs (ONVIF, MQTT, webhook, TAK/CoT).

Paired with **Tessure Command** (thin web UI for operators to review, approve, override) and **Tessure Evidence** (cryptographically signed event packages for insurance, law enforcement, compliance).

## How does it make money

See `BUSINESS_MODEL.md`. Short version: hardware-included SaaS. **$12k–$120k per site per year** depending on site size and sensor count. Hardware margin ~50%, software margin ~85%. Target **$120k ACV** for mid-market and **$350k+** for critical-infrastructure accounts.

## Who competes

See `COMPETITIVE_LANDSCAPE.md`. Five buckets (revised Pass 2):
- **Legacy VMS / PSIM incumbents** (Genetec, Milestone, Axis) — partners, not competitors.
- **AI-video pure-plays** (Ambient.ai $146M, Verkada $5.8B/$1B ARR/17K customers, Deep Sentinel active commercial via SentinelNow, Hakimo, Coram, Turing, Actuate) — single-modality, cloud-leaning; compete on accuracy and architecture.
- **Radar / sensor specialists** (Echodyne, Fortem, FLIR, SpotterRF, Dedrone/Axon) — sensor OEM partners, not platforms.
- **Category consolidators** (Flock Safety $7.5B val, +Aerodome $300M+) — different current buyer (LEO/municipal) but well-capitalized; watch commercial expansion.
- **Defense-tech adjacencies** (Anduril) — **active commercial competitor now**, not speculative. Timeline compression is the #1 strategic variable.

**No credible competitor occupies: edge-first multi-modal fusion + VMS-agnostic overlay + evidence-grade chain of custody + civilian-enterprise pricing and brand.** White space is real but narrower than Pass 1 framed; speed to 5–10 lighthouse enterprise logos in 12–18 months is the real moat.

## Brand thesis (one-liner, feeds `BRAND_THESIS.md`)

**Tessure is the trusted grown-up in a category that markets like a weapons show.** Competitors lean tactical (Anduril), dark-tech-SaaS (Ambient.ai), or cloud-camera-convenience (Verkada). Tessure's visual language is enterprise-infrastructure calm: slate, Trust Blue, clean geometry, evidence-first. Buyers are risk officers and facilities VPs, not Seal Team operators. Tone is "verified" not "warrior."

## Category-critical items

- **Privacy by default** is non-optional. EU AI Act (high-risk AI obligations live Aug 2 2026), Illinois BIPA, CA CCPA, and public-procurement compliance all reward on-site processing + redaction by default. This is a feature, not a trade-off.
- **Human-in-the-loop** above defined risk thresholds. Fully autonomous kinetic or dispatch response is explicitly outside scope; automation is proposal + evidence, humans approve.
- **Evidence chain.** Hashed, signed, exportable. Without this, insurance and law enforcement cannot use Tessure output downstream — which is where much of the ROI lives.
- **Edge autonomy during WAN loss.** Critical infra demands it; rural substations lose uplink routinely.

## Run-time status

Archived concept, Mar 2026, thesis made public. Sean not actively developing. This playbook run produces the corrected, research-validated version of the strategic data room that the seanflorez.com/archive/tessure/ page originally linked to. Demo site at `v0-tessure.vercel.app` (Phase 5 placeholder); Phase 7 site will rebuild with proper credibility rail + evidence-pipeline signature diagram as recommended in `../research/DESIGN_RESEARCH.md`.
