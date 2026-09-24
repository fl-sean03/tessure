'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, LineSegments, MeshBasicMaterial, Object3D, Vector3 } from 'three'
import type { DataTexture, LineBasicMaterial } from 'three'
import type { SceneModule, Vec3, WorldProps } from '../../contract'
import { seeded } from '../../math'
import { definition } from './content'
import { contactTexture, groundY, makeFox, makeMaterials, makeOperator, makeSite, makeTrunks, treeLayout } from './model'
import { consolePose, foxDistance, foxPath, operatorAction } from './motion'
import { surfaceY } from './surface'
import { Fox, Operator, Parts, ThermalView, makeThermalLabel } from './actors'
import { Equipment } from './equipment'

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
  useEffect(() => { const mounted = [canopy.current, grass.current, shrubs.current]; return () => { mounted.forEach(mesh => mesh?.dispose()) } }, [])
  return <>
    <instancedMesh ref={canopy} args={[leafGeometry, undefined, count]} castShadow receiveShadow><meshStandardMaterial roughness={1} side={DoubleSide} /></instancedMesh>
    <instancedMesh ref={grass} args={[grassGeometry, undefined, grassCount]} receiveShadow><meshStandardMaterial roughness={1} side={DoubleSide} /></instancedMesh>
    <instancedMesh ref={shrubs} args={[leafGeometry, undefined, 90]} castShadow receiveShadow><meshStandardMaterial roughness={1} side={DoubleSide} /></instancedMesh>
  </>
}
function PathRecord({ clock }: { clock: WorldProps['clock'] }) {
  const group = useRef<Group>(null), lineRef = useRef<LineSegments>(null)
  const geometry = useMemo(() => {
    const vertices: number[] = []
    for (let i = 0; i < 100; i++) {
      const p = foxPath.sample(i * .208).position, q = foxPath.sample(i * .208 + .125).position
      vertices.push(p[0], surfaceY(p[0], p[2]) + .014, p[2], q[0], surfaceY(q[0], q[2]) + .014, q[2])
    }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(vertices, 3)); return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(() => {
    const t = clock.current.time
    if (group.current) group.current.visible = t >= 4
    geometry.setDrawRange(0, Math.max(0, Math.floor(foxDistance(t) / .208)) * 2)
    if (lineRef.current) { const m = lineRef.current.material as LineBasicMaterial; m.opacity = t >= 33 ? .28 : .52; m.color.set(t >= 33 ? '#aec1b2' : '#d6b578') }
  })
  return <group ref={group} visible={false}><lineSegments ref={lineRef} geometry={geometry}><lineBasicMaterial color="#d6b578" transparent opacity={.52} depthWrite={false} /></lineSegments></group>
}
function World({ clock, layers, quality }: WorldProps) {
  const high = quality === 'high'
  const m = useMemo(makeMaterials, []), contact = useMemo(contactTexture, []), label = useMemo(makeThermalLabel, [])
  const warm = useMemo(() => new MeshBasicMaterial({ color: '#ffcf85', transparent: true, toneMapped: false, depthTest: false, depthWrite: false }), [])
  const site = useMemo(() => makeSite(m, high), [m, high]), trunks = useMemo(() => makeTrunks(m, high), [m, high])
  const fox = useMemo(() => makeFox(m), [m]), operator = useMemo(() => makeOperator(m), [m])
  const notice = useRef<Group>(null), saved = useRef<Group>(null)
  useEffect(() => () => { site.forEach(p => p.geometry.dispose()); trunks.forEach(p => p.geometry.dispose()) }, [site, trunks])
  useEffect(() => () => { [...Object.values(fox).flat(), ...operator].forEach(p => p.geometry.dispose()) }, [fox, operator])
  useEffect(() => () => { Object.values(m).forEach(v => { v.map?.dispose(); v.dispose() }); contact.dispose(); label.dispose(); warm.dispose() }, [m, contact, label, warm])
  useFrame(() => {
    const t = clock.current.time, { dismiss } = operatorAction(t)
    if (notice.current) { notice.current.visible = t >= 4 && t < 33; notice.current.scale.set(1 - dismiss * .82, 1 - dismiss * .92, 1); notice.current.position.set(dismiss * .3, .25 - dismiss * .19, -.078) }
    if (saved.current) saved.current.visible = t >= 33
  })
  return <group name="estate-world">
    <Parts parts={site} /><Parts parts={trunks} /><Planting high={high} />
    <Contact texture={contact} position={[-2.8, 1.285, -.6]} size={[7.3, 3.3]} opacity={.4} />
    <Contact texture={contact} position={[3.7, 1.285, -.3]} size={[5.8, 2.8]} opacity={.35} />
    <Contact texture={contact} position={[-8.4, .175, 1.6]} size={[4.5, 3.2]} opacity={.32} />
    <Contact texture={contact} position={[-1.8, .13, 3.43]} size={[11, 1.2]} opacity={.23} />
    {treeLayout.slice(0, 10).map(([x, , z], i) => <Contact key={i} texture={contact} position={[x, groundY(x, z) + .055, z]} size={[2.6, 2.6]} opacity={.25} />)}
    <Equipment materials={m} clock={clock} sensors={layers.sensors} />
    <Fox clock={clock} model={fox} materials={m} contact={contact} />
    <Operator clock={clock} parts={operator} materials={m} />
    <group name="estate-console-tiles" position={consolePose.origin} rotation={[0,consolePose.yaw,0]}>
      <group ref={notice} name="estate-notification" position={[0,.25,-.078]} rotation={[-.08,0,0]}>
        <mesh><planeGeometry args={[.76,.4]} /><meshBasicMaterial color="#c4a16b" /></mesh>
        {[0,1].map(i => <mesh key={i} position={[-.19+i*.38,.035,.003]}><planeGeometry args={[.29,.19]} /><meshBasicMaterial color={i?'#786749':'#4b6b69'} /></mesh>)}
        <mesh position={[0,-.125,.004]}><planeGeometry args={[.57,.022]} /><meshBasicMaterial color="#f0ddac" /></mesh>
      </group>
      <group ref={saved} name="estate-recorded" visible={false} position={[0,.25,-.078]} rotation={[-.08,0,0]}>
        {[0,1,2].map(i => <mesh key={i} position={[-.2+i*.2,.08,0]}><planeGeometry args={[.14,.15]} /><meshBasicMaterial color="#96b9ac" /></mesh>)}
        <mesh position={[0,-.1,0]}><planeGeometry args={[.62,.032]} /><meshBasicMaterial color="#abc4b5" /></mesh>
      </group>
    </group>
    {layers.tracks && <PathRecord clock={clock} />}
    <ThermalView clock={clock} model={fox} materials={m} label={label} warm={warm} />
    <pointLight position={[-2.7,3.25,-1.4]} color="#ffd19b" intensity={high?10:8} distance={5} decay={2} />
    {high && <pointLight position={[4.95,3,-1.2]} color="#ffd5a4" intensity={5} distance={4} decay={2} />}
  </group>
}
const scene: SceneModule = { definition, World }
export default scene
