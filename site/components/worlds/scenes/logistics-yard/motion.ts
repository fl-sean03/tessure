import type { Vec3 } from '../../contract'
import { clamp, mix, progress } from '../../math'
import { smoother } from './gait'

/** Quintic distance with matched endpoint velocity and zero endpoint acceleration. */
function travel(time: number, start: number, end: number, a: number, b: number, va: number, vb: number) {
  const u = progress(time, start, end), duration = end - start, distance = b - a, v0 = va * duration, v1 = vb * duration
  return a + v0 * u + (10 * distance - 6 * v0 - 4 * v1) * u ** 3 + (-15 * distance + 8 * v0 + 7 * v1) * u ** 4 + (6 * distance - 3 * v0 - 3 * v1) * u ** 5
}
export function vehicleX(time: number) {
  if (time < 4) return travel(time, 0, 4, -20, -15, 1.25, 1.5)
  if (time < 18) return travel(time, 4, 18, -15, 7.4, 1.5, 1.5)
  return travel(time, 18, 25, 7.4, 13.6, 1.5, 0)
}
export const crane = { railTop: 17.485, wheelRadius: .23, wheelY: 17.715, cableTop: 17.76, cableXs: [-21.75, -18.25], cableZs: [-.8, .8], anchorY: .21 } as const
export function trolleyPose(time: number) {
  const z = mix(-16, -13.4, smoother(progress(time, 6, 10))), y = mix(5.1, 10.2, smoother(progress(time, 0, 6)))
  return { z, y, wheelAngle: (z + 16) / crane.wheelRadius }
}

export const dock = { x: 25.4, z: -6.9, roofTop: 3.7875, surfaceY: 4.18, coverY: 5.17, coverTravel: 1.5, halfWidth: 1.45, halfDepth: 1.3 } as const
export const droneTimes = { open: 27.2, opened: 29.6, power: 29.7, lift: 31, cruise: 34.5, observe: 40.5, returning: 46.5, descend: 52.5, landed: 56, stopped: 57.5, close: 58, closed: 60.4, record: 62, end: 66 } as const
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
  { id: 'aisle-camera', kind: 'camera', origin: [-23.8, 5.58, 12], target: [-10, 3.1, 0], horizontal: 84, vertical: 50, range: 42, from: 4, to: 18 },
  { id: 'apron-camera', kind: 'camera', origin: [-2.5, 6.12, 3.8], target: [-6, 2.6, 0], horizontal: 90, vertical: 65, range: 26, from: 11, to: 26 },
  { id: 'apron-radar', kind: 'radar', origin: [-2.5, 4.58, 3.72], target: [-2.5, 1.8, 0], horizontal: 140, vertical: 75, range: 28, from: 11, to: 62 },
  { id: 'thermal-head', kind: 'thermal', origin: [-1.65, 5.35, 3.8], target: [-5.8, 2.6, 0], horizontal: 80, vertical: 65, range: 22, from: 11, to: 26 },
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
export function sensorSubject(time: number, kind: Sensor['kind'] = 'camera'): Vec3 { return kind === 'thermal' ? [vehicleX(time) + .8, 2, 0] : kind === 'radar' ? [vehicleX(time), 1.5, 0] : [vehicleX(time) - 3.2, 3.4, 0] }
