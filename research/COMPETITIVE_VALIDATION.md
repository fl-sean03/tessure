# Competitive Landscape — External Validation

Performed: 2026-04-14. Validates claims in `../docs/COMPETITIVE_LANDSCAPE.md` against current public sources (2024–2026).

---

## Summary

- **Three figures in the doc are stale or wrong and need revision.** Verkada ($3B → $4.5B Series E Feb 2025, then $5.8B CapitalG Dec 2025), Ambient.ai ($110M → $146M total incl. $74M Series B Apr 2025), and Deep Sentinel ("struggling/pivoted residential" is wrong — they raised $15M Series B June 2025 and are expanding *into* commercial via SentinelNow).
- **The Dedrone/Axon price claim is unverifiable.** Terms were never publicly disclosed; the "$600M+" figure in the doc should be softened to "undisclosed."
- **SpotterRF/CGSecurity acquisition in 2024 is not confirmed by any public source found.** SpotterRF renamed to Spotter Global in 2022; no public 2024 acquisition record.
- **Anduril risk is materially higher than the doc implies.** Anduril explicitly markets Lattice for commercial critical-infrastructure today (oil/gas pipelines, wind, utilities per their own materials) and just closed a $20B Army enterprise deal (Mar 2026) plus a rumored $4B raise at $60B. "Lattice Civil" is not a rumor — the commercial-critical-infrastructure framing already exists publicly.
- **A meaningful competitor is missing from the doc: Flock Safety.** $275M raise March 2025 at $7.5B valuation, acquired Aerodome (drone) for ~$300M Oct 2024, moving aggressively beyond law enforcement into "safety technology ecosystem." Triggers kill-switch evaluation.
- **No kill-switch fires** on the strict reading (>$50M raised in last 12 months *with no differentiation from Tessure*). But Flock + Anduril commercial expansion significantly narrows the white space and should be named as top-tier watch-items.

---

## Per-company findings

### 1. Ambient.ai — REVISE

- Doc claim: "$110M+ Series B (a16z, Allegion)."
- Actual: Series B closed **April 1, 2025 for $74M** (participants include a16z, Y Combinator, WTI, Kilmahew Ventures). Total raised to date: **~$146M** across 4 rounds. [1][2]
- Customers: No specific named hyperscale/retail customers surfaced in public sources. Ambient markets heavily to data centers and Fortune-500 enterprise. The doc's claim of "hyperscale + retail wins" is directionally plausible but uncited in public material I could verify. [3][4]
- Product modality: Camera-only / computer-vision, consistent with doc. No sensor-fusion pivot detected. Recent marketing leans into "agentic physical security" and "Ambient Intelligence" models. [3][5]
- **Action:** Update funding figure to "$146M total, $74M Series B Apr 2025 at undisclosed valuation."

### 2. Verkada — REVISE (materially)

- Doc claim: "$3B valuation post-2024 secondary."
- Actual: **Series E Feb 2025 at $4.5B valuation** ($200M, General Catalyst-led). Then **$5.8B valuation Dec 2025** via CapitalG (Alphabet) investment. Total raised >$700M since founding. [6][7][8]
- Revenue: Surpassed $1B in annualized bookings (company-reported). Reported $357M revenue, 17K customers in 2024 (Latka). [6][9]
- Buyer segment: Doc says "SMB-heavy." Cloud-first/camera-first is accurate, but "mostly SMB" is increasingly contested — 17K customers spans mid-market to enterprise. Positioning as "not critical infra" is still defensible but softer than the doc implies.
- **Action:** Update valuation to "$5.8B (Dec 2025, CapitalG); $1B+ ARR." Soften "SMB-heavy" to "SMB and mid-market lean; cloud-first architecture."

### 3. Deep Sentinel — CONTRADICTED

- Doc claim: "Struggling; pivoted residential. Not a competitor now."
- Actual: **Deep Sentinel raised $15M Series B June 2025** (Egis Capital Partners-led). Total raised $54M, 98 employees (Pleasanton, CA). In 2025 launched **SentinelNow — an on-demand live-guard service explicitly targeting commercial**: office parks, medical campuses, warehouses, retailers, car dealerships, multitenant properties. [10][11]
- They are moving *toward* Tessure's adjacent markets, not retreating from them.
- **Action:** Rewrite the row. Deep Sentinel is an active commercial player with a live-guard/VaaS model, not a residential DIY also-ran. They are not a direct fusion competitor (still camera + human-guard), but they belong in Bucket 2 as "active, mid-market commercial, human-in-the-loop verification."

### 4. Echodyne — MINOR UPDATE

- Doc claim: "$65M+ (2023 round)."
- Actual: **$135M round closed 2022** (Bill Gates / Baillie Gifford-led). Total raised since founding: **~$195M**. No new public funding round announced in 2024–2025, but significant operational expansion (30,000 radar/yr factory planned for summer 2026), OpenWorks + Thales integration announced Sept 2025, European C-UAS market push. [12][13][14]
- **Action:** Update to "$195M total (last round $135M, 2022). Scaling production; partner-heavy strategy." The "OEM partner / acquisition target" framing remains sound.

### 5. Fortem Technologies — MINOR UPDATE

- Doc claim: "$80M+."
- Actual: Received additional **$10M from Lago Innovation Fund in 2024**; CEO Jon Gruen announced plans for a **$50M Series B** to expand beyond military into commercial. ~$30M revenue projected, doubling YoY. Q3 2025 doubled SkyDome orders (Europe/Middle East allied customers). [15][16][17]
- Mix: Still DoD-heavy, actively pushing into commercial. This slightly increases overlap risk with Tessure on counter-UAS commercial deployments, but Fortem is interceptor-focused (Fortem DroneHunter), not a fusion platform.
- **Action:** Keep "integrates, does not replace" posture. Note Fortem's commercial push as something to monitor.

### 6. Dedrone / Axon — PRICE UNVERIFIABLE

- Doc claim: "Acquired by Axon 2024 ($600M+)."
- Actual: Announced May 6, 2024; **closed October 2024**. **Terms not disclosed publicly** by Axon or Dedrone. Axon CEO Rick Smith stated Dedrone adds ~20% to Axon's total addressable market. [18][19][20]
- The "$600M+" figure does not appear in primary sources (Axon investor relations, Dedrone press, Menlo Ventures congratulation post). It may derive from secondary estimates or analyst speculation.
- **Action:** Change "$600M+" to "undisclosed (widely estimated $500M–$1B range)." The broader strategic point (Axon consolidates counter-UAS into law-enforcement stack) holds.

### 7. Anduril — UPGRADE RISK ASSESSMENT

- Doc claim: Anduril sells to DoD; "Lattice Civil rumored 2026."
- Actual: Anduril **already publicly markets Lattice as a dual-use commercial + military platform**, explicitly citing **critical infrastructure maintenance and protection, oil and gas pipeline monitoring, submerged power-cable inspection for wind farms** as commercial use cases. [21][22]
- **March 2026:** Awarded up to **$20B Army enterprise contract** (10-year IDIQ-style vehicle consolidating ~120 existing orders). Revenue ~$2.1B in 2025 (up 110% YoY from $1B in 2024); ~$4.3B projected 2026. Rumored **$4B round at $60B valuation**, a16z + Thrive. [23][24]
- "Lattice Civil" as a distinct branded product is not confirmed, but the civilian-adjacent framing is already public — so the doc's "speculation / watch" framing understates the reality. Anduril's primary commercial toeholds to date are border/law-enforcement, not commercial enterprise infrastructure, which preserves Tessure's wedge — but the door is visibly open and Anduril has the capital to walk through it.
- **Action:** Rewrite Anduril row to reflect: (a) they already claim commercial critical-infrastructure use cases publicly; (b) the scale ($60B rumored valuation, $20B Army deal) is an order of magnitude beyond what the doc implies; (c) the timeline pressure is real — Tessure's "move first, own the commercial data-center + utility wedge" strategy is correctly framed but more urgent.

### 8. Genetec / Milestone / Axis — MINOR UPDATE

- **Genetec:** Estimates range $323M–$500M+; doc's "~$600M" is at the high end of public estimates but not clearly sourced. Owler puts annual revenue "between $500M–$1B." ZoomInfo: ~$410M. [25]
- **Milestone:** 2024 net revenue **DKK 2B (~$290M USD)**, 18.7% growth. Canon subsidiary since 2014. Doc's "~$200M" is stale; update to ~$290M. [26][27]
- **Axis:** Canon's "Network Cameras & Others" line (which includes Axis) reported **¥357.5B (~$2.27B) in 2024**, 12.8% YoY growth. Doc's "~$1.8B" is low; ~$2.3B is closer. [28]
- Partner programs: Genetec Security Center partner program exists; Milestone XProtect open API confirmed active; Axis ACAP platform active. All three are viable integration paths. [26]
- **Action:** Revenue numbers update. Partner posture unchanged.

### 9. Hakimo / Turing AI / Actuate AI / Coram AI — REVISE

- **Hakimo:** Series A **$10.5M March 2025** (Vertex Ventures + Zigg-led). Total raised ~$20.5M. Launched "AI Operator" autonomous security agent. 100+ clients incl. Fortune 500, multifamily, car dealerships, construction. Doc's "$12M Series A (2024)" should be "$10.5M Series A March 2025, $20.5M total." [29][30]
- **Coram AI:** **$13.8M Series A Jan 2025** (Battery Ventures-led). Total $30M. Founders ex-Lyft autonomous driving. Doc's "$10M+ Seed, early-stage" understates — Series A is closed, meaningful institutional backing. [31][32]
- **Actuate AI:** **$11.5M Series A August 2024.** Total raised $23.8M. Weapon-detection focused but expanding to broader analytics. Doc's "$10M+" is right order of magnitude. [33]
- **Turing AI:** Camera-analytics company, has ~$80M in prior funding, no new 2024–2025 round surfaced in search. (Note: do not confuse with unrelated "Turing" talent/AGI company that raised $111M Series E.) [34]
- **Action:** Update Hakimo and Coram rows with specific Q1 2025 raises; note both are Series-A-funded (not seed) and moving fast.

### 10. Recent M&A / shutdowns 2024–2026 not in the doc

- **Flock Safety (MATERIAL GAP):** $275M raise March 2025 at **$7.5B valuation** (a16z-led). Acquired **Aerodome for >$300M in Oct 2024** (drone-as-first-responder). 5,000+ community customers, 70% YoY ARR growth, building 100K sqft Atlanta manufacturing plant for US-made NDAA-compliant drones. Primarily law-enforcement/public-safety today, but explicitly a "safety technology ecosystem" consolidator. [35][36][37]
- **Honeywell + Rhombus (March 2026):** Reseller + integration partnership bringing Rhombus AI cloud video + access into Honeywell's channel. Honeywell bought **LenelS2 in 2024**. Signals big-industrial consolidation of building-security AI. [38]
- **Motorola/Avigilon:** Avigilon Alta + Unity refresh (Mar 2025), $1.5B sales run-rate (as of 2022 last disclosed). Ongoing integrated-platform push ("Alta SOS"). [39]
- **Industry M&A velocity:** Per Memoori, **24 M&A transactions Sept 2023–Aug 2025** in video surveillance; $3.8B across 38 investment deals. Consolidation is accelerating. [40]
- **SpotterRF/CGSecurity 2024 acquisition (doc claim):** Not confirmed in public sources. SpotterRF renamed to Spotter Global in 2022. No 2024 acquisition announcement found. **Flag for removal or correction.** [41]

---

## Material contradictions with our positioning

Changes to make in `docs/COMPETITIVE_LANDSCAPE.md`:

1. **Bucket 2 table — Ambient.ai:** Change "$110M+ Series B (a16z, Allegion)" → "$146M total, $74M Series B Apr 2025 (a16z, YC, WTI)."
2. **Bucket 2 table — Verkada:** Change "$3B valuation post-2024 secondary" → "$5.8B valuation (Dec 2025, CapitalG); >$1B ARR. Cloud-first; SMB + mid-market."
3. **Bucket 2 table — Deep Sentinel:** Rewrite entirely. They are active, raised $15M Series B June 2025, and launched SentinelNow (commercial guard-as-a-service) in 2025. Not a retreated residential player.
4. **Bucket 2 table — Hakimo:** Update to "$10.5M Series A Mar 2025, $20.5M total. Launched autonomous AI Operator. 100+ customers."
5. **Bucket 2 table — Coram AI:** Update from "Seed, early" to "$13.8M Series A Jan 2025, $30M total. Battery Ventures-backed. Founders ex-Lyft AV."
6. **Bucket 3 table — Echodyne:** Update "$65M+ (2023)" → "$195M total ($135M 2022 round). Scaling production, no new 2024-25 round."
7. **Bucket 3 table — Dedrone/Axon:** Change "($600M+)" → "(undisclosed; estimated $500M–$1B)."
8. **Bucket 3 table — SpotterRF:** Remove "Acquired by CGSecurity 2024" claim or cite a specific source. Unverified.
9. **Bucket 1 — revenue figures:** Milestone ~$290M (not $200M), Axis ~$2.3B (not $1.8B), Genetec ~$400–500M (doc's $600M is high).
10. **Bucket 5 — Anduril:** Upgrade framing from "rumored Lattice Civil 2026" to "Anduril already publicly markets Lattice for commercial critical infrastructure (oil/gas, wind, utilities). $20B Army deal Mar 2026, rumored $60B valuation. Commercial expansion risk is real and near-term, not speculative."
11. **Add to Bucket 2 (or new 'Consolidators' bucket): Flock Safety.** $7.5B valuation, $275M raise Mar 2025, drone acquisition (Aerodome $300M+). Primarily law-enforcement today but aggregating the "public safety + AI" stack. Watch closely.

---

## Kill-switch check

Playbook test: "direct competitor both dominant (>$50M funding in last 12mo) with no differentiation from Tessure."

| Candidate | Funding last 12mo | Differentiation gap? | Kill-switch? |
|---|---|---|---|
| **Ambient.ai** | $74M Series B Apr 2025 | Camera-only, cloud-leaning, no radar fusion, no evidence-grade chain-of-custody. Tessure's multi-modal + edge-first + VMS-agnostic differentiation holds. | **No.** |
| **Verkada** | $200M Series E Feb 2025 + CapitalG Dec 2025 | Cloud-first, camera-first, hostile to on-prem fusion. Different buyer segment (SMB/mid-market). | **No.** |
| **Anduril** | $20B Army contract Mar 2026; rumored $4B round at $60B | Defense-first GTM; commercial critical-infra toolkit exists but not productized for civilian enterprise procurement. **Closing window.** | **Not yet.** Monitor closely; 6–12 month urgency signal. |
| **Flock Safety** | $275M Mar 2025 at $7.5B | Law-enforcement and municipal-first GTM. Not a multi-modal fusion platform (LPR + cameras + drones). Different buyer (city/PD vs. enterprise security). | **No** — but rising. |
| **Hakimo** | $10.5M Mar 2025 | Below $50M threshold. SMB focus. | **No.** |
| **Coram AI** | $13.8M Jan 2025 | Below threshold. Cloud VMS + analytics. | **No.** |
| **Deep Sentinel** | $15M Jun 2025 | Below threshold. Human-guard-in-the-loop, not sensor fusion. | **No.** |

**Regulatory / market shift check:**
- **NERC CIP-014** tightening: tailwind for Tessure (confirmed in doc).
- **TSA pipeline directives** iterating: tailwind.
- **Drone threat environment** post-2024 (NJ drone flap, overseas UAV strikes): tailwind for fusion-including-radar.
- **Cloud-video growth 20%+ CAGR through 2029** (Omdia): headwind against edge-first positioning — need to articulate why edge matters for the specific verticals (latency, airgap, NERC CIP, data sovereignty).

**Kill-switch outcome: NO TRIGGER.** The dominant well-funded competitors (Ambient, Verkada, Flock, Anduril) each have a clear differentiation gap from Tessure's positioning (multi-modal fusion + edge-first + VMS-agnostic overlay + evidence-grade chain of custody + commercial critical-infra buyer). The white space is real but narrower than the doc frames it. **Anduril is the top watch-item**; speed-to-entrenchment in 3–5 lighthouse accounts over the next 12 months is the defensible moat, not IP.

---

## Sources

1. PitchBook — [Ambient.ai Company Profile 2025](https://pitchbook.com/profiles/company/182919-97)
2. PYMNTS — [Ambient.ai Series B $74M April 2025](https://www.pymnts.com/news/investment-tracker/2025/ambient-raises-74-million-to-build-blockchain-replacement-for-bitcoin/) (note: PYMNTS article conflates multiple "Ambient"s; cross-ref with Crunchbase / Wellfound)
3. Ambient.ai — [Data Centers Solutions page](https://www.ambient.ai/solutions/data-centers)
4. Ambient.ai — [Ambient Intelligence press announcement](https://www.ambient.ai/press/ambient-unveils-ambient-intelligence)
5. Ambient.ai — [Platform overview](https://www.ambient.ai/platform-overview)
6. Fortune — [Verkada's $200M Series E at $4.5B valuation](https://fortune.com/2025/02/19/exclusive-verkadas-200-million-series-e-values-the-company-at-4-5-billion/)
7. CNBC — [Verkada hits $5.8B valuation, CapitalG-led](https://www.cnbc.com/2025/12/03/verkada-capitalg-valuation-security.html)
8. Security Systems News — [Verkada reaches $5.8B valuation CapitalG](https://www.securitysystemsnews.com/article/verkada-reaches-5-8b-valuation-with-investment-from-capitalg)
9. Latka — [Verkada $357M revenue, 17K customers 2024](https://getlatka.com/companies/verkada)
10. PR Newswire — [Deep Sentinel $15M Series B June 2025](https://www.prnewswire.com/news-releases/deep-sentinel-secures-15-million-in-series-b-funding-to-accelerate-ai-powered-security-growth-302471838.html)
11. Security Systems News — [Deep Sentinel launches SentinelNow](https://www.securitysystemsnews.com/article/deep-sentinel-launches-sentinelnow)
12. GeekWire — [Echodyne $135M round 2022](https://www.geekwire.com/2022/echodyne-radar-venture-flies-higher-with-135m-funding-round-led-by-bill-gates-and-baillie-gifford/)
13. BriefGlance — [Echodyne new factory 30K radars/yr](https://briefglance.com/articles/echodynes-new-factory-to-build-30000-radars-annually-amid-drone-threat)
14. Echodyne — [OpenWorks Vision Pace partnership Sept 2025](https://www.echodyne.com/resources/news-events/openworks-selects-echodyne-radar-to-launch-kinetic-threat-targeting-capability/)
15. Fortem Technologies — [Momentum into 2025 press release](https://fortemtech.com/press-releases/2025-02-11-fortem-technologies-builds-massive-momentum-entering-2025-solidifying-leadership-in-counter-uas-and-airspace-defense/)
16. Unmanned Airspace — [Fortem $50M Series B plans](https://www.unmannedairspace.info/counter-uas-systems-and-policies/fortem-technologies-plans-to-raise-usd50-million-in-series-b-funding-to-support-expansion/)
17. Unmanned Airspace — [Fortem $17.8M aerospace partners](https://www.unmannedairspace.info/counter-uas-systems-and-policies/c-uas-company-fortem-attracts-usd17-8-million-in-new-funding-from-major-aerospace-companies/)
18. Axon — [Axon completes acquisition of Dedrone](https://www.axon.com/blog/axon-completes-acquisition-of-dedrone)
19. Axon IR — [Axon to acquire Dedrone May 2024](https://investor.axon.com/2024-05-06-Axon-to-acquire-Dedrone,-accelerating-the-next-generation-of-drone-solutions-to-protect-more-lives-in-more-places)
20. CNBC — [Taser-maker Axon acquiring Dedrone](https://www.cnbc.com/2024/05/06/taser-maker-axon-is-acquiring-air-defense-startup-dedrone.html)
21. Anduril — [Lattice: a Trusted Dual-Use Platform for Public Safety and Defense](https://www.anduril.com/news/anduril-s-lattice-a-trusted-dual-use-commercial-and-military-platform-for-public-safety-security)
22. Privacy International — [Dual-use tech: the Anduril example](https://privacyinternational.org/report/5704/dual-use-tech-anduril-example)
23. Breaking Defense — [Army awards Anduril $20B contract vehicle](https://breakingdefense.com/2026/03/army-awards-anduril-counter-drone-task-order-as-first-in-new-20b-contract-vehicle/)
24. Army Recognition — [US Army Awards $20B Anduril Lattice AI](https://www.armyrecognition.com/news/army-news/2026/u-s-army-awards-20b-anduril-to-deploy-lattice-ai-open-architecture-for-battlefield-integration)
25. Owler — [Genetec company profile](https://www.owler.com/company/genetec)
26. Milestone Systems — [Annual report 2024: DKK 2B revenue](https://www.milestonesys.com/company/news/press-releases/2024-annual-report/)
27. PRWeb — [Milestone DKK 2B / $290M USD net revenue 2024](https://www.prweb.com/releases/annual-report-2024-milestone-reaches-dkk-2-billion-mark---290-million-usd-in-net-revenue-302413476.html)
28. Memoori — [Axis Communications 7.4% revenue growth 2024](https://memoori.com/axis-communications-reports-strong-revenue-growth-2024/)
29. Hakimo — [$10.5M Series A March 2025](https://www.hakimo.ai/blog/hakimo-secures-10-5m-series-a-to-launch-ai-operator-redefining-physical-security)
30. VentureBeat — [Hakimo $10.5M autonomous security](https://venturebeat.com/ai/the-watchful-ai-that-never-sleeps-hakimos-10-5m-bet-on-autonomous-security)
31. BusinessWire — [Coram AI $13.8M Series A Jan 2025](https://www.businesswire.com/news/home/20250115943800/en/Coram-AI-Raises-$13.8-Million-in-Series-A-Funding-to-Bring-AI-to-Video-Security-Boosting-Workplace-Safety-and-Efficiency)
32. Battery Ventures — [Coram portfolio](https://www.battery.com/company/coram/)
33. Tracxn — [Actuate $11.5M Series A August 2024](https://tracxn.com/d/companies/actuate/__wFEtPFOslxGOhykXLkqpZ2Lv0zueT1GHYl-gCVEfWG8)
34. Tracxn — [Turing AI camera analytics company](https://tracxn.com/d/companies/turingai/__ShGKPClPFmwpz6cpSxrtV2gRJwIFjtCqSdDukX3cyak)
35. SiliconANGLE — [Flock Safety $275M at $7.5B valuation](https://siliconangle.com/2025/03/13/surveillance-tech-startup-flock-safety-scores-275m-new-funding-bringing-value-7-5b/)
36. TechCrunch — [Flock paid >$300M for Aerodome](https://techcrunch.com/2024/10/23/flock-safety-paid-over-300-million-for-17-month-old-drone-startup-aerodome/)
37. DroneLife — [Flock Safety Aerodome acquisition Oct 2024](https://dronelife.com/2024/10/16/flock-safety-expands-capabilities-with-acquisition-of-aerodome/)
38. Honeywell — [Honeywell + Rhombus AI cloud video partnership Mar 2026](https://www.honeywell.com/us/en/press/2026/03/honeywell-and-rhombus-introduce-ai-driven-cloud-video-and-access-solution-to-modernize-building-security)
39. BC Technology — [Avigilon $1.5B sales run-rate post-Motorola](https://www.bctechnology.com/news/2025/7/4/Avigilon-Hits-1.5-Billion-Sales-Run-Rate-Post-Motorola-Acquisition-Expands-Enterprise-Security-Suite.cfm)
40. Memoori — [Video Surveillance Global Market Research 2025-2030](https://memoori.com/portfolio/global-video-surveillance-business-2025-2030/)
41. Spotter Global — [About us (renamed from SpotterRF 2022)](https://www.spotterglobal.com/aboutus)
