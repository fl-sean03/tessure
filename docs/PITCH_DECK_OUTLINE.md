# Pitch Deck Outline — Seed / Series A

A 14-slide narrative for a 30-minute investor conversation. Every slide has one claim and one proof.

---

## Slide 1 — Title

**Tessure.** Trusted Autonomous Security. Logo. Founder names.

No taglines beyond this. The hero line is the category promise.

---

## Slide 2 — The problem in one number

**97% of perimeter security alarms are false.**

A typical enterprise site logs 400+ alerts/week. Operators are desensitized. When real threats arrive, they hide in the noise.

Proof: industry studies (SIA, IFSEC), false-dispatch cost data ($150–$400/event × 1000s/year).

---

## Slide 3 — Why it's expensive now, not in 10 years

Four forces converging:

1. **Guard labor broken.** +30% wages since 2020. <50% retention.
2. **Substation attacks rising.** NC (2022), WA (2023), FL (2023). NERC CIP-014 tightening.
3. **Insurance demanding verified response.** FM Global, Chubb, AIG rewriting loss-control advisories.
4. **Cargo theft at $100B/yr** (ORCA). Prologis tenants getting insurance-flagged.

This problem is getting **worse, not better**, in the next 18 months.

---

## Slide 4 — The category's answer has been "more AI video"

And it's failed. Single-modality cameras bottom out at ~85% accuracy on outdoor perimeters. Rain, fog, wildlife, shadows all defeat them.

Proof: every major AI-video company (Verkada, Ambient.ai, Deep Sentinel) ships with a "tuning period" of 30–90 days and FP rates still above 5% on outdoor sites.

---

## Slide 5 — Insight

**Sensor fusion at the edge cuts false alarms by 20–40×.**

Video + thermal + radar + acoustic, corroborated locally on a $900 node. Fusion turns "someone or something moved" into "an adult human, 1.8m, 20m from the fence, moving toward protected asset at 0.8m/s."

Human operators confirm real events 20× faster. Fake events never leave the sensor.

Proof: DARPA multi-modal fusion studies; our own lab bench runs; foundational radar+video papers.

---

## Slide 6 — The product

**Fusion Node** + **Tessure Command** + **Tessure Evidence.**

(Diagram: sensors → Node (edge) → Command (operator UI) → Evidence (signed packages out to SIEM, insurance, LE).)

No rip-and-replace. Keeps customer's VMS and access-control.

---

## Slide 7 — Why we win

Four architectural choices competitors can't match without rebuilding:

1. **Multi-modal edge fusion.** Not just cameras.
2. **Overlay posture.** Genetec/Milestone are partners, not enemies.
3. **Evidence chain.** Signed. Auditable. Insurable.
4. **Civilian-first brand.** Not defense pastiche. The enterprise buyer's language, not DoD's.

---

## Slide 8 — Who we sell to

Five segments, two primary for Year 1:

**Now:** Logistics yards ($40k ACV, fast cycles) + Colo data centers ($150k ACV).

**Expanding:** Critical utilities ($250k–$2M ACV), private estates, resorts/events.

Proof slide: list of 10 target accounts with publicly-documented trigger events (recent breaches, compliance gaps).

---

## Slide 9 — What we've built

- Fusion architecture + prototype Node running.
- Tessure Command web UI v1.
- Three.js interactive demo (live at tessure-v2.url) covering 6 scenario archetypes.
- Brand system + whitepaper.
- Pilot pipeline: X conversations, Y LOIs.

Proof: demo link on screen during pitch.

---

## Slide 10 — Traction / path

Month-by-month milestone grid. First pilot (M2), first paid (M6), 15 logos by M12 at $500k–$800k ARR. Path to $5M ARR Year 2, $20M Year 3.

---

## Slide 11 — Market

TAM $20B global, SAM $3B, SOM $20M by Year 3 (0.7% of SAM). Math on slide.

Framing: "We don't need to own this market. We need to be the multi-modal option that gets bought when single-modality fails."

---

## Slide 12 — Competition

Three buckets in one chart:
- **Incumbents** (Genetec, Milestone, Axis) — VMS layer; partners.
- **AI-video** (Ambient, Verkada, Hakimo) — single-modality; compete on accuracy.
- **Defense-tech** (Anduril, Shield AI) — different buyer; watch the boundary.

**White space: edge fusion + overlay + commercial-civilian brand.** No credible competitor there.

---

## Slide 13 — Team

Founder bios. Advisor circle (target: 1 former CSO of a utility, 1 ex-Anduril engineer, 1 insurance-industry exec).

What's missing (hiring bar): senior sales with utility background, hardware lead with IP67 enclosure experience, head of compliance.

---

## Slide 14 — Ask

**Seed: $3M.** Runway: 18 months. Goals: 15 paying logos, $500k–$800k ARR, SOC 2 Type 1, Fusion Node v2, 2 integrator partnerships, Series A readiness.

Use of funds (chart): 60% engineering + hardware, 25% go-to-market, 15% G&A + compliance.

---

## Appendix slides (don't open unless asked)

- Unit economics deep-dive
- Evidence pipeline architecture
- Privacy / regulatory posture
- Detailed segment-by-segment economics
- Anduril boundary analysis
- Risk register (R1–R12 from `RISK_ANALYSIS.md`)
- Detailed hiring plan
- 5-year P&L model
