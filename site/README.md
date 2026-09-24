# Tessure website

A Next.js application explaining a physical-security concept through six fictional, interactive site studies.

## Run

```sh
npm ci
npm run dev
npm run typecheck
npm run check:contract
npm run build
npm start
```

Use Node.js 24.x and npm 11.13.0, as pinned in `package.json`. The npm lockfile is authoritative. Production is built from this directory through Vercel's Git integration.

## Scene system

`components/worlds/contract.ts` defines the data and rendering interface. Each scene has serializable narrative content and a lazy-loaded World component. The shared runtime owns one canvas, the absolute-time clock, camera direction, quality and resource lifecycle. Worlds must derive their visual state from that clock so seeking works in both directions.

The interface pauses for an illustrative operator decision. Playback controls never operate real equipment. Posters, manual beat selection and the full text sequence remain useful with reduced motion or unavailable WebGL. Keyboard and touch controls live in HTML.

World routes: `/worlds/private-estate`, `/worlds/data-center`, `/worlds/resort-marina`, `/worlds/event-overlay`, `/worlds/logistics-yard`, `/worlds/critical-infrastructure`.

Asset attribution: [ASSETS.md](ASSETS.md). No remote fonts, forms, analytics or external runtime imagery are added.
