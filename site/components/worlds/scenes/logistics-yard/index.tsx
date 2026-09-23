'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry, DataTexture, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, LinearFilter,
  Object3D, RGBAFormat,
} from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { mix, progress, seeded, smooth } from '../../math'
import { definition } from './content'
import { cargo, makeContainer, makeGantry, makeMaterials, makePerson, makeSite, makeSpreader, makeTractor, makeTrailer, makeTrolley, makeWheel, type Finish, type Part } from './geometry'

/** Travel in metres is sampled from authored time, never integrated across frames. */
export function vehicleX(t: number) {
  if (t < 4) return mix(-20, -15, progress(t, 0, 4))
  if (t < 18) return mix(-15, 7.4, progress(t, 4, 18))
  return mix(7.4, 13.6, 1 - (1 - progress(t, 18, 25)) ** 2)
}
function Parts({ parts }: { parts: Part[] }) {
  return <>{parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow dispose={null} />)}</>
}
function Batch({ parts, positions }: { parts: Part[]; positions: Vec3[] }) {
  const refs = useRef<(InstancedMesh | null)[]>([])
  useLayoutEffect(() => {
    const obj = new Object3D()
    refs.current.forEach(mesh => {
      if (!mesh) return
      positions.forEach((p, i) => { obj.position.set(...p); obj.updateMatrix(); mesh.setMatrixAt(i, obj.matrix) })
      mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere()
    })
    const mounted = refs.current.filter((mesh): mesh is InstancedMesh => mesh !== null)
    return () => mounted.forEach(mesh => mesh.dispose())
  }, [positions, parts])
  return <>{parts.map((p, i) => <instancedMesh key={i} ref={r => { refs.current[i] = r }} args={[p.geometry, p.material, positions.length]} castShadow receiveShadow dispose={null} />)}</>
}
function makeContactTexture() {
  const data = new Uint8Array(64 * 64 * 4)
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const i = (y * 64 + x) * 4, u = (x / 63 - .5) * 2, v = (y / 63 - .5) * 2
    data[i] = data[i + 1] = data[i + 2] = 255
    data[i + 3] = Math.round(Math.exp(-5 * (u ** 6 + v ** 6)) * 255)
  }
  const t = new DataTexture(data, 64, 64, RGBAFormat); t.magFilter = t.minFilter = LinearFilter; t.needsUpdate = true
  return t
}
function Contacts({ texture, items, opacity = .33 }: { texture: DataTexture; items: { p: Vec3; size: [number, number] }[]; opacity?: number }) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const obj = new Object3D(); obj.rotation.x = -Math.PI / 2
    items.forEach((v, i) => { obj.position.set(...v.p); obj.scale.set(v.size[0], v.size[1], 1); obj.updateMatrix(); ref.current!.setMatrixAt(i, obj.matrix) })
    ref.current!.instanceMatrix.needsUpdate = true; ref.current!.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} args={[undefined, undefined, items.length]}><planeGeometry /><meshBasicMaterial color="#27323a" map={texture} transparent opacity={opacity} depthWrite={false} /></instancedMesh>
}
function Grasses({ high }: { high: boolean }) {
  const ref = useRef<InstancedMesh>(null), count = high ? 480 : 230
  const geometry = useMemo(() => {
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute([-.03, 0, 0, .03, 0, 0, .13, .43, 0, 0, 0, -.025, 0, 0, .025, -.16, .37, .06], 3)); g.computeVertexNormals(); return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useLayoutEffect(() => {
    const o = new Object3D()
    for (let i = 0; i < count; i++) { o.position.set(-34 + seeded(i * 7 + 2) * 73, .32, 11.1 + seeded(i * 7 + 3) * 3.5); o.rotation.y = seeded(i * 7 + 4) * 6.28; o.scale.setScalar(.7 + seeded(i * 7 + 5) * 1.4); o.updateMatrix(); ref.current!.setMatrixAt(i, o.matrix) }
    ref.current!.instanceMatrix.needsUpdate = true; ref.current!.computeBoundingSphere()
  }, [count])
  return <instancedMesh ref={ref} args={[geometry, undefined, count]} receiveShadow><meshStandardMaterial color="#909574" side={DoubleSide} roughness={1} /></instancedMesh>
}
function Observations({ clock }: { clock: WorldProps['clock'] }) {
  const camera = useRef<Group>(null), radar = useRef<Group>(null), record = useRef<Group>(null)
  const lines = useMemo(() => Array.from({ length: 3 }, () => {
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(new Float32Array(6), 3)); return g
  }), [])
  useEffect(() => () => lines.forEach(g => g.dispose()), [lines])
  useFrame(() => {
    const t = clock.current.time, x = vehicleX(t)
    camera.current!.visible = t >= 4 && t < 18; radar.current!.visible = t >= 11 && t < 42; record.current!.visible = t >= 18
    const ends: [Vec3, Vec3][] = [ [[-23.8, 5.58, 12], [x - 4, 3.85, 0]], [[16.4, 4.92, -4.65], [x + .5, 1.9, 0]], [[24, 2, -5.5], [17.8, 1.96, -3.23]] ]
    lines.forEach((g, i) => { const p = g.attributes.position; p.setXYZ(0, ...ends[i][0]); p.setXYZ(1, ...ends[i][1]); p.needsUpdate = true; g.computeBoundingSphere() })
  })
  return <>
    <group ref={camera} visible={false}><lineSegments geometry={lines[0]}><lineBasicMaterial color="#dcd7bd" transparent opacity={.65} depthWrite={false} /></lineSegments><mesh position={[-23.8, 5.58, 12]}><sphereGeometry args={[.12, 8, 6]} /><meshBasicMaterial color="#ece4c5" /></mesh></group>
    <group ref={radar} visible={false}><lineSegments geometry={lines[1]}><lineBasicMaterial color="#a8c4ca" transparent opacity={.58} depthWrite={false} /></lineSegments><mesh position={[16.4, 4.92, -4.65]}><sphereGeometry args={[.12, 8, 6]} /><meshBasicMaterial color="#adced4" /></mesh></group>
    <group ref={record} visible={false}><lineSegments geometry={lines[2]}><lineBasicMaterial color="#dec391" transparent opacity={.7} depthWrite={false} /></lineSegments></group>
  </>
}
const wheelPositions: Vec3[] = [-1.38, 1.22, -7.65, -6.35].flatMap(x => [[x, .64, -1.19], [x, .64, 1.19]] as Vec3[])
const cargoColors: Finish[] = ['blue', 'rust', 'orange', 'teal', 'sand']
const placements = cargoColors.map(c => cargo.filter(v => v.c === c).map(v => v.p))
const staticContacts = [
  ...cargo.filter(v => v.p[1] < 1).map(v => ({ p: [v.p[0], .057, v.p[2]] as Vec3, size: [13, 3.4] as [number, number] })),
  { p: [26, .072, -8] as Vec3, size: [14.5, 9.4] as [number, number] },
  ...[-21, 5.9].map(z => ({ p: [-20, .075, z] as Vec3, size: [12, 2.4] as [number, number] })),
]
const vehicleContacts = [{ p: [-3.05, .084, 0] as Vec3, size: [12.5, 3.6] as [number, number] }]

function World({ clock, quality, layers }: WorldProps) {
  const high = quality === 'high'
  const m = useMemo(makeMaterials, [])
  const contact = useMemo(makeContactTexture, [])
  const built = useMemo(() => ({
    site: makeSite(m, high), gantry: makeGantry(m, high), trolley: makeTrolley(m, high), spreader: makeSpreader(m, high),
    tractor: makeTractor(m, high), trailer: makeTrailer(m, high), wheel: makeWheel(m, high), person: makePerson(m, high),
    load: makeContainer(m, high, 'orange', 6.1), containers: cargoColors.map(c => makeContainer(m, high, c)),
  }), [m, high])
  useEffect(() => () => {
    const parts = [...built.site, ...built.gantry, ...built.trolley, ...built.spreader, ...built.tractor, ...built.trailer, ...built.wheel, ...built.person, ...built.load, ...built.containers.flat()]
    parts.forEach(p => p.geometry.dispose())
  }, [built])
  useEffect(() => () => { contact.dispose(); Object.values(m).forEach(v => { v.map?.dispose(); v.dispose() }) }, [contact, m])
  const vehicle = useRef<Group>(null), trailer = useRef<Group>(null), wheels = useRef<(Group | null)[]>([])
  const trolley = useRef<Group>(null), spreader = useRef<Group>(null), cables = useRef<Group>(null)
  const person = useRef<Group>(null), marker = useRef<Group>(null), hold = useRef<Group>(null), brake = useRef<Group>(null), recorded = useRef<Group>(null)
  useFrame(() => {
    const t = clock.current.time, x = vehicleX(t), arrival = smooth(progress(t, 0, 7))
    vehicle.current!.position.set(x, 0, .35 * (1 - arrival))
    trailer.current!.rotation.y = -.025 * (1 - arrival)
    wheels.current.forEach(w => { if (w) w.rotation.z = -(x + 20) / .59 })
    const z = mix(-16, -13.4, smooth(progress(t, 6, 10))), y = mix(5.1, 10.2, smooth(progress(t, 0, 6)))
    trolley.current!.position.z = z; spreader.current!.position.set(0, y, z)
    cables.current!.position.set(0, y, z); cables.current!.scale.y = 17.5 - y
    const p = smooth(progress(t, 27, 34)), walk = t > 27 && t < 34 ? Math.sin(t * 7) : 0
    person.current!.position.set(mix(20.7, 17.9, p), mix(.46, .06, Math.min(1, p * 2)) + Math.abs(walk) * .026, mix(-6.5, -2.1, p))
    person.current!.rotation.set(0, mix(-.56, -.96, p), walk * .025)
    hold.current!.visible = t >= 27; brake.current!.visible = t >= 20; recorded.current!.visible = t >= 42
    if (marker.current) { marker.current.visible = t >= 4; marker.current.position.set(x - 3.2, .09, .35 * (1 - arrival)) }
  })
  return <group>
    <Parts parts={built.site} /><Parts parts={built.gantry} />
    {built.containers.map((parts, i) => <Batch key={cargoColors[i]} parts={parts} positions={placements[i]} />)}
    <Contacts texture={contact} items={staticContacts} opacity={high ? .19 : .32} /><Grasses high={high} />
    <group ref={trolley} position={[0, 0, -16]}><Parts parts={built.trolley} /></group>
    <group ref={spreader} position={[0, 5.1, -16]}><Parts parts={built.spreader} /></group>
    <group ref={cables} position={[0, 5.1, -16]} scale={[1, 12.4, 1]}>
      {[-22.1, -17.9].flatMap(x => [-.8, .8].map(z => <mesh key={`${x}-${z}`} position={[x, .5, z]} castShadow><boxGeometry args={[.028, 1, .028]} /><meshStandardMaterial color="#394951" metalness={.5} roughness={.45} /></mesh>))}
    </group>
    <group ref={vehicle} position={[-20, 0, .35]}>
      <Parts parts={built.tractor} />
      <group ref={trailer} position={[-1.5, 0, 0]}><group position={[1.5, 0, 0]}><Parts parts={built.trailer} /><group position={[-5.3, 1.43, 0]}><Parts parts={built.load} /></group>{wheelPositions.slice(4).map((p, i) => <group key={i} position={p}><group ref={w => { wheels.current[i + 4] = w }}><Parts parts={built.wheel} /></group></group>)}</group></group>
      {wheelPositions.slice(0, 4).map((p, i) => <group key={i} position={p}><group ref={w => { wheels.current[i] = w }}><Parts parts={built.wheel} /></group></group>)}
      <Contacts texture={contact} items={vehicleContacts} opacity={.39} />
      <group ref={brake} visible={false}>{[-.9, .9].map(z => <mesh key={z} position={[-8.65, 1.13, z]}><boxGeometry args={[.018, .13, .28]} /><meshBasicMaterial color="#d68655" /></mesh>)}</group>
      <mesh position={[.7, 3.52, -.18]}><cylinderGeometry args={[.105, .105, .16, 12]} /><meshStandardMaterial color="#e8b76d" emissive="#e8b76d" emissiveIntensity={.22} roughness={.3} /></mesh>
    </group>
    <group ref={person} position={[20.7, .46, -6.5]}><Parts parts={built.person} /><mesh position={[0, .025, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.15, .8]} /><meshBasicMaterial color="#29363a" map={contact} transparent opacity={.35} depthWrite={false} /></mesh></group>
    <group ref={hold} visible={false}><mesh position={[17.8, 2.21, -3.24]}><boxGeometry args={[.31, .065, .02]} /><meshBasicMaterial color="#e5b361" /></mesh><mesh position={[22.1, 1.92, -4.1]}><sphereGeometry args={[.115, 12, 8]} /><meshBasicMaterial color="#dcb074" /></mesh></group>
    <group ref={recorded} visible={false}><mesh position={[17.8, 1.94, -3.226]}><boxGeometry args={[.25, .11, .012]} /><meshBasicMaterial color="#d6caa8" /></mesh></group>
    {layers.tracks && <group ref={marker} visible={false}><mesh rotation={[-Math.PI / 2, 0, 0]} scale={[2.8, 1, 1]}><ringGeometry args={[1.92, 1.945, 64]} /><meshBasicMaterial color="#debb7c" transparent opacity={.68} depthWrite={false} /></mesh></group>}
    {layers.sensors && <Observations clock={clock} />}
    <pointLight position={[20.7, 3.12, -5.2]} color="#ffcc8d" intensity={high ? 10 : 7} distance={7} decay={2} />
    {high && <pointLight position={[-22.3, 14.9, 6.8]} color="#ffdaa5" intensity={5} distance={5} decay={2} />}
  </group>
}
const scene: SceneModule = { definition, World }
export default scene
