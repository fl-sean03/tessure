'use client'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry, BufferGeometry, Color, CylinderGeometry, DataTexture, DoubleSide, ExtrudeGeometry,
  Float32BufferAttribute, Group, InstancedMesh, LinearFilter, LinearMipmapLinearFilter, MeshStandardMaterial, Object3D,
  Quaternion, RepeatWrapping, RGBAFormat, Shape, SphereGeometry,
  TorusGeometry, TubeGeometry, Vector3, CatmullRomCurve3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Vec3, WorldProps } from './contract'
import { mix, progress, seeded, smooth } from './math'

type Part = { geometry: BufferGeometry; material: MeshStandardMaterial }
type Finish = 'concrete' | 'cut' | 'earth' | 'asphalt' | 'stone' | 'sand' | 'chalk' | 'paint' | 'rust' | 'rustLight' | 'slate' | 'teal' | 'glass' | 'rubber' | 'steel' | 'dark' | 'white' | 'amber' | 'red' | 'green' | 'grass' | 'leaf'
const colors: Record<Finish, string> = {
  concrete: '#9b9c94', cut: '#b4a88c', earth: '#81705c', asphalt: '#46535a', stone: '#77827a', sand: '#bbac8a',
  chalk: '#d4cdb7', paint: '#d2c9ac', rust: '#94523f', rustLight: '#b36b50', slate: '#3c535d', teal: '#577879',
  glass: '#294c5a', rubber: '#252e32', steel: '#99a6a5', dark: '#283e43', white: '#d9d5c2', amber: '#efb854',
  red: '#d47453', green: '#82bda2', grass: '#737d60', leaf: '#6a7b60',
}
/** Repeatable surface grain. No photography, network textures or identifying markings. */
function grain(color: string, amount: number, repeat: number) {
  const base = new Color(color), data = new Uint8Array(128 * 128 * 4)
  for (let i = 0; i < 128 * 128; i++) {
    const v = 1 + (seeded(i * 0.923) - 0.5) * amount
    data[i * 4] = Math.min(255, base.r * v * 255); data[i * 4 + 1] = Math.min(255, base.g * v * 255); data[i * 4 + 2] = Math.min(255, base.b * v * 255); data[i * 4 + 3] = 255
  }
  const tex = new DataTexture(data, 128, 128, RGBAFormat)
  // Values above are linear; an untagged data texture preserves them.
  tex.magFilter = LinearFilter; tex.minFilter = LinearMipmapLinearFilter; tex.generateMipmaps = true;
  tex.wrapS = tex.wrapT = RepeatWrapping; tex.repeat.set(repeat, repeat); tex.needsUpdate = true
  return tex
}
function createMaterials() {
  const result = {} as Record<Finish, MeshStandardMaterial>
  for (const key of Object.keys(colors) as Finish[]) {
    result[key] = new MeshStandardMaterial({ color: colors[key], roughness: 0.77, metalness: 0 })
  }
  for (const key of ['asphalt', 'concrete', 'earth', 'sand'] as Finish[]) {
    result[key].color.set('#ffffff'); result[key].map = grain(colors[key], key === 'asphalt' ? 0.12 : 0.07, key === 'asphalt' ? 5 : 3); result[key].roughness = 0.97
  }
  result.steel.metalness = 0.75; result.steel.roughness = 0.33
  result.glass.metalness = 0.28; result.glass.roughness = 0.18
  result.paint.roughness = 0.36; result.paint.metalness = 0.13
  result.rust.roughness = 0.72; result.rustLight.roughness = 0.64
  result.slate.roughness = 0.48; result.slate.metalness = 0.25
  result.white.roughness = 0.8
  for (const key of ['amber', 'red', 'green'] as Finish[]) {
    result[key].emissive.set(colors[key]); result[key].emissiveIntensity = 0.7; result[key].roughness = 0.28
  }
  return result
}
function assembly(materials: Record<Finish, MeshStandardMaterial>, high: boolean) {
  const bins = new Map<Finish, BufferGeometry[]>()
  function put(g: BufferGeometry, finish: Finish, p: Vec3 = [0, 0, 0], r: Vec3 = [0, 0, 0], s: Vec3 = [1, 1, 1]) {
    const o = new Object3D(); o.position.set(...p); o.rotation.set(...r); o.scale.set(...s); o.updateMatrix(); g.applyMatrix4(o.matrix)
    if (g.index) g = g.toNonIndexed()
    if (!g.attributes.uv) g.setAttribute('uv', new Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    bins.set(finish, [...(bins.get(finish) || []), g])
  }
  function box(p: Vec3, s: Vec3, f: Finish, bevel = 0.04, r: Vec3 = [0, 0, 0]) {
    put(bevel ? new RoundedBoxGeometry(s[0], s[1], s[2], high ? 2 : 1, Math.min(bevel, Math.min(...s) * 0.4)) : new BoxGeometry(...s), f, p, r)
  }
  function cylinder(p: Vec3, radius: number, length: number, f: Finish, r: Vec3 = [0, 0, 0], radiusTop = radius) {
    put(new CylinderGeometry(radiusTop, radius, length, high ? 16 : 10), f, p, r)
  }
  function beam(a: Vec3, b: Vec3, radius: number, f: Finish) {
    const start = new Vector3(...a), end = new Vector3(...b), delta = end.clone().sub(start)
    const g = new CylinderGeometry(radius, radius, delta.length(), high ? 12 : 8)
    g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize())); put(g, f, start.add(end).multiplyScalar(0.5).toArray() as Vec3)
  }
  function tube(points: Vec3[], radius: number, f: Finish) { put(new TubeGeometry(new CatmullRomCurve3(points.map(p => new Vector3(...p))), high ? 20 : 12, radius, high ? 10 : 6, false), f) }
  function slab(p: Vec3, w: number, d: number, h: number, radius: number, f: Finish) {
    const shape = new Shape(), x = -w / 2, z = -d / 2
    shape.moveTo(x + radius, z); shape.lineTo(x + w - radius, z); shape.quadraticCurveTo(x + w, z, x + w, z + radius)
    shape.lineTo(x + w, z + d - radius); shape.quadraticCurveTo(x + w, z + d, x + w - radius, z + d)
    shape.lineTo(x + radius, z + d); shape.quadraticCurveTo(x, z + d, x, z + d - radius)
    shape.lineTo(x, z + radius); shape.quadraticCurveTo(x, z, x + radius, z)
    const g = new ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.035, bevelSegments: 1, steps: 1, curveSegments: high ? 10 : 6 })
    g.rotateX(-Math.PI / 2); put(g, f, p)
  }
  function finish(): Part[] {
    return [...bins].map(([name, list]) => {
      const geometry = mergeGeometries(list, false)!
      list.forEach(g => g.dispose()); return { geometry, material: materials[name] }
    })
  }
  return { put, box, cylinder, beam, tube, slab, finish }
}
function makeSite(m: Record<Finish, MeshStandardMaterial>, high: boolean) {
  const a = assembly(m, high)
  // A cut landscape, with an irregular planted edge and a pavement section of visible depth.
  a.slab([0, -2.1, 0], 53, 35, 0.8, 6, 'earth')
  a.slab([0, -1.35, 0], 52.5, 34.5, 0.7, 5.8, 'cut')
  a.slab([0, -0.65, 0], 52, 34, 0.62, 5.6, 'stone')
  a.slab([0, -0.04, 0], 50.8, 32.8, 0.12, 5, 'sand')
  a.slab([0, 0.02, -1], 49.5, 26, 0.1, 4, 'asphalt')
  a.slab([0, 0.13, 11.8], 43, 4.5, 0.18, 2.1, 'concrete')
  a.slab([-3, 0.33, 11.8], 35, 3.8, 0.1, 1.8, 'grass')
  a.slab([15, 0.13, -2.5], 11.5, 8.4, 0.3, 1.3, 'concrete')
  // Main approach: lane paint, stop line, drain channels, service crossing.
  for (let x = -23; x < 23; x += 5) a.box([x, 0.174, 7.8], [2.3, 0.015, 0.11], 'white', 0)
  for (const z of [-0.7, 9.1]) a.box([0, 0.175, z], [47, 0.018, 0.1], 'white', 0)
  a.box([5.3, 0.18, 4.1], [0.33, 0.025, 8.3], 'white', 0)
  for (let i = 0; i < 7; i++) a.box([17, 0.18, 0.15 + i * 1.25], [2.3, 0.02, 0.55], 'white', 0)
  for (const x of [-3.5, 14]) {
    a.box([x, 0.174, -0.12], [2.2, 0.025, 0.43], 'dark', 0)
    for (let i = 0; i < 10; i++) a.box([x - 1 + i * 0.22, 0.166, -0.12], [0.045, 0.025, 0.38], 'steel', 0)
  }
  // Painted parking corners and empty trailer space.
  for (let i = 0; i < 4; i++) { const x = -19 + i * 4.3; a.box([x, 0.177, -4.1], [0.075, 0.012, 3.2], 'chalk', 0) }
  // Cargo stacks: actual corner castings, frames, corrugation, roof seams and twin locking doors.
  function container(x: number, y: number, z: number, length: number, color: Finish) {
    a.box([x, y + 1.34, z], [length, 2.6, 2.45], color, 0.075)
    for (const side of [-1, 1]) {
      a.box([x, y + 0.09, z + side * 1.24], [length + 0.06, 0.14, 0.12], 'dark', 0.018)
      a.box([x, y + 2.59, z + side * 1.24], [length + 0.03, 0.1, 0.1], color, 0.015)
      for (let r = -length / 2 + 0.28; r < length / 2 - 0.15; r += high ? 0.35 : 0.5) a.box([x + r, y + 1.36, z + side * 1.246], [0.095, 2.37, 0.065], color, 0)
      for (const end of [-1, 1]) {
        a.box([x + end * (length / 2 - 0.06), y + 1.34, z + side * 1.23], [0.15, 2.7, 0.16], color, 0.022)
        a.box([x + end * (length / 2 - 0.06), y + 2.65, z + side * 1.23], [0.19, 0.13, 0.18], 'steel', 0.018)
      }
    }
    for (let r = -length / 2 + 0.25; r < length / 2; r += 0.43) a.box([x + r, y + 2.65, z], [0.08, 0.045, 2.2], color, 0)
    for (const side of [-1, 1]) {
      a.box([x + length / 2 + 0.025, y + 1.35, z + side * 0.57], [0.045, 2.4, 1.1], color, 0)
      for (const offset of [-0.36, 0.36]) a.cylinder([x + length / 2 + 0.07, y + 1.36, z + side * 0.57 + offset], 0.025, 2.16, 'steel')
      a.box([x + length / 2 + 0.11, y + 1.1, z + side * 0.57], [0.09, 0.045, 0.4], 'steel', 0.015)
    }
    a.box([x + length / 2 - 1.2, y + 1.75, z + 1.285], [1.3, 0.34, 0.015], 'chalk', 0)
  }
  container(-12, 0.19, -7.5, 12, 'rust'); container(-12, 0.19, -10.3, 12, 'slate'); container(-10.2, 2.9, -10.3, 12, 'rustLight')
  container(1.5, 0.19, -11.3, 10, 'teal'); container(-20, 0.19, -9, 3.3, 'slate')
  // A reach-stacker silhouette beyond the cargo: counterweight, large pneumatic wheels, telescoping boom.
  a.box([-3.8, 1.1, -6], [4.6, 1.2, 2.7], 'amber', 0.24)
  a.box([-5.1, 1.9, -6], [1.6, 1.2, 2.3], 'slate', 0.22)
  a.box([-3.3, 2.7, -6], [1.6, 2, 1.95], 'dark', 0.13)
  a.box([-3.2, 3, -4.99], [1.32, 1.1, 0.04], 'glass', 0.025)
  for (const x of [-5.2, -2.4]) for (const z of [-7.42, -4.58]) { a.cylinder([x, 0.89, z], 0.76, 0.52, 'rubber', [Math.PI / 2, 0, 0]); a.cylinder([x, 0.89, z + (z < -6 ? -0.28 : 0.28)], 0.35, 0.04, 'steel', [Math.PI / 2, 0, 0]) }
  a.box([-2.4, 4.35, -6.4], [5.8, 0.64, 0.8], 'slate', 0.06, [0, 0, 0.55]); a.box([0.1, 5.9, -6.4], [2.6, 0.48, 0.6], 'steel', 0.04, [0, 0, 0.55]); a.beam([-3.7, 2.2, -6], [-1, 4.8, -6], 0.11, 'steel')
  a.box([1.4, 6.6, -6.4], [0.8, 0.3, 3.8], 'amber', 0.055)
  // Gate pavilion: plinth, masonry service core, glazed room, deep floating fascia, mullions, louvres.
  a.slab([13.7, 0.45, -3], 7.8, 5.6, 0.25, 0.65, 'chalk')
  a.box([15.9, 2.25, -3.2], [2.4, 3.15, 4.4], 'chalk', 0.15)
  a.box([12.1, 1.06, -3.2], [5.1, 0.72, 4.4], 'concrete', 0.07)
  a.box([12, 2.4, -0.995], [4.9, 2.05, 0.06], 'glass', 0.014)
  a.box([9.62, 2.4, -3.2], [0.06, 2.05, 4.35], 'glass', 0.014)
  a.box([12, 2.4, -5.395], [4.9, 2.05, 0.06], 'glass', 0.014)
  for (const x of [9.59, 11.2, 12.85, 14.45]) for (const z of [-0.94, -5.43]) a.box([x, 2.4, z], [0.08, 2.22, 0.12], 'dark', 0.01)
  for (const z of [-2.4, -4.2]) a.box([9.56, 2.4, z], [0.11, 2.22, 0.08], 'dark', 0.01)
  a.box([13.7, 3.65, -3], [8.7, 0.33, 6.25], 'slate', 0.1)
  a.box([13.7, 3.87, -3], [8.45, 0.12, 6], 'concrete', 0.05)
  a.box([13.7, 3.77, 0.08], [8.7, 0.08, 0.07], 'steel', 0.01)
  a.box([16.1, 2.2, -0.945], [1.15, 2.25, 0.08], 'slate', 0.03)
  a.cylinder([15.74, 2.15, -0.88], 0.035, 0.28, 'steel')
  for (let i = 0; i < 7; i++) a.box([17.14, 2.35 + i * 0.15, -3.3], [0.08, 0.05, 2.8], 'slate', 0)
  // Solar shade and rooftop ventilation plant.
  for (let i = 0; i < 3; i++) { a.box([12 + i * 1.5, 4.08, -3.9], [1.32, 0.08, 2.4], 'glass', 0.025, [-0.13, 0, 0]); for (let j = 0; j < 4; j++) a.box([12 + i * 1.5, 4.09 - j * 0.062, -4.8 + j * 0.5], [1.31, 0.025, 0.022], 'steel', 0) }
  a.box([16.3, 4.12, -4.7], [1.05, 0.47, 1.1], 'chalk', 0.07)
  a.cylinder([16.3, 4.38, -4.7], 0.38, 0.05, 'slate')
  // Deep gate canopy and narrow industrial beams: support feet touch their raised islands.
  a.slab([7.8, 0.14, -0.25], 2.1, 3.7, 0.3, 0.75, 'concrete')
  a.slab([7.8, 0.14, 9], 2.1, 2.6, 0.3, 0.7, 'concrete')
  for (const z of [-0.6, 9.2]) {
    a.box([7.8, 3.1, z], [0.27, 5.6, 0.31], 'slate', 0.035)
    a.box([7.8, 0.52, z], [0.59, 0.13, 0.59], 'steel', 0.03)
    for (const x of [-0.2, 0.2]) a.cylinder([7.8 + x, 0.61, z], 0.035, 0.08, 'dark')
  }
  a.box([7.8, 5.95, 4.3], [0.64, 0.36, 11.2], 'slate', 0.09)
  a.box([7.8, 6.15, 4.3], [0.66, 0.1, 11.08], 'steel', 0.025)
  for (const z of [1, 4.4, 7.8]) a.box([7.6, 5.73, z], [0.42, 0.05, 0.28], 'amber', 0.014)
  // Gate and bollards. The barrier remains closed: this story never invents release authorisation.
  a.box([7.4, 1.04, 8.55], [0.65, 1.27, 0.78], 'chalk', 0.1)
  a.box([7.4, 1.67, 4.5], [0.15, 0.16, 8.5], 'white', 0.045)
  for (let i = 0; i < 9; i++) a.box([7.49, 1.67, 0.65 + i * 0.9], [0.014, 0.165, 0.34], 'rust', 0)
  for (const [x, z] of [[6.4, -0.25], [8.8, -0.25], [6.4, 9], [8.8, 9], [10.2, 0.4], [12.5, 0.4], [14.8, 0.4], [17.1, 0.4]]) {
    a.cylinder([x, 0.88, z], 0.12, 1.16, 'amber'); a.cylinder([x, 1.1, z], 0.123, 0.19, 'slate'); a.cylinder([x, 0.31, z], 0.2, 0.1, 'dark')
  }
  a.box([7.5, 2.23, -0.48], [0.38, 0.73, 0.3], 'dark', 0.075)
  a.cylinder([7.29, 2.4, -0.48], 0.1, 0.055, 'amber', [0, 0, Math.PI / 2])
  a.cylinder([7.29, 2.09, -0.48], 0.1, 0.055, 'dark', [0, 0, Math.PI / 2])
  // Welded mesh boundary, protected paving, equipment enclosures.
  for (let i = 0; i < 12; i++) {
    const x = -22 + i * 2.5
    a.cylinder([x, 1.4, -2], 0.05, 2.55, 'steel')
    if (i < 11) { for (let j = 0; j < 7; j++) a.box([x + 1.25, 0.42 + j * 0.32, -2], [2.5, 0.018, 0.018], 'steel', 0); for (let j = 1; j < 10; j++) a.box([x + j * 0.25, 1.4, -2], [0.015, 2.35, 0.015], 'steel', 0) }
  }
  for (let i = 0; i < 3; i++) {
    a.box([20.7, 0.88, -6.5 - i * 1.28], [1.1, 1.5, 0.94], 'chalk', 0.1)
    a.box([20.11, 0.9, -6.5 - i * 1.28], [0.05, 1.15, 0.72], 'steel', 0.015)
    a.box([20.05, 1.03, -6.5 - i * 1.28], [0.035, 0.22, 0.06], 'dark', 0.01)
  }
  // Poles have tapered shafts, a real neck, camera housings and black optical faces.
  for (const [x, z, h, dir] of [[-14, 9.7, 6.5, 1], [3, -1.4, 6.3, 1], [14, 8.9, 5.8, -1]]) {
    a.cylinder([x, 0.25 + h / 2, z], 0.12, h, 'steel', [0, 0, 0], 0.065)
    a.box([x, 0.26, z], [0.55, 0.24, 0.55], 'concrete', 0.05)
    a.tube([[x, h, z], [x, h + 0.3, z], [x + dir * 0.4, h + 0.45, z], [x + dir * 0.7, h + 0.45, z]], 0.065, 'steel')
    a.box([x + dir * 0.75, h + 0.42, z], [0.7, 0.27, 0.32], 'chalk', 0.1)
    a.box([x + dir * 1.11, h + 0.42, z], [0.025, 0.19, 0.24], 'dark', 0.035)
    a.cylinder([x + dir * 1.14, h + 0.42, z], 0.067, 0.035, 'glass', [0, 0, Math.PI / 2])
    a.box([x, h - 1.1, z + 0.12], [0.34, 0.55, 0.22], 'chalk', 0.08)
  }
  // Planting retains an irregular silhouette; sparse rounded grasses and rocks provide metre cues.
  for (let i = 0; i < (high ? 42 : 25); i++) {
    const x = -19 + seeded(i + 5) * 34, z = 10.5 + seeded(i + 55) * 2.8
    a.put(new SphereGeometry(1, 7, 5), 'stone', [x, 0.55, z], [seeded(i), seeded(i + 1), 0], [0.15 + seeded(i) * 0.24, 0.12, 0.14 + seeded(i + 7) * 0.25])
  }
  // Back verge: native shrub masses with crooked trunks, no cone tree placeholders.
  for (const [x, z, scale] of [[-23, -13, 1], [22, -11, 1.3], [23, 11, 1.1]]) {
    a.tube([[x, 0.1, z], [x + 0.12, 1.5, z], [x - 0.2, 2.5, z + 0.2]], 0.13, 'earth')
    for (let i = 0; i < (high ? 9 : 6); i++) {
      const angle = i * 2.4, radius = 0.2 + seeded(i + 17) * 1.15
      a.put(new SphereGeometry(1, 9, 7), i % 3 ? 'leaf' : 'grass', [x + Math.cos(angle) * radius * scale, 2.4 + seeded(i + 30) * 1.4 * scale, z + Math.sin(angle) * radius * scale], [0, i, 0], [1.05 * scale, (0.8 + seeded(i + 2) * 0.35) * scale, 0.86 * scale])
    }
  }
  return a.finish()
}
function makeTruck(m: Record<Finish, MeshStandardMaterial>, high: boolean) {
  const a = assembly(m, high)
  // Heading +X. A fifth-wheel tractor and a separately proportioned 20-foot container trailer.
  a.box([-2.3, 1.07, 0], [10.2, 0.35, 2.4], 'dark', 0.09)
  a.box([-3.7, 1.38, 0], [7.3, 0.26, 2.65], 'steel', 0.04)
  a.box([-3.7, 2.84, 0], [6.55, 2.63, 2.46], 'rust', 0.065)
  for (const z of [-1.255, 1.255]) {
    for (let i = 0; i < (high ? 22 : 16); i++) a.box([-6.8 + i * (high ? 0.294 : 0.407), 2.85, z], [0.082, 2.37, 0.065], 'rustLight', 0)
    for (const y of [1.55, 4.13]) a.box([-3.7, y, z], [6.65, 0.1, 0.12], 'rustLight', 0.015)
    for (const x of [-6.98, -0.42]) a.box([x, 2.85, z], [0.13, 2.75, 0.13], 'rustLight', 0.02)
    a.box([-4.7, 3.13, z * 1.035], [1.2, 0.3, 0.02], 'chalk', 0)
  }
  for (let i = 0; i < 20; i++) a.box([-6.8 + i * 0.325, 4.18, 0], [0.075, 0.045, 2.3], 'rustLight', 0)
  for (const z of [-0.82, -0.28, 0.28, 0.82]) a.cylinder([-7.03, 2.84, z], 0.023, 2.4, 'steel')
  // Rounded cab, dropped bumper, aerodynamic roof, recessed windscreen and service grille.
  a.box([1.65, 2.01, 0], [2.87, 2.35, 2.48], 'paint', 0.3)
  a.box([1.2, 3.24, 0], [2.35, 0.48, 2.36], 'paint', 0.22)
  a.box([3.01, 2.54, 0], [0.1, 0.95, 2.08], 'glass', 0.05, [0, 0, 0.105])
  a.box([3.09, 2.54, 0], [0.07, 0.95, 0.058], 'dark', 0.02)
  for (const z of [-1.251, 1.251]) {
    a.box([1.86, 2.6, z], [1.75, 0.91, 0.038], 'glass', 0.09)
    a.box([0.98, 2.6, z * 1.014], [0.07, 1.04, 0.045], 'paint', 0.01)
    a.box([1.17, 1.93, z * 1.019], [0.26, 0.046, 0.045], 'steel', 0.015)
    a.box([1.42, 0.93, z * 0.9], [1.3, 0.19, 0.5], 'steel', 0.035)
    a.tube([[2.55, 2.65, z], [2.65, 2.65, z * 1.2], [2.4, 2.65, z * 1.29]], 0.035, 'dark')
    a.box([2.34, 2.55, z * 1.31], [0.22, 0.43, 0.16], 'dark', 0.065)
  }
  a.box([3.11, 1.6, 0], [0.05, 0.61, 1.35], 'dark', 0.055)
  for (let i = 0; i < 5; i++) a.box([3.15, 1.36 + i * 0.11, 0], [0.025, 0.028, 1.26], 'steel', 0)
  a.box([3.11, 1.01, 0], [0.18, 0.35, 2.52], 'slate', 0.06)
  for (const z of [-0.94, 0.94]) a.box([3.2, 1.43, z], [0.04, 0.28, 0.36], 'white', 0.04)
  a.cylinder([0.08, 1.15, 0.96], 0.35, 1.25, 'steel', [0, 0, Math.PI / 2])
  // Twin tyres, dark wheel wells and concentric hub/rim rings rather than cylinders alone.
  for (const x of [-5.93, -4.61, -0.12, 2.15]) for (const z of [-1.24, 1.24]) {
    a.cylinder([x, 0.7, z], 0.61, 0.42, 'rubber', [Math.PI / 2, 0, 0])
    a.cylinder([x, 0.7, z + Math.sign(z) * 0.23], 0.38, 0.05, 'steel', [Math.PI / 2, 0, 0])
    a.cylinder([x, 0.7, z + Math.sign(z) * 0.265], 0.17, 0.08, 'slate', [Math.PI / 2, 0, 0])
    a.put(new TorusGeometry(0.48, 0.048, high ? 8 : 5, high ? 24 : 16), 'rubber', [x, 0.7, z + Math.sign(z) * 0.245])
    if (high) for (let i = 0; i < 6; i++) a.cylinder([x + Math.cos(i * Math.PI / 3) * 0.25, 0.7 + Math.sin(i * Math.PI / 3) * 0.25, z + Math.sign(z) * 0.27], 0.025, 0.035, 'dark', [Math.PI / 2, 0, 0])
  }
  a.box([-5.3, 1.38, 0], [3.2, 0.11, 3], 'slate', 0.04)
  for (const z of [-1.05, 1.05]) { a.box([-7.25, 1.14, z], [0.07, 0.22, 0.36], 'red', 0.025); a.box([-7.25, 1.1, z * 0.62], [0.08, 0.11, 0.23], 'amber', 0.025) }
  a.box([-7.4, 0.79, 0], [0.2, 0.16, 2.6], 'steel', 0.03)
  return a.finish()
}
function makeWorker(m: Record<Finish, MeshStandardMaterial>, high: boolean) {
  const a = assembly(m, high)
  a.box([0, 1.07, 0], [0.4, 0.57, 0.28], 'amber', 0.12)
  a.box([0, 1.12, 0.176], [0.36, 0.07, 0.018], 'white', 0)
  a.put(new SphereGeometry(0.174, 12, 10), 'sand', [0, 1.53, 0])
  a.put(new SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 'chalk', [0, 1.56, 0])
  a.cylinder([0, 1.55, 0], 0.19, 0.036, 'chalk')
  for (const s of [-1, 1]) { a.beam([s * 0.11, 0.83, 0], [s * 0.14, 0.16, s * 0.06], 0.085, 'slate'); a.box([s * 0.14, 0.1, 0.07 + s * 0.06], [0.2, 0.16, 0.32], 'dark', 0.065); a.beam([s * 0.25, 1.25, 0], [s * 0.3, 0.81, 0.08], 0.067, 'amber') }
  return a.finish()
}
function Parts({ parts }: { parts: Part[] }) { return <>{parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} castShadow receiveShadow />)}</> }
function Grass({ high }: { high: boolean }) {
  const ref = useRef<InstancedMesh>(null), count = high ? 240 : 110
  const geo = useMemo(() => {
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute([-0.025, 0, 0, 0.025, 0, 0, 0.15, 0.48, 0, 0, 0, -0.025, 0, 0, 0.025, -0.12, 0.36, 0.12], 3)); g.computeVertexNormals(); return g
  }, [])
  // Constructor arguments are external resources; R3F does not own this geometry.
  useEffect(() => () => geo.dispose(), [geo])
  useLayoutEffect(() => {
    const d = new Object3D()
    for (let i = 0; i < count; i++) {
      d.position.set(-19 + seeded(i * 5 + 1) * 33, 0.46, 10.6 + seeded(i * 5 + 2) * 2.65); d.rotation.y = seeded(i * 5 + 3) * 6.28; d.scale.setScalar(0.65 + seeded(i * 5 + 4) * 1.2); d.updateMatrix(); ref.current!.setMatrixAt(i, d.matrix)
    }
    ref.current!.instanceMatrix.needsUpdate = true; ref.current!.computeBoundingSphere()
  }, [count])
  return <instancedMesh ref={ref} args={[geo, undefined, count]} receiveShadow><meshStandardMaterial color="#929376" roughness={1} side={DoubleSide} /></instancedMesh>
}
function contactTexture() {
  const data = new Uint8Array(64 * 64 * 4)
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const i = (y * 64 + x) * 4, u = (x / 63 - 0.5) * 2, v = (y / 63 - 0.5) * 2
    data[i] = data[i + 1] = data[i + 2] = 255
    data[i + 3] = Math.round(Math.exp(-3.8 * (Math.pow(u, 6) + Math.pow(v, 6))) * 255)
  }
  const texture = new DataTexture(data, 64, 64, RGBAFormat); texture.magFilter = LinearFilter; texture.minFilter = LinearFilter; texture.needsUpdate = true
  return texture
}
function Contact({ texture, position, size, opacity = 0.3 }: { texture: DataTexture; position: Vec3; size: [number, number]; opacity?: number }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={size} /><meshBasicMaterial color="#1c3036" map={texture} transparent opacity={opacity} depthWrite={false} /></mesh>
}
function vehicleX(t: number) { return t < 4 ? mix(-11, -7.4, t / 4) : t < 14 ? mix(-7.4, 1.25, 1 - Math.pow(1 - progress(t, 4, 14), 2)) : 1.25 }
function Observation({ from, destination, color, clock, start }: { from: Vec3; destination: Vec3; color: string; clock: WorldProps['clock']; start: number }) {
  const group = useRef<Group>(null), pulse = useRef<Group>(null)
  const curve = useMemo(() => {
    const mid: Vec3 = [(from[0] + destination[0]) / 2, Math.max(from[1], destination[1]) + 1.7, (from[2] + destination[2]) / 2]
    return new CatmullRomCurve3([new Vector3(...from), new Vector3(...mid), new Vector3(...destination)])
  }, [from[0], from[1], from[2], destination[0], destination[1], destination[2]])
  const geometry = useMemo(() => new TubeGeometry(curve, 36, 0.055, 5, false), [curve])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(() => {
    const t = clock.current.time, visible = t >= start && t < 43
    if (group.current) group.current.visible = visible
    const endX = vehicleX(t) - 1.3
    curve.points[2].x = endX
    curve.points[1].x = (from[0] + endX) / 2
    // Refill the small tube in place: no per-frame GPU allocation, deterministic after seeking.
    const vertices = geometry.attributes.position
    const point = new Vector3(), tangent = new Vector3(), side = new Vector3(), up = new Vector3()
    for (let i = 0; i <= 36; i++) {
      curve.getPoint(i / 36, point); curve.getTangent(i / 36, tangent)
      side.crossVectors(tangent, new Vector3(0, 1, 0)).normalize(); up.crossVectors(side, tangent).normalize()
      for (let j = 0; j <= 5; j++) { const angle = j / 5 * Math.PI * 2, radius = 0.055; vertices.setXYZ(i * 6 + j, point.x + radius * (side.x * Math.cos(angle) + up.x * Math.sin(angle)), point.y + radius * (side.y * Math.cos(angle) + up.y * Math.sin(angle)), point.z + radius * (side.z * Math.cos(angle) + up.z * Math.sin(angle))) }
    }
    vertices.needsUpdate = true; geometry.computeBoundingSphere()
    if (pulse.current) { const p = curve.getPoint(((Math.max(0, t - start) * 0.24) % 1)); pulse.current.position.copy(p) }
  })
  return <group ref={group} visible={false}>
    <mesh geometry={geometry}><meshBasicMaterial color={color} transparent opacity={0.62} depthWrite={false} /></mesh>
    <group ref={pulse}><mesh><sphereGeometry args={[0.15, 10, 8]} /><meshBasicMaterial color={color} /></mesh></group>
    <mesh position={from}><sphereGeometry args={[0.16, 10, 8]} /><meshBasicMaterial color={color} /></mesh>
  </group>
}
/** Golden reference: batched, authored geometry. Its clock can be sought in either direction. */
export function ReferenceWorld({ clock, layers, quality }: WorldProps) {
  const high = quality === 'high', truck = useRef<Group>(null), worker = useRef<Group>(null), marker = useRef<Group>(null), brake = useRef<Group>(null)
  const materials = useMemo(createMaterials, [])
  const contact = useMemo(contactTexture, [])
  useEffect(() => () => contact.dispose(), [contact])
  const site = useMemo(() => makeSite(materials, high), [materials, high])
  const vehicle = useMemo(() => makeTruck(materials, high), [materials, high])
  const person = useMemo(() => makeWorker(materials, high), [materials, high])
  useEffect(() => () => { [...site, ...vehicle, ...person].forEach(p => p.geometry.dispose()) }, [site, vehicle, person])
  useEffect(() => () => Object.values(materials).forEach(m => { m.map?.dispose(); m.dispose() }), [materials])
  useFrame(() => {
    const t = clock.current.time
    // Constant approach becomes a gentle deceleration, then a real hold well before the barrier.
    const x = vehicleX(t)
    if (truck.current) truck.current.position.set(x, 0.065, 4.2)
    if (worker.current) { const p = smooth(progress(t, 30, 35)); worker.current.position.set(mix(13.1, 8.85, p), 0.44 - 0.3 * p, mix(-0.05, 2.1, p)); worker.current.rotation.y = -Math.PI / 2; worker.current.rotation.z = t > 30 && t < 35 ? Math.sin(t * 7) * 0.035 : 0 }
    if (marker.current) { marker.current.visible = t >= 11; marker.current.position.set(x - 1.4, 0.18, 4.2); const scale = 1 + Math.sin(t * 1.4) * 0.025; marker.current.scale.setScalar(scale) }
    if (brake.current) brake.current.visible = t >= 8
  })
  return <group>
    <Parts parts={site} /><Grass high={high} />
    <Contact texture={contact} position={[-12, 0.174, -8.9]} size={[14.4, 6.8]} opacity={0.38} />
    <Contact texture={contact} position={[1.5, 0.175, -11.3]} size={[12, 3.8]} opacity={0.34} />
    <Contact texture={contact} position={[13.6, 0.48, -3]} size={[9.6, 6.8]} opacity={0.25} />
    <Contact texture={contact} position={[-3.8, 0.176, -6]} size={[6.6, 4]} opacity={0.4} />
    <group ref={truck} position={[-11, 0.065, 4.2]}><Parts parts={vehicle} />
      <Contact texture={contact} position={[-2, 0.11, 0]} size={[12.7, 4.1]} opacity={0.42} />
      <group ref={brake} visible={false}>{[-1.05, 1.05].map(z => <mesh key={z} position={[-7.302, 1.14, z]}><sphereGeometry args={[0.09, 12, 8]} /><meshBasicMaterial color="#ffbc72" /></mesh>)}</group>
    </group>
    <group ref={worker} position={[13.1, 0.44, -0.05]}><Parts parts={person} /></group>
    {layers.tracks && <group ref={marker} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.45, 0.68, 1]}><ringGeometry args={[3.34, 3.38, 80]} /><meshBasicMaterial color="#e6be7f" transparent opacity={0.78} depthWrite={false} /></mesh>
    </group>}
    {layers.sensors && <>
      <Observation from={[-12.86, 6.92, 9.7]} destination={[0, 4.65, 4.2]} color="#b5d5d5" clock={clock} start={4} />
      <Observation from={[4.14, 6.72, -1.4]} destination={[0, 4.65, 4.2]} color="#8bbbab" clock={clock} start={8} />
      <Observation from={[12.86, 6.22, 8.9]} destination={[0, 4.65, 4.2]} color="#f1cc93" clock={clock} start={11} />
    </>}
    <pointLight position={[7.4, 4.3, 4.3]} color="#ffd296" intensity={high ? 20 : 12} distance={10} decay={2} />
    {high && <pointLight position={[11.6, 2.5, -2]} color="#ffdb9e" intensity={6} distance={6} decay={2} />}
  </group>
}
