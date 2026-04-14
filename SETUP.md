# Setup — Tessure Playbook Run

## Working directory

`~/Workspace/tessure/` — pre-existing, git initialized, pushed to `github.com/fl-sean03/tessure`, Vercel auto-deploys to `v0-tessure.vercel.app`.

## API keys present

| Key | Path | Used in phase |
|---|---|---|
| Anthropic | `~/.secrets/anthropic.env` | 1, 2, 3, 7 (reasoning/copy) |
| OpenAI | `~/.secrets/openai.env` | backup reasoning |
| Google AI (Gemini/Imagen/Veo) | `~/.secrets/google-ai/credentials.env` | 7 (Imagen 4), 9 (Veo 3.1) |
| BFL (FLUX 2 Max + Kontext) | `~/.secrets/bfl/credentials.env` | 7 (hero/render) |
| fal.ai (LoRA + Kling) | `~/.secrets/fal/credentials.env` | 7, 9 (motion) |
| Runway | `~/.secrets/runway` | 9 fallback |
| Vercel | `~/.secrets/vercel.env` | 6, 8, 10 (deploy) |
| Spaceship (domain) | `~/.secrets/spaceship.env` | 3 (domain check + reserve) |
| Cloudflare | `~/.secrets/cloudflare` | 10 (DNS) |
| Gamma | `~/.secrets/gamma-api-key` | optional: pitch deck export |
| DeepInfra | `~/.secrets/deepinfra-key` | backup inference |
| FRED | `~/.secrets/fred-api-key` | 2 (macro data) |

## Keys missing

- **PostHog/Plausible analytics token** — needed Phase 10. Can defer to launch day.
- **Namecheap** — using Spaceship instead. No gap.
- **Product Hunt API** — scheduling a launch post is manual; acceptable gap.

## Budget cap

$25.00 (default). Hard pause at 80% ($20). Running total in SESSION_LOG.md.

## Time cap

12 hours of agent time (default). Reset at context compaction.

## Known gotchas carried over

- `/etc/hosts` IPv4 pins active from prior run (IPv6 unreachable in sandbox): `registry.npmjs.org`, `fonts.googleapis.com`, `fonts.gstatic.com`, `github.com`, `api.vercel.com`, `v0-tessure.vercel.app`. Leave in place — still needed.
- Vercel project `v0-tessure` has SSO protection on `*.seans-projects-d0426204.vercel.app` subdomain. Clean alias `v0-tessure.vercel.app` unaffected.
- Bun lockfile; use `bun install` not `npm install`.
- Build fails on Google Fonts fetch in sandbox — already using system font stack via `next/font`-free config is safe.
