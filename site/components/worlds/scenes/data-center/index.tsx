'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, Group, InstancedMesh, Object3D } from 'three'
import type { DataTexture } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { mix, seeded } from '../../math'
import { roadY, vehiclePose, vehicleSpec, wheelLayout } from './vehicles'
import { definition } from './content'
import { arrivalZ, deliveryX, deliveryHeading, gateAngle, guardGait, guardProgress } from './motion'
import { contactTexture, createMaterials, makeBarrier, makeCampus, makeChiller, makeGuard, makeVehicle, makeWheel, type Part } from './model'

function Parts({ parts }: { parts: Part[] }) {
  return <>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow />)}</>
}
// Body bottom .075 above its origin seats on the mounting plate's 9.39 top.
const roofUnits = [-23,-14,-5,4].flatMap(z=>[-16,-6].map(x=>[x,9.315,z] as Vec3))
function Repeated({ part, positions }: { part: Part; positions: Vec3[] }) {
  const ref=useRef<InstancedMesh>(null)
  useLayoutEffect(()=>{
    const mesh=ref.current!,o=new Object3D()
    positions.forEach((p,i)=>{o.position.set(...p);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)})
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere()
    // Parent disables automatic disposal; release instance buffers, not shared geometry/material.
    return ()=>{mesh.dispose()}
  },[part,positions])
  return <instancedMesh ref={ref} args={[part.geometry,part.material,positions.length]} castShadow receiveShadow />
}
function Contact({ texture, position, size, opacity=.3 }: { texture:DataTexture; position:Vec3; size:[number,number]; opacity?:number }) {
  return <mesh position={position} rotation={[-Math.PI/2,0,0]}><planeGeometry args={size}/><meshBasicMaterial color="#192e3d" map={texture} transparent opacity={opacity} depthWrite={false}/></mesh>
}
function Grasses({ high }: { high:boolean }) {
  const ref=useRef<InstancedMesh>(null),n=high?180:80
  useLayoutEffect(()=>{
    const o=new Object3D()
    for(let i=0;i<n;i++){o.position.set(-26.7+seeded(i*4+1)*3.3,.28,-30+seeded(i*4+2)*48);o.rotation.set(0,seeded(i*4+3)*6.28,seeded(i)*.7-.35);o.scale.set(.05,.3+seeded(i*4+4)*.35,.05);o.updateMatrix();ref.current!.setMatrixAt(i,o.matrix)}
    ref.current!.instanceMatrix.needsUpdate=true;ref.current!.computeBoundingSphere()
  },[n])
  return <instancedMesh ref={ref} args={[undefined,undefined,n]}><coneGeometry args={[1,1,3]}/><meshStandardMaterial color="#859181" roughness={1}/></instancedMesh>
}
function Track({ clock, second }: { clock:WorldProps['clock']; second:boolean }) {
  const ref=useRef<Group>(null)
  useFrame(()=>{
    const t=clock.current.time
    if(ref.current){ref.current.visible=t>=(second?11:4);ref.current.position.set(second?4.8:deliveryX(t),.18,arrivalZ(t,second));ref.current.rotation.y=second?0:deliveryHeading(t)}
  })
  return <group ref={ref} visible={false}>
    {[-1,1].flatMap(s=>[-1,1].map(e=><group key={`${s}-${e}`} position={[s*(second?1.55:1.75),0,e*(second?3:3.8)]}>
      <mesh position={[-s*.32,0,0]}><boxGeometry args={[.66,.018,.055]}/><meshBasicMaterial color={second?'#d5af73':'#8dbec4'}/></mesh>
      <mesh position={[0,0,-e*.36]}><boxGeometry args={[.055,.018,.75]}/><meshBasicMaterial color={second?'#d5af73':'#8dbec4'}/></mesh>
    </group>))}
  </group>
}
function Observation({ clock, radar=false }: { clock:WorldProps['clock']; radar?:boolean }) {
  const ref=useRef<Group>(null),geometry=useMemo(()=>{
    const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(new Float32Array(6),3));return g
  },[])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  useFrame(()=>{
    const t=clock.current.time
    if(ref.current)ref.current.visible=t>=(radar?11:4)&&t<42
    const p=geometry.attributes.position
    p.setXYZ(0,...(radar?[.1,3.2,22]:[8.75,5.15,7.58]) as Vec3)
    p.setXYZ(1,4.8,radar?.45:2.6,arrivalZ(t,true));p.needsUpdate=true;geometry.computeBoundingSphere()
  })
  return <group ref={ref} visible={false}><lineSegments geometry={geometry}><lineBasicMaterial color={radar?'#cfb17c':'#abd0d8'} transparent opacity={.65} depthWrite={false}/></lineSegments></group>
}
function Vehicle({clock,small=false,body,wheelParts,contact}:{clock:WorldProps['clock'];small?:boolean;body:Part[];wheelParts:Part[][];contact:DataTexture}) {
  const root=useRef<Group>(null),steer=useRef<(Group|null)[]>([]),spin=useRef<(Group|null)[]>([])
  const initial=vehiclePose(0,small),v=vehicleSpec(small)
  useFrame(()=>{
    const p=vehiclePose(clock.current.time,small)
    root.current!.position.set(p.x,roadY,p.z);root.current!.rotation.y=p.heading
    p.wheels.forEach((w,i)=>{if(steer.current[i])steer.current[i]!.rotation.y=w.steer;if(spin.current[i])spin.current[i]!.rotation.x=w.roll})
  })
  return <group ref={root} name={small?'vehicle-van':'vehicle-truck'} position={[initial.x,roadY,initial.z]}>
    <group dispose={null}><Parts parts={body}/>
      {wheelLayout(small).map((w,i)=><group key={i} name={`steer-${i}`} ref={o=>{steer.current[i]=o}} position={[w.x,v.radius,w.z]}>
        <group name={`spin-${i}`} ref={o=>{spin.current[i]=o}}><Parts parts={wheelParts[i%2]}/></group>
      </group>)}
    </group>
    {wheelLayout(small).map((w,i)=><Contact key={i} texture={contact} position={[w.x,.0018,w.z]} size={[.48,.66]} opacity={.42}/>)}
    <Contact texture={contact} position={[0,.0015,0]} size={small?[2.9,5.5]:[3.4,7.4]} opacity={.55}/>
  </group>
}
function World({ clock,layers,quality }: WorldProps) {
  const high=quality==='high',gate=useRef<Group>(null),guard=useRef<Group>(null),left=useRef<Group>(null),right=useRef<Group>(null)
  const materials=useMemo(createMaterials,[]),contact=useMemo(contactTexture,[])
  const all=useMemo(()=>({site:makeCampus(materials,high),cooling:makeChiller(materials,high),truck:makeVehicle(materials,high,false),van:makeVehicle(materials,high,true),truckLeft:makeWheel(materials,high,false,-1),truckRight:makeWheel(materials,high,false,1),vanLeft:makeWheel(materials,high,true,-1),vanRight:makeWheel(materials,high,true,1),gate:makeBarrier(materials,high),guard:makeGuard(materials,high,'body'),leg:makeGuard(materials,high,'leg')}),[materials,high])
  useEffect(()=>()=>{Object.values(all).flat().forEach(p=>p.geometry.dispose())},[all])
  useEffect(()=>()=>{contact.dispose();Object.values(materials).forEach(m=>{m.map?.dispose();m.dispose()})},[materials,contact])
  useFrame(()=>{
    const t=clock.current.time
    if(gate.current)gate.current.rotation.z=gateAngle(t)
    const p=guardProgress(t),walk=guardGait(t)
    if(guard.current){guard.current.position.set(mix(12.3,7.15,p),.145,mix(8.8,9.3,p));guard.current.rotation.y=-Math.PI/2}
    if(left.current)left.current.rotation.x=walk
    if(right.current)right.current.rotation.x=-walk
  })
  return <group>
    <group dispose={null}><Parts parts={all.site}/>{all.cooling.map((part,i)=><Repeated key={i} part={part} positions={roofUnits}/>)}</group>
    <Grasses high={high}/>
    <Contact texture={contact} position={[-10.8,.149,-9.5]} size={[23.6,46.8]} opacity={.3}/>
    <Contact texture={contact} position={[13,.404,4.3]} size={[6.8,7]} opacity={.3}/>
    {roofUnits.map((p,i)=><Contact key={i} texture={contact} position={[p[0],8.9,p[2]]} size={[6.2,6.8]} opacity={.35}/>)}
    <Vehicle clock={clock} body={all.truck} wheelParts={[all.truckLeft,all.truckRight]} contact={contact}/>
    <Vehicle clock={clock} small body={all.van} wheelParts={[all.vanLeft,all.vanRight]} contact={contact}/>
    <group ref={gate} position={[1.3,1.48,5]} rotation={[0,0,1.47]} dispose={null}><Parts parts={all.gate}/></group>
    <group ref={guard} position={[12.3,.145,8.8]}>
      <group dispose={null}><Parts parts={all.guard}/><group ref={left} position={[-.12,.88,0]}><Parts parts={all.leg}/></group><group ref={right} position={[.12,.88,0]}><Parts parts={all.leg}/></group></group>
      <Contact texture={contact} position={[0,.017,0]} size={[.85,.85]} opacity={.45}/>
    </group>
    {layers.tracks&&<><Track clock={clock} second={false}/><Track clock={clock} second/></>}
    {layers.sensors&&<><Observation clock={clock}/><Observation clock={clock} radar/></>}
    <pointLight position={[12.8,2.8,7.2]} intensity={7} distance={5.5} decay={2} color="#ffe0ac"/>
  </group>
}
const scene:SceneModule={definition,World}
export default scene
