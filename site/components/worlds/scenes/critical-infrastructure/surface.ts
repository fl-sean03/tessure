import type { Vec3 } from '../../contract'
import { smoother } from '../../kinematics'
export const apron = { x0: 8.225, x1: 17.975, start: 7.15, end: 8.65, segments: 40 }
export const apronHeight = (z: number) => .46 - .23 * smoother((z - apron.start) / (apron.end - apron.start))
/** Same piecewise surface used by the actual concrete mesh. */
export function supportY(x: number, z: number) {
  if (x >= apron.x0 && x <= apron.x1 && z >= 5.025 && z <= apron.end) {
    if (z <= apron.start) return .46
    const f = (z - apron.start) / (apron.end - apron.start) * apron.segments, i = Math.min(apron.segments - 1, Math.floor(f))
    const z0 = apron.start + i / apron.segments * (apron.end - apron.start), z1 = z0 + (apron.end - apron.start) / apron.segments
    return apronHeight(z0) + (apronHeight(z1) - apronHeight(z0)) * (f - i)
  }
  if(x>=12.4&&x<=32.4&&z>=11.4&&z<=20.9)return .23
  return z > 13 ? -.019 : .23
}
export type SoleFrame = { position: Vec3; right: Vec3; up: Vec3; forward: Vec3; yaw: number }
export function soleFrame(x: number, z: number, yaw: number): SoleFrame {
  const slope = x >= apron.x0 && x <= apron.x1 && z > apron.start && z < apron.end ? (apronHeight(z + .001) - apronHeight(z - .001)) / .002 : 0
  const n = Math.hypot(1, slope), up: Vec3 = [0, 1 / n, -slope / n], f: Vec3 = [Math.sin(yaw), slope * Math.cos(yaw), Math.cos(yaw)], fl = Math.hypot(...f), forward = f.map(v => v / fl) as Vec3
  const right: Vec3 = [up[1] * forward[2] - up[2] * forward[1], up[2] * forward[0], -up[1] * forward[0]]
  let y = supportY(x, z)
  // Flat sole rests on the highest point below its oriented footprint, including apron transitions.
  for (let i = 0; i <= 6; i++) for (let j = 0; j <= 12; j++) { const xx = -.095 + i * .19 / 6, zz = -.095 + j * .30 / 12; y = Math.max(y, supportY(x + right[0] * xx + forward[0] * zz, z + right[2] * xx + forward[2] * zz) - right[1] * xx - forward[1] * zz) }
  return { position: [x, y + .001, z], right, up, forward, yaw }
}
