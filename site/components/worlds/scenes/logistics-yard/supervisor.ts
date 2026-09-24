import type { Vec3 } from '../../contract'
import { mix, progress, smooth } from '../../math'

/** The rendered solid boxes and the authored footfalls use the same support surfaces. */
export const dispatchAccess = {
  platform: { position: [26, .23, -8] as Vec3, size: [13.4, .46, 8.3] as Vec3 },
  upperStep: { position: [20.5, .12, -3.45] as Vec3, size: [3.7, .22, 1.4] as Vec3 },
  lowerStep: { position: [20.5, .06, -2.52] as Vec3, size: [3.7, .1, .6] as Vec3 },
  apronTop: .05,
}
const top = (surface: { position: Vec3; size: Vec3 }) => surface.position[1] + surface.size[1] / 2
const platformY = top(dispatchAccess.platform), upperY = top(dispatchAccess.upperStep), lowerY = top(dispatchAccess.lowerStep)

/** Sole-bottom coordinates, paired with the dispatch plinth and front steps. */
export type FootPose = { position: Vec3; yaw: number; planted: boolean }
type Footfall = FootPose & { side: 0 | 1; from: number; to: number }
function landing(x: number, y: number, z: number, yaw: number, side: 0 | 1): FootPose {
  const offset = side === 0 ? -.14 : .14
  return { position: [x + Math.cos(yaw) * offset, y, z - Math.sin(yaw) * offset], yaw, planted: true }
}
const initial: [FootPose, FootPose] = [landing(20.7, platformY, -6.5, -.56, 0), landing(20.7, platformY, -6.5, -.56, 1)]
const steps: Footfall[] = [
  { side: 0, from: 27.1, to: 27.65, ...landing(20.7, platformY, -5.95, 0, 0) },
  { side: 1, from: 27.65, to: 28.2, ...landing(20.7, platformY, -5.4, 0, 1) },
  { side: 0, from: 28.2, to: 28.75, ...landing(20.7, platformY, -4.85, 0, 0) },
  { side: 1, from: 28.75, to: 29.3, ...landing(20.7, platformY, -4.3, 0, 1) },
  { side: 0, from: 29.3, to: 29.85, ...landing(20.7, upperY, -3.5, 0, 0) },
  { side: 1, from: 29.85, to: 30.4, ...landing(20.7, upperY, -3.08, 0, 1) },
  { side: 0, from: 30.4, to: 30.95, ...landing(20.7, lowerY, -2.48, 0, 0) },
  { side: 1, from: 30.95, to: 31.5, ...landing(20.7, dispatchAccess.apronTop, -1.85, -.4, 1) },
  { side: 0, from: 31.5, to: 32.05, ...landing(20.15, dispatchAccess.apronTop, -1.85, -Math.PI / 2, 0) },
  { side: 1, from: 32.05, to: 32.6, ...landing(19.5, dispatchAccess.apronTop, -1.85, -Math.PI / 2, 1) },
  { side: 0, from: 32.6, to: 33.15, ...landing(18.85, dispatchAccess.apronTop, -1.9, -1.38, 0) },
  { side: 1, from: 33.15, to: 33.7, ...landing(17.9, dispatchAccess.apronTop, -2.1, -.96, 1) },
  { side: 0, from: 33.7, to: 34, ...landing(17.9, dispatchAccess.apronTop, -2.1, -.96, 0) },
]

/** Each swing lifts, crosses the edge above both surfaces, then lands. No accumulated gait state. */
export function supervisorFoot(side: 0 | 1, time: number): FootPose {
  let previous = initial[side]
  for (const step of steps) {
    if (step.side !== side) continue
    if (time <= step.from) return previous
    if (time >= step.to) { previous = step; continue }
    const u = progress(time, step.from, step.to), travel = smooth(progress(u, .2, .8))
    const clearance = Math.max(previous.position[1], step.position[1]) + .14
    const y = u < .2 ? mix(previous.position[1], clearance, smooth(u / .2))
      : u > .8 ? mix(clearance, step.position[1], smooth((u - .8) / .2)) : clearance
    return {
      position: [mix(previous.position[0], step.position[0], travel), y, mix(previous.position[2], step.position[2], travel)],
      yaw: mix(previous.yaw, step.yaw, travel), planted: false,
    }
  }
  return previous
}
export function supervisorPose(time: number) {
  const feet: [FootPose, FootPose] = [supervisorFoot(0, time), supervisorFoot(1, time)]
  const position = feet[0].position.map((v, i) => (v + feet[1].position[i]) / 2) as Vec3
  const yaw = (feet[0].yaw + feet[1].yaw) / 2
  return { feet, position, yaw }
}
