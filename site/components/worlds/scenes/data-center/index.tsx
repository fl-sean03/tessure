'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, Group, InstancedMesh, Object3D } from 'three'
import type { DataTexture } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { mix, seeded } from '../../math'
import { definition } from './content'
import { arrivalZ, deliveryX, deliveryHeading, gateAngle, guardProgress } from './motion'
import { contactTexture, createMaterials, makeBarrier, makeCampus, makeChiller, makeGuard, makeVehicle, type Part } from './model'

function Parts({ parts }: { parts: Part[] }) {
  return <>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow />)}</>
}
const roofUnits = [-23,-14,-5,4].flatMap(z=>[-16,-6].map(x=>[x,9.43,z] as Vec3))
function Repeated({ part, positions }: { part: Part; positions: Vec3[] }) {
  const ref=useRef<InstancedMesh>(null)
  useLayoutEffect(()=>{
    const o=new Object3D()
    positions.forEach((p,i)=>{o.position.set(...p);o.updateMatrix();ref.current!.setMatrixAt(i,o.matrix)})
    ref.current!.instanceMatrix.needsUpdate=true;ref.current!.computeBoundingSphere()
  },[positions])
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
function World({ clock,layers,quality }: WorldProps) {
  const high=quality==='high',truck=useRef<Group>(null),van=useRef<Group>(null),gate=useRef<Group>(null),guard=useRef<Group>(null),left=useRef<Group>(null),right=useRef<Group>(null)
  const materials=useMemo(createMaterials,[]),contact=useMemo(contactTexture,[])
  const all=useMemo(()=>({site:makeCampus(materials,high),cooling:makeChiller(materials,high),truck:makeVehicle(materials,high,false),van:makeVehicle(materials,high,true),gate:makeBarrier(materials,high),guard:makeGuard(materials,high,'body'),leg:makeGuard(materials,high,'leg')}),[materials,high])
  useEffect(()=>()=>{Object.values(all).flat().forEach(p=>p.geometry.dispose())},[all])
  useEffect(()=>()=>{contact.dispose();Object.values(materials).forEach(m=>{m.map?.dispose();m.dispose()})},[materials,contact])
  useFrame(()=>{
    const t=clock.current.time
    if(truck.current){truck.current.position.set(deliveryX(t),.145,arrivalZ(t));truck.current.rotation.y=deliveryHeading(t)}
    van.current?.position.set(4.8,.145,arrivalZ(t,true))
    if(gate.current)gate.current.rotation.z=gateAngle(t)
    const p=guardProgress(t),walk=t>30&&t<38?Math.sin((t-30)*7.3)*.31:0
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
    <group ref={truck} position={[4.8,.145,24]}><group dispose={null}><Parts parts={all.truck}/></group><Contact texture={contact} position={[0,.009,0]} size={[3.4,7.4]} opacity={.57}/></group>
    <group ref={van} position={[4.8,.145,32.5]}><group dispose={null}><Parts parts={all.van}/></group><Contact texture={contact} position={[0,.011,0]} size={[2.9,5.5]} opacity={.55}/></group>
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
