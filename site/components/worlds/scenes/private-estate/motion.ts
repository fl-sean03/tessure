import type { Vec3 } from '../../contract'
import { mix, progress } from '../../math'
import { makeWalkingPath, smoothMinimum, smoother, solveTwoBone, walkingDistance } from '../../kinematics'
import { pathZ, surfaceY } from './surface'
const route: Vec3[] = [-8.4, -6, -2.7, 0, 2.35, 5, 7.5, 9, 12].map(x => [x, 0, x <= 7.5 ? pathZ(x) : x === 9 ? 4.4 : 3.55])
export const foxPath = makeWalkingPath(route)
export const foxRig = { upper: .29, lower: .31, hipY: .47, ankleY: .06, reach: .59, pawLength: .15, pawWidth: .09 }
export const hipOffsets: Vec3[] = [[.32, .47, .145], [.32, .47, -.145], [-.34, .47, .145], [-.34, .47, -.145]]
export const movement = [{ start: 2, end: 11, from: 0, to: foxPath.knots[2] }, { start: 11, end: 25, from: foxPath.knots[2], to: foxPath.knots[4] }, { start: 27.5, end: 46, from: foxPath.knots[4], to: foxPath.length }]
export function foxDistance(time: number) {
  let distance = 0
  for (const s of movement) { if (time < s.start) return distance; distance = s.from + walkingDistance(time, s.start, s.end, s.to - s.from, .8); if (time < s.end) return distance }
  return distance
}
export function rotatePoint(p: Vec3, yaw: number): Vec3 { return [p[0] * Math.cos(yaw) + p[2] * Math.sin(yaw), p[1], -p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw)] }
export type Foot = { position: Vec3; yaw: number; planted: boolean; contact: number }
function landing(distance: number, side: number, contact: number): Foot {
  const shot = foxPath.sample(distance), yaw = shot.yaw - Math.PI / 2, offset = rotatePoint(hipOffsets[side], yaw), x = shot.position[0] + offset[0], z = shot.position[2] + offset[2]
  // The thin flat sole is horizontal. Its support uses the highest rendered point under its footprint.
  let y = surfaceY(x, z)
  for (const xx of [-.075, 0, .075]) for (const zz of [-.045, 0, .045]) { const p = rotatePoint([xx, 0, zz], yaw); y = Math.max(y, surfaceY(x + p[0], z + p[2])) }
  return { position: [x, y + .001, z], yaw, planted: true, contact }
}
export const initialFeet = hipOffsets.map((_, side) => landing(0, side, -1))
export const foxFootfalls: (Foot & { side: number; from: number; to: number })[] = []
const order = [0, 3, 1, 2] // lateral sequence, one foot swinging and three available for support
for (const s of movement) {
  const count = Math.ceil((s.to - s.from) / .48) * 4, step = (s.to - s.from) / count
  const timeAt = (d: number) => { let lo = s.start, hi = s.end; for (let i = 0; i < 36; i++) { const mid = (lo + hi) / 2; if (foxDistance(mid) < d) lo = mid; else hi = mid }; return (lo + hi) / 2 }
  for (let j = 0; j < count; j++) { const side = order[j % 4]; foxFootfalls.push({ ...landing(Math.min(s.to, s.from + (j + 2.5) * step), side, foxFootfalls.length), side, from: j === 0 ? s.start : timeAt(s.from + j * step), to: j === count - 1 ? s.end : timeAt(s.from + (j + 1) * step) }) }
}
export function foxFoot(side: number, time: number): Foot {
  let previous = initialFeet[side]
  for (const next of foxFootfalls) {
    if (next.side !== side) continue
    if (time <= next.from) return previous
    if (time >= next.to) { previous = next; continue }
    const phase = progress(time, next.from, next.to)
    if (phase <= .08) return previous
    if (phase >= .92) return next
    const u = progress(phase, .08, .92), travel = smoother(progress(u, .23, .77))
    const x = mix(previous.position[0], next.position[0], travel), z = mix(previous.position[2], next.position[2], travel), clearance = Math.max(previous.position[1], next.position[1]) + .105
    const y = u < .23 ? mix(previous.position[1], clearance, smoother(u / .23)) : u > .77 ? mix(clearance, next.position[1], smoother((u - .77) / .23)) : clearance
    return { position: [x, y, z], yaw: mix(previous.yaw, next.yaw, travel), planted: false, contact: next.contact }
  }
  return previous
}
// Smooth support of the body over a paw-sized neighborhood; feet retain exact mesh contacts.
const bodyHeights = Array.from({ length: 513 }, (_, i) => {
  const d = foxPath.length * i / 512
  let sum = 0
  for (let j = -8; j <= 8; j++) { const p = foxPath.sample(d + j * .04).position; sum += surfaceY(p[0], p[2]) }
  return sum / 17 + .055
})
function bodyHeight(distance: number) { const f = distance / foxPath.length * 512, i = Math.min(511, Math.floor(f)); return mix(bodyHeights[i], bodyHeights[i + 1], f - i) }
export function foxPose(time: number) {
  const distance = foxDistance(time), shot = foxPath.sample(distance), yaw = shot.yaw - Math.PI / 2, feet = hipOffsets.map((_, side) => foxFoot(side, time)), position = [...shot.position] as Vec3
  position[1] = bodyHeight(distance)
  for (let side = 0; side < 4; side++) {
    const offset = rotatePoint(hipOffsets[side], yaw), foot = feet[side].position, horizontal = Math.hypot(position[0] + offset[0] - foot[0], position[2] + offset[2] - foot[2])
    const heightLimit = foot[1] + foxRig.ankleY + Math.sqrt(Math.max(0, foxRig.reach ** 2 - horizontal ** 2)) - foxRig.hipY
    position[1] = smoothMinimum(position[1], heightLimit, .012)
  }
  const legs = feet.map((foot, side) => { const offset = rotatePoint(hipOffsets[side], yaw), hip = position.map((v, i) => v + offset[i]) as Vec3, pole = rotatePoint([side < 2 ? -1 : 1, 0, 0], yaw); return solveTwoBone(hip, [foot.position[0], foot.position[1] + foxRig.ankleY, foot.position[2]], pole, foxRig.upper, foxRig.lower) })
  return { distance, position, yaw, feet, legs, headDip: -.22 * Math.sin(progress(time, 20, 27.5) * Math.PI), tailYaw: .045 * Math.sin(distance * 4), tailPitch: .09 + .025 * Math.sin(distance * 3) }
}
export const consolePose = { origin: [1.48, 2.14, 1.55] as Vec3, yaw: -.85 }
export const operatorPose = { position: [.95, 1.3, 1.94] as Vec3, yaw: 1.95, shoulder: [.18, .94, .01] as Vec3, upper: .29, lower: .28 }
export function consolePoint(p: Vec3): Vec3 { const r = rotatePoint(p, consolePose.yaw); return r.map((v, i) => v + consolePose.origin[i]) as Vec3 }
export const controlCenter = consolePoint([0, .038, .19])
export function operatorAction(time: number) {
  const shoulder = rotatePoint(operatorPose.shoulder, operatorPose.yaw).map((v, i) => v + operatorPose.position[i]) as Vec3
  const rest: Vec3 = [1.17, 2.24, 1.97], target: Vec3 = [controlCenter[0], controlCenter[1] + .027, controlCenter[2]]
  let hand: Vec3
  if (time < 30.7) hand = rest.map((v, i) => mix(v, target[i] + (i === 1 ? .035 : 0), smoother(progress(time, 29.3, 30.7)))) as Vec3
  else if (time < 31) hand = [target[0], target[1] + .035 * (1 - smoother(progress(time, 30.7, 31))), target[2]]
  else if (time <= 31.6) hand = target
  else hand = target.map((v, i) => mix(v, rest[i], smoother(progress(time, 31.6, 33)))) as Vec3
  const arm = solveTwoBone(shoulder, hand, [0, .3, 1], operatorPose.upper, operatorPose.lower)
  return { ...arm, hand, contact: time >= 31 && time <= 31.6, dismiss: smoother(progress(time, 31.1, 32.6)) }
}
