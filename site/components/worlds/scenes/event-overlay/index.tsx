'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, DataTexture, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, LinearFilter, Object3D, RGBAFormat, SphereGeometry } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { mix, progress, seeded, smooth } from '../../math'
import { assembly, makeSign, makeSite, materials, type Part } from './geometry'
import { definition } from './content'
import { SegmentPath } from '../../primitives'
import { signYaw } from './choreography'
import { Crowd } from './crowd'
import { Access, makeAccess } from './access'
import { Flow } from './sources'
import { arrivalSign, exitSign, signPivot } from './layout'
function Parts({parts}:{parts:Part[]}){return <>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} castShadow={!p.material.userData.noShadow} receiveShadow dispose={null}/>)}</>}
function contactTexture(){const data=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4,r=((x-15.5)/15.5)**2+((y-15.5)/15.5)**2;data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(Math.max(0,1-r)**2*190)}const tx=new DataTexture(data,32,32,RGBAFormat);tx.magFilter=tx.minFilter=LinearFilter;tx.needsUpdate=true;return tx}
function Grounding(){
 const texture=useMemo(contactTexture,[]),ref=useRef<InstancedMesh>(null)
 useEffect(()=>()=>texture.dispose(),[texture])
 const items=[[-20,-11,4,3.4],[-17,-15,4,3.4],[-4,-15,4,3.4],[10,-11,5.3,4.4],[20,-11,4.4,3.8],[22,13,3,2.7],[15,4.5,6.8,4.8],[19,-2,6.2,4.8],[-19,3,6,4.8]]
 useLayoutEffect(()=>{const o=new Object3D();items.forEach(([x,z,w,d],i)=>{o.position.set(x,.075,z);o.rotation.set(-Math.PI/2,0,0);o.scale.set(w,d,1);o.updateMatrix();ref.current!.setMatrixAt(i,o.matrix)});ref.current!.instanceMatrix.needsUpdate=true;ref.current!.computeBoundingSphere();const mesh=ref.current!;return()=>{mesh.dispose()}},[])
 return <instancedMesh ref={ref} args={[undefined,undefined,9]}><planeGeometry/><meshBasicMaterial color="#292535" map={texture} transparent opacity={.34} depthWrite={false}/></instancedMesh>
}
function World({clock,quality,layers}:WorldProps){
 const high=quality==='high',m=useMemo(materials,[]),site=useMemo(()=>makeSite(m,high),[m,high]),access=useMemo(()=>makeAccess(m,high),[m,high]),occluders=useMemo(()=>[...site,...access],[site,access]),stand=useMemo(()=>makeSign(m,high),[m,high]),head=useMemo(()=>makeSign(m,high,true),[m,high]),contact=useMemo(contactTexture,[]),board=useRef<Group>(null)
 const contacts=useMemo(()=>{const a=assembly(m,high);for(const [x,z,w,d] of [[-7,-9,15.7,9.4],[15,4.5,5.5,3.6],[19,-2,5,3.6],[-19,3,4.8,3.6]])a.box([x,.012,z],[w,.009,d],'earth',0);return a.finish()},[m,high])
 useEffect(()=>()=>[...site,...access,...stand,...head,...contacts].forEach(p=>p.geometry.dispose()),[site,access,stand,head,contacts]);useEffect(()=>()=>contact.dispose(),[contact]);useEffect(()=>()=>Object.values(m).forEach(mat=>{mat.map?.dispose();mat.dispose()}),[m])
 useFrame(()=>{if(board.current)board.current.rotation.y=signYaw(clock.current.time)})
 return <group name="event-world"><Parts parts={site}/><Parts parts={contacts}/><Access clock={clock} quality={quality} m={m} parts={access}/><Grounding/><Crowd key={quality} clock={clock} quality={quality} contact={contact}/><group name="event-arrival-sign" position={arrivalSign}><Parts parts={stand}/><group name="event-arrival-sign-head" ref={board} position={[0,signPivot,0]}><Parts parts={head}/></group></group><group name="event-exit-sign" position={exitSign}><Parts parts={stand}/><group name="event-exit-sign-head" position={[0,signPivot,0]} rotation={[0,Math.PI/2,0]}><Parts parts={head}/></group></group><Flow clock={clock} layers={layers} site={occluders}/><pointLight position={[-6,4.5,-7]} color="#ffd09a" intensity={85} distance={17} decay={2}/>{high&&<><pointLight position={[15,3,6.1]} color="#ffcc91" intensity={19} distance={9} decay={2}/><pointLight position={[-17,3.2,5]} color="#ffcc91" intensity={16} distance={8} decay={2}/></>}</group>
}
const scene:SceneModule={definition,World}
export default scene
