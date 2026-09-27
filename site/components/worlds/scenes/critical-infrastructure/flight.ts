import type {Vec3} from '../../contract'
import {clamp,mix,progress} from '../../math'
import {smoother} from '../../kinematics'
import {T} from './incident'
// Owned adaptation of the accepted split-dock, rotor-envelope and gimbal mechanics.
export const dock={x:23.5,z:-5.5,surfaceY:.78,coverY:1.80,coverTravel:1.5}
export const gimbalMount:Vec3=[0,.24,.43]
export const rotorCenters:Vec3[]=[-1,1].flatMap(x=>[-1,1].map(z=>[x*.58,.79,z*.58] as Vec3))
const parked:Vec3=[dock.x,dock.surfaceY,dock.z],overhead:Vec3=[dock.x,8.8,dock.z],inspection:Vec3=[25,8.5,8]
const interpolate=(a:Vec3,b:Vec3,t:number,s:number,e:number):Vec3=>a.map((v,i)=>mix(v,b[i],smoother(progress(t,s,e)))) as Vec3
export function defenderPosition(t:number):Vec3 {if(t<T.lift)return [...parked];if(t<T.cruise)return interpolate(parked,overhead,t,T.lift,T.cruise);if(t<T.inspect)return interpolate(overhead,inspection,t,T.cruise,T.inspect);if(t<T.return)return [...inspection];if(t<T.descend)return interpolate(inspection,overhead,t,T.return,T.descend);return interpolate(overhead,parked,t,T.descend,T.landed)}
function poweredTime(t:number,s:number,e:number){const d=e-s,u=progress(t,s,e);return d*(u**6-3*u**5+2.5*u**4)+Math.max(0,t-e)}
export type AirRole='hostile-west'|'hostile-east'|'defender'
const paths:Record<Exclude<AirRole,'defender'>,{at:number;p:Vec3}[]>={
 'hostile-west':[{at:8,p:[-38,16,18]},{at:18,p:[-12,12.5,17]},{at:38,p:[-1,14,16]},{at:64,p:[-5,13,18]},{at:70,p:[-12,16,17]},{at:80,p:[-44,23,-5]}],
 'hostile-east':[{at:12,p:[39,21,-28]},{at:24,p:[23,15,4]},{at:42,p:[23,14,14]},{at:68,p:[26,15,15]},{at:73,p:[30,18,22]},{at:81,p:[47,25,38]}],
}
export function airPosition(role:AirRole,t:number):Vec3{if(role==='defender')return defenderPosition(t);const a=paths[role];if(t<=a[0].at)return [...a[0].p];for(let i=1;i<a.length;i++)if(t<a[i].at)return interpolate(a[i-1].p,a[i].p,t,a[i-1].at,a[i].at);return [...a.at(-1)!.p]}
export function airPose(role:AirRole,t:number){
 const position=airPosition(role,t),target:Vec3=role==='defender'?[19.5,1.4,9.6]:role==='hostile-west'?[-1,3,0]:[13,3,1],dt=.01,before=airPosition(role,t-dt),after=airPosition(role,t+dt),acc=position.map((v,i)=>(after[i]-2*v+before[i])/(dt*dt)) as Vec3
 let yaw=Math.atan2(target[0]-position[0],target[2]-position[2]);if(role==='hostile-west')yaw=mix(yaw,-2.1,smoother(progress(t,64,70)));if(role==='hostile-east')yaw=mix(yaw,.70,smoother(progress(t,68,74)))
 const forward=acc[0]*Math.sin(yaw)+acc[2]*Math.cos(yaw),right=acc[0]*Math.cos(yaw)-acc[2]*Math.sin(yaw),pitch=clamp(Math.atan2(forward,9.81),-.17,.17),roll=clamp(-Math.atan2(right,9.81),-.17,.17)
 const delta=target.map((v,i)=>v-position[i]) as Vec3,x=Math.cos(yaw)*delta[0]-Math.sin(yaw)*delta[2],z=Math.sin(yaw)*delta[0]+Math.cos(yaw)*delta[2],y2=Math.cos(pitch)*delta[1]+Math.sin(pitch)*z,z2=-Math.sin(pitch)*delta[1]+Math.cos(pitch)*z
 const local:Vec3=[Math.cos(roll)*x+Math.sin(roll)*y2-gimbalMount[0],-Math.sin(roll)*x+Math.cos(roll)*y2-gimbalMount[1],z2-gimbalMount[2]]
 const rotor=role==='defender'?96*(poweredTime(t,T.spool,T.lift)-poweredTime(t,T.landed,T.stopped)):105*t
 const cover=smoother(progress(t,T.dockOpen,T.dockOpened))*(1-smoother(progress(t,T.dockClose,T.dockClosed)))
 return {position,yaw,pitch,roll,rotor,cover,gimbalYaw:Math.atan2(local[0],local[2]),gimbalPitch:-Math.atan2(local[1],Math.hypot(local[0],local[2])),visible:role==='defender'||(t>=paths[role][0].at-2&&t<=paths[role].at(-1)!.at+2),target}
}
