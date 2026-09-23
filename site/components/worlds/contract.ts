import type { ComponentType, MutableRefObject } from 'react'

/** contract-v1: metres, +Y up. Absolute scene time is the only animation source. */
export type Vec3 = [number, number, number]
export type BeatId = 'detect' | 'verify' | 'correlate' | 'decide' | 'respond' | 'resolve'
export type Quality = 'low' | 'high'
export type Layers = { sensors: boolean; tracks: boolean }
export type SceneClock = { time: number; playing: boolean }
export type WorldProps = { clock: MutableRefObject<SceneClock>; quality: Quality; layers: Layers }
export type Evidence = { source: string; detail: string }
export type Beat = { id: BeatId; at: number; title: string; body: string; evidence: Evidence[]; action?: string }
export type CameraKey = { at: number; position: Vec3; target: Vec3; mobilePosition?: Vec3; mobileTarget?: Vec3; fov?: number }
export type SceneDefinition = {
  id: string; number: string; name: string; subtitle: string; description: string;
  lesson: string; setting: string; duration: number; poster: string; posterAlt: string;
  palette: { background: string; fog: string; fogNear: number; fogFar: number; ambient: number; sun: string; sunIntensity: number; sunPosition: Vec3 };
  cameras: CameraKey[]; beats: Beat[]
}
export type SceneModule = { definition: SceneDefinition; World: ComponentType<WorldProps> }
export type TimedPoint = { at: number; position: Vec3 }
export type RenderStats = {
  scene: string; time: number; quality: Quality; calls: number; triangles: number;
  textures: number; geometries: number; frameMs: number; jsFrameMs: number;
}
