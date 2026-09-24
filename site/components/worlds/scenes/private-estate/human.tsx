'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, CylinderGeometry, Group, InstancedMesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, SphereGeometry, Vector3 } from 'three'
import type { DataTexture, Material } from 'three'
import type { Vec3, WorldProps } from '../../contract'
import { builder, type Materials } from './model'
import { Parts } from './actors'
import { humanRig, type HumanPose } from './incident-motion'
import { rotatePoint } from './motion'
export type PersonRole = 'intruder' | 'guard' | 'resident'
const clothing = { intruder: '#754938', guard: '#446b65', resident: '#c4baa0' }
export function Human({ clock, poseAt, materials, role, warm, contact }: { clock: WorldProps['clock']; poseAt: (t:number)=>HumanPose; materials:Materials; role:PersonRole; warm?:Material; contact?:DataTexture }) {
  const body=useRef<Group>(null),lean=useRef<Group>(null),links=useRef<InstancedMesh>(null),hands=useRef<InstancedMesh>(null),feet=useRef<InstancedMesh>(null),shadows=useRef<InstancedMesh>(null)
  const model=useMemo(()=>{
    const cloth=new MeshStandardMaterial({color:clothing[role],roughness:.95}),limb=new MeshStandardMaterial({color:'#ffffff',roughness:.9}),skin=new MeshStandardMaterial({color:role==='resident'?'#a18a6e':'#9b8065',roughness:1})
    const m={...materials,linen:cloth,wood2:skin},b=builder(m),p=builder(m)
    b.oval([0,.23,0],[.215,.285,.14],'linen',[0,0,0],16)
    b.oval([0,.035,-.015],[.18,.13,.145],'dark')
    b.beam([0,.46,0],[0,.54,0],.055,'wood2',.053,12)
    b.oval([0,.68,.015],[.12,.155,.115],'wood2',[0,0,0],16)
    b.oval([0,.755,-.018],[.126,.083,.119],'fur')
    if(role==='guard'){b.box([0,.36,.137],[.32,.042,.015],'coping');b.box([0,.36,-.137],[.32,.042,.015],'coping');b.box([.13,.22,.14],[.06,.11,.025],'metal')}
    if(role==='intruder')b.box([0,.16,-.143],[.20,.29,.075],'fur',.032)
    p.box([0,.025,.035],[.17,.05,.29],'dark',.025);p.oval([0,.067,.034],[.08,.05,.135],'dark')
    return {body:b.finish(),boot:p.finish()[0].geometry,limb,cloth,skin,link:new CylinderGeometry(.065,.052,1,10),hand:new SphereGeometry(1,12,8),shadow:new PlaneGeometry(1,1),shadowMaterial:new MeshBasicMaterial({...(contact?{map:contact}:{}),color:'#19382c',transparent:true,opacity:.32,depthWrite:false})}
  },[materials,role,contact])
  const scratch=useMemo(()=>({o:new Object3D(),axis:new Vector3(0,1,0),direction:new Vector3(),color:new Color()}),[])
  useEffect(()=>{const instances=[links.current,hands.current,feet.current,shadows.current];return()=>{instances.forEach(i=>i?.dispose());model.body.forEach(p=>p.geometry.dispose());model.boot.dispose();model.link.dispose();model.hand.dispose();model.shadow.dispose();model.shadowMaterial.dispose();model.limb.dispose();model.cloth.dispose();model.skin.dispose()}},[model])
  useFrame(()=>{
    const p=poseAt(clock.current.time),local=(v:Vec3)=>warm?rotatePoint(v.map((x,i)=>x-p.position[i]) as Vec3,-p.yaw):v,{o,axis,direction,color}=scratch
    body.current!.position.set(...(warm?[0,0,0] as Vec3:p.position));body.current!.rotation.y=warm?0:p.yaw;lean.current!.rotation.x=-p.lean
    const bones=[...p.legs,...p.arms].flatMap(l=>[[l.hip,l.knee],[l.knee,l.ankle]])
    bones.forEach(([aa,bb],i)=>{const a=local(aa),b=local(bb),length=i<4?humanRig.upper:i%2?humanRig.armLower:humanRig.armUpper;direction.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);o.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);o.quaternion.setFromUnitVectors(axis,direction.normalize());const radius=i<4?1.12*(i%2?.8:1):i%2?.38:.80;o.scale.set(radius,length,radius);o.updateMatrix();links.current!.setMatrixAt(i,o.matrix);if(!warm){color.set(i<4?'#33403b':clothing[role]);links.current!.setColorAt(i,color)}})
    p.hands.forEach((h,i)=>{o.position.set(...local(h));o.rotation.set(i===0?p.warning*Math.PI/2:0,warm?0:p.yaw,0);o.scale.set(.048,.027,.073);o.updateMatrix();hands.current!.setMatrixAt(i,o.matrix)})
    p.feet.forEach((f,i)=>{o.position.set(...local(f.position));o.rotation.set(0,f.yaw-(warm?p.yaw:0),0);o.scale.setScalar(1);o.updateMatrix();feet.current!.setMatrixAt(i,o.matrix)})
    if(shadows.current){p.feet.forEach((f,i)=>{o.position.set(f.position[0],f.position[1]+.0002,f.position[2]+.025);o.rotation.set(-Math.PI/2,0,0);o.scale.set(f.planted?.24:0,f.planted?.38:0,1);o.updateMatrix();shadows.current!.setMatrixAt(i,o.matrix)});shadows.current.instanceMatrix.needsUpdate=true;shadows.current.computeBoundingSphere()}
    for(const ref of[links,hands,feet]){ref.current!.instanceMatrix.needsUpdate=true;ref.current!.computeBoundingSphere()}if(links.current!.instanceColor)links.current!.instanceColor.needsUpdate=true
    body.current!.parent!.userData={role,pose:p};links.current!.userData={boneLengths:bones.map((_,i)=>i<4?humanRig.upper:i%2?humanRig.armLower:humanRig.armUpper)}
  })
  const prefix=warm?'estate-thermal-person':`estate-${role}`
  return <group name={prefix}>
    <group ref={body} name={`${prefix}-body`}><group ref={lean} position={[0,humanRig.hipY,0]}><Parts parts={model.body} override={warm}/></group></group>
    <instancedMesh ref={links} name={`${prefix}-links`} args={[model.link,warm||model.limb,8]} castShadow={!warm} renderOrder={warm?21:0} dispose={null}/>
    <instancedMesh ref={hands} name={`${prefix}-hands`} args={[model.hand,warm||model.skin,2]} castShadow={!warm} renderOrder={warm?21:0} dispose={null}/>
    <instancedMesh ref={feet} name={`${prefix}-feet`} args={[model.boot,warm||materials.dark,2]} castShadow={!warm} receiveShadow={!warm} renderOrder={warm?21:0} dispose={null}/>
    {contact&&!warm&&<instancedMesh ref={shadows} name={`${prefix}-contacts`} args={[model.shadow,model.shadowMaterial,2]} dispose={null}/>}
  </group>
}
