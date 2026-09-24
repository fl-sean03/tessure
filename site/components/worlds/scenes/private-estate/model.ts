import {
  BoxGeometry, BufferGeometry, Color, CylinderGeometry, DataTexture, DoubleSide,
  Float32BufferAttribute, LinearFilter, LinearMipmapLinearFilter, MeshStandardMaterial,
  Object3D, Quaternion, RepeatWrapping, RGBAFormat, SphereGeometry, Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Vec3 } from '../../contract'
import { seeded } from '../../math'
import { groundY, pathZ, pathPoints, courtTriangles, pathTriangles } from './surface'
import { consolePose } from './motion'
export { groundY, pathZ } from './surface'

export type Finish = 'stone' | 'stone2' | 'coping' | 'wood' | 'wood2' | 'roof' | 'seam' | 'glass' | 'warm' | 'linen' | 'earth' | 'grass' | 'gravel' | 'bark' | 'dark' | 'metal' | 'rust' | 'cream' | 'fur' | 'screen'
export type Materials = Record<Finish, MeshStandardMaterial>
export type Part = { geometry: BufferGeometry; material: MeshStandardMaterial }
const colors: Record<Finish, string> = {
  stone: '#97978c', stone2: '#b0ad9c', coping: '#c2beaa', wood: '#776047', wood2: '#a08a62',
  roof: '#344f51', seam: '#526565', glass: '#74969b', warm: '#c9975c', linen: '#ded3b8',
  earth: '#6d725d', grass: '#64796b', gravel: '#b4af98', bark: '#615d4e', dark: '#263631',
  metal: '#788681', rust: '#a65c2a', cream: '#dacdb0', fur: '#553a29', screen: '#142c2f',
}
function grain(color: string, amount: number, streak = false) {
  const base = new Color(color), n = 128, data = new Uint8Array(n * n * 4)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = (y * n + x) * 4
    const v = 1 + (seeded(x * 3 + y * 117) - .5) * amount + (streak ? Math.sin(x * 1.9 + Math.sin(y * .08) * .6) * .065 : 0)
    data[i] = Math.min(255, base.r * v * 255); data[i + 1] = Math.min(255, base.g * v * 255); data[i + 2] = Math.min(255, base.b * v * 255); data[i + 3] = 255
  }
  const t = new DataTexture(data, n, n, RGBAFormat)
  t.wrapS = t.wrapT = RepeatWrapping; t.magFilter = LinearFilter; t.minFilter = LinearMipmapLinearFilter
  t.generateMipmaps = true; t.needsUpdate = true; return t
}
export function makeMaterials(): Materials {
  const m = {} as Materials
  for (const k of Object.keys(colors) as Finish[]) m[k] = new MeshStandardMaterial({ color: colors[k], roughness: .82 })
  for (const k of ['stone', 'wood', 'gravel', 'grass'] as Finish[]) {
    m[k].color.set('#ffffff'); m[k].map = grain(colors[k], k === 'gravel' ? .38 : .19, k === 'wood')
    m[k].map!.repeat.set(k === 'grass' ? 16 : 3, k === 'grass' ? 16 : 3)
  }
  m.roof.metalness = .38; m.roof.roughness = .5; m.seam.metalness = .5
  m.glass.transparent = true; m.glass.opacity = .19; m.glass.depthWrite = false; m.glass.roughness = .16; m.glass.metalness = .25
  m.warm.emissive.set('#e2ae6d'); m.warm.emissiveIntensity = .36
  m.metal.metalness = .7; m.metal.roughness = .4
  m.linen.roughness = 1; m.screen.roughness = .45
  return m
}
export function builder(m: Materials) {
  const bins = new Map<Finish, BufferGeometry[]>()
  function put(input: BufferGeometry, f: Finish, p: Vec3 = [0, 0, 0], s: Vec3 = [1, 1, 1], r: Vec3 = [0, 0, 0]) {
    const o = new Object3D(); o.position.set(...p); o.scale.set(...s); o.rotation.set(...r); o.updateMatrix()
    input.applyMatrix4(o.matrix)
    const g = input.index ? input.toNonIndexed() : input
    if (g !== input) input.dispose()
    if (!g.attributes.uv) g.setAttribute('uv', new Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    if (!g.attributes.normal) g.computeVertexNormals()
    const bucket = bins.get(f) || []; bucket.push(g); bins.set(f, bucket)
  }
  function box(p: Vec3, s: Vec3, f: Finish, bevel = 0, r: Vec3 = [0, 0, 0]) {
    if (bevel < .026) bevel = 0
    put(bevel ? new RoundedBoxGeometry(...s, 1, Math.min(bevel, Math.min(...s) * .4)) : new BoxGeometry(...s), f, p, [1, 1, 1], r)
  }
  function oval(p: Vec3, s: Vec3, f: Finish, r: Vec3 = [0, 0, 0], segments = 12) { put(new SphereGeometry(1, segments, 8), f, p, s, r) }
  function beam(a: Vec3, b: Vec3, radius: number, f: Finish, tip = radius, sides = 8) {
    const av = new Vector3(...a), bv = new Vector3(...b), d = bv.clone().sub(av)
    const g = new CylinderGeometry(tip, radius, d.length(), sides)
    g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.normalize()))
    put(g, f, av.add(bv).multiplyScalar(.5).toArray() as Vec3)
  }
  function tri(a: Vec3, b: Vec3, c: Vec3, f: Finish) {
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute([...a, ...b, ...c], 3))
    g.setAttribute('uv', new Float32BufferAttribute([a[0] / 18, a[2] / 18, b[0] / 18, b[2] / 18, c[0] / 18, c[2] / 18], 2)); put(g, f)
  }
  function finish() {
    return [...bins].map(([f, gs]) => { const geometry = mergeGeometries(gs, false)!; gs.forEach(g => g.dispose()); return { geometry, material: m[f] } })
  }
  return { put, box, oval, beam, tri, finish }
}
export function makeSite(m: Materials, high: boolean): Part[] {
  const a = builder(m)
  // Broad rolling land runs into the morning haze; the architecture is cut into it.
  const n = 40, size = 90
  for (let iz = 0; iz < n; iz++) for (let ix = 0; ix < n; ix++) {
    const x = (ix / n - .5) * size, z = (iz / n - .5) * size, d = size / n
    const p: Vec3 = [x, groundY(x, z), z], q: Vec3 = [x, groundY(x, z + d), z + d], r: Vec3 = [x + d, groundY(x + d, z), z], s: Vec3 = [x + d, groundY(x + d, z + d), z + d]
    a.tri(p, q, r, 'grass'); a.tri(r, q, s, 'grass')
  }
  // Gravel arrival court, a meandering footpath, steel garden edging and stepping treads.
  for (const [p, q, r] of [...courtTriangles, ...pathTriangles]) a.tri(p, q, r, 'gravel')
  const path = pathPoints
  for (let i = 0; i < path.length - 1; i++) for (const side of [-1, 1]) {
    const p = path[i], q = path[i + 1]
    // The woodland footpath exits through a real opening in its low steel edging.
    if (side === -1 && p[0] >= 9) continue
    a.beam([p[0], p[1] + .018, p[2] + side * .69], [q[0], q[1] + .018, q[2] + side * .69], .014, 'metal', .014, 5)
  }
  // Terraces with individually staggered stone courses and separate projecting copings.
  function wall(x: number, z: number, length: number, h: number, depth = .44) {
    a.box([x, h / 2 + .06, z], [length, h, depth], 'stone')
    for (let row = 0; row < Math.ceil(h / .22); row++) for (let j = 0; j < Math.ceil(length / .7); j++) {
      const xx = x - length / 2 + .35 + j * .7 + (row % 2 ? .18 : 0)
      if (xx > x + length / 2 - .13) continue
      a.box([xx, .16 + row * .22, z + depth / 2 + .015], [.65, .198, .04 + seeded(j + row * 31) * .02], (j + row) % 3 ? 'stone' : 'stone2', .012)
    }
    a.box([x, h + .105, z], [length + .1, .14, depth + .13], 'coping', .03)
    for (let j = 0; j < length; j += .9) a.box([x - length / 2 + j, h + .179, z], [.012, .005, depth + .13], 'stone')
  }
  a.box([.2, .59, -1.65], [13.1, 1.12, 8.4], 'stone', .05)
  a.box([.2, 1.19, -1.35], [13.8, .16, 8.7], 'coping', .035)
  wall(-1.4, 3.06, 10, .87); wall(5.78, 3.06, 2.2, .87)
  for (const x of [-6.8, 6.9]) a.box([x, .64, -.6], [.36, 1.2, 7.5], 'stone', .02)
  // Broad stair slit leaves an actual pedestrian approach to the occupied rooms.
  for (let i = 0; i < 5; i++) a.box([4, .14 + i * .22, 4.04 - i * .38], [1.5, .27, .5], 'coping', .025)
  for (let ix = 0; ix < 12; ix++) for (let iz = 0; iz < 4; iz++) {
    a.box([-5.7 + ix * .98, 1.284, .05 + iz * .71], [.956, .025, .686], (ix + iz) % 6 ? 'coping' : 'stone2', .006)
  }
  function pavilion(cx: number, cz: number, width: number, depth: number, base: number, rise: number, timber: boolean) {
    const eave = base + 2.95, ridge = eave + rise, front = cz + depth / 2, back = cz - depth / 2
    // Front facade is an opening with structural jambs and lintel; glazing sits behind the reveal.
    a.box([cx - width / 2 + .18, base + 1.48, cz], [.36, 2.95, depth], 'stone', .02)
    a.box([cx + width / 2 - .18, base + 1.48, cz], [.36, 2.95, depth], timber ? 'wood' : 'stone', .025)
    a.box([cx, base + 1.48, back + .14], [width, 2.95, .3], 'stone', .02)
    a.box([cx, eave - .14, front - .14], [width, .3, .4], timber ? 'wood' : 'stone', .025)
    a.box([cx, base + .09, front - .1], [width, .18, .42], 'stone2', .02)
    a.box([cx, base + 1.5, front - .24], [width - .82, 2.63, .025], 'glass')
    a.box([cx, base + .04, cz], [width - .55, .08, depth - .25], 'wood2')
    // Interior depth and daily objects remain visible behind the transparent glazing.
    a.box([cx, base + 1.45, back + .34], [width - .55, 2.6, .05], 'warm')
    for (const side of [-1, 1]) {
      const xx = cx + side * (width / 2 - .65)
      for (let i = 0; i < 5; i++) a.box([xx + side * i * .085, base + 1.48, front - .33], [.07, 2.57, .085], 'linen', .015)
    }
    for (let i = 0; i < 4; i++) {
      const x = cx - (width - .7) / 2 + i * (width - .7) / 3
      a.box([x, base + 1.49, front - .15], [.065, 2.74, .12], 'dark', .012)
      if (i === 2) a.box([x - .1, base + 1.25, front - .065], [.025, .2, .035], 'metal', .007)
    }
    for (const y of [base + .18, eave - .28]) a.box([cx, y, front - .15], [width - .58, .064, .12], 'dark', .01)
    // Open gable has a timber tympanum, deep roof overhang and separate standing seams.
    a.tri([cx - width / 2, eave, front], [cx + width / 2, eave, front], [cx, ridge, front], 'wood')
    a.tri([cx + width / 2, eave, back], [cx - width / 2, eave, back], [cx, ridge, back], 'wood')
    for (let x = -.5 * width + .15; x < .5 * width; x += .18) {
      const h = rise * (1 - Math.abs(x) / (width / 2))
      a.box([cx + x, eave + h / 2 - .025, front + .018], [.025, Math.max(.015, h - .05), .035], 'wood2')
    }
    const half = width / 2 + .43, slope = Math.atan2(rise, width / 2), length = half / Math.cos(slope)
    for (const side of [-1, 1]) {
      a.box([cx + side * half / 2, ridge - Math.tan(slope) * half / 2 + .055, cz], [length, .135, depth + 1.05], 'roof', .015, [0, 0, -side * slope])
      for (let z = back - .42; z < front + .53; z += .65) a.box([cx + side * half / 2, ridge - Math.tan(slope) * half / 2 + .157, z], [length, .026, .022], 'seam', .005, [0, 0, -side * slope])
      a.box([cx + side * half, ridge - Math.tan(slope) * half, cz], [.11, .17, depth + 1.05], 'dark', .02)
      a.beam([cx + side * half, base + .05, back + .2], [cx + side * half, eave - .22, back + .2], .047, 'roof')
    }
    a.box([cx, ridge + .15, cz], [.16, .075, depth + 1.06], 'seam', .03)
    // Visible side masonry joints, varied without applying a flat photograph.
    if (!timber) for (let row = 0; row < 12; row++) for (let j = 0; j < Math.floor(depth / .6); j++) {
      a.box([cx - width / 2 - .012, base + .16 + row * .23, back + .3 + j * .6], [.035, .207, .568], (row + j) % 4 ? 'stone' : 'stone2', .008)
    }
    else for (let j = 0; j < depth / .13; j++) a.box([cx + width / 2 + .015, base + 1.49, back + j * .13], [.035, 2.91, .022], 'wood2')
  }
  pavilion(-2.8, -3.3, 5.9, 6.3, 1.3, 1.65, false)
  pavilion(3.47, -2.65, 5.3, 5.3, 1.3, 1.4, true)
  // Shallow shelves and a small abstract panel give the living room a furnished back wall.
  a.box([-3.1, 2.85, -6.07], [1.7, 1.05, .065], 'wood', .025)
  a.box([-3.1, 2.85, -6.025], [1.57, .92, .025], 'linen')
  a.box([-3.28, 2.8, -6.0], [.17, .53, .015], 'wood2')
  a.box([-2.92, 2.86, -6.0], [.33, .36, .015], 'stone2')
  for (const y of [2.1, 2.65, 3.2]) {
    a.box([-4.86, y, -4.6], [.43, .055, 1.7], 'wood2', .02)
    for (let i = 0; i < 6; i++) a.box([-4.86, y + .18, -5.17 + i * .18], [.27, .28 + seeded(i) * .13, .095], i % 2 ? 'linen' : 'wood')
  }
  // Low glazed link, chimney, and a restrained terrace pergola.
  a.box([.4, 2.77, -1.8], [.63, 2.85, 3.6], 'glass')
  a.box([.4, 4.25, -1.8], [.8, .18, 3.9], 'roof', .025)
  a.box([-4.5, 5.46, -5.3], [.7, 2.7, .9], 'stone', .04)
  a.box([-4.5, 6.9, -5.3], [.84, .13, 1.05], 'dark', .03)
  for (const x of [-5.5, .02]) a.box([x, 2.7, 2.35], [.115, 2.85, .115], 'wood', .015)
  a.box([-2.75, 4.11, 2.35], [5.8, .18, .16], 'wood', .015)
  for (let x = -5.5; x < .2; x += .65) a.box([x, 4.19, 1.2], [.085, .18, 2.65], 'wood2', .008)
  // Furnishings: a sofa inside, small breakfast setting, books, pendant and warm practicals.
  a.box([-2.9, 1.65, -1.7], [2.8, .55, .86], 'linen', .14)
  a.box([-2.9, 2.02, -2.02], [2.8, .75, .24], 'linen', .09)
  for (const x of [-4.25, -1.55]) a.box([x, 1.84, -1.7], [.19, .68, 1], 'linen', .07)
  a.box([-2.9, 1.67, -.52], [1.4, .07, .55], 'wood2', .035)
  for (const x of [-3.4, -2.4]) a.box([x, 1.46, -.52], [.065, .4, .38], 'dark', .01)
  for (const x of [3, 3.8]) a.box([x, 1.57, -2.1], [.8, .5, 1.9], 'linen', .13)
  a.box([3.4, 1.85, -2.9], [1.9, .82, .15], 'wood', .04)
  a.box([4.95, 2.08, -1.2], [.7, 1.5, .55], 'wood', .03)
  a.oval([4.95, 3, -1.2], [.24, .33, .24], 'warm')
  a.beam([-2.7, 4.1, -1.4], [-2.7, 3.36, -1.4], .012, 'dark')
  a.put(new CylinderGeometry(.17, .31, .22, 24, 1, true), 'linen', [-2.7, 3.36, -1.4])
  a.oval([-2.7, 3.25, -1.4], [.11, .07, .11], 'warm')
  // Operator's small garden-facing console, integrated into the terrace study.
  a.box([1.45, 2.08, 1.52], [1.72, .09, .76], 'wood2', .025)
  for (const x of [.72, 2.18]) for (const z of [1.24, 1.8]) a.box([x, 1.7, z], [.055, .78, .055], 'dark', .012)
  const laptop = builder(m)
  laptop.box([0, .25, -.16], [1.01, .66, .065], 'dark', .03, [-.08, 0, 0])
  laptop.box([0, .25, -.117], [.92, .55, .012], 'screen', .01, [-.08, 0, 0])
  laptop.box([0, .009, .055], [.90, .045, .51], 'metal', .012)
  for (let j = 0; j < 3; j++) for (let i = 0; i < 10; i++) laptop.box([-.35 + i * .069, .035, -.075 + j * .056], [.044, .007, .034], 'dark')
  laptop.box([0, .033, .19], [.23, .01, .13], 'dark', .004)
  laptop.box([0, .0385, .19], [.18, .001, .085], 'screen')
  for (const part of laptop.finish()) { part.geometry.rotateY(consolePose.yaw); part.geometry.translate(...consolePose.origin); const key = Object.entries(m).find(([, material]) => material === part.material)![0] as Finish; a.put(part.geometry, key) }
  a.box([1.99, 2.14, 1.75], [.27, .035, .18], 'linen', .009)
  a.put(new CylinderGeometry(.065, .057, .15, 14), 'linen', [.82, 2.21, 1.62])
  // A folded throw and spare chair convey occupation without exposing personal details.
  a.box([4.8, 1.75, 1.7], [.53, .07, .55], 'wood', .025)
  a.box([4.8, 2.04, 1.46], [.53, .58, .065], 'wood', .025, [-.08, 0, 0])
  for (const x of [4.6, 5]) for (const z of [1.48, 1.91]) a.box([x, 1.51, z], [.05, .5, .05], 'wood')
  a.box([4.8, 1.8, 1.7], [.49, .035, .46], 'linen', .025)
  // Small outbuilding off the gravel arrival, with a deeply inset timber door.
  a.box([-8.35, .27, -.3], [3.6, .45, 4.2], 'stone', .04)
  a.box([-8.35, 1.7, -.4], [3.15, 2.5, 3.6], 'wood', .03)
  a.box([-8.35, 1.61, 1.43], [1.13, 2.15, .035], 'dark', .015)
  a.box([-8.35, 1.59, 1.46], [.96, 1.99, .032], 'wood2')
  for (let x = -9.82; x < -6.8; x += .12) {
    if (Math.abs(x + 8.35) < .59) continue
    a.box([x, 1.71, 1.426], [.026, 2.47, .042], 'wood2')
  }
  a.box([-7.95, 1.55, 1.5], [.035, .18, .04], 'metal')
  for (const side of [-1, 1]) a.box([-8.35 + side * .94, 3.15, -.4], [2.06, .13, 4.25], 'roof', .018, [0, 0, -side * .36])
  // Human-scale boundary: spaced posts and two wires, never a fortress fence.
  for (let x = -14; x <= 15; x += 2.3) {
    const z = -9.7, y = groundY(x, z)
    a.box([x, y + .61, z], [.09, 1.22, .11], 'wood', .015)
    if (x < 13) for (const h of [.4, .95]) a.beam([x, y + h, z], [x + 2.3, groundY(x + 2.3, z) + h, z], .009, 'metal', .009, 4)
  }
  // Low stone garden seat and occasional edge boulders.
  a.box([8.7, .47, 2.15], [2.4, .18, .58], 'coping', .07)
  for (const x of [7.8, 9.6]) a.box([x, .22, 2.15], [.29, .44, .48], 'stone', .04)
  for (let i = 0; i < (high ? 65 : 36); i++) {
    const x = -13 + seeded(i + 88) * 27, z = i < 18 ? 6.4 + seeded(i + 92) * 2 : -8 - seeded(i + 90) * 4
    a.oval([x, groundY(x, z) + .09, z], [.12 + seeded(i + 33) * .26, .11 + seeded(i + 40) * .14, .15 + seeded(i + 22) * .26], i % 3 ? 'stone' : 'stone2', [0, i, .2], 7)
  }
  return a.finish()
}

// Fox anatomy is built around a horizontal spine, pointed muzzle and heavy white-tipped brush.
/** Smooth elliptical profiles join the animal's body volumes without interpenetrating balls. */
function profile(a: ReturnType<typeof builder>, rows: [number, number, number, number][], finish: Finish, sides = 16) {
  const positions: number[] = [], indices: number[] = []
  const sample = (k: number, t: number) => { const i = Math.min(rows.length - 2, Math.floor(t)), f = t - i, p = rows[Math.max(0, i - 1)][k], q = rows[i][k], r = rows[i + 1][k], s = rows[Math.min(rows.length - 1, i + 2)][k]; return .5 * (2 * q + (-p + r) * f + (2 * p - 5 * q + 4 * r - s) * f * f + (-p + 3 * q - 3 * r + s) * f * f * f) }
  const count = (rows.length - 1) * 5
  for (let j = 0; j <= count; j++) for (let k = 0; k <= sides; k++) { const t = j / count * (rows.length - 1), angle = k / sides * Math.PI * 2; positions.push(sample(0, t), sample(1, t) + Math.sin(angle) * Math.max(.001, sample(2, t)), Math.cos(angle) * Math.max(.001, sample(3, t))) }
  for (let j = 0; j < count; j++) for (let k = 0; k < sides; k++) { const v = j * (sides + 1) + k; indices.push(v, v + sides + 1, v + 1, v + 1, v + sides + 1, v + sides + 2) }
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(positions, 3)); g.setIndex(rows.at(-1)![0] < rows[0][0] ? indices.reduce<number[]>((result, _, i) => { if (i % 3 === 0) result.push(indices[i], indices[i + 2], indices[i + 1]); return result }, []) : indices); g.computeVertexNormals(); a.put(g, finish)
}
export function makeFox(m: Materials): { body: Part[]; head: Part[]; tail: Part[]; paw: Part[] } {
  const b = builder(m)
  profile(b, [[-.61,.61,.012,.012],[-.46,.61,.20,.16],[-.22,.61,.215,.19],[.08,.59,.19,.17],[.34,.64,.23,.175],[.51,.74,.18,.145],[.59,.79,.01,.01]], 'rust')
  b.oval([.36, .52, 0], [.13, .14, .146], 'cream', [0, 0, -.24])
  const h = builder(m)
  profile(h, [[-.15,.01,.012,.012],[-.07,.035,.145,.12],[.08,.018,.15,.132],[.21,-.04,.083,.081],[.39,-.092,.026,.03]], 'rust', 14)
  h.oval([.225, -.08, 0], [.153, .042, .067], 'cream', [0, 0, -.13])
  h.oval([.393, -.093, 0], [.035, .025, .03], 'dark')
  for (const side of [-1, 1]) {
    h.oval([.12, .052, side * .123], [.018, .018, .01], 'dark')
    const x = -.06, z = side * .098
    h.tri([x-.075,.10,z-.038],[x+.08,.1,z-.038],[x-.026,.32,z], 'fur')
    h.tri([x+.08,.1,z+.04],[x-.075,.1,z+.04],[x-.026,.32,z], 'rust')
    h.tri([x+.08,.1,z-.038],[x+.08,.1,z+.04],[x-.026,.32,z], 'rust')
    h.tri([x+.056,.135,z+side*.031],[x-.038,.135,z+side*.031],[x-.024,.278,z], 'cream')
  }
  const tail = builder(m)
  profile(tail, [[.01,0,.075,.08],[-.18,-.05,.13,.14],[-.43,-.125,.17,.17],[-.65,-.17,.13,.13]], 'rust')
  profile(tail, [[-.645,-.17,.13,.13],[-.81,-.19,.1,.10],[-.95,-.19,.005,.005]], 'cream')
  const paw = builder(m)
  paw.box([0,.017,0],[.15,.034,.09],'fur',.015)
  paw.oval([-.014,.036,0],[.058,.025,.04],'fur')
  return { body: b.finish(), head: h.finish(), tail: tail.finish(), paw: paw.finish() }
}
export function makeOperator(m: Materials): Part[] {
  const b = builder(m)
  // Seated proportions: seat below desk, soles at patio level; intentionally non-identifying.
  b.oval([0,.79,0],[.18,.285,.14],'linen',[0,0,-.035],18)
  b.oval([.025,1.24,.015],[.126,.165,.126],'wood2')
  b.oval([.01,1.32,-.03],[.132,.103,.12],'fur')
  for (const x of [-.095,.095]) {
    b.beam([x,.51,.02],[x,.40,.36],.073,'dark')
    b.beam([x,.40,.36],[x,.10,.35],.057,'dark')
    b.box([x,.022,.40],[.15,.044,.25],'dark',.016)
    b.oval([x,.065,.36],[.071,.054,.11],'dark')
  }
  b.box([0,.45,-.015],[.46,.075,.47],'wood',.032)
  b.box([0,.74,-.22],[.46,.51,.07],'wood',.035)
  for (const x of [-.17,.17]) for (const z of [-.18,.17]) b.box([x,.2175,z],[.042,.435,.042],'wood')
  b.beam([-.18,.95,0],[-.22,.75,.23],.061,'linen')
  b.beam([-.22,.75,.23],[.01,.79,.41],.047,'linen')
  b.oval([.025,.79,.43],[.06,.03,.07],'wood2')
  return b.finish()
}
export function contactTexture() {
  const n = 64, d = new Uint8Array(n * n * 4)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = (y * n + x) * 4, u = (x / (n - 1) - .5) * 2, v = (y / (n - 1) - .5) * 2
    d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.round(Math.exp(-4 * (u * u + v * v)) * 190)
  }
  const t = new DataTexture(d, n, n, RGBAFormat); t.magFilter = t.minFilter = LinearFilter; t.needsUpdate = true; return t
}
export const treeLayout: Vec3[] = [
  [-13, 3, 5], [-13, 2.7, -2], [-11, 3, -7], [-7.7, 3, -10], [-3, 3.1, -11], [2, 3.5, -12], [7, 3.2, -10.7], [11, 3.2, -8], [13.5, 3.3, -2.6], [13.7, 2.7, 3],
  [-17, 3.5, -13], [-12, 3, -17], [-6.5, 3.3, -18], [0, 3.4, -19], [6, 3.7, -18], [13, 3.5, -17], [18, 3, -12], [19, 3, -6],
]
export function makeTrunks(m: Materials, high: boolean) {
  const a = builder(m)
  for (let i = 0; i < treeLayout.length; i++) {
    const [x, scale, z] = treeLayout[i], y = groundY(x, z), h = scale * 2.4, lean = (seeded(i + 88) - .5) * .9
    const points: Vec3[] = [[x, y, z], [x + .13, y + h * .35, z], [x + lean, y + h * .7, z + .2], [x + lean + .15, y + h, z - .18]]
    for (let j = 0; j < 3; j++) a.beam(points[j], points[j + 1], (.23 - j * .052) * (scale / 3), 'bark', (.18 - j * .053) * (scale / 3), high ? 10 : 7)
    for (let j = 0; j < 6; j++) {
      const angle = j * 2.4 + i, branch: Vec3 = [x + Math.cos(angle) * scale * .64, y + h * (.67 + j * .04), z + Math.sin(angle) * scale * .65]
      a.beam([x + lean * .5, y + h * (.48 + j * .05), z], branch, .09, 'bark', .024)
      a.beam(branch, [branch[0] + Math.cos(angle + .9) * .55, branch[1] + .65, branch[2] + Math.sin(angle + .9) * .55], .026, 'bark', .012)
    }
    for (let j = 0; j < 4; j++) {
      const angle = j * 1.57 + i
      a.beam([x, y + .15, z], [x + Math.cos(angle) * .65, y + .015, z + Math.sin(angle) * .65], .14, 'bark', .04)
    }
  }
  return a.finish()
}
