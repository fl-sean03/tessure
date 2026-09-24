import {
  BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, CylinderGeometry, DataTexture,
  DoubleSide, Float32BufferAttribute, LatheGeometry, LinearFilter, LinearMipmapLinearFilter,
  MeshStandardMaterial, Object3D, Quaternion, RepeatWrapping, RGBAFormat, SphereGeometry,
  TorusGeometry, TubeGeometry, Vector2, Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Vec3 } from '../../contract'
import { seeded, smooth } from '../../math'
import { apron, apronHeight } from './surface'

export type Finish = 'earth' | 'gravel' | 'concrete' | 'sandstone' | 'steel' | 'edge' | 'paint' | 'porcelain' | 'dark' | 'glass' | 'ochre' | 'navy' | 'skin' | 'chalk' | 'leaf' | 'twig' | 'light' | 'screen'
export type Part = { geometry: BufferGeometry; material: MeshStandardMaterial }
export type Placement = { position: Vec3; scale?: Vec3; rotation?: Vec3 }
export type Materials = Record<Finish, MeshStandardMaterial>
const colors: Record<Finish, string> = {
  earth: '#8b6b49', gravel: '#8f8980', concrete: '#b8b3a3', sandstone: '#a48662',
  steel: '#82939d', edge: '#b5c7ce', paint: '#687f8a', porcelain: '#53433e', dark: '#293a47',
  glass: '#304b5e', ochre: '#c89c50', navy: '#344e66', skin: '#ae8d70', chalk: '#d1cdc0',
  leaf: '#817c56', twig: '#514c3b', light: '#f8d298', screen: '#9ebdbd',
}
function grain(amount: number, repeat: number) {
  const data = new Uint8Array(128 * 128 * 4)
  for (let i = 0; i < 128 * 128; i++) {
    const v = Math.round(240 - seeded(i * 1.09) * amount)
    data.set([v, v, v, 255], i * 4)
  }
  const t = new DataTexture(data, 128, 128, RGBAFormat)
  t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(repeat, repeat)
  t.magFilter = LinearFilter; t.minFilter = LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true
  return t
}
export function materials(): Materials {
  const m = {} as Materials
  for (const k of Object.keys(colors) as Finish[]) m[k] = new MeshStandardMaterial({ color: colors[k], roughness: 0.8 })
  for (const k of ['earth', 'gravel', 'concrete'] as Finish[]) { m[k].map = grain(k === 'gravel' ? 135 : 50, k === 'earth' ? 35 : 9); m[k].roughness = 1 }
  m.steel.metalness = 0.55; m.steel.roughness = 0.4; m.edge.metalness = 0.62; m.edge.roughness = 0.29
  m.paint.metalness = 0.23; m.paint.roughness = 0.42; m.porcelain.roughness = 0.22; m.porcelain.metalness = 0.08
  m.glass.roughness = 0.2; m.glass.metalness = 0.38
  m.light.emissive.set('#ffd69b'); m.light.emissiveIntensity = 0.62
  m.screen.emissive.set('#80b0c8'); m.screen.emissiveIntensity = 0.35
  m.leaf.side = DoubleSide
  return m
}
/** Merge static members by finish; repeating insulators and scrub use instancing. */
export function assembly(m: Materials, high: boolean, remap: Partial<Record<Finish, Finish>> = {}) {
  const bins = new Map<Finish, BufferGeometry[]>()
  function put(source: BufferGeometry, f: Finish, p: Vec3 = [0, 0, 0], r: Vec3 = [0, 0, 0], s: Vec3 = [1, 1, 1]) {
    f = remap[f] || f
    const obj = new Object3D(); obj.position.set(...p); obj.rotation.set(...r); obj.scale.set(...s); obj.updateMatrix()
    let g = source
    g.applyMatrix4(obj.matrix)
    if (g.index) { g = source.toNonIndexed(); source.dispose() }
    if (!g.attributes.uv) g.setAttribute('uv', new Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    if (!g.attributes.normal) g.computeVertexNormals()
    const list = bins.get(f) || []; list.push(g); bins.set(f, list)
  }
  function box(p: Vec3, s: Vec3, f: Finish, bevel = 0, r: Vec3 = [0, 0, 0]) {
    put(bevel ? new RoundedBoxGeometry(...s, 1, Math.min(bevel, Math.min(...s) * 0.4)) : new BoxGeometry(...s), f, p, r)
  }
  function cylinder(p: Vec3, radius: number, h: number, f: Finish, r: Vec3 = [0, 0, 0], top = radius) { put(new CylinderGeometry(top, radius, h, high ? 16 : 10), f, p, r) }
  function beam(start: Vec3, end: Vec3, radius: number, f: Finish) {
    const a = new Vector3(...start), b = new Vector3(...end), delta = b.clone().sub(a)
    const g = new CylinderGeometry(radius, radius, delta.length(), high ? 8 : 6)
    g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.normalize())); put(g, f, a.add(b).multiplyScalar(0.5).toArray() as Vec3)
  }
  function tube(points: Vec3[], radius: number, f: Finish) { put(new TubeGeometry(new CatmullRomCurve3(points.map(p => new Vector3(...p))), high ? 20 : 14, radius, high ? 8 : 6, false), f) }
  function finish(): Part[] { return [...bins].map(([f, gs]) => { const geometry = mergeGeometries(gs, false)!; gs.forEach(g => g.dispose()); return { geometry, material: m[f] } }) }
  return { put, box, cylinder, beam, tube, finish }
}
export function groundHeight(x: number, z: number) {
  const edge = smooth(Math.max(Math.abs(x) - 23, Math.abs(z) - 20) / 17)
  const hill = (cx: number, cz: number, width: number, height: number) => height * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (width * width))
  return -0.04 + edge * (hill(-36, -37, 21, 13) + hill(29, -62, 27, 21) + hill(-80, -78, 38, 28) + hill(69, 10, 30, 9) + (Math.sin(x * 0.16 + z * 0.04) + Math.cos(z * 0.13)) * 0.75)
}
export function terrain(high: boolean) {
  const n = high ? 112 : 64, size = 260, positions: number[] = [], indices: number[] = [], uvs: number[] = [], cs: number[] = []
  const base = new Color('#aa865c')
  for (let iz = 0; iz <= n; iz++) for (let ix = 0; ix <= n; ix++) {
    const x = (ix / n - 0.5) * size, z = (iz / n - 0.5) * size
    positions.push(x, groundHeight(x, z), z); uvs.push(ix / n, iz / n)
    const shade = 0.87 + 0.12 * Math.sin(x * 0.17 + z * 0.11) + 0.07 * Math.cos(z * 0.47 - x * 0.25)
    cs.push(base.r * shade, base.g * shade, base.b * shade)
    if (ix < n && iz < n) { const a = iz * (n + 1) + ix; indices.push(a, a + n + 1, a + 1, a + 1, a + n + 1, a + n + 2) }
  }
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(positions, 3)); g.setAttribute('uv', new Float32BufferAttribute(uvs, 2)); g.setAttribute('color', new Float32BufferAttribute(cs, 3)); g.setIndex(indices); g.computeVertexNormals(); return g
}
export function insulatorGeometry(high: boolean) {
  const points = [new Vector2(0.11, 0), new Vector2(0.17, 0.04)]
  for (let i = 0; i < 7; i++) { const y = 0.06 + i * 0.13; points.push(new Vector2(0.12, y), new Vector2(0.24 - i * 0.006, y + 0.045), new Vector2(0.25 - i * 0.006, y + 0.067), new Vector2(0.12, y + 0.1)) }
  points.push(new Vector2(0.11, 1), new Vector2(0, 1))
  return new LatheGeometry(points, high ? 16 : 10)
}
export function makeSite(m: Materials, high: boolean) {
  const a = assembly(m, high), insulators: Placement[] = []
  // A level gravel bench cut into natural terrain; shallow battered retaining courses.
  a.box([0, -0.09, -1.4], [41.6, 0.42, 29], 'sandstone', 0.16)
  a.box([0, 0.14, -1.4], [40.9, 0.18, 28.3], 'gravel', 0.04)
  a.box([22.4,.105,16.15],[20,.25,9.5],'concrete')
  a.box([23.5,.13,-5.5],[6.5,.26,5],'concrete')
  a.box([0,.25,-15.5],[41.1,.2,.22],'concrete',.025)
  a.box([-3.65,.25,12.7],[33.8,.2,.22],'concrete',.025)
  for (const x of [-20.5, 20.5]) a.box([x, 0.25, -1.4], [0.22, 0.2, 28.3], 'concrete', 0.025)
  // Long, covered cable trenches connect equipment to the shelter, never animated power lines.
  for (const z of [-7.1, 5.1]) {
    a.box([-4, 0.241, z], [30.2, 0.025, 0.85], 'dark')
    for (let i = 0; i < 30; i++) a.box([-18.5 + i, 0.276, z], [0.955, 0.07, 0.78], 'concrete', 0.018)
  }
  a.box([7.1, 0.25, -1], [0.88, 0.06, 13], 'concrete')
  for (let i = 0; i < 13; i++) a.box([7.1, 0.285, -7 + i], [0.82, 0.012, 0.022], 'dark')
  // Transformer tanks, radiator banks, oil conservators, piping, flanges and raised bushings.
  function transformer(x: number, z: number, shade: Finish) {
    a.box([x, 0.42, z], [7.7, 0.4, 6.5], 'concrete', 0.1)
    a.box([x, 0.65, z], [6.9, 0.18, 5.6], 'dark', 0.025)
    for (const dx of [-1.9, 1.9]) a.box([x + dx, 0.87, z], [0.34, 0.45, 4.6], 'steel', 0.03)
    a.box([x, 2.38, z], [4.65, 2.75, 3.4], shade, 0.18)
    a.box([x, 3.82, z], [4.88, 0.2, 3.6], 'edge', 0.04)
    a.box([x, 1.04, z], [4.85, 0.19, 3.6], 'steel', 0.03)
    for (const dz of [-2.15, 2.15]) {
      a.box([x, 2.25, z + dz], [4.28, 2.33, 0.8], 'dark', 0.045)
      for (let i = 0; i < (high ? 25 : 18); i++) a.box([x - 2.07 + i * (high ? 0.173 : 0.244), 2.27, z + dz], [0.063, 2.36, 0.93], shade, 0.02)
      for (const y of [1.13, 3.4]) a.cylinder([x, y, z + dz], 0.075, 4.65, 'edge', [0, 0, Math.PI / 2])
      for (const dx of [-1.8, 1.8]) a.tube([[x + dx, 3.56, z + dz], [x + dx, 3.69, z + dz * 0.87], [x + dx, 3.37, z + dz * 0.68]], 0.09, 'steel')
    }
    for (const dx of [-1.4, 1.4]) a.box([x + dx, 4.28, z - 0.56], [0.18, 0.9, 0.22], 'steel', 0.02)
    a.cylinder([x, 4.78, z - 0.56], 0.46, 4.05, shade, [0, 0, Math.PI / 2])
    for (const dx of [-1.5, 1.5]) a.put(new TorusGeometry(0.474, 0.035, 6, high ? 24 : 16), 'edge', [x + dx, 4.78, z - 0.56], [0, Math.PI / 2, 0])
    a.cylinder([x + 2.035, 4.78, z - 0.56], 0.21, 0.035, 'chalk', [0, 0, Math.PI / 2])
    a.tube([[x - 1.8, 4.73, z - 0.9], [x - 2.57, 4.53, z - 0.9], [x - 2.57, 2.5, z - 0.9], [x - 2.23, 2.5, z - 0.9]], 0.07, 'steel')
    for (const dx of [-1.45, 0, 1.45]) {
      a.cylinder([x + dx, 4.01, z + 0.68], 0.27, 0.28, 'steel')
      insulators.push({ position: [x + dx, 4.13, z + 0.68], scale: [1.45, 1.52, 1.45] })
      a.cylinder([x + dx, 5.73, z + 0.68], 0.09, 0.24, 'edge')
      a.tube([[x + dx, 5.84, z + 0.68], [x + dx, 6.43, z - 0.6], [x + dx, 6.32, z - 3.4]], 0.04, 'edge')
      insulators.push({ position: [x + dx, 5.17, z - 3.4], scale: [0.9, 1.1, 0.9] })
      a.box([x + dx, 2.74, z - 3.4], [0.15, 4.86, 0.15], 'steel')
      a.box([x + dx, 0.4, z - 3.4], [0.52, 0.31, 0.52], 'concrete', 0.035)
      a.cylinder([x + dx, 6.28, z - 3.4], 0.09, 0.14, 'edge')
    }
    a.box([x + 2.45, 2.0, z + 0.6], [0.23, 1.15, 1.02], 'chalk', 0.08)
    a.box([x + 2.58, 2.19, z + 0.6], [0.023, 0.3, 0.58], 'dark')
    a.box([x - 0.6, 2.54, z + 1.725], [0.85, 0.36, 0.018], 'chalk')
    for (let i = 0; i < 6; i++) a.cylinder([x + 2.63, 1.06 + i * 0.44, z - 1.56], 0.04, 0.55, 'edge', [Math.PI / 2, 0, 0])
    for (const dz of [-1.84, -1.28]) a.cylinder([x + 2.63, 2.26, z + dz], 0.04, 2.76, 'edge')
  }
  transformer(-11.2, -0.8, 'paint'); transformer(-1.4, -0.8, 'steel')
  // Lattice portal gantries. Slender paired legs, gussets and knee bracing retain their silhouette.
  for (const z of [-11.9, -5.7]) {
    for (const x of [-17.8, 5.1]) {
      a.box([x, 0.55, z], [1.4, 0.62, 1.4], 'concrete', 0.04)
      for (const dx of [-0.31, 0.31]) for (const dz of [-0.31, 0.31]) {
        a.box([x + dx, 4.8, z + dz], [0.11, 8.3, 0.11], 'steel')
        a.box([x + dx, 0.94, z + dz], [0.28, 0.08, 0.28], 'edge')
      }
      for (let i = 0; i < 6; i++) for (const dz of [-0.31, 0.31]) a.beam([x - 0.31, 0.85 + i * 1.3, z + dz], [x + 0.31, 2.15 + i * 1.3, z + dz], 0.035, 'edge')
      for (const dz of [-0.31, 0.31]) a.beam([x, 7.5, z + dz], [x + (x < 0 ? 1.4 : -1.4), 9, z + dz], 0.075, 'steel')
    }
    for (const y of [8.98, 9.65]) for (const dz of [-0.31, 0.31]) a.box([-6.35, y, z + dz], [23.6, 0.12, 0.13], 'steel')
    for (let i = 0; i < 18; i++) for (const dz of [-0.31, 0.31]) a.beam([-18 + i * 1.32, 9.03, z + dz], [-16.68 + i * 1.32, 9.6, z + dz], 0.032, 'edge')
    for (const x of [-14.3, -9.1, -3.9, 1.3]) { insulators.push({ position: [x, 8.9, z], rotation: [Math.PI, 0, 0], scale: [1, 1.25, 1] }); a.cylinder([x, 7.53, z], 0.08, 0.29, 'edge') }
  }
  for (const x of [-14.3, -9.1, -3.9, 1.3]) {
    a.tube([[x, 7.52, -12], [x, 7.15, -9], [x, 7.52, -5.7]], 0.045, 'edge')
  }
  // Repeated porcelain switchgear with open frames and rounded interrupter housings.
  for (const x of [-15.8, -11.6, -7.4, -3.2, 1]) {
    a.box([x, 0.42, -9], [2.7, 0.38, 2.65], 'concrete', 0.045)
    for (const dx of [-0.72, 0.72]) { a.box([x + dx, 1.18, -9], [0.15, 1.32, 0.18], 'steel'); a.beam([x + dx, 0.62, -9.7], [x - dx, 1.65, -9.7], 0.038, 'edge') }
    a.box([x, 1.79, -9], [2.05, 0.17, 1.94], 'steel')
    for (const dz of [-0.64, 0.64]) {
      insulators.push({ position: [x, 1.89, -9 + dz], scale: [1.3, 1.68, 1.3] })
      a.cylinder([x, 3.64, -9 + dz], 0.18, 0.2, 'edge')
    }
    a.cylinder([x, 3.77, -9], 0.07, 1.7, 'edge', [Math.PI / 2, 0, 0])
    a.box([x + 0.97, 1.08, -8.4], [0.42, 0.67, 0.4], 'paint', 0.05)
    a.beam([x + 0.97, 1.28, -8.4], [x, 3.78, -8.4], 0.024, 'edge')
  }
  // Shelter: a glazed local work room, corrugated metal roof, shade and equipment recesses.
  a.box([13, 0.42, 1.3], [10, 0.38, 7.8], 'concrete', 0.1)
  a.box([13, 2.15, 0.7], [9.2, 3.15, 6.2], 'sandstone', 0.06)
  a.box([13, 3.82, 0.65], [10, 0.2, 7.15], 'dark', 0.04)
  a.box([13, 3.95, 0.65], [9.85, 0.1, 7], 'steel', 0.03)
  for (let i = 0; i < 19; i++) a.box([8.55 + i * 0.5, 4.03, 0.65], [0.035, 0.085, 6.98], 'edge')
  // Front windows have separate lower sill, reveals and warm interior panels.
  for (const x of [9.6, 11.25, 12.9]) {
    a.box([x, 2.28, 3.815], [1.5, 1.83, 0.09], 'dark', 0.045)
    a.box([x, 2.28, 3.87], [1.32, 1.66, 0.025], 'glass')
    a.box([x, 2.18, 3.89], [1.13, 0.84, 0.018], 'light')
    a.box([x, 2.28, 3.918], [0.035, 1.73, 0.035], 'steel')
    a.box([x, 1.3, 3.91], [1.65, 0.09, 0.2], 'concrete', 0.02)
  }
  a.box([15.5, 1.94, 3.87], [1.45, 2.7, 0.12], 'dark', 0.025)
  a.box([15.5, 1.95, 3.95], [1.29, 2.5, 0.035], 'paint', 0.025)
  a.box([15.5, 2.48, 3.98], [0.82, 0.99, 0.02], 'glass')
  a.cylinder([15.98, 1.84, 4.02], 0.025, 0.27, 'edge')
  a.box([13.1, 3.32, 5.02], [9.15, 0.16, 2.25], 'paint', 0.05)
  for (const x of [8.85, 17.3]) a.box([x, 1.98, 5.9], [0.13, 2.72, 0.13], 'steel')
  a.box([13.1, 3.21, 5.72], [8.45, 0.033, 0.085], 'light')
  // Continuous concrete apron: its rendered profile is also the actor support surface.
  a.box([13.1, .34, (5.025 + apron.start) / 2], [9.75, .24, apron.start - 5.025], 'concrete')
  const apronVertices: number[] = []
  for (let i = 0; i < apron.segments; i++) {
    const z0 = apron.start + (apron.end - apron.start) * i / apron.segments, z1 = apron.start + (apron.end - apron.start) * (i + 1) / apron.segments
    const a0 = [apron.x0, apronHeight(z0), z0], b0 = [apron.x1, apronHeight(z0), z0], a1 = [apron.x0, apronHeight(z1), z1], b1 = [apron.x1, apronHeight(z1), z1]
    apronVertices.push(...a0, ...a1, ...b0, ...b0, ...a1, ...b1)
    for (const x of [apron.x0, apron.x1]) apronVertices.push(x,.22,z0,x,apronHeight(z0),z0,x,apronHeight(z1),z1,x,.22,z0,x,apronHeight(z1),z1,x,.22,z1)
  }
  const ramp = new BufferGeometry(); ramp.setAttribute('position',new Float32BufferAttribute(apronVertices,3)); ramp.computeVertexNormals(); a.put(ramp,'concrete')
  for (let i = 0; i < 10; i++) a.box([17.64, 1.35 + i * 0.17, 0], [0.055, 0.055, 2.25], 'dark')
  a.box([18.25, 0.92, 0.1], [0.95, 1.21, 2.55], 'chalk', 0.1)
  for (const z of [-0.6, 0.75]) { a.cylinder([18.75, 1, z], 0.42, 0.05, 'dark', [0, 0, Math.PI / 2]); a.put(new TorusGeometry(0.43, 0.038, 5, 24), 'steel', [18.8, 1, z], [0, Math.PI / 2, 0]) }
  // Hooded local status cabinet: remote-link display is separate from local power.
  a.box([8.8, 0.49, 6.15], [2.65, 0.44, 1.65], 'concrete', 0.07)
  a.box([8.8, 1.93, 6.15], [2.4, 2.44, 1.1], 'chalk', 0.075)
  a.box([8.8, 3.2, 6.25], [2.6, 0.13, 1.5], 'steel', 0.03)
  a.box([8.8, 2.15, 6.72], [2.24, 1.72, 0.08], 'dark', 0.03)
  for (let i = 0; i < 6; i++) a.box([9.0, 0.87 + i * 0.05, 6.72], [1.57, 0.022, 0.025], 'steel')
  a.tube([[8.3, 0.62, 6.15], [8.03, 0.62, 6.15], [8.03, 0.35, 4.2], [8.5, 0.35, 4.2]], 0.05, 'steel')
  // Roof backhaul unit: mast, parabolic reflector, feed arm. No real network/site markings.
  a.cylinder([15.5, 5.15, -0.8], 0.08, 2.4, 'steel')
  a.put(new SphereGeometry(0.85, high ? 24 : 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.44), 'chalk', [15.5, 5.95, -0.8], [0.9, 0.15, 0], [1, 0.3, 1])
  a.beam([15.5, 5.95, -0.8], [15.5, 6.35, 0.1], 0.035, 'edge')
  a.box([15.5, 6.35, 0.1], [0.17, 0.16, 0.25], 'dark', 0.04)
  a.box([15.5, 5.05, -0.65], [0.32, 0.5, 0.22], 'chalk', 0.025)
  // Outer mesh fence; the separately modeled locked gate can flex under contact.
  function fence(x1: number, z1: number, x2: number, z2: number, panels: number) {
    for (let i = 0; i <= panels; i++) {
      const x = x1 + (x2 - x1) * i / panels, z = z1 + (z2 - z1) * i / panels
      a.cylinder([x, 1.55, z], 0.046, 2.62, 'steel'); a.box([x, 0.38, z], [0.22, 0.25, 0.22], 'concrete', 0.03)
      if (i === panels) break
      const ex = x1 + (x2 - x1) * (i + 1) / panels, ez = z1 + (z2 - z1) * (i + 1) / panels
      for (const y of [0.55, 2.7]) a.beam([x, y, z], [ex, y, ez], 0.028, 'edge')
      for (let y = 0.85; y < 2.6; y += 0.42) a.beam([x, y, z], [ex, y, ez], 0.009, 'steel')
      const steps = high ? 7 : 5
      for (let j = 1; j < steps; j++) a.beam([x + (ex - x) * j / steps, 0.55, z + (ez - z) * j / steps], [x + (ex - x) * j / steps, 2.7, z + (ez - z) * j / steps], 0.011, 'steel')
    }
  }
  fence(-19.5, 11.7, 13.2, 11.7, 13); fence(18.2, 11.7, 19.5, 11.7, 1)
  fence(-19.5, -14.5, -19.5, 11.7, 10); fence(19.5, -14.5, 19.5, 11.7, 10); fence(-19.5, -14.5, 19.5, -14.5, 15)
  a.box([-1, 1.62, 11.74], [0.52, 0.7, 0.035], 'ochre', 0.025)
  // Perimeter thermal/camera and small ground radar, each grounded in a physical mounting.
  for (const [x, z] of [[-6.6, 10.2], [12.5, 10.2]]) {
    a.cylinder([x, 2.06, z], 0.08, 3.65, 'steel', [0, 0, 0], 0.045)
    a.box([x, 0.39, z], [0.44, 0.28, 0.44], 'concrete', 0.035)
    a.beam([x,3.84,z],[x+.37,3.85,z+.25],.055,'edge')
    a.box([x, 2.4, z + 0.08], [0.24, 0.45, 0.2], 'paint', 0.04)
  }
  a.cylinder([-18.8,2.865,-2],.08,5.27,'steel')
  a.box([-18.8,.36,-2],[.55,.26,.55],'concrete',.04)
  a.cylinder([18.8,2.865,9.8],.08,5.27,'steel')
  a.box([18.8,.36,9.8],[.55,.26,.55],'concrete',.04)
  a.box([3.5, 0.44, 10.35], [0.75, 0.35, 0.75], 'concrete', 0.05)
  a.cylinder([3.5, 1.03, 10.35], 0.075, 0.85, 'steel')
  a.beam([3.5,1.24,10.35],[3.5,1.44,10.4],.085,'steel')
  // Maintenance light standards; only the porch and this fixture contribute practical lighting.
  a.cylinder([-7, 3.18, 6.9], 0.075, 5.85, 'steel')
  a.beam([-7, 6.07, 6.9], [-6.2, 6.07, 6.9], 0.05, 'edge')
  a.box([-6.15, 6.02, 6.9], [0.5, 0.12, 0.34], 'paint', 0.04)
  a.box([-6.15, 5.952, 6.9], [0.38, 0.015, 0.22], 'light')
  // Small service details establish human scale without anonymous cubes.
  a.box([-3.55, 0.56, 5.65], [0.62, 0.65, 0.37], 'ochre', 0.06)
  a.box([-3.55, 0.93, 5.65], [0.34, 0.07, 0.2], 'dark', 0.035)
  for (const x of [14, 17.9]) { a.cylinder([x, 0.91, 8.8], 0.09, 1.38, 'ochre'); a.cylinder([x, 1.14, 8.8], 0.094, 0.22, 'dark') }
  // A pale perimeter trail and an irregular dry wash in front of the level bench.
  const pathPositions: number[] = [], pathUV: number[] = [], pathIndices: number[] = []
  for (let i = 0; i <= 60; i++) {
    const x = -48 + i * 1.6, drift = Math.abs(x) > 23 ? Math.sin(x * 0.085) * 1.7 : 0
    for (const side of [-1, 1]) { const z = 14.35 + drift + side * (1.12 + Math.sin(i * 2.37) * 0.075); pathPositions.push(x, groundHeight(x, z) + 0.021, z); pathUV.push(i / 60, side === -1 ? 0 : 1) }
    if (i < 60) { const j = i * 2; pathIndices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2) }
  }
  const path = new BufferGeometry(); path.setAttribute('position', new Float32BufferAttribute(pathPositions, 3)); path.setAttribute('uv', new Float32BufferAttribute(pathUV, 2)); path.setIndex(pathIndices); path.computeVertexNormals(); a.put(path, 'sandstone')
  for (let i = 0; i < (high ? 90 : 45); i++) {
    const x = -29 + seeded(i * 7) * 59, z = i % 3 ? 18.5 + seeded(i * 7 + 1) * 6 : -19 - seeded(i * 7 + 1) * 9
    const y = groundHeight(x, z), scale = 0.12 + seeded(i * 7 + 2) * 0.38
    a.put(new SphereGeometry(1, 7, 5), i % 3 ? 'sandstone' : 'gravel', [x, y + scale * 0.18, z], [0.3, i, 0.3], [scale * 1.7, scale * 0.63, scale])
  }
  return { parts: a.finish(), insulators }
}
export function scrubGeometry() {
  const p: number[] = []
  for (let i = 0; i < 9; i++) {
    const angle = i * 2.4, x = Math.cos(angle), z = Math.sin(angle), h = 0.32 + seeded(i) * 0.42
    p.push(x * 0.02, 0, z * 0.02, -x * 0.025, 0, -z * 0.025, x * 0.31, h, z * 0.31)
    p.push(x * 0.03, 0, z * 0.03, -x * 0.02, 0, -z * 0.02, x * 0.46, h * 0.68, z * 0.46)
  }
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(p, 3)); g.computeVertexNormals(); return g
}
export function scrubPlacements(high: boolean): Placement[] {
  const out: Placement[] = []
  for (let i = 0; i < (high ? 380 : 170); i++) {
    const x = -55 + seeded(i * 8.1) * 110, z = -54 + seeded(i * 8.1 + 1) * 95
    if (Math.abs(x) < 23 && z > -18 && z < 17) continue
    const s = 0.5 + seeded(i * 8.1 + 2) * 1.8
    out.push({ position: [x, groundHeight(x, z), z], rotation: [0, i, 0], scale: [s, s, s] })
  }
  return out
}
export function makeBody(m: Materials, high: boolean, role: 'visitor' | 'guard' | 'technician') {
  const coat: Finish = role === 'visitor' ? 'ochre' : role === 'guard' ? 'navy' : 'paint'
  const body = assembly(m, high)
  body.box([0, 1.17, 0], [0.43, 0.58, 0.28], coat, 0.12)
  body.cylinder([0, 1.48, 0], 0.068, 0.13, 'skin')
  body.put(new SphereGeometry(1, 12, 10), 'skin', [0, 1.65, 0.006], [0, 0, 0], [0.147, 0.19, 0.14])
  body.put(new SphereGeometry(0.154, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), role === 'visitor' ? 'dark' : 'chalk', [0, 1.71, 0])
  if (role !== 'visitor') {
    body.cylinder([0, 1.72, 0.015], 0.174, 0.026, 'chalk')
    body.box([0, 1.15, 0.149], [0.39, 0.42, 0.022], 'ochre', 0.025)
    body.box([0, 1.07, 0.164], [0.38, 0.046, 0.019], 'chalk')
    for (const dx of [-0.14, 0.14]) body.box([dx, 1.29, 0.16], [0.045, 0.16, 0.018], 'chalk')
  } else {
    body.box([0, 1.19, -0.187], [0.29, 0.43, 0.18], 'navy', 0.08)
    for (const dx of [-0.14, 0.14]) body.box([dx, 1.34, 0.148], [0.034, 0.22, 0.022], 'navy')
  }
  body.box([0,.925,0],[.37,.15,.27], 'dark', .045)
  return body.finish()
}
export function makeShoe(m: Materials, high: boolean) {
  const a = assembly(m,high)
  a.box([0,.018,.055],[.19,.036,.30],'navy')
  a.box([0,.071,.052],[.182,.084,.287],'navy',.035)
  return a.finish()
}
export function contactTexture() {
  const data = new Uint8Array(64 * 64 * 4)
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const u = (x / 63 - 0.5) * 2, v = (y / 63 - 0.5) * 2
    data.set([255, 255, 255, Math.round(Math.exp(-4.2 * (u ** 4 + v ** 4)) * 195)], (y * 64 + x) * 4)
  }
  const t = new DataTexture(data, 64, 64, RGBAFormat); t.magFilter = t.minFilter = LinearFilter; t.needsUpdate = true; return t
}
