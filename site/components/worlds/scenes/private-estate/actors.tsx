'use client'
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { DataTexture, Material, PerspectiveCamera } from 'three'
import type { Vec3, WorldProps } from '../../contract'
import { foxPose, foxRig, operatorAction, operatorPose, rotatePoint } from './motion'
import { devices, sectorContains } from './devices'
import type { Materials, Part, makeFox } from './model'
export function Parts({ parts, override }: { parts: Part[]; override?: Material }) { return <>{parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={override || p.material} renderOrder={override ? 21 : 0} castShadow={!override} receiveShadow={!override} dispose={null} />)}</> }
export function pointBone(mesh: Mesh, a: Vec3, b: Vec3, axis: Vector3, direction: Vector3) { mesh.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); direction.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); mesh.quaternion.setFromUnitVectors(axis, direction) }
export function Fox({ clock, model, materials, thermal = false, warm, contact }: { clock: WorldProps['clock']; model: ReturnType<typeof makeFox>; materials: Materials; thermal?: boolean; warm?: Material; contact?: DataTexture }) {
  const body = useRef<Group>(null), head = useRef<Group>(null), tail = useRef<Group>(null), bones = useRef<(Mesh | null)[]>([]), joints = useRef<(Mesh | null)[]>([]), feet = useRef<(Group | null)[]>([])
  const scratch = useMemo(() => ({ axis: new Vector3(0, 1, 0), direction: new Vector3() }), [])
  useFrame(() => {
    const pose = foxPose(clock.current.time), local = (p: Vec3) => thermal ? rotatePoint(p.map((v, i) => v - pose.position[i]) as Vec3, -pose.yaw) : p
    body.current!.position.set(...(thermal ? [0, 0, 0] as Vec3 : pose.position)); body.current!.rotation.y = thermal ? 0 : pose.yaw
    head.current!.rotation.z = pose.headDip; tail.current!.rotation.set(0, pose.tailYaw, pose.tailPitch)
    pose.legs.forEach((leg, i) => {
      const hip = local(leg.hip), knee = local(leg.knee), ankle = local(leg.ankle)
      pointBone(bones.current[i * 2]!, hip, knee, scratch.axis, scratch.direction); pointBone(bones.current[i * 2 + 1]!, knee, ankle, scratch.axis, scratch.direction)
      joints.current[i]!.position.set(...knee); feet.current[i]!.position.set(...local(pose.feet[i].position)); feet.current[i]!.rotation.y = pose.feet[i].yaw - (thermal ? pose.yaw : 0)
      const shadow = feet.current[i]!.getObjectByName('paw-contact'); if (shadow) shadow.visible = pose.feet[i].planted
      feet.current[i]!.userData = { planted: pose.feet[i].planted, contact: pose.feet[i].contact }
    })
  })
  const prefix = thermal ? 'estate-thermal-fox' : 'estate-fox', fur = warm || materials.fur, rust = warm || materials.rust
  return <group name={prefix}>
    <group ref={body} name={`${prefix}-body`}><Parts parts={model.body} override={warm} /><group ref={head} name={`${prefix}-head`} position={[.47,.81,0]}><Parts parts={model.head} override={warm} /></group><group ref={tail} name={`${prefix}-tail`} position={[-.48,.65,0]}><Parts parts={model.tail} override={warm} /></group></group>
    {[0,1,2,3].map(i => <group key={i}>
      <mesh name={`${prefix}-leg-${i}-upper`} ref={v => { bones.current[i * 2] = v }} material={rust} renderOrder={thermal ? 21 : 0} castShadow={!thermal}><cylinderGeometry args={[.052,.038,foxRig.upper,10]} /></mesh>
      <mesh name={`${prefix}-leg-${i}-lower`} ref={v => { bones.current[i * 2 + 1] = v }} material={fur} renderOrder={thermal ? 21 : 0} castShadow={!thermal}><cylinderGeometry args={[.034,.022,foxRig.lower,10]} /></mesh>
      <mesh ref={v => { joints.current[i] = v }} name={`${prefix}-knee-${i}`} material={rust} renderOrder={thermal ? 21 : 0}><sphereGeometry args={[.039,10,6]} /></mesh>
      <group ref={v => { feet.current[i] = v }} name={`${prefix}-foot-${i}`}><Parts parts={model.paw} override={warm} />{contact && <mesh name="paw-contact" position={[0,-.0005,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.23,.15]} /><meshBasicMaterial map={contact} color="#20372c" transparent opacity={.4} depthWrite={false} /></mesh>}</group>
    </group>)}
  </group>
}
export function Operator({ clock, parts, materials }: { clock: WorldProps['clock']; parts: Part[]; materials: Materials }) {
  const upper = useRef<Mesh>(null), lower = useRef<Mesh>(null), elbow = useRef<Mesh>(null), hand = useRef<Mesh>(null), scratch = useMemo(() => ({ axis: new Vector3(0,1,0), direction: new Vector3() }), [])
  useFrame(() => { const p = operatorAction(clock.current.time); pointBone(upper.current!, p.hip, p.knee, scratch.axis, scratch.direction); pointBone(lower.current!, p.knee, p.ankle, scratch.axis, scratch.direction); elbow.current!.position.set(...p.knee); hand.current!.position.set(...p.hand); hand.current!.userData.contact = p.contact })
  return <group name="estate-operator">
    <group name="estate-operator-seated" position={operatorPose.position} rotation={[0,operatorPose.yaw,0]}><Parts parts={parts} /></group>
    <mesh name="estate-operator-upper" ref={upper} material={materials.linen} castShadow><cylinderGeometry args={[.061,.05,operatorPose.upper,12]} /></mesh>
    <mesh name="estate-operator-lower" ref={lower} material={materials.linen} castShadow><cylinderGeometry args={[.049,.039,operatorPose.lower,12]} /></mesh>
    <mesh name="estate-operator-elbow" ref={elbow} material={materials.linen}><sphereGeometry args={[.053,12,8]} /></mesh>
    <mesh name="estate-operator-hand" ref={hand} material={materials.wood2} scale={[.055,.027,.075]} rotation={[0,-.85,0]}><sphereGeometry args={[1,14,8]} /></mesh>
  </group>
}
export function makeThermalLabel() {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 320
  const c = canvas.getContext('2d')!; c.fillStyle = '#193837'; c.fillRect(0,0,640,320); c.strokeStyle = '#9da99a'; c.lineWidth = 3; c.strokeRect(2,2,636,316)
  c.fillStyle = '#ecebd8'; c.font = '34px sans-serif'; c.fillText('Illustrative thermal-style view',22,45)
  c.fillStyle = '#b8c2ac'; c.font = '34px sans-serif'; c.fillText('Proposed thermal component',22,298)
  return new CanvasTexture(canvas)
}
export function ThermalView({ clock, model, materials, label, warm }: { clock: WorldProps['clock']; model: ReturnType<typeof makeFox>; materials: Materials; label: CanvasTexture; warm: MeshBasicMaterial }) {
  const ref = useRef<Group>(null), { camera, size } = useThree()
  useFrame(() => {
    const p = foxPose(clock.current.time), show = clock.current.time >= 11 && clock.current.time < 18 && sectorContains(devices[1], p.position)
    ref.current!.visible = show; if (!show) return
    const unit = 2 * Math.tan((camera as PerspectiveCamera).fov * Math.PI / 360) / size.height, width = size.width < 640 ? 232 : 248, height = width / 2
    ref.current!.position.copy(camera.position); ref.current!.quaternion.copy(camera.quaternion); ref.current!.translateZ(-1); ref.current!.translateX((-size.width / 2 + 12 + width / 2) * unit); ref.current!.translateY((size.height / 2 - 55 - height / 2) * unit); ref.current!.scale.setScalar(unit * width / 248)
  })
  return <group ref={ref} name="estate-thermal-view" visible={false}>
    <mesh renderOrder={20}><planeGeometry args={[248,124]} /><meshBasicMaterial map={label} transparent toneMapped={false} depthTest={false} depthWrite={false} /></mesh>
    <group position={[14,-29,1]} scale={60}><Fox clock={clock} model={model} materials={materials} warm={warm} thermal /></group>
  </group>
}
