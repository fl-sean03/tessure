'use client'
import {useEffect,useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {BufferGeometry,CatmullRomCurve3,Float32BufferAttribute,Group,Matrix4,Mesh,Quaternion,SphereGeometry,TorusGeometry,Vector3} from 'three'
import type {WorldProps,Vec3} from '../../contract'
import {assembly,type Materials} from './geometry'
import {aperture,deviceFrame,devices,sectorContains,type Device} from './devices'
import {airPosition} from './flight'
import {visitorPosition} from './motion'
function Head({device,m,high}:{device:Device;m:Materials;high:boolean}) {
  const parts=useMemo(()=>{const a=assembly(m,high,high?{}:{steel:'chalk',edge:'chalk',paint:'chalk',glass:'dark'})
    if(device.id==='ground-radar'){
      a.box([0,0,0],[.68,.58,.30],'chalk',.075);a.box([0,0,.158],[.54,.45,.034],'paint',.055)
      for(const x of [-.23,-.11,.01,.13,.25])a.box([x,0,-.173],[.025,.4,.065],'steel',.01)
      a.box([0,-.34,-.06],[.18,.18,.18],'steel',.025)
    }else if(device.id.endsWith('air-optics')){
      a.put(new SphereGeometry(.12,10,6),'steel');a.box([0,.12,.14],[.47,.33,.55],'chalk',.05);a.box([0,.31,.18],[.54,.035,.62],'edge');a.cylinder([0,.12,.465],.16,.13,'dark',[Math.PI/2,0,0]);a.cylinder([0,.12,.537],.118,.016,'glass',[Math.PI/2,0,0]);a.put(new TorusGeometry(.138,.017,6,20),'steel',[0,.12,.55]);a.box([0,-.14,-.1],[.18,.15,.24],'steel')
    }else{
      a.put(new SphereGeometry(.12,12,8),'steel');a.box([0,.11,.14],[.76,.34,.55],'chalk',.06)
      a.box([0,.295,.16],[.83,.045,.62],'edge',.015)
      // Visible-light hood and thermal window have deliberately different optical faces.
      a.cylinder([-.19,.11,.445],.128,.14,'dark',[Math.PI/2,0,0]);a.cylinder([-.19,.11,.518],.091,.023,'glass',[Math.PI/2,0,0]);a.put(new TorusGeometry(.106,.014,6,20),'steel',[-.19,.11,.535])
      a.box([.19,.11,.464],[.225,.225,.14],'dark',.025);a.box([.19,.11,.537],[.16,.16,.016],'glass',.017)
      a.box([0,-.13,-.1],[.2,.13,.24],'steel',.022)
      a.tube([[0,-.06,-.12],[0,-.2,-.12],[0,-.2,.02]],.025,'dark')
    }return a.finish()
  },[device,m,high])
  const q=useMemo(()=>{const f=deviceFrame(device);return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(new Vector3(...f.right),new Vector3(...f.up),new Vector3(...f.forward)))},[device])
  useEffect(()=>()=>parts.forEach(p=>p.geometry.dispose()),[parts])
  return <group name={device.id} position={device.position} quaternion={q}>{parts.map((p,i)=><mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow dispose={null}/>)}</group>
}
function Contribution({device,clock,local=false}:{device:Device;clock:WorldProps['clock'];local?:boolean}){
  const root=useRef<Group>(null),packet=useRef<Mesh>(null),from=useMemo(()=>aperture(device),[device])
  const geometry=useMemo(()=>new BufferGeometry().setAttribute('position',new Float32BufferAttribute(new Float32Array(32*6),3)),[])
  const curve=useMemo(()=>new CatmullRomCurve3([new Vector3(...from),new Vector3(),new Vector3()]),[from]),point=useMemo(()=>new Vector3(),[])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  useFrame(()=>{const t=clock.current.time,p=visitorPosition(t),target:Vec3=device.id.endsWith('air-optics')?airPosition(device.id==='air-optics'?'hostile-east':'hostile-west',t):[p[0],1.1,p[2]];root.current!.visible=local?t>=Math.max(33,device.firstRecord):t>=device.firstRecord&&sectorContains(device,target)
    const end:Vec3=local?[8.8,2.55,6.767]:target;curve.points[2].set(...end);curve.points[1].set((from[0]+end[0])/2,Math.max(from[1],end[1])+(local?.8:.35),(from[2]+end[2])/2)
    for(let i=0;i<32;i++)for(let j=0;j<2;j++){curve.getPoint((i+j)/32,point);geometry.attributes.position.setXYZ(i*2+j,point.x,point.y,point.z)}geometry.attributes.position.needsUpdate=true;geometry.computeBoundingSphere();curve.getPoint((((t-device.firstRecord)*.22)%1+1)%1,point);packet.current!.position.copy(point)
  })
  return <group ref={root} name={`${device.id}-${local?'retained-record':'contribution'}`} visible={false}><lineSegments geometry={geometry}><lineBasicMaterial color={device.color} transparent opacity={.55} depthWrite={false}/></lineSegments><mesh ref={packet}><sphereGeometry args={[.045,8,6]}/><meshBasicMaterial color={device.color}/></mesh></group>
}
function Sector({device}:{device:Device}){
  const geometry=useMemo(()=>{const vertices:number[]=[],[x0,x1,z0,z1]=device.sector,n=12;for(let i=0;i<n;i++)for(let j=0;j<4;j++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*j/4,dx=(x1-x0)/n,dz=(z1-z0)/4;if(![[x,z],[x+dx,z],[x,z+dz],[x+dx,z+dz]].every(([xx,zz])=>sectorContains(device,[xx,1.1,zz])))continue;vertices.push(x,.236,z,x,.236,z+dz,x+dx,.236,z,x+dx,.236,z,x,.236,z+dz,x+dx,.236,z+dz)}return new BufferGeometry().setAttribute('position',new Float32BufferAttribute(vertices,3))},[device])
  useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh name={`${device.id}-illustrative-sector`} geometry={geometry}><meshBasicMaterial color={device.color} transparent opacity={.075} depthWrite={false}/></mesh>
}
export function Equipment({m,high,clock,sensors}:{m:Materials;high:boolean;clock:WorldProps['clock'];sensors:boolean}){return <group name="infrastructure-devices">{devices.map(d=><group key={d.id}><Head device={d} m={m} high={high}/>{sensors&&<>{!d.id.endsWith('air-optics')&&<Sector device={d}/>}<Contribution device={d} clock={clock}/><Contribution device={d} clock={clock} local/></>}</group>)}</group>}
