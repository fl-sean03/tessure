'use client'
import {useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {CanvasTexture,Group,Mesh,MeshBasicMaterial,SRGBColorSpace} from 'three'
import type {WorldProps} from '../../contract'
import {assembly,type Materials,type Part} from './geometry'
import {smoother} from '../../kinematics'
import {progress} from '../../math'
import {gatePull} from './motion'
import {controlState,inner,T} from './incident'
const Parts=({parts}:{parts:Part[]})=><>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow dispose={null}/>)}</>
function atlas(){const c=document.createElement('canvas');c.width=1024;c.height=768;const x=c.getContext('2d')!;for(let i=0;i<4;i++){x.save();x.translate(i%2*512,Math.floor(i/2)*384);x.fillStyle='#142733';x.fillRect(0,0,512,384);x.textAlign='center';x.fillStyle='#d6e6e9';x.font='600 43px sans-serif';x.fillText('COMMAND AUTHORITY',256,51);x.font='700 65px sans-serif';x.fillText('LOCAL',256,125);x.fillStyle=i?'#efbd76':'#b9d2d8';x.font='700 49px sans-serif';x.fillText(i?'REMOTE DENIED':'NO REQUEST',256,213);x.font='600 44px sans-serif';x.fillText(['WORK AREA OPEN','REVIEW REQUIRED','LOCAL ALERT / HOLD','INNER ACCESS HELD'][i],256,285,487);x.fillStyle='#adc9ce';x.font='600 39px sans-serif';x.fillText('EQUIPMENT POWER ON',256,355);x.restore()}const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;t.repeat.set(.5,.5);return t}
export function Controls({clock,m,high}:{clock:WorldProps['clock'];m:Materials;high:boolean}){
 const gate=useRef<Group>(null),barrier=useRef<Group>(null),beacon=useRef<Mesh>(null),texture=useMemo(atlas,[])
 const parts=useMemo(()=>{const g=assembly(m,high);for(const x of[-2.5,0,2.5])g.cylinder([x,1.5,0],.047,2.45,'steel');for(const y of[.55,2.7])g.beam([-2.5,y,0],[2.5,y,0],.034,'edge');for(let x=-2.3;x<2.4;x+=.28)g.beam([x,.55,0],[x,2.7,0],.012,'steel');for(const y of[.95,1.35,1.75,2.15])g.beam([-2.5,y,0],[2.5,y,0],.013,'steel');g.beam([-2.5,.55,0],[0,2.7,0],.026,'edge');g.beam([0,2.7,0],[2.5,.55,0],.026,'edge');g.box([0,1.5,.06],[.60,.18,.10],'dark',.035)
 const b=assembly(m,high);b.box([-inner.length/2,0,0],[inner.length,.18,.16],'chalk',.025);for(let x=-4.8;x<0;x+=.7)b.box([x,0,.086],[.30,.18,.016],'ochre')
 const s=assembly(m,high);s.box([13.5,1.94,5.105],[3.5,2.52,.12],'dark',.035);for(const x of[12.1,14.9])s.box([x,1.83,5.07],[.085,2.74,.085],'steel');s.cylinder([13.85,.91,7.04],.055,1.36,'steel');s.box([13.85,1.58,7.04],[.28,.30,.20],'paint',.025);s.box([13.85,1.65,6.926],[.12,.08,.028],'ochre',.015);s.box([17.7,.9,8.9],[.42,1.34,.45],'paint',.03);s.beam([13.2,2.6,11.7],[13.05,2.6,11.7],.035,'steel');s.cylinder([13.05,2.75,11.7],.045,.35,'steel');s.cylinder([13.05,2.95,11.7],.12,.25,'dark');s.box([13.05,1.6,11.7],[.25,.5,.3],'paint',.025)
 return {gate:g.finish(),barrier:b.finish(),static:s.finish()}},[m,high])
 useEffect(()=>()=>{texture.dispose()},[texture]);useEffect(()=>()=>Object.values(parts).flat().forEach(a=>a.geometry.dispose()),[parts])
 useFrame(()=>{const t=clock.current.time,state=controlState(t);gate.current!.position.z=11.7+gatePull(t);barrier.current!.rotation.z=-Math.PI/2*(1-smoother(progress(t,62,64)));texture.offset.set(state%2*.5,state<2?.5:0);(beacon.current!.material as MeshBasicMaterial).color.set(t<T.correlate?'#58666d':'#efad59')})
 return <group name="local-protection"><Parts parts={parts.static}/><group name="service-gate" ref={gate} position={[15.7,0,11.7]}><Parts parts={parts.gate}/></group><group ref={barrier} name="inner-barrier" position={inner.hinge}><Parts parts={parts.barrier}/></group><mesh name="local-controller-display" position={[13.5,1.94,5.174]}><planeGeometry args={[3.20,2.40]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh><mesh ref={beacon} name="local-alert-beacon" position={[13.05,3.15,11.7]}><cylinderGeometry args={[.15,.15,.22,12]}/><meshBasicMaterial color="#58666d"/></mesh></group>
}
