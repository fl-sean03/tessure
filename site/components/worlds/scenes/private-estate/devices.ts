import type { Vec3 } from '../../contract'
import { surfaceY } from './surface'
export type Device = { id: 'camera' | 'thermal'; position: Vec3; target: Vec3; mount: Vec3; near: number; far: number; halfAngle: number }
export const devices: Device[] = [
  { id: 'camera', position: [-7.12, 2.30, 1.83], target: [-4.6, .65, 4.7], mount: [-7.12, 2.45, 1.445], near: 4.15, far: 5.55, halfAngle: .95 },
  { id: 'thermal', position: [.02, 3.35, 2.64], target: [-1.35, .65, 4.8], mount: [.02, 3.42, 2.415], near: 4.15, far: 5.55, halfAngle: .89 },
]
export function deviceDirection(device: Device): Vec3 { const d = device.target.map((v, i) => v - device.position[i]) as Vec3, n = Math.hypot(...d); return d.map(v => v / n) as Vec3 }
/** Front optical surface, including the thermal lens's offset within its housing. */
export function lensLocal(device: Device): Vec3 { return device.id === 'thermal' ? [-.033, .018, .171] : [0, -.005, .228] }
export function lensPosition(device: Device): Vec3 {
  const d = deviceDirection(device), h = Math.hypot(d[0], d[2]), right: Vec3 = [d[2] / h, 0, -d[0] / h]
  const up: Vec3 = [-d[1] * d[0] / h, h, -d[1] * d[2] / h], local = lensLocal(device)
  return device.position.map((v, i) => v + right[i] * local[0] + up[i] * local[1] + d[i] * local[2]) as Vec3
}
/** A bounded authored garden sector, not a range or calibrated field-of-view specification. */
export function sectorContains(device: Device, position: Vec3) {
  const p = lensPosition(device), direction = deviceDirection(device), a = Math.atan2(position[0] - p[0], position[2] - p[2]), center = Math.atan2(direction[0], direction[2])
  return position[2] >= device.near && position[2] <= device.far && position[0] >= -10 && position[0] <= 7 && Math.abs(a - center) <= device.halfAngle
}
export function sectorEdges(device: Device, z: number) {
  const p = lensPosition(device), d = deviceDirection(device), yaw = Math.atan2(d[0], d[2]), low = Math.max(-1.4, yaw - device.halfAngle), high = Math.min(1.4, yaw + device.halfAngle)
  return [Math.max(-10, p[0] + (z - p[2]) * Math.tan(low)), Math.min(7, p[0] + (z - p[2]) * Math.tan(high))]
}
export function sectorGrid(device: Device) {
  const vertices: number[] = [], outline: Vec3[] = []
  for (let j = 0; j <= 8; j++) {
    const z = device.near + (device.far - device.near) * j / 8, edge = sectorEdges(device, z)
    outline.push([edge[0], surfaceY(edge[0], z) + .012, z])
    if (j === 8) for (let k = 1; k <= 24; k++) { const x = edge[0] + (edge[1] - edge[0]) * k / 24; outline.push([x, surfaceY(x, z) + .012, z]) }
  }
  for (let j = 7; j >= 0; j--) { const z = device.near + (device.far - device.near) * j / 8, x = sectorEdges(device, z)[1]; outline.push([x, surfaceY(x, z) + .012, z]) }
  for (let j = 0; j < 8; j++) for (let k = 0; k < 24; k++) {
    const point = (jj: number, kk: number): Vec3 => { const z = device.near + (device.far - device.near) * jj / 8, edge = sectorEdges(device, z), x = edge[0] + (edge[1] - edge[0]) * kk / 24; return [x, surfaceY(x, z) + .012, z] }
    const a = point(j, k), b = point(j, k + 1), c = point(j + 1, k), d = point(j + 1, k + 1)
    vertices.push(...a, ...c, ...b, ...b, ...c, ...d)
  }
  return { vertices, outline }
}
