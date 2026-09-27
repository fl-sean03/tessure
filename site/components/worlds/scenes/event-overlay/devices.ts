import type { Vec3 } from '../../contract'
const sub=(a:Vec3,b:Vec3)=>a.map((v,i)=>v-b[i]) as Vec3
const dot=(a:Vec3,b:Vec3)=>a.reduce((n,v,i)=>n+v*b[i],0)
const unit=(a:Vec3)=>{const d=Math.hypot(...a);return a.map(v=>v/d) as Vec3}
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
function camera(id:string,name:string,post:Vec3,origin:Vec3,target:Vec3,patch:[number,number,number,number]){const axis=unit(sub(target,origin)),right=unit(cross([0,1,0],axis)),up=cross(axis,right);return{id,name,post,origin,target,axis,right,up,patch,horizontal:Math.PI*.23,vertical:Math.PI*.145,near:.3,far:16}}
/** These bounds describe drawn patches in an illustration, never camera operating specifications. */
export const cameras=[
  camera('passage','C1 · Staff passage',[9.4,.15,7.5],[9.05,4.65,8.0],[6.9,.8,8.3],[5.3,9,7.5,11.5]),
  camera('backstage','C2 · Backstage approach',[10.4,.15,-.5],[10.0,4.65,-.2],[7,.8,4.2],[5.3,8.8,1.4,7.6]),
]
export type CameraDevice=typeof cameras[number]
export function devicePoint(d:CameraDevice,p:Vec3):Vec3{return d.origin.map((v,i)=>v+d.right[i]*p[0]+d.up[i]*p[1]+d.axis[i]*p[2]) as Vec3}
export function inSector(d:CameraDevice,p:Vec3){const v=sub(p,d.origin),z=dot(v,d.axis);return z>=d.near&&z<=d.far&&Math.abs(dot(v,d.right))<=z*Math.tan(d.horizontal)&&Math.abs(dot(v,d.up))<=z*Math.tan(d.vertical)}
