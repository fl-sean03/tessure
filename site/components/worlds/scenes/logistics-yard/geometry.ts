import {
  BoxGeometry, BufferGeometry, Color, CylinderGeometry, DataTexture, Float32BufferAttribute,
  LinearFilter, LinearMipmapLinearFilter, MeshStandardMaterial, Object3D, Quaternion, RepeatWrapping,
  RGBAFormat, SphereGeometry, TorusGeometry, Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Vec3 } from '../../contract'
import { seeded } from '../../math'
import { dispatchAccess } from './supervisor'
import { crane, dock, sensors, sensorFrame, rotorCenters } from './motion'
import { controls, load } from './incident'

export const colors = {
  asphalt: '#55575a', concrete: '#b8b1a0', earth: '#89765e', gravel: '#827e75',
  rust: '#955239', orange: '#b76b43', blue: '#435d6c', teal: '#597878', sand: '#afa38b',
  cream: '#ddd1ac', yellow: '#c8a14c', dark: '#26363e', steel: '#a6afb0',
  glass: '#304e60', clear: '#c2d4de', rubber: '#242b30', white: '#dfd9bc', grass: '#777f57', leaf: '#727c62',
} as const
export type Finish = keyof typeof colors
export type Materials = Record<Finish, MeshStandardMaterial>
export type Part = { geometry: BufferGeometry; material: MeshStandardMaterial }
export function makeMaterials(): Materials {
  const materials = {} as Materials
  for (const key of Object.keys(colors) as Finish[]) materials[key] = new MeshStandardMaterial({ color: colors[key], roughness: .76 })
  for (const key of ['asphalt', 'concrete', 'earth', 'gravel'] as Finish[]) {
    const base = new Color(colors[key]), data = new Uint8Array(128 * 128 * 4)
    for (let i = 0; i < 128 * 128; i++) {
      const v = 1 + (seeded(i * .741) - .5) * (key === 'asphalt' ? .22 : .15)
      data[i * 4] = base.r * v * 255; data[i * 4 + 1] = base.g * v * 255; data[i * 4 + 2] = base.b * v * 255; data[i * 4 + 3] = 255
    }
    const tex = new DataTexture(data, 128, 128, RGBAFormat)
    tex.wrapS = tex.wrapT = RepeatWrapping; tex.repeat.set(8, 8); tex.magFilter = LinearFilter
    tex.minFilter = LinearMipmapLinearFilter; tex.generateMipmaps = true; tex.needsUpdate = true
    materials[key].color.set('white'); materials[key].map = tex; materials[key].roughness = .96
  }
  materials.steel.metalness = .68; materials.steel.roughness = .37
  materials.glass.metalness = .34; materials.glass.roughness = .17
  materials.clear.transparent = true; materials.clear.opacity = .16; materials.clear.depthWrite = false; materials.clear.roughness = .12
  materials.cream.metalness = .12; materials.cream.roughness = .4
  for (const key of ['rust', 'orange', 'blue', 'teal'] as Finish[]) { materials[key].metalness = .16; materials[key].roughness = .66 }
  return materials
}
export function assembly(m: Materials, high: boolean) {
  const bins = new Map<Finish, BufferGeometry[]>()
  function put(input: BufferGeometry, f: Finish, p: Vec3 = [0, 0, 0], r: Vec3 = [0, 0, 0], s: Vec3 = [1, 1, 1]) {
    const g = input.index ? input.toNonIndexed() : input
    if (g !== input) input.dispose()
    const o = new Object3D(); o.position.set(...p); o.rotation.set(...r); o.scale.set(...s); o.updateMatrix(); g.applyMatrix4(o.matrix)
    if (!g.attributes.uv) g.setAttribute('uv', new Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    const list = bins.get(f) || []; list.push(g); bins.set(f, list)
  }
  function box(p: Vec3, s: Vec3, f: Finish, bevel = 0, r: Vec3 = [0, 0, 0]) {
    put(bevel ? new RoundedBoxGeometry(...s, 1, Math.min(bevel, Math.min(...s) * .45)) : new BoxGeometry(...s), f, p, r)
  }
  function cylinder(p: Vec3, radius: number, length: number, f: Finish, r: Vec3 = [0, 0, 0], top = radius, sides = high ? 16 : 10) {
    put(new CylinderGeometry(top, radius, length, sides), f, p, r)
  }
  function beam(a: Vec3, b: Vec3, width: number, f: Finish, depth = width) {
    const start = new Vector3(...a), end = new Vector3(...b), d = end.clone().sub(start)
    const g = new BoxGeometry(width, d.length(), depth)
    g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize()))
    put(g, f, start.add(end).multiplyScalar(.5).toArray() as Vec3)
  }
  function finish(): Part[] {
    return [...bins].map(([f, list]) => { const g = mergeGeometries(list, false)!; list.forEach(v => v.dispose()); g.computeBoundingSphere(); return { geometry: g, material: m[f] } })
  }
  return { put, box, cylinder, beam, finish }
}

/** ISO-like physical features; deliberately unbranded illustrative cargo. */
export function makeContainer(m: Materials, high: boolean, finish: Finish, length = 12.2): Part[] {
  const a = assembly(m, high), h = 2.88, w = 2.44
  a.box([0, h / 2, 0], [length - .14, h - .13, w - .14], finish, .06)
  for (const z of [-w / 2, w / 2]) {
    for (const y of [.095, h - .095]) a.box([0, y, z], [length, .19, .14], finish, .018)
    for (const x of [-length / 2 + .07, length / 2 - .07]) {
      a.box([x, h / 2, z], [.17, h, .16], finish, high ? .025 : 0)
      for (const y of [.065, h - .065]) a.box([x, y, z], [.22, .13, .19], 'steel', high ? .018 : 0)
    }
    for (let x = -length / 2 + .32; x < length / 2 - .2; x += high ? .34 : .47) a.box([x, h / 2, z - Math.sign(z) * .048], [.09, h - .42, .09], finish)
    // Stencilled bands and a small weathered placard give scale without fictional product data.
    a.box([length / 2 - 1.35, 2.18, z + Math.sign(z) * .02], [1.2, .19, .01], 'cream')
    for (let k = 0; k < 4; k++) a.box([length / 2 - 1.8 + k * .17, 1.9, z + Math.sign(z) * .022], [.08, .065, .012], 'cream')
  }
  for (let x = -length / 2 + .3; x < length / 2 - .1; x += high ? .45 : .65) a.box([x, h - .03, 0], [.085, .085, w - .24], finish)
  for (const side of [-1, 1]) {
    a.box([length / 2 + .006, h / 2, side * .585], [.065, h - .3, 1.1], finish, .01)
    a.box([length / 2 + .047, h / 2, side * .016], [.018, h - .23, .025], 'dark')
    for (const offset of [-.31, .31]) {
      const z = side * .585 + offset
      a.cylinder([length / 2 + .065, h / 2, z], .022, h - .48, 'steel', [0, 0, 0], .022, 6)
      for (const y of [.45, 1.05, 2.45]) a.box([length / 2 + .073, y, z], [.045, .075, .12], 'steel')
    }
    a.box([length / 2 + .09, 1.08, side * .6], [.05, .035, .36], 'steel')
  }
  return a.finish()
}

export const cargo = [
  { p: [-26, .05, -9] as Vec3, c: 'blue' as Finish }, { p: [-12.8, .05, -9] as Vec3, c: 'rust' as Finish },
  { p: [.4, .05, -9] as Vec3, c: 'teal' as Finish }, { p: [-26, 2.93, -9] as Vec3, c: 'sand' as Finish },
  { p: [-12.8, 2.93, -9] as Vec3, c: 'orange' as Finish }, { p: [.4, 2.93, -9] as Vec3, c: 'blue' as Finish },
  { p: [-26, .05, -13] as Vec3, c: 'rust' as Finish }, { p: [-12.8, .05, -13] as Vec3, c: 'sand' as Finish },
  { p: [.4, .05, -13] as Vec3, c: 'blue' as Finish }, { p: [-26, 2.93, -13] as Vec3, c: 'blue' as Finish },
  { p: [-12.8, 2.93, -13] as Vec3, c: 'teal' as Finish }, { p: [-12.8, 5.81, -13] as Vec3, c: 'rust' as Finish },
  { p: [.4, 2.93, -13] as Vec3, c: 'sand' as Finish },
  { p: [-34, .05, 8] as Vec3, c: 'teal' as Finish }, { p: [-20.8, .05, 8] as Vec3, c: 'blue' as Finish },
  { p: [-34, 2.93, 8] as Vec3, c: 'rust' as Finish },
  { p: [-27, .05, -19] as Vec3, c: 'sand' as Finish }, { p: [-.8, .05, -19] as Vec3, c: 'rust' as Finish },
  { p: [12.4, .05, -19] as Vec3, c: 'teal' as Finish }, { p: [12.4, 2.93, -19] as Vec3, c: 'blue' as Finish },
].filter(v => !(v.p[0] < -6 && v.p[0] > -33 && v.p[2] < 1 && v.p[2] > -18))

export function makeSite(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.box([0, -.9, -12], [100, 1.6, 78], 'earth', .6)
  a.box([0, -.15, -12], [96, .3, 75], 'concrete', .22)
  a.box([0, dispatchAccess.apronTop / 2, -5], [91, dispatchAccess.apronTop, 54], 'asphalt', .04)
  a.box([0, .058, -24], [91, .02, 6.4], 'gravel')
  // Parallel rail edge: timber sleepers, paired running rails and a short freight flat.
  for (let x = -43; x <= 43; x += high ? 1.25 : 1.8) a.box([x, .125, -24], [.22, .13, 3.3], 'earth', .025)
  for (const z of [-24.78, -23.22]) { a.box([0, .23, z], [92, .18, .09], 'steel'); a.box([0, .16, z], [92, .055, .24], 'dark') }
  a.box([-14, 1.23, -24], [16, .38, 2.7], 'rust', .045)
  for (let x = -21; x < -6; x += .95) a.box([x, 1.455, -24], [.8, .065, 2.5], 'earth')
  for (const x of [-20, -18.9, -9.1, -8]) {
    a.cylinder([x, .65, -24], .055, 1.56, 'steel', [Math.PI / 2, 0, 0])
    for (const z of [-24.78, -23.22]) { a.cylinder([x, .65, z], .33, .19, 'dark', [Math.PI / 2, 0, 0]); a.cylinder([x, .65, z + Math.sign(-24 - z) * .13], .37, .04, 'steel', [Math.PI / 2, 0, 0]) }
  }
  for (const x of [-19.45, -8.55]) { a.box([x, .89, -24], [2.5, .2, 1.1], 'dark'); a.box([x, 1.01, -24], [.65, .18, 1.5], 'steel') }
  // Lane, loading aprons, a crosswalk and the actual verification stop line.
  for (const z of [-4, 4.7]) a.box([2, .05025, z], [81, .001, .115], 'white')
  for (let x = -36; x < 37; x += 5) a.box([x, .05025, 5.3], [2.2, .001, .11], 'yellow')
  for (let x = -34; x < 10; x += 13.2) for (const z of [-6.8, 10.3]) {
    a.box([x, .05025, z], [.12, .001, 1.05], 'yellow'); a.box([x + .55, .05025, z + .5], [1.2, .001, .12], 'yellow')
  }
  a.box([17.1, .05025, .15], [.32, .001, 7.7], 'white')
  for (let z = -3.8; z < 4; z += 1.1) a.box([27.3, .05025, z], [2.25, .001, .52], 'white')
  for (let x = 5; x < 16; x += 1.5) a.box([x, .05025, -4.85], [.15, .001, 1.4], 'yellow', 0, [0, -.6, 0])
  for (const x of [-4, 12, 32]) {
    a.box([x, .06, 6], [1.5, .055, .36], 'dark')
    for (let i = 0; i < 8; i++) a.box([x - .64 + i * .18, .09, 6], [.035, .025, .3], 'steel')
  }
  // Long planted swale; discontinuous planting prevents a toy-tree border.
  a.box([3, .13, 13], [80, .26, 4.8], 'concrete', .22)
  a.box([3, .275, 13], [79.4, .075, 4.1], 'earth', .1)
  for (let i = 0; i < (high ? 110 : 65); i++) {
    const x = -34 + seeded(i * 3) * 72, z = 11.3 + seeded(i * 3 + 1) * 3.1, s = .16 + seeded(i * 3 + 2) * .25
    a.put(new SphereGeometry(1, 6, 4), i % 4 ? 'grass' : 'gravel', [x, .3 + s * .3, z], [0, i, .2], [s * 1.6, s * .6, s])
  }
  // Dispatch building: corrugated cladding, inset framed glazing, downpipes and roof plant.
  a.box(dispatchAccess.platform.position, dispatchAccess.platform.size, 'concrete', .15)
  a.box([27, 1.96, -8.5], [10.3, 3, 5.6], 'sand', .09)
  for (let x = 22; x < 32; x += .3) a.box([x, 1.93, -5.665], [.055, 2.86, .05], 'cream')
  for (const x of [23.3, 26.1, 28.9]) {
    a.box([x, 2.16, -5.63], [2.1, 1.6, .08], 'dark', .025)
    a.box([x, 2.19, -5.565], [1.96, 1.42, .055], 'glass', .015)
    a.box([x, 2.18, -5.526], [.055, 1.48, .035], 'steel')
    a.box([x, 1.42, -5.5], [2.19, .1, .21], 'cream', .02)
  }
  a.box([21.78, 1.8, -8.2], [.045, 2.5, 1.4], 'dark', .03)
  a.box([21.745, 2.18, -8.2], [.025, 1.35, 1.19], 'glass')
  a.box([21.68, 1.48, -7.7], [.075, .3, .045], 'steel')
  a.box([26.7, 3.54, -8.25], [11.7, .28, 6.7], 'blue', .075)
  a.box([26.7, 3.71, -8.25], [11.5, .09, 6.5], 'steel', .04)
  for (let z = -11.1; z < -5.3; z += .35) a.box([26.7, 3.77, z], [11.2, .035, .045], 'sand')
  for (const x of [24.4, 28.2]) {
    a.box([x, 4.08, -9.1], [1.65, .65, 1.4], 'cream', .075)
    a.cylinder([x, 4.415, -9.1], .48, .03, 'dark', [0, 0, 0], .48, 20)
    for (let z = -9.6; z < -8.6; z += .18) a.box([x, 4.445, z], [1.1, .025, .025], 'steel')
  }
  // Front access steps: plinth .46, first tread .23, second tread .11, apron .05.
  a.box([20.45, 3.4, -6.75], [3.5, .2, 7.9], 'blue', .045)
  for (const z of [-10.3, -3.35]) a.box([18.95, 1.85, z], [.15, 3.3, .15], 'steel', .025)
  a.box(dispatchAccess.upperStep.position, dispatchAccess.upperStep.size, 'concrete', .05)
  a.box(dispatchAccess.lowerStep.position, dispatchAccess.lowerStep.size, 'concrete', .035)
  for (const x of [24, 27, 30]) { a.cylinder([x, .88, -3.55], .07, 1.2, 'steel'); a.cylinder([x, .4, -3.55], .15, .18, 'steel') }
  a.beam([24, 1.44, -3.55], [31.4, 1.44, -3.55], .065, 'steel')
  // Normal controlled departure: fixed closed boom, counterweight and verification call pedestal.
  a.box([22.1, .96, -4.1], [.75, 1.7, .85], 'cream', .12)
  a.cylinder([22.1, 1.42, -3.56], .2, .18, 'dark', [Math.PI / 2, 0, 0])
  a.box([22.1, 1.43, .15], [.17, .21, 7.6], 'cream', .035)
  for (let z = -2.9; z < 3.85; z += 1.1) a.box([22.1, 1.43, z], [.183, .225, .42], 'rust')
  a.cylinder([22.1, .7, 4], .06, 1.28, 'steel')
  a.box([17.8, 1.02, -3.45], [.27, 1.95, .32], 'blue', .055)
  a.box([17.8, 1.92, -3.35], [.52, .48, .2], 'dark', .045)
  a.box([17.8, 1.96, -3.238], [.36, .25, .018], 'glass', .025)
  for (const x of [17.7, 20.3, 23.6]) for (const z of [-4.3, 5.9]) {
    a.cylinder([x, .72, z], .105, 1.32, 'yellow')
    a.cylinder([x, .88, z], .11, .22, 'dark')
    a.cylinder([x, .105, z], .24, .11, 'concrete')
  }
  addIncidentSite(a)
  addSensors(a, m, high)
  addDock(a)
  // The practical emitters have matching supported housings.
  a.cylinder([20.7, 3.22, -5.2], .18, .16, 'cream')
  a.cylinder([20.7, 3.13, -5.2], .15, .025, 'white')
  a.box([-22.3, 14.87, 6.82], [.42, .18, .16], 'sand', .025)
  a.box([-22.3, 14.87, 6.911], [.35, .1, .015], 'white', .015)
  // A distant transload shed sits beyond the rail edge, softened by the same world fog.
  a.box([-8, 3.6, -43], [62, 7.2, 10], 'sand', .08)
  a.box([-8, 7.24, -43], [63, .22, 11.1], 'blue', .045)
  a.box([-8, 7.44, -43], [62.7, .1, 10.8], 'steel')
  for (let x = -38; x < 23; x += 1.8) a.box([x, 3.7, -37.94], [.085, 6.65, .13], 'cream')
  for (const x of [-32, -21, -10, 1, 12]) {
    a.box([x, 2.8, -37.85], [6.6, 5.4, .13], 'blue')
    a.box([x, 5.95, -37.7], [7.4, .22, 1.5], 'cream')
    for (let y = .4; y < 5.4; y += .5) a.box([x, y, -37.765], [6.45, .045, .04], 'steel')
    a.box([x, 6.65, -37.86], [6.8, .63, .035], 'glass')
  }
  // Light masts and distant storage silhouettes build scale without a wall of objects.
  for (const [x, z] of [[-39, -28], [22, -28], [-37, 18], [38, 14]]) {
    a.cylinder([x, 7, z], .18, 14, 'steel', [0, 0, 0], .075)
    a.box([x, 14, z], [3.2, .15, .24], 'dark', .035)
    for (const dx of [-1.1, 0, 1.1]) a.box([x + dx, 13.86, z + .15], [.57, .21, .5], 'cream', .055, [.18, 0, 0])
  }
  for (let x = -44; x < 45; x += 3) {
    a.cylinder([x, 1.45, -30], .05, 2.8, 'steel', [0, 0, 0], .05, 6)
    if (x < 42) for (const y of [.6, 1.5, 2.65]) a.box([x + 1.5, y, -30], [3, .022, .022], 'steel')
  }
  return a.finish()
}

export function makeGantry(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  // Rail-mounted A-frames. Leg feet, diagonal stiffeners and crosshead joints carry a visible load path.
  for (const z of [-21, 5.9]) {
    a.box([-20, .12, z], [30.6, .14, .64], 'concrete', .035)
    a.box([-20, .27, z], [30, .16, .17], 'steel')
    a.box([-20, .98, z], [10.8, .7, .92], 'blue', .08)
    for (const x of [-24.3, -23.2, -16.8, -15.7]) {
      a.cylinder([x, .71, z], .36, .7, 'dark', [Math.PI / 2, 0, 0])
      a.cylinder([x, .71, z + .4], .21, .08, 'steel', [Math.PI / 2, 0, 0])
    }
    a.beam([-24, 1.25, z], [-22.3, 16.4, z], .56, 'orange', .8)
    a.beam([-16, 1.25, z], [-17.7, 16.4, z], .56, 'orange', .8)
    a.beam([-24, 2, z], [-17.95, 14, z], .19, 'sand')
    a.beam([-16, 2, z], [-22.05, 14, z], .19, 'sand')
    for (const y of [4, 8, 12]) a.box([-20, y, z], [6.4 - y * .12, .23, .36], 'orange', .02)
    for (const x of [-22.3, -17.7]) a.box([x, 16.4, z], [.86, 1.1, 1.14], 'orange', .045)
  }
  for (const x of [-22.3, -17.7]) {
    a.box([x, 16.5, -7.6], [.62, 1.48, 29.8], 'orange', .055)
    for (const y of [15.76, 17.25]) a.box([x, y, -7.6], [.82, .12, 30.2], 'sand', .025)
    a.box([x, 17.4, -7.6], [.12, .17, 29.7], 'steel')
  }
  // Brace the outer catwalk, leaving the hoist corridor open between the main girders.
  for (let z = -21; z < 6; z += 3) a.beam([-23.6, 16.7, z], [-22.7, 16.7, z + 2.9], .13, 'sand')
  for (const z of [-22, 7]) a.box([-20, 16.7, z], [4.6, .25, .25], 'orange')
  // Catwalk with railings and ladder on the accessible outer leg.
  a.box([-23.15, 15.7, -7.6], [1.05, .1, 29.7], 'dark')
  for (let z = -22; z < 8; z += 2) a.box([-23.66, 16.25, z], [.055, 1.16, .055], 'steel')
  a.box([-23.66, 16.81, -7.6], [.055, .055, 29.7], 'steel')
  for (const x of [-25.03, -24.49]) a.beam([x, .9, 6.45], [x + 1.6, 15.75, 6.45], .065, 'steel')
  for (let y = 1.1; y < 15.8; y += .38) a.box([-24.77 + (y - .9) * 1.6 / 14.85, y, 6.45], [.63, .04, .075], 'steel')
  a.box([-22.4, 13.9, 5.65], [2.4, 2.05, 2.2], 'orange', .14)
  for (const z of [4.52, 6.78]) a.box([-22.4, 14.11, z], [1.99, 1.22, .04], 'glass', .025)
  a.box([-21.17, 14.1, 5.65], [.04, 1.2, 1.75], 'glass', .025)
  return a.finish()
}
export function makeTrolley(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.box([-20, 18.16, 0], [5.7, .4, 2.8], 'blue', .08)
  for (const x of [-22.3, -17.7]) for (const z of [-.98, .98]) {
    for (const dx of [-.27, .27]) a.box([x + dx, 17.88, z], [.08, .49, .33], 'steel', .025)
    a.cylinder([x, crane.wheelY, z], .075, .62, 'steel', [0, 0, Math.PI / 2])
  }
  // Enclosed winch; the four visible fairleads terminate the internal rope runs.
  a.box([-20, 18.73, 0], [2.5, .8, 1.7], 'blue', .1)
  a.box([-20, 19.16, 0], [2.64, .12, 1.83], 'steel', .035)
  for (let x = -20.85; x < -19.1; x += .22) a.box([x, 18.74, .858], [.09, .43, .012], 'dark')
  for (const x of crane.cableXs) for (const z of crane.cableZs) {
    a.box([x, 17.93, z], [.24, .32, .26], 'blue', .03)
    a.cylinder([x, crane.cableTop + .01, z], .065, .045, 'dark')
  }
  return a.finish()
}
export function makeTrolleyWheel(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.cylinder([0, 0, 0], crane.wheelRadius, .32, 'dark', [0, 0, Math.PI / 2])
  for (const x of [-.18, .18]) {
    a.cylinder([x, 0, 0], .255, .026, 'steel', [0, 0, Math.PI / 2])
    a.box([x + Math.sign(x) * .02, .095, 0], [.014, .18, .03], 'steel')
  }
  return a.finish()
}
export function makeSpreader(m: Materials, high: boolean): Part[] {
  const a=assembly(m,high)
  for(const z of[-load.halfCornerZ,load.halfCornerZ])a.box([load.x,.11,z],[6.1,.22,.19],'yellow',.025)
  for(const x of[load.x-load.halfCornerX,load.x+load.halfCornerX]){a.box([x,.11,0],[.2,.22,2.5],'yellow',.025);for(const z of[-load.halfCornerZ,load.halfCornerZ])a.box([x,-.015,z],[.24,.17,.23],'steel',.018)}
  a.box([load.x,.12,0],[2.4,.36,1.8],'blue',.055)
  for(const x of crane.cableXs)for(const z of crane.cableZs)a.box([x,.12,z],[.32,.18,.32],'steel',.025)
  return a.finish()
}

export function makeTractor(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.box([-.25, .94, 0], [4.7, .29, 2.24], 'dark', .065)
  a.box([-1.28, 1.2, 0], [2.7, .24, 2.6], 'steel', .035)
  a.cylinder([-1.5, 1.36, 0], .61, .14, 'dark')
  for (const z of [-1.19,.83]) a.box([.85,1.77,z],[2.36,.66,.12],'cream',.065)
  a.box([1.99,1.77,-.18],[.12,.66,2.1],'cream',.065)
  a.box([-.27,1.77,-.18],[.12,.66,2.1],'cream',.065)
  a.box([.91, 1.425, -.18], [2.14, .11, 1.94], 'dark', .045)
  a.box([-.03, 2.72, -.18], [.11, 1.02, 1.94], 'cream', .035)
  a.box([.65, 1.87, -.18], [.63, .16, .71], 'dark', .065)
  a.box([.35, 2.23, -.18], [.16, .69, .71], 'dark', .065)
  a.put(new TorusGeometry(.23, .025, 6, 16), 'dark', [1.17, 2.41, -.18], [0, Math.PI / 2, 0])
  a.box([.87, 3.34, -.18], [2.38, .22, 2.21], 'cream', .12)
  // Glass is inset between cab pillars; side entry has a handle and open-steel steps.
  a.box([1.988, 2.73, -.18], [.025, .85, 1.73], 'clear', .01, [0, 0, -.035])
  for (const z of [-1.19, .83]) {
    a.box([.95, 2.38, z], [1.84, .12, .04], 'clear', .01)
    for (const x of [.0, 1.91]) a.box([x, 2.74, z], [.1, 1.1, .09], 'cream', .018)
    a.box([.11, 2.74, z + Math.sign(z) * .025], [.095, .89, .04], 'cream')
    a.box([.1, 2.03, z + Math.sign(z) * .045], [.29, .055, .05], 'steel', .017)
    for (const y of [.62, .94]) a.box([.35, y, z + Math.sign(z) * .19], [.88, .095, .39], 'steel', .025)
    a.beam([1.66, 2.83, z], [1.76, 2.86, z + Math.sign(z) * .45], .038, 'dark')
    a.box([1.68, 2.71, z + Math.sign(z) * .47], [.19, .36, .12], 'dark', .035)
  }
  a.box([2.08, 1.59, -.18], [.07, .56, 1.05], 'dark', .04)
  for (let y = 1.4; y < 1.87; y += .1) a.box([2.13, y, -.18], [.035, .025, .98], 'steel')
  a.box([2.14, .93, 0], [.3, .28, 2.54], 'blue', .065)
  for (const z of [-.91, .91]) { a.box([2.22, 1.28, z], [.085, .22, .34], 'white', .035); a.box([-2.61, 1.09, z], [.045, .12, .25], 'rust', .025) }
  a.cylinder([-1.19, .83, .8], .32, 1.23, 'steel', [0, 0, Math.PI / 2])
  a.cylinder([-.47, 2.16, -1.2], .071, 2.1, 'dark')
  a.cylinder([-.47, 1.77, -1.2], .12, .64, 'steel')
  // Coiled air lines above the fifth wheel, solid hose silhouette rather than floating trailer.
  for (let i = 0; i < 7; i++) a.put(new TorusGeometry(.085, .017, 4, 10), i % 2 ? 'rust' : 'dark', [-.35 - i * .11, 1.62 + Math.sin(i / 6 * Math.PI) * .28, .1], [0, Math.PI / 2, 0])
  return a.finish()
}
export function makeTrailer(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  for (const z of [-.89, .89]) a.box([-4.45, 1.02, z], [8.35, .32, .21], 'blue', .025)
  for (const x of [-8.48, -2.15]) a.box([x, 1.19, 0], [.27, .25, 2.62], 'steel', .025)
  for (let x = -8.2; x < -1; x += .92) a.box([x, 1.03, 0], [.1, .19, 1.8], 'dark')
  for (const x of [-5.3 - load.halfCornerX, -5.3 + load.halfCornerX]) for (const z of [-load.halfCornerZ, load.halfCornerZ]) a.box([x, 1.365, z], [.25, .13, .22], 'yellow', .035)
  for (const z of [-1.28, 1.28]) {
    a.box([-6.85, 1.35, z], [2.82, .1, .56], 'blue', .025)
    a.box([-7.98, .77, z], [.07, .64, .46], 'rubber')
    for (let x = -8.15; x < -2; x += 1.25) a.box([x, 1.09, z * .78], [.33, .075, .02], 'white')
  }
  a.box([-8.72, .63, 0], [.19, .18, 2.64], 'steel', .035)
  for (const z of [-.9, .9]) a.box([-8.61, 1.13, z], [.055, .19, .36], 'rust', .035)
  for (const z of [-.7, .7]) { a.box([-3.24, .76, z], [.14, .67, .14], 'steel'); a.box([-3.24, .42, z], [.36, .09, .28], 'dark', .02) }
  return a.finish()
}
export function makeWheel(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high), segments = high ? 24 : 16
  a.cylinder([0, 0, 0], .59, .4, 'rubber', [Math.PI / 2, 0, 0], .59, segments)
  for (const side of [-1, 1]) {
    a.put(new TorusGeometry(.485, .052, 6, segments), 'rubber', [0, 0, side * .215])
    a.cylinder([0, 0, side * .215], .345, .05, 'steel', [Math.PI / 2, 0, 0], .345, segments)
    a.cylinder([0, 0, side * .257], .145, .075, 'blue', [Math.PI / 2, 0, 0])
    for (let j = 0; j < 6; j++) a.cylinder([Math.cos(j * Math.PI / 3) * .235, Math.sin(j * Math.PI / 3) * .235, side * .25], .028, .025, 'dark', [Math.PI / 2, 0, 0], .028, 6)
  }
  return a.finish()
}
export function makePerson(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.box([0, 1.12, 0], [.44, .58, .28], 'yellow', .09)
  for (const y of [1.02, 1.18]) a.box([0, y, .15], [.41, .045, .025], 'white')
  a.cylinder([0, 1.445, 0], .066, .12, 'sand')
  a.put(new SphereGeometry(.17, 12, 8), 'sand', [0, 1.6, 0])
  a.put(new SphereGeometry(.184, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 'cream', [0, 1.64, 0])
  a.cylinder([0, 1.645, 0], .205, .037, 'cream')
  for (const s of [-1, 1]) {
    a.beam([s * .25, 1.34, 0], [s * .225, 1.14, .23], .12, 'yellow')
    a.beam([s * .225, 1.14, .23], [s * .194, 1.055, .337], .09, 'sand')
    a.put(new SphereGeometry(1, 8, 6), 'sand', [s * .194, 1.064, .345], [0, 0, 0], [.064, .041, .063])
    a.box([s * .211, 1.086, .343], [.037, .061, .09], 'sand', .017)
    a.box([s * .184, 1.112, .329], [.03, .028, .065], 'sand', .012)
  }
  a.box([0, 1.09, .37], [.4, .046, .31], 'dark', .02, [.16, 0, 0])
  a.box([0, 1.117, .37], [.32, .012, .23], 'glass', .01, [.16, 0, 0])
  return a.finish()
}

/** Independent shoes keep each planted sole on its own support surface. */
export function makeSupervisorShoe(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.box([0, .085, 0], [.2, .17, .33], 'dark', .045)
  return a.finish()
}

function addSensors(a: ReturnType<typeof assembly>, m: Materials, high: boolean) {
  for (const [x, z, height] of [[-26, 12.7, 7.2], [-2.5, 4.4, 6.6]]) {
    a.cylinder([x, height / 2, z], .105, height, 'steel', [0, 0, 0], .065)
    a.box([x, .18, z], [.6, .3, .6], 'concrete', .06)
    a.box([x, 1.2, z + .15], [.42, .7, .28], 'blue', .06)
    a.box([x, 1.2, z + .302], [.24, .4, .025], 'dark', .025)
  }
  for (const sensor of sensors) {
    const head = assembly(m, high), { yaw, pitch } = sensorFrame(sensor)
    if (sensor.kind === 'radar') {
      head.box([0, 0, -.17], [.93, 1.02, .31], 'blue', .09)
      head.box([0, 0, -.015], [.82, .9, .03], 'cream', .065)
      for (const y of [-.27, -.09, .09, .27]) head.box([0, y, .004], [.58, .014, .012], 'sand')
      for (const x of [-.37, .37]) head.cylinder([x, -.39, .01], .025, .035, 'steel', [Math.PI / 2, 0, 0])
    } else {
      const thermal = sensor.kind === 'thermal'
      head.box([0, 0, -.35], thermal ? [.66, .61, .64] : [.73, .44, .7], thermal ? 'blue' : 'cream', .085)
      head.box([0, 0, -.024], thermal ? [.57, .53, .045] : [.63, .35, .045], 'dark', .035)
      if (thermal) {
        head.put(new TorusGeometry(.19, .042, 6, 16), 'orange', [0, 0, -.011])
        head.cylinder([0, 0, -.011], .148, .022, 'glass', [Math.PI / 2, 0, 0], .148, 20)
        for (const x of [-.26, .26]) for (let z = -.56; z < -.1; z += .11) head.box([x, .27, z], [.06, .04, .038], 'steel')
      } else {
        head.put(new TorusGeometry(.145, .027, 6, 16), 'steel', [0, 0, -.023])
        head.cylinder([0, 0, -.01], .113, .02, 'glass', [Math.PI / 2, 0, 0], .113, 20)
        head.box([0, .254, -.28], [.83, .07, .89], 'cream', .025)
      }
    }
    head.box([0, -.39, -.29], [.22, .26, .27], 'steel', .035)
    const transform = new Object3D(); transform.position.set(...sensor.origin); transform.rotation.set(pitch, yaw, 0, 'YXZ'); transform.updateMatrix()
    for (const part of head.finish()) {
      part.geometry.applyMatrix4(transform.matrix)
      const finish = (Object.keys(m) as Finish[]).find(k => m[k] === part.material)!
      a.put(part.geometry, finish)
    }
    const bracket = new Vector3(0, -.42, -.3).applyMatrix4(transform.matrix).toArray() as Vec3
    const mast: Vec3 = sensor.id === 'aisle-camera' ? [-26, bracket[1], 12.7] : [-2.5, bracket[1], 4.4]
    a.beam(mast, bracket, .105, 'steel'); a.cylinder(bracket, .12, .12, 'dark')
  }
}
function addDock(a: ReturnType<typeof assembly>) {
  for (const x of [dock.x - 1, dock.x + 1]) for (const z of [-7.6, -6.2]) {
    a.box([x, dock.roofTop + .075, z], [.25, .15, .21], 'dark', .02)
    a.box([x, 3.95, z], [.16, .18, .16], 'steel', .025)
  }
  a.box([dock.x, 4.055, dock.z], [2.9, .24, 2.6], 'cream', .075)
  a.box([dock.x, dock.surfaceY - .003, dock.z], [2.55, .006, 2.23], 'dark', .05)
  for (const x of [-.68, .68]) for (const z of [-.64, .64]) a.box([dock.x + x, dock.surfaceY + .009, dock.z + z], [.22, .006, .12], 'sand', .025)
  for (const x of [-1.39, 1.39]) a.box([dock.x + x, 4.65, dock.z], [.12, .94, 2.6], 'blue', .055)
  for (const z of [-1.24, 1.24]) {
    a.box([dock.x, 4.39, dock.z + z], [2.75, .42, .12], 'blue', .035)
    a.box([dock.x, 5.08, dock.z + z], [5.8, .12, .12], 'steel', .025)
    for (const x of [-1.32, 1.32]) a.box([dock.x + x, 4.74, dock.z + z], [.09, .65, .1], 'steel')
  }
  a.box([dock.x + 1.47, 4.46, dock.z + .52], [.06, .31, .56], 'dark', .025)
  for (let z = -.55; z < .6; z += .17) a.box([dock.x + 1.455, 4.67, dock.z + z], [.016, .22, .07], 'dark')
}
export function makeDockCover(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  for (const x of [-.67, .67]) a.box([x, 0, 0], [.11, .1, 2.6], 'cream', .025)
  for (const z of [-1.245, 1.245]) a.box([0, 0, z], [1.45, .1, .11], 'cream', .025)
  a.box([0, .002, 0], [1.24, .018, 2.39], 'clear')
  a.box([0, .025, 0], [.045, .045, 2.45], 'cream', .014)
  return a.finish()
}
export function makeDrone(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.box([0, .45, 0], [.55, .25, .74], 'cream', .12)
  a.box([0, .615, -.08], [.36, .09, .42], 'dark', .04)
  a.box([0, .672, -.08], [.22, .026, .22], 'cream', .015)
  for (const p of rotorCenters) {
    a.beam([Math.sign(p[0]) * .19, .45, Math.sign(p[2]) * .22], [p[0], .67, p[2]], .07, 'dark', .105)
    a.cylinder([p[0], .685, p[2]], .079, .19, 'steel')
    a.cylinder([p[0], .787, p[2]], .038, .025, 'dark')
  }
  for (const x of [-.42, .42]) {
    a.box([x, .045, 0], [.08, .09, 1.04], 'dark', .035)
    for (const z of [-.4, .4]) a.beam([Math.sign(x) * .2, .36, z * .62], [x, .06, z], .045, 'steel')
  }
  a.cylinder([0, .32, .4], .092, .16, 'steel')
  a.box([0, .7, .12], [.026, .12, .026], 'dark')
  return a.finish()
}
export function makeDroneRotor(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.box([0, 0, 0], [.65, .013, .057], 'dark', .021)
  a.cylinder([0, 0, 0], .045, .028, 'steel')
  return a.finish()
}
export function makeDroneGimbal(m: Materials, high: boolean): Part[] {
  const a = assembly(m, high)
  a.put(new SphereGeometry(.126, 12, 8), 'cream', [0, 0, 0])
  a.cylinder([0, 0, .107], .078, .05, 'dark', [Math.PI / 2, 0, 0])
  a.cylinder([0, 0, .136], .055, .009, 'glass', [Math.PI / 2, 0, 0])
  return a.finish()
}

/** New incident geography: a source cradle, skipped assigned slot, physical controls and checkpoint. */
function addIncidentSite(a:ReturnType<typeof assembly>){
 for(const z of[load.sourceZ,load.bayZ]){for(const x of[load.x-3.7,load.x+3.7])a.box([x,.05025,z],[.13,.001,3.5],'yellow');for(const dz of[-1.75,1.75])a.box([load.x,.05025,z+dz],[7.4,.001,.13],'yellow')}
 for(const x of[-load.halfCornerX,load.halfCornerX])for(const z of[-load.halfCornerZ,load.halfCornerZ])a.box([load.x+x,.115,load.sourceZ+z],[.3,.13,.27],'steel',.025)
 // An unmistakably empty authorized staging bay, with four low supports.
 for(const x of[-load.halfCornerX,load.halfCornerX])for(const z of[-load.halfCornerZ,load.halfCornerZ])a.box([load.x+x,.115,load.bayZ+z],[.3,.13,.27],'concrete',.025)
 a.box([controls.crane[0],.59,controls.crane[2]],[.78,1.08,.6],'blue',.08)
 a.box([controls.crane[0],1.15,controls.crane[2]],[.9,.13,.74],'cream',.035)
 for(const x of[-.2,.2]){a.cylinder([controls.crane[0]+x,1.22,controls.crane[2]+.2],.048,.10,'dark');a.put(new SphereGeometry(.065,8,6),'dark',[controls.crane[0]+x,1.28,controls.crane[2]+.2])}
 a.box([controls.crane[0],1.32,controls.crane[2]-.15],[.45,.22,.04],'glass',.025)
 // Stop/hold button is physically reachable from the accepted final supervisor stance.
 a.beam([17.8,1.05,-3.3],[17.55,1.05,-2.6],.085,'steel');a.box([17.55,1.16,-2.6],[.24,.1,.24],'yellow',.02)
 a.cylinder([17.55,1.23,-2.6],.075,.06,'rust')
 // Staffed checkpoint stays off both the cargo path and outbound wheel tracks.
 a.box([-6,.044,-6.1],[3.8,.012,2.3],'concrete',.004)
 for(const x of[-7.9,-4.1])a.cylinder([x,.75,-7.65],.055,1.4,'steel')
 a.beam([-7.9,1.4,-7.65],[-4.1,1.4,-7.65],.065,'steel')
}
export function makeActorBody(m:Materials,high:boolean):Part[]{
 const a=assembly(m,high);a.box([0,1.12,0],[.44,.58,.28],'white',.09)
 for(const y of[1.02,1.18])a.box([0,y,.15],[.41,.04,.024],'steel')
 a.cylinder([0,1.445,0],.066,.12,'sand');a.put(new SphereGeometry(.17,12,8),'sand',[0,1.6,0]);
 a.put(new SphereGeometry(.184,12,8,0,Math.PI*2,0,Math.PI/2),'cream',[0,1.64,0]);a.cylinder([0,1.645,0],.205,.037,'cream');return a.finish()
}
