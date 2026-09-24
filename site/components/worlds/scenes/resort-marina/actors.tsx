'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleGeometry, DataTexture, Group, Mesh, Vector3 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { WorldProps } from '../../contract'
import { attendantWalk, guestWalk, walkerRig, type Walk } from './walkers'
import type { Materials, Part } from './geometry'
export function Parts({ parts, shadow = true }: { parts: Part[]; shadow?: boolean }) { return <>{parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow={shadow} receiveShadow dispose={null} />)}</> }
export function Walker({ clock, staff, body, shoe, m, contact, walk, id }: { clock: WorldProps['clock']; staff?: boolean; body: Part[]; shoe: Part[]; m: Materials; contact: DataTexture; walk?: Pick<Walk, 'pose'>; id?: string }) {
  const root = useRef<Group>(null), feet = useRef<(Group | null)[]>([]), limbs = useRef<(Mesh | null)[]>([]), arms = useRef<(Group | null)[]>([]), shadows = useRef<(Mesh | null)[]>([])
  const armShape = useMemo(() => { const upper = new CapsuleGeometry(.055, .24, 2, 6), lower = new CapsuleGeometry(.049, .15, 2, 6); upper.translate(0, -.12, 0); lower.rotateX(-.22); lower.translate(0, -.34, .04); const geometry = mergeGeometries([upper, lower], false)!; upper.dispose(); lower.dispose(); return geometry }, [])
  useEffect(() => () => armShape.dispose(), [armShape])
  const tmp = useMemo(() => ({ a: new Vector3(), b: new Vector3(), direction: new Vector3(), up: new Vector3(0, 1, 0) }), [])
  useFrame(() => {
    const pose = (walk || (staff ? attendantWalk : guestWalk)).pose(clock.current.time)
    root.current!.position.set(...pose.position); root.current!.rotation.y = pose.yaw
    pose.feet.forEach((f, side) => {
      feet.current[side]!.position.set(...f.position); feet.current[side]!.rotation.y = f.yaw; shadows.current[side]!.visible = f.planted
      const joints = pose.legs[side]
      for (let segment = 0; segment < 2; segment++) {
        tmp.a.set(...(segment ? joints.knee : joints.hip)); tmp.b.set(...(segment ? joints.ankle : joints.knee))
        const mesh = limbs.current[side * 2 + segment]!; mesh.position.copy(tmp.a).add(tmp.b).multiplyScalar(.5)
        mesh.quaternion.setFromUnitVectors(tmp.up, tmp.direction.copy(tmp.b).sub(tmp.a).normalize())
      }
      arms.current[side]!.rotation.x = (side ? -1 : 1) * pose.armSwing
      arms.current[side]!.rotation.z = side === 1 && staff ? .12 + pose.signal * 2 : side ? .12 : -.12
    })
  })
  return <group name={(id || (staff ? 'attendant' : 'guest')) + '-rig'}>
    <group ref={root} name={(id || (staff ? 'attendant' : 'guest')) + '-body'}><Parts parts={body} />
      {[0, 1].map(side => <group key={side} ref={o => { arms.current[side] = o }} position={[side ? .215 : -.215, 1.25, 0]}>
        <mesh geometry={armShape} material={m.skin} castShadow dispose={null} />
      </group>)}
    </group>
    {[0, 1].map(side => <group key={side}>
      <group ref={o => { feet.current[side] = o }} name={`walker-foot-${side}`}><Parts parts={shoe} /><mesh ref={o => { shadows.current[side] = o }} position={[0, .002, .045]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.28, .4]} /><meshBasicMaterial color="#193f3e" map={contact} transparent opacity={.3} depthWrite={false} /></mesh></group>
      {[0, 1].map(segment => <mesh key={segment} name={`walker-${side}-${segment ? 'shin' : 'thigh'}`} ref={o => { limbs.current[side * 2 + segment] = o }} material={m.navy} castShadow receiveShadow><cylinderGeometry args={[.062, .062, segment ? walkerRig.lower : walkerRig.upper, 8]} /></mesh>)}
    </group>)}
  </group>
}
