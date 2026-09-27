'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three'
import type { WorldProps } from '../../contract'
import { assembly, type Part, materials } from './geometry'
import { T, entryYaw, innerYaw, reliefYaw } from './incident'
import { reliefPivot } from './layout'
import { personPose } from './people'
function Parts({parts}:{parts:Part[]}){return <>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} dispose={null} castShadow receiveShadow/>)}</>}
export function makeAccess(m:ReturnType<typeof materials>,high:boolean){
 const a=assembly(m,high)
 const fence=(x:number,z:number,length:number,alongZ=false)=>{const p=(d:number,y:number):[number,number,number]=>alongZ?[x,y,z+d]:[x+d,y,z];for(let d=-length/2;d<=length/2+.01;d+=length/Math.ceil(length/1.4)){a.box(p(d,1.12),[.085,1.94,.085],'steel',.012);a.box(p(d,.23),[.30,.16,.30],'dark',.025)}for(const y of [.43,1.93])a.beam(p(-length/2,y),p(length/2,y),.037,'steel');for(let d=-length/2+.16;d<length/2;d+=.28)a.beam(p(d,.45),p(d,1.92),.018,'steel')}
 fence(5.15,4.15,8.4,true);fence(8.95,4.15,8.4,true);fence(10.8,1.4,3.7)
 // Inner equipment compound remains physically separate from public egress.
 fence(8.2,-5.3,6.1);fence(4.2,-1.7,7.2,true);fence(12.25,-1.7,7.2,true)
 for(const z of [8.35,1.4]){for(const x of [5.15,8.95]){a.box([x,1.29,z],[.18,2.28,.18],'dark',.025);a.cyl([x,2.52,z],.10,.15,'warm')}a.beam([5.15,2.35,z],[8.95,2.35,z],.045,'steel');for(const y of [.55,1.15]){a.beam([5.15,y,z],[5.25,y,z],.055,'steel');a.cyl([5.25,y,z],.075,.18,'dark')}a.box([5.15,1.27,z+.16],[.22,.22,.13],'dark',.02)}
 // Reader face, reachable at a worker's right hand, on a distinct bollard.
 a.box([5.45,.70,8.56],[.16,1.1,.16],'dark',.025);a.box([5.45,1.29,8.60],[.26,.33,.12],'steel',.03);a.box([5.45,1.29,8.667],[.20,.26,.018],'glass',.01)
 // The controller and local gate motor connect through a conduit, not a floating status box.
 a.box([5.15,.82,1.4],[.32,.42,.28],'dark',.035);a.beam([5.15,.10,1.4],[9.5,.10,1.4],.028,'steel');a.box([9.5,1.62,1.5],[.23,.09,.23],'dark',.025);a.box([9.5,1.0,1.5],[.70,1.15,.43],'canvas',.06);a.box([9.5,1.15,1.735],[.5,.38,.04],'dark',.018);a.beam([9.5,.5,1.3],[9.5,.28,1.3],.055,'steel');a.beam([9.5,.28,1.3],[8.95,.28,1.3],.055,'steel')
 for(const x of [6,7.4,9.1,10.5]){a.box([x,.62,-3.6],[1,.94,1.1],'dark',.08);a.box([x,.65,-3.015],[.82,.7,.04],'steel',.025);for(const dx of [-.34,.34])a.cyl([x+dx,.24,-3.22],.09,.08,'dark',[Math.PI/2,0,0])}
 // Staff threshold markings and public checkpoint, with an always-open pedestrian outlet.
 for(let x=5.3;x<8.7;x+=.42)a.box([x,.153,7.7],[.22,.004,.18],'terracotta',0)
 a.box([11.8,.72,6.2],[1.3,1.1,.65],'plum',.055);a.box([11.8,1.31,6.2],[1.42,.12,.76],'woodLight',.035)
 a.box([11.8,1.1,6.2],[.08,1.9,.08],'steel',.01);a.beam([11.8,2.1,6.2],[11.8,2.1,6.6],.035,'steel')
 // Relief hinge and receiver: the gate swings into the unused verge before public motion resumes.
 a.box([-4.5,1.18,13.78],[.22,.26,.44],'dark',.03);a.beam([-4.5,1.18,13.55],[-4.5,1.18,14],.045,'steel');for(const z of [14,16.7]){a.cyl([-4.5,.9,z],.065,1.5,'steel');a.box([-4.5,.22,z],[.30,.14,.30],'dark',.025)}
 return a.finish()
}
function leaf(m:ReturnType<typeof materials>,high:boolean,width:number,relief=false){const a=assembly(m,high),x=relief?-width/2:width/2;for(const y of [.35,1.15])a.beam([x-width/2,y,0],[x+width/2,y,0],.034,'steel');for(let dx=-width/2;dx<=width/2+.01;dx+=width/10)a.beam([x+dx,.35,0],[x+dx,1.15,0],.023,'steel');a.box([x,.78,.025],[relief?1.2:1.8,.43,.08],relief?'sage':'plum',.03);if(!relief){a.box([.03,1.12,.07],[.05,.06,.14],'dark',.008);a.box([.03,1.12,.16],[.05,.12,.055],'canvas',.008)}if(relief){a.cyl([0,.74,0],.087,.85,'dark')};const parts=a.finish();if(relief)parts.forEach(p=>p.geometry.rotateY(Math.PI/2));return parts}
function crankParts(m:ReturnType<typeof materials>,high:boolean){const a=assembly(m,high);a.cyl([0,0,0],.16,.035,'steel',[Math.PI/2,0,0]);a.cyl([-.12,0,-.06],.032,.10,'dark',[Math.PI/2,0,0]);return a.finish()}
function credentialParts(m:ReturnType<typeof materials>,high:boolean){const a=assembly(m,high);a.box([0,0,.061],[.095,.13,.012],'canvas',.004);a.box([0,.036,.068],[.078,.023,.002],'blue',0);return a.finish()}
function Labels(){
 const b=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d')!;x.fillStyle='#eee1c8';x.fillRect(0,0,1024,512);x.fillStyle='#423545';x.font='bold 150px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('STAFF ONLY',512,128);x.font='bold 140px sans-serif';x.fillText('CHECKPOINT',512,384);const tx=new CanvasTexture(c);tx.colorSpace=SRGBColorSpace;const mat=new MeshBasicMaterial({map:tx});const staff=new PlaneGeometry(3,.8),check=new PlaneGeometry(2.8,.8);for(const[g,offset]of[[staff,.5],[check,0]] as const){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*.5+offset)}return{tx,mat,staff,check}},[])
 useEffect(()=>()=>{b.tx.dispose();b.mat.dispose();b.staff.dispose();b.check.dispose()},[b]);return <group dispose={null}><mesh name="event-staff-label" position={[7.05,2.4,8.42]} geometry={b.staff} material={b.mat}/><mesh name="event-checkpoint-label" position={[11.8,2.1,6.6]} geometry={b.check} material={b.mat}/></group>
}

export function Access({clock,quality,m,parts}:{clock:WorldProps['clock'];quality:WorldProps['quality'];m:ReturnType<typeof materials>;parts:Part[]}){
 const high=quality==='high',gate=useMemo(()=>leaf(m,high,3.6),[m,high]),relief=useMemo(()=>leaf(m,high,2.7,true),[m,high]),crank=useMemo(()=>crankParts(m,high),[m,high]),credential=useMemo(()=>credentialParts(m,high),[m,high]),card=useRef<Group>(null),wheel=useRef<Group>(null),entry=useRef<Group>(null),inner=useRef<Group>(null),publicGate=useRef<Group>(null),reader=useRef<Mesh>(null),controller=useRef<Mesh>(null),beacon=useRef<Mesh>(null)
 useEffect(()=>()=>[...gate,...relief,...crank,...credential].forEach(p=>p.geometry.dispose()),[gate,relief,crank,credential])
 useFrame(()=>{const t=clock.current.time;if(card.current){const p=personPose(81,t);card.current.position.set(...p.arms[1].hand);card.current.rotation.y=p.yaw}if(entry.current)entry.current.rotation.y=entryYaw(t);if(inner.current)inner.current.rotation.y=innerYaw(t);if(publicGate.current)publicGate.current.rotation.y=reliefYaw(t);if(wheel.current)wheel.current.rotation.z=-reliefYaw(t);if(reader.current)(reader.current.material as MeshBasicMaterial).color.set(t>=T.readerOn?'#9ccaa3':'#d8af78');if(controller.current)(controller.current.material as MeshBasicMaterial).color.set(t>=T.correlate?'#dc956a':'#789da3');if(beacon.current)(beacon.current.material as MeshBasicMaterial).color.set(t>=T.correlate?'#f4b85f':'#655343')})
 return <group name="event-access"><Parts parts={parts}/><group name="event-worker-credential" ref={card}><Parts parts={credential}/></group><group name="event-entry-gate" ref={entry} position={[5.25,.15,8.35]}><Parts parts={gate}/></group><group name="event-inner-gate" ref={inner} position={[5.25,.15,1.4]} rotation={[0,Math.PI/2,0]}><Parts parts={gate}/></group><group name="event-relief-gate" ref={publicGate} position={reliefPivot}><Parts parts={relief}/></group><group name="event-relief-crank" ref={wheel} position={[-4.5,1.18,13.55]}><Parts parts={crank}/></group><mesh name="event-reader-status" ref={reader} position={[5.45,1.39,8.685]}><boxGeometry args={[.10,.035,.012]}/><meshBasicMaterial color="#d8af78"/></mesh><mesh name="event-controller-status" ref={controller} position={[9.5,1.15,1.765]}><boxGeometry args={[.39,.22,.015]}/><meshBasicMaterial color="#789da3"/></mesh><mesh name="event-review-beacon" ref={beacon} position={[9.5,1.75,1.5]}><cylinderGeometry args={[.085,.11,.18,10]}/><meshBasicMaterial color="#655343"/></mesh><Labels/></group>
}
