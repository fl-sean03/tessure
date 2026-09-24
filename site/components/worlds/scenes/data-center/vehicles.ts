import { clamp, progress } from '../../math'

/** Authored metres, +Y up, vehicle forward -Z. Pose is referenced to the rear axle. */
export const roadY = .13
export const vehicleSpec = (small = false) => ({
  radius: small ? .43 : .51, halfTrack: (small ? 2.1 : 2.42) * .48,
  frontZ: small ? -1.5 : -2.3, rearZ: small ? 1.67 : 2.47,
  wheelbase: small ? 3.17 : 4.77,
})
export const wheelLayout = (small = false) => {
  const v = vehicleSpec(small)
  return [true, false].flatMap(front => [-1, 1].map(side => ({
    front, side, x: side * v.halfTrack, z: front ? v.frontZ : v.rearZ,
  })))
}
const wheels = wheelLayout(), truck = vehicleSpec()
// Stop on the receiving approach, aimed into the far bay with room ahead of its bollards.
const outerX = 9.8, radius = 7, turnAngle = 55 * Math.PI / 180
const turnZ = -25 + (3.46 + truck.rearZ) * Math.cos(turnAngle) + radius * Math.sin(turnAngle)
const laneZ = .47 - turnZ, laneX = outerX - 4.8
const smoother = (u: number) => u ** 3 * (10 + u * (-15 + 6 * u))
const seventh = (u: number) => u ** 4 * (35 + u * (-84 + u * (70 - 20 * u)))

type Rear = { x: number; z: number; heading: number; curvature: number }
function lane(u: number): Rear {
  const dx = laneX * 140 * u ** 3 * (1 - u) ** 3
  const ddx = laneX * 420 * u ** 2 * (1 - u) ** 2 * (1 - 2 * u)
  return { x: 4.8 + laneX * seventh(u), z: .47 - laneZ * u,
    heading: -Math.atan2(dx, laneZ), curvature: -laneZ * ddx / (dx * dx + laneZ * laneZ) ** 1.5 }
}
function circle(u: number): Rear {
  const heading = u * turnAngle
  return { x: outerX - radius + radius * Math.cos(heading), z: turnZ - radius * Math.sin(heading), heading, curvature: 1 / radius }
}
function wheelPoint(p: Rear, x: number, z: number) {
  return [p.x + x * Math.cos(p.heading) + z * Math.sin(p.heading), p.z - x * Math.sin(p.heading) + z * Math.cos(p.heading)]
}
// Immutable arc-length tables, constructed once; no frame/delta integration or mutable travel state.
function table(path: (u: number) => Rear) {
  let previous = path(0), distance = 0
  const rolling = [0, 0, 0, 0], rows = [{ u: 0, distance, rolling: [...rolling] }]
  for (let i = 1; i <= 2048; i++) {
    const u = i / 2048, next = path(u)
    distance += Math.hypot(next.x - previous.x, next.z - previous.z)
    wheels.forEach((w, j) => {
      const a = wheelPoint(previous, w.x, w.front ? -truck.wheelbase : 0)
      const b = wheelPoint(next, w.x, w.front ? -truck.wheelbase : 0)
      const mid = path((i - .5) / 2048)
      const steer = w.front ? Math.atan2(truck.wheelbase * mid.curvature, 1 + w.x * mid.curvature) : 0
      const heading = mid.heading + steer
      const forward = -(b[0] - a[0]) * Math.sin(heading) - (b[1] - a[1]) * Math.cos(heading)
      rolling[j] += Math.sign(forward) * Math.hypot(b[0] - a[0], b[1] - a[1])
    })
    rows.push({ u, distance, rolling: [...rolling] }); previous = next
  }
  return rows
}
const laneTable = table(lane), turnTable = table(circle)
const laneLength = laneTable.at(-1)!.distance, turnLength = turnTable.at(-1)!.distance
function sample(rows: ReturnType<typeof table>, distance: number) {
  const d = clamp(distance, 0, rows.at(-1)!.distance)
  let lo = 0, hi = rows.length - 1
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (rows[mid].distance <= d) lo = mid; else hi = mid }
  const a = rows[lo], b = rows[hi], u = (d - a.distance) / (b.distance - a.distance)
  return { u: a.u + (b.u - a.u) * u, rolling: a.rolling.map((v, i) => v + (b.rolling[i] - v) * u) }
}
type Key = [time: number, distance: number, velocity: number]
/** Quintic Hermite distance: prescribed positive velocities, zero acceleration at every join. */
function travel(t: number, keys: Key[]) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const [a, s0, v0] = keys[i - 1], [b, s1, v1] = keys[i], h = b - a, u = (t - a) / h
    const d = s1 - s0 - v0 * h, v = (v1 - v0) * h
    return s0 + v0 * h * u + (10 * d - 4 * v) * u ** 3 + (-15 * d + 7 * v) * u ** 4 + (6 * d - 3 * v) * u ** 5
  }
  return keys.at(-1)![1]
}
const truckKeys: Key[] = [[0, 0, 0], [4, 7, 1.5], [11, 14, 1.5], [18, 26, 2], [24.5, 26 + laneLength, 0]]
const vanKeys: Key[] = [[0, 0, 0], [4, 3.5, .9], [11, 11.5, 1], [18, 18, .7], [24, 22, 0]]

export function vehiclePose(t: number, small = false) {
  if (small) {
    const s = travel(t, vanKeys)
    return { x: 4.8, z: 32.5 - s, heading: 0, rearX: 4.8, rearZ: 34.17 - s,
      wheels: [0, 1, 2, 3].map(() => ({ steer: 0, roll: -s / .43, distance: s })) }
  }
  let p: Rear, distances: number[], curvature: number
  const s = travel(t, truckKeys)
  if (t < 18) {
    p = { x: 4.8, z: 26.47 - s, heading: 0, curvature: 0 }; distances = [s, s, s, s]; curvature = 0
  } else if (t < 24.5) {
    const a = sample(laneTable, s - 26); p = lane(a.u); distances = a.rolling.map(d => 26 + d); curvature = p.curvature
  } else {
    const a = sample(turnTable, turnLength * smoother(progress(t, 26, 32)))
    p = circle(a.u); distances = a.rolling.map((d, i) => 26 + laneTable.at(-1)!.rolling[i] + d)
    // Steer while stopped, then make a rolling turn; unwind only after the body has stopped.
    curvature = p.curvature * smoother(progress(t, 24.5, 26)) * (1 - smoother(progress(t, 32, 33.5)))
  }
  return { x: p.x - truck.rearZ * Math.sin(p.heading), z: p.z - truck.rearZ * Math.cos(p.heading),
    heading: p.heading, rearX: p.x, rearZ: p.z,
    wheels: wheels.map((w, i) => ({ steer: w.front ? Math.atan2(truck.wheelbase * curvature, 1 + w.x * curvature) : 0,
      roll: -distances[i] / truck.radius, distance: distances[i] })) }
}
