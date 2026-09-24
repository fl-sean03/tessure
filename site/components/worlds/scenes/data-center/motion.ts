import { progress, smooth } from '../../math'
import { vehiclePose } from './vehicles'

export const arrivalZ = (t: number, second = false) => vehiclePose(t, second).z
export const deliveryX = (t: number) => vehiclePose(t).x
export const deliveryHeading = (t: number) => vehiclePose(t).heading
export const gateAngle = (t: number) => 1.47 * (1 - smooth(progress(t, 19, 22)))
