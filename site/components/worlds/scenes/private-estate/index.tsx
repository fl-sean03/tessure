'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, LineSegments, Object3D, Vector3 } from 'three'
import type { DataTexture, LineBasicMaterial } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { mix, progress, seeded, smooth } from '../../math'
import { definition } from './content'
import { contactTexture, groundY, makeFox, makeMaterials, makeOperator, makeSite, makeTrunks, pathZ, treeLayout, type Part } from './model'

function Parts({ parts }: { parts: Part[] }) { return <>{parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow dispose={null} />)}</> }
function Contact({ texture, position, size, opacity = .28 }: { texture: DataTexture; position: Vec3; size: [number, number]; opacity?: number }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={size} /><meshBasicMaterial map={texture} color="#20372c" transparent opacity={opacity} depthWrite={false} /></mesh>
}
function Planting({ high }: { high: boolean }) {
  const canopy = useRef<InstancedMesh>(null), grass = useRef<InstancedMesh>(null), shrubs = useRef<InstancedMesh>(null)
  const count = treeLayout.length * (high ? 70 : 46), grassCount = high ? 1750 : 850
  const leafGeometry = useMemo(() => {
    const vertices: number[] = []
    // Eight folded leaves form an airy twig cluster, with physical edges instead of alpha cards.
    for (let i = 0; i < 8; i++) {
      const angle = i * 2.399, r = .2 + seeded(i + 22) * .56
      const o = new Object3D(); o.position.set(Math.cos(angle) * r, (seeded(i + 25) - .5) * .7, Math.sin(angle) * r)
      o.rotation.set(seeded(i + 40) * 1.2, angle, .2); o.scale.setScalar(.8 + seeded(i + 30) * .5); o.updateMatrix()
      const pts = [[-.31, 0, 0], [-.09, .028, -.14], [.16, .012, -.105], [.35, -.025, 0], [.12, -.005, .125], [-.12, .012, .13], [0, .065, 0]].map(p => new Vector3(...p).multiplyScalar(.66).applyMatrix4(o.matrix))
      for (let j = 0; j < 6; j++) vertices.push(...pts[6].toArray(), ...pts[j].toArray(), ...pts[(j + 1) % 6].toArray())
    }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(vertices, 3)); g.computeVertexNormals(); return g
  }, [])
  useEffect(() => () => leafGeometry.dispose(), [leafGeometry])
  const grassGeometry = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute([-.024, 0, 0, .024, 0, 0, .07, .45, .04, .07, .45, .04, .024, 0, 0, .1, .61, .08, 0, 0, -.022, 0, 0, .022, -.15, .38, 0, -.15, .38, 0, 0, 0, .022, -.19, .48, .04], 3))
    g.computeVertexNormals(); return g
  }, [])
  useEffect(() => () => grassGeometry.dispose(), [grassGeometry])
  useLayoutEffect(() => {
    const o = new Object3D(), c = new Color(), per = high ? 70 : 46
    for (let i = 0; i < count; i++) {
      const index = Math.floor(i / per), [x, size, z] = treeLayout[index], j = i % per
      const theta = j * 2.399, r = Math.sqrt(seeded(i * 3 + 1)) * size * .95
      const y = groundY(x, z) + size * 2.1 + (seeded(i + 55) - .45) * size * 1.25 - r * .18
      o.position.set(x + Math.cos(theta) * r, y, z + Math.sin(theta) * r)
      const s = .9 + seeded(i + 201) * .52
      o.scale.set(s * 1.12, s, s); o.rotation.set(seeded(i) * .7, i * 2.399, seeded(i + 1) * .5); o.updateMatrix()
      canopy.current!.setMatrixAt(i, o.matrix)
      c.set(i % 4 ? '#536d60' : '#8f9d7e'); c.multiplyScalar(.82 + seeded(i * 9 + 2) * .3); canopy.current!.setColorAt(i, c)
    }
    for (let i = 0; i < grassCount; i++) {
      let x = -12 + seeded(i * 7 + 1) * 26, z = 6.03 + seeded(i * 7 + 2) * 7
      if (i % 3 === 0) { x = 7.5 + seeded(i * 7 + 3) * 5; z = -4 + seeded(i * 7 + 4) * 7 }
      if (x < -5.6 && z > 5.2) x += 12
      o.position.set(x, groundY(x, z) + .015, z); o.rotation.set(0, i * 2.399, 0)
      const s = .3 + seeded(i + 35) * .65; o.scale.set(s, s * (.55 + seeded(i + 55)), s); o.updateMatrix(); grass.current!.setMatrixAt(i, o.matrix)
      c.set(i % 4 ? '#7c8964' : '#a39f7c'); grass.current!.setColorAt(i, c)
    }
    for (let i = 0; i < 90; i++) {
      let x = -5.8 + seeded(i * 5 + 1) * 11, z = 3.45 + seeded(i * 5 + 2) * .55
      if (x > 3.1) x -= 1.9
      if (i > 45) { x = 8.5 + seeded(i * 5 + 4) * 3.4; z = 1 + seeded(i * 5 + 3) * 2.3 }
      const s = .17 + seeded(i * 5 + 5) * .25
      o.position.set(x, groundY(x, z) + s * .6, z); o.rotation.set(.1, i, .2); o.scale.set(s * 1.2, s, s); o.updateMatrix(); shrubs.current!.setMatrixAt(i, o.matrix)
      c.set(i % 5 ? '#667c66' : '#9a9674'); shrubs.current!.setColorAt(i, c)
    }
    for (const ref of [canopy, grass, shrubs]) { ref.current!.instanceMatrix.needsUpdate = true; if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true; ref.current!.computeBoundingSphere() }
  }, [high, count, grassCount])
  return <>
    <instancedMesh ref={canopy} args={[leafGeometry, undefined, count]} castShadow receiveShadow><meshStandardMaterial roughness={1} side={DoubleSide} /></instancedMesh>
    <instancedMesh ref={grass} args={[grassGeometry, undefined, grassCount]} receiveShadow><meshStandardMaterial roughness={1} side={DoubleSide} /></instancedMesh>
    <instancedMesh ref={shrubs} args={[leafGeometry, undefined, 90]} castShadow receiveShadow><meshStandardMaterial roughness={1} side={DoubleSide} /></instancedMesh>
  </>
}
// Position and gait are sampled directly. Pausing or reverse seeking cannot accumulate pose error.
export function foxX(t: number) {
  if (t <= 2) return -8.4
  if (t < 11) return mix(-8.4, -2.7, smooth(progress(t, 2, 11)))
  if (t < 20) return mix(-2.7, 1.2, smooth(progress(t, 11, 20)))
  if (t < 27.5) return mix(1.2, 2.35, smooth(progress(t, 20, 25)))
  if (t < 40) return mix(2.35, 9.3, smooth(progress(t, 27.5, 40)))
  return mix(9.3, 12.4, smooth(progress(t, 40, 46)))
}
function foxZ(x: number) { return pathZ(x) + (x > 8 ? (x - 8) * -.27 : 0) }
function Coverage({ clock, kind }: { clock: WorldProps['clock']; kind: 'camera' | 'thermal' }) {
  const ref = useRef<Group>(null), isCamera = kind === 'camera'
  const geometry = useMemo(() => {
    // The partial footprint occupies only the garden in front of the opaque residence.
    const pts: Vec3[] = isCamera ? [[-9.2, .15, 4.1], [-1, .15, 5.5], [2, .15, 4.8], [-4.4, .15, 3.72]] : [[-2.8, .15, 4.02], [-3.4, .15, 5.1], [8.2, .15, 5.65], [8.5, .15, 3.82]]
    const values: number[] = []
    for (let i = 1; i < pts.length - 1; i++) values.push(...pts[0], ...pts[i], ...pts[i + 1])
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(values, 3)); g.computeVertexNormals(); return g
  }, [isCamera])
  const line = useMemo(() => {
    const pts = isCamera ? [[-6.82, 2.91, 1.69], [-9.2, .17, 4.1], [-1, .17, 5.5], [2, .17, 4.8]] : [[6.02, 3.57, .31], [-2.8, .17, 4.02], [-3.4, .17, 5.1], [8.2, .17, 5.65]]
    return new BufferGeometry().setFromPoints(pts.map(p => new Vector3(...p)))
  }, [isCamera])
  useEffect(() => () => { geometry.dispose(); line.dispose() }, [geometry, line])
  useFrame(() => { if (ref.current) ref.current.visible = clock.current.time >= (isCamera ? 4 : 11) && clock.current.time < 33 })
  return <group ref={ref} visible={false}>
    <mesh geometry={geometry}><meshBasicMaterial color={isCamera ? '#b5d4d8' : '#dfbe8b'} transparent opacity={.085} side={DoubleSide} depthWrite={false} /></mesh>
    <lineLoop geometry={line}><lineBasicMaterial color={isCamera ? '#accfd2' : '#ddbd89'} transparent opacity={.35} depthWrite={false} /></lineLoop>
  </group>
}
function PathRecord({ clock }: { clock: WorldProps['clock'] }) {
  const group = useRef<Group>(null), lineRef = useRef<LineSegments>(null)
  const geometry = useMemo(() => {
    const vertices: number[] = []
    for (let i = 0; i < 100; i++) {
      const x = -8.4 + i * .208, next = x + .125
      vertices.push(x, groundY(x, foxZ(x)) + .095, foxZ(x), next, groundY(next, foxZ(next)) + .095, foxZ(next))
    }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(vertices, 3)); return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(() => {
    const t = clock.current.time
    if (group.current) group.current.visible = t >= 4
    geometry.setDrawRange(0, Math.max(0, Math.floor((foxX(t) + 8.4) / .208)) * 2)
    if (lineRef.current) { const m = lineRef.current.material as LineBasicMaterial; m.opacity = t >= 33 ? .28 : .52; m.color.set(t >= 33 ? '#aec1b2' : '#d6b578') }
  })
  return <group ref={group} visible={false}><lineSegments ref={lineRef} geometry={geometry}><lineBasicMaterial color="#d6b578" transparent opacity={.52} depthWrite={false} /></lineSegments></group>
}
function World({ clock, layers, quality }: WorldProps) {
  const high = quality === 'high'
  const m = useMemo(makeMaterials, []), contact = useMemo(contactTexture, [])
  const site = useMemo(() => makeSite(m, high), [m, high]), trunks = useMemo(() => makeTrunks(m, high), [m, high])
  const fox = useMemo(() => makeFox(m), [m]), operator = useMemo(() => makeOperator(m), [m])
  const animal = useRef<Group>(null), head = useRef<Group>(null), tail = useRef<Group>(null)
  const legs = useRef<(Group | null)[]>([]), arm = useRef<Group>(null)
  const notice = useRef<Group>(null), saved = useRef<Group>(null), marker = useRef<Group>(null)
  useEffect(() => () => { site.forEach(p => p.geometry.dispose()); trunks.forEach(p => p.geometry.dispose()) }, [site, trunks])
  useEffect(() => () => { [...Object.values(fox).flat(), ...Object.values(operator).flat()].forEach(p => p.geometry.dispose()) }, [fox, operator])
  useEffect(() => () => { Object.values(m).forEach(v => { v.map?.dispose(); v.dispose() }); contact.dispose() }, [m, contact])
  useFrame(() => {
    const t = clock.current.time, x = foxX(t), z = foxZ(x)
    const speed = Math.abs(foxX(Math.min(46, t + .025)) - foxX(Math.max(0, t - .025))) / .05
    const phase = (x + 8.4) * 8.6, stride = Math.min(1, speed * 3)
    if (animal.current) { animal.current.position.set(x, groundY(x, z) + .075, z); animal.current.rotation.y = -Math.atan2(foxZ(x + .01) - foxZ(x), .01) }
    if (head.current) { head.current.rotation.z = t > 19 && t < 27.5 ? -.28 * Math.sin(progress(t, 19, 27.5) * Math.PI) : .04 * Math.sin(phase) * stride; head.current.rotation.y = t > 21 && t < 27 ? -.24 * Math.sin(progress(t, 21, 27) * Math.PI) : 0 }
    if (tail.current) { tail.current.rotation.y = Math.sin(phase * .36) * .12 * stride; tail.current.rotation.z = .1 + .045 * Math.sin(phase * .5) * stride }
    for (let i = 0; i < 4; i++) if (legs.current[i]) {
      const step = Math.sin(phase + (i === 0 || i === 3 ? 0 : Math.PI)), angle = step * .38 * stride
      legs.current[i]!.rotation.z = angle
      legs.current[i]!.position.y = .47 - .44 * (1 - Math.cos(angle)) + Math.max(0, step) * .055 * stride
    }
    // The hand movement and screen close happen only after the authored review.
    const dismiss = smooth(progress(t, 29.5, 32.5))
    if (arm.current) { arm.current.rotation.y = -.55 * dismiss; arm.current.rotation.x = -.2 * Math.sin(dismiss * Math.PI) }
    if (notice.current) { notice.current.visible = t >= 4 && t < 33; notice.current.scale.set(1 - dismiss * .82, 1 - dismiss * .92, 1); notice.current.position.set(1.48 + dismiss * .3, 2.39 - dismiss * .19, 1.435) }
    if (saved.current) saved.current.visible = t >= 33
    if (marker.current) { marker.current.visible = t >= 4 && t < 33; marker.current.position.set(x, groundY(x, z) + .095, z) }
  })
  return <group>
    <Parts parts={site} /><Parts parts={trunks} /><Planting high={high} />
    <Contact texture={contact} position={[-2.8, 1.285, -.6]} size={[7.3, 3.3]} opacity={.4} />
    <Contact texture={contact} position={[3.7, 1.285, -.3]} size={[5.8, 2.8]} opacity={.35} />
    <Contact texture={contact} position={[-8.4, .175, 1.6]} size={[4.5, 3.2]} opacity={.32} />
    <Contact texture={contact} position={[-1.8, .13, 3.43]} size={[11, 1.2]} opacity={.23} />
    {treeLayout.slice(0, 10).map(([x, , z], i) => <Contact key={i} texture={contact} position={[x, groundY(x, z) + .055, z]} size={[2.6, 2.6]} opacity={.25} />)}
    <group ref={animal}>
      <Parts parts={fox.body} />
      <group ref={head} position={[.47, .81, 0]}><Parts parts={fox.head} /></group>
      <group ref={tail} position={[-.48, .65, 0]}><Parts parts={fox.tail} /></group>
      {[[.32, .47, .13], [.32, .47, -.13], [-.34, .47, .13], [-.34, .47, -.13]].map((p, i) => <group key={i} position={p as Vec3} ref={v => { legs.current[i] = v }}><Parts parts={fox.leg} /></group>)}
      <Contact texture={contact} position={[-.14, .005, 0]} size={[2.15, .83]} opacity={.52} />
    </group>
    <group position={[.57, 1.3, 1.16]} rotation={[0, .72, 0]}><Parts parts={operator.body} /><group ref={arm} position={[.18, 1.2, .01]}><Parts parts={operator.arm} /></group></group>
    {/* Abstract observation tiles on a physical screen; their meaning remains in HTML evidence. */}
    <group ref={notice} position={[1.48, 2.39, 1.435]}>
      <mesh><planeGeometry args={[.76, .4]} /><meshBasicMaterial color="#c4a16b" /></mesh>
      {[0, 1].map(i => <mesh key={i} position={[-.19 + i * .38, .035, .003]}><planeGeometry args={[.29, .19]} /><meshBasicMaterial color={i ? '#786749' : '#4b6b69'} /></mesh>)}
      <mesh position={[0, -.125, .004]}><planeGeometry args={[.57, .022]} /><meshBasicMaterial color="#f0ddac" /></mesh>
    </group>
    <group ref={saved} visible={false} position={[1.48, 2.39, 1.445]}>
      {[0, 1, 2].map(i => <mesh key={i} position={[-.2 + i * .2, .08, 0]}><planeGeometry args={[.14, .15]} /><meshBasicMaterial color="#96b9ac" /></mesh>)}
      <mesh position={[0, -.1, 0]}><planeGeometry args={[.62, .032]} /><meshBasicMaterial color="#abc4b5" /></mesh>
    </group>
    {layers.tracks && <><PathRecord clock={clock} /><group ref={marker} visible={false}><mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.4, .59, 1]}><ringGeometry args={[.9, .917, 64]} /><meshBasicMaterial color="#d9bd85" transparent opacity={.48} depthWrite={false} /></mesh></group></>}
    {layers.sensors && <><Coverage clock={clock} kind="camera" /><Coverage clock={clock} kind="thermal" /></>}
    <pointLight position={[-2.7, 3.1, -1.1]} color="#ffd19b" intensity={high ? 10 : 8} distance={5} decay={2} />
    {high && <pointLight position={[4.95, 2.9, -1.2]} color="#ffd5a4" intensity={5} distance={4} decay={2} />}
  </group>
}
const scene: SceneModule = { definition, World }
export default scene
