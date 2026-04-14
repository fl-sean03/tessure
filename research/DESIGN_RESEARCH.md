# Design Research

Performed: 2026-04-14. Brief input for the Phase 8 Tessure site v2 rebuild.

## Summary

Tessure v1 opens with a Three.js scenario demo as the hero, which reads as "capability showcase" rather than "product statement" and forces first-time visitors to decode the product from motion. The reference set makes it clear the v2 site should invert the sequence: lead with a declarative category line + a calm, static (or near-static) hero, then earn the interactive demo further down as a proof artifact. Across the aspirational set (Stripe, Linear, CrowdStrike, Cloudflare, Vercel), the playbook is remarkably consistent — confident headline, restrained accent color, logo wall within the first two viewports, product-module grid, proof rail (analyst + customer + stats), and a crisp closing CTA. Tessure v2 should borrow that cadence wholesale, keep Trust Blue as the only brand accent, stay in the light theme by default, and move the demo to a dedicated `/demo` route the way Stripe quarantines its interactive examples.

## Per-site analysis

### 1. Stripe (stripe.com) — primary template

- **Hero:** Declarative category line — "Financial infrastructure to grow your revenue" — with a two-line subhead and two CTAs ("Get started" primary, "Sign up with Google" secondary). Background is a subtle animated gradient wave (fallback PNG, not heavy 3D). Above-the-fold is mostly white space + type; the wave is decoration, not content.
- **Section order (top to bottom):**
  1. Sticky top nav + sign-in
  2. Hero (headline, subhead, CTAs, gradient wave)
  3. Customer logo carousel (Amazon, Shopify, Nvidia, Ford, Google…)
  4. "Flexible solutions for every business model" overview band
  5. Product grid (Payments, Billing, Card Issuing, Crypto, Connect)
  6. "Backbone of global commerce" stats band ($1.9T processed, 99.999% uptime, 200M+ subscriptions)
  7. Enterprise case-study carousel (Hertz, URBN, Instacart, Le Monde)
  8. Startups / portfolio section
  9. Platforms / SaaS testimonials
  10. Developer infrastructure section
  11. News / "What's happening" carousel
  12. Footer (tall, tri-column links + legal)
- **Color palette:** White primary background, Stripe Blurple (`#635BFF`) as brand accent, charcoal body text (~`#425466`), slate headings (~`#0A2540`), muted grays for borders. Green success accents used in product visuals. Dark bands appear occasionally for case studies (high-contrast content sections on near-black).
- **Typography:** Stripe's custom variable font ("Sohne" / "Stripe Sans") — geometric sans, similar register to Inter. H1 ~56–64 px, tight leading. Body 16–18 px, generous line-height. Weights 400/500/600.
- **Navigation:** Sticky, minimal chrome. 5 primary items (Products, Solutions, Developers, Resources, Pricing) + Sign in / Contact sales. Mega-menu on hover.
- **Scroll behavior:** Normal scroll. No scroll-jacking. Carousels advance on scroll but the page itself never hijacks. Cards fade/lift subtly on intersection.
- **Signature moves:** (1) The gradient wave — a signed visual ID that reads as "infrastructure fabric," not decoration; (2) stat-stack sections ("$1.9T", "99.999%", "200M+") with minimal styling that function as proof anchors; (3) paired testimonial cards with executive headshots + logo + metric.
- **Proof artifacts:** Logos (Amazon, Shopify, Figma, Anthropic, OpenAI, Uber), stats ("50% of Fortune 100"), named case studies, press bar. No analyst badges (Stripe doesn't need them).
- **Mood:** Calm, authoritative, infrastructure-as-luxury — "we are the plumbing; you cannot see around us."

### 2. Linear (linear.app) — secondary template

- **Hero:** Headline "The system for product development" (or similar current variant), paired with a floating high-fidelity app mockup (dark) showing real UI — issues, cycles, triage view. Below: "Get started" primary + "Talk to sales" secondary.
- **Section order:** Hero → app mockup → "Plan, build, and ship" tri-pillar → feature deep-dives with staged screenshots (Issues, Cycles, Projects, Roadmap) → customer logo strip → integrations grid → testimonial pull-quotes → pricing teaser → footer.
- **Color palette:** Dark-first (`#08090A` near-black background), white text (`#F7F8F8`), muted grays for secondary text. Accent: Linear Indigo/Violet (`#5E6AD2`) used sparingly — buttons, highlights, subtle glows. Green and red as status only.
- **Typography:** Inter Display (custom Inter variant tuned for headlines) + Inter for body. H1 ~72 px, tight tracking (-2% to -3%), weight 500 for headlines — notably *not* bold. Body 16 px, 1.5 line-height. Mono accents in UI details.
- **Navigation:** Sticky, translucent with backdrop blur. 5 primary items (Product, Method, Customers, Pricing, Company). Mega-menu for Product.
- **Scroll behavior:** Normal scroll with subtle scroll-triggered reveals — mockups slide in, dot-grid patterns animate (visible in their CSS: `grid-dot-*-agent`, `grid-dot-*-upDown` keyframes). No scroll-jack.
- **Signature moves:** (1) The floating app mockup — the product UI *is* the hero visual, never abstract illustration; (2) animated dot-grid backgrounds that suggest "system," not decoration; (3) keyboard-shortcut callouts (⌘K, G+I) that signal "built for operators."
- **Proof artifacts:** Customer logos (OpenAI, Vercel, Ramp, Cash App, Raycast, Perplexity), quote testimonials with role + company, no analyst badges.
- **Mood:** Precise, confident, "tool for people who care about craft."

### 3. CrowdStrike (crowdstrike.com) — the proof-rail template

- **Hero:** Carousel-based hero (rotating 3–4 slides), lead headline "The Agentic Security Platform. Unified and built to secure the AI revolution." Dark Falcon platform graphic. CTA "Explore now" + secondary slides promoting conference, release, AI agent content.
- **Section order:**
  1. Utility nav + main nav + hero carousel
  2. **Analyst recognition strip** (Gartner Magic Quadrant Leader 6x, Gartner Peer Insights Customers' Choice 2025, IDC MarketScape Leader)
  3. Pricing / bundles with monthly/annual toggle — 4 self-service tiers + managed MDR
  4. Customer testimonial carousel (3 video case studies: Travel + Leisure, TaylorMade, ALDO)
  5. Solution modules grid (Secure AI, Cloud, Identity, Next-Gen SIEM)
  6. Adversary Universe section (threat intel brand)
  7. Footer
- **Color palette:** Light mode throughout. Primary red `#EC0000` (CrowdStrike red), secondary blue `#0024FF` used only on a premium gradient CTA. Black text `#000`, muted grays `#707070` / `#949494`, white backgrounds.
- **Typography:** "CrowdStrike Sharp Sans" (custom, 700) for headlines, Neue Haas Grotesk Display Pro (600) for UI labels, same family at 400 for body. Heading sizes 24–32+ px. Notably smaller than Stripe/Linear — more dense, enterprise-doc feel.
- **Navigation:** Sticky. 6 primary (Platform, Services, Solutions, Why CrowdStrike, Resources, Pricing) + 5 utility (Breach response, Blog, Contact, Careers, Innovations) + login/cart. Mega-menus on all primary.
- **Scroll behavior:** Normal scroll. Horizontal carousels on hero and testimonials (manual + dot nav). No parallax.
- **Signature moves:** (1) Analyst badges *immediately* post-hero — Gartner Leader positioning is load-bearing; (2) carousel-driven hero lets them run multiple campaigns simultaneously without a redesign; (3) inline pricing with monthly/annual toggle and feature-compare — conversion-focused rather than brochure.
- **Proof artifacts:** Gartner Magic Quadrant (6 consecutive years), Gartner Peer Insights Customers' Choice, IDC MarketScape, 3 video case studies, "23,000+ customers," 2026 Global Threat Report download.
- **Mood:** Enterprise-grown-up, evidence-dense, analyst-validated — "we are the default answer."

### 4. Cloudflare (cloudflare.com)

- **Hero:** Full-width globe-network image as background ("hero-globe-bg-takeover-xxl.png"). Headline "Connect, protect, and build everywhere." Subhead about websites/apps/AI agents. CTAs "Start for free" + "See pricing."
- **Color palette:** White backgrounds, dark body text (~`#1A1A1A`), Cloudflare Orange (`#F6821F` / close variant ~`#FF6B35`) as single accent.
- **Typography:** System sans-serif stack (Cloudflare doesn't load a custom display face on the homepage).
- **Navigation:** Connect / Protect / Build / News & Resources / Pricing — the three-verb organizing framework *is* the nav.
- **Signature moves:** (1) Three-verb framework (Connect → Protect → Build) structures everything; (2) globe / network-map imagery recurs as visual ID; (3) scale-stat strip ("20% of all websites," "330+ cities," "215B threats blocked daily").
- **Proof artifacts:** Broadcom, DoorDash, Garmin, Shopify, Roche, US DHS logos; Forrester Wave + Gartner MQ mentions; "2026 Threat Report" gated asset.
- **Mood:** Global-infrastructure-operator — "we are the internet's connective tissue."

### 5. Vercel (vercel.com)

- **Hero:** A *functional code block* (AI SDK `streamText` snippet) as the hero visual, with headline "Build and deploy on the AI Cloud" and sub "Vercel provides the developer tools and cloud infrastructure…" CTAs "Deploy" + "Get a Demo."
- **Color palette:** Light/dark duality with system theme toggle. Light mode: white bg, near-black text. Dark mode: near-black bg (`#0A0A0A`), white text. Minimal accents — the brand is monochrome with occasional subtle grays.
- **Typography:** **Geist** (Vercel's own font family), geometric sans + Geist Mono for code. Variable weight.
- **Navigation:** Products (AI Cloud, Core Platform, Security) / Resources / Solutions / Enterprise / Pricing / Log In / Sign Up.
- **Signature moves:** (1) **Code-as-hero** — the code block is the design, not around it; (2) real-time provider/model list (Gemini 3 Flash share %) that dynamically renders "trust"; (3) global-infrastructure globe with pulsing node visualization.
- **Proof artifacts:** Runway, Leonardo AI, Zapier logos with metrics ("build times 7m → 40s," "24x faster builds").
- **Mood:** Developer-first, monochrome-confident, "infrastructure for people who ship."

### 6. Palo Alto Networks (paloaltonetworks.com)

- (Site source returned minified JS; patterns below are from brand convention + category knowledge.)
- **Hero:** Typically a rotating hero with cybersecurity platform messaging, layered with subtle product imagery.
- **Color palette:** Palo Alto Orange (`#FA582D` / close), white backgrounds, dark body text, occasional dark navy bands for emphasis sections.
- **Typography:** Custom sans display (Lato / similar) + system body.
- **Navigation:** Products / Solutions / Services / Partners / Company / Resources — deep mega-menus.
- **Signature moves:** (1) Analyst leader badges on every page (Gartner, Forrester); (2) Precision AI / Platform tagging that brands the AI angle; (3) dense footer with compliance/regulatory links.
- **Proof artifacts:** Fortune 100 logos, Gartner MQ Leader badges, Unit 42 threat intel.
- **Mood:** Enterprise-incumbent, comprehensive, catalog-heavy — "we sell the whole security stack."

### 7. Ambient.ai (ambient.ai) — direct competitor

- **Hero:** Headline "Agentic Physical Security for a World that can't wait." Sub: "Supercharge your security teams with AI that turns reaction into prevention." "Request Demo" CTA. Video background with Bunny player (auto-play, lazy).
- **Color palette:** **Dark-dominant** — deep navy/near-black backgrounds, light text, bright blue accent `#4D65FF` for focus states. This is a key signal: our direct competitor has chosen the dark-tactical-adjacent aesthetic.
- **Typography:** Modern sans-serif, antialiased; multiple heading sizes with hover color accents.
- **Navigation:** Why Ambient / Product (Platform, Foundation, Forensics, Access, Threat Detection, Integrations) / Solutions / Partners / Resources / Company.
- **Signature moves:** (1) GSAP + SplitType staggered word-reveal animations tied to scroll; (2) video-background hero (capability-showcase, similar trap to Tessure v1); (3) "Agentic" language repeated as category claim.
- **Proof artifacts:** Adobe, TikTok, ServiceNow, Berkshire Hathaway Energy, MoMA, SentinelOne, Cisco logos; SOC 2 Type II + GDPR badges; Y Combinator Top Co, Forbes Cloud 100, G2 4.6/5.
- **Mood:** AI-forward, video-proofy, slightly tactical — "we are the thinking layer on your cameras."

### 8. Verkada (verkada.com)

- **Hero:** Video-based slideshow. Current hero is a VerkadaOne conference promo: "Join the leaders redefining physical security with real-world AI." CTAs "Secure your spot" + "Get demo."
- **Color palette:** Light mode, bright cyan/blue accent (near `#0066FF`), neutral light gray `#FCFCFC` backgrounds, near-black text `#151616`.
- **Typography:** System stack (Segoe UI / Roboto / Helvetica), text-7xl hero display.
- **Navigation:** Products / Use Cases / Industries / Customers / Resources / Partners + Log in / Get demo.
- **Signature moves:** (1) Product-suite tabs (Video, Access, Alarms, Intercom, Air Quality, Workplace) — six integrated product lines as a single grid; (2) animated circular arrow buttons with hover translation; (3) rotating video-background carousel.
- **Proof artifacts:** G2 ratings 9.6/10, "30,000+ organizations," LA Rams / Canada Goose / City of Las Vegas logos.
- **Mood:** Consumer-friendly enterprise, Apple-adjacent, "security for people who hate security software."

### 9. Dedrone (dedrone.com)

- **Hero:** Static image hero with mobile fallback (AVIF), headline "Stay Ahead of the Drone Threat," sub "AI/ML-enabled Anti-Drone Solution," CTA "Request a demo."
- **Color palette:** **Dark / premium** — black backgrounds, white typography, gold quotation marks as decorative accent, blue tech imagery.
- **Typography:** Clean sans-serif hierarchy, bold heads + lighter body.
- **Navigation:** Solutions / Industries / Resources / Company.
- **Signature moves:** (1) Gold-accented testimonial carousel (LSP, ConEd, NASCAR — recognizable institutions); (2) integration wall showing 6+ sensor types (RF, radar, camera, jammer) as modularity proof; (3) Frost Radar positioning badge.
- **Proof artifacts:** 9 certification badges: DHS SAFETY Act, CPNI, Veracode, AI Excellence Award, CNBC Disruptor 50, Inc. 5000, TIME, Fast Company, workplace awards.
- **Mood:** Sophisticated defense-adjacent — premium dark aesthetic that reads "serious institutions buy this," less weapons-show than Anduril but clearly leaning defense.

### 10. Anduril (anduril.com) — the aesthetic we explicitly reject

- (Site timed out on fetch; analysis from public knowledge + brand thesis cross-check.)
- **Hero:** Full-bleed tactical cinematography (drones, autonomous vehicles, operators, desert/maritime theaters) with large condensed display type.
- **Color palette:** Deep black backgrounds (`#000` / `#0A0A0A`), white type, minimal muted accents. Occasional Anduril orange/red used very sparingly.
- **Typography:** **Custom condensed grotesk** (stencil-adjacent, military register — "Founders Grotesk Condensed" / similar). Dense headlines, ALL CAPS section headers.
- **Navigation:** Platform / Capabilities / About / News / Careers — minimal, catalog-style.
- **Signature moves:** (1) Cinematic full-bleed hero video of product in use; (2) condensed all-caps section headers that read as mission-brief; (3) heavy black + high-contrast white typography with minimal accent color.
- **Proof artifacts:** Government contract announcements, DoD logos, press coverage, minimal customer-logo treatment (buyers are classified).
- **Mood:** Cinematic-defense-tech, "mission-grade," weapons-show confidence — correct for DoD, wrong for enterprise critical infra.

## Cross-cutting patterns

Five moves appear in nearly every aspirational reference (Stripe, Linear, CrowdStrike, Cloudflare, Vercel):

1. **Declarative category headline + sub-clause.** Never a question, never a pun. Pattern: `[Infrastructure / Platform] to [verb outcome].` Stripe: "Financial infrastructure to grow your revenue." Cloudflare: "Connect, protect, and build everywhere." Linear: "The system for product development."
2. **Logo wall within the first two viewports.** Either immediately post-hero (Stripe, Cloudflare) or as the second scroll stop (Linear). Never buried. Logo density signals "this category has already bought us."
3. **Single, restrained brand accent color on white.** Stripe Blurple, CrowdStrike Red, Cloudflare Orange, Vercel mono. One accent, used sparingly on CTAs and key highlights. No rainbow, no gradient swamp.
4. **Stat-stack proof band.** Three to five large numbers with one-line captions — transaction volume, uptime, cities, customers, threats blocked. Replaces paragraphs of copy with scannable magnitudes.
5. **Product-module grid.** A 2×2 or 3×2 grid of named product pillars (Stripe's Payments/Billing/Connect, CrowdStrike's Secure AI/Cloud/Identity/SIEM, Cloudflare's Connect/Protect/Build). Each tile = icon + name + one line + "learn more." This is where buyers navigate.

A sixth move appears in 3 of 5: **normal scroll, no scroll-jacking.** Stripe, Linear, Cloudflare, Vercel all allow the user to control pace. CrowdStrike uses carousels but not scroll-jack. Only Ambient.ai (competitor, not aspirational) uses GSAP scroll-reveal heavily.

## Recommendations for Tessure

1. **Hero = declarative line + static visual + two CTAs. No Three.js.** Lead with the category claim (e.g., "Trusted autonomous security for critical infrastructure" or the v1.1 brand doc's "Stop chasing false alarms. Start securing with verified autonomy."). Pair with a single calm visual — a photographed Fusion Node or a Trust-Blue-on-white isometric diagram of the evidence pipeline. Primary CTA "Book a demo," secondary "See the Fusion Node." This is the Stripe/Linear/Vercel structure and it is the single largest v1 → v2 shift.
2. **Move the Three.js scenario demo to `/demo`.** Brand thesis already calls this out; make the footer/product-nav CTA explicit. The demo becomes a proof artifact linked from "See it run a scenario," not the hero itself.
3. **Extend the palette with two additions, no more.** Keep Trust Blue `#1E40AF` as sole brand accent. Add: (a) a subtle **gradient wash** — Trust Blue `#1E40AF` → Sky Blue `#3B82F6` at 8–15% opacity — for single decorative band (Stripe's wave move, sized small); (b) **Deep Slate `#1E293B`** as a full-bleed dark band for *one* section mid-page (evidence pipeline or case study) to give the page rhythm without going dark-first. Light theme stays dominant; dark is a rhythm instrument.
4. **Typography: stay on Inter; promote Inter Display for H1/H2 only if we want Linear-tier polish.** Add IBM Plex Mono (already in brand doc) for inline code / device IDs / hash fragments in the evidence-pipeline section — that signals technical credibility without needing a full tactical redesign. H1 48–56 px, tight tracking (-1.5%), weight 600. Body 16–17 px, 1.6 line-height.
5. **Navigation: sticky, 5 items max.** Platform / Solutions / Evidence / Resources / Company + "Book a demo" button. Mega-menu on Platform only. Avoid CrowdStrike-style 11-item nav; Tessure is earlier-stage and a narrower nav reads as focused.
6. **Scroll behavior: normal scroll. No scroll-jack, no parallax.** The brand doc's motion section already says "avoid parallax on operational pages" — extend that rule to the marketing site. Subtle intersection-triggered fade/lift on cards is fine (Stripe pattern). Honor `prefers-reduced-motion`.
7. **Proof rail is load-bearing and v1 is missing it.** Tessure needs, in priority order: (a) 4–6 customer / pilot logos once earned — placeholder "Pilots in progress" band until then; (b) SOC 2 + ISO 27001 + UL/FCC/CE badges; (c) an analyst-style quote or third-party validation (even an insurance-underwriter endorsement works); (d) stat strip — "Target <5% false positive rate," "~30s detect-to-verify," "~60s verify-to-act." The stats are design targets per brand doc and must be labeled as such (honesty > aspiration).
8. **Product-module grid for the Platform tier.** Brand doc already names them: Fusion Node / Command / Evidence / Integrations / Cloud Assist. Render as a 3×2 grid with icon + name + one-line + "Explore." This replaces any "features list" styled as bullets.
9. **Evidence-pipeline diagram is the Tessure signature move.** Stripe has its wave, Linear has its app mockup, Vercel has its code block. Tessure's equivalent is the **evidence pipeline diagram** — Trust Blue on white, showing event → fusion → verify → sign → deliver. Commission this as a real illustration, not a generic flow chart. It becomes the brand's single visual shorthand.
10. **Photography direction: infrastructure, not operators.** Substation at dusk, data-center hot aisle, port crane in fog, logistics yard at dawn. Use these as section dividers and the optional dark-band background. Avoid tactical gear, night-vision green, drone silhouettes, hands-on-keyboards clichés. Brand thesis already codifies this; the site must execute.
11. **Explicitly avoid from the defense-tech set:** (a) condensed/stencil display type; (b) black-dominant backgrounds as default; (c) cinematic hero video of "product in action"; (d) ALL CAPS section headers; (e) any hint of orange-red-safety-amber as decorative accent (those are functional-only per brand doc). Dedrone's gold-quote + dark aesthetic is seductive but wrong register; Ambient's dark-first + bright-blue accent is the competitor we're differentiating *against*.
12. **v1's specific failures to fix:** (a) Three.js demo as hero → move to `/demo`; (b) no visible customer logos → add a "Pilots" row with placeholder slots clearly labeled; (c) no stat band → add the target-metric strip with "design target" labels; (d) no evidence-pipeline diagram → commission one as the new signature visual; (e) hero copy currently reads as capability-description → rewrite as declarative category line per brand doc §3.5.

## Layout blueprint

**Section order for Tessure v2 (top to bottom):** sticky nav → hero (declarative headline + subhead + two CTAs + Trust-Blue-on-white static diagram or calm gradient wash) → pilot / customer logo row (or "Pilots in progress" placeholder band) → three-value-pillar band (Verified / Fast / Private — Stripe's tri-clause pattern) → platform module grid (Fusion Node · Command · Evidence · Integrations · Cloud Assist, 3×2 tiles) → **evidence pipeline diagram section** (the Tessure signature move, full-bleed Trust Blue on Frost, with IBM Plex Mono labels) → scenarios teaser band that *links* to `/demo` (card or two with thumbnail + short caption, not the live demo itself) → proof rail (stat strip + SOC 2/ISO/UL/FCC/CE badges + one third-party quote) → single full-bleed Deep Slate section with infrastructure photography + customer case (or insurer quote) for page rhythm → resources / whitepaper download ("Architecture Whitepaper," "Evidence Model Spec") → closing CTA band ("Ready to verify? Book a 30-minute walkthrough") → tall footer with legal entity (Tessure Systems, Inc.), trust artifacts, responsible-disclosure link, status page. The whole page reads light-first, scrolls linearly, holds one accent color, and lands on evidence — Stripe's cadence, Linear's polish, CrowdStrike's proof density, zero Anduril.

## Kill-switch check

*Playbook Phase 4 kill-switch: do all references share one pattern making the category look generic?*

**Partial yes — and the shared pattern is worth adopting anyway.** The aspirational set (Stripe, Linear, CrowdStrike, Cloudflare, Vercel) converges on: white background, single accent color, Inter-family typography, declarative headline, stat band, product-module grid. That convergence is *the enterprise-infrastructure category signature* — and Tessure's thesis explicitly positions inside that category against physical-security incumbents (Verkada, Ambient, Dedrone) who have drifted to dark/tactical aesthetics. **Looking "generic enterprise-infra" is the goal, not the failure mode**, because the competitive set *in physical security* looks like Ambient's bright-blue-on-dark or Dedrone's gold-on-black — and the enterprise buyer recognizes and trusts the Stripe/Linear register. The differentiator is not visual novelty; it is being the *only* physical-security brand that looks like enterprise infrastructure. Kill-switch does not fire. The move that would trigger it is if we adopted a specific signature element unique to one reference (Stripe's gradient wave literally, Linear's dot-grid literally, Vercel's code-hero literally) — the evidence-pipeline diagram as our own signature move avoids that trap.

## Sources / screenshots

No screenshots captured (sandbox). Sources fetched 2026-04-14:

- https://stripe.com
- https://linear.app (partial — CSS-heavy source; supplemented with category knowledge)
- https://www.crowdstrike.com
- https://www.cloudflare.com
- https://vercel.com
- https://www.paloaltonetworks.com (partial — minified source; supplemented with category knowledge)
- https://ambient.ai
- https://www.verkada.com
- https://www.dedrone.com
- https://www.anduril.com (timed out; analysis from brand thesis + public knowledge)

Internal references:
- `~/Workspace/tessure/docs/BRAND_THESIS.md`
- `~/Workspace/tessure/brand/PublicBrandSystem_v1.1.md`
- v1 site reference: `v0-tessure.vercel.app` (not fetched in this pass — v1 critique based on brand thesis §"What changes between v1 and v2")
