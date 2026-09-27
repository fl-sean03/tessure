'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, Group, Object3D, Vector3 } from 'three'
import type { WorldProps } from '../../contract'
import { builder, type Materials } from './model'
import { devices, lensPosition, sectorGrid, type Device } from './devices'
import { Parts } from './actors'
function makeEquipment(m: Materials, device: Device) {
  const b = builder(m), thermal = device.id === 'thermal', mount = builder(m)
  mount.box(device.mount, [.13,.21,.036], 'metal',.016)
  mount.beam(device.mount,device.position,.036,'metal',.03,10)
  if (thermal) {
    b.box([0,0,0],[.32,.29,.26],'metal',.04)
    b.box([0,0,.134],[.27,.235,.022],'dark',.03)
    b.oval([-.033,.018,.151],[.072,.072,.012],'roof', [0,0,0],20)
    b.oval([-.033,.018,.163],[.048,.048,.008],'glass',[0,0,0],20)
    b.box([.087,-.065,.154],[.04,.045,.009],'coping')
    for (const x of [-.11,-.07,-.03,.01,.05,.09]) b.box([x,.15,-.025],[.015,.016,.15],'dark')
  } else {
    b.box([0,0,0],[.28,.205,.39],'coping',.04)
    b.box([0,-.005,.20],[.22,.146,.018],'dark',.03)
    b.oval([0,-.005,.216],[.054,.054,.012],'glass',[0,0,0],20)
    b.box([0,.115,.115],[.30,.025,.22],'coping')
  }
  return { body: b.finish(), mount: mount.finish() }
}
export function Equipment({ materials, clock, sensors, layout = devices, start = [4,11], end = 33, heightAt }: { materials: Materials; clock: WorldProps['clock']; sensors: boolean; layout?: Device[]; start?: [number,number]; end?: number; heightAt?: (x:number,z:number)=>number }) {
  return <>{layout.map((device, i) => <DeviceAssembly key={device.id} device={device} materials={materials} clock={clock} sensors={sensors} start={start[i]} end={end} heightAt={heightAt} />)}</>
}
function DeviceAssembly({ device, materials, clock, sensors, start, end, heightAt }: { device: Device; materials: Materials; clock: WorldProps['clock']; sensors: boolean; start: number; end: number; heightAt?: (x:number,z:number)=>number }) {
  const built = useMemo(() => makeEquipment(materials,device),[materials,device]), direction = useMemo(() => { const o = new Object3D(); o.position.set(...device.position); o.lookAt(...device.target); return o.quaternion },[device])
  const coverage = useRef<Group>(null), geometry = useMemo(() => { const grid = sectorGrid(device,heightAt), fill = new BufferGeometry(); fill.setAttribute('position',new Float32BufferAttribute(grid.vertices,3)); fill.computeVertexNormals(); const outline = new BufferGeometry().setFromPoints(grid.outline.map(p=>new Vector3(...p))); const lens = lensPosition(device), a = grid.outline[0], b = grid.outline[grid.outline.length-1]; const rays = new BufferGeometry().setFromPoints([new Vector3(...a),new Vector3(...lens),new Vector3(...lens),new Vector3(...b)]); return {fill,outline,rays} },[device,heightAt])
  useEffect(() => () => { [...built.body,...built.mount].forEach(p=>p.geometry.dispose()); Object.values(geometry).forEach(g=>g.dispose()) },[built,geometry])
  useFrame(() => { if(coverage.current)coverage.current.visible=sensors&&clock.current.time >= start&&clock.current.time<end })
  const color = device.id==='camera'?'#b5d4d8':'#dfbe8b'
  return <>
    <group name={`estate-${device.id}-mount`}><Parts parts={built.mount} /></group>
    <group name={`estate-${device.id}-device`} position={device.position} quaternion={direction}><Parts parts={built.body} /></group>
    <group ref={coverage} name={`estate-${device.id}-sector`} visible={false}>
      <mesh geometry={geometry.fill}><meshBasicMaterial color={color} transparent opacity={.07} depthWrite={false} /></mesh>
      <lineLoop geometry={geometry.outline}><lineBasicMaterial color={color} transparent opacity={.30} depthWrite={false} /></lineLoop>
      <lineSegments geometry={geometry.rays}><lineBasicMaterial color={color} transparent opacity={.24} depthWrite={false} /></lineSegments>
    </group>
  </>
}
