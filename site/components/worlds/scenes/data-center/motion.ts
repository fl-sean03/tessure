import { progress, smooth } from '../../math'
import { vehiclePose } from './vehicles'

export const arrivalZ = (t: number, second = false) => vehiclePose(t, second).z
export const deliveryX = (t: number) => vehiclePose(t).x
export const deliveryHeading = (t: number) => vehiclePose(t).heading
export const gateAngle = (t: number) => 1.47 * (1 - smooth(progress(t, 19, 22)))
export const guardProgress = (t: number) => smooth(progress(t, 30, 38))
/** Squared normalized travel speed tapers the stride and its derivative to rest at both ends. */
export function guardGait(t: number) {
  const u = progress(t, 30, 38)
  return Math.sin((t - 30) * 7.3) * .31 * 16 * u * u * (1 - u) * (1 - u)
}
