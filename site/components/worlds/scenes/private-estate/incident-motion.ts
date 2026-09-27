import type { Vec3 } from '../../contract'
import { mix, mix3, progress } from '../../math'
import { smoother, solveTwoBone, smoothMinimum } from '../../kinematics'
import { rotatePoint } from './motion'

/** One authored clock shared by actions, narration and state images. */
export const incidentTime = { detect: 6, hands: 7, wallStand: 11, landed: 15, verify: 15, correlate: 23, decide: 29, respond: 32, operatorContact: 35, residentClear: 36, closureStart: 37, secured: 40, standoff: 44, retreat: 48, exitCross: 57, outside: 66, resolve: 68, inspected: 74, end: 80 } as const
export const garden = { floor: .222, wallZ: 8.5, wallTop: .862, wallDepth: .38, crossX: -4.4, innerGateZ: 4.48 }
export const humanRig = { upper: .43, lower: .43, hipY: .915, ankleY: .085, reach: .849, shoulderY: .43, armUpper: .34, armLower: .33 }
export type HumanFoot = { position: Vec3; yaw: number; planted: boolean; contact: string }
export type HumanPose = ReturnType<typeof assemble>
const add = (p: Vec3, q: Vec3): Vec3 => p.map((v,i)=>v+q[i]) as Vec3
const offset = (p: Vec3, yaw: number, q: Vec3) => add(p,rotatePoint(q,yaw))
const eased = (t: number,a: number,b: number) => smoother(progress(t,a,b))
function foot(position: Vec3, yaw: number, contact: string): HumanFoot { return { position, yaw, planted: true, contact } }
function moveFoot(a: HumanFoot,b: HumanFoot,u: number, lift=.14): HumanFoot {
  if(u<=0)return a;if(u>=1)return b
  const advance=eased(u,.24,.76),high=Math.max(a.position[1],b.position[1])+lift
  const y=u<.24?mix(a.position[1],high,smoother(u/.24)):u>.76?mix(high,b.position[1],smoother((u-.76)/.24)):high
  return {position:[mix(a.position[0],b.position[0],advance),y,mix(a.position[2],b.position[2],advance)],yaw:mix(a.yaw,b.yaw,advance),planted:false,contact:b.contact}
}
/** Alternating, explicitly supported landings; both endpoints have two planted feet. */
export function walking(points: Vec3[],start: number,end: number,initialYaw?:number) {
  const centers: Vec3[]=[points[0]],headings:number[]=[]
  let prior=initialYaw??Math.atan2(points[1][0]-points[0][0],points[1][2]-points[0][2])
  for(let j=1;j<points.length;j++){
    const a=points[j-1],b=points[j],distance=Math.hypot(b[0]-a[0],b[2]-a[2]),count=Math.max(2,Math.ceil(distance/.34));let yaw=Math.atan2(b[0]-a[0],b[2]-a[2]);while(yaw-prior>Math.PI)yaw-=Math.PI*2;while(yaw-prior< -Math.PI)yaw+=Math.PI*2
    if(!headings.length)headings.push(prior)
    // A substantial change of direction uses supported turning steps before translation.
    if(Math.abs(yaw-prior)>.6){const turns=Math.ceil(Math.abs(yaw-prior)/.16);for(let k=1;k<=turns;k++){centers.push(a);headings.push(mix(prior,yaw,k/turns))}centers.push(a);headings.push(yaw);prior=yaw}
    for(let i=1;i<=count;i++){centers.push(mix3(a,b,i/count));headings.push(mix(prior,yaw,smoother(Math.min(1,i/3))))}prior=yaw
  }
  centers.push(points.at(-1)!);headings.push(prior)
  const initial=[0,1].map(i=>foot(offset(points[0],headings[0],[i? .13:-.13,0,0]),headings[0],`${start}:initial:${i}`))
  const steps=centers.slice(1).map((p,i)=>({side:i%2,foot:foot(offset(p,headings[i+1],[i%2?.13:-.13,0,0]),headings[i+1],`${start}:${i}`)}))
  const pairs:HumanFoot[][]=[initial];for(const s of steps){const pair=[...pairs.at(-1)!];pair[s.side]=s.foot;pairs.push(pair)}
  const centersOfSupport=pairs.map(pair=>pair[0].position.map((v,k)=>(v+pair[1].position[k])/2) as Vec3),headingsOfSupport=pairs.map(pair=>(pair[0].yaw+pair[1].yaw)/2)
  const costs=steps.map((_,i)=>Math.max(.04,Math.hypot(centersOfSupport[i+1][0]-centersOfSupport[i][0],centersOfSupport[i+1][2]-centersOfSupport[i][2])/1.2+Math.abs(headingsOfSupport[i+1]-headingsOfSupport[i])*.85)),total=costs.reduce((a,b)=>a+b,0),times=[start]
  costs.forEach(c=>times.push(times.at(-1)!+c/total*(end-start)))
  return (time:number)=>{
    const i=Math.min(steps.length-1,Math.max(0,times.findLastIndex(at=>time>=at))),u=progress(time,times[i],times[i+1]),feet=[...pairs[i]]
    feet[steps[i].side]=moveFoot(feet[steps[i].side],steps[i].foot,eased(u,.06,.94))
    const a=centersOfSupport[i],b=centersOfSupport[i+1],before=centersOfSupport[Math.max(0,i-1)],after=centersOfSupport[Math.min(centersOfSupport.length-1,i+2)],dt=times[i+1]-times[i]
    const position=a.map((v,k)=>{const va=i===0?0:(b[k]-before[k])/(times[i+1]-times[i-1]),vb=i===steps.length-1?0:(after[k]-v)/(times[i+2]-times[i]);return(2*u**3-3*u*u+1)*v+(u**3-2*u*u+u)*va*dt+(-2*u**3+3*u*u)*b[k]+(u**3-u*u)*vb*dt}) as Vec3
    const yaw=mix(headingsOfSupport[i],headingsOfSupport[i+1],smoother(u))
    return assemble(position,yaw,feet,0,time)
  }
}
function assemble(intended:Vec3,yaw:number,feet:HumanFoot[],lean:number,time:number,hands?:Vec3[],touch=false,warning=0,climb=false){
  const position=[...intended] as Vec3
  for(let i=0;i<2;i++){const h=offset(position,yaw,[i?.13:-.13,humanRig.hipY,0]),f=feet[i].position,d=Math.hypot(h[0]-f[0],h[2]-f[2]),limit=f[1]+humanRig.ankleY+Math.sqrt(Math.max(.01,humanRig.reach**2-d**2))-humanRig.hipY;position[1]=smoothMinimum(position[1],limit,.005)}
  const forward=rotatePoint([0,0,1],yaw),hips=[0,1].map(i=>offset(position,yaw,[i?.13:-.13,humanRig.hipY,0])),legs=feet.map((f,i)=>{const raised=climb?eased(f.position[1],garden.floor,garden.floor+.22):0,pole=rotatePoint([(i?1:-1)*.7*raised,3*raised,1],yaw);return solveTwoBone(hips[i],[f.position[0],f.position[1]+humanRig.ankleY,f.position[2]],pole,humanRig.upper,humanRig.lower)})
  const shoulders=[0,1].map(i=>offset(position,yaw,[i?.235:-.235,humanRig.hipY+Math.cos(lean)*humanRig.shoulderY,Math.sin(lean)*humanRig.shoulderY]))
  const handsWorld=shoulders.map((s,i)=>{
    let target=hands?.[i]
    if(!target){const longitudinal=(feet[1-i].position[0]-position[0])*forward[0]+(feet[1-i].position[2]-position[2])*forward[2];target=offset(s,yaw,[i?.015:-.015,-.56,Math.max(-.13,Math.min(.13,longitudinal*.45))]);if(i===0&&warning>0)target=mix3(target,offset(s,yaw,[0,.18,.48]),warning)}
    const delta=target.map((v,k)=>v-s[k]) as Vec3,distance=Math.hypot(...delta),maximum=.662;if(distance>maximum)target=s.map((v,k)=>v+delta[k]*maximum/distance) as Vec3
    return target
  })
  const arms=handsWorld.map((h,i)=>solveTwoBone(shoulders[i],h,rotatePoint(i===0?mix3([-1,-.3,-.3],[.2,.8,-1],Math.sqrt(warning)):[1,-.3,-.3],yaw),humanRig.armUpper,humanRig.armLower))
  return {position,yaw,feet,legs,arms,hands:handsWorld,lean,touch,warning,time}
}
/** A low-wall climb with named ground/top landings and both hands placed on coping. */
export function crossing(time:number,outward=false){
  const t=outward?time-incidentTime.exitCross+incidentTime.detect:time,yaw=outward?0:Math.PI,base:Vec3=[garden.crossX,0,garden.wallZ]
  const transform=(p:Vec3)=>offset(base,yaw,p)
  const outside=[0,1].map(i=>foot(transform([i?.13:-.13,garden.floor,-.80]),yaw,`${outward}:outside:${i}`)),top=[0,1].map(i=>foot(transform([i?.13:-.13,garden.wallTop,0]),yaw,`${outward}:top:${i}`)),inside=[0,1].map(i=>foot(transform([i?.13:-.13,garden.floor,.80]),yaw,`${outward}:inside:${i}`))
  const feet=t<=9?[moveFoot(outside[0],top[0],eased(t,7,9),.17),outside[1]]:t<=11?[top[0],moveFoot(outside[1],top[1],eased(t,9,11),.17)]:t<=13?[moveFoot(top[0],inside[0],eased(t,11,13),.17),top[1]]:[inside[0],moveFoot(top[1],inside[1],eased(t,13,15),.17)]
  const z=t<7?-.80:t<9?mix(-.8,-.40,eased(t,7,9)):t<11?mix(-.40,0,eased(t,9,11)):t<13?mix(0,.4,eased(t,11,13)) :mix(.4,.8,eased(t,13,15))
  const y=t<7?mix(garden.floor,-.03,eased(t,6,7)):t<9?mix(-.03,garden.floor,eased(t,7,9)):t<11?mix(garden.floor,garden.wallTop,eased(t,9,11)):t<13?mix(garden.wallTop,garden.floor,eased(t,11,13)):garden.floor
  const lean=.64*eased(t,6,7)*(1-eased(t,9,11)),intended=transform([0,y,z]),touch=t>=7&&t<=9
  const ordinary=assemble(intended,yaw,feet,lean,time,undefined,false,0,true),amount=eased(t,6,7)*(1-eased(t,9,9.8)),hands=ordinary.hands.map((h,i)=>{const target=mix3(h,transform([i?.235:-.235,garden.wallTop+.027,-.125]),amount);target[1]+=.15*Math.sin(Math.PI*amount);return target})
  return assemble(intended,yaw,feet,lean,time,hands,touch,0,true)
}
const approach=walking([[-4.4,garden.floor,7.7],[-2.5,garden.floor,6.35],[.6,garden.floor,5.75]],15,27,Math.PI)
const advance=walking([[.6,garden.floor,5.75],[2.4,garden.floor,5.5],[4,garden.floor,5.18 ]],36,44,approach(27).yaw)
const retreat=walking([[4,garden.floor,5.18],[1.4,garden.floor,6],[-2.3,garden.floor,6.65],[-4.4,garden.floor,6.9],[-4.4,garden.floor,7.7]],48,57,advance(44).yaw)
const depart=walking([[-4.4,garden.floor,9.3],[-4.4,garden.floor,11.3]],66,74,0)
const guardOut=walking([[-7.45,garden.floor,2.7],[-7.45,garden.floor,3.65],[-3,garden.floor,3.65],[1.2,garden.floor,3.65]],36,44,0)
const guardInspect=walking([[1.2,garden.floor,3.65],[-3,garden.floor,3.65],[-6.2,garden.floor,3.65],[-6.2,garden.floor,6.6],[-4.4,garden.floor,7.65]],60,74,guardOut(44).yaw)
const residentNormal=walking([[3.15,1.302,.34],[3.48,1.302,.34]],0,4,Math.PI/2)
const residentClear=walking([[3.48,1.302,.34],[3.48,1.302,-.70],[5.2,1.302,-.70]],32,36,residentNormal(4).yaw)
export function intruderPose(t:number){if(t<=15)return crossing(t);if(t<36)return approach(t);if(t<48)return advance(t);if(t<57)return retreat(t);if(t<66)return crossing(t,true);return depart(t)}
export function guardPose(t:number){const p=t<60?guardOut(t):guardInspect(t),warning=eased(t,44,45)*(1-eased(t,55,56));return assemble(p.position,mix(p.yaw,1.09,warning),p.feet,0,t,undefined,false,warning)}
export function residentPose(t:number){return t<32?residentNormal(t):residentClear(t)}
export function incidentState(time:number){return {lighting:time>=incidentTime.correlate,alert:time>=incidentTime.correlate&&time<incidentTime.resolve,closed:eased(time,incidentTime.closureStart,incidentTime.secured),record:time>=incidentTime.resolve,inspected:time>=incidentTime.inspected,thermal:time>=incidentTime.verify&&time<incidentTime.correlate}}
