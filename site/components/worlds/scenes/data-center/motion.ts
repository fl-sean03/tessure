import { mix, progress, smooth } from '../../math'

/** Metres, +Y up. The matched truck follows a lane change and a rolling turn into receiving. */
function receivingRoute(t: number) {
  if (t <= 18) return { x: 4.8, z: -2, heading: 0 }
  if (t < 26) {
    const u = progress(t, 18, 26)
    return { x: 4.8 + 5.7 * smooth(u), z: -2 - 8 * u, heading: -Math.atan2(34.2 * u * (1 - u), 8) }
  }
  const u = progress(t, 26, 36)
  // Radius-six rolling arc, easing to rest at the loading bay; no in-place vehicle rotation.
  const heading = Math.PI / 2 * (u + u * u - u * u * u)
  return { x: 4.5 + 6 * Math.cos(heading), z: -10 - 6 * Math.sin(heading), heading }
}
export function arrivalZ(t: number, second = false) {
  if (!second && t > 18) return receivingRoute(t).z
  const keys = second ? [[0, 32.5], [4, 29], [11, 21], [18, 14.5], [24, 10.5], [48, 10.5]] : [[0, 24], [4, 17], [11, 10], [18, -2]]
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return mix(keys[i - 1][1], keys[i][1], smooth(progress(t, keys[i - 1][0], keys[i][0])))
  return keys[keys.length - 1][1]
}
export const deliveryX = (t: number) => receivingRoute(t).x
export const deliveryHeading = (t: number) => receivingRoute(t).heading
export const gateAngle = (t: number) => 1.47 * (1 - smooth(progress(t, 19, 22)))
export const guardProgress = (t: number) => smooth(progress(t, 30, 38))
