'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CatmullRomCurve3, Color, DataTexture, Float32BufferAttribute, Group, InstancedMesh, LinearFilter, Object3D, PlaneGeometry, RGBAFormat, Vector3 } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { mix, progress, seeded, smooth } from '../../math'
import { definition } from './content'
import { assembly, createMaterials, makeBoat, makePalm, makePerson, makeSite, type Part } from './geometry'
const approach = new CatmullRomCurve3([[10, 0, 23], [12, 0, 18], [14, 0, 12], [14.2, 0, 9]].map(p => new Vector3(...p)))
const welcome = new CatmullRomCurve3([[14.2, 0, 9], [10, 0, 9.5], [4, 0, 9.1], [.55, 0, 7.6], [.55, 0, 5.7]].map(p => new Vector3(...p)))
function vesselPose(t: number) {
  const returning = t > 29, curve = returning ? welcome : approach
  const u = returning ? smooth(progress(t, 29, 44)) : 1 - (1 - progress(t, 0, 24)) ** 1.35
  const p = curve.getPoint(u), d = curve.getTangent(u)
  return { p, heading: returning ? Math.atan2(d.x, d.z) : mix(Math.atan2(d.x, d.z), -Math.PI / 2, smooth(progress(t, 26, 29))) }
}
function Parts({ parts, shadow = true }: { parts: Part[]; shadow?: boolean }) { return <>{parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow={shadow} receiveShadow dispose={null} />)}</> }
function Palms({ parts }: { parts: Part[] }) {
  const refs = useRef<(InstancedMesh | null)[]>([])
  useLayoutEffect(() => {
    const placements = [[-29, -8.5, 1.03], [-25, -15, .94], [-16, -15, 1.1], [-12, -9.3, .83], [2, -16.7, 1.03], [13.7, -15, .85], [26, -15, 1.1]], d = new Object3D()
    refs.current.forEach(ref => { if (!ref) return; placements.forEach(([x, z, s], i) => { d.position.set(x, 1.23, z); d.scale.setScalar(s); d.rotation.y = i * 1.73; d.updateMatrix(); ref.setMatrixAt(i, d.matrix) }); ref.instanceMatrix.needsUpdate = true; ref.computeBoundingSphere() })
  }, [parts])
  return <>{parts.map((p, i) => <instancedMesh key={i} ref={el => { refs.current[i] = el }} args={[p.geometry, p.material, 7]} castShadow receiveShadow dispose={null} />)}</>
}
function contactTexture() {
  const data = new Uint8Array(64 * 64 * 4)
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const r = ((x - 31.5) / 31.5) ** 2 + ((y - 31.5) / 31.5) ** 2, i = (y * 64 + x) * 4; data.set([255, 255, 255, Math.round(Math.max(0, Math.exp(-r * 3) - .05) * 255)], i) }
  const tex = new DataTexture(data, 64, 64, RGBAFormat); tex.magFilter = tex.minFilter = LinearFilter; tex.needsUpdate = true; return tex
}
function Contact({ texture, position, size, opacity = .28 }: { texture: DataTexture; position: Vec3; size: [number, number]; opacity?: number }) { return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={size} /><meshBasicMaterial color="#193f3e" map={texture} transparent opacity={opacity} depthWrite={false} /></mesh> }
function waterGeometry() {
  const g = new PlaneGeometry(400, 340, 100, 85); g.rotateX(-Math.PI / 2)
  const p = g.attributes.position, colors: number[] = [], base = new Color('#397f7c')
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, -.025 + .013 * Math.sin(x * .65 + z * 1.2)); const v = .97 + .035 * Math.sin(x * .21 + z * .31) + .018 * Math.sin(z * 2); colors.push(base.r * v, base.g * v, base.b * v) }
  g.setAttribute('color', new Float32BufferAttribute(colors, 3)); g.computeVertexNormals(); return g
}
function Lines({ points, color, opacity = .5 }: { points: Vec3[]; color: string; opacity?: number }) {
  const g = useMemo(() => new BufferGeometry().setFromPoints(points.slice(1).flatMap((p, i) => [new Vector3(...points[i]), new Vector3(...p)])), [points])
  useEffect(() => () => g.dispose(), [g])
  return <lineSegments geometry={g}><lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} /></lineSegments>
}
function World({ clock, layers, quality }: WorldProps) {
  const high = quality === 'high', arrival = useRef<Group>(null), sail = useRef<Group>(null), moored = useRef<Group>(null), staff = useRef<Group>(null), arm = useRef<Group>(null), guest = useRef<Group>(null), wake = useRef<Group>(null), marker = useRef<Group>(null), sensors = useRef<Group>(null), warm = useRef<Group>(null), kayak = useRef<Group>(null)
  const m = useMemo(createMaterials, []), contact = useMemo(contactTexture, []), water = useMemo(waterGeometry, [])
  const site = useMemo(() => makeSite(m, high), [m, high]), launch = useMemo(() => makeBoat(m, high, 'arrival'), [m, high]), yacht = useMemo(() => makeBoat(m, high, 'sail'), [m, high]), cabin = useMemo(() => makeBoat(m, high, 'moored'), [m, high]), palms = useMemo(() => makePalm(m, high), [m, high]), attendant = useMemo(() => makePerson(m, high, true), [m, high]), visitor = useMemo(() => makePerson(m, high), [m, high])
  const misc = useMemo(() => { const a = assembly(m, high); for (let i = 0; i < (high ? 230 : 110); i++) { const x = -37 + seeded(i * 3) * 77, z = -1 + seeded(i * 3 + 1) * 48; a.box([x, .008, z], [.2 + seeded(i * 3 + 2) * 1.55, .003, .022 + seeded(i) * .023], 'teal', 0, [0, -.2, 0]) } return a.finish() }, [m, high])
  const rowboat = useMemo(() => { const a = assembly(m, high); a.box([0, .13, 0], [.62, .24, 3.2], 'amber', .25); a.box([0, .29, -.2], [.46, .12, .82], 'dark', .18); a.box([0, .61, -.25], [.32, .52, .26], 'ivory', .095); a.cylinder([0, 1, -.21], .13, .23, 'skin'); a.beam([-1, .57, .4], [1, .57, -.2], .025, 'timber'); a.box([-.92, .56, .38], [.38, .035, .17], 'ivory', .05); a.box([.92, .56, -.18], [.38, .035, .17], 'ivory', .05); return a.finish() }, [m, high])
  const seaArc = useMemo<Vec3[]>(() => Array.from({ length: 65 }, (_, i) => { const a = Math.PI * .82 + i / 64 * Math.PI * .96; return [22.3 + Math.cos(a) * 11.5, .09, 18 + Math.sin(a) * 11.5] }), [])
  const rim = useMemo<Vec3[]>(() => Array.from({ length: 65 }, (_, i) => { const a = i / 64 * Math.PI * 2; return [Math.cos(a) * 1.6, .06, Math.sin(a) * 3.4] }), [])
  const foam = useMemo<Vec3[]>(() => Array.from({ length: 65 }, (_, i) => { const x = -34 + i; return [x, .085, -12 + .0085 * x * x + 2.5] }), [])
  useEffect(() => () => { [site, launch, yacht, cabin, palms, attendant, visitor, misc, rowboat].flat().forEach(p => p.geometry.dispose()) }, [site, launch, yacht, cabin, palms, attendant, visitor, misc, rowboat])
  useEffect(() => () => { Object.values(m).forEach(mat => { mat.map?.dispose(); mat.dispose() }); contact.dispose(); water.dispose() }, [m, contact, water])
  useFrame(() => {
    const t = clock.current.time, pose = vesselPose(t)
    if (arrival.current) { arrival.current.position.set(pose.p.x, Math.sin(t * 1.5) * .035, pose.p.z); arrival.current.rotation.set(Math.sin(t * .9) * .009, pose.heading, Math.sin(t * 1.1) * .013) }
    if (sail.current) { sail.current.position.y = Math.sin(t * 1.2 + 1) * .037; sail.current.rotation.z = Math.sin(t * .85) * .008 }
    if (moored.current) { moored.current.position.y = Math.sin(t * 1.3 + 2) * .03; moored.current.rotation.z = Math.sin(t * .9 + 3) * .009 }
    if (wake.current) { wake.current.visible = clock.current.playing && (t < 23.5 || (t > 29.2 && t < 43.5)); wake.current.position.set(pose.p.x, .035, pose.p.z); wake.current.rotation.y = pose.heading; wake.current.scale.z = .92 + Math.sin(t * 2.2) * .045 }
    if (marker.current) { marker.current.visible = t >= 4 && t < 44; marker.current.position.set(pose.p.x, .035, pose.p.z); marker.current.rotation.y = pose.heading }
    if (sensors.current) sensors.current.visible = t >= 4 && t < 44
    if (warm.current) { warm.current.visible = t >= 12 && t < 28; warm.current.position.set(pose.p.x, .14, pose.p.z); warm.current.rotation.y = pose.heading }
    if (staff.current) { const p = smooth(progress(t, 28, 34)), q = smooth(progress(t, 32, 35)); staff.current.position.set(mix(-11, -2, p), .59, mix(3, 6, q)); staff.current.rotation.y = t < 33 ? Math.PI / 2 : .65; staff.current.rotation.z = t > 28 && t < 35 ? Math.sin(t * 8) * .02 : 0 }
    if (arm.current) arm.current.rotation.z = .15 + smooth(progress(t, 33, 36)) * 2.0
    if (guest.current) { guest.current.position.x = -22 + smooth(progress(t, 0, 18)) * 3; guest.current.position.z = -15 + .0085 * guest.current.position.x ** 2; guest.current.rotation.z = t < 18 ? Math.sin(t * 5) * .01 : 0 }
    if (kayak.current) { kayak.current.position.set(-24 + Math.sin(t * .03) * 1.5, Math.sin(t * 1.4) * .035, mix(10, 3, smooth(progress(t, 0, 26)))); kayak.current.rotation.y = -Math.PI + .15 }
  })
  return <group>
    <mesh geometry={water} receiveShadow><meshStandardMaterial vertexColors roughness={.43} metalness={.14} /></mesh>
    <Parts parts={site} /><Parts parts={misc} shadow={false} /><Palms parts={palms} /><Lines points={foam} color="#c1c9a5" opacity={.2} />
    <Contact texture={contact} position={[-8, 1.271, -16]} size={[15, 7]} opacity={.29} /><Contact texture={contact} position={[18, 1.691, -4]} size={[10, 5]} opacity={.25} />
    <Contact texture={contact} position={[-8, .03, 3]} size={[16, 3.3]} opacity={.23} /><Contact texture={contact} position={[-14, .029, -3]} size={[3.2, 14]} opacity={.2} /><Contact texture={contact} position={[-2, .028, 6]} size={[2.5, 6]} opacity={.22} />
    <group ref={arrival} position={[10, 0, 23]}><Parts parts={launch} /><Contact texture={contact} position={[0, .047, 0]} size={[3.3, 6.2]} opacity={.47} /></group>
    <group ref={sail} position={[-20, 0, 7.5]} rotation={[0, -.17, 0]}><Parts parts={yacht} /><Contact texture={contact} position={[0, .046, 0]} size={[3.6, 9.1]} opacity={.44} /></group>
    <group ref={moored} position={[-10.8, 0, 6.8]} rotation={[0, Math.PI, 0]}><Parts parts={cabin} /><Contact texture={contact} position={[0, .045, 0]} size={[2.9, 6.2]} opacity={.4} /></group>
    <group ref={kayak} position={[-24, 0, 10]}><Parts parts={rowboat} /><Contact texture={contact} position={[0, .04, 0]} size={[1.2, 3.8]} opacity={.28} /></group>
    <group ref={guest} position={[-22, 1.24, -10.886]}><Parts parts={visitor} /></group><group position={[-17.7, 1.24, -12.8]} rotation={[0, 1, 0]}><Parts parts={visitor} /></group>
    <group ref={staff} position={[-11, .59, 3]}><Parts parts={attendant} /><group ref={arm} position={[.21, 1.27, 0]}><mesh position={[.055, -.2, 0]} rotation={[0, 0, .15]} castShadow><capsuleGeometry args={[.06, .35, 3, 6]} /><meshStandardMaterial color="#bd9878" /></mesh></group></group>
    <group ref={wake} visible={false}>{[-1, 1].map(s => <mesh key={s} position={[s * 1.25, 0, -4.2]} rotation={[-Math.PI / 2, 0, s * .34]}><planeGeometry args={[.07, 4.3]} /><meshBasicMaterial color="#b8d2bd" transparent opacity={.55} depthWrite={false} /></mesh>)}</group>
    {layers.tracks && <group ref={marker} visible={false}><Lines points={rim} color="#e6c38c" opacity={.53} /></group>}
    {layers.sensors && <><group ref={sensors} visible={false}><Lines points={seaArc} color="#d4d6b8" opacity={.38} /></group><group ref={warm} visible={false}>{[-1, 1].map(s => <mesh key={s} position={[s * 1.38, .03, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.045, 3.5]} /><meshBasicMaterial color="#dfb67a" transparent opacity={.66} depthWrite={false} /></mesh>)}</group></>}
  </group>
}
const scene: SceneModule = { definition, World }
export default scene
