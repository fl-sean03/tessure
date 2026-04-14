# Launch Narrative — Tessure

A one-page reference for Sean to use when linking to or talking about the updated Tessure site. Because Tessure is an archived concept (not a new-product launch), the framing is "the thesis, public and re-dressed" rather than "launching X." All copy is ready-to-use.

---

## The one-line pitch

**Tessure is the thesis for a civilian-enterprise, edge-fusion physical-security platform — made public because someone should build it, and it won't be me.**

---

## 30-second version (verbal)

Physical security at high-risk fixed sites has been drowning in false alarms for a decade. The answer isn't more AI video — it's sensor fusion at the edge. Video plus thermal plus radar, corroborated on-site, verified in seconds, signed as evidence, handed off to whatever VMS you already run. I built the thesis, the architecture, the brand, and the demo. I'm not taking it further. If you are, the whole data room is public.

---

## Three talking points

1. **"The category's white space is civilian-enterprise, not defense-tech."**
   Anduril is actively marketing Lattice to commercial critical infrastructure now. The winning position is not "baby Anduril" — it's the posture Anduril structurally can't wear. Trusted infrastructure, calm voice, VMS-overlay not rip-and-replace.

2. **"Sensor fusion is a hardware-is-commodity, brand-and-channel-is-moat problem."**
   Fusion Nodes (Jetson + radar + thermal) are becoming cheap and commodified (D3 Embedded reference designs, TI mmWave, etc.). The defensible moat is which 10 enterprise accounts you land in 12–18 months and whether the evidence pipeline is audit-grade.

3. **"Civilian buyers pay for silence, not dramatics."**
   VP Security at a utility or a colo doesn't buy militarized pitches. They buy insurance-grade audit trails, on-site data processing, and clean API integration with the VMS they already signed a 7-year contract for.

---

## FAQ — top 5 objections with answers

**Q1. Why is this archived?**
A. I built the thesis in Mar 2026, decided it wasn't the right fight for me, and made everything public so someone closer to the category can build it.

**Q2. Isn't this just what Ambient.ai / Verkada / Deep Sentinel do?**
A. No — all three are camera-only and cloud-leaning. Tessure's architectural bet is multi-modal fusion at the edge plus VMS-agnostic overlay plus evidence-grade chain of custody plus civilian-enterprise brand. See `COMPETITIVE_LANDSCAPE.md`. The white space is narrow but real.

**Q3. Doesn't Anduril's Lattice already do this?**
A. Anduril sells to DoD and DoD-adjacent buyers; their brand and pricing follow. Tessure is commercial-civilian: enterprise infrastructure teams, colo operators, utilities, estate-security consultants, insurance carriers. The buyer's aesthetic preference, procurement path, and liability posture are all different. Anduril can't reach this buyer without diluting their defense identity.

**Q4. What's the TAM?**
A. ~$6–9B global, US-centric. Down from an initial $20B estimate after Pass 2 research tightened the CIP-014-regulated count, data-center count, and dropped the retracted $100B NRF cargo-theft figure. Still a large market. See `OPERATIONS_AND_COSTS.md` TAM/SAM/SOM table.

**Q5. Is the architecture real?**
A. The hardware BOM ($900/node at 100-unit scale), fusion engine design, evidence pipeline with Merkle-rooted site-signed packages, and integration surface (Genetec/Milestone/Lenel/CCURE/Splunk/TAK-CoT) are all spec'd in `specs/PRODUCT_ARCHITECTURE.md`. No prototype was fielded. A serious team could hit Fusion Node v1 prototype in ~6 weeks.

---

## Where to point people

| Audience | Link |
|---|---|
| **Read the thesis** | `github.com/fl-sean03/tessure/tree/main/docs` |
| **Read the product architecture** | `github.com/fl-sean03/tessure/blob/main/specs/PRODUCT_ARCHITECTURE.md` |
| **See the brand + demo** | `v0-tessure.vercel.app` |
| **Run the interactive scenarios** | `v0-tessure.vercel.app/demo` |
| **Contact** | `sean.florez@colorado.edu` |
| **Archive context** | `seanflorez.com/archive/tessure/` |

---

## Social copy — ready to post

### LinkedIn (400 chars)
> Tessure is an autonomous security fusion platform concept I built in March 2026 — edge multi-sensor fusion (video + thermal + radar) for critical infrastructure, overlaying existing VMS systems, with evidence-grade chain of custody. I'm not taking it further, so the full thesis + product architecture + brand system are public. If you're building in physical security, the data room is free to mine.
>
> v0-tessure.vercel.app · github.com/fl-sean03/tessure

### X / Twitter (280 chars)
> Tessure — an edge multi-sensor fusion platform concept for critical infrastructure. Thesis, product architecture, brand system, demo, all public. Built it, decided not to pursue, handing the whole thing to whoever's closer to the category.
>
> v0-tessure.vercel.app

### Short form (50 chars)
> Tessure · Trusted Autonomous Security · thesis public

---

## UTMs (if social posting happens)

Attach one per surface so referral attribution is observable in Vercel logs (or any analytics added later):

- LinkedIn post: `?utm_source=linkedin&utm_medium=social&utm_campaign=relaunch-2026-04`
- X post: `?utm_source=x&utm_medium=social&utm_campaign=relaunch-2026-04`
- Archive page link: `?utm_source=seanflorez-archive&utm_medium=portfolio&utm_campaign=tessure`
- Email signature: `?utm_source=email-sig&utm_medium=email`

---

## What Phase 9 explicitly does NOT do

- **No analytics.** Matches the product's privacy-first posture. If this site ever needs analytics, Plausible (no cookies, EU-privacy-default) is the right choice, not GA4.
- **No waitlist.** There is no upcoming product; asking for emails would be deceptive.
- **No Product Hunt / Hacker News launch post.** Archived concepts are not launches. If the project is ever revived, that's when PH/HN drafts get written.
- **No paid growth.** See `GO_TO_MARKET.md` for the go-forward channel plan if the project is ever picked up.
