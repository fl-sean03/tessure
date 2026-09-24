'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderGeometry, Group, InstancedMesh, Matrix4, Object3D, SphereGeometry, Vector3, PlaneGeometry, MeshBasicMaterial } from 'three'
import type { DataTexture } from 'three'
import type { WorldProps, Vec3 } from '../../contract'
import { makeBody, makeShoe, type Materials, type Part } from './geometry'
import { personPose, rig, type Role } from './motion'
const Parts = ({ parts }: { parts: Part[] }) => <>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow dispose={null}/>)}</>
export function Person({role,clock,m,high,contact}:{role:Role;clock:WorldProps['clock'];m:Materials;high:boolean;contact:DataTexture}) {
  const body=useRef<Group>(null),feet=useRef<(Group|null)[]>([]),hands=useRef<(Group|null)[]>([]),legBones=useRef<InstancedMesh>(null),armBones=useRef<InstancedMesh>(null),knees=useRef<InstancedMesh>(null)
  const palms=useRef<InstancedMesh>(null),contacts=useRef<InstancedMesh>(null),shadowMaterial=useMemo(()=>new MeshBasicMaterial({color:'#172b3b',map:contact,transparent:true,opacity:.3,depthWrite:false}),[contact])
  const parts=useMemo(()=>({body:makeBody(m,high,role==='operator'?'technician':role==='accomplice'?'visitor':role),shoe:makeShoe(m,high)}),[m,high,role])
  const geometries=useMemo(()=>({leg:new CylinderGeometry(.063,.058,1,high?12:8),arm:new CylinderGeometry(.058,.046,1,high?12:8),joint:new SphereGeometry(.064,high?10:6,high?8:6),palm:new SphereGeometry(1,high?12:8,8),shadow:new PlaneGeometry(.25,.37).rotateX(-Math.PI/2)}),[high])
  const tmp=useMemo(()=>({o:new Object3D(),axis:new Vector3(0,1,0),a:new Vector3(),b:new Vector3(),matrix:new Matrix4(),right:new Vector3(),up:new Vector3(),forward:new Vector3()}),[])
  useEffect(()=>()=>{[...parts.body,...parts.shoe].forEach(p=>p.geometry.dispose())},[parts])
  useEffect(()=>()=>Object.values(geometries).forEach(g=>g.dispose()),[geometries])
  useEffect(()=>{const instances=[legBones.current,armBones.current,knees.current,palms.current,contacts.current];return()=>instances.forEach(o=>o?.dispose())},[geometries])
  useEffect(()=>()=>shadowMaterial.dispose(),[shadowMaterial])
  useFrame(()=>{
    const pose=personPose(role,clock.current.time);body.current!.position.set(...pose.position);body.current!.rotation.y=pose.yaw
    body.current!.userData={role,absoluteTime:clock.current.time}
    const bone=(inst:InstancedMesh,index:number,a:Vec3,b:Vec3,length:number)=>{tmp.a.set(...a);tmp.b.set(...b);tmp.o.position.copy(tmp.a).add(tmp.b).multiplyScalar(.5);tmp.o.quaternion.setFromUnitVectors(tmp.axis,tmp.b.sub(tmp.a).normalize());tmp.o.scale.set(1,length,1);tmp.o.updateMatrix();inst.setMatrixAt(index,tmp.o.matrix)}
    pose.feet.forEach((f,i)=>{
      const foot=feet.current[i]!;foot.position.set(...f.position);tmp.matrix.makeBasis(tmp.right.set(...f.right),tmp.up.set(...f.up),tmp.forward.set(...f.forward));foot.quaternion.setFromRotationMatrix(tmp.matrix);foot.userData={planted:f.planted,contact:f.contact,yaw:f.yaw}
      tmp.o.position.set(f.position[0]+f.forward[0]*.055,f.position[1]+.002,f.position[2]+f.forward[2]*.055);tmp.o.quaternion.copy(foot.quaternion);tmp.o.scale.setScalar(f.planted?1:0);tmp.o.updateMatrix();contacts.current!.setMatrixAt(i,tmp.o.matrix)
      const l=pose.legs[i],a=pose.arms[i];bone(legBones.current!,i*2,l.hip,l.knee,rig.upper);bone(legBones.current!,i*2+1,l.knee,l.ankle,rig.lower);bone(armBones.current!,i*2,a.hip,a.knee,rig.armUpper);bone(armBones.current!,i*2+1,a.knee,a.ankle,rig.armLower)
      tmp.o.position.set(...l.knee);tmp.o.quaternion.identity();tmp.o.scale.setScalar(1);tmp.o.updateMatrix();knees.current!.setMatrixAt(i,tmp.o.matrix)
      hands.current[i]!.position.set(...pose.hands[i]);hands.current[i]!.rotation.y=pose.yaw
      tmp.o.position.set(...pose.hands[i]);tmp.o.rotation.set(0,pose.yaw,0);tmp.o.scale.set(.045,.03,.065);tmp.o.updateMatrix();palms.current!.setMatrixAt(i,tmp.o.matrix)
    })
    for(const ref of [legBones,armBones,knees,palms,contacts]){ref.current!.instanceMatrix.needsUpdate=true;ref.current!.computeBoundingSphere()}
  })
  const coat=(role==='visitor'||role==='accomplice')?m.ochre:role==='guard'?m.navy:m.paint
  return <group name={`person-${role}`}>
    <group ref={body} name={`${role}-body`}><Parts parts={parts.body}/></group>
    <instancedMesh name={`${role}-leg-bones`} ref={legBones} args={[geometries.leg,m.dark,4]} castShadow receiveShadow dispose={null}/>
    <instancedMesh name={`${role}-arm-bones`} ref={armBones} args={[geometries.arm,coat,4]} castShadow receiveShadow dispose={null}/>
    <instancedMesh name={`${role}-knees`} ref={knees} args={[geometries.joint,m.dark,2]} castShadow dispose={null}/>
    <instancedMesh name={`${role}-palms`} ref={palms} args={[geometries.palm,m.skin,2]} castShadow dispose={null}/>
    <instancedMesh name={`${role}-sole-contacts`} ref={contacts} args={[geometries.shadow,shadowMaterial,2]} dispose={null}/>
    {[0,1].map(i=><group key={i}>
      <group name={`${role}-foot-${i}`} ref={o=>{feet.current[i]=o}}><Parts parts={parts.shoe}/></group>
      <group name={`${role}-hand-${i}`} ref={o=>{hands.current[i]=o}}>
        {role==='guard'&&i===1&&<mesh name="held-radio" position={[0,.02,.035]} material={m.dark} castShadow><boxGeometry args={[.075,.14,.055]}/></mesh>}
        {(role==='operator'||role==='guard')&&i===0&&<group name="held-tablet" position={[.205,.02,0]} rotation={[-.55,0,0]}><mesh material={m.dark} castShadow><boxGeometry args={[.34,.24,.028]}/></mesh><mesh position={[0,0,.015]} material={m.screen}><planeGeometry args={[.28,.18]}/></mesh><mesh position={[-.167,-.025,.016]} material={m.skin}><boxGeometry args={[.027,.07,.027]}/></mesh></group>}
      </group>
    </group>)}
  </group>
}
