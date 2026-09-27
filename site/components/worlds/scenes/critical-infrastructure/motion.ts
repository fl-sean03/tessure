import type { Vec3 } from '../../contract'
import { mix, progress } from '../../math'
import { smoother, solveTwoBone, walkingDistance, smoothMinimum } from '../../kinematics'
import { soleFrame, supportY, type SoleFrame } from './surface'
import { T } from './incident'
export type Role = 'visitor' | 'accomplice' | 'guard' | 'operator' | 'technician'
export const roles:Role[]=['visitor','accomplice','guard','operator','technician']
export const rig = { upper: .45, lower: .445, reach: .889, hipY: .925, hipWidth: .115, ankleY: .085, armUpper: .28, armLower: .27 }
export function rotate(p: Vec3, yaw: number): Vec3 { return [p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),p[1],-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw)] }
const add=(a:Vec3,b:Vec3):Vec3=>a.map((v,i)=>v+b[i]) as Vec3
type Key={at:number;x:number;z:number;yaw:number}
// Each leg stops before an absolute-time planted turn; headings are explicitly unwrapped.
export const paths:Record<Role,Key[]>={
 visitor:[{at:0,x:21,z:15,yaw:-2.12},{at:8,x:21,z:15,yaw:-2.12},{at:18,x:15.7,z:12.29,yaw:-2.12},{at:19.5,x:15.7,z:12.29,yaw:-Math.PI},{at:66,x:15.7,z:12.29,yaw:-Math.PI},{at:69,x:15.7,z:12.29,yaw:-5.20},{at:79,x:27,z:18.3,yaw:-5.20}],
 accomplice:[{at:0,x:23,z:16,yaw:-2.03},{at:9,x:23,z:16,yaw:-2.03},{at:20,x:17.4,z:13.2,yaw:-2.03},{at:22,x:17.4,z:13.2,yaw:-2.9},{at:66,x:17.4,z:13.2,yaw:-2.9},{at:69,x:17.4,z:13.2,yaw:-5.22},{at:79,x:29,z:19.1,yaw:-5.22}],
 technician:[{at:0,x:-4.2,z:6.5,yaw:Math.PI/2},{at:6,x:-1.6,z:6.5,yaw:Math.PI/2},{at:44,x:-1.6,z:6.5,yaw:Math.PI/2},{at:46,x:-1.6,z:6.5,yaw:1.29},{at:54,x:6.8,z:8.9,yaw:1.29},{at:58,x:11.5,z:8.9,yaw:Math.PI/2},{at:59.5,x:11.5,z:8.9,yaw:Math.PI},{at:62,x:11.5,z:6.3,yaw:Math.PI},{at:64,x:11.5,z:6.3,yaw:Math.PI*2}],
 guard:[{at:0,x:16.4,z:6,yaw:0},{at:44,x:16.4,z:6,yaw:0},{at:48,x:16.4,z:8.3,yaw:0},{at:49.5,x:16.4,z:8.3,yaw:.82},{at:53,x:18.65,z:10.4,yaw:.82},{at:55,x:18.65,z:10.4,yaw:-Math.PI/2},{at:58,x:16.2,z:10.4,yaw:-Math.PI/2},{at:60,x:16.2,z:10.4,yaw:0}],
 operator:[{at:0,x:13.5,z:6.6,yaw:0},{at:124,x:13.5,z:6.6,yaw:0}],
}
export function rootPose(role:Role,t:number){const keys=paths[role];let a=keys[0],b=a;for(let i=1;i<keys.length;i++){b=keys[i];if(t<=b.at)break;a=b}const u=smoother(progress(t,a.at,b.at)),travel=b.at>a.at?walkingDistance(t,a.at,b.at,1,Math.min(.65,(b.at-a.at)/3)):0,x=mix(a.x,b.x,travel),z=mix(a.z,b.z,travel);return {position:[x,supportY(x,z),z] as Vec3,yaw:mix(a.yaw,b.yaw,u)}}
export const visitorPosition=(t:number)=>rootPose('visitor',t).position
export const gatePull=(t:number)=>.035*Math.sin((t-20)*Math.PI*1.4)*smoother(progress(t,20,21))*(1-smoother(progress(t,31,33)))
export type Foot=SoleFrame&{planted:boolean;contact:number}
function landing(role:Role,time:number,side:number,contact:number):Foot{const p=rootPose(role,time),offset=rotate([side?.18:-.18,0,0],p.yaw);return {...soleFrame(p.position[0]+offset[0],p.position[2]+offset[2],p.yaw),planted:true,contact}}
export const footPlans=Object.fromEntries(roles.map(role=>{const steps:(Foot&{side:number;from:number;to:number})[]=[];const keys=paths[role];for(let k=1;k<keys.length;k++){const start=keys[k-1].at,end=keys[k].at,table=[{t:start,d:0}];let d=0,previous=rootPose(role,start);for(let i=1;i<=256;i++){const t=mix(start,end,i/256),p=rootPose(role,t);d+=Math.hypot(p.position[0]-previous.position[0],p.position[2]-previous.position[2])+2*Math.abs(p.yaw-previous.yaw);table.push({t,d});previous=p}if(d<.001)continue;const timeAt=(v:number)=>{let lo=0,hi=256;while(lo+1<hi){const mid=(lo+hi)>>1;if(table[mid].d<v)lo=mid;else hi=mid}return mix(table[lo].t,table[hi].t,progress(v,table[lo].d,table[hi].d))};const count=Math.max(4,Math.ceil(d/.36/2)*2);for(let i=0;i<count;i++){const side=i%2,from=timeAt(d*i/count),to=timeAt(d*(i+1)/count),target=i>=count-2?end:timeAt(d*(i+1.35)/count);steps.push({...landing(role,target,side,steps.length),side,from,to})}}return [role,{initial:[landing(role,0,0,-1),landing(role,0,1,-1)],steps}]})) as Record<Role,{initial:Foot[];steps:(Foot&{side:number;from:number;to:number})[]}>
export function footPose(role:Role,side:number,time:number):Foot{const plan=footPlans[role];let previous=plan.initial[side];for(const next of plan.steps){if(next.side!==side)continue;if(time<=next.from)return previous;if(time>=next.to){previous=next;continue}const phase=progress(time,next.from,next.to),travel=smoother(progress(phase,.18,.82)),frame=soleFrame(mix(previous.position[0],next.position[0],travel),mix(previous.position[2],next.position[2],travel),mix(previous.yaw,next.yaw,travel));frame.position[1]+=.13*Math.sin(Math.PI*phase)**2;return {...frame,planted:false,contact:next.contact}}return previous}
export function personPose(role:Role,time:number){const p=rootPose(role,time),position=[...p.position] as Vec3,yaw=p.yaw,feet=[footPose(role,0,time),footPose(role,1,time)];position[1]-=.007
 const hipAt=(side:number)=>add(position,rotate([side?rig.hipWidth:-rig.hipWidth,rig.hipY,0],yaw)),ankles=feet.map(f=>add(f.position,f.up.map(v=>v*rig.ankleY) as Vec3)),pole=rotate([0,0,1],yaw)
 feet.forEach((f,side)=>{const h=hipAt(side),a=ankles[side],horizontal=Math.hypot(h[0]-a[0],h[2]-a[2]);position[1]=smoothMinimum(position[1],a[1]+Math.sqrt(Math.max(.001,rig.reach**2-horizontal**2))-rig.hipY,.01)})
 const legs=feet.map((_,side)=>solveTwoBone(hipAt(side),ankles[side],pole,rig.upper,rig.lower))
 const forward=(side:number)=>(feet[side].position[0]-position[0])*Math.sin(yaw)+(feet[side].position[2]-position[2])*Math.cos(yaw),swing=(forward(1)-forward(0))*.38
 const handLocal:Vec3[]=[[-.28,1.39-.52*Math.cos(swing*2),.52*Math.sin(swing*2)],[.28,1.39-.52*Math.cos(swing*2),-.52*Math.sin(swing*2)]]
 if(role==='operator'){handLocal[0]=[-.225,1.10,.37];const g=smoother(progress(time,60,62))*(1-smoother(progress(time,65,67)));handLocal[1]=[mix(.28,.35,g),mix(.87,1.197,g),mix(0,.25,g)]}
 if(role==='guard'){const g=smoother(progress(time,60,62));handLocal[0]=[-.225,mix(handLocal[0][1],1.1,g),mix(handLocal[0][2],.37,g)];handLocal[1]=[.28,mix(handLocal[1][1],1.30,g),mix(handLocal[1][2],.26,g)]}
 const hands=handLocal.map(h=>add(position,rotate(h,yaw)))
 if(role==='visitor'){const reach=smoother(progress(time,19.5,20.5))*(1-smoother(progress(time,33,35)));for(let i=0;i<2;i++){const target:Vec3=[15.7+(i?-.22:.22),1.50,11.81+gatePull(time)];hands[i]=hands[i].map((v,j)=>mix(v,target[j],reach)) as Vec3}}
 const arms=hands.map((h,side)=>solveTwoBone(add(position,rotate([side?.275:-.275,1.39,0],yaw)),h,rotate([side?.5:-.5,-.7,.3],yaw),rig.armUpper,rig.armLower))
 return {position,yaw,feet,legs,hands,arms}
}
