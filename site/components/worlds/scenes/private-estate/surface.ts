import type { Vec3 } from '../../contract'
export type Triangle = [Vec3, Vec3, Vec3]
export const groundY = (x: number, z: number) => .04 + Math.max(0, -z - 1.5) * .105 + Math.max(0, Math.abs(x) - 10) * .045 + Math.sin(x * .29) * Math.sin(z * .3) * .055
export const pathZ = (x: number) => 4.7 + .24 * Math.sin(x * .33)
/** Exactly the two triangles in each rendered terrain cell, not a different smooth heightfield. */
export function terrainY(x: number, z: number) {
  const d = 2.25, a = Math.floor((x + 45) / d) * d - 45, b = Math.floor((z + 45) / d) * d - 45, u = (x - a) / d, v = (z - b) / d
  return u + v <= 1 ? groundY(a, b) * (1 - u - v) + groundY(a + d, b) * u + groundY(a, b + d) * v : groundY(a + d, b + d) * (u + v - 1) + groundY(a, b + d) * (1 - u) + groundY(a + d, b) * (1 - v)
}
export const pathPoints: Vec3[] = Array.from({ length: 49 }, (_, i) => { const x = -12 + i * .5; return [x, terrainY(x, pathZ(x)) + .07, pathZ(x)] })
export const pathTriangles: Triangle[] = []
for (let i = 1; i < pathPoints.length; i++) {
  const p = pathPoints[i - 1], q = pathPoints[i], dx = q[0] - p[0], dz = q[2] - p[2], length = Math.hypot(dx, dz), ox = -dz / length * .675, oz = dx / length * .675
  const a: Vec3 = [p[0] - ox, p[1], p[2] - oz], b: Vec3 = [p[0] + ox, p[1], p[2] + oz], c: Vec3 = [q[0] - ox, q[1], q[2] - oz], d: Vec3 = [q[0] + ox, q[1], q[2] + oz]
  pathTriangles.push([a, b, c], [c, b, d])
}
/** The court is a shallow graded mesh; these very triangles are also the contact surface. */
const courtPoint = (r: number, angle: number): Vec3 => {
  const xx = Math.cos(angle) * 4.6 * r, zz = Math.sin(angle) * 7.8 * r, x = -9 + Math.cos(-.15) * xx + Math.sin(-.15) * zz, z = 7.7 - Math.sin(-.15) * xx + Math.cos(-.15) * zz
  return [x, Math.max(terrainY(x, z) + .018, .15 - .04 * r * r), z]
}
export const courtTriangles: Triangle[] = []
for (let ring = 0; ring < 8; ring++) for (let j = 0; j < 48; j++) {
  const a = courtPoint(ring / 8, j / 48 * Math.PI * 2), b = courtPoint((ring + 1) / 8, j / 48 * Math.PI * 2), c = courtPoint((ring + 1) / 8, (j + 1) / 48 * Math.PI * 2), d = courtPoint(ring / 8, (j + 1) / 48 * Math.PI * 2)
  courtTriangles.push([a, c, b]); if (ring) courtTriangles.push([a, d, c])
}
const patches = [...courtTriangles, ...pathTriangles].map(triangle => ({ triangle, minX: Math.min(...triangle.map(p => p[0])), maxX: Math.max(...triangle.map(p => p[0])), minZ: Math.min(...triangle.map(p => p[2])), maxZ: Math.max(...triangle.map(p => p[2])) }))
export function surfaceY(x: number, z: number) {
  let y = terrainY(x, z)
  for (const { triangle: [a, b, c], minX, maxX, minZ, maxZ } of patches) {
    if (x < minX - 1e-9 || x > maxX + 1e-9 || z < minZ - 1e-9 || z > maxZ + 1e-9) continue
    const determinant = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2])
    const u = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / determinant
    const v = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / determinant
    if (u >= -1e-8 && v >= -1e-8 && u + v <= 1 + 1e-8) y = Math.max(y, a[1] * u + b[1] * v + c[1] * (1 - u - v))
  }
  return y
}
