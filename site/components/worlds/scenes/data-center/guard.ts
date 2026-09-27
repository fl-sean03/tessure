import type { Vec3 } from '../../contract'
import { mix, progress, smooth } from '../../math'
import { makeWalkingPath, smoothMinimum, smoother, solveTwoBone, walkingDistance } from '../../kinematics'
import { T } from './timing'
export const guardRig={upper:.4,lower:.4,hipY:.88,hipWidth:.12,ankleY:.105,reach:.792}
export type GuardFoot={position:Vec3;yaw:number;planted:boolean}
type Landing=GuardFoot&{side:0|1;from:number;to:number}
function foot(p:Vec3,yaw:number,side:number):GuardFoot {const x=side===0?-.12:.12;return{position:[p[0]+Math.cos(yaw)*x,p[1],p[2]-Math.sin(yaw)*x],yaw,planted:true}}
function hip(position:Vec3,yaw:number,side:number):Vec3 {const x=side===0?-.12:.12;return[position[0]+Math.cos(yaw)*x,position[1]+guardRig.hipY,position[2]-Math.sin(yaw)*x]}
function limit(p:Vec3,yaw:number,feet:GuardFoot[]){const h=feet.map((f,i)=>{const a=hip(p,yaw,i),d=Math.hypot(a[0]-f.position[0],a[2]-f.position[2]);return f.position[1]+guardRig.ankleY+Math.sqrt(Math.max(0,guardRig.reach**2-d**2))-guardRig.hipY});return smoothMinimum(h[0],h[1])}
/** Accepted world-space stance/fixed-link method; each new path owns its support/clearance checks. */
export function walkingRig(start:Vec3,end:Vec3,startYaw:number,endYaw:number,from:number,to:number){
 const distance=Math.hypot(end[0]-start[0],end[2]-start[2]),steps=Math.ceil(distance/.43)+1
 const initial:[GuardFoot,GuardFoot]=[foot(start,startYaw,0),foot(start,startYaw,1)],pairs:[GuardFoot,GuardFoot][]=[initial]
 for(let i=0;i<steps;i++){const u=Math.min(1,(i+1)/(steps-1)),p=start.map((v,j)=>mix(v,end[j],u)) as Vec3,pair=[...pairs.at(-1)!] as [GuardFoot,GuardFoot];pair[i%2]=foot(p,mix(startYaw,endYaw,smoother(u)),i%2);pairs.push(pair)}
 const centers=pairs.map(pair=>pair[0].position.map((v,j)=>(v+pair[1].position[j])/2) as Vec3)
 const round=(points:Vec3[])=>points.map((p,i)=>i===0||i===points.length-1?p:p.map((v,j)=>.25*points[i-1][j]+.5*v+.25*points[i+1][j]) as Vec3)
 const route=round(round(centers)),path=makeWalkingPath(route),distanceAt=(t:number)=>walkingDistance(t,from,to,path.length,.6)
 const times=path.knots.map((d,i)=>{if(i===0)return from;if(i===path.knots.length-1)return to;let lo=from,hi=to;for(let n=0;n<40;n++){const mid=(lo+hi)/2;if(distanceAt(mid)<d)lo=mid;else hi=mid}return(lo+hi)/2})
 const landings:Landing[]=pairs.slice(1).map((pair,i)=>({...pair[i%2],side:i%2 as 0|1,from:times[i],to:times[i+1]}))
 function footAt(side:number,t:number):GuardFoot{let previous=initial[side];for(const step of landings){if(step.side!==side)continue;if(t<=step.from)return previous;if(t>=step.to){previous=step;continue}const phase=progress(t,step.from,step.to);if(phase<=.04)return previous;if(phase>=.96)return step;const u=progress(phase,.04,.96),travel=smoother(u),top=Math.max(previous.position[1],step.position[1])+.10;const y=u<.22?mix(previous.position[1],top,smoother(u/.22)):u>.78?mix(top,step.position[1],smoother((u-.78)/.22)):top;return{position:[mix(previous.position[0],step.position[0],travel),y,mix(previous.position[2],step.position[2],travel)],yaw:mix(previous.yaw,step.yaw,travel),planted:false}}return previous}
 const headings=pairs.map(pair=>(pair[0].yaw+pair[1].yaw)/2),heights=route.map((p,i)=>i===0?start[1]:i===route.length-1?end[1]:limit(p,headings[i],pairs[i])-.035)
 return(t:number)=>{const shot=path.sample(distanceAt(t)),feet:[GuardFoot,GuardFoot]=[footAt(0,t),footAt(1,t)],position=[...shot.position] as Vec3,{segment,u}=shot;let yaw=mix(headings[segment],headings[segment+1],smoother(u));position[1]=smoothMinimum(mix(heights[segment],heights[segment+1],smooth(u))+.015*Math.sin(Math.PI*u)**2,limit(position,yaw,feet));if(t<=from){position.splice(0,3,...start);yaw=startYaw}if(t>=to){position.splice(0,3,...end);yaw=endYaw}const pole:Vec3=[Math.sin(yaw),0,Math.cos(yaw)],legs=feet.map((f,i)=>solveTwoBone(hip(position,yaw,i),[f.position[0],f.position[1]+guardRig.ankleY,f.position[2]],pole,.4,.4));const forward=(f:GuardFoot)=>(f.position[0]-position[0])*Math.sin(yaw)+(f.position[2]-position[2])*Math.cos(yaw);return{position,yaw,feet,legs,armSwing:(forward(feet[1])-forward(feet[0]))*.38}}
}
export const guardPose=walkingRig([12,.39,7.45],[10,.39,7.45],-Math.PI/2,-.9,T.guardStart,T.guardReady)
export const staffPose=walkingRig([18,.295,15],[18,.295,-1],Math.PI,Math.PI,36,50)
