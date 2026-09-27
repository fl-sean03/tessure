'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CatmullRomCurve3, DataTexture, Float32BufferAttribute, Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Vector3 } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { Person } from './people'
import { Equipment } from './equipment'
import { visitorPosition, roles } from './motion'
import { Aircraft, Dock } from './aircraft'
import { Controls } from './controls'
import { connectionState, T } from './incident'
import { definition } from './content'
import { statusAtlas } from './status'
import { contactTexture, insulatorGeometry, makeSite, materials, scrubGeometry, scrubPlacements, terrain, type Part, type Placement } from './geometry'

function Parts({ parts, shadows = true }: { parts: Part[]; shadows?: boolean }) {
  return <>{parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow={shadows} receiveShadow dispose={null} />)}</>
}
function Repeat({ geometry, material, items, shadow = true }: { geometry: BufferGeometry; material: MeshStandardMaterial; items: Placement[]; shadow?: boolean }) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const o = new Object3D()
    items.forEach((p, i) => { o.position.set(...p.position); o.rotation.set(...(p.rotation || [0, 0, 0])); o.scale.set(...(p.scale || [1, 1, 1])); o.updateMatrix(); ref.current!.setMatrixAt(i, o.matrix) })
    ref.current!.instanceMatrix.needsUpdate = true; ref.current!.computeBoundingSphere()
    const mesh = ref.current; return () => { mesh?.dispose() }
  }, [items])
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={shadow} receiveShadow />
}
function Contact({ texture, position, size, opacity = 0.4 }: { texture: DataTexture; position: Vec3; size: [number, number]; opacity?: number }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={size} /><meshBasicMaterial color="#172b3b" map={texture} transparent opacity={opacity} depthWrite={false} /></mesh>
}
function Track({ clock }: { clock: WorldProps['clock'] }) {
  const ref = useRef<Group>(null)
  useFrame(() => { const t = clock.current.time; if (ref.current) { const p = visitorPosition(t); ref.current.position.set(p[0], p[1]+.01, p[2]); ref.current.visible = t >= T.detect && t < T.groundGone } })
  return <group ref={ref} visible={false}><mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.72, 0.753, 48]} /><meshBasicMaterial color="#e3bb7a" transparent opacity={0.7} depthWrite={false} /></mesh></group>
}
function ConnectionState({ clock, sensors }: { clock: WorldProps['clock']; sensors: boolean }) {
  const connected = useRef<Group>(null), queued = useRef<Group>(null), packet = useRef<Mesh>(null)
  const display = useMemo(statusAtlas, [])
  useEffect(() => () => display.dispose(), [display])
  const points = useMemo(() => new CatmullRomCurve3([new Vector3(15.5, 6.3, -0.8), new Vector3(18, 9, -3), new Vector3(24, 11, -7)]), [])
  const link = useMemo(() => new BufferGeometry().setFromPoints(points.getPoints(32)), [points])
  const continuous = useMemo(() => { const p = points.getPoints(32); return new BufferGeometry().setFromPoints(p.flatMap((v, i) => i < p.length - 1 ? [v, p[i + 1]] : [])) }, [points]), at = useMemo(() => new Vector3(), [])
  useEffect(() => () => { link.dispose(); continuous.dispose() }, [link, continuous])
  useFrame(() => {
    const t = clock.current.time, up = t < T.linkLoss || t >= T.linkReturn
    if (connected.current) connected.current.visible = sensors && up
    if (queued.current) queued.current.visible = sensors && !up
    const state = connectionState(t)
    display.offset.set((state % 2) * 0.5, state < 2 ? 0.5 : 0)
    if (packet.current) { points.getPoint((t * 0.22) % 1, at); packet.current.position.copy(at) }
  })
  return <group>
    <mesh name="remote-status-display" position={[8.8, 2.15, 6.767]}><planeGeometry args={[2.12, 1.59]} /><meshBasicMaterial map={display} toneMapped={false} /></mesh>
    <mesh name="local-power-lamp" position={[7.92, 1.1, 6.727]}><circleGeometry args={[0.065, 16]} /><meshBasicMaterial color="#bdd1d3" /></mesh>
    <group ref={connected} visible={false}><lineSegments geometry={continuous}><lineBasicMaterial color="#bdcdd9" transparent opacity={0.36} depthWrite={false} /></lineSegments><mesh ref={packet}><sphereGeometry args={[0.085, 8, 6]} /><meshBasicMaterial color="#c3d5df" /></mesh></group>
    <group ref={queued} visible={false}><lineSegments geometry={link}><lineBasicMaterial color="#cba674" transparent opacity={0.25} depthWrite={false} /></lineSegments>{[0, 1, 2].map(i => <mesh key={i} position={[9.55, 2.6 + i * 0.14, 6.2]}><boxGeometry args={[0.45, 0.045, 0.24]} /><meshBasicMaterial color="#d5b17f" transparent opacity={0.75} /></mesh>)}</group>
  </group>
}
function World({ clock, layers, quality }: WorldProps) {
  const high = quality === 'high', m = useMemo(materials, []), contact = useMemo(contactTexture, [])
  const site = useMemo(() => makeSite(m, high), [m, high]), land = useMemo(() => terrain(high), [high])
  const landMaterial = useMemo(() => { const v = m.earth.clone(); v.color.set('#ffffff'); v.vertexColors = true; return v }, [m])
  const porcelain = useMemo(() => insulatorGeometry(high), [high]), scrub = useMemo(scrubGeometry, []), plants = useMemo(() => scrubPlacements(high), [high])
  useEffect(() => () => site.parts.forEach(p => p.geometry.dispose()), [site])
  useEffect(() => () => { land.dispose(); porcelain.dispose() }, [land, porcelain])
  useEffect(() => () => { contact.dispose(); scrub.dispose(); landMaterial.dispose(); Object.values(m).forEach(v => { v.map?.dispose(); v.dispose() }) }, [m, contact, scrub, landMaterial])
  return <group name="critical-infrastructure-scene">
    <mesh geometry={land} material={landMaterial} receiveShadow /><Parts parts={site.parts} />
    <Repeat geometry={porcelain} material={m.porcelain} items={site.insulators} /><Repeat geometry={scrub} material={m.leaf} items={plants} shadow={false} />
    <Contact texture={contact} position={[-11.2, 0.239, -0.8]} size={[9.5, 8]} opacity={0.54} />
    <Contact texture={contact} position={[-1.4, 0.24, -0.8]} size={[9.5, 8]} opacity={0.54} />
    <Contact texture={contact} position={[13, 0.241, 1.3]} size={[11.7, 9]} opacity={0.42} />
    <Contact texture={contact} position={[-7.6, 0.242, -9]} size={[24, 4]} opacity={0.32} />
    <Contact texture={contact} position={[8.8, 0.464, 6.15]} size={[3.1, 2.2]} opacity={0.5} />
    {roles.map(role=><Person key={role} role={role} clock={clock} m={m} high={high} contact={contact}/>)}
    <Controls clock={clock} m={m} high={high}/><Dock clock={clock} m={m} high={high}/>
    {(['hostile-west','hostile-east','defender'] as const).map(role=><Aircraft key={role} role={role} clock={clock} m={m} high={high}/>)}
    <ConnectionState clock={clock} sensors={layers.sensors} />{layers.tracks && <Track clock={clock} />}
    <Equipment m={m} high={high} clock={clock} sensors={layers.sensors} />
    <pointLight position={[12.8, 2.9, 5.3]} color="#ffce86" intensity={high ? 30 : 24} distance={11} decay={2} />
    {high && <pointLight position={[-6.15, 5.7, 6.9]} color="#efd6af" intensity={17} distance={10} decay={2} />}
  </group>
}
const scene: SceneModule = { definition, World }
export default scene
