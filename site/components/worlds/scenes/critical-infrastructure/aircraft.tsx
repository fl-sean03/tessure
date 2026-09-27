'use client'
import {useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {Group,InstancedMesh,Object3D,SphereGeometry,MeshStandardMaterial} from 'three'
import type {WorldProps,Vec3} from '../../contract'
import {assembly,type Materials,type Part} from './geometry'
import {airPose,dock,gimbalMount,rotorCenters,type AirRole} from './flight'
const Parts=({parts}:{parts:Part[]})=><>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow dispose={null}/>)}</>
export function Aircraft({role,clock,m,high}:{role:AirRole;clock:WorldProps['clock'];m:Materials;high:boolean}){
 const body=useRef<Group>(null),gimbal=useRef<Group>(null),rotors=useRef<(InstancedMesh|null)[]>([]),obj=useMemo(()=>new Object3D(),[])
 const centers=useMemo(()=>role==='hostile-east'?Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*.85,.79,Math.sin(i*Math.PI/3)*.85] as Vec3):rotorCenters,[role])
 const model=useMemo(()=>{const color=role==='defender'?'chalk':role==='hostile-east'?'ochre':'dark',a=assembly(m,high,high?{}:{steel:color,paint:color});a.box([0,.45,0],role==='hostile-west'?[.47,.20,.88]:[.6,.25,.72],color,.09);a.box([0,role==='hostile-west'?.595:.62,-.08],[.35,.09,.42],'paint',.035)
 centers.forEach(p=>{a.beam([Math.sign(p[0])*.17,.45,Math.sign(p[2])*.17],[p[0],.67,p[2]],.06,'steel');a.cylinder([p[0],.70,p[2]],.075,.17,color)})
 for(const x of[-.42,.42]){a.box([x,.045,0],[.08,.09,1.04],'dark',.03);for(const z of[-.4,.4])a.beam([Math.sign(x)*.2,.36,z*.62],[x,.06,z],.035,'steel')}
 const r=assembly(m,high);r.box([0,0,0],[.67,.018,.062],'dark',.016)
 const g=assembly(m,high,high?{}:{glass:'dark'});g.put(new SphereGeometry(.126,12,8),color);g.cylinder([0,0,.112],.079,.07,'dark',[Math.PI/2,0,0]);g.cylinder([0,0,.15],.056,.012,'glass',[Math.PI/2,0,0]);return {body:a.finish(),rotor:r.finish(),gimbal:g.finish()}
 },[m,high,role,centers])
 useEffect(()=>()=>Object.values(model).flat().forEach(p=>p.geometry.dispose()),[model]);useEffect(()=>{const refs=[...rotors.current];return()=>refs.forEach(r=>r?.dispose())},[model])
 useFrame(()=>{const p=airPose(role,clock.current.time);body.current!.position.set(...p.position);body.current!.rotation.set(p.pitch,p.yaw,p.roll,'YXZ');body.current!.visible=p.visible;body.current!.userData={role,target:p.target};gimbal.current!.rotation.set(p.gimbalPitch,p.gimbalYaw,0,'YXZ');centers.forEach((v,i)=>{obj.position.set(...v);obj.rotation.set(0,p.rotor*(i%2?-1:1),0);obj.updateMatrix();rotors.current.forEach(r=>r!.setMatrixAt(i,obj.matrix))});rotors.current.forEach(r=>{r!.instanceMatrix.needsUpdate=true;r!.computeBoundingSphere()})})
 return <group ref={body} name={`aircraft-${role}`}><Parts parts={model.body}/>{model.rotor.map((p,i)=><instancedMesh key={i} name={`${role}-rotors`} ref={r=>{rotors.current[i]=r}} args={[p.geometry,p.material,centers.length]} dispose={null}/>)}<group ref={gimbal} name={`${role}-gimbal`} position={gimbalMount}><Parts parts={model.gimbal}/></group></group>
}
export function Dock({clock,m,high}:{clock:WorldProps['clock'];m:Materials;high:boolean}){
 const covers=useRef<(Group|null)[]>([]),windowMaterial=useMemo(()=>new MeshStandardMaterial({color:'#b2d3df',transparent:true,opacity:.16,roughness:.14,metalness:0,depthWrite:false}),[]),model=useMemo(()=>{const a=assembly(m,high);a.box([dock.x,.37,dock.z],[3.2,.8,2.9],'concrete',.08);a.box([dock.x,dock.surfaceY-.015,dock.z],[2.8,.03,2.5],'dark');for(const x of[-1.39,1.39])a.box([dock.x+x,1.23,dock.z],[.12,.90,2.6],'paint',.04);for(const z of[-1.24,1.24]){a.box([dock.x,1,dock.z+z],[2.75,.42,.12],'paint',.03);a.box([dock.x,1.70,dock.z+z],[5.8,.10,.12],'steel',.02)}const c=assembly(m,high);for(const x of[-.67,.67])c.box([x,0,0],[.11,.1,2.6],'chalk',.025);for(const z of[-1.245,1.245])c.box([0,0,z],[1.45,.1,.11],'chalk',.025);c.box([0,.005,0],[1.25,.015,2.37],'glass');return {base:a.finish(),cover:c.finish().map(p=>({...p,material:p.material===m.glass?windowMaterial:p.material}))}},[m,high,windowMaterial])
 useEffect(()=>()=>Object.values(model).flat().forEach(p=>p.geometry.dispose()),[model]);useFrame(()=>{const p=airPose('defender',clock.current.time);covers.current.forEach((o,i)=>{o!.position.x=dock.x+(i?1:-1)*(.725+dock.coverTravel*p.cover)})})
 useEffect(()=>()=>windowMaterial.dispose(),[windowMaterial])
 return <group name="inspection-dock"><Parts parts={model.base}/>{[0,1].map(i=><group key={i} name={`dock-cover-${i}`} ref={o=>{covers.current[i]=o}} position={[dock.x+(i?1:-1)*.725,dock.coverY,dock.z]}><Parts parts={model.cover}/></group>)}</group>
}
