'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import type { WorldProps } from '../../contract'
import type { Materials } from './geometry'
import { optics, makeOptic } from './devices'
import { aircraftPose } from './motion'
import { Parts } from './actors'
export function SensorHeads({clock,m,high}:{clock:WorldProps['clock'];m:Materials;high:boolean}){
 const yaw=useRef<Group>(null),pitch=useRef<Group>(null),water=optics[0],sky=optics[1]
 const waterParts=useMemo(()=>makeOptic(m,high,false),[m,high]),skyParts=useMemo(()=>makeOptic(m,high,true,false),[m,high]);useEffect(()=>()=>[waterParts,skyParts].flat().forEach(p=>p.geometry.dispose()),[waterParts,skyParts]);const d=useMemo(()=>new Vector3(),[])
 useFrame(()=>{d.copy(aircraftPose(Math.min(clock.current.time,78)).p).sub(new Vector3(...sky.position));yaw.current!.rotation.y=Math.atan2(d.x,d.z);pitch.current!.rotation.x=Math.atan2(-d.y,Math.hypot(d.x,d.z))})
 return <group name="independent-sensors"><group name="shore-camera" position={water.position} rotation={[0,water.yaw,0]}><group rotation={[water.pitch,0,0]}><Parts parts={waterParts}/></group></group>
 <group name="sky-camera" position={sky.position}><mesh position={[0,-.235,0]} material={m.steel}><cylinderGeometry args={[.075,.075,.2,8]}/></mesh><mesh position={[0,-.13,0]} material={m.dark}><sphereGeometry args={[.17,10,6]}/></mesh><group name="sky-pan" ref={yaw}><group name="sky-tilt" ref={pitch}><Parts parts={skyParts}/></group></group></group></group>
}
