import type { Vec3 } from '../../contract'
import { clamp, mix, progress, seeded } from '../../math'
import { makeWalkingPath, smoother, walkingDistance } from '../../kinematics'
import { ground, surfaceY } from './layout'
import { T, ids } from './incident'
export const INCOMING=18, OUTGOING=18, AUDIENCE=32, VISITORS=11, COUNT=85
export const timing={stop:18,decision:T.decide,staffStart:34.3,staffArrive:T.signAt,grasp:T.grasp,turnStart:T.signStart,turnEnd:T.signEnd,restart:T.reliefReady,end:T.end}
export type RouteSample={position:Vec3;yaw:number}
export type Route={length:number;sample:(d:number)=>RouteSample}
const angleMix=(a:number,b:number,u:number)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*u
/** Lines and tangent circular fillets: continuous path position and heading, no segment-yaw jump. */
function roundedRoute(points:[number,number][],radius=.9):Route {
  type Piece={length:number;at:(u:number)=>RouteSample}
  const pieces:Piece[]=[];let from=points[0]
  const line=(a:number[],b:number[])=>{const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length>.00001)pieces.push({length,at:u=>({position:[mix(a[0],b[0],u),ground.walk,mix(a[1],b[1],u)],yaw:Math.atan2(dx,dz)})})}
  for(let i=1;i<points.length-1;i++){
    const a=points[i-1],b=points[i],c=points[i+1],la=Math.hypot(b[0]-a[0],b[1]-a[1]),lb=Math.hypot(c[0]-b[0],c[1]-b[1]),u=[(b[0]-a[0])/la,(b[1]-a[1])/la],v=[(c[0]-b[0])/lb,(c[1]-b[1])/lb],r=Math.min(radius,la*.4,lb*.4)
    const start:[number,number]=[b[0]-u[0]*r,b[1]-u[1]*r],end:[number,number]=[b[0]+v[0]*r,b[1]+v[1]*r],center=[start[0]+v[0]*r,start[1]+v[1]*r],turn=Math.sign(u[0]*v[1]-u[1]*v[0]),theta=Math.atan2(start[1]-center[1],start[0]-center[0])
    line(from,start);pieces.push({length:r*Math.PI/2,at:f=>{const t=theta+turn*f*Math.PI/2;return{position:[center[0]+r*Math.cos(t),ground.walk,center[1]+r*Math.sin(t)],yaw:Math.atan2(-turn*Math.sin(t),turn*Math.cos(t))}}});from=end
  }
  line(from,points.at(-1)!);const length=pieces.reduce((n,p)=>n+p.length,0)
  return {length,sample:(d:number)=>{if(d<0){const s=pieces[0].at(0);return{position:[s.position[0]+Math.sin(s.yaw)*d,ground.walk,s.position[2]+Math.cos(s.yaw)*d],yaw:s.yaw}}let remaining=d;for(const p of pieces){if(remaining<=p.length)return p.at(remaining/p.length);remaining-=p.length}const s=pieces.at(-1)!.at(1);return{position:[s.position[0]+Math.sin(s.yaw)*remaining,ground.walk,s.position[2]+Math.cos(s.yaw)*remaining],yaw:s.yaw}}}
}
const bypass=roundedRoute([[-24,11.75],[-6.4,11.75],[-6.4,15.7],[13.2,15.7],[13.2,11.75],[24,11.75]])
function straight(x:number,z:number,direction:number):Route{return{length:60,sample:d=>({position:[x+direction*d,ground.walk,z],yaw:direction*Math.PI/2})}}
function extend(path:ReturnType<typeof makeWalkingPath>):Route{return{length:path.length,sample:d=>{const s=path.sample(d),extra=d<0?d:d>path.length?d-path.length:0;return{position:[s.position[0]+Math.sin(s.yaw)*extra,ground.walk,s.position[2]+Math.cos(s.yaw)*extra],yaw:s.yaw}}}}
function reliefRoute():Route {const straight=2.35,r=.5,arc=Math.PI*r,length=straight+arc;return{length,sample:d=>{if(d<=straight)return{position:[-5.9,.15,15.4-d],yaw:Math.PI};if(d>=length)return{position:[-4.9,.15,13.05+d-length],yaw:0};const th=Math.PI+(d-straight)/r;return{position:[-5.4+r*Math.cos(th),.15,13.05+r*Math.sin(th)],yaw:Math.atan2(-Math.sin(th),Math.cos(th))}}}}
const paths={
 sign:extend(makeWalkingPath([[-7.8,.15,16.55],[-7.92,.15,15.8],[-8.05,.15,14.55]])),
 relief:reliefRoute(),
 worker:extend(makeWalkingPath([[6.2,.15,9.05],[6.2,.15,6],[6.2,.15,2],[6.2,.15,-2.5]])),
 intruder:roundedRoute([[7.8,9],[7.8,2.7],[6.25,2.7],[6.25,9.2],[10.65,9.2],[10.65,7.1]],.7),
 guard:roundedRoute([[8.15,2.3],[6.35,2.3],[6.35,9.2],[11.95,9.2],[11.95,7.1]],.75),
}
const distanceTo=(route:Route,x:number,z:number)=>{let best=0,error=Infinity;for(let d=0;d<=route.length;d+=.002){const p=route.sample(d).position,e=Math.hypot(p[0]-x,p[2]-z);if(e<error){error=e;best=d}}return best}
const intruderStop=distanceTo(paths.intruder,7.8,4.0),guardStop=distanceTo(paths.guard,6.35,3.4)
function bout(route:Route,t:number,start:number,end:number,length=route.length,cycles=Math.round(length/.83)) {const stride=length/Math.max(1,cycles);return{distance:walkingDistance(t,start,end,length,.6),stride}}
function plan(route:Route,t:number,firstStop:number,start:number,stop:number,restart:number,end:number){
 const stride=firstStop/Math.max(1,Math.round(firstStop/.80)),total=Math.round(route.length/stride)*stride
 const distance=walkingDistance(t,start,stop,firstStop,.6)+walkingDistance(t,restart,end,total-firstStop,.8)
 return{route,distance,stride}
}
/** Same distance function feeds translation and footfalls; holds never drift. */
export function signYaw(t:number){return -Math.PI/2*smoother(progress(t,T.signStart,T.signEnd))}
export function locomotion(i:number,t:number){
 const scale=i>=79?1:.9+seeded(i+77)*.15
 if(i<36){const incoming=i<18,j=incoming?i:i-18,stride=incoming?.82:.80,total=4*stride,x=incoming?-22+j*1.15:22-j*1.15,z=incoming?11.75:10.45,first=walkingDistance(t,0,18,total,3),second=walkingDistance(t,T.reliefReady,78,(incoming?25:22)*stride,2),distance=first+second,from=x+(incoming?total:-total),routed=incoming&&from< -7.3
 const route:Route=routed?{length:bypass.length,sample:d=>d<=total?straight(x,z,1).sample(d):bypass.sample(from+24+d-total)}:straight(x,z,incoming?1:-1),shot=route.sample(distance)
 return{route,distance,stride,scale,phase:i%2*.5,position:shot.position,yaw:shot.yaw,active:t>0&&t<18||t>T.reliefReady&&t<78}}
 let p:{route:Route;distance:number;stride:number}|null=null
 if(i===ids.signSteward)p={route:paths.sign,...bout(paths.sign,t,34.3,T.signAt,paths.sign.length,3)}
 if(i===ids.reliefSteward)p={route:paths.relief,...bout(paths.relief,t,34.3,T.signAt)}
 if(i===ids.worker)p={route:paths.worker,...bout(paths.worker,t,T.workerStart,T.workerAt)}
 if(i===ids.intruder)p=plan(paths.intruder,t,intruderStop,T.intruderStart,T.intruderAt,T.escort+.7,T.checkpoint)
 if(i===ids.guard)p=plan(paths.guard,t,guardStop,37.1,T.guardAt,T.escort,63.5)
 if(!p)return null
 const shot=p.route.sample(p.distance),active=i===ids.worker?t>T.workerStart&&t<T.workerAt:i===ids.intruder?t>T.intruderStart&&t<T.intruderAt||t>T.escort+.7&&t<T.checkpoint:i===ids.guard?t>37.1&&t<T.guardAt||t>T.escort&&t<63.5:t>34.3&&t<T.signAt
 return{...p,scale,phase:0,position:shot.position,yaw:shot.yaw,active}
}
export function actorAt(i:number,t:number){
  const l=locomotion(i,t);if(l)return{x:l.position[0],y:l.position[1],z:l.position[2],heading:l.yaw,moving:l.active,steward:i>=79}
  if(i<68){const j=i-36,row=j%5,raw=-1.02+Math.floor(j/5)*.32+seeded(j+81)*.07,theta=row===0?[-.72,-.53,-.34,-.15,.21,.44,.68][Math.floor(j/5)]:Math.min(.82,Math.abs(raw)<.14?(raw<0?-.18:.18):raw),r=6.55+row*2.05;return{x:-7+Math.sin(theta)*r,z:-9+Math.cos(theta)*r,y:.14+row*.36,heading:theta+Math.PI,moving:false,steward:false}}
  if(i===ids.attendant)return{x:13.5,z:8.0,y:ground.walk,heading:-Math.PI/2,moving:false,steward:false}
  const j=i-68;if(j>=8){const p=[[-11,-7.6],[-5,-7.6],[-8,-11.1]][j-8];return{x:p[0],z:p[1],y:ground.stage,heading:0,moving:false,steward:false}}
  const x=j<4?12.9+j*1.2:-20.7+(j%4)*1.1,z=j<4?6.7:5.2;return{x,z,y:surfaceY(x,z),heading:Math.PI,moving:false,steward:false}
}
export { angleMix }
