import type { ComponentType, MutableRefObject } from 'react'

/** contract-v2: metres, +Y up. Absolute scene time is the only animation source. */
export type Vec3 = [number, number, number]
export type BeatId = 'detect' | 'verify' | 'correlate' | 'decide' | 'respond' | 'resolve'
export type Quality = 'low' | 'high'
export type Layers = { sensors: boolean; tracks: boolean }
export type SceneClock = { time: number; playing: boolean }
export type WorldProps = { clock: MutableRefObject<SceneClock>; quality: Quality; layers: Layers }
export type Evidence = { source: string; detail: string }
export type Beat = { id: BeatId; at: number; title: string; body: string; evidence: Evidence[]; action?: string }
export type CameraEasing = 'linear' | 'smooth' | 'smoother' | 'easeIn' | 'easeOut'
/** cut applies on arrival at this key; easing/interpolation describe the outgoing segment. */
export type CameraKey = { at: number; position: Vec3; target: Vec3; mobilePosition?: Vec3; mobileTarget?: Vec3; fov?: number; cut?: boolean; easing?: CameraEasing; interpolation?: 'linear' | 'spline' }
export type ShadowBounds = { left: number; right: number; top: number; bottom: number; near: number; far: number; bias: number; normalBias: number; mapSize: 512 | 1024 | 2048 }
/** A representative state image, selected from its authored start time until the next still. */
export type SceneStill = { at: number; src: string; alt: string }
export type SceneDefinition = {
  id: string; number: string; name: string; subtitle: string; description: string;
  lesson: string; establishing: { title: string; body: string }; setting: string; duration: number; poster: string; posterAlt: string;
  /** Optional state-matched fallback images. Otherwise poster is explicitly an overview. */
  fallbackStills?: SceneStill[];
  palette: {
    background: string; fog: string; fogNear: number; fogFar: number; ambient: number;
    sun: string; sunIntensity: number; sunPosition: Vec3;
    hemisphereSky: string; hemisphereGround: string; hemisphereIntensity: number;
    exposure: number; toneMapping: 'aces' | 'neutral'; shadowBounds: ShadowBounds
  };
  /** Maximum module-owned point/spot lights: 0–3 high, at most one low. No practical shadows. */
  practicalLightLimit: 0 | 1 | 2 | 3;
  cameras: CameraKey[]; beats: Beat[]
}
export type SceneModule = { definition: SceneDefinition; World: ComponentType<WorldProps> }
export type TimedPoint = { at: number; position: Vec3 }
/** Authored payload estimates, NOT GPU VRAM. Renderer/shadow/framebuffer overhead is excluded. */
export type ResourceStats = {
  geometryBytes: number; textureBytes: number;
  /** Nonzero means the corresponding byte total is incomplete; do not certify a budget from it. */
  geometryByteUnknowns: number; textureByteUnknowns: number;
  resourceByteScope: 'authored-buffer-and-texture-payload';
}
export type RenderStats = {
  scene: string; time: number; quality: Quality; calls: number; triangles: number;
  textures: number; geometries: number; practicalLights: number; practicalShadows: number; frameMs: number; jsFrameMs: number;
} & ResourceStats
