'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CanvasTexture, Float32BufferAttribute, Group, LinearFilter, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, Vector3 } from 'three'
import type { Vec3, WorldProps } from '../../contract'
import { actorPose } from './actors'
import { load, transferPose, T } from './incident'
import { dronePose } from './motion'
const texts = ['INSIDER · crane operator', 'DRIVER · accomplice', 'SUPERVISOR', 'GATE ATTENDANT', 'ASSIGNED BAY · empty', 'MARKED LOAD A7', 'EXIT · HELD', 'REQUESTED DRONE']
function visibleLabels(t: number) {
  if (t < 3) return [5]
  if (t < T.detect) return [0]
  if (t < T.lifted) return [5]
  if (t < T.deposited) return [4, 5]
  if (t < T.verify) return [5]
  if (t < 33) return [1]
  if (t < 37) return []
  if (t < T.decide) return [5, 6]
  if (t < T.respond) return [2, 7]
  if (t < 60.5) return [2]
  if (t < T.droneOpen) return [0, 3]
  if (t < T.droneClosed) return [7]
  if (t < T.resolve) return [0, 3]
  return [5, 6]
}
/** Explicit fictional roles in a shared atlas. Authored shot selection and projected separation keep phone text readable. */
export function Labels({ clock }: { clock: WorldProps['clock'] }) {
  const root = useRef<Group>(null)
  const built = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512
    const c = canvas.getContext('2d')!
    texts.forEach((s, i) => { c.fillStyle = '#f0ebde'; c.fillRect(0, i * 64, 512, 60); c.fillStyle = i < 2 ? '#7e3425' : '#263e42'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 256, i * 64 + 30) })
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; map.magFilter = map.minFilter = LinearFilter; map.generateMipmaps = false
    const mat = new MeshBasicMaterial({ map, transparent: true, depthTest: false, depthWrite: false })
    const geos = texts.map((_, i) => { const g = new PlaneGeometry(1, 1), uv = g.attributes.uv; for (let j = 0; j < uv.count; j++) uv.setY(j, 1 - (i + 1) / 8 + uv.getY(j) / 8); return g })
    const lines = new BufferGeometry(); lines.setAttribute('position', new Float32BufferAttribute(new Float32Array(48), 3))
    return { map, mat, geos, lines, point: new Vector3(), projected: new Vector3(), local: new Vector3() }
  }, [])
  useEffect(() => () => { built.geos.forEach(g => g.dispose()); built.lines.dispose(); built.mat.dispose(); built.map.dispose() }, [built])
  useFrame(({ camera, size }) => {
    camera.updateMatrixWorld()
    const t = clock.current.time, poses = ['insider', 'driver', 'supervisor', 'attendant'].map(role => actorPose(role as 'insider' | 'driver' | 'supervisor' | 'attendant', t)), p = transferPose(t).load, drone = dronePose(t).position
    const positions: Vec3[] = [...poses.map(v => [v.position[0], v.position[1] + (v.seated ? 2.55 : 2.12), v.position[2]] as Vec3), [load.x, .5, load.bayZ], [p[0], p[1] + 3.22, p[2]], [22.1, 2.3, 0], [drone[0], drone[1] + 1.25, drone[2]]]
    const active = visibleLabels(t), boxes: { x: number; y: number }[] = [], lines = built.lines.attributes.position
    let count = 0
    root.current!.children.forEach((o, i) => {
      o.visible = active.includes(i); if (!o.visible) return
      built.point.set(...positions[i]); built.projected.copy(built.point).project(camera); built.local.copy(built.point).applyMatrix4(camera.matrixWorldInverse)
      if (built.local.z >= -.5 || Math.abs(built.projected.x) > 1.3 || Math.abs(built.projected.y) > 1.3) { o.visible = false; return }
      const w = 190, h = 26, initialX = (built.projected.x + 1) * size.width / 2, initialY = (1 - built.projected.y) * size.height / 2
      const x = Math.max(w / 2 + 8, Math.min(size.width - w / 2 - 8, initialX))
      let y = Math.max(72, Math.min(size.height - 62, initialY))
      for (const b of boxes) if (Math.abs(x - b.x) < w + 5 && Math.abs(y - b.y) < h + 5) y = b.y + h + 7 < size.height - 62 ? b.y + h + 7 : b.y - h - 7
      boxes.push({ x, y })
      built.projected.x = x / size.width * 2 - 1; built.projected.y = 1 - y / size.height * 2; built.projected.unproject(camera)
      o.position.copy(built.projected); o.quaternion.copy(camera.quaternion)
      const worldPerPixel = -2 * built.local.z * Math.tan(('fov' in camera ? Number(camera.fov) : 44) * Math.PI / 360) / size.height
      o.scale.set(w * worldPerPixel, h * worldPerPixel, 1)
      if (Math.hypot(initialX - x, initialY - y) > 12) { lines.setXYZ(count++, ...positions[i]); lines.setXYZ(count++, o.position.x, o.position.y, o.position.z) }
    })
    built.lines.setDrawRange(0, count); lines.needsUpdate = true; built.lines.computeBoundingSphere()
  })
  return <><group ref={root} name="incident-role-labels">{built.geos.map((g, i) => <mesh name={`role-label-${i}`} key={i} geometry={g} material={built.mat} dispose={null} />)}</group><lineSegments geometry={built.lines} frustumCulled={false}><lineBasicMaterial color="#cfc7ad" transparent opacity={.75} depthWrite={false} /></lineSegments></>
}
