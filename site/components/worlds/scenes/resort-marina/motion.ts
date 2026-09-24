import { CatmullRomCurve3, Vector3 } from 'three'
import { clamp, progress, smooth } from '../../math'

export const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
export const approach = new CatmullRomCurve3([[10, 0, 23], [12, 0, 18], [14, 0, 12], [14.2, 0, 9]].map(p => new Vector3(...p)))
// The complete hull turns outboard of the finger, then approaches parallel to it.
export const welcome = new CatmullRomCurve3([[14.2, 0, 9], [10, 0, 9.5], [6, 0, 11], [2.2, 0, 12.3], [.6, 0, 11.3], [.4, 0, 9], [.4, 0, 6.8]].map(p => new Vector3(...p)))
const a = approach.getTangent(1), b = welcome.getTangent(0)
export const heldHeading = Math.atan2(a.x, a.z), welcomeHeading = Math.atan2(b.x, b.z)
export const turnAngle = wrapAngle(welcomeHeading - heldHeading)
export function vesselPose(t: number) {
  const returning = t > 30, curve = returning ? welcome : approach
  const u = returning ? smooth(progress(t, 30, 44)) : 1 - (1 - progress(t, 0, 24)) ** 1.35
  const p = curve.getPoint(u), d = curve.getTangent(u), tangent = Math.atan2(d.x, d.z)
  const heading = returning ? heldHeading + turnAngle + wrapAngle(tangent - welcomeHeading)
    : t > 28 ? heldHeading + turnAngle * smooth(progress(t, 28, 30)) : tangent
  return { p, heading, pitch: Math.sin(t * .9) * .009, roll: Math.sin(t * 1.1) * .013, heave: Math.sin(t * 1.5) * .035 }
}
export function vesselSpeed(t: number) {
  if (t >= 24 && t <= 30 || t >= 44) return 0
  const from = Math.max(0, t - .002), to = Math.min(t < 24 ? 24 : 44, t + .002)
  return vesselPose(to).p.distanceTo(vesselPose(from).p) / Math.max(.001, to - from)
}
export function wakePose(t: number) {
  const pose = vesselPose(t), speed = vesselSpeed(t), amount = smooth(clamp(speed / 2))
  return { ...pose, speed, length: 3.8 * amount, width: .045 + .07 * amount, opacity: .42 * amount }
}
export function outboardYaw(t: number) {
  const turn = (vesselPose(Math.min(44, t + .02)).heading - vesselPose(Math.max(0, t - .02)).heading) / .04
  return clamp(-wrapAngle(turn) * .3, -.48, .48) * smooth(progress(t, 28, 28.4)) * (1 - smooth(progress(t, 43, 44)))
}
export const radarPosition: [number, number, number] = [22.3, 5.6, 18]
export const radarPhase = (t: number) => t * .7 + .3
export function restingPose(t: number, kind: 'sail' | 'moored' | 'kayak') {
  const phase = kind === 'sail' ? 1 : kind === 'moored' ? 2 : 3
  return { heave: Math.sin(t * 1.15 + phase) * (kind === 'kayak' ? .018 : .026), pitch: Math.sin(t * .83 + phase) * .006, roll: Math.sin(t * .94 + phase) * .008 }
}
