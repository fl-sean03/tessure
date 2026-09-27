import type { Vec3 } from '../../contract'
export type Device = { id: 'west-optics'|'east-optics'|'ground-radar'|'air-optics'|'west-air-optics'; position: Vec3; target: Vec3; sector: [number,number,number,number]; halfAngle: number; firstRecord: number; color: string }
/** Partial illustrative sectors chosen for this fictional layout, not hardware specifications. */
export const devices: Device[] = [
 {id:'west-optics',position:[-6.23,3.85,10.45],target:[16,1.4,12.7],sector:[13,19,11.8,16],halfAngle:.45,firstRecord:18,color:'#a8c2d7'},
 {id:'east-optics',position:[12.87,3.85,10.45],target:[16,1.3,12.5],sector:[14,20,11.8,17],halfAngle:.70,firstRecord:18,color:'#d8c3a1'},
 {id:'ground-radar',position:[3.5,1.44,10.4],target:[21,1.1,15],sector:[15,24,12,18],halfAngle:.53,firstRecord:8,color:'#c9b08a'},
 {id:'west-air-optics',position:[-18.8,5.5,-2],target:[-12,13,17],sector:[-35,0,12,22],halfAngle:.85,firstRecord:12,color:'#b9cedc'},
 {id:'air-optics',position:[18.8,5.5,9.8],target:[23,15,7],sector:[20,32,-5,18],halfAngle:.8,firstRecord:21,color:'#c7d9e8'},
]
export function deviceFrame(d: Device) {
  const v=d.target.map((x,i)=>x-d.position[i]) as Vec3,n=Math.hypot(...v),forward=v.map(x=>x/n) as Vec3,h=Math.hypot(forward[0],forward[2]),right:Vec3=[forward[2]/h,0,-forward[0]/h],up:Vec3=[-forward[1]*forward[0]/h,h,-forward[1]*forward[2]/h]
  return {right,up,forward}
}
export function devicePoint(d:Device,p:Vec3):Vec3 {const f=deviceFrame(d);return d.position.map((v,i)=>v+f.right[i]*p[0]+f.up[i]*p[1]+f.forward[i]*p[2]) as Vec3}
export function aperture(d:Device):Vec3{return devicePoint(d,d.id==='ground-radar'?[0,0,.175]:d.id.endsWith('air-optics')?[0,.12,.553]:[0,.11,.535])}
export function sectorContains(d:Device,p:Vec3){const [x0,x1,z0,z1]=d.sector;if(p[0]<x0||p[0]>x1||p[2]<z0||p[2]>z1)return false;const a=aperture(d),v=p.map((x,i)=>x-a[i]) as Vec3,n=Math.hypot(...v),f=deviceFrame(d).forward;return v.reduce((s,x,i)=>s+x*f[i],0)/n>=Math.cos(d.halfAngle)}
