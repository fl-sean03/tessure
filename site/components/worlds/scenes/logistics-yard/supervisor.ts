import type { Vec3 } from '../../contract'
import { mix, progress, smooth } from '../../math'
import { makeWalkingPath, smoothMinimum, smoother, solveTwoBone, walkingDistance } from './gait'

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
type Landing = FootPose & { side: 0 | 1 }
export const supervisorRig = { thigh: .43, shin: .43, hipY: 1, hipWidth: .13, ankleY: .16, reach: .852 } as const
export const supervisorTiming = { start: 27.1, arrived: 33.35, handoff: 34 } as const
function landing(x: number, y: number, z: number, yaw: number, side: 0 | 1): FootPose {
  const offset = side === 0 ? -.14 : .14
  return { position: [x + Math.cos(yaw) * offset, y, z - Math.sin(yaw) * offset], yaw, planted: true }
}
const initial: [FootPose, FootPose] = [landing(20.7, platformY, -6.5, -.56, 0), landing(20.7, platformY, -6.5, -.56, 1)]
const landings: Landing[] = [
  { side: 0, ...landing(20.7, platformY, -5.95, 0, 0) },
  { side: 1, ...landing(20.7, platformY, -5.4, 0, 1) },
  { side: 0, ...landing(20.7, platformY, -4.85, 0, 0) },
  { side: 1, ...landing(20.7, platformY, -4.3, 0, 1) },
  { side: 0, ...landing(20.7, upperY, -3.5, 0, 0) },
  { side: 1, ...landing(20.7, upperY, -3.08, 0, 1) },
  { side: 0, ...landing(20.7, lowerY, -2.48, 0, 0) },
  { side: 1, ...landing(20.7, dispatchAccess.apronTop, -1.85, -.4, 1) },
  { side: 0, ...landing(20.15, dispatchAccess.apronTop, -1.85, -Math.PI / 2, 0) },
  { side: 1, ...landing(19.5, dispatchAccess.apronTop, -1.85, -Math.PI / 2, 1) },
  { side: 0, ...landing(18.85, dispatchAccess.apronTop, -1.9, -1.38, 0) },
  { side: 1, ...landing(17.9, dispatchAccess.apronTop, -2.1, -.96, 1) },
  { side: 0, ...landing(17.9, dispatchAccess.apronTop, -2.1, -.96, 0) },
]


// Contact poses define a smooth pelvis route. Feet remain at their authored supported placements.
const contactFeet: [FootPose, FootPose][] = [initial]
for (const step of landings) { const pair = [...contactFeet.at(-1)!] as [FootPose, FootPose]; pair[step.side] = step; contactFeet.push(pair) }
const centers = contactFeet.map(feet => feet[0].position.map((v, i) => (v + feet[1].position[i]) / 2) as Vec3)
const rounded = centers.map((p, i) => i === 0 || i === centers.length - 1 ? p : p.map((v, j) => .25 * centers[i - 1][j] + .5 * v + .25 * centers[i + 1][j]) as Vec3)
const route = rounded.map((p, i) => i === 0 || i === rounded.length - 1 ? p : p.map((v, j) => .25 * rounded[i - 1][j] + .5 * v + .25 * rounded[i + 1][j]) as Vec3)
const path = makeWalkingPath(route)
const distanceAt = (time: number) => walkingDistance(time, supervisorTiming.start, supervisorTiming.arrived, path.length)
function timeAt(distance: number) {
  let low = supervisorTiming.start as number, high = supervisorTiming.arrived as number
  for (let i = 0; i < 40; i++) { const mid = (low + high) / 2; if (distanceAt(mid) < distance) low = mid; else high = mid }
  return (low + high) / 2
}
const contactTimes = path.knots.map((d, i) => i === 0 ? supervisorTiming.start : i === path.knots.length - 1 ? supervisorTiming.arrived : timeAt(d))
export const supervisorFootfalls = landings.map((step, i) => ({ ...step, from: contactTimes[i], to: contactTimes[i + 1] }))

/** Plant, lift, clear the stair edge, lower, plant. Each stance sole has a fixed world transform. */
export function supervisorFoot(side: 0 | 1, time: number): FootPose {
  let previous = initial[side]
  for (const step of supervisorFootfalls) {
    if (step.side !== side) continue
    if (time <= step.from) return previous
    if (time >= step.to) { previous = step; continue }
    const phase = progress(time, step.from, step.to)
    if (phase <= .04) return previous
    if (phase >= .96) return step
    const u = progress(phase, .04, .96), travel = smoother(u)
    const clearance = Math.max(previous.position[1], step.position[1]) + .115
    const y = u < .2 ? mix(previous.position[1], clearance, smoother(u / .2))
      : u > .8 ? mix(clearance, step.position[1], smoother((u - .8) / .2)) : clearance
    return { position: [mix(previous.position[0], step.position[0], travel), y, mix(previous.position[2], step.position[2], travel)], yaw: mix(previous.yaw, step.yaw, travel), planted: false }
  }
  return previous
}
function hipAt(position: Vec3, yaw: number, side: number): Vec3 {
  const lateral = side === 0 ? -supervisorRig.hipWidth : supervisorRig.hipWidth
  return [position[0] + Math.cos(yaw) * lateral, position[1] + supervisorRig.hipY, position[2] - Math.sin(yaw) * lateral]
}
function heightLimit(position: Vec3, yaw: number, feet: [FootPose, FootPose]) {
  const limits = feet.map((foot, side) => {
    const hip = hipAt(position, yaw, side), horizontal = Math.hypot(hip[0] - foot.position[0], hip[2] - foot.position[2])
    return foot.position[1] + supervisorRig.ankleY + Math.sqrt(Math.max(0, supervisorRig.reach ** 2 - horizontal ** 2)) - supervisorRig.hipY
  })
  return smoothMinimum(limits[0], limits[1])
}
const heights = route.map((position, i) => i === 0 ? platformY : i === centers.length - 1 ? dispatchAccess.apronTop : heightLimit(position, path.sample(path.knots[i]).yaw, contactFeet[i]) - .07)

export function supervisorPose(time: number) {
  const shot = path.sample(distanceAt(time)), feet: [FootPose, FootPose] = [supervisorFoot(0, time), supervisorFoot(1, time)]
  let yaw = mix(-.56, shot.yaw, smooth(progress(time, supervisorTiming.start, supervisorTiming.start + .55)))
  if (time >= supervisorTiming.arrived) yaw = mix(shot.yaw, -.96, smooth(progress(time, supervisorTiming.arrived, supervisorTiming.handoff)))
  const { segment, u } = shot, position = [...shot.position] as Vec3
  const stepHeight = Math.abs(heights[segment + 1] - heights[segment]), bob = .032 * (1 - smooth(stepHeight / .18)) * Math.sin(Math.PI * u) ** 2
  const nominal = mix(heights[segment], heights[segment + 1], smooth(progress(u, 0, heights[segment + 1] < heights[segment] ? .8 : 1))) + bob
  position[1] = smoothMinimum(nominal, heightLimit(position, yaw, feet))
  if (time <= supervisorTiming.start) { position[0] = 20.7; position[1] = platformY; position[2] = -6.5 }
  if (time >= supervisorTiming.arrived) { position[0] = 17.9; position[1] = dispatchAccess.apronTop; position[2] = -2.1 }
  const pole: Vec3 = [Math.sin(yaw), 0, Math.cos(yaw)]
  const legs = feet.map((foot, side) => solveTwoBone(hipAt(position, yaw, side), [foot.position[0], foot.position[1] + supervisorRig.ankleY, foot.position[2]], pole, supervisorRig.thigh, supervisorRig.shin))
  return { feet, position, yaw, legs }
}
