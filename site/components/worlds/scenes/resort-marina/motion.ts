import { CatmullRomCurve3, Vector3 } from 'three'
import { clamp, progress, smooth } from '../../math'
import { T } from './timing'
export const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
export const approach = new CatmullRomCurve3([[7,0,31],[12,0,23],[17,0,16],[17,0,6.8]].map(p=>new Vector3(...p)))
export const departure = new CatmullRomCurve3([[17,0,6.8],[10,0,8],[7,0,14],[8,0,23],[4,0,34],[2,0,43]].map(p=>new Vector3(...p)))
const a=approach.getTangent(1),b=departure.getTangent(0)
export const heldHeading=Math.atan2(a.x,a.z), departureHeading=Math.atan2(b.x,b.z), turnAngle=wrapAngle(departureHeading-heldHeading)
export function vesselPose(t:number){
 const leaving=t>T.boatGo,curve=leaving?departure:approach,u=leaving?smooth(progress(t,T.boatGo,T.departed)):1-(1-progress(t,0,30))**1.35
 const p=curve.getPoint(u),d=curve.getTangent(u),tangent=Math.atan2(d.x,d.z)
 const heading=leaving?heldHeading+turnAngle+wrapAngle(tangent-departureHeading):t>T.boatTurn?heldHeading+turnAngle*smooth(progress(t,T.boatTurn,T.boatGo)):tangent
 return{p,heading,pitch:Math.sin(t*.9)*.009,roll:Math.sin(t*1.1)*.013,heave:Math.sin(t*1.5)*.035}
}
export function vesselSpeed(t:number){if(t>=30&&t<=T.boatGo||t>=T.departed)return 0;const from=Math.max(0,t-.002),to=Math.min(t<30?30:T.departed,t+.002);return vesselPose(to).p.distanceTo(vesselPose(from).p)/Math.max(.001,to-from)}
export function wakePose(t:number){const pose=vesselPose(t),speed=vesselSpeed(t),amount=smooth(clamp(speed/2));return{...pose,speed,length:3.8*amount,width:.045+.07*amount,opacity:.42*amount}}
export function outboardYaw(t:number){const yaw=wrapAngle(vesselPose(Math.min(T.end,t+.02)).heading-vesselPose(Math.max(0,t-.02)).heading)/.04;return clamp(-yaw*.3,-.48,.48)}
export const radarPosition:[number,number,number]=[22.3,5.6,18]
export const radarPhase=(t:number)=>t*.7+.3
export function restingPose(t:number,kind:'sail'|'moored'|'kayak'){const phase=kind==='sail'?1:kind==='moored'?2:3;return{heave:Math.sin(t*1.15+phase)*(kind==='kayak'?.018:.026),pitch:Math.sin(t*.83+phase)*.006,roll:Math.sin(t*.94+phase)*.008}}
export const airApproach=new CatmullRomCurve3([[38,13,27],[29,11,16],[20,9,5]].map(p=>new Vector3(...p)))
export const airPass=new CatmullRomCurve3([[20,9,5],[15,9,-.5],[11,9.5,2],[15,10,9],[21,10,11]].map(p=>new Vector3(...p)))
export const airDeparture=new CatmullRomCurve3([[21,10,11],[27,12,19],[36,14,31],[45,16,43]].map(p=>new Vector3(...p)))
export function aircraftPose(t:number){
 const curve=t<18?airApproach:t<T.airExit?airPass:airDeparture,u=t<18?smooth(progress(t,T.detect,18)):t<T.airExit?smooth(progress(t,18,55)):smooth(progress(t,T.airExit,78)),p=curve.getPoint(u),d=curve.getTangent(u)
 const before=curve.getTangent(Math.max(0,u-.002)),after=curve.getTangent(Math.min(1,u+.002)),passEnd=airPass.getTangent(1),exitStart=airDeparture.getTangent(0),from=Math.atan2(passEnd.x,passEnd.z),to=Math.atan2(exitStart.x,exitStart.z)
 let yaw=t>=55&&t<=T.airExit?from+wrapAngle(to-from)*smooth(progress(t,55,T.airExit)):Math.atan2(d.x,d.z),turn=wrapAngle(Math.atan2(after.x,after.z)-Math.atan2(before.x,before.z))
 let pitch=Math.atan2(-d.y,Math.hypot(d.x,d.z))*.5,bank=clamp(-turn*8,-.26,.26)
 if(t>16&&t<18){const next=airPass.getTangent(0),u=smooth(progress(t,16,18));yaw+=wrapAngle(Math.atan2(next.x,next.z)-yaw)*u;pitch*=1-u;bank*=1-u}
 if(t>=55&&t<=T.airExit){pitch=Math.atan2(-exitStart.y,Math.hypot(exitStart.x,exitStart.z))*.5*smooth(progress(t,55,T.airExit));bank=0}
 return{p,yaw,pitch,bank,rotor:t*67,visible:t<80}
}

export function gateAngle(t:number){return Math.PI/2*(1-smooth(progress(t,T.gateStart,T.gateClosed)))}
export function publicAngle(t:number){return -Math.PI/2*(1-smooth(progress(t,T.visitorsSafe,T.publicHeld))+smooth(progress(t,T.inspected,T.publicOpen)))}
export function warningState(t:number){return{local:t>=T.correlate&&t<T.departed,warning:t>=T.respond&&t<T.departed,flash:.6+.4*Math.sin(t*5)**2,record:t>=T.inspected}}
