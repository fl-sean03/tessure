import type { Vec3 } from '../../contract'

/** Authored support surfaces, in the same coordinates as the rendered slabs. */
export const ground = { lawn: .025, walk: .15, stage: .775 }
export const arrivalSign: Vec3 = [-8, ground.walk, 13.8]
export const exitSign: Vec3 = [10.3, ground.walk, 17.0]
export const reliefPivot:Vec3=[-4.5,ground.walk,14]
export const signPivot = 1.6
export function inRoundedRect(x:number,z:number,cx:number,cz:number,w:number,d:number,r:number) {
  const ax=Math.abs(x-cx),az=Math.abs(z-cz)
  return ax<=w/2 && az<=d/2 && Math.hypot(Math.max(0,ax-w/2+r),Math.max(0,az-d/2+r))<=r
}
export function surfaceY(x:number,z:number) {
  if(inRoundedRect(x,z,-7,-9,15.2,8.9,1.1))return ground.stage
  if(inRoundedRect(x,z,-4.7,13.5,1.8,2.1,.15))return ground.walk
  if(inRoundedRect(x,z,8.2,2.4,8.2,15.6,.3)||inRoundedRect(x,z,12.7,7.3,3.7,3,.3))return ground.walk
  if(inRoundedRect(x,z,0,10.8,45,4.7,1.8)||inRoundedRect(x,z,3,15.7,23,3.4,1.6)||[-7,13].some(cx=>inRoundedRect(x,z,cx,13.4,3.4,7.5,1.6)))return ground.walk
  return ground.lawn
}
