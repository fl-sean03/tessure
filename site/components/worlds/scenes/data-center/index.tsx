'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, Mesh, Object3D, Vector3 } from 'three'
import type { DataTexture } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { seeded } from '../../math'
import { roadY, vehiclePose, vehicleSpec, wheelLayout } from './vehicles'
import { definition } from './content'
import { guardPose, guardRig } from './guard'
import { devices, observations, sectorGround, type DeviceKind } from './devices'
import { arrivalZ, deliveryX, deliveryHeading, gateAngle } from './motion'
import { contactTexture, createMaterials, makeBarrier, makeCampus, makeChiller, makeGuard, makeVehicle, makeWheel, makeTrackGeometry, type Materials, type Part } from './model'

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
  const ref=useRef<Group>(null),geometry=useMemo(()=>makeTrackGeometry(second),[second])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  useFrame(()=>{
    const t=clock.current.time
    if(ref.current){ref.current.visible=t>=(second?11:4);ref.current.position.set(second?4.8:deliveryX(t),.18,arrivalZ(t,second));ref.current.rotation.y=second?0:deliveryHeading(t)}
  })
  return <group ref={ref} visible={false}><mesh geometry={geometry}><meshBasicMaterial color={second?'#d5af73':'#8dbec4'}/></mesh></group>
}
function Observation({ clock, kind }: { clock:WorldProps['clock']; kind:DeviceKind }) {
  const ref=useRef<Group>(null),built=useMemo(()=>{
    const polygon=sectorGround(kind),lines=new BufferGeometry(),fill=new BufferGeometry(),triangles:number[]=[]
    const points=polygon.flatMap((p,i)=>[...p,...polygon[(i+1)%polygon.length]])
    points.push(...new Array(12).fill(0));lines.setAttribute('position',new Float32BufferAttribute(points,3))
    for(let i=1;i<polygon.length-1;i++)triangles.push(...polygon[0],...polygon[i],...polygon[i+1])
    fill.setAttribute('position',new Float32BufferAttribute(triangles,3));return{lines,fill,count:polygon.length*2}
  },[kind])
  useEffect(()=>()=>{built.lines.dispose();built.fill.dispose()},[built])
  useFrame(()=>{
    const t=clock.current.time,links=observations(kind,t)
    if(ref.current)ref.current.visible=t>=(kind==='camera'?4:8)&&t<42
    const p=built.lines.attributes.position
    for(let i=0;i<2;i++){p.setXYZ(built.count+i*2,...devices[kind].origin);p.setXYZ(built.count+i*2+1,...(links[i]?.point??devices[kind].origin))}
    p.needsUpdate=true;built.lines.computeBoundingSphere()
  })
  const color=kind==='radar'?'#c9a879':'#a7ccd6'
  return <group ref={ref} name={`sector-${kind}`} visible={false}>
    <lineSegments geometry={built.lines}><lineBasicMaterial color={color} transparent opacity={.6} depthWrite={false}/></lineSegments>
    <mesh geometry={built.fill}><meshBasicMaterial color={color} transparent opacity={.045} side={DoubleSide} depthWrite={false}/></mesh>
  </group>
}
function Guard({clock,body,shoe,arm,materials,contact}:{clock:WorldProps['clock'];body:Part[];shoe:Part[];arm:Part[];materials:Materials;contact:DataTexture}) {
  const root=useRef<Group>(null),freeArm=useRef<Group>(null),feet=useRef<(Group|null)[]>([]),legs=useRef<(Mesh|null)[]>([]),shadows=useRef<(Group|null)[]>([])
  const rig=useMemo(()=>({axis:new Vector3(0,1,0),a:new Vector3(),b:new Vector3(),direction:new Vector3()}),[])
  useFrame(()=>{
    const pose=guardPose(clock.current.time)
    root.current!.position.set(...pose.position);root.current!.rotation.y=pose.yaw;freeArm.current!.rotation.x=pose.armSwing
    pose.feet.forEach((foot,side)=>{
      feet.current[side]!.position.set(...foot.position);feet.current[side]!.rotation.y=foot.yaw
      shadows.current[side]!.visible=foot.planted
      const joints=pose.legs[side]
      for(let part=0;part<2;part++){
        rig.a.set(...(part===0?joints.hip:joints.knee));rig.b.set(...(part===0?joints.knee:joints.ankle))
        const mesh=legs.current[side*2+part]!;mesh.position.copy(rig.a).add(rig.b).multiplyScalar(.5)
        mesh.quaternion.setFromUnitVectors(rig.axis,rig.direction.copy(rig.b).sub(rig.a).normalize())
      }
    })
  })
  return <group name="guard-rig">
    <group name="guard-body" ref={root}><group dispose={null}><Parts parts={body}/><group ref={freeArm} position={[-.26,1.38,0]}><Parts parts={arm}/></group></group></group>
    {[0,1].map(side=><group key={side}>
      <group name={`guard-foot-${side}`} ref={o=>{feet.current[side]=o}}><group dispose={null}><Parts parts={shoe}/></group><group ref={o=>{shadows.current[side]=o}}><Contact texture={contact} position={[0,.002,.035]} size={[.35,.5]} opacity={.4}/></group></group>
      {[0,1].map(part=><mesh key={part} name={`guard-${side}-${part?'shin':'thigh'}`} ref={o=>{legs.current[side*2+part]=o}} material={materials.dark} castShadow receiveShadow><cylinderGeometry args={[.062,.062,part?guardRig.lower:guardRig.upper,10]}/></mesh>)}
    </group>)}
  </group>
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
  const high=quality==='high',gate=useRef<Group>(null)
  const materials=useMemo(createMaterials,[]),contact=useMemo(contactTexture,[])
  const all=useMemo(()=>({site:makeCampus(materials,high),cooling:makeChiller(materials,high),truck:makeVehicle(materials,high,false),van:makeVehicle(materials,high,true),truckLeft:makeWheel(materials,high,false,-1),truckRight:makeWheel(materials,high,false,1),vanLeft:makeWheel(materials,high,true,-1),vanRight:makeWheel(materials,high,true,1),gate:makeBarrier(materials,high),guard:makeGuard(materials,high,'body'),shoe:makeGuard(materials,high,'shoe'),arm:makeGuard(materials,high,'arm')}),[materials,high])
  useEffect(()=>()=>{Object.values(all).flat().forEach(p=>p.geometry.dispose())},[all])
  useEffect(()=>()=>{contact.dispose();Object.values(materials).forEach(m=>{m.map?.dispose();m.dispose()})},[materials,contact])
  useFrame(()=>{
    const t=clock.current.time
    if(gate.current)gate.current.rotation.z=gateAngle(t)

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
    <Guard clock={clock} body={all.guard} shoe={all.shoe} arm={all.arm} materials={materials} contact={contact}/>
    {layers.tracks&&<><Track clock={clock} second={false}/><Track clock={clock} second/></>}
    {layers.sensors&&<><Observation clock={clock} kind="camera"/><Observation clock={clock} kind="radar"/></>}
    <pointLight position={[12.8,2.8,7.2]} intensity={7} distance={5.5} decay={2} color="#ffe0ac"/>
  </group>
}
const scene:SceneModule={definition,World}
export default scene
