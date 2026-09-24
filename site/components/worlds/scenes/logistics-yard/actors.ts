import type { Vec3 } from '../../contract'
import { mix, progress } from '../../math'
import { makeWalkingPath, smoothMinimum, smoother, solveTwoBone, walkingDistance } from './gait'
import { supervisorPose, type FootPose } from './supervisor'
import { carrierX, controls, T } from './incident'
const local = (p: Vec3, yaw: number, v: Vec3): Vec3 => [p[0] + Math.cos(yaw) * v[0] + Math.sin(yaw) * v[2], p[1] + v[1], p[2] - Math.sin(yaw) * v[0] + Math.cos(yaw) * v[2]]
const blend = (a: Vec3,b: Vec3,u:number):Vec3=>a.map((v,i)=>mix(v,b[i],u)) as Vec3
export type ActorPose = { position: Vec3; yaw: number; feet: FootPose[]; legs: ReturnType<typeof solveTwoBone>[]; arms: ReturnType<typeof solveTwoBone>[]; hands: Vec3[]; seated?: boolean }
function flatWalk(points: Vec3[], start: number, end: number, initialYaw?: number, finalYaw?: number) {
  const path=makeWalkingPath(points),n=Math.max(2,Math.ceil(path.length/.48)),yaw0=initialYaw??path.sample(0).yaw;const headings=[yaw0];for(let i=1;i<=512;i++){const raw=path.sample(path.length*i/512).yaw,prev=headings[i-1];headings.push(prev+Math.atan2(Math.sin(raw-prev),Math.cos(raw-prev)))}const heading=(d:number)=>{const q=Math.max(0,Math.min(512,d/path.length*512)),i=Math.min(511,Math.floor(q));return mix(headings[i],headings[i+1],q-i)},yaw1=headings[512]+Math.atan2(Math.sin((finalYaw??headings[512])-headings[512]),Math.cos((finalYaw??headings[512])-headings[512]))
  const foot=(d:number,side:number,yaw?:number):FootPose=>{const s=path.sample(d),angle=yaw??heading(d);return{position:local(s.position,angle,[side? .14:-.14,0,0]),yaw:angle,planted:true}}
  const initial=[foot(0,0,yaw0),foot(0,1,yaw0)],events:Array<{side:number;foot:FootPose;from:number;to:number}>=[]
  // Contact-center distances, with a final paired plant. Time comes from the same continuous speed profile.
  const at=(d:number)=>{let a=start,b=end;for(let i=0;i<40;i++){const m=(a+b)/2;if(walkingDistance(m,start,end,path.length)<d)a=m;else b=m}return(a+b)/2}
  for(let i=0;i<n;i++){const side=i%2,d=Math.min(path.length,(i+1)*path.length/n);events.push({side,foot:foot(d,side,i===n-1?yaw1:undefined),from:i===0?start:at(Math.max(0,(i-.45)*path.length/n)),to:at(Math.min(path.length,(i+.55)*path.length/n))})}
  events.push({side:n%2,foot:foot(path.length,n%2,yaw1),from:at(path.length*.965),to:end})
  function pose(time:number) {const distance=walkingDistance(time,start,end,path.length),s=path.sample(distance),p=[...s.position] as Vec3,feet=initial.map((f,side)=>{let prev=f;for(const e of events){if(e.side!==side)continue;if(time<=e.from)return prev;if(time>=e.to){prev=e.foot;continue}const u=progress(time,e.from,e.to),travel=smoother(u),q=blend(prev.position,e.foot.position,travel);q[1]+=.11*Math.sin(Math.PI*u)**2;return{position:q,yaw:mix(prev.yaw,e.foot.yaw,travel),planted:false}}return prev});let yaw=time<=start?yaw0:time>=end?yaw1:heading(distance)
  // A planted initial turn is blended into the first lifted steps.
  yaw=mix(yaw0,yaw,smoother(progress(time,start,start+.6)))
  const limits=feet.map((f,i)=>{const h=local(p,yaw,[i?.13:-.13,1,0]),d=Math.hypot(h[0]-f.position[0],h[2]-f.position[2]);return f.position[1]+.16+Math.sqrt(Math.max(0,.852**2-d*d))-1});p[1]=smoothMinimum(p[1],Math.min(...limits));const legs=feet.map((f,i)=>solveTwoBone(local(p,yaw,[i?.13:-.13,1,0]),[f.position[0],f.position[1]+.16,f.position[2]],[Math.sin(yaw),0,Math.cos(yaw)],.43,.43));return{position:p,yaw,feet,legs,distance}}
  return pose
}
const attendantOut=flatWalk([[-7,.05,-4.7],[-10,.05,-4.7],[-13,.05,-4.7]],T.attendantStart,T.attendantAt,-Math.PI/2,-Math.PI/2)
const attendantBack=flatWalk([[-13,.05,-4.7],[-13.65,.05,-5.7],[-12.7,.05,-6.4],[-9,.05,-6.4],[-5,.05,-6.4]],T.guided,T.checkpoint-1,-Math.PI/2,Math.PI/2)
const insiderWalk=flatWalk([[-14.8,.05,-4.5],[-13.8,.05,-4.3],[-13.4,.05,-5.55],[-12,.05,-7],[-9,.05,-7],[-7,.05,-7]],T.insiderWalk,T.checkpoint,Math.PI,Math.PI/2)
export function actorPose(role: 'supervisor'|'insider'|'attendant'|'driver',time:number):ActorPose {
  let core: {position:Vec3;yaw:number;feet:FootPose[];legs:ReturnType<typeof solveTwoBone>[]}
  if(role==='supervisor') core=supervisorPose(time-22)
  else if(role==='insider') core=insiderWalk(time)
  else if(role==='attendant') core=time<T.guided?attendantOut(time):attendantBack(time)
  else {const position:Vec3=[carrierX(time)+.74,1.12,-.18],yaw=Math.PI/2;const hips=[-.13,.13].map(x=>local(position,yaw,[x,1,0])),feet=[-.16,.16].map(x=>({position:local(position,yaw,[x,.36,.53]),yaw,planted:true}));core={position,yaw,feet,legs:hips.map((h,i)=>solveTwoBone(h,[feet[i].position[0],feet[i].position[1]+.16,feet[i].position[2]],[1,1,0],.43,.43))}}
  const p=core.position,yaw=core.yaw
  const windows=role==='insider'?[[T.insiderWalk,T.checkpoint]]:role==='attendant'?[[T.attendantStart,T.attendantAt],[T.guided,T.checkpoint-1]]:[]
  const walkWeight=Math.max(0,...windows.map(([a,b])=>smoother(progress(time,a,a+.3))*(1-smoother(progress(time,b-.3,b)))))
  const walkStart=role==='insider'?T.insiderWalk:time<T.guided?T.attendantStart:T.guided
  const hands=[-1,1].map((side,i)=>{let hand=local(p,yaw,[side*.29,.9,mix(.08,.13*Math.sin((time-walkStart)*8+i*Math.PI),walkWeight)]);
    if(role==='insider'&&time<T.insiderWalk-.5){const target:Vec3=[controls.crane[0]-side*.2,controls.crane[1]+.25,controls.crane[2]+.2];const pressing=smoother(progress(time,1,T.controlsAt))*(1-smoother(progress(time,T.attendantAt-1,T.insiderWalk-.5)));hand=blend(hand,target,pressing);hand[1]+=.18*Math.sin(Math.PI*pressing)}
    if(role==='driver')hand=local(p,yaw,[side*.20,1.29,.35])
    if(role==='supervisor'){hand=local(p,yaw,[side*.194,1.064,.345]);if(i===0){const press=smoother(progress(time,55.5,56.6))*(1-smoother(progress(time,57.6,58.5)));hand=blend(hand,controls.supervisor,press);hand[1]+=.12*Math.sin(Math.PI*press)}else{const stop=smoother(progress(time,59,60))*(1-smoother(progress(time,65,66)));hand=blend(hand,local(p,yaw,[.45,1.58,.19]),stop)}}
    if(role==='attendant'&&time>=T.attendantAt&&time<=T.insiderWalk+1){const u=smoother(progress(time,T.attendantAt,T.attendantAt+.7))*(1-smoother(progress(time,T.insiderWalk,T.insiderWalk+1)));hand=blend(hand,local(p,yaw,[side*.33,1.3,.35]),u)}return hand})
  const arms=hands.map((h,i)=>solveTwoBone(local(p,yaw,[i?.25:-.25,1.34,0]),h,local([0,0,0],yaw,role==='supervisor'?[0,0,1]:role==='insider'?blend([i?.2:-.2,.6,0],[0,0,1],smoother(progress(time,T.insiderWalk-1,T.insiderWalk))):[i?.7:-.7,-.4,.25]),.30,.28))
  return{...core,hands,arms,seated:role==='driver'}
}
