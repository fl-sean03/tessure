# Tessure — Data Room

Playbook-run project root for **Tessure Systems** — autonomous security fusion platform for high-risk fixed facilities.

This directory follows the `idea-to-site-playbook.md` structure. The deployable site is isolated in `site/`; everything else is strategy, research, brand, and spec work.

## Layout

```
tessure/
├─ site/         # Next.js 15 + R3F marketing site (deploys to Vercel)
├─ docs/         # Phase 1 strategic data room (business, GTM, risks, ops)
├─ research/     # Phase 2 market + Phase 4 design research
├─ specs/        # Technical / product architecture specs
├─ brand/        # Brand system, palette, typography, messaging
├─ SESSION_LOG.md  # Chronological run log (playbook spine)
├─ SETUP.md        # API keys, budget cap, gotchas
└─ README.md       # this file
```

## Run artifacts

- **Concept brief + budget/time caps:** `SESSION_LOG.md`
- **API key inventory:** `SETUP.md`
- **Brand system v1.1 (light theme):** `brand/PublicBrandSystem_v1.1.md`
- **Live site:** https://v0-tessure.vercel.app
- **Repo:** https://github.com/fl-sean03/tessure

## Site development

```bash
cd site
bun install
bun dev    # http://localhost:3000
```

See `site/README.md` for site-specific instructions.

## Status

**Archived concept (Mar 2026).** Sean ran this through the idea-to-site playbook, built the demo + brand system, and decided not to pursue. Thesis is public for anyone working in physical security / critical-infrastructure defense. See `seanflorez.com/archive/tessure/`.
