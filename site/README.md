# Tessure

Marketing and product demo site for **Tessure Systems** — an autonomous security fusion platform that detects threats across video, thermal, and radar, verifies them, and orchestrates human-in-the-loop response.

Tagline: *Trusted Autonomous Security.*

## Stack

- Next.js 15 (App Router, React 19)
- TypeScript 5 (`strict: true`)
- Tailwind CSS 4 + shadcn/ui + Radix primitives
- Three.js via `@react-three/fiber` and `@react-three/drei`
- Zustand for scenario state

## Local development

This project uses [Bun](https://bun.sh) as the package manager. The lockfile is `bun.lock`.

```bash
bun install
bun dev
```

Dev server runs on http://localhost:3000.

Other scripts:

```bash
bun run build   # production build (TS errors fail the build)
bun run start   # serve the production build
bun run lint    # eslint
```

## Deployment

Vercel is linked to this repo; pushes to `main` auto-deploy. The `v0-tessure` Vercel project points at `github.com/fl-sean03/tessure`.

v0 can continue to push updates — they'll flow through GitHub → Vercel.

## Project layout

```
app/            # App Router: layout, page, error boundary, 404
components/
  ├─ scenes/           # Per-scenario Three.js scenes (6 scenarios)
  ├─ shared/           # Reusable sensor models (Camera, UAV, Radar, Sensor)
  ├─ ui/               # shadcn/ui primitives
  └─ defense-*.tsx     # Hero demo, HUD, scenario selector, explanation
lib/            # Zustand store + scenario config
public/         # Icons, logos, placeholder assets
PublicBrandSystem_Updated.txt   # Brand guidelines
```

## Scenarios

Six demo scenarios live under `components/scenes/`:

- Private estate (perimeter intrusion)
- Data center
- Resort / marina
- Event overlay (crowd management)
- Logistics yard
- Critical infrastructure (power / water)

Each scene reads from `useScenarioStore()` for phase (idle → detected → verifying → verified → responding), tracked cameras, dispatched drones, and intruder position.

## Brand

See `PublicBrandSystem_Updated.txt` for the full brand system (palette, typography, voice, messaging tiers). Core palette:

- Trust Blue `#1E40AF`
- Safety Amber `#F59E0B`
- Background `#0A0F1C`
- Typography: Inter
