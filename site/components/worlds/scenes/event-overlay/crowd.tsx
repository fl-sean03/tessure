'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CapsuleGeometry, Color, Float32BufferAttribute, InstancedMesh, Matrix4, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, SphereGeometry, Vector3 } from 'three'
import type { DataTexture } from 'three'
import type { Vec3, WorldProps } from '../../contract'
import { seeded } from '../../math'
import { COUNT } from './choreography'
import { personPose, personRig } from './people'
import { surfaceY } from './layout'
export const personParts=['head','hair','torso','hips','left-upper-arm','left-forearm','right-upper-arm','right-forearm','left-thigh','left-shin','right-thigh','right-shin','left-shoe','right-shoe','left-hand','right-hand']
/** The bend plane fixes axial roll, including when a limb points straight down. */
export function limbNormal(a:Vec3,b:Vec3,c:Vec3):Vec3 {const u=b.map((v,k)=>v-a[k]),v=c.map((v,k)=>v-b[k]);return[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]}
export function alignBone(out:Object3D,from:Vec3,to:Vec3,normal:Vec3,s:number,work:{a:Vector3;b:Vector3;c:Vector3;frame:Matrix4}){const{a,b,c,frame}=work;a.set(...normal).normalize();b.set(...to).sub(c.set(...from)).normalize();c.crossVectors(a,b).normalize();a.crossVectors(b,c);frame.makeBasis(a,b,c);out.position.set(...from).add(c.set(...to)).multiplyScalar(.5);out.quaternion.setFromRotationMatrix(frame);out.scale.setScalar(s);out.updateMatrix()}
/** Bevelled eight-sided sole with a flat contact patch, not a scaled sphere touching at one point. */
export function makeFootGeometry(){
  const outline=[[-.065,-.17],[.065,-.17],[.09,-.145],[.09,.115],[.065,.17],[-.065,.17],[-.09,.115],[-.09,-.145]],vertices:number[]=[]
  const p=(i:number,y:number)=>[outline[(i+8)%8][0]*(y? .88:1),y,outline[(i+8)%8][1]*(y?.92:1)]
  for(let i=0;i<8;i++){vertices.push(...p(i,0),...p(i+1,0),...p(i,.11),...p(i+1,0),...p(i+1,.11),...p(i,.11));if(i>0&&i<7)vertices.push(...p(0,0),...p(i+1,0),...p(i,0),...p(0,.11),...p(i,.11),...p(i+1,.11))}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g
}
export function Crowd({clock,quality,contact}:{clock:WorldProps['clock'];quality:WorldProps['quality'];contact:DataTexture}){
  const refs=useRef<(InstancedMesh|null)[]>([]),shadows=useRef<InstancedMesh>(null),high=quality==='high'
  const built=useMemo(()=>{const head=new SphereGeometry(1,high?10:8,high?8:4),round=new SphereGeometry(1,high?8:5,high?6:3),torso=new SphereGeometry(1,high?8:6,high?6:4),upper=new CapsuleGeometry(.057,personRig.upperArm,1,high?8:5),fore=new CapsuleGeometry(.047,personRig.forearm,1,high?8:5),leg=new CapsuleGeometry(.065,personRig.thigh,1,high?8:4),shoe=makeFootGeometry(),material=new MeshStandardMaterial({roughness:.86});return{geometries:[head,round,torso,round,upper,fore,upper,fore,leg,leg,leg,leg,shoe,shoe,round,round],material,shadow:new PlaneGeometry(1,1),shadowMaterial:new MeshBasicMaterial({color:'#292335',map:contact,transparent:true,opacity:.4,depthWrite:false})}},[high,contact])
  const work=useMemo(()=>({object:new Object3D(),a:new Vector3(),b:new Vector3(),c:new Vector3(),frame:new Matrix4()}),[])
  useLayoutEffect(()=>{const skin=['#bf987d','#88614e','#d6b394','#ad795e'],clothes=['#d1b392','#bd8067','#78918e','#8b81a2','#d7cbbc','#9b5363','#667c9c','#ceb57b'];refs.current.forEach((mesh,k)=>{if(!mesh)return;for(let i=0;i<COUNT;i++){const cloth=i===81?'#73bec6':i===82?'#d26348':i>=83?'#447691':i>=79?'#e9d272':clothes[Math.floor(seeded(i+14)*clothes.length)],color=k===0||k>=14||k===5||k===7?skin[i%4]:k===1?'#37313b':k===2||k===4||k===6?cloth:'#393945';mesh.setColorAt(i,new Color(color))}if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true});const mounted=[...refs.current,shadows.current].filter((m):m is InstancedMesh=>!!m);return()=>mounted.forEach(m=>m.dispose())},[built])
  useEffect(()=>()=>{new Set(built.geometries).forEach(g=>g.dispose());built.shadow.dispose();built.material.dispose();built.shadowMaterial.dispose()},[built])
  useFrame(()=>{const t=clock.current.time,{object:d}=work
    const set=(k:number,i:number,p:Vec3,size:Vec3,yaw:number)=>{d.position.set(...p);d.rotation.set(0,yaw,0);d.scale.set(...size);d.updateMatrix();refs.current[k]!.setMatrixAt(i,d.matrix)}
    const bone=(k:number,i:number,from:Vec3,to:Vec3,s:number,normal:Vec3)=>{alignBone(d,from,to,normal,s,work);refs.current[k]!.setMatrixAt(i,d.matrix)}
    for(let i=0;i<COUNT;i++){const p=personPose(i,t),s=p.scale;set(0,i,p.head,[.145*s,.18*s,.145*s],p.yaw);set(1,i,p.hair,[.151*s,.105*s,.146*s],p.yaw);set(2,i,p.torso,[.225*s,.30*s,.145*s],p.yaw);set(3,i,p.hips,[.205*s,.14*s,.145*s],p.yaw)
      p.arms.forEach((arm,side)=>{const normal=limbNormal(arm.shoulder,arm.elbow,arm.hand);bone(4+side*2,i,arm.shoulder,arm.elbow,s,normal);bone(5+side*2,i,arm.elbow,arm.hand,s,normal);set(14+side,i,arm.hand,[.059*s,.072*s,.059*s],p.yaw)})
      p.legs.forEach((leg,side)=>{const normal=limbNormal(leg.hip,leg.knee,leg.ankle);bone(8+side*2,i,leg.hip,leg.knee,s,normal);bone(9+side*2,i,leg.knee,leg.ankle,s,normal)})
      p.feet.forEach((f,side)=>{set(12+side,i,f.position,[s,s,s],f.yaw);const y=i>=36&&i<79?p.root[1]:surfaceY(f.position[0],f.position[2]),fade=Math.max(.15,1-Math.max(0,f.position[1]-y)/.16);d.position.set(f.position[0],y+.003,f.position[2]);d.rotation.set(-Math.PI/2,0,-f.yaw);d.scale.set(.31*s*fade,.48*s*fade,1);d.updateMatrix();shadows.current!.setMatrixAt(i*2+side,d.matrix)})
    }
    for(const m of [...refs.current,shadows.current])if(m){m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere()}
  })
  return <group name="event-people" dispose={null}>{built.geometries.map((g,k)=><instancedMesh key={k} name={`event-person-${personParts[k]}`} ref={m=>{refs.current[k]=m}} args={[g,built.material,COUNT]} castShadow receiveShadow />)}<instancedMesh name="event-foot-contacts" ref={shadows} args={[built.shadow,built.shadowMaterial,COUNT*2]}/></group>
}
