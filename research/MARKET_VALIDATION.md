# Market & Regulatory Validation

Performed: 2026-04-14. Validates claims across `../docs/` strategy set (STARTUP_BRIEF.md, CUSTOMER_SEGMENTS.md, OPERATIONS_AND_COSTS.md, GO_TO_MARKET.md). Budget: ~30 min agent time, 2-3 sources per claim.

## Summary

- Most industry-statistic claims in the brief are directionally defensible but some are stated with more precision than public sources support. False-alarm rate, cargo-theft cost scale, substation-attack incident set, and regulatory framings hold up well.
- **Three claims need revision.** The "~30% guard wage rise since 2020" overstates — BLS/CAP data show real wages flat over two decades, with nominal rises but not 30%. The "ORCA $100B/yr by 2025" number conflates total retail shrink ($112B, 2022) with organized retail crime; confirmed cargo-theft record is $725M (Verisk CargoNet 2025). The "~55,000 NERC sites" is a transmission-substation count; the regulated CIP-014 population is only ~1,500 sites — a 37x narrower TAM for the compliance-driven wedge.
- Substation-attack anchor events (Metcalf 2013, Moore County Dec 2022, Tacoma/Pierce County Dec 2022, Florida Duke intrusions) are all **confirmed**, though the "Florida Duke 2023" citation is actually Sept 2022 — date is wrong in the brief.
- Regulatory landscape is real and active: NERC CIP-014-4 revision in progress (Board adoption anticipated April 2025, now CIP-014-4 live cycle), TSA SD02F effective May 3, 2025, EU AI Act high-risk rules live Aug 2, 2026, BIPA softened by 2024 amendment but still litigated. No regulatory blocker identified for Tessure's overlay, on-prem posture.
- **No kill-switch tripped.** Problem is externally evidenced; no regulation prohibits the product category. Strongest external challenge is reputational risk from BIPA-style biometric litigation in states with private rights of action — mitigated by on-prem processing and masked-identity defaults (already in brief's "Category-critical items").

## Claim-by-claim findings

### Industry statistics

**1. "97-99% false-positive rates on standalone motion/analytics systems."**
- Directionally **confirmed**, though vendor-sourced. Industry commentary cites 94-98% of alarm activations as false positives (source [1], [2]), and multiple AI-analytics vendors (Scylla, Ambient.ai, Lumana) anchor their pitch on "99% of alerts irrelevant" for legacy motion-based systems. No peer-reviewed study behind the 97-99% band.
- Recommend reframing as "industry commentary routinely cites 94-99% false-positive rates" and cite IFSEC/Scylla or Ambient rather than asserting a hard number.

**2. "Single false guard/LE dispatch costs $150-$400."**
- **Confirmed** as a fine/fee proxy but conflates two things. Police response cost is ~$130 per call (Newswise/Urban Institute, [3][4]); fire response ~$410 per truck. Municipal fine schedules (Cincinnati, Plantation FL, Salt Lake City) escalate $150 → $500+ for repeat offenders ([5][6]). The $150-$400 band is defensible if framed as "direct fines + operational cost after first 1-2 nuisance events," not "true marginal cost of every dispatch."

**3. "Security guard wages risen ~30% since 2020."**
- **Contradicted** by BLS and Center for American Progress. Real (inflation-adjusted) wages flat for 20 years: median security worker earned $17.05/hr in 2003 (2024 dollars) vs. $17.03/hr in 2022 ([7]). Nominal BLS median May 2024: $38,370/yr ($18.46/hr) ([8]). Security Magazine 2024 Annual Guarding Report does note 61% of operators cite "rising hourly pay rates" as top operational challenge ([9]) — but this is a pricing/inflation pressure claim, not a 30% wage hike.
- **Recommend revision:** "Nominal guard wages + labor-cost pass-through have risen at or above CPI since 2020, and 61% of guard-force operators cite rising pay rates as their top operational challenge (2024 Security Magazine)."

**4. "Guard retention sub-50%."**
- **Confirmed and conservative.** US security industry annual turnover hit 50.8% in 2023 (vs. 38.4% national workforce). Contract security firms often report 80%+; industry commentary cites 100-300% national rates ([10][11]). ASIS cites turnover as top challenge for 40%+ of security providers. Brief understates; could say "50-80% at contract guard firms, with some segments at 100%+".

**5. "ORCA (organized retail crime + cargo theft) $100B/yr by 2025."**
- **Partially contradicted.** The $100B number appears to conflate several figures and lacks a clean source.
  - Total US retail shrink: $112B in 2022 (NRF, [12]) — but shrink is all loss, not ORC. NRF was publicly forced in 2023 to retract a stat that attributed ~50% of shrink to ORC ([13]).
  - Cargo theft specifically: $725M in 2025 (Verisk CargoNet, [14][15]), up 60% YoY; 3,594 events. Some industry estimates put broader supply-chain cargo crime at $15-35B/yr ([16]).
  - Rail cargo theft: $100M+ in 2024 ([16]).
- **Recommend revision:** drop the "$100B" figure. Use Verisk CargoNet's $725M (2025, record) + NRF retail shrink $112B as separate, cited numbers. The ORCA framing remains valid; the dollar figure does not.

**6. Municipal false-alarm fine amounts (Salt Lake City, Las Vegas, others).**
- **Confirmed.** Salt Lake City: $150 for unpermitted duress/panic/holdup alarm response, plus 10% late fee after 60 days ([17]). Cincinnati escalates $150 (6th) → $800 (11th+) ([18]). Plantation FL: $150 → $500. Las Vegas: historically "non-response" policy if 4+ false alarms/month for 2 consecutive months (since 1991) — an even stronger economic incentive than fines ([19]). LV's verified-response posture is actually the source of the "verified response" language Tessure uses.

### Substation attacks / physical-infra incidents

**7. Metcalf substation attack (April 16, 2013).** **Confirmed.** San Jose PG&E substation, 17 transformers damaged, 100+ .30-cal rounds, $15M equipment damage, $100M PG&E response investment, no arrests as of 2023 ([20]).

**8. Moore County NC substation (Dec 3, 2022).** **Confirmed.** Two Duke Energy substations (West End, Carthage), 40,000 customers without power, 1 death (Karin Zoanelli, ruled homicide Aug 2023), no arrests, $100k reward outstanding ([21]).

**9. Tacoma WA substation (Dec 2022).** **Confirmed with detail.** Christmas Day 2022, four Pierce County substations attacked (2 Tacoma Power: Graham/Elk Plain; 2 Puget Sound Energy: Kapowsin/Hemlock). ~14,000-17,000 customers affected. Greenwood and Crahan arrested Dec 31, 2022, later convicted ([22][23]). Motive: disable power to enable ATM/business burglary. Tacoma Power damage alone $3M+.

**10. Duke Energy FL (2023).** **Date wrong in brief.** Public reporting shows Duke Energy Florida intrusions occurred Sept 10-22, 2022 (Bay Ridge x2, Orange Blossom, Zephyrhills, East Clearwater, Zephyrhills North) — six intrusions total over ~two weeks ([24]). Attackers had apparent insider knowledge of grid operations. **Recommend correction: "FL Duke 2022 intrusions" not "FL Duke 2023".**

**11. E-ISAC / CISA bulletins on physical-attack trends.** **Confirmed.** 2024 E-ISAC end-of-year figures: >3,500 physical security breaches, ~3% disrupted electricity, up from 2,800 in 2023 ([25]). Western Interconnection alone had 220 physical security incidents in 2024 via DOE-417 reporting ([26]). Consistent upward trend since 2016.

### Regulatory landscape

**12. NERC CIP-014 current version.** Revision active: CIP-014-4 Draft 2 posted Sept 2024 with 45-day comment/ballot; Draft 3 redline June 2025; Board adoption anticipated April 4, 2025 ([27][28]). Brief's "revision cycle (every 3 years)" framing holds. CIP-014 today applies to ~1,500 substations/control centers after the industry's risk-assessment process (not 55,000 — see claim 18).

**13. TSA Pipeline Security Directive SD-02 series.** **Confirmed and updated.** SD02E effective July 27, 2024 - July 27, 2025. SD02F effective May 3, 2025, expires May 2, 2026 ([29][30]). SD02F introduces "Cybersecurity Assessment Plan" with 30%/year rolling-evaluation requirement and mandatory IR plan testing. TSA also has 2024 Notice of Proposed Rulemaking to formalize directives into regulation.

**14. EU AI Act — physical security implications.** **Confirmed and material.** AI Act entered into force Aug 1, 2024. Prohibited practices (including real-time remote biometric identification in public for LE, with narrow exceptions) live Feb 2, 2025. High-risk rules — which explicitly include biometrics and critical infrastructure AI — live Aug 2, 2026 for standalone systems, Aug 2, 2027 for AI embedded in regulated products ([31][32]). Tessure's on-prem + masked-identity defaults map cleanly to high-risk compliance posture; EU sales require Annex III-aware build.

**15. Illinois BIPA — commercial surveillance.** **Applies, but softened in 2024.** Illinois amended BIPA Aug 2024: repeated scans via same method count as single violation (not per-scan). 7th Circuit held April 1, 2026 that amendment applies retroactively ([33][34]). BIPA class action filings dropped from 300/yr to ~150 in 2025. BIPA still applies to any biometric identifier (facial, fingerprint, iris) collected in Illinois — Lytx dashcam case ($4.25M settlement) is a direct analogue for our segment. Recommend: keep "masked identities until verified threat" as a default, document consent flow for any biometric-identification mode.

**16. California CCPA/CPRA — commercial surveillance.** **Applies.** CPRA (effective Jan 1, 2023) extended consumer protections to employees. Employers must notify categories of PI collected (including biometric, geolocation, monitoring-software data) and honor access/deletion requests ([35]). New CPPA regulations on automated decision-making, risk assessments, and cybersecurity audits effective Jan 1, 2026. Tractor Supply $1.35M CPPA decision (2025) is first enforcement touching employment data. Material for any data-center / logistics deployment in CA.

**17. Pending US federal commercial-surveillance legislation 2025-2026.** **Largely dormant.** American Privacy Rights Act (APRA, H.R. 8818) died at end of 118th Congress Jan 2025; not reintroduced as of Feb 2026 ([36]). Protecting Americans' Privacy Act (S. 490, 119th Congress) is a narrower reintroduction. State-by-state regime continues: ~20 states / half of US population under a comprehensive privacy law by 2026. **No imminent federal pre-emption** — Tessure must plan for state patchwork.

### Market-size claims

**18. "~55,000 NERC-registered utility sites in US."**
- **Technically accurate number, misleading as TAM.** There are ~55,000 transmission substations (>100 kV) in North America ([37]). But the CIP-014 physical-security standard applies to only ~1,500 of them after the industry's risk-assessment filter (vs. initial projection of ~500). If Tessure's wedge is CIP-014 compliance, **the regulated population is 1,500 sites, not 55,000** — a 37x haircut on that specific TAM lens.
- Non-CIP-014 substations are still addressable but on ROI/insurance logic, not mandatory compliance.

**19. "~3,500 US colocation + hyperscale data center campuses."**
- **Overstates.** Globe Newswire Aug 2025 "US Data Center Database 2025": 1,121 existing colocation + 385 upcoming colo + 152 hyperscale = ~1,658 current operating facilities ([38]). Data Center Map cites 4,148 facilities from 1,826 operators (broader definition, includes all data-holding facilities, enterprise, edge, telco POPs). Brightlio: 5,426 US data centers total (all types) as of March 2025 ([39]). Data Center Frontier: US = ~half of ~1,000 global hyperscale campuses.
- **Recommend revision:** "~1,500-1,700 US colocation + hyperscale campuses" is defensible. "~3,500" is only defensible if Tessure counts enterprise edge / telco POPs — which are rarely high-ACV accounts.

**20. "~8,000 US Class I + II logistics yards."**
- **Cannot confirm exact number.** BTS/IANA data: ~2,270 US rail facilities with intermodal capability, but only ~200 are true intermodal container terminals handling significant volume; 7 Class I railroads dominate ([40]). Prologis alone operates 6,000+ buildings globally (not all US, not all yards) ([41]). "~8,000 US Class I + II logistics yards" likely conflates rail yards with broader intermodal + port + distribution-center yards.
- **Recommend revision:** separate the number into rail (~200-400 true terminals), port (~360 US ports, ~50 major), 3PL distribution yards (~15-20k nationwide per NAIOP industrial census, most small). If brief means "large secured yards worth $40-150k ACV," ~8k is plausible but not sourced.

**21. Physical security market size estimates.**
- Multiple analyst estimates for **2024**: $131.6B (IMARC), $139.4B (DataBridge), $147.4B (Grand View), $151.5B (Market Research Future) ([42][43][44][45]).
- **2025**: $120.8B (MarketsandMarkets, Fortune Business Insights) to $158.1B (Grand View) to $153.2B (Straits).
- Memoori and Frost & Sullivan data not open-web accessible in this search — would need paid access.
- **Rough consensus: ~$130-150B global physical security market, 2024-2025.** Brief's TAM framing is consistent with analyst consensus as long as Tessure is clear it targets a subset (verified-event fusion) not the full hardware+services spend.

## Material contradictions with our positioning

- **Guard wage claim (30% since 2020)** is the most exposed claim to adversarial fact-check. BLS and CAP data flatly contradict in real terms. Keep the labor-economics argument (shortage, turnover, cost-pass-through) but drop the specific 30% number.
- **ORCA $100B figure** will be caught by any L&D buyer who reads NRF primary sources. NRF retracted a similar-shaped claim in 2023. Use Verisk CargoNet $725M (2025) and NRF shrink $112B (2022) separately.
- **"~3,500 data center campuses" and "~55,000 utility sites" overstate the realistic TAM** for Tessure's wedge. 1,500-1,700 campuses and 1,500 CIP-014 sites are the credible numbers for compliance- and large-campus-driven selling. Enterprise overlay TAM is larger but not backed by the specific counts used.
- **"FL Duke 2023"** substation attack reference should be "FL Duke Sept 2022 intrusions" — minor but a due-diligence reader will catch it.

## Kill-switch check

- **Is the problem real?** Yes. E-ISAC documents 3,500+ physical-security incidents in 2024, steadily rising since 2016. Verisk CargoNet $725M cargo theft record. NERC CIP-014 revision cycle active. Multiple confirmed multi-substation attacks (Metcalf, Moore County, Tacoma, FL Duke intrusions) within the past decade. **Not killed.**
- **Is there a regulatory blocker with no path around?** No. EU AI Act high-risk category is a compliance cost, not a prohibition (prohibited list is narrow: real-time LE biometric ID in public). BIPA was softened in 2024 and is litigated but manageable with consent + masked-identity defaults. CCPA/CPRA is disclosure + opt-out, not prohibition. No federal pre-emption imminent. **Not killed.**
- **Conclusion: no kill-switch tripped.** Thesis remains credible; strengthen by fixing the three weak claims above.

## Sources

1. [IFSEC Insider — 93% of firms reporting excess CCTV false alarms](https://www.ifsecglobal.com/video-surveillance/93-of-firms-reporting-excess-of-cctv-false-alarms-linked-to-poor-installation-or-maintenance/)
2. [Scylla AI — False Alarm Filtering](https://www.scylla.ai/false-alarm-filtering/)
3. [Newswise — Police Response to False Alarms Comes at an Alarming Cost](https://www.newswise.com/articles/police-response-to-false-alarms-comes-at-an-alarming-cost)
4. [Urban Institute — Reducing False Alarms (PDF)](https://www.urban.org/sites/default/files/alfresco/publication-pdfs/412729-Opportunities-for-Police-Cost-Savings-Without-Sacrificing-Service-Quality-Reducing-False-Alarms.PDF)
5. [Deep Sentinel — False Alarm Fines in Major U.S. Cities](https://www.deepsentinel.com/blogs/home-security/false-alarms-fines/)
6. [Cincinnati Police — False Alarm Reduction Unit](https://www.cincinnati-oh.gov/police/special-events-permits-regulations-auctions/false-alarm-reduction-unit/)
7. [Center for American Progress — Low Standards Hurt Security Officers](https://www.americanprogress.org/article/low-standards-hurt-security-officers-ability-to-make-ends-meet/)
8. [BLS Occupational Outlook Handbook — Security Guards](https://www.bls.gov/ooh/protective-service/security-guards.htm)
9. [Belfry Software — Security Guard Salary Guide 2025](https://www.belfrysoftware.com/blog/security-guard-salary)
10. [ASIS International — Guarding Companies Face the Challenge of High Turnover (Oct 2025)](https://www.asisonline.org/security-management-magazine/latest-news/today-in-security/2025/october/guard-force-turnover/)
11. [Belfry Software — Security Guard Turnover Industry Rates](https://www.belfrysoftware.com/blog/security-guard-turnover)
12. [NRF — Shrink Accounted for Over $112 Billion in Industry Losses in 2022](https://nrf.com/media-center/press-releases/shrink-accounted-over-112-billion-industry-losses-2022-according-nrf)
13. [Fortune — NRF forced to correct inaccurate ORC report (2023)](https://fortune.com/2023/12/08/national-retail-federation-report-inaccurate/)
14. [Verisk CargoNet — Cargo Theft Losses $725M in 2025](https://www.verisk.com/company/newsroom/cargo-theft-losses-surge-to-estimated-$725-million-in-2025-verisk-cargonet-analysis-reveals/)
15. [Carrier Management — Cargo Theft Surged 60% in 2025](https://www.carriermanagement.com/news/2026/01/22/283728.htm)
16. [RILA — Organized Retail Crime and Cargo Theft](https://www.rila.org/blog/2025/05/organized-retail-crime-and-cargo-theft-and-the-urg)
17. [SLC Code 5.09.060 — Notice and Service Fees for Repeated False Alarms](https://codelibrary.amlegal.com/codes/saltlakecityut/latest/saltlakecity_ut/0-0-0-46215)
18. [Cincinnati Police — False Alarm Reduction Unit](https://www.cincinnati-oh.gov/police/special-events-permits-regulations-auctions/false-alarm-reduction-unit/)
19. [Security Sales & Integration — Las Vegas Police No-Response Policy](https://www.securitysales.com/news/las-vegas-police-put-their-chips-on-the-table-with-no-response-policy/51716/)
20. [Wikipedia — Metcalf sniper attack](https://en.wikipedia.org/wiki/Metcalf_sniper_attack)
21. [Wikipedia — Moore County substation attack](https://en.wikipedia.org/wiki/Moore_County_substation_attack)
22. [DOJ Western District of Washington — Two charged with attacks on four Pierce County power substations](https://www.justice.gov/usao-wdwa/pr/two-charged-attacks-four-pierce-county-power-substations)
23. [Utility Dive — Puget Sound Energy, Tacoma Power substations damaged in Christmas Day attacks](https://www.utilitydive.com/news/puget-sound-energy-tacoma-power-substations-attack-christmas/639467/)
24. [NewsNation — Report shows 6 intrusions at Duke Energy power stations in Florida (Sept 2022)](https://www.newsnationnow.com/us-news/power-grid-attacks/report-shows-intrusions-at-6-power-stations-in-florida/)
25. [RTO Insider — E-ISAC Reports on Cyber, Physical Threats](https://www.rtoinsider.com/104750-e-isac-reports-cyber-physical-threats/)
26. [WECC — SOTI 2025 Security](https://feature.wecc.org/soti2025/soti2025/security/index.html)
27. [NERC CIP-014-4 Draft 2 (Sept 2024)](https://www.nerc.com/globalassets/standards/projects/2023-06/2023-06-cip-014-4_clean_09232024.pdf)
28. [NERC CIP-014-4 Draft 3 redline (June 2025)](https://www.nerc.com/globalassets/standards/projects/2023-06/cip-014-4_redline-to-last-approved-06062025.pdf)
29. [TSA Security Directive Pipeline-2021-02F (May 2025)](https://www.tsa.gov/sites/default/files/tsa-security-directive-pipeline-2021-02f-and-memo-508c.pdf)
30. [Dragos — TSA Releases Updated Pipeline Security Directive SD02F](https://www.dragos.com/blog/us-transportation-security-administration-releases-updated-pipeline-security-directive-key-revisions-and-compliance-strategies/)
31. [EU AI Act — Annex III High-Risk AI Systems](https://artificialintelligenceact.eu/annex/3/)
32. [European Commission — AI Act Navigating FAQ](https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act)
33. [WilmerHale — Year in Review: 2024 BIPA Litigation Takeaways](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20250219-year-in-review-2024-bipa-litigation-takeaways)
34. [Fisher Phillips — BIPA Damages Limit Applies Retroactively](https://www.fisherphillips.com/en/insights/insights/major-biometric-win-for-business-in-illinois)
35. [UC Berkeley Labor Center — New CCPA Rights for Workers](https://laborcenter.berkeley.edu/overview-of-new-rights-for-workers-under-the-california-consumer-privacy-act/)
36. [Wikipedia — American Privacy Rights Act](https://en.wikipedia.org/wiki/American_Privacy_Rights_Act)
37. [Huntress — NERC CIP-014 Standard Explained](https://www.huntress.com/blog/nerc-cip-014-standard-explained)
38. [Globe Newswire — US Data Center Database 2025](https://www.globenewswire.com/news-release/2025/08/22/3137734/28124/en/United-States-Data-Center-Database-2025-Covering-1-121-Existing-and-385-Upcoming-Colocation-Centers-Plus-152-Hyperscale-Data-Centers-Across-50-States.html)
39. [Brightlio — 255 Data Center Stats (March 2026)](https://brightlio.com/data-center-stats/)
40. [Transport Geography — Intermodal Rail Terminals North America](https://transportgeography.org/contents/chapter6/rail-terminals/intermodal-rail-terminals-north-america/)
41. [Wikipedia — Prologis](https://en.wikipedia.org/wiki/Prologis)
42. [Grand View Research — Physical Security Market](https://www.grandviewresearch.com/industry-analysis/physical-security-market)
43. [IMARC — Physical Security Market](https://www.imarcgroup.com/physical-security-market)
44. [MarketsandMarkets — Physical Security Market](https://www.marketsandmarkets.com/Market-Reports/physical-security-market-1014.html)
45. [Fortune Business Insights — Physical Security Market](https://www.fortunebusinessinsights.com/physical-security-market-108781)
