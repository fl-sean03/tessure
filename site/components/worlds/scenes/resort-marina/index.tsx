'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Color, DataTexture, Float32BufferAttribute, Group, InstancedMesh, LinearFilter, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, RGBAFormat, Vector3 } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { seeded } from '../../math'
import { definition } from './content'
import { assembly, createMaterials, makeBoat, makeOutboard, makePalm, makePerson, makeRestingKayak, makeShoe, makeSite, makeWalkerBody, mooringTies, type Part } from './geometry'
import { Parts, Walker } from './actors'
import { optics, makeOptic, makeRadarArray } from './devices'
import { vesselPose, wakePose, outboardYaw, radarPhase, radarPosition, restingPose } from './motion'
function Palms({ parts }: { parts: Part[] }) {
  const refs = useRef<(InstancedMesh | null)[]>([])
  useLayoutEffect(() => {
    const placements = [[-29, -8.5, 1.03], [-25, -15, .94], [-16, -15, 1.1], [-12, -9.3, .83], [2, -16.7, 1.03], [13.7, -15, .85], [26, -15, 1.1]], d = new Object3D()
    refs.current.forEach(ref => { if (!ref) return; placements.forEach(([x, z, s], i) => { d.position.set(x, 1.23, z); d.scale.setScalar(s); d.rotation.y = i * 1.73; d.updateMatrix(); ref.setMatrixAt(i, d.matrix) }); ref.instanceMatrix.needsUpdate = true; ref.computeBoundingSphere() })
  }, [parts])
  // R3F disposes each instanceMatrix buffer; World owns the shared part assets.
  return <>{parts.map((p, i) => <instancedMesh key={i} ref={el => { refs.current[i] = el }} args={[p.geometry, p.material, 7]} castShadow receiveShadow />)}</>
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
function Mooring({ craft, ties }: { craft: { current: Group | null }; ties: { local: Vec3; anchor: Vec3 }[] }) {
  const geometry = useMemo(() => new BufferGeometry().setAttribute('position', new Float32BufferAttribute(new Float32Array(ties.length * 12), 3)), [ties.length])
  const point = useMemo(() => new Vector3(), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(() => {
    if (!craft.current) return
    craft.current.updateMatrixWorld(true)
    const a = geometry.attributes.position
    ties.forEach((tie, i) => {
      point.set(...tie.local).applyMatrix4(craft.current!.matrixWorld)
      const midpoint = [(point.x + tie.anchor[0]) / 2, Math.min(point.y, tie.anchor[1]) - .09, (point.z + tie.anchor[2]) / 2]
      a.setXYZ(i * 4, point.x, point.y, point.z); a.setXYZ(i * 4 + 1, ...midpoint as Vec3); a.setXYZ(i * 4 + 2, ...midpoint as Vec3); a.setXYZ(i * 4 + 3, ...tie.anchor)
    }); a.needsUpdate = true; geometry.computeBoundingSphere()
  }, .5)
  return <lineSegments name="mooring-lines" geometry={geometry}><lineBasicMaterial color="#b9aa84" /></lineSegments>
}
function World({ clock, layers, quality }: WorldProps) {
  const high = quality === 'high', arrival = useRef<Group>(null), sail = useRef<Group>(null), moored = useRef<Group>(null), outboard = useRef<Group>(null), wake = useRef<Group>(null), wakeMeshes = useRef<(Mesh | null)[]>([]), marker = useRef<Group>(null), radar = useRef<Group>(null), sweep = useRef<Group>(null), sensorViews = useRef<Group>(null), kayak = useRef<Group>(null)
  const m = useMemo(createMaterials, []), contact = useMemo(contactTexture, []), water = useMemo(waterGeometry, [])
  const site = useMemo(() => makeSite(m, high), [m, high]), launch = useMemo(() => makeBoat(m, high, 'arrival'), [m, high]), motor = useMemo(() => makeOutboard(m, high), [m, high]), yacht = useMemo(() => makeBoat(m, high, 'sail'), [m, high]), cabin = useMemo(() => makeBoat(m, high, 'moored'), [m, high]), palms = useMemo(() => makePalm(m, high), [m, high]), attendant = useMemo(() => makeWalkerBody(m, high, true), [m, high]), walkingGuest = useMemo(() => makeWalkerBody(m, high, false), [m, high]), visitor = useMemo(() => makePerson(m, high), [m, high]), shoe = useMemo(() => makeShoe(m, high), [m, high]), rowboat = useMemo(() => makeRestingKayak(m, high), [m, high]), cameraParts = useMemo(() => makeOptic(m, high, false), [m, high]), thermalParts = useMemo(() => makeOptic(m, high, true), [m, high]), radarParts = useMemo(() => makeRadarArray(m, high), [m, high])
  const misc = useMemo(() => { const a = assembly(m, high); for (let i = 0; i < (high ? 230 : 110); i++) { const x = -37 + seeded(i * 3) * 77, z = -1 + seeded(i * 3 + 1) * 48; a.box([x, .008, z], [.2 + seeded(i * 3 + 2) * 1.55, .003, .022 + seeded(i) * .023], 'teal', 0, [0, -.2, 0]) } return a.finish() }, [m, high])
  const rim = useMemo<Vec3[]>(() => Array.from({ length: 65 }, (_, i) => { const a = i / 64 * Math.PI * 2; return [Math.cos(a) * 1.6, .06, Math.sin(a) * 3.4] }), [])
  const foam = useMemo<Vec3[]>(() => Array.from({ length: 65 }, (_, i) => { const x = -34 + i; return [x, .085, -12 + .0085 * x * x + 2.5] }), [])
  useEffect(() => () => { [site, launch, motor, yacht, cabin, palms, attendant, walkingGuest, visitor, shoe, rowboat, cameraParts, thermalParts, radarParts, misc].flat().forEach(p => p.geometry.dispose()) }, [site, launch, motor, yacht, cabin, palms, attendant, walkingGuest, visitor, shoe, rowboat, cameraParts, thermalParts, radarParts, misc])
  useEffect(() => () => { Object.values(m).forEach(mat => { mat.map?.dispose(); mat.dispose() }); contact.dispose(); water.dispose() }, [m, contact, water])
  useFrame(() => {
    const t = clock.current.time, pose = vesselPose(t), trail = wakePose(t)
    arrival.current!.position.set(pose.p.x, pose.heave, pose.p.z); arrival.current!.rotation.set(pose.pitch, pose.heading, pose.roll)
    outboard.current!.rotation.y = outboardYaw(t)
    for (const [ref, kind] of [[sail, 'sail'], [moored, 'moored'], [kayak, 'kayak']] as const) {
      const p = restingPose(t, kind); ref.current!.position.y = p.heave; ref.current!.rotation.x = p.pitch; ref.current!.rotation.z = p.roll
    }
    wake.current!.visible = trail.opacity > .0001; wake.current!.position.set(pose.p.x - Math.sin(pose.heading) * 3.05, .04, pose.p.z - Math.cos(pose.heading) * 3.05); wake.current!.rotation.y = pose.heading
    wakeMeshes.current.forEach((mesh, i) => { if (!mesh) return; const side = i ? 1 : -1; mesh.position.set(side * (.6 + trail.length * .14), 0, -trail.length * .5); mesh.scale.set(trail.width, trail.length, 1); (mesh.material as MeshBasicMaterial).opacity = trail.opacity })
    radar.current!.rotation.y = radarPhase(t)
    if (sweep.current) sweep.current.rotation.y = radarPhase(t)
    if (sensorViews.current) sensorViews.current.visible = t >= 12 && t < 20
    if (marker.current) { marker.current.visible = t >= 4 && t < 44; marker.current.position.set(pose.p.x, .035, pose.p.z); marker.current.rotation.y = pose.heading }
  })
  return <group name="marina-world">
    <mesh geometry={water} receiveShadow><meshStandardMaterial vertexColors roughness={.43} metalness={.14} /></mesh>
    <Parts parts={site} /><Parts parts={misc} shadow={false} /><Palms parts={palms} /><Lines points={foam} color="#c1c9a5" opacity={.2} />
    {optics.map((optic, i) => <group key={optic.id} name={optic.id} position={optic.position} rotation={[0, optic.yaw, 0]}><group rotation={[optic.pitch, 0, 0]}><Parts parts={i ? thermalParts : cameraParts} /></group></group>)}
    <group ref={radar} name="open-array-radar" position={radarPosition}><Parts parts={radarParts} /></group>
    <Contact texture={contact} position={[-8, 1.271, -16]} size={[15, 7]} opacity={.29} /><Contact texture={contact} position={[18, 1.691, -4]} size={[10, 5]} opacity={.25} />
    <Contact texture={contact} position={[-8, .03, 3]} size={[16, 3.3]} opacity={.23} /><Contact texture={contact} position={[-14, .029, -3]} size={[3.2, 14]} opacity={.2} /><Contact texture={contact} position={[-2, .028, 6]} size={[2.5, 6]} opacity={.22} />
    <group name="arrival" ref={arrival} position={[10, 0, 23]}><Parts parts={launch} /><group ref={outboard} name="arrival-outboard" position={[0, .37, -2.912]}><Parts parts={motor} /></group><Contact texture={contact} position={[0, .047, 0]} size={[3.3, 6.2]} opacity={.47} /></group>
    <group name="sailboat" ref={sail} position={[-20, 0, 7.5]} rotation={[0, -.17, 0]}><Parts parts={yacht} /><Contact texture={contact} position={[0, .046, 0]} size={[3.6, 9.1]} opacity={.44} /></group>
    <group name="moored-launch" ref={moored} position={[-10.8, 0, 7.3]} rotation={[0, Math.PI, 0]}><Parts parts={cabin} /><Contact texture={contact} position={[0, .045, 0]} size={[2.9, 6.2]} opacity={.4} /></group>
    <group name="resting-kayak" ref={kayak} position={[-16.9, 0, 6.6]}><Parts parts={rowboat} /><Contact texture={contact} position={[0, .04, 0]} size={[1.2, 3.8]} opacity={.28} /></group>
    <Mooring craft={sail} ties={mooringTies.sail} />
    <Mooring craft={moored} ties={mooringTies.moored} />
    <Mooring craft={kayak} ties={mooringTies.kayak} />
    <Walker clock={clock} staff body={attendant} shoe={shoe} m={m} contact={contact} /><Walker clock={clock} body={walkingGuest} shoe={shoe} m={m} contact={contact} />
    <group position={[-17.7, 2.005, -12.8]} rotation={[0, 1, 0]}><Parts parts={visitor} /></group>
    <group name="vessel-wake" ref={wake}>{[-1, 1].map((side, i) => <mesh key={side} ref={o => { wakeMeshes.current[i] = o }} rotation={[-Math.PI / 2, 0, side * .28]}><planeGeometry /><meshBasicMaterial color="#b8d2bd" transparent opacity={0} depthWrite={false} /></mesh>)}</group>
    {layers.tracks && <group ref={marker} visible={false}><Lines points={rim} color="#e6c38c" opacity={.53} /></group>}
    {layers.sensors && <>
      <group name="radar-direction-illustration" ref={sweep} position={radarPosition}><Lines points={[[0, .18, .2], [0, .18, 2.3]]} color="#e6c38c" opacity={.36} /></group>
      <group ref={sensorViews}>{optics.map((o, i) => <Lines key={o.id} points={[o.sector[0], o.lens, o.sector[1]]} color={i ? '#d5ac73' : '#a9c4bd'} opacity={.24} />)}</group>
    </>}
  </group>
}
const scene: SceneModule = { definition, World }
export default scene
