import type { Vec3 } from '../../contract'
import { clamp, mix, progress } from '../../math'
import { smoother } from './gait'
import { carrierX, transferPose, T } from './incident'

export const vehicleX = carrierX

export const crane = { railTop: 17.485, wheelRadius: .23, wheelY: 17.715, cableTop: 17.76, cableXs: [-21.75, -18.25], cableZs: [-.8, .8], anchorY: .21 } as const
export function trolleyPose(time: number) { const p=transferPose(time);return{z:p.trolleyZ,y:p.tool[1],wheelAngle:p.wheelAngle} }

export const dock = { x: 25.4, z: -6.9, roofTop: 3.7875, surfaceY: 4.18, coverY: 5.17, coverTravel: 1.5, halfWidth: 1.45, halfDepth: 1.3 } as const
export const droneTimes = { open: T.droneOpen, opened: 77.4, power: 77.5, lift: T.droneLift, cruise: 82.3, observe: T.droneObserve, returning: T.droneReturn, descend: 100.3, landed: T.droneLand, stopped: 105.3, close: 105.8, closed: T.droneClosed, record: T.resolve, end: T.end } as const
export const rotorCenters: Vec3[] = [-1, 1].flatMap(x => [-1, 1].map(z => [x * .58, .79, z * .58] as Vec3))
export const droneSkids: Vec3[] = [-.42, .42].flatMap(x => [-.43, .43].map(z => [x, 0, z] as Vec3))
export const gimbalMount: Vec3 = [0, .24, .43]
const parked: Vec3 = [dock.x, dock.surfaceY, dock.z], overhead: Vec3 = [dock.x, 8.6, dock.z], observation: Vec3 = [20, 9, -13]
const interpolate = (a: Vec3, b: Vec3, t: number, start: number, end: number): Vec3 => a.map((v, i) => mix(v, b[i], smoother(progress(t, start, end)))) as Vec3
export function dronePosition(time: number): Vec3 {
  if (time < droneTimes.lift) return [...parked]
  if (time < droneTimes.cruise) return interpolate(parked, overhead, time, droneTimes.lift, droneTimes.cruise)
  if (time < droneTimes.observe) return interpolate(overhead, observation, time, droneTimes.cruise, droneTimes.observe)
  if (time < droneTimes.returning) return [...observation]
  if (time < droneTimes.descend) return interpolate(observation, overhead, time, droneTimes.returning, droneTimes.descend)
  return interpolate(overhead, parked, time, droneTimes.descend, droneTimes.landed)
}
// Integral of the quintic power envelope; a paused timestamp freezes every blade.
function poweredTime(time: number, start: number, end: number) {
  const d = end - start, u = progress(time, start, end)
  return d * (u ** 6 - 3 * u ** 5 + 2.5 * u ** 4) + Math.max(0, time - end)
}
export function dronePose(time: number) {
  const position = dronePosition(time), target: Vec3 = [8.3, 3.2, 0], dt = .01
  const before = dronePosition(time - dt), after = dronePosition(time + dt), acceleration = position.map((v, i) => (after[i] - 2 * v + before[i]) / (dt * dt)) as Vec3
  const yaw = Math.atan2(target[0] - position[0], target[2] - position[2]), forward = acceleration[0] * Math.sin(yaw) + acceleration[2] * Math.cos(yaw), right = acceleration[0] * Math.cos(yaw) - acceleration[2] * Math.sin(yaw)
  const pitch = clamp(Math.atan2(forward, 9.81), -.17, .17), roll = clamp(-Math.atan2(right, 9.81), -.17, .17)
  // Inverse YXZ body rotation, then subtract the local gimbal pivot.
  const delta = target.map((v, i) => v - position[i]) as Vec3
  const x = Math.cos(yaw) * delta[0] - Math.sin(yaw) * delta[2], z = Math.sin(yaw) * delta[0] + Math.cos(yaw) * delta[2]
  const y2 = Math.cos(pitch) * delta[1] + Math.sin(pitch) * z, z2 = -Math.sin(pitch) * delta[1] + Math.cos(pitch) * z
  const local: Vec3 = [Math.cos(roll) * x + Math.sin(roll) * y2 - gimbalMount[0], -Math.sin(roll) * x + Math.cos(roll) * y2 - gimbalMount[1], z2 - gimbalMount[2]]
  const rotor = 96 * (poweredTime(time, droneTimes.power, droneTimes.lift) - poweredTime(time, droneTimes.landed, droneTimes.stopped))
  const cover = smoother(progress(time, droneTimes.open, droneTimes.opened)) * (1 - smoother(progress(time, droneTimes.close, droneTimes.closed)))
  return { position, target, yaw, pitch, roll, cover, rotor, gimbalYaw: Math.atan2(local[0], local[2]), gimbalPitch: -Math.atan2(local[1], Math.hypot(local[0], local[2])), observing: time >= droneTimes.observe && time <= droneTimes.returning }
}

export type Sensor = { id: string; kind: 'camera' | 'radar' | 'thermal'; origin: Vec3; target: Vec3; horizontal: number; vertical: number; range: number; from: number; to: number }
/** Illustration sectors in authored geometry, not product specifications or detection ranges. */
export const sensors: Sensor[] = [
  { id: 'aisle-camera', kind: 'camera', origin: [-26, 7.1, 12], target: [-20, 3.8, -5.5], horizontal: 95, vertical: 75, range: 35, from: T.detect, to: T.verify + 3 },
  { id: 'apron-camera', kind: 'camera', origin: [-2.5, 6.12, 3.8], target: [-2.5, 2.6, 0], horizontal: 160, vertical: 65, range: 30, from: T.overCarrier, to: T.end },
  { id: 'apron-radar', kind: 'radar', origin: [-2.5, 4.58, 3.72], target: [-2.5, 1.8, 0], horizontal: 150, vertical: 75, range: 32, from: T.verify, to: T.end },
  { id: 'thermal-head', kind: 'thermal', origin: [-1.65, 5.35, 3.8], target: [-11, 1.6, -5.5], horizontal: 100, vertical: 65, range: 30, from: T.verify, to: T.insiderWalk },
]

export function sensorFrame(sensor: Sensor) {
  const d = sensor.target.map((v, i) => v - sensor.origin[i]) as Vec3
  return { yaw: Math.atan2(d[0], d[2]), pitch: -Math.atan2(d[1], Math.hypot(d[0], d[2])) }
}
export function inSector(sensor: Sensor, point: Vec3) {
  const { yaw, pitch } = sensorFrame(sensor), d = point.map((v, i) => v - sensor.origin[i]) as Vec3
  const x = Math.cos(yaw) * d[0] - Math.sin(yaw) * d[2], z = Math.sin(yaw) * d[0] + Math.cos(yaw) * d[2]
  const y2 = Math.cos(pitch) * d[1] + Math.sin(pitch) * z, z2 = -Math.sin(pitch) * d[1] + Math.cos(pitch) * z
  return z2 > 0 && Math.hypot(...d) <= sensor.range && Math.abs(Math.atan2(x, z2)) <= sensor.horizontal * Math.PI / 360 && Math.abs(Math.atan2(y2, z2)) <= sensor.vertical * Math.PI / 360
}
export function sensorSubject(time: number, kind: Sensor['kind'] = 'camera'): Vec3 { return kind === 'thermal' ? [-14.8, 1.65, -4.5] : kind === 'radar' ? [vehicleX(time), 1.5, 0] : [vehicleX(time) - 5.3, 3.4, 0] }
export function transferSubject(time:number):Vec3 {const p=transferPose(time).load;return[p[0],p[1]+1.44,p[2]]}
