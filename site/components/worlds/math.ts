import type { CameraKey, CameraEasing, TimedPoint, Vec3 } from './contract'
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
export function ease(t: number, mode: CameraEasing = 'smooth') {
  const x = clamp(t)
  if (mode === 'linear') return x
  if (mode === 'smoother') return x * x * x * (x * (x * 6 - 15) + 10)
  if (mode === 'easeIn') return x * x
  if (mode === 'easeOut') return 1 - (1 - x) * (1 - x)
  return smooth(x)
}
function spline3(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  return p1.map((_, i) => {
    const v0 = (p2[i] - p0[i]) * .5, v1 = (p3[i] - p1[i]) * .5
    return (2 * p1[i] - 2 * p2[i] + v0 + v1) * t ** 3 + (-3 * p1[i] + 3 * p2[i] - 2 * v0 - v1) * t ** 2 + v0 * t + p1[i]
  }) as Vec3
}
export function sampleCamera(keys: CameraKey[], time: number, mobile: boolean) {
  const position = (k: CameraKey) => mobile && k.mobilePosition || k.position
  const target = (k: CameraKey) => mobile && k.mobileTarget || k.target
  let index = 0
  for (let i = 1; i < keys.length && keys[i].at <= time; i++) index = i
  const a = keys[index], b = keys[index + 1]
  if (!b || time <= keys[0].at || b.cut) return { position: [...position(a)] as Vec3, target: [...target(a)] as Vec3, fov: a.fov ?? 38 }
  const t = ease(progress(time, a.at, b.at), a.easing)
  const before = a.cut ? a : keys[Math.max(0, index - 1)]
  const after = keys[index + 2]?.cut ? b : keys[Math.min(keys.length - 1, index + 2)]
  return {
    position: a.interpolation === 'spline' ? spline3(position(before), position(a), position(b), position(after), t) : mix3(position(a), position(b), t),
    target: a.interpolation === 'spline' ? spline3(target(before), target(a), target(b), target(after), t) : mix3(target(a), target(b), t),
    fov: mix(a.fov ?? 38, b.fov ?? 38, t),
  }
}
/** Deterministic layout noise, not a source of animation time. */
export const seeded = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v) }
