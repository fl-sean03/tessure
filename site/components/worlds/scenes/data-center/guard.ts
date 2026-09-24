import type { Vec3 } from '../../contract'
import { mix, progress, smooth } from '../../math'
import { makeWalkingPath, smoothMinimum, smoother, solveTwoBone, walkingDistance } from '../../kinematics'

export const guardRig = { upper: .4, lower: .4, hipY: .88, hipWidth: .12, ankleY: .105, reach: .792 }
export const guardStep = { position: [12, .195, 8.75] as Vec3, size: [1.2, .13, .6] as Vec3 }
export const guardTiming = { start: 30, end: 38 }
export type GuardFoot = { position: Vec3; yaw: number; planted: boolean }
type Landing = GuardFoot & { side: 0 | 1 }
const stopYaw = Math.atan2(4.8 - 7.15, 10.5 - 9.3)
function landing(x: number, y: number, z: number, yaw: number, side: number): GuardFoot {
  const lateral = side === 0 ? -.12 : .12
  return { position: [x + Math.cos(yaw) * lateral, y, z - Math.sin(yaw) * lateral], yaw, planted: true }
}
const initial: [GuardFoot, GuardFoot] = [landing(12, .39, 7.6, 0, 0), landing(12, .39, 7.6, 0, 1)]
const positions: [number, number, number, number][] = [
  [12, .39, 8.05, 0], [12, .39, 8.28, 0], [12, .26, 8.8, 0], [12, .13, 9.31, -.2],
  [11.65, .13, 9.52, -.85], [11.1, .13, 9.55, -1.4], [10.52, .13, 9.5, -1.62],
  [9.94, .13, 9.46, -1.62], [9.36, .13, 9.42, -1.62], [8.78, .13, 9.38, -1.6],
  [8.2, .13, 9.34, -1.6], [7.62, .13, 9.3, -1.5], [7.15, .13, 9.3, stopYaw], [7.15, .13, 9.3, stopYaw],
]
const landings: Landing[] = positions.map(([x,y,z,yaw], i) => ({ side: i % 2 as 0 | 1, ...landing(x,y,z,yaw,i%2) }))
const pairs: [GuardFoot, GuardFoot][] = [initial]
for (const step of landings) { const pair = [...pairs.at(-1)!] as [GuardFoot, GuardFoot]; pair[step.side] = step; pairs.push(pair) }
const centers = pairs.map(pair => pair[0].position.map((v,i) => (v + pair[1].position[i]) / 2) as Vec3)
const round = (points: Vec3[]) => points.map((p,i) => i === 0 || i === points.length - 1 ? p : p.map((v,j) => .25 * points[i-1][j] + .5 * v + .25 * points[i+1][j]) as Vec3)
const route = round(round(centers)), path = makeWalkingPath(route)
const distanceAt = (t: number) => walkingDistance(t, guardTiming.start, guardTiming.end, path.length, .65)
function timeAt(distance: number) {
  let lo = guardTiming.start, hi = guardTiming.end
  for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(distanceAt(mid)<distance)lo=mid;else hi=mid}
  return (lo+hi)/2
}
const times = path.knots.map((d,i) => i === 0 ? guardTiming.start : i === path.knots.length-1 ? guardTiming.end : timeAt(d))
export const guardFootfalls = landings.map((step,i) => ({...step, from:times[i], to:times[i+1]}))
export function guardFoot(side: 0 | 1, time: number): GuardFoot {
  let previous = initial[side]
  for(const step of guardFootfalls){
    if(step.side!==side)continue
    if(time<=step.from)return previous
    if(time>=step.to){previous=step;continue}
    const phase=progress(time,step.from,step.to)
    if(phase<=.04)return previous
    if(phase>=.96)return step
    const u=progress(phase,.04,.96),travel=smoother(u),clearance=Math.max(previous.position[1],step.position[1])+.12
    const y=u<.22?mix(previous.position[1],clearance,smoother(u/.22)):u>.78?mix(clearance,step.position[1],smoother((u-.78)/.22)):clearance
    return {position:[mix(previous.position[0],step.position[0],travel),y,mix(previous.position[2],step.position[2],travel)],yaw:mix(previous.yaw,step.yaw,travel),planted:false}
  }
  return previous
}
function hipAt(position: Vec3,yaw:number,side:number):Vec3 {
  const x=side===0?-guardRig.hipWidth:guardRig.hipWidth
  return [position[0]+Math.cos(yaw)*x,position[1]+guardRig.hipY,position[2]-Math.sin(yaw)*x]
}
function limit(position:Vec3,yaw:number,feet:GuardFoot[]){
  const h=feet.map((foot,side)=>{const hip=hipAt(position,yaw,side),d=Math.hypot(hip[0]-foot.position[0],hip[2]-foot.position[2]);return foot.position[1]+guardRig.ankleY+Math.sqrt(Math.max(0,guardRig.reach**2-d**2))-guardRig.hipY})
  return smoothMinimum(h[0],h[1])
}
const headings=pairs.map(pair=>(pair[0].yaw+pair[1].yaw)/2)
const heights=route.map((p,i)=>i===0?.39:i===route.length-1?.13:limit(p,headings[i],pairs[i])-.045)
export function guardPose(time:number){
  const shot=path.sample(distanceAt(time)),feet:[GuardFoot,GuardFoot]=[guardFoot(0,time),guardFoot(1,time)]
  const position=[...shot.position] as Vec3,{segment,u}=shot
  // Turn the torso through the supported foot headings; zero angular velocity at footfall joins.
  let yaw=mix(headings[segment],headings[segment+1],smoother(u))
  const bob=.02*Math.sin(Math.PI*u)**2
  position[1]=smoothMinimum(mix(heights[segment],heights[segment+1],smooth(u))+bob,limit(position,yaw,feet))
  if(time<=30){position[0]=12;position[1]=.39;position[2]=7.6;yaw=0}
  if(time>=38){position[0]=7.15;position[1]=.13;position[2]=9.3;yaw=stopYaw}
  const pole:Vec3=[Math.sin(yaw),0,Math.cos(yaw)]
  const legs=feet.map((foot,side)=>solveTwoBone(hipAt(position,yaw,side),[foot.position[0],foot.position[1]+guardRig.ankleY,foot.position[2]],pole,guardRig.upper,guardRig.lower))
  const forward=(foot:GuardFoot)=>(foot.position[0]-position[0])*Math.sin(yaw)+(foot.position[2]-position[2])*Math.cos(yaw)
  return {position,yaw,feet,legs,armSwing:(forward(feet[1])-forward(feet[0]))*.38}
}
