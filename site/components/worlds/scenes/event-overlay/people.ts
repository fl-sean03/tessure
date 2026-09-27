import type { Vec3 } from '../../contract'
import { mix, progress, seeded } from '../../math'
import { smoother, solveTwoBone, smoothMinimum } from '../../kinematics'
import { actorAt, angleMix, locomotion, signYaw, timing } from './choreography'
import { T, ids, reliefYaw } from './incident'
import { arrivalSign, reliefPivot, signPivot, surfaceY } from './layout'
export const personRig={thigh:.43,shin:.43,hip:.88,ankle:.12,upperArm:.35,forearm:.34,shoulder:1.28,footWidth:.18,footLength:.34,footHeight:.11}
export type Foot={position:Vec3;yaw:number;planted:boolean;anchor:number}
const transform=(p:Vec3,yaw:number,local:Vec3):Vec3=>[p[0]+Math.cos(yaw)*local[0]+Math.sin(yaw)*local[2],p[1]+local[1],p[2]-Math.sin(yaw)*local[0]+Math.cos(yaw)*local[2]]
export function signGrip(t:number):Vec3 {const yaw=signYaw(t);return[arrivalSign[0]+Math.sin(yaw)*.28,arrivalSign[1]+signPivot-.35,arrivalSign[2]+Math.cos(yaw)*.28]}
export function reliefGrip(t:number):Vec3 {const y=reliefYaw(t);return[reliefPivot[0]-.12*Math.cos(y),1.18+.12*Math.sin(y),13.49]}
/** Contact anchors are immutable world transforms for each stance; phase comes from route distance. */
export function footAt(i:number,t:number,side:number):Foot {
  const l=locomotion(i,t),a=actorAt(i,t),scale=l?.scale??(.9+seeded(i+77)*.15)
  if(!l){return{position:transform([a.x,a.y,a.z],a.heading,[(side?1:-1)*.115*scale,0,0]),yaw:a.heading,planted:true,anchor:0}}
  const cycle=l.distance/l.stride+l.phase+side*.5,n=Math.floor(cycle+1e-10),phase=cycle-n,stance=.6,anchor=(n-l.phase-side*.5+stance/2)*l.stride
  const place=(d:number)=>{const shot=l.route.sample(d),p=transform(shot.position,shot.yaw,[(side?1:-1)*.115*scale,0,0]);p[1]=surfaceY(p[0],p[2]);return{position:p,yaw:shot.yaw}}
  const from=place(anchor)
  if(phase<=stance)return{...from,planted:true,anchor}
  const u=progress(phase,stance,1),blend=smoother(u),to=place(anchor+l.stride),lift=.12*scale*Math.sin(Math.PI*u)**2
  return{position:[mix(from.position[0],to.position[0],blend),mix(from.position[1],to.position[1],blend)+lift,mix(from.position[2],to.position[2],blend)],yaw:angleMix(from.yaw,to.yaw,blend),planted:false,anchor}
}
export function personPose(i:number,t:number){
  const a=actorAt(i,t),l=locomotion(i,t),scale=l?.scale??(.9+seeded(i+77)*.15),feet=[footAt(i,t,0),footAt(i,t,1)],root:Vec3=[a.x,a.y,a.z],yaw=a.heading,forward:Vec3=[Math.sin(yaw),0,Math.cos(yaw)]
  const limits=feet.map((f,side)=>{const hip=transform(root,yaw,[(side?1:-1)*.11*scale,0,0]),horizontal=Math.hypot(hip[0]-f.position[0],hip[2]-f.position[2]);return f.position[1]+personRig.ankle*scale+Math.sqrt(Math.max(.001,((personRig.thigh+personRig.shin)*scale-.008)**2-horizontal**2))-personRig.hip*scale})
  root[1]=smoothMinimum(root[1],smoothMinimum(limits[0],limits[1]))
  const legs=feet.map((f,side)=>solveTwoBone(transform(root,yaw,[(side?1:-1)*.11*scale,personRig.hip*scale,0]),[f.position[0],f.position[1]+personRig.ankle*scale,f.position[2]],forward,personRig.thigh*scale,personRig.shin*scale))
  const contact=i===79?smoother(progress(t,T.signAt,T.grasp))*(1-smoother(progress(t,T.signEnd,42.15))):i===80?smoother(progress(t,T.signAt,T.grasp))*(1-smoother(progress(t,T.reliefOpen,42.15))):0,lean=.12*contact
  const torso=transform(root,yaw,[0,1.105*scale,lean*.5]),head=transform(root,yaw,[0,1.58*scale,lean]),hair=transform(root,yaw,[0,1.67*scale,lean-.015*scale]),hips=transform(root,yaw,[0,.87*scale,0])
  const speed=l?Math.abs((locomotion(i,t+.002)!.distance-locomotion(i,t-.002)!.distance)/.004):0,swing=l?Math.sin(2*Math.PI*(l.distance/l.stride+l.phase))*.16*Math.min(1,speed/.65):0
  const arms=[0,1].map(side=>{const sign=side?1:-1,shoulder=transform(root,yaw,[sign*.24*scale,personRig.shoulder*scale,lean]),rest=transform(root,yaw,[sign*.29*scale,.77*scale,sign*swing]),guide=transform(root,yaw,[sign*.55*scale,1.25*scale,.33*scale]);let hand=rest
    if(side===1&&(i===79||i===80)){const point=smoother(progress(t,42.15,43.1));hand=hand.map((v,k)=>mix(v,guide[k],point)) as Vec3;if(i===79||i===80){const grip=i===79?signGrip(t):reliefGrip(t);hand=hand.map((v,k)=>mix(v,grip[k],contact)) as Vec3}}
    if(i===ids.worker&&side===1){const w=smoother(progress(t,5.3,6.3))*(1-smoother(progress(t,7.4,8.3)));hand=hand.map((v,k)=>mix(v,[5.45,1.29,8.744][k],w)) as Vec3}
    if(i===ids.guard&&side===1){const w=smoother(progress(t,39.6,40.4))*(1-smoother(progress(t,43,44)));const stop=transform(root,yaw,[.39,1.40,.45]);hand=hand.map((v,k)=>mix(v,stop[k],w)) as Vec3}
    const pole:Vec3=i===80&&side===1?[-Math.sin(yaw),-1,-Math.cos(yaw)]:[sign*Math.cos(yaw),-.15,-sign*Math.sin(yaw)],bone=solveTwoBone(shoulder,hand,pole,personRig.upperArm*scale,personRig.forearm*scale)
    return{shoulder,elbow:bone.knee,hand}
  })
  return{root,yaw,scale,feet,legs,arms,torso,head,hair,hips,contact,moving:a.moving,phase:l?l.distance/l.stride:0}
}
