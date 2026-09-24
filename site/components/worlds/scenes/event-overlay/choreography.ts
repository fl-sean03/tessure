import { mix, progress, seeded, smooth } from '../../math'
export const INCOMING=18, OUTGOING=18, AUDIENCE=32, VISITORS=11, COUNT=INCOMING+OUTGOING+AUDIENCE+VISITORS+2
function travel(points:[number,number][],distance:number){let remaining=Math.max(0,distance);for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(remaining<=length||i===points.length-1){const u=Math.min(1,remaining/Math.max(.001,length));return{x:mix(a[0],b[0],u),z:mix(a[1],b[1],u),heading:Math.atan2(b[0]-a[0],b[1]-a[1]),moving:remaining<length}}remaining-=length}return{x:points[0][0],z:points[0][1],heading:0,moving:false}}
/** Authored anonymous choreography, not a simulation or a density estimate. */
export function actorAt(i:number,t:number){
 const approach=t<4?t*.48:t<8?1.92+.8*(1-Math.pow(1-(t-4)/4,2)):2.72+Math.min(17,t-8)*.022,review=2.72+17*.022
 if(i<INCOMING){const x=-22+i*1.15,lane=11.8+(i%2)*.22,from=x+review;if(t<=29)return{x:x+approach,z:lane,y:.12,heading:Math.PI/2,moving:t<8,steward:false};const path:[number,number][]=from< -6.6?[[from,lane],[-6.6,lane],[-6.6,15.65],[13.1,15.65],[13.1,lane],[22,lane]]:[[from,lane],[16.2+(i-11)*1.1,lane]];return{...travel(path,(t-29)*1.45),y:.14,steward:false}}
 if(i<INCOMING+OUTGOING){const j=i-INCOMING,x=22-j*1.15;return{x:Math.max(-22,x-(t<=30?approach*.9:review*.9+(t-30)*.84)),z:10.05+(j%2)*.22,y:.12,heading:-Math.PI/2,moving:t<8||t>30,steward:false}}
 if(i<INCOMING+OUTGOING+AUDIENCE){const j=i-INCOMING-OUTGOING,row=j%5,theta=-1.02+Math.floor(j/5)*.32+seeded(j+81)*.07,r=6.55+row*2.05;return{x:-7+Math.sin(theta)*r,z:-9+Math.cos(theta)*r,y:.14+row*.36,heading:theta+Math.PI,moving:false,steward:false}}
 if(i<COUNT-2){const j=i-INCOMING-OUTGOING-AUDIENCE,side=j<4;if(j>=8){const places=[[-11,-7.6],[-5,-7.6],[-8,-11.1]];return{x:places[j-8][0],z:places[j-8][1],y:.78,heading:0,moving:false,steward:false}}return{x:side?13.5+(j%4)*.78:-20+(j%4)*.8,z:side?6.5:5.2,y:.1,heading:Math.PI,moving:false,steward:false}}
 const j=i-(COUNT-2),p=smooth(progress(t,25.2,31.5));return{x:j?mix(16.2,12,p):mix(-10.4,-8.1,p),z:j?mix(15.5,17.7,p):mix(16.6,14.1,p),y:.14,heading:j?-Math.PI/2:Math.PI/2,moving:t>25.2&&t<31.5,steward:true}
}
