'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { WorldProps } from '../../contract'
import type { Materials } from './geometry'
import { Parts } from './actors'
import { makeAircraft, makeGate, makeGimbal, makeIncidentSite, makeRotor } from './incident-geometry'
import { aircraftPose, gateAngle, publicAngle, warningState } from './motion'
import { gatePivot, publicPivot } from './timing'
function Sign({text,position,width=2.5}:{text:string;position:[number,number,number];width?:number}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#263e41';ctx.fillRect(0,0,512,128);ctx.fillStyle='#fff0cf';ctx.strokeStyle='#fff0cf';ctx.lineWidth=10;
 if(text==='SERVICE ONLY'){ctx.strokeStyle='#e8b254';ctx.beginPath();ctx.arc(256,64,46,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(224,96);ctx.lineTo(288,32);ctx.stroke();for(const x of[72,380]){ctx.fillStyle='#e8b254';ctx.fillRect(x,36,60,56)}}else{ctx.beginPath();ctx.arc(290,25,12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(284,43);ctx.lineTo(271,73);ctx.lineTo(250,111);ctx.moveTo(273,72);ctx.lineTo(301,102);ctx.moveTo(281,48);ctx.lineTo(306,67);ctx.stroke();ctx.beginPath();ctx.moveTo(198,64);ctx.lineTo(113,64);ctx.lineTo(143,35);ctx.moveTo(113,64);ctx.lineTo(143,93);ctx.stroke()}
 return new CanvasTexture(c)},[text]);useEffect(()=>()=>texture.dispose(),[texture]);return <mesh position={position}><planeGeometry args={[width,width/4]}/><meshBasicMaterial map={texture} side={DoubleSide}/></mesh>
}
export function Incident({clock,m,high}:{clock:WorldProps['clock'];m:Materials;high:boolean}){
 const gate=useRef<Group>(null),route=useRef<Group>(null),air=useRef<Group>(null),rotors=useRef<(Group|null)[]>([]),gimbal=useRef<Group>(null),alert=useRef<Mesh>(null),warning=useRef<Mesh>(null),record=useRef<Mesh>(null), waterTrack=useRef<Mesh>(null), airTrack=useRef<Mesh>(null)
 const site=useMemo(()=>makeIncidentSite(m,high),[m,high]),door=useMemo(()=>makeGate(m,high),[m,high]),publicDoor=useMemo(()=>makeGate(m,high,true),[m,high]),airframe=useMemo(()=>makeAircraft(m,high),[m,high]),blades=useMemo(()=>makeRotor(m,high),[m,high]),camera=useMemo(()=>makeGimbal(m,high),[m,high]);useEffect(()=>()=>[site,door,publicDoor,airframe,blades,camera].flat().forEach(p=>p.geometry.dispose()),[site,door,publicDoor,airframe,blades,camera]);
 const target=useMemo(()=>new Vector3(),[])
 useFrame(()=>{const t=clock.current.time,p=aircraftPose(t),state=warningState(t);gate.current!.rotation.y=gateAngle(t);route.current!.rotation.y=publicAngle(t);air.current!.position.copy(p.p);air.current!.rotation.set(p.pitch,p.yaw,p.bank);air.current!.visible=p.visible;rotors.current.forEach((r,i)=>{if(r)r.rotation.y=p.rotor*(i%2?1:-1)});air.current!.updateMatrixWorld(true);target.set(18,1.12,-.5);gimbal.current!.lookAt(target);
 waterTrack.current!.visible=t>=7;airTrack.current!.visible=t>=18;(waterTrack.current!.material as MeshBasicMaterial).color.set(t>=80?'#698274':'#91bfca');(airTrack.current!.material as MeshBasicMaterial).color.set(t>=80?'#698274':'#ecb457');alert.current!.visible=state.local;warning.current!.visible=state.warning;record.current!.visible=state.record;(warning.current!.material as MeshBasicMaterial).opacity=state.flash
 })
 return <group name="incident-world"><Parts parts={site}/><group name="service-gate" ref={gate} position={gatePivot}><Parts parts={door}/></group><group name="public-route-barrier" ref={route} position={publicPivot}><Parts parts={publicDoor}/></group>
 <Sign text="SERVICE ONLY" position={[14.2,2.55,-1.63]} width={2.65}/><Sign text="PUBLIC WALK" position={[5.5,2.25,-1.63]} width={2.45}/>
 <mesh ref={alert} name="local-alert" position={[10.5,2.5,-1.2]}><planeGeometry args={[.14,.055]}/><meshBasicMaterial color="#ecb457"/></mesh><mesh ref={record} name="shore-check-record" position={[10.5,2.19,-1.2]}><planeGeometry args={[.38,.13]}/><meshBasicMaterial color="#90c9af"/></mesh>
 <mesh ref={waterTrack} name="water-observation-tile" position={[10.19,2.5,-1.2]}><planeGeometry args={[.34,.22]}/><meshBasicMaterial color="#91bfca"/></mesh><mesh ref={airTrack} name="air-observation-tile" position={[10.81,2.5,-1.2]}><planeGeometry args={[.34,.22]}/><meshBasicMaterial color="#ecb457"/></mesh>
 <mesh ref={warning} name="warning-beacon" position={[10.5,3.86,-1.35]}><cylinderGeometry args={[.16,.16,.24,12]}/><meshBasicMaterial color="#ffbd59" transparent/></mesh>
 <group name="hostile-aircraft" ref={air}><Parts parts={airframe}/>{[[-.75,-.65],[.75,-.65],[-.75,.65],[.75,.65]].map(([x,z],i)=><group key={i} name={'hostile-rotor-'+i} ref={r=>{rotors.current[i]=r}} position={[x,.25,z]}><Parts parts={blades}/></group>)}<group name="hostile-gimbal" ref={gimbal} position={[0,-.32,.25]}><Parts parts={camera}/></group></group>
 </group>
}
