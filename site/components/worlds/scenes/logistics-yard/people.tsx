'use client'
import {useLayoutEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {Color,Group,InstancedMesh,Object3D,Vector3} from 'three'
import type {WorldProps} from '../../contract'
import {actorPose} from './actors'
import {makeActorBody,makeSupervisorShoe,type Materials} from './geometry'
const roles=['supervisor','insider','attendant','driver'] as const
const roleColors=['#d5b254','#c57b48','#77969c','#587586']
/** A shared fixed-length rig; absolute world-space feet and solved links for every moving role. */
export function People({clock,high,m}:{clock:WorldProps['clock'];high:boolean;m:Materials}){
 const body=useMemo(()=>makeActorBody(m,high),[m,high]),refs=useRef<(InstancedMesh|null)[]>([]),upper=useRef<InstancedMesh>(null),fore=useRef<InstancedMesh>(null),hands=useRef<InstancedMesh>(null),legs=useRef<InstancedMesh>(null),shoes=useRef<InstancedMesh>(null),tablet=useRef<Group>(null)
 const shoeGeometry=useMemo(()=>makeSupervisorShoe(m,high)[0].geometry,[m,high])
 useLayoutEffect(()=>()=>{shoeGeometry.dispose()},[shoeGeometry])
 const o=useMemo(()=>new Object3D(),[]),axis=useMemo(()=>new Vector3(0,1,0),[]),d=useMemo(()=>new Vector3(),[])
 useLayoutEffect(()=>{const all=[...refs.current,upper.current,fore.current,hands.current,legs.current,shoes.current].filter((v):v is InstancedMesh=>!!v);roles.forEach((_,i)=>{refs.current.forEach((mesh,j)=>{if(mesh&&body[j].material===m.white)mesh.setColorAt(i,new Color(roleColors[i]))});for(let j=0;j<2;j++)upper.current!.setColorAt(i*2+j,new Color(roleColors[i]))});return()=>{all.forEach(v=>v.dispose());body.forEach(p=>p.geometry.dispose())}},[body,m])
 useFrame(()=>{
  const link=(mesh:InstancedMesh,i:number,a:number[],b:number[])=>{o.position.fromArray(a).add(d.fromArray(b)).multiplyScalar(.5);o.quaternion.setFromUnitVectors(axis,d.fromArray(b).sub(new Vector3().fromArray(a)).normalize());o.scale.set(1,1,1);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)}
  roles.forEach((role,i)=>{const p=actorPose(role,clock.current.time);o.position.set(...p.position);o.rotation.set(0,p.yaw,0);o.scale.set(1,1,1);o.updateMatrix();refs.current.forEach(v=>v?.setMatrixAt(i,o.matrix));if(i===0&&tablet.current){tablet.current.position.copy(o.position);tablet.current.rotation.copy(o.rotation)}
   p.feet.forEach((f,j)=>{o.position.set(...f.position);o.rotation.set(0,f.yaw,0);o.updateMatrix();shoes.current!.setMatrixAt(i*2+j,o.matrix);const l=p.legs[j];link(legs.current!,i*4+j*2,l.hip,l.knee);link(legs.current!,i*4+j*2+1,l.knee,l.ankle)})
   p.arms.forEach((a,j)=>{link(upper.current!,i*2+j,a.hip,a.knee);link(fore.current!,i*2+j,a.knee,a.ankle);o.position.set(...p.hands[j]);o.rotation.set(0,p.yaw,0);o.updateMatrix();hands.current!.setMatrixAt(i*2+j,o.matrix)})
  });[...refs.current,upper.current,fore.current,hands.current,legs.current,shoes.current].forEach(v=>{if(v){v.instanceMatrix.needsUpdate=true;if(v.instanceColor)v.instanceColor.needsUpdate=true;v.computeBoundingSphere()}})
 })
 return <group name="incident-people">
 {body.map((p,i)=><instancedMesh name={`actor-body-${i}`} key={i} ref={v=>{refs.current[i]=v}} args={[p.geometry,p.material,4]} castShadow receiveShadow dispose={null}/>)}
 <instancedMesh name="actor-upper-arms" ref={upper} args={[undefined,undefined,8]} castShadow><capsuleGeometry args={[.06,.3,3,8]}/><meshStandardMaterial color="white" roughness={.8}/></instancedMesh>
 <instancedMesh name="actor-forearms" ref={fore} args={[undefined,m.sand,8]} castShadow><capsuleGeometry args={[.043,.28,3,8]}/></instancedMesh>
 <instancedMesh name="actor-hands" ref={hands} args={[undefined,m.sand,8]} castShadow><sphereGeometry args={[.067,8,6]}/></instancedMesh>
 <instancedMesh name="actor-fixed-legs" ref={legs} args={[undefined,m.blue,16]} castShadow><capsuleGeometry args={[.064,.43,3,8]}/></instancedMesh>
 <instancedMesh name="actor-shoes" ref={shoes} args={[shoeGeometry,m.dark,8]} castShadow/>
 <group ref={tablet}><mesh position={[0,1.09,.37]} rotation={[.16,0,0]} material={m.dark}><boxGeometry args={[.4,.046,.31]}/></mesh><mesh position={[0,1.117,.37]} rotation={[.16,0,0]} material={m.glass}><boxGeometry args={[.32,.012,.23]}/></mesh></group>
 </group>
}
