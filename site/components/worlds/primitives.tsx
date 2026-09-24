'use client'
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, Group, InstancedMesh, Object3D, Vector3 } from 'three'
import type { SceneClock, TimedPoint, Vec3 } from './contract'
import type { MutableRefObject } from 'react'
import { samplePath } from './math'

export function Box({ position = [0, 0, 0], size = [1, 1, 1], color = '#babbb0', rotation = [0, 0, 0], roughness = 0.8, metalness = 0, castShadow = true }: { position?: Vec3; size?: Vec3; color?: string; rotation?: Vec3; roughness?: number; metalness?: number; castShadow?: boolean }) {
  return <mesh position={position} scale={size} rotation={rotation} castShadow={castShadow} receiveShadow><boxGeometry /><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} /></mesh>
}
export type Instance = { position: Vec3; scale?: Vec3; rotation?: Vec3 }
export function Instances({ items, color = '#7b8673', geometry = 'box', castShadow = true }: { items: Instance[]; color?: string; geometry?: 'box' | 'cylinder' | 'cone' | 'sphere'; castShadow?: boolean }) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    if (!ref.current) return
    const dummy = new Object3D()
    items.forEach((item, index) => { dummy.position.set(...item.position); dummy.rotation.set(...(item.rotation || [0, 0, 0])); dummy.scale.set(...(item.scale || [1, 1, 1])); dummy.updateMatrix(); ref.current!.setMatrixAt(index, dummy.matrix) })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow={castShadow} receiveShadow>
    {geometry === 'box' ? <boxGeometry /> : geometry === 'sphere' ? <sphereGeometry args={[0.5, 8, 6]} /> : geometry === 'cone' ? <coneGeometry args={[0.5, 1, 7]} /> : <cylinderGeometry args={[0.5, 0.5, 1, 8]} />}
    <meshStandardMaterial color={color} roughness={0.82} />
  </instancedMesh>
}
export function LinePath({ points, color = '#8abfa7', opacity = 0.6 }: { points: Vec3[]; color?: string; opacity?: number }) {
  const geometry = useMemo(() => new BufferGeometry().setFromPoints(points.map(p => new Vector3(...p))), [points])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <lineLoop geometry={geometry}><lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} /></lineLoop>
}
export function SegmentPath({ points, color = '#8abfa7', opacity = 0.6 }: { points: Vec3[]; color?: string; opacity?: number }) {
  const geometry = useMemo(() => { const g = new BufferGeometry(); const v: number[] = []; for (let i = 1; i < points.length; i++) v.push(...points[i - 1], ...points[i]); g.setAttribute('position', new Float32BufferAttribute(v, 3)); return g }, [points])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <lineSegments geometry={geometry}><lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} /></lineSegments>
}
export function Motion({ clock, points, children, facePath = true }: { clock: MutableRefObject<SceneClock>; points: TimedPoint[]; children: ReactNode; facePath?: boolean }) {
  const ref = useRef<Group>(null)
  useFrame(() => {
    if (!ref.current) return
    const p = samplePath(points, clock.current.time)
    ref.current.position.set(...p)
    if (facePath && points.length > 1) {
      const t = clock.current.time
      let segment = Math.max(1, points.findIndex(p => p.at >= t))
      if (t >= points[points.length - 1].at) segment = points.length - 1
      while (segment > 1 && points[segment].position[0] === points[segment - 1].position[0] && points[segment].position[2] === points[segment - 1].position[2]) segment--
      const a = points[Math.max(0, segment - 1)].position, b = points[segment].position
      ref.current.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2])
    }
  })
  return <group ref={ref} position={points[0]?.position}>{children}</group>
}
export function Person({ color = '#b5ad94', scale = 1 }: { color?: string; scale?: number }) {
  return <group scale={scale}>
    <mesh position={[0, 1.6, 0]} castShadow><sphereGeometry args={[0.14, 8, 6]} /><meshStandardMaterial color="#bdab96" /></mesh>
    <Box position={[0, 1.12, 0]} size={[0.42, 0.64, 0.25]} color={color} />
    <Box position={[-0.11, 0.44, 0]} size={[0.15, 0.78, 0.19]} color="#394340" />
    <Box position={[0.11, 0.44, 0]} size={[0.15, 0.78, 0.19]} color="#394340" />
    <Box position={[-0.28, 1.05, 0]} size={[0.12, 0.58, 0.15]} color={color} />
    <Box position={[0.28, 1.05, 0]} size={[0.12, 0.58, 0.15]} color={color} />
  </group>
}
export function Sensor({ position, height = 4, color = '#b7c4bc' }: { position: Vec3; height?: number; color?: string }) {
  return <group position={position}>
    <mesh position={[0, height / 2, 0]} castShadow><cylinderGeometry args={[0.05, 0.09, height, 8]} /><meshStandardMaterial color={color} metalness={0.6} roughness={0.5} /></mesh>
    <Box position={[0, height, 0.2]} size={[0.24, 0.2, 0.5]} color="#e0e3d9" />
    <Box position={[0, height, 0.46]} size={[0.17, 0.12, 0.02]} color="#253b37" />
  </group>
}
export function Marker({ position, radius = 1.8, color = '#efc878' }: { position: Vec3; radius?: number; color?: string }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[radius * 0.94, radius, 48]} /><meshBasicMaterial color={color} transparent opacity={0.8} depthWrite={false} /></mesh>
}
