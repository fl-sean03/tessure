# Tessure — Startup Brief

## Problem

Physical security at high-risk fixed facilities is drowning in false alarms. A typical enterprise site generates **hundreds of perimeter alerts per week**, >95% of which are nuisance: wildlife, wind, shadows, birds, swaying vegetation, infrared glare, rain. Humans in GSOCs and dispatch centers become desensitized. When a real event arrives, it hides in the noise. Industry studies routinely cite **97–99% false-positive rates** on standalone motion/analytics systems.

The operational consequences are measurable:
- **Nuisance dispatch cost.** A single false guard/LE dispatch runs **$150–$400**. A mid-size site absorbs **$30k–$120k/year** in nuisance dispatches alone. Some jurisdictions now fine repeat offenders (Salt Lake City, Las Vegas: $50–$250 per false alarm after the first two).
- **Insurance pressure.** Carriers for data centers, power utilities, and logistics operators are tightening loss-control requirements around verified alarm response.
- **Guard-labor inflation.** Physical guard wages have risen **~30% since 2020**; retention is collapsing. Customers cannot hire their way out of this.
- **Cat-5 threats arriving.** Drone incursions at substations (PA, NC 2022–2024), cargo-theft organized crime (ORCA $100B/yr by 2025), coordinated attacks — operators need faster verification, not more alarms.

## For whom (primary buyer profiles)

See `CUSTOMER_SEGMENTS.md` for detail. At highest level:

1. **Critical infrastructure operators** — power, water, telecom, pipelines. Regulated (NERC CIP, TSA Pipeline Directive). Must respond to verified events; penalized for outages.
2. **Hyperscale & colocation data centers** — AWS/Azure/Meta/Google build-outs plus Equinix/Digital Realty. 24/7 GSOCs, ~2–5 sq km campuses.
3. **Logistics & freight yards** — Prologis tenants, intermodal, port operators. Cargo theft + insider threat.
4. **Private-wealth estates & family offices** — Aspen/Jackson Hole/Nantucket/Montecito. Insurance mandates.
5. **Resorts, marinas, event venues** — perimeter + overlay for transient high-value gatherings.

## Insight / wedge

**False alarms are a sensor-fusion problem, not an AI-video problem.**

The last 10 years of "AI video analytics" tried to squeeze verification out of a single modality — the camera. That's structurally noisy: a deer and a human both produce similar pixel motion, thermal contrast can match on cold nights, and adversaries defeat vision by choosing conditions (fog, night, masks).

Radar confirms range/velocity. Thermal confirms heat signature and differentiates mammals. Acoustic confirms class (rotor, engine, gunshot). Fusing these at the edge eliminates the vast majority of false positives **before** they ever reach a human.

The second insight: **overlay, not rip-and-replace.** Every enterprise site has existing cameras, access control, VMS. Incumbents (Genetec, Milestone, Axis) sell the VMS layer. Tessure does not. Tessure is a **fusion brain** that reads from existing cameras + adds its own radar/thermal where gaps exist, corroborates, and hands verified events to the VMS/dispatch flow the customer already runs.

**Why now:**
- **Edge compute is cheap.** NVIDIA Jetson Orin NX at <$800 runs 4-stream fusion locally. 2020 this required a rackmount.
- **Radar sensors commoditized.** mmWave (IWR6843, AWR2944) and FMCW units are now <$500 and solid-state.
- **Regulatory tailwind.** TSA/CISA issuing stricter guidance on physical security for critical infra (2022–2025). E-ISAC reporting substation attacks rising.
- **Guard-labor economics broken.** 30%+ wage inflation, sub-50% retention. Automation is the only lever.
- **Foundation models solved perception fast enough.** Open-set detection (Grounding DINO, SAM 2) makes verification prompts config, not training runs.

## What is the product (short)

A **Fusion Node** — ruggedized edge appliance (NVIDIA Jetson Orin NX, optional IP67 housing) that ingests 4–16 video streams, up to 4 radar feeds, thermal and acoustic inputs, corroborates detections across modalities, and emits **verified events** to the customer's VMS/SOC through open APIs (ONVIF, MQTT, webhook, TAK/CoT).

Paired with **Tessure Command** — a thin web UI for operators to review, approve, or override. **Tessure Evidence** — cryptographically signed event packages for insurance, law enforcement, compliance.

## How does it make money

See `BUSINESS_MODEL.md`. Short version: hardware-included SaaS. **$12k–$40k per site per year** depending on site size and sensor count. Hardware margin ~50%, software margin ~85%, services ~30%. Target **$120k ACV** for mid-market and **$350k+** for critical-infrastructure accounts.

## Who competes

See `COMPETITIVE_LANDSCAPE.md`. Three buckets: legacy VMS (Genetec, Milestone, Axis), AI-video pure-plays (Ambient.ai, Deep Sentinel, Verkada — camera-first, single modality), radar specialists (Echodyne, Fortem). **No incumbent fuses across modalities at the edge with an overlay posture.** That's the white space.

## White space thesis

Genetec/Milestone won't rebuild their architecture around edge fusion (they sell to SIs who install their VMS; any move to an edge-fusion brain threatens that channel). Ambient.ai is camera-only by design. Echodyne is a sensor OEM, not a fusion platform. Verkada is a cloud-first camera company. **Tessure's fit is the fusion brain that sits atop whatever the customer already has and ships verified events downstream.**

## Brand thesis (one-liner feeds `BRAND_THESIS.md`)

**Tessure feels like the trusted grown-up in a category that markets like a weapons show.** Competitors use tactical font, dark UI, camo imagery, military pastiche. Tessure's visual language is enterprise-infrastructure calm: slate, trust blue, clean geometry, evidence-first. Buyers are risk officers and facilities VPs, not Seal Team operators. Tone is "verified" not "warrior."

## Category-critical items

- **Privacy by default** is non-optional. EU AI Act, Illinois BIPA, CA CCPA, and public-procurement compliance require it. On-site processing + redaction by default is a feature, not a trade-off.
- **Human-in-the-loop** above defined risk thresholds. Fully autonomous use-of-force response is outside Tessure's scope; automation is proposal + evidence, humans approve.
- **Evidence chain.** Hashed, signed, exportable. Without this, insurance and law enforcement cannot use Tessure output downstream — which is where much of the ROI lives.
- **Edge autonomy during WAN loss.** Critical infra demands it; rural substations lose uplink routinely.

## Run-time status (context-internal)

Archived concept, Mar 2026. This doc set is the strategic data room produced against the `idea-to-site-playbook`. Demo site at `v0-tessure.vercel.app`. Sean not actively developing; thesis public.
