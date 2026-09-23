'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CatmullRomCurve3, DataTexture, Float32BufferAttribute, Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Vector3 } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { mix, progress, samplePath, smooth } from '../../math'
import { definition } from './content'
import { contactTexture, insulatorGeometry, makePerson, makeSite, materials, scrubGeometry, scrubPlacements, terrain, type Part, type Placement, type Materials } from './geometry'

function Parts({ parts, shadows = true }: { parts: Part[]; shadows?: boolean }) {
  return <>{parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow={shadows} receiveShadow />)}</>
}
function Repeat({ geometry, material, items, shadow = true }: { geometry: BufferGeometry; material: MeshStandardMaterial; items: Placement[]; shadow?: boolean }) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const o = new Object3D()
    items.forEach((p, i) => { o.position.set(...p.position); o.rotation.set(...(p.rotation || [0, 0, 0])); o.scale.set(...(p.scale || [1, 1, 1])); o.updateMatrix(); ref.current!.setMatrixAt(i, o.matrix) })
    ref.current!.instanceMatrix.needsUpdate = true; ref.current!.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={shadow} receiveShadow />
}
function Contact({ texture, position, size, opacity = 0.4 }: { texture: DataTexture; position: Vec3; size: [number, number]; opacity?: number }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={size} /><meshBasicMaterial color="#172b3b" map={texture} transparent opacity={opacity} depthWrite={false} /></mesh>
}
export function visitorPosition(t: number): Vec3 {
  const x = t <= 4 ? mix(-15, -10, progress(t, 0, 4)) : t <= 12 ? mix(-10, -4, progress(t, 4, 12)) : t <= 20 ? mix(-4, 4, progress(t, 12, 20)) : mix(4, 9, smooth(progress(t, 20, 28)))
  return [x, -0.018, 14.1]
}
function Person({ role, clock, m, high, contact }: { role: 'visitor' | 'guard' | 'operator' | 'technician'; clock: WorldProps['clock']; m: Materials; high: boolean; contact: DataTexture }) {
  const root = useRef<Group>(null), leftArm = useRef<Group>(null), rightArm = useRef<Group>(null), leftLeg = useRef<Group>(null), rightLeg = useRef<Group>(null)
  const parts = useMemo(() => makePerson(m, high, role === 'operator' ? 'technician' : role), [m, high, role])
  useEffect(() => () => { [...parts.body, ...parts.arm, ...parts.leg].forEach(p => p.geometry.dispose()) }, [parts])
  useFrame(() => {
    const t = clock.current.time
    let position: Vec3, heading = 0, stride = 0, gesture = 0
    if (role === 'visitor') {
      position = visitorPosition(t); heading = t < 28 ? Math.PI / 2 : mix(Math.PI / 2, Math.PI, smooth(progress(t, 28, 31)))
      stride = t < 27.9 ? Math.sin(t * 6) * 0.43 * (1 - smooth(progress(t, 25, 28))) : 0
    } else if (role === 'guard') {
      position = samplePath([{ at: 0, position: [16.4, 0.48, 6] }, { at: 29, position: [16.4, 0.48, 6] }, { at: 33, position: [11.6, 0.25, 7.8] }, { at: 38, position: [11.2, 0.24, 10.7] }], t)
      position[1] = position[2] < 7.47 ? 0.46 : position[2] < 8.05 ? 0.34 : 0.24
      heading = t <= 29 ? -Math.PI / 2 : t < 33 ? -1.19 : t < 38 ? -0.14 : -0.43
      stride = t > 29 && t < 38 ? Math.sin((t - 29) * 6.2) * 0.44 * Math.min(progress(t, 29, 29.4), 1 - progress(t, 37.6, 38)) : 0
      gesture = smooth(progress(t, 38, 39.4)) * 0.72
    } else if (role === 'operator') {
      position = [10.65, 0.46, 6.6]; heading = t < 29 ? -Math.PI / 2 : mix(-Math.PI / 2, 1.3, smooth(progress(t, 29, 31))); gesture = 0.56 + smooth(progress(t, 29, 31)) * 0.5
    } else {
      position = [mix(-4.2, -7.6, smooth(progress(t, 0, 4))), 0.25, 6.0]; heading = -Math.PI / 2
      stride = t < 4 ? Math.sin(t * 5.9) * 0.38 * (1 - progress(t, 3.5, 4)) : 0; gesture = smooth(progress(t, 4, 6)) * 0.48
    }
    if (root.current) { root.current.position.set(...position); root.current.rotation.y = heading }
    if (leftLeg.current) leftLeg.current.rotation.x = stride
    if (rightLeg.current) rightLeg.current.rotation.x = -stride
    if (leftArm.current) { leftArm.current.rotation.x = -stride * 0.65 - (role === 'operator' ? 0.5 : 0); leftArm.current.rotation.z = role === 'operator' ? -0.1 : 0 }
    if (rightArm.current) { rightArm.current.rotation.x = stride * 0.65 - gesture; rightArm.current.rotation.z = gesture * 0.2 }
  })
  return <group ref={root}>
    <Parts parts={parts.body} />
    <group ref={leftArm} position={[-0.28, 1.4, 0]}><Parts parts={parts.arm} /></group>
    <group ref={rightArm} position={[0.28, 1.4, 0]}><Parts parts={parts.arm} />{role === 'guard' && <mesh position={[0, -0.44, 0.05]} castShadow><boxGeometry args={[0.08, 0.15, 0.06]} /><meshStandardMaterial color="#243746" /></mesh>}</group>
    <group ref={leftLeg} position={[-0.115, 0.9, 0]}><Parts parts={parts.leg} /></group>
    <group ref={rightLeg} position={[0.115, 0.9, 0]}><Parts parts={parts.leg} /></group>
    {role === 'operator' && <group position={[-0.11, 1.05, 0.4]} rotation={[-0.55, 0, 0]}><mesh castShadow><boxGeometry args={[0.34, 0.24, 0.028]} /><meshStandardMaterial color="#273d49" /></mesh><mesh position={[0, 0, 0.018]}><planeGeometry args={[0.28, 0.18]} /><meshBasicMaterial color="#93b2b9" /></mesh></group>}
    <Contact texture={contact} position={[0, 0.012, 0]} size={[0.95, 0.85]} opacity={0.44} />
  </group>
}
function Track({ clock }: { clock: WorldProps['clock'] }) {
  const ref = useRef<Group>(null)
  useFrame(() => { const t = clock.current.time; if (ref.current) { const p = visitorPosition(t); ref.current.position.set(p[0], -0.004, p[2]); ref.current.visible = t >= 4 } })
  return <group ref={ref} visible={false}><mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.72, 0.753, 48]} /><meshBasicMaterial color="#e3bb7a" transparent opacity={0.7} depthWrite={false} /></mesh></group>
}
function Observation({ from, clock, start, local = false, color }: { from: Vec3; clock: WorldProps['clock']; start: number; local?: boolean; color: string }) {
  const root = useRef<Group>(null), packet = useRef<Mesh>(null)
  const geometry = useMemo(() => { const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(new Float32Array(33 * 3), 3)); return g }, [])
  const curve = useMemo(() => new CatmullRomCurve3([new Vector3(...from), new Vector3(), new Vector3()]), [from[0], from[1], from[2]])
  const point = useMemo(() => new Vector3(), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(() => {
    const t = clock.current.time; if (root.current) root.current.visible = t >= start
    const p = local ? [8.8, 2.55, 6.15] : visitorPosition(t)
    curve.points[2].set(p[0], local ? p[1] : 1.2, p[2]); curve.points[1].set((from[0] + p[0]) / 2, Math.max(from[1], p[1]) + (local ? 1.3 : 0.8), (from[2] + p[2]) / 2)
    for (let i = 0; i <= 32; i++) { curve.getPoint(i / 32, point); geometry.attributes.position.setXYZ(i, point.x, point.y, point.z) }
    geometry.attributes.position.needsUpdate = true; geometry.computeBoundingSphere()
    if (packet.current) { curve.getPoint(Math.max(0, (t - start) * 0.26) % 1, point); packet.current.position.copy(point) }
  })
  return <group ref={root} visible={false}><lineSegments geometry={geometry}><lineBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} /></lineSegments><mesh ref={packet}><sphereGeometry args={[0.055, 8, 6]} /><meshBasicMaterial color={color} /></mesh></group>
}
function ConnectionState({ clock, sensors }: { clock: WorldProps['clock']; sensors: boolean }) {
  const connected = useRef<Group>(null), queued = useRef<Group>(null), record = useRef<Group>(null), lamp = useRef<MeshBasicMaterial>(null), bars = useRef<MeshBasicMaterial>(null), packet = useRef<Mesh>(null)
  const points = useMemo(() => new CatmullRomCurve3([new Vector3(15.5, 6.3, -0.8), new Vector3(18, 9, -3), new Vector3(24, 11, -7)]), [])
  const link = useMemo(() => new BufferGeometry().setFromPoints(points.getPoints(32)), [points])
  const continuous = useMemo(() => { const p = points.getPoints(32); return new BufferGeometry().setFromPoints(p.flatMap((v, i) => i < p.length - 1 ? [v, p[i + 1]] : [])) }, [points]), at = useMemo(() => new Vector3(), [])
  useEffect(() => () => { link.dispose(); continuous.dispose() }, [link, continuous])
  useFrame(() => {
    const t = clock.current.time, up = t < 4 || t >= 46
    if (connected.current) connected.current.visible = sensors && up
    if (queued.current) queued.current.visible = sensors && !up
    if (record.current) record.current.visible = t >= 20
    if (lamp.current) lamp.current.color.set(up ? '#a8c8d5' : '#d4a160')
    if (bars.current) bars.current.color.set(t >= 46 ? '#b9d0da' : '#cda56d')
    if (packet.current) { points.getPoint((t * 0.22) % 1, at); packet.current.position.copy(at) }
  })
  return <group>
    <mesh position={[8.58, 2.42, 6.7]}><circleGeometry args={[0.046, 12]} /><meshBasicMaterial color="#bdd1d3" /></mesh>
    <mesh position={[8.96, 2.42, 6.7]}><circleGeometry args={[0.052, 12]} /><meshBasicMaterial ref={lamp} color="#a8c8d5" /></mesh>
    <group ref={record} position={[8.8, 1.72, 6.71]} visible={false}>
      <mesh><boxGeometry args={[0.7, 0.04, 0.014]} /><meshBasicMaterial ref={bars} color="#cda56d" /></mesh>
      <mesh position={[0, -0.115, 0]}><boxGeometry args={[0.7, 0.04, 0.014]} /><meshBasicMaterial color="#b2c6c8" /></mesh>
      <mesh position={[0, -0.23, 0]}><boxGeometry args={[0.48, 0.04, 0.014]} /><meshBasicMaterial color="#b2c6c8" /></mesh>
    </group>
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
  return <group>
    <mesh geometry={land} material={landMaterial} receiveShadow /><Parts parts={site.parts} />
    <Repeat geometry={porcelain} material={m.porcelain} items={site.insulators} /><Repeat geometry={scrub} material={m.leaf} items={plants} shadow={false} />
    <Contact texture={contact} position={[-11.2, 0.239, -0.8]} size={[9.5, 8]} opacity={0.54} />
    <Contact texture={contact} position={[-1.4, 0.24, -0.8]} size={[9.5, 8]} opacity={0.54} />
    <Contact texture={contact} position={[13, 0.241, 1.3]} size={[11.7, 9]} opacity={0.42} />
    <Contact texture={contact} position={[-7.6, 0.242, -9]} size={[24, 4]} opacity={0.32} />
    <Contact texture={contact} position={[8.8, 0.464, 6.15]} size={[1.9, 2]} opacity={0.5} />
    <Person role="visitor" clock={clock} m={m} high={high} contact={contact} /><Person role="guard" clock={clock} m={m} high={high} contact={contact} />
    <Person role="operator" clock={clock} m={m} high={high} contact={contact} /><Person role="technician" clock={clock} m={m} high={high} contact={contact} />
    <ConnectionState clock={clock} sensors={layers.sensors} />{layers.tracks && <Track clock={clock} />}
    {layers.sensors && <>
      <Observation from={[3.5, 1.6, 10.5]} clock={clock} start={4} color="#c9b08a" />
      <Observation from={[-6.23, 3.85, 10.8]} clock={clock} start={12} color="#a8c2d7" />
      <Observation from={[12.87, 3.85, 10.8]} clock={clock} start={12} color="#d8c3a1" />
      <Observation from={[3.5, 1.6, 10.5]} clock={clock} start={20} color="#c9b08a" local />
      <Observation from={[-6.23, 3.85, 10.8]} clock={clock} start={20} color="#a8c2d7" local />
      <Observation from={[12.87, 3.85, 10.8]} clock={clock} start={20} color="#d8c3a1" local />
    </>}
    <pointLight position={[12.8, 2.9, 5.3]} color="#ffce86" intensity={high ? 30 : 24} distance={11} decay={2} />
    {high && <pointLight position={[-6.15, 5.7, 6.9]} color="#efd6af" intensity={17} distance={10} decay={2} />}
  </group>
}
const scene: SceneModule = { definition, World }
export default scene
