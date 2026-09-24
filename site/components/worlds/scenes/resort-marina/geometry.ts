import { BoxGeometry, BufferGeometry, Color, CylinderGeometry, DataTexture, DoubleSide, ExtrudeGeometry, Float32BufferAttribute, LinearFilter, LinearMipmapLinearFilter, MeshStandardMaterial, Object3D, Quaternion, RepeatWrapping, RGBAFormat, Shape, SphereGeometry, TubeGeometry, CatmullRomCurve3, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Vec3 } from '../../contract'
import { seeded } from '../../math'
export const finishes = { plaster: '#ded3b9', stone: '#aa9e86', cut: '#b9a585', sand: '#d2bd8d', timber: '#90704b', endgrain: '#b6986b', dark: '#273e41', glass: '#3b6670', steel: '#a6b5af', ivory: '#e5dec6', cloth: '#cfb684', burgundy: '#9e4f3e', navy: '#264d5e', leaf: '#64794e', leafLight: '#89935b', trunk: '#796443', amber: '#dfab52', teal: '#4c9e9a', skin: '#bd9878', uniform: '#698e95', rubber: '#334542' }
export type Finish = keyof typeof finishes
export type Materials = Record<Finish, MeshStandardMaterial>
export const mooringTies: Record<'sail' | 'moored' | 'kayak', { local: Vec3; anchor: Vec3 }[]> = {
  sail: [{ local: [.855, .765, 2.6], anchor: [-14.9, .88, 8.8] }, { local: [1.23, .675, -2.5], anchor: [-14.9, .88, .5] }],
  moored: [{ local: [-.64, .77, 1.8], anchor: [-8.6, .65, 5] }, { local: [-1.02, .685, -1.8], anchor: [-7.4, .88, 7.7] }],
  kayak: [{ local: [.205, .22, .9], anchor: [-14.9, .88, 8.8] }],
}
export type Part = { geometry: BufferGeometry; material: MeshStandardMaterial }
export function createMaterials(): Materials {
  const m = {} as Materials
  for (const k of Object.keys(finishes) as Finish[]) m[k] = new MeshStandardMaterial({ color: finishes[k], roughness: 0.8 })
  for (const k of ['plaster', 'stone', 'sand', 'timber'] as Finish[]) {
    const data = new Uint8Array(64 * 64 * 4), base = new Color(finishes[k])
    for (let i = 0; i < 4096; i++) { const v = 1 + (seeded(i) - .5) * .16; data.set([base.r * 255 * v, base.g * 255 * v, base.b * 255 * v, 255], i * 4) }
    const t = new DataTexture(data, 64, 64, RGBAFormat); t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(k === 'timber' ? 1 : 4, 4); t.magFilter = LinearFilter; t.minFilter = LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true
    m[k].map = t; m[k].color.set('#ffffff')
  }
  m.steel.metalness = .65; m.steel.roughness = .35
  m.glass.metalness = .4; m.glass.roughness = .22
  m.burgundy.roughness = .3; m.navy.roughness = .34; m.ivory.roughness = .4
  m.ivory.side = DoubleSide; m.cloth.side = DoubleSide; m.leaf.side = DoubleSide; m.leafLight.side = DoubleSide
  return m
}
export function assembly(m: Materials, high: boolean) {
  const bins = new Map<Finish, BufferGeometry[]>()
  const put = (geometry: BufferGeometry, f: Finish, p: Vec3 = [0, 0, 0], r: Vec3 = [0, 0, 0], s: Vec3 = [1, 1, 1]) => {
    const o = new Object3D(); o.position.set(...p); o.rotation.set(...r); o.scale.set(...s); o.updateMatrix(); geometry.applyMatrix4(o.matrix)
    let g = geometry
    if (g.index) { g = geometry.toNonIndexed(); geometry.dispose() }
    if (!g.attributes.uv) g.setAttribute('uv', new Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    if (!g.attributes.normal) g.computeVertexNormals()
    const list = bins.get(f) || []; list.push(g); bins.set(f, list)
  }
  const box = (p: Vec3, s: Vec3, f: Finish, b = 0, r: Vec3 = [0, 0, 0]) => put(b ? new RoundedBoxGeometry(...s, 1, Math.min(b, Math.min(...s) * .4)) : new BoxGeometry(...s), f, p, r)
  const cylinder = (p: Vec3, radius: number, h: number, f: Finish, r: Vec3 = [0, 0, 0], top = radius) => put(new CylinderGeometry(top, radius, h, high ? 12 : 8), f, p, r)
  const beam = (p: Vec3, q: Vec3, radius: number, f: Finish) => { const start = new Vector3(...p), end = new Vector3(...q), d = end.clone().sub(start); const g = new CylinderGeometry(radius, radius, d.length(), high ? 8 : 6); g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.normalize())); put(g, f, start.add(end).multiplyScalar(.5).toArray() as Vec3) }
  const tube = (p: Vec3[], radius: number, f: Finish) => put(new TubeGeometry(new CatmullRomCurve3(p.map(v => new Vector3(...v))), high ? 32 : 18, radius, high ? 6 : 4, false), f)
  const shape = (points: [number, number][], y: number, depth: number, f: Finish) => { const s = new Shape(); points.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z)); s.closePath(); const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 16 }); g.rotateX(-Math.PI / 2); put(g, f, [0, y, 0]) }
  const finish = () => [...bins].map(([f, list]) => { const geometry = mergeGeometries(list, false)!; list.forEach(g => g.dispose()); return { geometry, material: m[f] } })
  return { put, box, cylinder, beam, tube, shape, finish }
}
export function cloth(w: number, d: number, sag: number) {
  const g = new BufferGeometry(), v: number[] = [], uv: number[] = []
  const point = (i: number, j: number) => { const u = i / 12, z = j / 6; v.push((u - .5) * w, -Math.sin(u * Math.PI) * sag + Math.sin(z * Math.PI) * .09, (z - .5) * d); uv.push(u, z) }
  for (let i = 0; i < 12; i++) for (let j = 0; j < 6; j++) { point(i, j); point(i + 1, j + 1); point(i + 1, j); point(i, j); point(i, j + 1); point(i + 1, j + 1) }
  g.setAttribute('position', new Float32BufferAttribute(v, 3)); g.setAttribute('uv', new Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); return g
}
export function makeSite(m: Materials, high: boolean) {
  const a = assembly(m, high)
  // A continuous low coastal rise joins the terrace behind the resort.
  const ridge = new BufferGeometry(), rv: number[] = []
  const rp = (i: number, j: number) => { const x = -60 + i * 120 / 33, z = -28.5 - j * 3.6; const edge = Math.max(0, Math.min(1, (46 + j * .85 - Math.abs(x)) / 11)); const h = -.55 + edge * (1.65 + Math.sin(Math.min(1, j / 9) * Math.PI / 2) * (4.1 + 4 * Math.exp(-(((x + 21) / 20) ** 2)) + 3 * Math.exp(-(((x - 30) / 16) ** 2)))); return [x, h + Math.sin(x * .21 + j * .45) * Math.min(j * .1, .45), z] }
  for (let i = 0; i < 33; i++) for (let j = 0; j < 13; j++) rv.push(...rp(i, j), ...rp(i + 1, j), ...rp(i + 1, j + 1), ...rp(i, j), ...rp(i + 1, j + 1), ...rp(i, j + 1))
  ridge.setAttribute('position', new Float32BufferAttribute(rv, 3)); ridge.computeVertexNormals(); a.put(ridge, 'leafLight')
  // Sparse salt-tolerant shrubs break up the distant ridge silhouette.
  for (let i = 0; i < (high ? 65 : 40); i++) { const x = -38 + seeded(i + 430) * 80, z = -31 - seeded(i + 440) * 10; const j = (-28.5 - z) / 3.6; const y = rp((x + 60) * 33 / 120, j)[1]; a.put(new SphereGeometry(1, 7, 5), i % 3 ? 'leaf' : 'leafLight', [x, y + .35, z], [0, i, 0], [.7 + seeded(i) * .7, .55, .7 + seeded(i + 10) * .6]) }
  const coast = (offset: number) => { const p: [number, number][] = [[-36, -29], [35, -29]]; for (let i = 0; i <= 48; i++) { const x = 35 - i * 71 / 48; p.push([x, -12 + .0085 * x * x + offset]) } return p }
  a.shape(coast(2.4), -.65, .73, 'sand'); a.shape(coast(1.2), .08, .32, 'sand'); a.shape(coast(0), .4, .55, 'cut'); a.shape(coast(-.5), .95, .18, 'stone'); a.shape(coast(-2), 1.13, .13, 'sand')
  // Cut stone courses follow the actual curved shoreline.
  for (let i = 0; i < 65; i++) { const x = -32 + i; const z = -12 + .0085 * x * x; const angle = -Math.atan(.017 * x); for (let j = 0; j < 2; j++) a.box([x + j * .2, .57 + j * .25, z], [.95, .22, .33], j % 2 ? 'stone' : 'cut', .025, [0, angle, 0]) }
  // The resort is a group of stepped pavilions with recessed rooms and shaded verandas.
  function pavilion(x: number, z: number, width: number, floors: number) {
    a.box([x, 1.5, z], [width + 1, .65, 6.8], 'stone', .14)
    for (let level = 0; level < floors; level++) {
      const y = 1.84 + level * 3.05, retreat = level * .45
      a.box([x, y + 1.39, z - retreat], [width, 2.78, 5.7], 'plaster', .09)
      a.box([x, y + .1, z + 3.15 - retreat], [width + .8, .2, 1.9], 'stone', .055)
      for (let bay = 0; bay < Math.floor(width / 2.7); bay++) {
        const xx = x - width / 2 + 1.45 + bay * 2.7
        a.box([xx, y + 1.27, z + 2.872 - retreat], [2.05, 2.24, .04], 'dark')
        a.box([xx, y + 1.3, z + 2.91 - retreat], [1.76, 2.02, .035], 'glass')
        a.box([xx, y + 1.3, z + 2.96 - retreat], [.065, 2.03, .07], 'endgrain')
        a.box([xx, y + .28, z + 3.05 - retreat], [2.12, .09, .24], 'plaster', .02)
        for (const side of [-1, 1]) a.box([xx + side * 1.1, y + 1.33, z + 3.0 - retreat], [.11, 2.37, .22], 'endgrain', .018)
        if (level > 0) { a.box([xx, y + .73, z + 3.94 - retreat], [2.18, .94, .055], 'glass'); a.box([xx, y + 1.22, z + 3.94 - retreat], [2.32, .065, .07], 'timber', .02) }
      }
      a.box([x, y + 2.82, z - retreat + .2], [width + 1, .25, 7], 'plaster', .1)
      a.box([x, y + 3, z - retreat], [width + .45, .16, 6.2], 'stone', .055)
    }
    a.box([x, 1.95, z + 4.3], [width + 1.6, .16, 3.7], 'timber', .03)
    for (let xx = x - width / 2; xx <= x + width / 2; xx += 2.6) a.cylinder([xx, 3.38, z + 5.6], .055, 2.8, 'dark')
    a.put(cloth(width + 1.3, 3.5, .26), 'cloth', [x, 4.89, z + 4.2])
    a.box([x, 4.87, z + 5.96], [width + 1.4, .13, .12], 'endgrain', .025)
  }
  pavilion(-8, -19.6, 13, 2); pavilion(8, -22, 10.5, 3); pavilion(-22, -18, 8.1, 1)
  // Terrace pool, sandstone coping, stepped access and recognisable outdoor furniture.
  a.box([-5.2, 1.47, -10.7], [9.2, .64, 4.2], 'stone', .15)
  a.box([-5.2, 1.81, -10.7], [8.6, .08, 3.6], 'teal', .06)
  for (const z of [-12.68, -8.72]) a.box([-5.2, 1.86, z], [9.2, .15, .23], 'plaster', .035)
  for (const x of [-9.7, -.7]) a.box([x, 1.86, -10.7], [.24, .15, 4.2], 'plaster', .035)
  for (let i = 0; i < 5; i++) a.box([1.3, 1.09 + i * .14, -8.2 - i * .32], [2.4, .14, .34], 'plaster', .015)
  for (const [x, z] of [[-22, -9], [-18, -10.5], [-14, -12], [3.7, -14.5], [7, -14.8]]) {
    a.box([x, 1.5, z], [.77, .12, 1.95], 'endgrain', .055)
    a.box([x, 1.62, z + .35], [.7, .11, 1.15], 'ivory', .055)
    a.box([x, 1.9, z - .5], [.7, .12, .84], 'cloth', .06, [-.48, 0, 0])
    for (const zz of [-.65, .65]) a.box([x, 1.32, z + zz], [.64, .36, .055], 'dark')
  }
  for (const [x, z] of [[-24, -10.5], [-17.5, -12.2], [5.6, -16.4]]) {
    a.cylinder([x, 2.65, z], .045, 3.05, 'timber')
    a.put(new CylinderGeometry(.16, 1.7, .56, 12, 1, true), 'cloth', [x, 4.12, z])
    a.cylinder([x, 1.19, z], .38, .11, 'stone')
  }
  // Harbor service building, flat roof plant, double doors and paired visible optics.
  a.box([18, 1.13, -6.5], [11.3, 1.1, 8.3], 'stone', .15)
  a.box([19, 2.98, -8], [7.2, 3.7, 5.5], 'plaster', .12)
  a.box([19, 4.87, -8], [8, .3, 6.3], 'ivory', .12)
  for (const x of [17, 20.3]) { a.box([x, 2.73, -5.215], [2.45, 2.64, .08], 'dark', .055); for (let j = 0; j < 13; j++) a.box([x, 1.65 + j * .17, -5.14], [2.35, .065, .04], 'timber'); a.box([x + .66, 2.8, -5.08], [.06, .28, .04], 'steel') }
  a.box([19, 5.1, -8.5], [4.5, .15, 2.5], 'glass', .035, [-.12, 0, 0])
  for (let i = 0; i < 5; i++) a.box([17 + i, 5.1, -8.5], [.035, .2, 2.5], 'steel')
  // Working quay, stacked supplies and rubber fenders: unlike the public timber marina.
  a.box([18, .57, -1.1], [10.8, 1.1, 4.6], 'stone', .12)
  for (let i = 0; i < 17; i++) a.box([13 + i * .64, 1.13, 1.16], [.59, .09, .35], i % 2 ? 'amber' : 'stone', .01)
  for (const x of [14.1, 17.5, 21]) { a.cylinder([x, .45, 1.25], .24, .78, 'rubber'); a.cylinder([x, 1.24, .7], .13, .25, 'dark'); a.box([x, 1.38, .7], [.48, .07, .13], 'steel', .025) }
  for (let i = 0; i < 4; i++) { a.box([21.2, 1.45 + i * .31, -3.4], [1.6, .28, 1.2], 'endgrain', .035); a.box([21.2, 1.6 + i * .31, -3.4], [1.6, .025, .05], 'timber') }
  // Fixed paired optics share a bolted mast on the working quay.
  a.box([21.875, 1.19, .32], [.52, .14, .52], 'steel', .025)
  a.cylinder([21.875, 2.27, .32], .075, 2.15, 'steel')
  a.beam([21.875, 3.32, .32], [21.875, 3.32, .8], .055, 'steel')
  a.beam([21.55, 3.32, .8], [22.2, 3.32, .8], .055, 'steel')
  for (const x of [21.69, 22.06]) for (const z of [.14, .5]) a.cylinder([x, 1.275, z], .04, .035, 'dark')
  // Stone breakwater hooks around the inlet; every rock is seeded and sits through waterline.
  for (let i = 0; i < (high ? 118 : 78); i++) {
    const t = i / (high ? 117 : 77), x = 28 - 6 * Math.pow(t, 3), z = -9 + 29 * t
    a.put(new SphereGeometry(1, 6, 4), i % 3 ? 'stone' : 'cut', [x + (seeded(i) - .5) * 2.9, .1 + seeded(i + 50) * .6, z], [seeded(i + 3), i, seeded(i + 8)], [1.05 + seeded(i + 1) * .7, .65 + seeded(i + 4) * .45, 1 + seeded(i + 9) * .45])
  }
  a.cylinder([22.3, 1.3, 18], 1.05, 1.1, 'stone'); a.cylinder([22.3, 3.6, 18], .1, 3.8, 'ivory'); a.cylinder([22.3, 5.38, 18], .42, .24, 'ivory'); a.cylinder([22.3, 5.53, 18], .16, .22, 'steel')
  // Public floating timber pontoons with individual deck planks, piling collars and cleats.
  function dock(x: number, z: number, w: number, d: number) {
    a.box([x, .28, z], [w, .38, d], 'dark', .08)
    for (let zz = z - d / 2 + .12; zz < z + d / 2; zz += .25) a.box([x, .51, zz], [w, .13, .22], 'endgrain', .012)
    for (const side of [-1, 1]) a.box([x + side * (w / 2 - .045), .54, z], [.09, .16, d], 'timber', .025)
  }
  dock(-14, -3, 2, 13); dock(-8, 3, 14, 2); dock(-2, 5.75, 1.4, 5.5); dock(-8, 6, 1.3, 4); dock(-14, 6.3, 1.3, 4.6)
  for (const [x, z] of [[-14.9, -6], [-14.9, .5], [-14.9, 8.8], [-7.4, 7.7], [-1.45, 8.4], [-1.4, 2.5]]) {
    a.cylinder([x, .32, z], .14, 3, 'timber'); a.cylinder([x, 1.78, z], .17, .14, 'ivory'); a.cylinder([x, .46, z], .23, .26, 'dark'); a.box([x, .88, z], [.38, .08, .15], 'steel', .025)
  }
  a.box([-8.6, .61, 5], [.16, .07, .14], 'steel', .015)
  // Visitor pennant and service buoys are physical wayfinding, not tactical overlays.
  a.cylinder([-2, 2.05, 3.5], .045, 3, 'ivory'); a.put(cloth(1.1, .55, .14), 'teal', [-1.5, 3.1, 3.5], [Math.PI / 2, 0, 0])
  for (const [x, z] of [[12.1, 4.1], [17, 5.1], [21.5, 4]]) { a.cylinder([x, .14, z], .36, .35, 'amber', [0, 0, 0], .2); a.cylinder([x, .58, z], .055, .64, 'ivory'); a.cylinder([x, .8, z], .13, .16, 'amber') }
  return a.finish()
}
function hullGeometry(length: number, width: number) {
  // Longitudinal sections describe a hard chine, flared topside and rising bow.
  const stations = [[-1, .79], [-.8, .97], [-.35, 1], [.15, .93], [.58, .68], [.84, .34], [1, .015]]
  const profile = [[0, -.38], [-.48, -.22], [-.9, .12], [-1, .6], [1, .6], [.9, .12], [.48, -.22]]
  const v: number[] = [], indices: number[] = []
  for (const [z, w] of stations) for (const [x, y] of profile) v.push(x * w * width / 2, y + Math.max(z, 0) ** 2 * .22, z * length / 2)
  for (let i = 0; i < stations.length - 1; i++) for (let j = 0; j < profile.length; j++) { const a = i * profile.length + j, b = i * profile.length + (j + 1) % profile.length, c = a + profile.length, d = b + profile.length; indices.push(a, c, b, b, c, d) }
  // Stern cap and stem.
  for (let j = 1; j < profile.length - 1; j++) indices.push(0, j, j + 1)
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(v, 3)); g.setIndex(indices); g.computeVertexNormals(); return g
}
export function makeBoat(m: Materials, high: boolean, kind: 'arrival' | 'sail' | 'moored') {
  const a = assembly(m, high), sail = kind === 'sail', l = sail ? 8.4 : 5.6, w = sail ? 2.6 : 2.05
  a.put(hullGeometry(l, w), kind === 'arrival' ? 'burgundy' : sail ? 'navy' : 'ivory')
  for (const s of [-1, 1]) a.tube([[s * w * .39, .63, -l * .5], [s * w * .5, .64, -l * .23], [s * w * .47, .65, l * .075], [s * w * .33, .73, l * .31], [0, .83, l * .5]], .052, 'ivory')
  a.box([0, .65, -.45], [w * .78, .1, l * .53], 'timber', .065)
  a.box([0, .78, -l * .33], [w * .77, .23, .55], 'ivory', .09)
  for (const s of [-1, 1]) { a.box([s * w * .37, .87, .25], [.18, .35, l * .38], 'ivory', .065); a.cylinder([s * w * .51, .37, -1.15], .11, .48, 'ivory') }
  if (!sail) {
    a.box([0, .95, .46], [.78, .55, .7], 'ivory', .09)
    a.box([0, 1.43, .67], [.85, .5, .045], 'glass', .035, [-.18, 0, 0])
    a.box([0, 1.2, -.12], [.58, .29, .44], 'cloth', .085)
    if (kind === 'moored') { a.box([0, .37, -l * .52], [.49, .7, .49], 'dark', .12); a.box([0, -.14, -l * .53], [.13, .52, .2], 'steel', .035) }
    for (const s of [-1, 1]) for (const z of [-1.1, .7]) a.beam([s * .8, .75, z], [s * .83, 2.2, z + .16], .023, 'steel')
    a.put(cloth(1.86, 2.08, -.15), kind === 'arrival' ? 'ivory' : 'navy', [0, 2.2, -.08])
    a.box([0, .98, 1.6], [.91, .18, .66], 'cloth', .11)
    // Seated civilian at the helm; no inferred identity or purpose.
    a.box([.1, 1.51, -.13], [.33, .44, .24], 'uniform', .09)
    a.put(new SphereGeometry(.14, 10, 8), 'skin', [.1, 1.89, -.1]); a.beam([.25, 1.65, .02], [.28, 1.4, .45], .05, 'skin')
  } else {
    a.box([0, .91, .35], [1.62, .6, 2.7], 'ivory', .19)
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) a.box([s * .819, 1.02, -.45 + i * .62], [.03, .23, .36], 'glass', .04)
    a.cylinder([0, 4.62, .6], .056, 8.1, 'ivory'); a.beam([0, 2.05, .6], [0, 2.05, -2.7], .06, 'ivory')
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute([0, 8.5, .6, 0, 2.12, .6, .45, 2.12, -2.9, 0, 8.5, .6, .45, 2.12, -2.9, .26, 4.5, -1.55], 3)); g.computeVertexNormals(); a.put(g, 'cloth')
    a.beam([0, 8.3, .6], [0, .82, 3.8], .014, 'steel'); a.beam([0, 8.3, .6], [0, .74, -4], .014, 'steel')
    for (const s of [-1, 1]) { a.beam([s * 1.17, .8, -2.5], [0, 6.3, .6], .013, 'steel'); for (const z of [-3, -1.5, 1.2, 2.6]) a.cylinder([s * (z > 2 ? .7 : 1.13), 1.0, z], .019, .58, 'steel') }
  }
  if (kind !== 'arrival') for (const { local: [x, y, z] } of mooringTies[kind]) a.box([x, y - .02, z], [.16, .06, .12], 'steel', .015)
  return a.finish()
}
export function makePalm(m: Materials, high: boolean) {
  const a = assembly(m, high)
  a.tube([[0, 0, 0], [.16, 2, 0], [.47, 4.2, .12], [.64, 5.2, .15]], .15, 'trunk')
  for (let i = 0; i < 13; i++) a.cylinder([.045 * i, .4 * i, .012 * i], .165 - i * .003, .075, 'endgrain')
  for (let k = 0; k < 9; k++) {
    const v: number[] = [], theta = k * Math.PI * 2 / 9
    for (let j = 0; j < 8; j++) {
      const p = (t: number, side: number) => { const r = t * 3.15, width = Math.sin(t * Math.PI) * .52 * side; return [.64 + Math.cos(theta) * r + Math.sin(theta) * width, 5.2 + Math.sin(t * Math.PI * .85) * .66 - 1.6 * t * t, .15 + Math.sin(theta) * r - Math.cos(theta) * width] }
      v.push(...p(j / 8, -1), ...p(j / 8, 1), ...p((j + 1) / 8, 1), ...p(j / 8, -1), ...p((j + 1) / 8, 1), ...p((j + 1) / 8, -1))
    }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(v, 3)); g.computeVertexNormals(); a.put(g, k % 2 ? 'leaf' : 'leafLight')
  }
  return a.finish()
}
export function makePerson(m: Materials, high: boolean, staff = false) {
  const a = assembly(m, high)
  a.box([0, 1.05, 0], [.37, .55, .26], staff ? 'uniform' : 'ivory', .095)
  a.put(new SphereGeometry(.15, 10, 8), 'skin', [0, 1.5, 0]); a.cylinder([0, 1.61, 0], .19, .06, 'cloth')
  for (const s of [-1, 1]) { a.beam([s * .1, .82, 0], [s * .13, .13, .04], .072, 'navy'); a.box([s * .13, .085, .07], [.17, .12, .28], 'dark', .04) }
  a.beam([-.23, 1.27, 0], [-.29, .87, .05], .058, 'skin')
  if (!staff) a.beam([.23, 1.27, 0], [.29, .87, .05], .058, 'skin')
  return a.finish()
}

export function makeOutboard(m: Materials, high: boolean) {
  const a = assembly(m, high)
  a.box([0, 0, 0], [.49, .7, .49], 'dark', .09)
  a.box([0, -.51, -.055], [.13, .52, .2], 'steel', .025)
  a.cylinder([0, -.61, -.18], .10, .10, 'dark', [Math.PI / 2, 0, 0])
  a.box([0, -.61, -.245], [.28, .055, .035], 'steel', .012)
  return a.finish()
}
export function makeWalkerBody(m: Materials, high: boolean, staff: boolean) {
  const a = assembly(m, high)
  a.box([0, 1.04, 0], [.36, .49, .25], staff ? 'uniform' : 'ivory', .08)
  a.cylinder([0, 1.34, 0], .065, .14, 'skin')
  a.put(new SphereGeometry(.145, 10, 8), 'skin', [0, 1.5, 0])
  a.cylinder([0, 1.61, 0], .19, .055, 'cloth')
  return a.finish()
}
export function makeShoe(m: Materials, high: boolean) {
  const a = assembly(m, high)
  a.box([0, .055, .045], [.17, .11, .29], 'dark', .025)
  return a.finish()
}
export function makeRestingKayak(m: Materials, high: boolean) {
  const a = assembly(m, high)
  // Shaped buoyant shell, resting paddle clipped alongside, seated guest with supported limbs.
  const g = hullGeometry(3.3, .67); g.scale(1, .28, 1); a.put(g, 'amber', [0, .03, 0])
  a.box([0, .22, -.15], [.48, .09, .93], 'dark', .08)
  a.box([0, .54, -.31], [.31, .46, .25], 'ivory', .075)
  a.put(new SphereGeometry(.13, 10, 8), 'skin', [0, .91, -.28])
  for (const side of [-1, 1]) { a.beam([side * .1, .32, -.2], [side * .14, .29, .55], .065, 'navy'); a.beam([side * .19, .72, -.25], [side * .21, .39, .04], .05, 'skin') }
  a.beam([.38, .27, -1.2], [.38, .27, 1.2], .022, 'timber')
  for (const z of [-1.2, 1.2]) a.box([.38, .27, z], [.16, .03, .36], 'ivory', .045)
  for (const { local: [x, y, z] } of mooringTies.kayak) a.box([x, y - .02, z], [.1, .06, .1], 'steel', .01)
  return a.finish()
}
