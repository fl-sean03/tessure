'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Group, Mesh, MeshStandardMaterial, SRGBColorSpace, Vector3 } from 'three'
import type { Vec3, WorldProps } from '../../contract'
import { mix, progress } from '../../math'
import { smoother, solveTwoBone } from '../../kinematics'
import { T, controllerState, laneOccupied } from './timing'
import { vehiclePose } from './vehicles'
import { guardPose } from './guard'
import type { Materials, Part } from './model'
export function Parts({parts}:{parts:Part[]}){return <>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow/>)}</>}
export function Sign({position,size,lines,clock,kind='fixed'}:{position:Vec3;size:[number,number];lines:string[];clock?:WorldProps['clock'];kind?:'fixed'|'controller'|'lane'}){
 const built=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return{canvas,texture,last:''}},[])
 const draw=(text:string)=>{if(text===built.last)return;built.last=text;const c=built.canvas.getContext('2d')!;c.fillStyle='#20343d';c.fillRect(0,0,1024,512);c.fillStyle=kind==='controller'?'#debd75':'#edf0e5';const rows=text.split('|');c.textAlign='center';c.textBaseline='middle';c.font=lines[0]==='STOP'?'bold 400px sans-serif':'bold 104px sans-serif';rows.forEach((s,i)=>c.fillText(s,512,512*(i+.5)/rows.length,960));built.texture.needsUpdate=true}
 useEffect(()=>()=>built.texture.dispose(),[built]);useFrame(()=>{const t=clock?.current.time??0;draw(kind==='controller'?controllerState(t)+'|COOLING ON':kind==='lane'?(laneOccupied(vehiclePose(t).z)?'LANE OCCUPIED':'LANE CLEAR')+'|GATE CLOSED':lines.join('|'))})
 // Separate the printed face from its backing plate; equal-depth faces disappeared at some camera angles.
 return <mesh position={[position[0],position[1],position[2]+.012]}><planeGeometry args={size}/><meshBasicMaterial map={built.texture} toneMapped={false}/></mesh>
}
function Links({joints,material,name}:{joints:()=>Vec3[][];material:MeshStandardMaterial;name:string}){
 const refs=useRef<(Mesh|null)[]>([]),v=useMemo(()=>({a:new Vector3(),b:new Vector3(),axis:new Vector3(0,1,0),d:new Vector3()}),[])
 useFrame(()=>{joints().forEach(([a,b],i)=>{const m=refs.current[i]!;v.a.set(...a);v.b.set(...b);m.position.copy(v.a).add(v.b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(v.axis,v.d.copy(v.b).sub(v.a).normalize())})})
 return <>{[0,1,2,3].map(i=><mesh key={i} name={`${name}-${i}`} ref={o=>{refs.current[i]=o}} material={material}><cylinderGeometry args={[.042,.042,i%2?.34:.32,8]}/></mesh>)}</>
}
export function Driver({clock,body,steering,materials}:{clock:WorldProps['clock'];body:Part[];steering:Part[];materials:Materials}){
 const wheel=useRef<Group>(null),angle=()=>{const p=vehiclePose(clock.current.time);return(p.wheels[0].steer+p.wheels[1].steer)*.65}
 useFrame(()=>{wheel.current!.rotation.z=angle()})
 const joints=()=>[-1,1].flatMap(side=>{const a=angle(),hand:Vec3=[.57+side*.23*Math.cos(a),1.99+side*.23*Math.sin(a),-2.76],shoulder:Vec3=[.57+side*.2,2.22,-2.23],l=solveTwoBone(shoulder,hand,[side,-1,0],.32,.34);return[[l.hip,l.knee],[l.knee,l.ankle]]})
 return <group name="driver"><group dispose={null}><Parts parts={body}/><group name="driver-steering" ref={wheel} position={[.57,1.99,-2.76]}><Parts parts={steering}/></group></group><Links joints={joints} material={materials.amber} name="driver-arm"/></group>
}
export function Operator({clock,body,shoe,materials}:{clock:WorldProps['clock'];body:Part[];shoe:Part[];materials:Materials}){
 const arm=useRef<(Mesh|null)[]>([]),hand=useRef<Mesh>(null),v=useMemo(()=>({a:new Vector3(),b:new Vector3(),d:new Vector3(),up:new Vector3(0,1,0)}),[])
 useFrame(()=>{const t=clock.current.time,u=smoother(progress(t,T.respond,T.local-.5))*(1-smoother(progress(t,T.local+1,T.local+3))),target:Vec3=[mix(14.31,14.26,u),mix(1.39,1.48,u),mix(7.7,7.40,u)],l=solveTwoBone([14.31,1.77,7.9],target,[1,0,0],.32,.34);hand.current!.position.set(...target);[[l.hip,l.knee],[l.knee,l.ankle]].forEach(([a,b],i)=>{v.a.set(...a);v.b.set(...b);arm.current[i]!.position.copy(v.a).add(v.b).multiplyScalar(.5);arm.current[i]!.quaternion.setFromUnitVectors(v.up,v.d.copy(v.b).sub(v.a).normalize())})})
 return <group name="local-operator"><group position={[14.05,.39,7.9]} rotation={[0,Math.PI,0]}><group dispose={null}><Parts parts={body}/>{[-.12,.12].map(x=><group key={x} position={[x,0,0]}><Parts parts={shoe}/></group>)}</group>{[-.12,.12].map(x=><mesh key={x} position={[x,.49,0]} material={materials.dark}><cylinderGeometry args={[.063,.063,.77,8]}/></mesh>)}</group>{[0,1].map(i=><mesh key={i} name={`operator-arm-${i}`} ref={o=>{arm.current[i]=o}} material={materials.joint}><cylinderGeometry args={[.052,.052,i?.34:.32,8]}/></mesh>)}<mesh ref={hand} name="operator-hand" material={materials.skin}><sphereGeometry args={[.06,8,6]}/></mesh></group>
}

export function GuardArm({clock,materials}:{clock:WorldProps['clock'];materials:Materials}){
 const refs=useRef<(Mesh|null)[]>([]),hand=useRef<Mesh>(null),v=useMemo(()=>({a:new Vector3(),b:new Vector3(),d:new Vector3(),up:new Vector3(0,1,0)}),[])
 useFrame(()=>{const t=clock.current.time,p=guardPose(t),angle=p.armSwing-smoother(progress(t,T.guardReady,T.reverse))*1.25*(1-smoother(progress(t,T.resolve,68))),world=(q:Vec3):Vec3=>[p.position[0]+q[0]*Math.cos(p.yaw)+q[2]*Math.sin(p.yaw),p.position[1]+q[1],p.position[2]-q[0]*Math.sin(p.yaw)+q[2]*Math.cos(p.yaw)],shoulder=world([-.26,1.38,0]),rest=world([-.285,1.38-.41*Math.cos(angle)-.09*Math.sin(angle),-.41*Math.sin(angle)+.09*Math.cos(angle)]),u=smoother(progress(t,T.resolve,68))*(1-smoother(progress(t,70,T.checked))),target=rest.map((n,i)=>mix(n,[9.48,1.59,7.23][i],u)) as Vec3,l=solveTwoBone(shoulder,target,[-1,0,0],.25,.26);hand.current!.position.set(...target);[[l.hip,l.knee],[l.knee,l.ankle]].forEach(([a,b],i)=>{v.a.set(...a);v.b.set(...b);refs.current[i]!.position.copy(v.a).add(v.b).multiplyScalar(.5);refs.current[i]!.quaternion.setFromUnitVectors(v.up,v.d.copy(v.b).sub(v.a).normalize())})})
 return <>{[0,1].map(i=><mesh key={i} ref={o=>{refs.current[i]=o}} name={`guard-free-arm-${i}`} material={materials.blue}><cylinderGeometry args={[.056,.056,i?.26:.25,8]}/></mesh>)}<mesh ref={hand} name="guard-hand" material={materials.skin}><sphereGeometry args={[.065,8,6]}/></mesh></>
}
