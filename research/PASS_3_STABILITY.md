# Pass 3 Stability Check

Date: 2026-04-14. Purpose: confirm the Pass 2-revised Tessure thesis is stable.

## Summary
- Check 1 (gap competitors): **Minor finding** — Siemens Siveillance Control Pro is a more direct incumbent overlay/fusion competitor than currently framed; Bosch IVA Pro Perimeter (2025) is a legitimate camera-side competitor; Sentitech (Spain, Apr 2025) is a Europe-side fusion startup worth naming. No thesis-breaking entrant.
- Check 2 (positioning soundness): **No material change** — no analyst report or buyer survey found arguing enterprise CSOs prefer defense-tech brand aesthetics; Anduril's commercial footprint is still almost entirely public-safety / border / stadium / federal, not enterprise data centers. Civilian-enterprise positioning remains sound.
- Check 3 (60-day news): **One notable datapoint** — Anduril won a $20B Army enterprise contract (Mar 14 2026) that further cements Lattice as defense-primary, and Verkada hit $5.8B valuation with CapitalG investment (Mar 25 2026) + launched AI-powered deterrence (Feb 12 2026). Neither forces a thesis revision; both strengthen the "commercial-native vs defense-primary" split.

## Check 1 — Gap competitors

**Sentitech / Domus Sentinela (Spain, founded Apr 2025).** Spanish sensor-fusion startup, "Nucleus" platform fuses radar + cameras + RF + LiDAR, reached TRL 6 covering 40 hectares / 2,500m / 3km range with "double dome" architecture. This is the closest direct multi-modal fusion competitor found in this pass — but positioned primarily for airport/critical-infra counter-UAS, not pure ground-perimeter enterprise. Worth adding to COMPETITIVE_LANDSCAPE.md as a European fusion-native reference. [1]

**D3 Embedded (US).** Not a product competitor — a reference-design vendor (radar-camera fusion stack on NVIDIA Holoscan + TI mmWave). Signals commoditization of the fusion hardware layer, which *supports* Tessure's "fusion is table stakes, product + brand is the moat" thesis rather than threatening it. [2]

**Bosch IVA Pro Perimeter (2025).** Launched at ISC West 2025. AI object detectors + motion analytics for long-distance perimeter detection including crawling/camouflaged people. Camera-centric, not multi-modal, not a VMS overlay — but it is the entrenched-incumbent answer. Already covered in Pass 2 by implication under "incumbents"; should be named explicitly. [3]

**Siemens Siveillance Control Pro.** More direct than currently framed in Pass 2 docs. Integrates access + video + intrusion + perimeter + fire into one platform with "automated workflows and intelligent dispatch." This is essentially Tessure's overlay/fusion positioning — but from an incumbent, targeted at the same critical-infra buyer, with deep Siemens sales channels. Also: CVE-2025-1688 Siveillance Video vulnerability (CISA advisory ICSA-25-140-05, and ICSA-26-043-07) shows the platform has real field presence. Strongest incumbent threat identified in Pass 3; should be elevated in COMPETITIVE_LANDSCAPE.md. [4][5][6]

**Thales.** 2025-2026 announcements are almost entirely AI-cybersecurity (AI Security Fabric) and airport/border intrusion — no commercial enterprise physical-security product push found. Not a near-term commercial enterprise competitor. [7]

**Counter-UAS expansion into ground perimeter.** Ondas/American Robotics won 2026 FIFA World Cup C-UAS contracts; DroneShield + Robin Radar partnered on sensor marketplace; REMPART offers C-UAS + ground-perimeter. Pattern: C-UAS vendors are adding ground sensors to *their airspace story*, not pivoting to enterprise-fixed-facility overlay. No direct threat. [8][9]

**Defense-tech adjacency.** Beyond Anduril/Shield AI/Skydio, nothing new found entering commercial critical infrastructure in a way that would crowd Tessure's white space.

## Check 2 — Positioning soundness

**No buyer-preference evidence for defense-tech branding.** The best available signal (CSO Online "What CISOs want from vendors") ranks: product innovation > vendor reputation/breach history > business value > cost > name recognition > vendor age > peer adoption. No mention of brand aesthetic or defense-tech framing as a factor. CISOs "prefer product demos" above all follow-up forms. This is mildly supportive of the civilian-enterprise-calm thesis — buyers weight demos and outcomes, not uniform-adjacent branding. [10]

**Physical security market leaders are boring enterprise brands.** Johnson Controls (10-11%), Bosch (7-8%), Honeywell (6-7%), ADT (5-6%), Cisco (1-2%) — ~29-34% combined share. All civilian-enterprise-calm aesthetics. No defense-tech brand appears in top physical-security market share. [11]

**Anduril commercial enterprise footprint (named accounts).** The key question was whether Lattice commercial has named enterprise-data-center / utility accounts. Answer found: Lattice commercial deployments are framed as "public safety and defense" dual-use; the big 2026 news is the $20B *Army* enterprise contract. Oracle partnership is for OCI hosting, not an enterprise buyer. No publicly named enterprise data center or corporate-campus Lattice deployment was surfaced. This is *consistent with Pass 2* — Anduril is still defense-primary with public-safety adjacency, not commercial-enterprise-primary. [12][13][14]

**No Gartner/Forrester VMS market guide (2025-2026) found.** The only Gartner VMS Market Guide indexed is the 2017 edition. Gartner's 2025 "Cool Vendors in Cyber-Physical Systems Security" exists but is CPS/OT-cyber focused, not physical video/perimeter. Means: analyst coverage of the exact Tessure category is thin, which is both opportunity (no incumbent frame to fight) and risk (no third-party validation to cite in enterprise sales). Worth noting but not thesis-breaking. [15]

## Check 3 — 60-day news

**Anduril $20B Army enterprise contract (Mar 14 2026).** 10-year enterprise agreement consolidating 120+ procurement pathways around Lattice. Reinforces Anduril as defense-primary; the commercial dual-use story becomes a side product, not the center of gravity. *Strengthens* Tessure's "commercial-native vs defense-primary" split. [12][14]

**Verkada $5.8B valuation + CapitalG investment + Dubai hub (Mar 25 2026).** Revenue up 30%, international expansion accelerating. Verkada remains the dominant cloud-camera enterprise player — the main competitive risk vector for Tessure is Verkada adding radar/thermal fusion, not new entrants. Worth watching. [16]

**Verkada AI-powered Deterrence launch (Feb 12 2026).** Active deterrence (speaker/strobe) integrated with AI detection. Moves Verkada one step toward "automated response" framing. Still camera-only, cloud-only — Tessure's edge-fusion + VMS-overlay differentiation holds. [17]

**Flock Safety $275M / Aerodome drone acquisition (Mar 2025, still relevant).** Reinforces Flock's LEO/municipal lane; not enterprise. No 2026 move into enterprise fixed-facility found. [18]

**Securitas Technology x Ambient.ai partnership.** Securitas is reselling Ambient.ai threat detection globally. Moves Ambient.ai from "camera-only cloud startup" toward "channel-distributed camera-cloud" — extends Ambient.ai's enterprise reach but does not change the camera-only limitation. [19]

**Regulation.** No CISA/DHS bulletin in the 60-day window specifically reframing physical-security AI. Existing DHS AI Safety and Security Guidelines for Critical Infrastructure (Apr 2024) and CISA May 2025 AI data security guidance remain the baseline. No state-level physical-security AI regulation surfaced. [20][21]

**Insurance.** No new 2026 public position from a major carrier mandating or discounting AI-verified-response at the enterprise level. Residential 5-20% discounts for verified/monitored alarms persist as the baseline; commercial verified-response pricing is negotiated, not published. Insurance-moat thesis for Tessure remains a *develop-over-time* item, not a near-term catalyst. [22]

**Counter-UAS legislation.** Safer Skies Act (Dec 2025) — federal funding for detect/track/disrupt drone tech. Not directly applicable to Tessure's ground-perimeter enterprise scope, but it funnels more capital into the C-UAS category that might spill over. Watch-item, not thesis-breaker. [8]

## Stability verdict

**Does any finding force a Phase 1 revision? No.**

The Pass 2 thesis is stable. The four "white space" claims (edge multi-modal fusion + VMS-overlay + evidence-grade chain of custody + civilian-enterprise brand) all survive:
- Fusion hardware is commoditizing (D3 Embedded / TI / NVIDIA Holoscan reference stacks) — product + channel + brand become the moat, consistent with Pass 2.
- VMS-overlay positioning is still mostly open. Siemens Siveillance Control Pro is the closest incumbent threat — but it's a bundle sold through Siemens building-tech channels to Siemens buyers, not a software-first overlay for existing mixed-vendor VMS estates.
- Civilian-enterprise brand positioning has no counter-evidence. Anduril's 2026 trajectory (Army $20B) moves it further from enterprise-commercial, not closer.
- Competitive landscape 60-day news is consistent: Verkada scales cloud-camera; Flock scales LEO; Anduril scales defense; Ambient.ai scales via Securitas channel. None of them fused the Tessure stack.

**Recommended actions (light, no Phase 1 rework):**
1. Add **Siemens Siveillance Control Pro** to COMPETITIVE_LANDSCAPE.md as a named incumbent overlay competitor (currently underweighted).
2. Add **Bosch IVA Pro Perimeter (2025)** as named camera-side competitor.
3. Add **Sentitech / Domus Sentinela** as European fusion-native reference (counter-UAS-adjacent, not direct but illustrative).
4. Note **Anduril $20B Army contract (Mar 2026)** and **Verkada $5.8B / CapitalG (Mar 2026)** in COMPETITIVE_LANDSCAPE.md to keep the landscape current.
5. Flag **Gartner VMS Market Guide absence** as a GTM consideration — Tessure may need to drive analyst briefings early to create category language (opportunity, not risk).

No other revision required. Proceed to Phase 2 execution (brand identity, site, pilot outreach).

## Sources

1. https://www.ecoticias.com/en/a-spanish-startup-founded-in-april-2025-validates-in-record-time-an-ai-powered-perimeter-surveillance-system-with-sensor-fusion-covering-40-hectares-and-2500-meters-in-real-air-traffic-and-reaching/29440/
2. https://www.edge-ai-vision.com/2026/04/texas-instruments-d3-embedded-lattice-and-nvidia-show-a-practical-radar-camera-fusion-stack-for-robotics/
3. https://www.securitysales.com/news/bosch-to-showcase-ai-technologies-new-software-at-isc-west-2025/610629
4. https://www.siemens.com/en-us/products/building-security/siveillance-control-pro/
5. https://www.cisa.gov/news-events/ics-advisories/icsa-25-140-05
6. https://www.cisa.gov/news-events/ics-advisories/icsa-26-043-07
7. https://cpl.thalesgroup.com/about-us/newsroom/thales-launches-ai-security-fabric
8. https://www.nationaldefensemagazine.org/articles/2025/12/10/new-counteruas-agency-has-world-cup-olympics-in-its-sights
9. https://www.commercialuavnews.com/droneshield-robin-radar-systems-partnership-counter-uas-sensor-marketplace
10. https://www.csoonline.com/article/570695/what-cisos-really-want-from-security-vendors.html
11. https://www.marketsandmarkets.com/ResearchInsight/physical-security-market.asp
12. https://www.armyrecognition.com/news/army-news/2026/u-s-army-awards-20b-anduril-to-deploy-lattice-ai-open-architecture-for-battlefield-integration
13. https://www.anduril.com/news/anduril-s-lattice-a-trusted-dual-use-commercial-and-military-platform-for-public-safety-security
14. https://news.clearancejobs.com/2026/03/14/anduril-wins-landmark-20b-army-contract-for-ai-enabled-operational-support/
15. https://www.gartner.com/en/documents/6967366
16. https://techfundingnews.com/verkada-reaches-5-8b-valuation-amid-rising-demand-for-ai-driven-physical-security/
17. https://securitytoday.com/articles/2026/02/12/verkada-launches-ai-powered-deterrence.aspx
18. https://dronelife.com/2025/03/20/flock-safety-secures-275m-funding-accelerates-drone-expansion-with-aerodome-acquisition-and-faa-milestone/
19. https://www.securitysales.com/news/securitas-technology-ambient-ai-partnership/617953
20. https://www.dhs.gov/sites/default/files/2024-04/24_0426_dhs_ai-ci-safety-security-guidelines-508c.pdf
21. https://www.cisa.gov/news-events/news/new-joint-guide-advances-secure-integration-artificial-intelligence-operational-technology
22. https://goabode.com/blog/home-security-insurance-discount-how-your-alarm-system-saves-you-225-per-year-2026-guide/
