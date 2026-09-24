import { vehiclePose } from './vehicles'

export const arrivalZ = (t: number, second = false) => vehiclePose(t, second).z
export const deliveryX = (t: number) => vehiclePose(t).x
export const deliveryHeading = (t: number) => vehiclePose(t).heading
export const gateAngle = (t: number) => 0 * t
