'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, Group, LineSegments, MeshBasicMaterial, MeshStandardMaterial, PointLight, Vector3 } from 'three'
import type { PerspectiveCamera } from 'three'
import type { WorldProps } from '../../contract'
import { Parts, Operator, makeThermalLabel } from './actors'
import { contactTexture, makeMaterials, makeSite, makeTrunks, makeOperator } from './model'
import { Planting } from './wildlife'
import { Equipment } from './equipment'
import { lensPosition, sectorContains } from './devices'
import { Human } from './human'
import { incidentSite, gateModel, shutterModel, incidentDevices } from './incident-model'
import { garden, guardPose, intruderPose, residentPose, incidentState, incidentTime as T } from './incident-motion'
import { consolePose, operatorAction } from './motion'

const gardenSurface = () => garden.floor

export function IntrusionWorld({clock,layers,quality}:WorldProps){
 const high=quality==='high',m=useMemo(makeMaterials,[]),site=useMemo(()=>makeSite(m,high,true),[m,high]),trunks=useMemo(()=>makeTrunks(m,high),[m,high]),extras=useMemo(()=>incidentSite(m),[m]),gate=useMemo(()=>gateModel(m),[m]),shutter=useMemo(()=>shutterModel(m),[m]),operator=useMemo(()=>makeOperator(m),[m]),label=useMemo(makeThermalLabel,[]),contact=useMemo(contactTexture,[])
 const warm=useMemo(()=>new MeshBasicMaterial({color:'#ffcf85',transparent:true,toneMapped:false,depthTest:false,depthWrite:false}),[]),lamp=useMemo(()=>new MeshStandardMaterial({color:'#a9a28a',emissive:'#ffd898',emissiveIntensity:0,roughness:.65}),[])
 const gateRef=useRef<Group>(null),shutterRef=useRef<Group>(null),alert=useRef<Group>(null),record=useRef<Group>(null),inspected=useRef<Group>(null),thermal=useRef<Group>(null),pathLight=useRef<PointLight>(null),zone=useRef<Group>(null),cameraOn=useRef<Group>(null),thermalOn=useRef<Group>(null)
 const {camera,size}=useThree()
 useEffect(()=>()=>{site.forEach(p=>p.geometry.dispose());trunks.forEach(p=>p.geometry.dispose())},[site,trunks])
 useEffect(()=>()=>{[...extras,...gate,...shutter,...operator].forEach(p=>p.geometry.dispose());Object.values(m).forEach(v=>{v.map?.dispose();v.dispose()});label.dispose();warm.dispose();lamp.dispose();contact.dispose()},[m,extras,gate,shutter,operator,label,warm,lamp,contact])
 useFrame(()=>{
  const t=clock.current.time,state=incidentState(t),intruder=intruderPose(t),action=operatorAction(t-(T.decide-25))
  // Gate opens inward alongside its jamb. Closure is authorized and begins after resident clearance.
  gateRef.current!.rotation.y=-Math.PI/2*(1-state.closed);shutterRef.current!.position.x=3.47+1.48*(1-state.closed)
  lamp.emissiveIntensity=state.lighting?1.8:0;if(pathLight.current)pathLight.current.intensity=state.lighting?8:0
  alert.current!.visible=state.alert;alert.current!.scale.set(1-action.dismiss*.22,1-action.dismiss*.22,1);record.current!.visible=state.record;inspected.current!.visible=state.inspected
  zone.current!.visible=t>=T.hands;cameraOn.current!.visible=t>=T.detect&&sectorContains(incidentDevices[0],intruder.position);thermalOn.current!.visible=t>=T.verify&&sectorContains(incidentDevices[1],intruder.position)
  thermal.current!.visible=state.thermal&&sectorContains(incidentDevices[1],intruder.position)
  if(thermal.current!.visible){const unit=2*Math.tan((camera as PerspectiveCamera).fov*Math.PI/360)/size.height,width=size.width<640?232:248;thermal.current!.position.copy(camera.position);thermal.current!.quaternion.copy(camera.quaternion);thermal.current!.translateZ(-1);thermal.current!.translateX((-size.width/2+12+width/2)*unit);thermal.current!.translateY((size.height/2-55-width/4)*unit);thermal.current!.scale.setScalar(unit*width/248)}
  gateRef.current!.userData={closed:state.closed,residentClear:t>=T.residentClear};shutterRef.current!.userData={closed:state.closed};zone.current!.userData={active:t>=T.hands}
 })
 return <group name="estate-world">
  <group name="estate-static"><Parts parts={site}/><Parts parts={trunks}/><Parts parts={extras}/></group><Planting high={high} incident/>
  <Equipment materials={m} clock={clock} sensors={layers.sensors} layout={incidentDevices} start={[T.detect,T.verify]} end={74} heightAt={gardenSurface}/>
  <Human clock={clock} poseAt={intruderPose} role="intruder" materials={m} contact={contact}/><Human clock={clock} poseAt={guardPose} role="guard" materials={m} contact={contact}/><Human clock={clock} poseAt={residentPose} role="resident" materials={m} contact={contact}/>
  <Operator clock={clock} parts={operator} materials={m} timeOffset={T.decide-25}/>
  <group name="estate-inner-gate" ref={gateRef} position={[3.20,.222,garden.innerGateZ]}><Parts parts={gate}/></group>
  <group name="estate-shutter" ref={shutterRef} position={[4.95,1.3,-.10]}><Parts parts={shutter}/></group>
  <group name="estate-zone-indicator" ref={zone} position={[-3.45,1,8.637]} visible={false}><mesh><boxGeometry args={[.09,.04,.008]}/><meshBasicMaterial color="#d29c55"/></mesh></group>
  {[[-4.4,.625,4.9],[-1.6,.625,4.9],[1.2,.625,4.9],[5.6,.625,4.9]].map((p,i)=><mesh key={i} name={`estate-path-light-${i}`} position={p as [number,number,number]} material={lamp}><boxGeometry args={[.14,.065,.14]}/></mesh>)}
  <group ref={cameraOn} name="estate-camera-active" position={lensPosition(incidentDevices[0])}><mesh><sphereGeometry args={[.028,10,6]}/><meshBasicMaterial color="#a6d7c5"/></mesh></group>
  <group ref={thermalOn} name="estate-thermal-active" position={lensPosition(incidentDevices[1])}><mesh><sphereGeometry args={[.025,10,6]}/><meshBasicMaterial color="#dfb46d"/></mesh></group>
  <group name="estate-console-tiles" position={consolePose.origin} rotation={[0,consolePose.yaw,0]}>
   <group ref={alert} name="estate-notification" position={[0,.25,-.078]} rotation={[-.08,0,0]} visible={false}>
    <mesh><planeGeometry args={[.76,.4]}/><meshBasicMaterial color="#cb9a5e"/></mesh>
    {[0,1,2].map(i=><mesh key={i} position={[-.24+i*.24,.045,.004]}><planeGeometry args={[.19,.20]}/><meshBasicMaterial color={i===2?'#d4c79e':'#486b65'}/></mesh>)}
   </group>
   <group ref={record} name="estate-recorded" position={[0,.25,-.078]} rotation={[-.08,0,0]} visible={false}>
    {[0,1].map(i=><mesh key={i} position={[-.23+i*.23,.04,0]}><planeGeometry args={[.16,.20]}/><meshBasicMaterial color="#96b9ac"/></mesh>)}
    <group ref={inspected} name="estate-inspection-record" position={[.23,.04,0]}><mesh><planeGeometry args={[.16,.20]}/><meshBasicMaterial color="#96b9ac"/></mesh></group>
    <mesh position={[0,-.11,0]}><planeGeometry args={[.65,.025]}/><meshBasicMaterial color="#a5c0ae"/></mesh>
   </group>
  </group>
  <IncidentTrail clock={clock} enabled={layers.tracks}/>
  <group ref={thermal} name="estate-thermal-view" visible={false}>
   <mesh renderOrder={20}><planeGeometry args={[248,124]}/><meshBasicMaterial map={label} transparent toneMapped={false} depthTest={false} depthWrite={false}/></mesh>
   <group position={[12,-34,1]} scale={37}><Human clock={clock} poseAt={intruderPose} role="intruder" materials={m} warm={warm}/></group>
  </group>
  <pointLight position={[-2.7,3.25,-1.4]} color="#ffd19b" intensity={high?10:8} distance={5} decay={2}/>
  {high&&<><pointLight position={[4.95,3,-1.7]} color="#ffd5a4" intensity={5} distance={4} decay={2}/><pointLight ref={pathLight} position={[-.2,1.7,5.75]} color="#ffe0aa" intensity={0} distance={7} decay={2}/></>}
 </group>
}

function IncidentTrail({clock,enabled}:{clock:WorldProps['clock'];enabled:boolean}){
 const ref=useRef<LineSegments>(null),geometry=useMemo(()=>{const vertices:number[]=[];for(let i=0;i<340;i++){const a=intruderPose(6+i*.2).position,b=intruderPose(6+(i+1)*.2).position;const visible=sectorContains(incidentDevices[0],a)&&sectorContains(incidentDevices[0],b);for(const p of(visible?[a,b]:[a,a]))vertices.push(p[0],Math.abs(p[2]-garden.wallZ)<.20?garden.wallTop+.009:garden.floor+.009,p[2])}const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));return g},[])
 useEffect(()=>()=>geometry.dispose(),[geometry]);useFrame(()=>{geometry.setDrawRange(0,Math.max(0,Math.min(680,Math.floor((clock.current.time-6)/.2)*2)));ref.current!.visible=enabled&&clock.current.time>=6})
 return <lineSegments ref={ref} name="estate-observed-trail" geometry={geometry}><lineBasicMaterial color="#cfba85" transparent opacity={.36} depthWrite={false}/></lineSegments>
}
