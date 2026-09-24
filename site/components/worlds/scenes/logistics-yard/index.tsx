'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry, DataTexture, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, LinearFilter,
  Object3D, RGBAFormat, Mesh, Vector3, Raycaster, Color,
} from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { seeded } from '../../math'
import { definition } from './content'
import { supervisorPose, supervisorRig } from './supervisor'
import { crane, dock, dronePose, droneTimes, gimbalMount, inSector, rotorCenters, sensorFrame, sensors, sensorSubject, trolleyPose, vehicleX } from './motion'
import { cargo, makeContainer, makeGantry, makeMaterials, makePerson, makeSite, makeSpreader, makeSupervisorShoe, makeTractor, makeTrailer, makeTrolley, makeWheel, makeTrolleyWheel, makeDockCover, makeDrone, makeDroneRotor, makeDroneGimbal, type Finish, type Part } from './geometry'

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
/** Small moving instance batches retain real blade/wheel/cover transforms without extra per-item calls. */
function MovingParts({ parts, clock, kind }: { parts: Part[]; clock: WorldProps['clock']; kind: 'rotors' | 'trolley' | 'covers' }) {
  const refs = useRef<(InstancedMesh | null)[]>([]), object = useMemo(() => new Object3D(), [])
  const positions: Vec3[] = kind === 'rotors' ? rotorCenters : kind === 'trolley' ? [-22.3, -17.7].flatMap(x => [-.98, .98].map(z => [x, crane.wheelY, z] as Vec3)) : [[-.725, dock.coverY, 0], [.725, dock.coverY, 0]]
  useLayoutEffect(() => { const mounted = refs.current.filter((v): v is InstancedMesh => v !== null); return () => mounted.forEach(mesh => mesh.dispose()) }, [parts])
  useFrame(() => {
    const t = clock.current.time, drone = kind === 'trolley' ? null : dronePose(t), trolley = kind === 'trolley' ? trolleyPose(t) : null
    positions.forEach((p, i) => {
      object.position.set(...p); object.rotation.set(0, 0, 0)
      if (kind === 'rotors') object.rotation.y = drone!.rotor * (i === 0 || i === 3 ? 1 : -1)
      if (kind === 'trolley') object.rotation.x = trolley!.wheelAngle
      if (kind === 'covers') object.position.x += Math.sign(p[0]) * dock.coverTravel * drone!.cover
      object.updateMatrix(); refs.current.forEach(mesh => mesh?.setMatrixAt(i, object.matrix))
    })
    refs.current.forEach(mesh => { if (mesh) { mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere() } })
  })
  return <>{parts.map((p, i) => <instancedMesh key={i} name={`${kind}-${i}`} ref={v => { refs.current[i] = v }} args={[p.geometry, p.material, positions.length]} castShadow={kind !== 'rotors'} receiveShadow dispose={null} />)}</>
}
function Observations({ clock, gantry }: { clock: WorldProps['clock']; gantry: Part[] }) {
  const data = useMemo(() => {
    const geometry = new BufferGeometry(), positions = new Float32Array(600), colors = new Float32Array(600)
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3)); geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
    const blockers = gantry.map(p => { const mesh = new Mesh(p.geometry, p.material); mesh.updateMatrixWorld(); return mesh })
    return { geometry, ray: new Raycaster(), blockers, object: new Object3D(), point: new Vector3(), origin: new Vector3(), direction: new Vector3(), colors: [new Color('#dcd7bd'), new Color('#a8c4ca'), new Color('#d7a775')] }
  }, [gantry])
  useEffect(() => () => data.geometry.dispose(), [data])
  useFrame(() => {
    const t = clock.current.time, position = data.geometry.attributes.position, color = data.geometry.attributes.color
    let count = 0
    const line = (a: Vec3, b: Vec3, c: Color) => { for (const p of [a, b]) { position.setXYZ(count, ...p); color.setXYZ(count++, c.r, c.g, c.b) } }
    for (const sensor of sensors) {
      if (t < sensor.from || t > sensor.to) continue
      const subject = sensorSubject(t, sensor.kind)
      const c = data.colors[sensor.kind === 'camera' ? 0 : sensor.kind === 'radar' ? 1 : 2], frame = sensorFrame(sensor)
      data.object.position.set(...sensor.origin); data.object.rotation.set(frame.pitch, frame.yaw, 0, 'YXZ'); data.object.updateMatrix()
      // Short frustum corners introduce direction, not a claimed operating range.
      const depth = 2.5, halfW = Math.tan(sensor.horizontal * Math.PI / 360) * depth, halfH = Math.tan(sensor.vertical * Math.PI / 360) * depth
      const corners = [-1, 1].flatMap(x => [-1, 1].map(y => data.point.set(x * halfW, y * halfH, depth).normalize().multiplyScalar(2.5).applyMatrix4(data.object.matrix).toArray() as Vec3))
      corners.forEach(p => line(sensor.origin, p, c)); for (const [a, b] of [[0, 1], [1, 3], [3, 2], [2, 0]]) line(corners[a], corners[b], c)
      if (!inSector(sensor, subject)) continue
      let end = subject
      if (sensor.id === 'aisle-camera') {
        data.origin.set(...sensor.origin); data.direction.set(...subject).sub(data.origin)
        data.ray.set(data.origin, data.direction.clone().normalize()); data.ray.near = .03; data.ray.far = data.direction.length()
        const hit = data.ray.intersectObjects(data.blockers, false)[0]; if (hit) end = hit.point.toArray() as Vec3
      }
      line(sensor.origin, end, c)
    }
    if (t >= 18) line([24, 2, -5.5], [17.8, 1.96, -3.23], data.colors[2])
    const drone = dronePose(t)
    if (drone.observing) {
      data.object.position.set(...drone.position); data.object.rotation.set(drone.pitch, drone.yaw, drone.roll, 'YXZ'); data.object.updateMatrix()
      line(data.point.set(...gimbalMount).applyMatrix4(data.object.matrix).toArray() as Vec3, drone.target, data.colors[0])
    }
    data.geometry.setDrawRange(0, count); position.needsUpdate = true; color.needsUpdate = true; data.geometry.computeBoundingSphere()
  })
  return <lineSegments name="illustrated-observations" geometry={data.geometry} frustumCulled={false}><lineBasicMaterial vertexColors transparent opacity={.48} depthWrite={false} /></lineSegments>
}
const wheelPositions: Vec3[] = [-1.38, 1.22, -7.65, -6.35].flatMap(x => [[x, .64, -1.19], [x, .64, 1.19]] as Vec3[])
const cargoColors: Finish[] = ['blue', 'rust', 'orange', 'teal', 'sand']
const placements = cargoColors.map(c => cargo.filter(v => v.c === c).map(v => v.p))
const allCargoPositions = cargo.map(v => v.p)
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
    tractor: makeTractor(m, high), trailer: makeTrailer(m, high), wheel: makeWheel(m, high), person: makePerson(m, high), shoe: makeSupervisorShoe(m, high),
    trolleyWheel: makeTrolleyWheel(m, high), cover: makeDockCover(m, high), drone: makeDrone(m, high), rotor: makeDroneRotor(m, high), gimbal: makeDroneGimbal(m, high),
    load: makeContainer(m, high, 'orange', 6.1), containers: cargoColors.map(c => makeContainer(m, high, c)),
  }), [m, high])
  useEffect(() => () => {
    const parts = [...built.site, ...built.gantry, ...built.trolley, ...built.spreader, ...built.tractor, ...built.trailer, ...built.wheel, ...built.person, ...built.shoe, ...built.load, ...built.trolleyWheel, ...built.cover, ...built.drone, ...built.rotor, ...built.gimbal, ...built.containers.flat()]
    parts.forEach(p => p.geometry.dispose())
  }, [built])
  useEffect(() => () => { contact.dispose(); Object.values(m).forEach(v => { v.map?.dispose(); v.dispose() }) }, [contact, m])
  const batches = useMemo(() => [...built.containers.map((parts, i) => ({ parts: parts.filter(p => p.material === m[cargoColors[i]]), positions: placements[i] })), { parts: built.containers[0].filter(p => p.material !== m.blue), positions: allCargoPositions }], [built, m])
  const aircraft = useRef<Group>(null), gimbal = useRef<Group>(null)
  const vehicle = useRef<Group>(null), trailer = useRef<Group>(null), wheels = useRef<(Group | null)[]>([])
  const trolley = useRef<Group>(null), spreader = useRef<Group>(null), cables = useRef<Group>(null)
  const person = useRef<Group>(null), shoes = useRef<(Group | null)[]>([]), footShadows = useRef<(Mesh | null)[]>([]), legs = useRef<(Mesh | null)[]>([]), marker = useRef<Group>(null), hold = useRef<Group>(null), brake = useRef<Group>(null), recorded = useRef<Group>(null)
  const rig = useMemo(() => ({ axis: new Vector3(0, 1, 0), hip: new Vector3(), knee: new Vector3(), ankle: new Vector3(), direction: new Vector3() }), [])
  useFrame(() => {
    const t = clock.current.time, x = vehicleX(t)
    vehicle.current!.position.set(x, 0, 0)
    trailer.current!.rotation.y = 0
    wheels.current.forEach(w => { if (w) w.rotation.z = -(x + 20) / .59 })
    const { z, y } = trolleyPose(t)
    trolley.current!.position.z = z; spreader.current!.position.set(0, y, z)
    cables.current!.position.set(0, y + crane.anchorY, z); cables.current!.scale.y = crane.cableTop - y - crane.anchorY
    const flight = dronePose(t)
    aircraft.current!.position.set(...flight.position); aircraft.current!.rotation.set(flight.pitch, flight.yaw, flight.roll, 'YXZ')
    gimbal.current!.rotation.set(flight.gimbalPitch, flight.gimbalYaw, 0, 'YXZ')
    const pose = supervisorPose(t)
    person.current!.position.set(...pose.position)
    person.current!.rotation.set(0, pose.yaw, 0)
    pose.feet.forEach((foot, side) => {
      const shoe = shoes.current[side]!
      shoe.position.set(...foot.position); shoe.rotation.y = foot.yaw
      footShadows.current[side]!.visible = foot.planted
      const joints = pose.legs[side]
      rig.hip.set(...joints.hip); rig.knee.set(...joints.knee); rig.ankle.set(...joints.ankle)
      for (let part = 0; part < 2; part++) {
        const start = part === 0 ? rig.hip : rig.knee, end = part === 0 ? rig.knee : rig.ankle, leg = legs.current[side * 2 + part]!
        rig.direction.copy(end).sub(start)
        leg.position.copy(start).add(end).multiplyScalar(.5)
        leg.quaternion.setFromUnitVectors(rig.axis, rig.direction.normalize())
      }
    })
    hold.current!.visible = t >= 27; brake.current!.visible = t >= 20; recorded.current!.visible = t >= droneTimes.record
    if (marker.current) { marker.current.visible = t >= 4; marker.current.position.set(x - 3.2, .09, 0) }
  })
  return <group>
    <Parts parts={built.site} /><Parts parts={built.gantry} />
    {batches.map((batch, i) => <Batch key={i} parts={batch.parts} positions={batch.positions} />)}
    <Contacts texture={contact} items={staticContacts} opacity={high ? .19 : .32} /><Grasses high={high} />
    <group name="gantry-trolley" ref={trolley} position={[0, 0, -16]}><Parts parts={built.trolley} /><MovingParts parts={built.trolleyWheel} clock={clock} kind="trolley" /></group>
    <group name="hoist-spreader" ref={spreader} position={[0, 5.1, -16]}><Parts parts={built.spreader} /></group>
    <group name="hoist-cables" ref={cables} position={[0, 5.1 + crane.anchorY, -16]} scale={[1, crane.cableTop - 5.1 - crane.anchorY, 1]}>
      {crane.cableXs.flatMap(x => crane.cableZs.map(z => <mesh key={`${x}-${z}`} position={[x, .5, z]} castShadow><boxGeometry args={[.028, 1, .028]} /><meshStandardMaterial color="#394951" metalness={.5} roughness={.45} /></mesh>))}
    </group>
    <group name="yard-vehicle" ref={vehicle} position={[-20, 0, 0]}>
      <Parts parts={built.tractor} />
      <group ref={trailer} position={[-1.5, 0, 0]}><group position={[1.5, 0, 0]}><Parts parts={built.trailer} /><group position={[-5.3, 1.43, 0]}><Parts parts={built.load} /></group>{wheelPositions.slice(4).map((p, i) => <group key={i} position={p}><group ref={w => { wheels.current[i + 4] = w }}><Parts parts={built.wheel} /></group></group>)}</group></group>
      {wheelPositions.slice(0, 4).map((p, i) => <group key={i} position={p}><group ref={w => { wheels.current[i] = w }}><Parts parts={built.wheel} /></group></group>)}
      <Contacts texture={contact} items={vehicleContacts} opacity={.39} />
      <group ref={brake} visible={false}>{[-.9, .9].map(z => <mesh key={z} position={[-8.65, 1.13, z]}><boxGeometry args={[.018, .13, .28]} /><meshBasicMaterial color="#d68655" /></mesh>)}</group>
      <mesh position={[.7, 3.52, -.18]}><cylinderGeometry args={[.105, .105, .16, 12]} /><meshStandardMaterial color="#e8b76d" emissive="#e8b76d" emissiveIntensity={.22} roughness={.3} /></mesh>
    </group>
    <group name="logistics-supervisor" ref={person} position={[20.7, .46, -6.5]}><Parts parts={built.person} /></group>
    {[0, 1].map(side => <group key={side}>
      <group ref={shoe => { shoes.current[side] = shoe }}><Parts parts={built.shoe} /><mesh ref={shadow => { footShadows.current[side] = shadow }} position={[0, .006, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.4, .55]} /><meshBasicMaterial color="#29363a" map={contact} transparent opacity={.27} depthWrite={false} /></mesh></group>
      {[0, 1].map(part => <mesh key={part} name={`supervisor-${side}-${part ? 'shin' : 'thigh'}`} ref={leg => { legs.current[side * 2 + part] = leg }} castShadow receiveShadow material={m.blue}><capsuleGeometry args={[.064, part ? supervisorRig.shin : supervisorRig.thigh, 3, 8]} /></mesh>)}
    </group>)}
    <group ref={hold} visible={false}><mesh position={[17.8, 2.21, -3.24]}><boxGeometry args={[.31, .065, .02]} /><meshBasicMaterial color="#e5b361" /></mesh><mesh position={[22.1, 1.92, -4.1]}><sphereGeometry args={[.115, 12, 8]} /><meshBasicMaterial color="#dcb074" /></mesh></group>
    <group ref={recorded} visible={false}><mesh position={[17.8, 1.94, -3.226]}><boxGeometry args={[.25, .11, .012]} /><meshBasicMaterial color="#d6caa8" /></mesh></group>
    {layers.tracks && <group ref={marker} visible={false}><mesh rotation={[-Math.PI / 2, 0, 0]} scale={[2.8, 1, 1]}><ringGeometry args={[1.92, 1.945, 64]} /><meshBasicMaterial color="#debb7c" transparent opacity={.68} depthWrite={false} /></mesh></group>}
    <group name="proposed-dock-covers" position={[dock.x, 0, dock.z]}><MovingParts parts={built.cover} clock={clock} kind="covers" /></group>
    <group name="proposed-drone" ref={aircraft} position={[dock.x, dock.surfaceY, dock.z]}>
      <Parts parts={built.drone} /><MovingParts parts={built.rotor} clock={clock} kind="rotors" />
      <group name="drone-gimbal" ref={gimbal} position={gimbalMount}><Parts parts={built.gimbal} /></group>
    </group>
    {layers.sensors && <Observations clock={clock} gantry={built.gantry} />}
    <pointLight position={[20.7, 3.12, -5.2]} color="#ffcc8d" intensity={high ? 10 : 7} distance={7} decay={2} />
    {high && <pointLight position={[-22.3, 14.87, 6.94]} color="#ffdaa5" intensity={5} distance={5} decay={2} />}
  </group>
}
const scene: SceneModule = { definition, World }
export default scene
