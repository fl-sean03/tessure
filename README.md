# Tessure

A public concept for a physical-security system that brings site sensors together to support human decisions. The website explains the proposed approach through six illustrative worlds. It is not a deployed security product.

## Website

The deployable Next.js application is in `site/`. It uses React and a deferred Three.js / React Three Fiber renderer. The page first presents static content and self-made posters; visitors choose when to enter an interactive world. The same narrative remains available as text.

```sh
cd site
npm ci
npm run dev
```

Validation and a production build:

```sh
npm run typecheck
npm run check:contract
npm run build
npm start
```

Use Node.js 22 or later and npm. `site/package-lock.json` is the sole package lockfile. Vercel's Git integration builds the `site/` directory; `main` serves https://v0-tessure.vercel.app.

## Layout

- `site/app/`: the homepage, six world routes, site information and metadata.
- `site/components/worlds/`: shared playback, narrative contract, camera direction and individual scenes.
- `site/public/worlds/`: self-made scene assets and posters.
- `site/ASSETS.md`: visual/font attribution and licenses.
- `docs/`, `research/`, `specs/`, `brand/`: historical concept documents. Their proposed capabilities, targets and market assumptions are not proof of implemented performance.

Contact: [sean.florez@colorado.edu](mailto:sean.florez@colorado.edu).

## Status

**Archived concept (Mar 2026).** Sean ran this through the idea-to-site playbook, built the demo + brand system, and decided not to pursue. Thesis is public for anyone working in physical security / critical-infrastructure defense. See `seanflorez.com/archive/tessure/`.
