'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import type { WorldProps, Vec3 } from '../../contract'
import { cameras, devicePoint, inSector, type CameraDevice } from './devices'
import type { Part } from './geometry'
import { T } from './incident'
/** The optional patch is clipped by both the drawn lens sector and actual static model triangles.
 * It omits moving-person occlusion, so copy explicitly calls these partial illustrative views. */
export function makeSourcePatch(d:CameraDevice,site:Part[]){
  const objects=site.map(p=>{const mesh=new Mesh(p.geometry,p.material);mesh.updateMatrixWorld();return mesh}),ray=new Raycaster(),origin=new Vector3(...devicePoint(d,[0,0,.1])),triangles:number[]=[],edges=new Map<string,[Vec3,Vec3]>();let occluded=0,visible=0
  const [x0,x1,z0,z1]=d.patch,point=(i:number,j:number):Vec3=>[x0+(x1-x0)*i/20,.154,z0+(z1-z0)*j/5]
  const clear=(p:Vec3)=>{if(!inSector(d,p))return false;const delta=new Vector3(...p).sub(origin);ray.set(origin,delta.clone().normalize());ray.near=.035;ray.far=delta.length()-.03;const hit=ray.intersectObjects(objects,false).length>0;if(hit)occluded++;return !hit}
  const edge=(a:Vec3,b:Vec3)=>{const ka=a.join(','),kb=b.join(','),key=ka<kb?ka+'|'+kb:kb+'|'+ka;if(edges.has(key))edges.delete(key);else edges.set(key,[a,b])}
  for(let i=0;i<20;i++)for(let j=0;j<5;j++){const p=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];if(!p.every(clear))continue;visible++;triangles.push(...p[0],...p[2],...p[1],...p[0],...p[3],...p[2]);p.forEach((a,k)=>edge(a,p[(k+1)%4]))}
  const fill=new BufferGeometry();fill.setAttribute('position',new Float32BufferAttribute(triangles,3));const vertices=[...edges.values()].flat(2) as number[];const first=[...edges.values()][0];if(first)vertices.push(...devicePoint(d,[0,0,.09]),...first[0]);const lines=new BufferGeometry();lines.setAttribute('position',new Float32BufferAttribute(vertices,3));return{fill,lines,visible,occluded}
}
function Source({clock,site,index}:{clock:WorldProps['clock'];site:Part[];index:number}){
  const ref=useRef<Group>(null),d=cameras[index],built=useMemo(()=>makeSourcePatch(d,site),[d,site])
  useEffect(()=>()=>{built.fill.dispose();built.lines.dispose()},[built]);useFrame(()=>{if(ref.current)ref.current.visible=clock.current.time>=(index?T.verify:T.detect)})
  const color=index?'#ddbc96':'#a6c6c6'
  return <group name={`event-source-${d.id}`} ref={ref} visible={false} userData={{visibleCells:built.visible,occludedCorners:built.occluded}}><mesh geometry={built.fill}><meshBasicMaterial color={color} transparent opacity={.05} side={DoubleSide} depthWrite={false}/></mesh><lineSegments geometry={built.lines}><lineBasicMaterial color={color} transparent opacity={.32} depthWrite={false}/></lineSegments><mesh name={`event-source-origin-${d.id}`} position={devicePoint(d,[0,0,.1])}><sphereGeometry args={[.075,8,6]}/><meshBasicMaterial color={color}/></mesh></group>
}
export function Flow({clock,layers,site}:{clock:WorldProps['clock'];layers:WorldProps['layers'];site:Part[]}){
 const mats=useMemo(()=>[new MeshBasicMaterial({color:'#b7d4cb',side:DoubleSide,transparent:true,opacity:.65}),new MeshBasicMaterial({color:'#d2b5a0',side:DoubleSide,transparent:true,opacity:.65})],[]);useEffect(()=>()=>mats.forEach(m=>m.dispose()),[mats]);const initial=useRef<Group>(null),alternate=useRef<Group>(null),closed=useRef<Group>(null),arrow=useMemo(()=>{const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute([-.4,0,-.075,.1,0,-.075,.1,0,.075,-.4,0,-.075,.1,0,.075,-.4,0,.075,.05,0,-.23,.5,0,0,.05,0,.23],3));g.computeVertexNormals();return g},[])
 useEffect(()=>()=>arrow.dispose(),[arrow]);useFrame(()=>{const t=clock.current.time;if(initial.current)initial.current.visible=layers.tracks&&t>=T.detect&&t<T.reliefReady;if(alternate.current)alternate.current.visible=layers.tracks&&t>=T.reliefReady;if(closed.current)closed.current.visible=layers.sensors&&t>=T.correlate})
 return <><group ref={initial} name="event-initial-summary" visible={false}>{[-13,-9,-5,-1,3,7,11,15].map(x=><group key={x}>{[11.75,10.45].map((z,j)=><mesh key={j} position={[x,.156,z]} rotation={[0,j?Math.PI:0,0]} geometry={arrow} material={mats[j]} dispose={null}/>)}</group>)}</group><group ref={alternate} name="event-alternate-summary" visible={false}>{[-5,-1,3,7,11].map(x=><mesh key={x} geometry={arrow} position={[x,.156,15.7]} material={mats[0]} dispose={null}/>)}</group><group visible={layers.sensors}>{cameras.map((d,index)=><Source key={d.id} index={index} clock={clock} site={site}/>)}</group><group ref={closed} visible={false}><mesh position={[7,1.22,7.8]}><sphereGeometry args={[.08,8,6]}/><meshBasicMaterial color="#e4c19d"/></mesh></group></>
}
