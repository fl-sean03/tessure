import type { Vec3 } from '../../contract'
import { clamp, mix, progress } from '../../math'

export const smoother = (v: number) => { const x = clamp(v); return x * x * x * (x * (x * 6 - 15) + 10) }
const add = (a: Vec3, b: Vec3, s = 1): Vec3 => a.map((v, i) => v + b[i] * s) as Vec3
const sub = (a: Vec3, b: Vec3): Vec3 => a.map((v, i) => v - b[i]) as Vec3
const dot = (a: Vec3, b: Vec3) => a.reduce((n, v, i) => n + v * b[i], 0)
const unit = (v: Vec3): Vec3 => { const length = Math.hypot(...v); return v.map(n => n / length) as Vec3 }

/** Analytic two-bone IK. Caller keeps the ankle within reach; segment lengths never change. */
export function solveTwoBone(hip: Vec3, ankle: Vec3, pole: Vec3, upper: number, lower: number) {
  const delta = sub(ankle, hip), distance = Math.hypot(...delta), axis = unit(delta)
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance)
  const bend = Math.sqrt(Math.max(0, upper * upper - along * along))
  const normal = unit(add(pole, axis, -dot(pole, axis)))
  return { hip, knee: add(add(hip, axis, along), normal, bend), ankle }
}

/** Immutable arc-length lookup of an authored planar Hermite path, not frame integration. */
export function makeWalkingPath(points: Vec3[]) {
  const tangents = points.map((p, i): Vec3 => {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)]
    return [(b[0] - a[0]) / (i === 0 || i === points.length - 1 ? 1 : 2), 0, (b[2] - a[2]) / (i === 0 || i === points.length - 1 ? 1 : 2)]
  })
  function at(segment: number, u: number) {
    const a = points[segment], b = points[segment + 1], ta = tangents[segment], tb = tangents[segment + 1]
    const h0 = 2 * u ** 3 - 3 * u * u + 1, h1 = u ** 3 - 2 * u * u + u, h2 = -2 * u ** 3 + 3 * u * u, h3 = u ** 3 - u * u
    const position = a.map((v, i) => h0 * v + h1 * ta[i] + h2 * b[i] + h3 * tb[i]) as Vec3
    const tangent = a.map((v, i) => (6 * u * u - 6 * u) * v + (3 * u * u - 4 * u + 1) * ta[i] + (-6 * u * u + 6 * u) * b[i] + (3 * u * u - 2 * u) * tb[i]) as Vec3
    return { position, yaw: Math.atan2(tangent[0], tangent[2]), segment, u }
  }
  const lookup = [{ distance: 0, segment: 0, u: 0 }], knots = [0]
  let distance = 0, previous = points[0]
  for (let segment = 0; segment < points.length - 1; segment++) {
    for (let j = 1; j <= 128; j++) {
      const u = j / 128, p = at(segment, u).position
      distance += Math.hypot(p[0] - previous[0], p[2] - previous[2]); previous = p
      lookup.push({ distance, segment, u })
    }
    knots.push(distance)
  }
  function sample(value: number) {
    const d = clamp(value, 0, distance)
    let low = 0, high = lookup.length - 1
    while (low + 1 < high) { const mid = (low + high) >> 1; if (lookup[mid].distance < d) low = mid; else high = mid }
    const a = lookup[low], b = lookup[high], f = progress(d, a.distance, b.distance)
    return at(b.segment, mix(a.segment === b.segment ? a.u : 0, b.u, f))
  }
  return { length: distance, knots, sample }
}

/** Integral of an eased speed profile: C1 speed, a steady middle, zero speed at both ends. */
export function walkingDistance(time: number, start: number, end: number, length: number, ramp = .55) {
  const duration = end - start, elapsed = clamp(time - start, 0, duration), speed = length / (duration - ramp)
  const rampArea = (t: number) => ramp * ((t / ramp) ** 3 - .5 * (t / ramp) ** 4)
  if (elapsed < ramp) return speed * rampArea(elapsed)
  if (elapsed > duration - ramp) return length - speed * rampArea(duration - elapsed)
  return speed * (elapsed - ramp / 2)
}

/** C1 minimum that stays below both reach limits without a hard change of vertical velocity. */
export function smoothMinimum(a: number, b: number, width = .003) {
  const overlap = Math.max(width - Math.abs(a - b), 0)
  return Math.min(a, b) - overlap * overlap / (4 * width)
}
