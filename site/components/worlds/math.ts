import type { CameraKey, TimedPoint, Vec3 } from './contract'
export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t) }
export const progress = (time: number, from: number, to: number) => clamp((time - from) / Math.max(0.001, to - from))
export const mix = (a: number, b: number, t: number) => a + (b - a) * t
export function mix3(a: Vec3, b: Vec3, t: number): Vec3 { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)] }
export function samplePath(points: TimedPoint[], time: number): Vec3 {
  if (!points.length) return [0, 0, 0]
  if (time <= points[0].at) return [...points[0].position]
  for (let i = 1; i < points.length; i++) {
    if (time <= points[i].at) return mix3(points[i - 1].position, points[i].position, smooth(progress(time, points[i - 1].at, points[i].at)))
  }
  return [...points[points.length - 1].position]
}
export function sampleCamera(keys: CameraKey[], time: number, mobile: boolean) {
  let a = keys[0], b = keys[keys.length - 1]
  if (time <= a.at) b = a
  else { for (let i = 1; i < keys.length; i++) { if (time <= keys[i].at) { a = keys[i - 1]; b = keys[i]; break } a = keys[i]; } }
  const t = smooth(progress(time, a.at, b.at))
  return {
    position: mix3(mobile && a.mobilePosition || a.position, mobile && b.mobilePosition || b.position, t),
    target: mix3(mobile && a.mobileTarget || a.target, mobile && b.mobileTarget || b.target, t),
    fov: mix(a.fov ?? 38, b.fov ?? 38, t),
  }
}
/** Deterministic layout noise, not a source of animation time. */
export const seeded = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v) }
