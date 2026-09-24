import type { Vec3 } from '../../contract'
import { mix, progress } from '../../math'
import { smoother } from './gait'
/** Shared authored times; illustration pacing, never operational response latency. */
export const T = { controlsAt: 2.5, hoistStart: 3, detect: 8, locked: 9.5, lifted: 13.5, overCarrier: 21.5, deposited: 26, released: 27.5, craneSafe: 31, verify: 31, sensors: 35, correlate: 40, stopped: 46, decide: 48, respond: 49, supervisorAt: 55.35, control: 57, signal: 59, attendantStart: 55.5, attendantAt: 61.5, guided: 62.5, insiderWalk: 64.5, checkpoint: 74.5, droneOpen: 75, droneLift: 78.8, droneObserve: 88.3, droneReturn: 94.3, droneLand: 103.8, droneClosed: 108.2, resolve: 114, end: 122 } as const
export const load = { x: -20, sourceZ: -11, bayZ: -5.5, roadZ: 0, sourceBottom: .18, carrierBottom: 1.43, height: 2.88, length: 6.1, halfCornerX: 2.98, halfCornerZ: 1.16, toolOffset: 2.98 } as const
export const carrierStart = load.x + 5.3
const ease = (t: number, a: number, b: number) => smoother(progress(t, a, b))
export function carrierX(t: number) { return mix(carrierStart, 13.6, ease(t, T.verify, T.stopped)) }
export function transferPose(t: number) {
  let bottom: number = load.sourceBottom, z: number = load.sourceZ
  if (t >= T.locked) bottom = mix(load.sourceBottom, 5.1, ease(t, T.locked, T.lifted))
  if (t >= T.lifted) z = mix(load.sourceZ, load.roadZ, ease(t, T.lifted, T.overCarrier))
  if (t >= T.overCarrier) bottom = mix(5.1, load.carrierBottom, ease(t, T.overCarrier, T.deposited))
  const x = t >= T.deposited ? carrierX(t) - 5.3 : load.x
  const toolY = t < T.detect ? mix(6.3, load.sourceBottom + load.toolOffset, ease(t, T.hoistStart, T.detect)) : t < T.released ? bottom + load.toolOffset : mix(load.carrierBottom + load.toolOffset, 8.8, ease(t, T.released, T.craneSafe))
  const lock = ease(t, T.detect, T.locked) * (1 - ease(t, T.deposited + .65, T.released))
  return { load: [x, bottom, z] as Vec3, tool: [load.x, toolY, z] as Vec3, trolleyZ: z, lock, attached: t >= T.locked && t < T.deposited, supported: t <= T.locked || t >= T.deposited, carrierLocked: ease(t, T.deposited + .05, T.deposited + .6), wheelAngle: (z - load.sourceZ) / .23 }
}
export const controls = { crane: [-14.8, 1.15, -5.25] as Vec3, supervisor: [17.55, 1.32, -2.6] as Vec3, checkpoint: [-6, .05, -5.8] as Vec3 }
