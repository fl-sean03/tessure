# Asset attribution

All site models, geometry, diagrams and world illustrations are made for this Tessure concept site. World geometry is reproducible from the corresponding scene module or included asset-generation source. Depicted places and events are fictional illustrations.

IBM Plex Sans and IBM Plex Mono are by IBM, distributed under the SIL Open Font License 1.1. The self-hosted Latin WOFF2 files were obtained from the `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` packages. License texts are in `public/fonts/`. Original project: https://github.com/IBM/plex.

No scraped imagery, remote environment maps, proprietary customer logos or external runtime asset services are used.

Social-preview artwork in `public/social/` combines these original world renders with the self-hosted IBM Plex typefaces. Each world page has its own illustrative preview.

The opening film and its poster are rendered from the original procedural gate miniature in `components/worlds/reference.tsx`, with the camera, lighting and authored sequence in `reference-definition.ts`. The film samples 0–23.9 illustration seconds at twice narrative speed, at 20 frames per second. Camera, radar and thermal marks illustrate linked observations; they are not output from detection software. Geometry, texture grain and animation are generated locally; the film has no audio or third-party footage.
