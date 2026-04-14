# Tooling & Asset Pipeline — Phase 4

What the Tessure v2 site needs for imagery, which models produce each, the prompt cheat-sheet per model, and the running budget estimate through Phases 6–8.

---

## Asset inventory (drawn from Phase 3 layout blueprint)

Reference `research/DESIGN_RESEARCH.md`. The Phase 7 site v2 sections require the following assets:

| # | Slot | Asset type | Model / tool | Priority |
|---|---|---|---|---|
| 1 | **Hero visual** | Calm infrastructure editorial — a single clean image pairing a real-world critical-infra environment (substation at dusk, colocation aisle in daylight, port logistics yard in fog) with the implied presence of a Tessure Fusion Node. | **FLUX 2 Max** (primary) / Imagen 4 (fallback) | Tier 1 |
| 2 | **Fusion Node hero render** | Matte IP67 enclosure product render, 4 angles (front-three-quarter, side, top-down, detail). Cable management, PoE+ port, discreet Tessure mark. | **FLUX 2 Max** | Tier 1 |
| 3 | **Evidence pipeline diagram** | Tessure's signature section. Event → Fuse → Verify → Sign → Deliver. Trust Blue on Frost white, Inter + IBM Plex Mono labels, clean geometric arcs. **Hand-built SVG**, NOT generated — readability and typography control required. | Figma → SVG (or direct SVG in code) | Tier 1 |
| 4 | **Platform-module grid** | 4 small icons / spot illustrations for Fusion Node · Command · Evidence · Integrations · Cloud Assist. | Hand-built SVG (line icons, 2px stroke). No model generation. | Tier 1 |
| 5 | **Scenarios teaser** | 3–6 still screenshots from the existing Three.js demo, re-shot with palette-corrected lighting. | `playwright` captures of `/demo` route | Tier 2 |
| 6 | **Infrastructure editorial set** | 4–6 supporting environment photos: data-center aisle, transmission yard, pipeline right-of-way at dawn, logistics-yard fence, marina, private-estate perimeter. | **FLUX 2 Max** for 3 hero-adjacent; **Imagen 4** for 3 background. | Tier 2 |
| 7 | **Proof rail: cert badges** | SOC 2 (pending), ISO 27001 (planned), UL / FCC / CE (planned), CSA STAR. | Official badge SVGs from each authority (Wikimedia / vendor brand portals). **Free.** | Tier 2 |
| 8 | **Logo row** | 6–8 customer/pilot logos. **No real customers yet** — Phase 7 ships with muted gray rectangles plus a small "in pilot" indicator. Once pilots sign NDAs allowing logo use, swap in. | N/A placeholder | Tier 3 (placeholder) |
| 9 | **OG image** | 1200×630 social-share composite: Tessure wordmark + hero tagline on Trust-Blue panel with a single infrastructure photo. | Figma or hand-built SVG exported to PNG. | Tier 2 |
| 10 | **Favicon / app icon** | Already present at `site/public/icon.svg` + 32×32 PNGs. Audit for palette consistency with v2. | Existing file; minor color tweak. | Tier 3 |
| 11 | **Founder headshot / team page** | One real photo of Sean; optional. | Existing photo. | Tier 3 |
| 12 | **Whitepaper cover + inline diagrams** | Architecture whitepaper (referenced in GO_TO_MARKET.md). | Hand-built SVGs + Gamma for PDF export (have Gamma API key). | Tier 3 (can ship v2 without; produce alongside Phase 9 launch) |

**Pattern:** the two assets that most define Tessure's premium feel are (1) the hero infrastructure photo and (2) the evidence-pipeline diagram. Phase 6 rounds focus heaviest iteration on those.

---

## API health checks (2026-04-14)

| Provider | Key var | Status | Available models |
|---|---|---|---|
| **BFL** (FLUX 2 Max + Kontext) | `BFL_API_KEY` at `~/.secrets/bfl/credentials.env` | **HTTP 404 "Task not found"** on dummy GET — auth accepted, endpoint live. ✓ | FLUX 2 Max, FLUX Kontext Pro |
| **Google AI** (Gemini / Imagen / Veo) | `GEMINI_API_KEY` at `~/.secrets/google-ai/credentials.env` | **HTTP 200** on `/v1beta/models` — ✓ | 50 models including `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001`, `veo-3.0-generate-001`, `veo-3.1-generate-preview`, `gemini-2.5-pro`, `gemini-2.5-flash` |
| **fal.ai** (LoRA + Kling + fallback models) | `FAL_KEY` at `~/.secrets/fal/credentials.env` | HTTP 405 on GET probe (endpoint needs POST) — auth flow reachable. ✓ | Kling 1.6, SDXL, Realistic Vision, LoRA trainer |
| **Vercel** | `VERCEL_TOKEN` (team) + OAuth token in `~/.local/share/com.vercel.cli/auth.json` | Primary Vercel env token forbidden; OAuth token works. Vercel rootDir already set to `site/`. ✓ | Deploy + DNS |
| **Spaceship** | `SPACESHIP_API_KEY` / `SPACESHIP_API_SECRET` | Present; not exercised this session. Used in Phase 2 (domain registration, out-of-band action). | Domain registrar |
| **Runway** | `~/.secrets/runway` | Present; not exercised. Fallback for motion. | Gen-4 |

All Phase 6–8 keys are present and responsive. No blockers.

---

## Model selection rationale

| Asset type | Model | Why |
|---|---|---|
| Hero infrastructure editorial + renders | **FLUX 2 Max** | Photographic realism, good with industrial subjects, responsive to camera-spec prompts, ~$0.05–0.08 per image. |
| Secondary infra photos | **Imagen 4** (standard tier) | Slightly different tonal character — good for variety; ~$0.03 per image; Google API already provisioned. |
| Product render (Fusion Node) | FLUX 2 Max, iterated | Best at matte industrial objects when prompted with camera specs. |
| Motion (Phase 8) | **Veo 3.1 Fast** primary, Kling via fal.ai secondary | Veo 3.1 Fast has good price/quality balance ($0.15–0.25 per second of video). Kling has stronger motion for camera orbits / product-rotate clips. |
| Diagrams | **Hand-built SVG** (Figma → export) | Typography + axis control image-gen cannot match; also avoids AI-diagram aesthetic that looks generic. |
| Icons / spot illustrations | Hand-built SVG (2px stroke, Trust Blue) | Same reasoning. Brand doc specifies exact icon style. |
| Copywriting polish | **Claude (Opus / Sonnet 4.6)** | In-session, already in use. |
| Pitch deck / whitepaper PDF export | **Gamma** | Gamma API key present; saves ~3 hours vs Keynote. |

---

## Prompt-engineering cheat-sheet (Tessure-specific)

FLUX 2 Max rules for Tessure's category (adapted from Wayhaven's FLUX prompt rules in `idea-to-site-playbook` Appendix A, tuned for enterprise-infrastructure vs. lifestyle-vehicle):

**Do:**
- End every prompt with **"no text, no badges, no logos, no people unless specified."** Prevents hallucinated Tessure wordmarks that won't match the real brand system.
- Include camera specs: **"Shot on Sony A7R V with 35mm lens at f/5.6, ISO 400, daylight."** For infrastructure, stop-down to f/5.6–f/8 improves depth-of-field accuracy.
- **Real-world proportion anchors:** "the enclosure is roughly the size of a Mac Mini"; "the substation is a typical 138kV transmission yard with 4–6 transformers."
- Environment sells the category — specify **weather, time of day, atmosphere** ("overcast morning, light fog, blue hour"). These carry the "calm, infrastructure-calm" brand mood better than subject-only prompts.
- Short prompts beat long. 40–80 words. Long prompts degrade FLUX output.

**Don't:**
- Don't prompt "AI futuristic," "glowing," "neural." Triggers the generic AI-SaaS look we're actively avoiding.
- Don't prompt "tactical," "military," "defensive posture." Triggers the defense-tech cosplay we're actively rejecting (see `BRAND_THESIS.md` baby-Anduril trap).
- Don't prompt "operator in uniform" — triggers tactical pastiche. If a human is needed, prompt "a technician in a soft shell jacket inspecting a control panel."
- Don't prompt specific logos, plates, or readable signage — FLUX hallucinates; cleanup is expensive.

**Category-specific failure modes to expect:**
- **Substations:** transformers often generated with wrong bushing counts or impossible wire paths. Check every hero shot.
- **Data centers:** aisle lighting often comes out "movie-cyberpunk" (magenta/cyan) — prompt explicitly "fluorescent daylight, color temperature 4000K."
- **Logistics yards:** trucks and containers look fine; chain-link fences are surprisingly hard (gaps often wrong).
- **Marinas:** water reflections usually good; boat names hallucinate — prompt "no text on boats."
- **Product renders of Fusion Node:** the device itself is easier than context — but FLUX defaults to "glossy modern tech gadget." Prompt explicitly "matte industrial powder-coated steel, subtle machining marks, not glossy."

Imagen 4 rules: broadly similar, but Imagen tolerates slightly longer prompts (80–120 words) and handles specific camera brands less well. Prefer Imagen for more editorial / landscape shots; FLUX for hero + product.

---

## Phase 6–8 budget estimate

| Phase | Item | Qty | Unit | Cost |
|---|---|---|---|---|
| **Phase 6** | Hero infrastructure shot (iteration to 9/10) | 10 renders | $0.06 | $0.60 |
| | Fusion Node render (iteration to 9/10) | 10 renders | $0.06 | $0.60 |
| | Secondary infra editorial set | 8 renders | $0.06 | $0.48 |
| | Imagen 4 variety passes | 6 renders | $0.03 | $0.18 |
| | Evidence-pipeline diagram (SVG) | — | — | $0 |
| | Platform-module icons (SVG) | — | — | $0 |
| | Scenario screenshots from `/demo` | 6 captures | free | $0 |
| | **Phase 6 subtotal** | ~34 renders | | **~$2.00** |
| **Phase 7** | Site v2 rebuild + deploy | — | Vercel Hobby | $0 |
| | Copy polish (in-session) | — | Claude | ~$1.50 |
| | **Phase 7 subtotal** | | | **~$1.50** |
| **Phase 8** (optional) | Hero motion (3–5 clips, 3–5 s each) | 4 clips × 4 s | $0.20/s (Veo 3.1 Fast) | ~$3.20 |
| | Reject rate allowance (30–50%) | 4 extra clips | | ~$3.20 |
| | **Phase 8 subtotal** | | | **~$6.40** |
| **Phases 6–8 combined estimate** | | | | **~$10.00** |

## Running budget check

| Category | Spent to date | Estimated remaining |
|---|---|---|
| Claude (Phases 1–4) | ~$7 | ~$2 Phase 7 polish |
| Research agents (4 parallel) | ~$0.5 | $0 |
| FLUX 2 Max / Imagen 4 | $0 | ~$2 |
| Veo 3.1 Fast (Phase 8) | $0 | ~$6.40 |
| fal.ai (if LoRA training added) | $0 | ~$4 optional |
| Vercel | $0 | $0 (Hobby) |
| Domain registration (out-of-band) | $0 | ~$140/yr (user-actionable) |
| Trademark search (out-of-band) | $0 | ~$500–$1,500 (user-actionable) |
| **Total in-session playbook spend** | **~$7.5** | **~$10.5** remaining |
| **Projected total in-session** | | **~$18 / $25 cap (72%)** |

**Well within the $25 cap.** LoRA training is an optional add-on (Wayhaven didn't; Tessure probably doesn't need it since we don't need infinite hero renders — once the hero photo is locked, we use it).

---

## Kill-switch check (Phase 4)

Playbook Phase 4 kill-switches:
- **Asset budget to reach Tier 1 quality exceeds total run budget?** No. Estimated $10 for Tier 1 + Tier 2 asset set. $25 cap. Not fired.
- **Required API key missing and cannot be provisioned in-session?** No. All Phase 6–8 keys present and health-checked. Not fired.

Proceed to Phase 5.

---

## What the agent decides (per playbook)

| Decision | Choice |
|---|---|
| Asset type mix | 60% FLUX 2 Max photographic, 25% hand-built SVG (diagram + icons + OG), 10% Imagen 4 variety, 5% Veo 3.1 motion. |
| Train a LoRA? | **No for Phase 6.** Revisit only if hero photo needs infinite variations (it won't — we want ONE hero photo locked). |
| Motion worth the cost? | **Yes if budget permits.** 3–5 subtle motion loops on the hero + evidence-pipeline diagram reinforce "alive infrastructure" feel. ~$6 budget. |
| Skip Phase 8 if running long? | Acceptable. Phase 7 ships a static v2; Phase 8 adds polish. |

---

## Files produced / to produce

- **This doc:** `docs/TOOLING.md`
- **Asset library (Phase 6):** `site/public/renders/` (generated images), `site/public/diagrams/` (hand-built SVG), `site/public/screenshots/` (Three.js captures)
- **Prompt log:** `research/PROMPT_LOG.md` (one entry per generation, with prompt + model + rating + cost — feeds Phase 6 rubric)
