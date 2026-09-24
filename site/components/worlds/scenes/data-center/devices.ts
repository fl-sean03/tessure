import type { Vec3 } from '../../contract'
import { vehiclePose } from './vehicles'
const sub=(a:Vec3,b:Vec3)=>a.map((v,i)=>v-b[i]) as Vec3
const unit=(a:Vec3)=>{const d=Math.hypot(...a);return a.map(v=>v/d) as Vec3}
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const dot=(a:Vec3,b:Vec3)=>a.reduce((n,v,i)=>n+v*b[i],0)
function device(origin:Vec3,target:Vec3,horizontal:number,vertical:number){
  const axis=unit(sub(target,origin)),right=unit(cross([0,1,0],axis)),up=cross(axis,right)
  return {origin,axis,right,up,horizontal,vertical,near:.4,far:32}
}
/** Authored sectors explain direction and contribution; none of these values are sensor specifications. */
export const devices={
  camera:device([8.65,5.15,7.55],[4.8,2.1,18.5],38*Math.PI/180,28*Math.PI/180),
  radar:device([.24,3.25,15.8],[5,1.8,15.8],70*Math.PI/180,35*Math.PI/180),
}
export type DeviceKind=keyof typeof devices
export function devicePoint(kind:DeviceKind,p:Vec3):Vec3 {
  const d=devices[kind]
  return d.origin.map((v,i)=>v+d.right[i]*p[0]+d.up[i]*p[1]+d.axis[i]*p[2]) as Vec3
}
export function inSector(kind:DeviceKind,p:Vec3){
  const d=devices[kind],v=sub(p,d.origin),z=dot(v,d.axis)
  return z>=d.near&&z<=d.far&&Math.abs(dot(v,d.right))<=z*Math.tan(d.horizontal)&&Math.abs(dot(v,d.up))<=z*Math.tan(d.vertical)
}
/** Intersection of the illustrative frustum with the service-road plane, clipped to the authored lane. */
export function sectorGround(kind:DeviceKind){
  const d=devices[kind],planes=[
    (p:Vec3)=>dot(sub(p,d.origin),d.axis)-d.near,(p:Vec3)=>d.far-dot(sub(p,d.origin),d.axis),
    ...[-1,1].flatMap(sign=>[(p:Vec3)=>dot(sub(p,d.origin),d.axis)*Math.tan(d.horizontal)+sign*dot(sub(p,d.origin),d.right),(p:Vec3)=>dot(sub(p,d.origin),d.axis)*Math.tan(d.vertical)+sign*dot(sub(p,d.origin),d.up)]),
  ]
  let polygon:Vec3[]=[[.3,.136,8.8],[11.8,.136,8.8],[11.8,.136,34],[.3,.136,34]]
  for(const plane of planes){const output:Vec3[]=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],fa=plane(a),fb=plane(b);if(fa>=0)output.push(a);if((fa>=0)!==(fb>=0)){const u=fa/(fa-fb);output.push(a.map((v,j)=>v+(b[j]-v)*u) as Vec3)}}polygon=output}
  return polygon
}
export function observations(kind:DeviceKind,time:number){
  if(time<(kind==='camera'?4:8)||time>=42)return []
  return [false,true].flatMap(small=>{const p=vehiclePose(time,small),point:Vec3=[p.x,kind==='camera'?2.4:1.5,p.z];return inSector(kind,point)?[{small,point}]:[]})
}
