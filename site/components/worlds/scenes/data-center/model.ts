import {
  BoxGeometry, BufferGeometry, Color, CylinderGeometry, DataTexture, DoubleSide,
  ExtrudeGeometry, Float32BufferAttribute, LinearFilter, LinearMipmapLinearFilter,
  Matrix4, MeshStandardMaterial, Object3D, Quaternion, RepeatWrapping, RGBAFormat, Shape,
  SphereGeometry, TorusGeometry, Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Vec3 } from '../../contract'
import { seeded } from '../../math'
import { vehicleSpec, wheelLayout } from './vehicles'
import { devices, devicePoint, type DeviceKind } from './devices'

export type Finish = keyof typeof colors
const colors = {
  chalk: '#c8d1d3', white: '#e2e5df', joint: '#6e7c83', concrete: '#939f9f', edge: '#afbbb7',
  blue: '#315f9d', paleBlue: '#6589ad', glass: '#274652', glassLight: '#557885',
  asphalt: '#39494f', wet: '#52646e', steel: '#9dabaf', dark: '#25353d', rubber: '#1c272d',
  van: '#91a29f', ground: '#778576', grass: '#647561', amber: '#d3a05b', lamp: '#f3dfb4', skin: '#bc9b80', cabin:'#89a3aa',
}
export type Materials = Record<Finish, MeshStandardMaterial>
export type Part = { geometry: BufferGeometry; material: MeshStandardMaterial }
function grain(color: string, amount: number, repeat: number) {
  const c = new Color(color), data = new Uint8Array(128 * 128 * 4)
  for (let i = 0; i < 128 * 128; i++) {
    const v = 1 + (seeded(i * .719) - .5) * amount
    data.set([c.r * v * 255, c.g * v * 255, c.b * v * 255, 255], i * 4)
  }
  const t = new DataTexture(data, 128, 128, RGBAFormat)
  t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(repeat, repeat)
  t.magFilter = LinearFilter; t.minFilter = LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true
  return t
}
export function createMaterials(): Materials {
  const m = Object.fromEntries(Object.entries(colors).map(([k, color]) => [k, new MeshStandardMaterial({ color, roughness: .68 })])) as Materials
  for (const f of ['asphalt', 'concrete', 'ground'] as const) { m[f].map = grain(colors[f], f === 'asphalt' ? .25 : .12, f === 'asphalt' ? 12 : 6); m[f].color.set('white') }
  m.asphalt.roughness = .43; m.wet.roughness = .19; m.wet.metalness = .23
  m.steel.metalness = .65; m.steel.roughness = .3
  m.blue.roughness = .37; m.blue.metalness = .22; m.van.roughness = .31; m.van.metalness = .18
  m.glass.roughness = .16; m.glass.metalness = .36; m.glassLight.roughness = .2; m.glassLight.metalness = .25
  m.lamp.emissive.set(colors.lamp); m.lamp.emissiveIntensity = .55
  m.cabin.transparent=true;m.cabin.opacity=.12;m.cabin.depthWrite=false;m.cabin.roughness=.2
  m.grass.side = DoubleSide
  return m
}
export function builder(m: Materials, high: boolean) {
  const bins = new Map<Finish, BufferGeometry[]>()
  function put(source: BufferGeometry, f: Finish, p: Vec3 = [0,0,0], r: Vec3 = [0,0,0], s: Vec3 = [1,1,1]) {
    const o = new Object3D(); o.position.set(...p); o.rotation.set(...r); o.scale.set(...s); o.updateMatrix()
    source.applyMatrix4(o.matrix)
    const g = source.index ? source.toNonIndexed() : source
    if (g !== source) source.dispose()
    if (!g.attributes.uv) g.setAttribute('uv', new Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
    if (!bins.has(f)) bins.set(f, [])
    bins.get(f)!.push(g)
  }
  function box(p: Vec3, s: Vec3, f: Finish, bevel = 0, r: Vec3 = [0,0,0]) { put(bevel ? new RoundedBoxGeometry(...s, 1, Math.min(bevel, Math.min(...s) * .4)) : new BoxGeometry(...s), f, p, r) }
  function cyl(p: Vec3, radius: number, height: number, f: Finish, r: Vec3 = [0,0,0], top = radius) { put(new CylinderGeometry(top, radius, height, high ? 20 : 12), f, p, r) }
  function beam(a: Vec3, b: Vec3, radius: number, f: Finish) {
    const av = new Vector3(...a), bv = new Vector3(...b), d = bv.clone().sub(av)
    const g = new CylinderGeometry(radius, radius, d.length(), 8)
    g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0), d.normalize())); put(g, f, av.add(bv).multiplyScalar(.5).toArray() as Vec3)
  }
  function slab(p: Vec3, w: number, d: number, h: number, radius: number, f: Finish) {
    const s = new Shape(), x = -w / 2, z = -d / 2
    s.moveTo(x + radius, z); s.lineTo(x + w - radius,z); s.quadraticCurveTo(x+w,z,x+w,z+radius)
    s.lineTo(x+w,z+d-radius); s.quadraticCurveTo(x+w,z+d,x+w-radius,z+d)
    s.lineTo(x+radius,z+d); s.quadraticCurveTo(x,z+d,x,z+d-radius)
    s.lineTo(x,z+radius); s.quadraticCurveTo(x,z,x+radius,z)
    const g = new ExtrudeGeometry(s, { depth:h, bevelEnabled:false, steps:1, curveSegments:6 }); g.rotateX(-Math.PI/2); put(g,f,p)
  }
  function finish(): Part[] { return [...bins].map(([f, list]) => { const geometry = mergeGeometries(list,false)!; list.forEach(g=>g.dispose()); return { geometry, material:m[f] } }) }
  return { put, box, cyl, beam, slab, finish }
}

export function makeCampus(m: Materials, high: boolean) {
  const a = builder(m, high)
  // Rounded pavement cut: narrow stone reveal, drainage verge and uninterrupted service spine.
  a.slab([-4.7,-1.2,0],53,72,.7,3,'joint'); a.slab([-4.7,-.5,0],52.7,71.7,.46,2.85,'concrete')
  a.slab([-4.7,-.04,0],52.4,71.4,.1,2.8,'ground')
  a.slab([6.2,.065,-.4],12.8,69,.065,1.5,'asphalt')
  a.slab([14,.075,-3],2.4,61,.22,.9,'concrete')
  a.slab([-1.3,.075,-4],2.1,61,.22,.6,'edge')
  // Road edging and paint, with broad markings that survive thumbnail views.
  for (const x of [.4,11.9]) a.box([x,.1307,0],[.12,.001,67],'white')
  for(let z=-31;z<32;z+=5) a.box([8.4,.1307,z],[.12,.001,2.3],'white')
  a.box([4.7,.1307,7.2],[6.1,.001,.35],'white')
  for(let i=0;i<5;i++) a.box([3.1+i*1.05,.1307,-.5],[.55,.001,2.2],'white')
  for(const z of [24,0,-21]) {
    a.box([4.8,.1307,z],[.15,.001,2],'white')
    for(const s of [-1,1]) a.box([4.8+s*.32,.1307,z-.7],[.15,.001,1],'white',0,[0,s*.7,0])
  }
  for(const z of [-27,-14,2,18,29]) {
    a.box([.02,.16,z],[.33,.025,1.6],'dark')
    for(let i=0;i<6;i++) a.box([.02,.176,z-.66+i*.25],[.3,.018,.065],'steel')
  }
  // Shallow irregular rain pools gather along the curb, leaving the wheel paths clear.
  for(let i=0;i<15;i++) {
    const x = i%2 ? 11.3 : 1.05, z = -29+i*4.1, s = new Shape()
    for(let j=0;j<12;j++) { const theta=j/12*Math.PI*2, r=.65+seeded(i*14+j)*.35; const px=Math.cos(theta)*r*.43,pz=Math.sin(theta)*r*(1.1+seeded(i)*1.6); if(j===0)s.moveTo(px,pz);else s.lineTo(px,pz) }
    s.closePath(); const g=new ExtrudeGeometry(s,{depth:.0008,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);a.put(g,'wet',[x,.1304,z])
  }
  // Data hall: insulated panel field, dark base, recessed joints, parapets, and a projecting service wing.
  a.box([-11.1,.45,-10],[20.6,.65,43.3],'joint',.12)
  a.box([-11.1,4.75,-10],[20,8,42],'chalk',.18)
  a.box([-11.1,1.66,-10],[20.15,2.2,42.1],'dark',.05)
  for(let z=-30;z<=10;z+=2) {
    a.box([-.99,5.55,z],[.14,5.6,1.9],'white',.025)
    a.box([-21.22,5.55,z],[.2,5.6,1.85],'chalk',.018)
  }
  for(let x=-20;x<=-2;x+=2) {
    a.box([x,5.55,11.13],[1.86,5.6,.14],'white',.025)
    a.box([x,1.65,11.18],[1.72,1.28,.08],x<-12?'joint':'glass',.02)
  }
  for(const y of [3.1,8.55]) a.box([-11.1,y,11.25],[20.45,.15,.22],'steel',.025)
  for(const y of [3.1,8.55]) a.box([-.86,y,-10],[.22,.15,42.6],'steel',.025)
  // Deep vertical sun-screen fins catch the sky; broad panel joints remain legible at low detail.
  for(let z=-29;z<=9;z+=4) a.box([-.76,5.6,z],[.5,5.4,.09],'chalk',.022)
  for(let x=-14;x<=-2;x+=2) a.box([x,5.6,11.33],[.09,5.4,.48],'chalk',.02)
  // Staff entrance and an intentionally planted rain court in the foreground.
  a.slab([-11.6,.08,17.3],15.8,10.5,.14,1.25,'concrete')
  for(let x=-18;x<-4;x+=1.4) for(let z=13;z<22;z+=1.5) a.box([x,.227,z],[1.32,.026,1.42],(Math.round((x+18)/1.4)+Math.round(z/1.5))%3?'edge':'concrete')
  a.box([-8.9,3.05,12.05],[8.2,.19,2.4],'blue',.055)
  for(const x of [-12.75,-5.05]) a.box([x,1.7,12.8],[.12,2.9,.12],'steel')
  for(const x of [-11,-9.1,-7.2]) {a.box([x,1.6,11.21],[1.65,2.2,.09],'glassLight',.015);a.box([x-.6,1.55,11.28],[.034,.37,.06],'steel')}
  for(const z of [18.5,25.2]) {
    a.slab([-14,.08,z],13.3,2.75,.37,.85,'joint');a.slab([-14,.45,z],12.9,2.35,.04,.65,'ground')
    for(let i=0;i<34;i++) {
      const x=-19.9+seeded(i*3+z)*11.7,zz=z-.83+seeded(i*3+z+1)*1.66
      for(let j=0;j<3;j++) a.beam([x,.48,zz],[x+Math.sin(j*2.1)*.2,.75+seeded(i+j)*.45,zz+Math.cos(j*2.1)*.2],.024,'grass')
    }
    a.box([-7,.45,z],[1.8,.16,1.65],'edge',.07)
  }
  // Two multi-stem ornamental trees: branched trunks and many modest leaf clusters, not cones.
  for(const [x,z]of[[-20.2,15.5],[-21,26]]) {
    for(let j=0;j<4;j++) {
      const dx=Math.cos(j*2.4)*.8,dz=Math.sin(j*2.4)*.8
      a.beam([x,.2,z],[x+dx,2.7+j*.24,z+dz],.065,'joint')
      for(let k=0;k<4;k++)a.put(new SphereGeometry(1,8,6),'grass',[x+dx+Math.cos(k*2.4)*.55,2.8+j*.22+seeded(k+j)*.65,z+dz+Math.sin(k*2.4)*.55],[0,k,0],[.62,.43,.66])
    }
  }
  // Asymmetric cobalt stair/service core gives the campus an identifiable silhouette.
  a.box([-19.1,5.1,7.7],[4.8,9.25,8.1],'blue',.14)
  a.box([-19.1,9.81,7.7],[5.1,.18,8.4],'steel',.045)
  a.box([-16.64,5.1,7.7],[.06,7.7,2.15],'glass')
  for(let y=1.8;y<9;y+=1.6) a.box([-16.56,y,7.7],[.09,.07,2.2],'steel')
  a.box([-19,1.65,11.8],[1.4,2.25,.12],'dark',.04)
  a.box([-18.95,2.2,11.89],[1.1,.7,.045],'glassLight')
  a.box([-18.43,1.65,11.95],[.07,.25,.05],'steel',.01)
  // Low service canopy and dock doors; ribs read as engineered assemblies rather than boxes.
  a.box([-.05,4.08,-12],[3.2,.28,32.5],'blue',.06)
  a.box([-.05,4.25,-12],[3.25,.08,32.6],'steel',.025)
  for(const z of [-25,-16,-7,2]) {
    a.box([-.92,1.8,z],[.15,2.9,3.7],'joint',.03)
    for(let j=0;j<11;j++) a.box([-.82,.48+j*.25,z],[.1,.19,3.4],'steel')
    for(const s of [-1,1]) { a.box([-.65,1,z+s*1.6],[.34,1.7,.2],'rubber',.03); a.cyl([1.22,.8,z+s*2],.11,1.36,'blue') }
    a.box([-.78,3.45,z],[.07,.3,1.1],'white')
    a.box([1.18,2.1,z+2.4],[.16,3.8,.16],'joint',.015)
  }
  a.box([-11.1,8.81,-10],[19.85,.15,41.8],'joint',.04)
  for(const x of [-21.05,-1.15]) a.box([x,9.05,-10],[.2,.43,42.25],'white',.025)
  for(const z of [-31.1,11.1]) a.box([-11.1,9.05,z],[20,.43,.2],'white',.025)
  // Main roof distribution spine, flanged risers, raised walkways.
  a.box([-11.1,9.14,-10],[1.8,.22,38],'concrete',.04)
  for(const x of [-12.5,-9.7]) { a.cyl([x,9.53,-10],.16,38,'steel',[Math.PI/2,0,0]); for(let z=-27;z<10;z+=5) a.cyl([x,9.53,z],.23,.12,'joint',[Math.PI/2,0,0]) }
  for(const z of [-23,-14,-5,4]) for(const x of [-16,-6]) {
    a.box([x,9.03,z],[5.7,.3,6.2],'dark',.08)
    a.box([x,9.24,z],[4.7,.3,5.3],'steel',.05)
  }
  // Gate pavilion: glazing wraps two sides, deep roof fascia and a sheltered pedestrian apron.
  a.slab([12.85,.14,4.7],7.6,7.7,.25,.8,'edge')
  a.slab([18,.075,6],3,34,.22,.5,'concrete')
  for(let z=-4;z<=20;z+=2){a.cyl([16.4,.85,z],.12,1.44,'blue');a.cyl([16.4,1.3,z],.125,.15,'white')}
  for(const x of[17.1,18.9])a.cyl([x,.85,5],.13,1.44,'blue')
  a.box([13.25,1.75,4],[5.35,2.9,5.35],'blue',.14)
  a.box([10.52,2,4.55],[.065,1.9,4.15],'glassLight',.01)
  a.box([13,2,6.73],[4.8,1.9,.06],'glass',.01)
  for(const z of [2.5,3.8,5.25,6.64]) a.box([10.46,2,z],[.1,2,.08],'steel')
  for(const x of [10.55,12,13.5,15.4]) a.box([x,2,6.78],[.08,2,.11],'steel')
  a.box([13.1,3.3,4.4],[6.3,.32,6.35],'blue',.075)
  a.box([13.1,3.5,4.4],[6.4,.1,6.4],'white',.02)
  a.box([13.1,.76,6.79],[4.8,.48,.16],'blue')
  a.box([15.35,1.5,6.83],[.86,2.28,.12],'dark',.025)
  a.box([15.35,1.92,6.92],[.66,1.07,.035],'glassLight')
  a.box([14.98,1.55,6.98],[.045,.25,.045],'steel')
  a.box([13.2,3.13,7.05],[4.4,.04,.06],'lamp')
  // Gate island / card reader; the arm is a separately authored moving assembly.
  a.slab([1.05,.13,4.6],1.8,4,.26,.65,'edge')
  a.box([1.1,.92,5],[.76,1.27,.9],'blue',.1)
  a.box([1.1,1.58,5],[.84,.13,.94],'steel',.04)
  a.box([1.2,.41,6.02],[.38,.04,.42],'steel',.015)
  a.box([1.2,1.08,5.98],[.13,1.32,.13],'steel',.025)
  a.box([1.2,1.95,6.05],[.36,.7,.22],'dark',.035)
  a.box([1.2,2.08,6.18],[.22,.2,.026],'glassLight',.01)
  a.box([1.2,1.8,6.18],[.17,.05,.026],'white')
  for(const [x,z] of [[1.1,6.5],[9.4,6.9],[9.4,3.1],[11.1,8.7],[13.4,8.1],[15.7,8.1]]) {
    a.cyl([x,.78,z],.12,1.22,'blue'); a.cyl([x,1.1,z],.124,.14,'white'); a.cyl([x,.21,z],.21,.1,'steel')
  }
  // Open-picket boundary: explicit joints, without dense moire-producing wire mesh.
  for(const range of [[-28,-2],[16.5,17.4]]) for(let x=range[0];x<=range[1];x+=2.8) {
    a.box([x,1.3,4.6],[.1,2.4,.1],'joint',.015)
    if(x+2.8<=range[1]) {
      for(const y of [.55,2.1]) a.box([x+1.4,y,4.6],[2.8,.06,.07],'joint')
      for(let j=1;j<8;j++)a.box([x+j*.35,1.3,4.6],[.035,2.1,.035],'steel')
    }
  }
  // Fixed devices: local +Z is their declared optical/panel front. No PTZ or radar rotation.
  function devicePart(kind:DeviceKind,g:BufferGeometry,f:Finish,p:Vec3=[0,0,0],r:Vec3=[0,0,0]) {
    const d=devices[kind],local=new Object3D();local.position.set(...p);local.position.z-=kind==='camera'?.036:.0275;local.rotation.set(...r);local.updateMatrix()
    const frame=new Matrix4().makeBasis(new Vector3(...d.right),new Vector3(...d.up),new Vector3(...d.axis));frame.setPosition(...d.origin)
    g.applyMatrix4(local.matrix).applyMatrix4(frame);a.put(g,f)
  }
  const deviceBox=(kind:DeviceKind,p:Vec3,size:Vec3,f:Finish,bevel=.02)=>devicePart(kind,new RoundedBoxGeometry(...size,1,bevel),f,p)
  a.cyl([9.1,2.59,7.2],.075,4.92,'steel',[0,0,0],.05)
  a.cyl([9.1,.16,7.2],.17,.06,'steel')
  a.beam([9.1,5.05,7.2],devicePoint('camera',[0,-.14,-.32]),.045,'steel')
  deviceBox('camera',[0,0,-.34],[.39,.28,.68],'white',.06)
  deviceBox('camera',[0,.18,-.29],[.45,.065,.82],'white',.025)
  deviceBox('camera',[0,0,-.005],[.32,.22,.03],'dark',.025)
  devicePart('camera',new CylinderGeometry(.083,.083,.03,high?24:16),'steel',[0,0,.016],[Math.PI/2,0,0])
  devicePart('camera',new CylinderGeometry(.067,.067,.015,high?24:16),'glass',[0,0,.036],[Math.PI/2,0,0])
  a.beam(devicePoint('camera',[.13,-.13,-.55]),[9.1,4.85,7.2],.016,'dark')
  a.cyl([.1,1.64,15.8],.065,3.02,'steel')
  a.cyl([.1,.16,15.8],.16,.06,'steel')
  a.beam([.1,3.05,15.8],devicePoint('radar',[0,-.1,-.16]),.055,'steel')
  deviceBox('radar',[0,0,-.12],[.76,.7,.24],'white',.05)
  deviceBox('radar',[0,0,.01],[.65,.58,.035],'paleBlue',.035)
  for(const x of[-.29,.29])for(const y of[-.26,.26])devicePart('radar',new CylinderGeometry(.022,.022,.022,8),'steel',[x,y,.04],[Math.PI/2,0,0])
  for(let x=-.25;x<=.26;x+=.1)deviceBox('radar',[x,0,-.267],[.035,.53,.075],'joint',.006)
  a.box([.1,2.25,15.8],[.34,.62,.4],'joint',.035)
  a.box([.29,2.25,15.8],[.05,.5,.32],'white',.015)
  a.beam(devicePoint('radar',[.22,-.32,-.18]),[.1,2.54,15.8],.022,'dark')
  // Low garden / gravel roof edge cues, deliberately without ornamental tree blobs.
  a.slab([-25,.06,-6],4.7,53,.18,1.6,'edge');a.slab([-25,.24,-6],4.1,52,.035,1.3,'ground')
  for(let i=0;i<(high?85:44);i++) {
    const x=-26.7+seeded(i*3+5)*3.3,z=-30+seeded(i*3+6)*48
    a.put(new SphereGeometry(1,7,5),'concrete',[x,.3,z],[0,seeded(i)*6,0],[.08+seeded(i+1)*.2,.08,.12+seeded(i+2)*.2])
  }
  return a.finish()
}

/** One chiller assembly is instanced eight times; louvers, fan rings and pipe elbows are shared. */
export function makeChiller(m: Materials, high: boolean) {
  const a=builder(m,high)
  a.box([0,.8,0],[4.5,1.45,5.1],'chalk',.12)
  for(const x of [-2.27,2.27]) { a.box([x,.8,0],[.06,1.13,4.85],'dark'); for(let i=0;i<10;i++)a.box([x*1.015,.27+i*.107,0],[.08,.04,4.77],'steel') }
  for(const z of [-1.3,1.3]) {
    a.cyl([0,1.55,z],.99,.14,'dark'); a.put(new TorusGeometry(.94,.06,6,high?32:20),'steel',[0,1.65,z],[Math.PI/2,0,0])
    a.cyl([0,1.66,z],.2,.13,'steel')
    for(let j=0;j<6;j++) a.box([Math.sin(j*Math.PI/3)*.42,1.64,z+Math.cos(j*Math.PI/3)*.42],[.22,.055,.65],'joint',.035,[0,j*Math.PI/3+.25,0])
    for(let j=-2;j<=2;j++) a.box([j*.28,1.74,z],[.022,.022,1.5],'steel')
  }
  for(const x of [-1.8,1.8]) a.cyl([x,.3,2.77],.14,.6,'steel',[Math.PI/2,0,0])
  return a.finish()
}

export function makeVehicle(m: Materials, high: boolean, small: boolean) {
  const a=builder(m,high), paint:Finish=small?'van':'white', front=small?-2.5:-3.3, rear=small?2.5:3.3, width=small?2.1:2.42
  const v=vehicleSpec(small)
  // Open wheel wells belong to the body. Their clearance includes the steered tire envelope.
  function shell(z0:number,z1:number,bottom:number,w:number,top:[number,number][],axles:number[],finish:Finish,offset=0) {
    const profile=new Shape(),r=v.radius+.15
    profile.moveTo(z0,bottom)
    for(const z of [...axles].sort((a,b)=>a-b)) {
      const extent=Math.sqrt(r*r-(bottom-v.radius)**2),lo=Math.max(z0,z-extent),hi=Math.min(z1,z+extent)
      if(hi<=lo)continue
      profile.lineTo(lo,bottom)
      const a0=Math.acos((lo-z)/r),a1=Math.acos((hi-z)/r)
      for(let i=0;i<=32;i++){const angle=a0+(a1-a0)*i/32;profile.lineTo(z+r*Math.cos(angle),v.radius+r*Math.sin(angle))}
      profile.lineTo(hi,bottom)
    }
    profile.lineTo(z1,bottom);for(const [z,y]of top)profile.lineTo(z,y);profile.closePath()
    const g=new ExtrudeGeometry(profile,{depth:w,bevelEnabled:true,bevelSegments:2,bevelSize:.025,bevelThickness:.025,steps:1})
    g.rotateY(-Math.PI/2);g.translate(w/2+offset,0,0);a.put(g,finish)
  }
  a.box([0,.65,0],[small?.96:1.1,.32,rear-front-.1],'dark',.07)
  for(const z of [v.frontZ,v.rearZ])a.beam([-v.halfTrack,v.radius,z],[v.halfTrack,v.radius,z],.065,'dark')
  if(!small) {
    shell(-1.56,3.26,.675,2.42,[[3.26,3.425],[-1.56,3.425]],[v.rearZ],'white')
    a.box([0,3.46,.85],[2.46,.11,4.9],'steel',.03)
    for(const x of [-1.23,1.23]) {
      a.box([x,1.3,.85],[.07,.16,4.8],'blue');a.box([x,2.15,.8],[.028,.45,3.85],'paleBlue')
      for(let z=-1.4;z<3.2;z+=.8)a.box([x,2.32,z],[.034,2,.025],'edge')
    }
    for(const x of[-1.115,1.115])shell(-3.275,-1.425,.565,.12,[[-1.425,1.65],[-3.275,1.65]],[v.frontZ],'white',x)
    a.box([0,1.19,-3.235],[2.15,.88,.1],'white',.025)
    a.box([0,.71,-2.15],[2.13,.08,1.8],'dark',.02)
    a.box([0,2.16,-1.46],[2.35,1.24,.1],'white',.03)
    for(const x of[-1.13,1.13])a.box([x,2.22,-3.2],[.12,1.2,.13],'white',.03)
    a.box([0,2.93,-2.03],[2.2,.45,1.4],'white',.2)
  } else {
    // A shaped high-roof van: rear volume, lower nose, raked screen and a continuous belt line.
    shell(-2.48,2.42,.76,1.96,[[2.42,2.4],[2.27,2.61],[-1.43,2.55],[-2.08,1.52],[-2.48,1.42]],[v.frontZ,v.rearZ],paint)
    a.box([0,2.62,.52],[1.95,.09,3.45],paint,.04)
    shell(-2.51,-1.63,.66,2.06,[[-1.63,1.5],[-2.51,1.5]],[v.frontZ],paint)
    a.box([0,2.04,-1.835],[1.8,1.02,.045],'glass',.035,[.563,0,0])
    a.box([0,1.71,-2.073],[1.76,.025,.025],'dark',.008,[.563,0,0])
    for(const x of [-1.064,1.064]) {
      a.box([x,2,-1.2],[.045,.8,.98],'glass',.04)
      a.box([x,1.13,.4],[.03,.08,3.65],'dark')
      for(const z of [-.62,1.25])a.box([x,1.65,z],[.035,.053,.24],'steel',.015)
      a.box([x,1.72,.34],[.021,1.37,.021],'joint')
    }
  }
  if(!small) {
    a.box([0,2.16,front-.013],[2.02,.87,.025],'cabin',.06,[.11,0,0])
    a.box([0,2.14,front-.06],[.05,.83,.05],'joint')
    for(const x of [-1.187,1.187]) { a.box([x,2.15,-2.42],[.025,.87,1.15],'cabin',.07); a.box([x,1.48,-1.99],[.037,.06,.28],'steel',.015);a.box([x,.67,-1.35],[.26,.17,.4],'steel',.03) }
  }
  // Bodywork detail common to both scales: grille, lamps, mirrors, recessed rear doors.
  a.box([0,.91,front-.035],[width+.06,.25,.18],'dark',.04)
  a.box([0,1.28,front-.07],[width*.48,.36,.06],'dark',.025)
  for(let i=0;i<3;i++)a.box([0,1.17+i*.095,front-.11],[width*.43,.021,.018],'steel')
  for(const s of [-1,1]) {
    a.box([s*width*.37,1.38,front-.08],[width*.16,.24,.07],'lamp',.045)
    a.box([s*width*.38,.91,rear+.018],[.22,.21,.055],'amber',.025)
    a.beam([s*width*.47,2.07,front+.6],[s*(width*.5+.2),2.07,front+.42],.029,'dark')
    a.box([s*(width*.5+.22),2.02,front+.4],[.18,.35,.23],'dark',.06)
    a.box([s*.5,1.72,rear+.02],[width*.43,small?1.2:2.2,.025],paint,.01)
    a.cyl([s*.47,1.72,rear+.05],.022,small?.92:1.92,'steel')
  }
  a.box([0,.83,rear+.13],[width*.9,.18,.16],'steel',.03)
  // Fixed fender trim and axle housings; only the separate running gear steers and rolls.
  for(const wheel of wheelLayout(small))a.put(new TorusGeometry(v.radius+.08,.055,6,high?24:16,Math.PI),'joint',[wheel.x+wheel.side*.175,v.radius,wheel.z],[0,Math.PI/2,0])
  return a.finish()
}

/** Hub-centred, local +X axle; shared by front/rear on one side. */
export function makeWheel(m: Materials, high: boolean, small: boolean, side:number) {
  const a=builder(m,high),r=vehicleSpec(small).radius
  a.put(new CylinderGeometry(r,r,.34,high?48:32),'rubber',[0,0,0],[0,0,Math.PI/2])
  a.cyl([side*.19,0,0],r*.61,.04,'steel',[0,0,Math.PI/2])
  a.cyl([side*.219,0,0],r*.27,.057,'joint',[0,0,Math.PI/2])
  a.put(new TorusGeometry(r*.79,.042,6,high?24:16),'rubber',[side*.18,0,0],[0,Math.PI/2,0])
  for(let j=0;j<5;j++)a.cyl([side*.226,Math.sin(j*Math.PI*2/5)*r*.41,Math.cos(j*Math.PI*2/5)*r*.41],.026,.017,'dark',[0,0,Math.PI/2])
  return a.finish()
}

export function makeBarrier(m: Materials, high: boolean) {
  const a=builder(m,high)
  a.box([3.62,0,0],[7.25,.15,.19],'white',.045)
  for(let x=.65;x<7;x+=.9)a.box([x,.003,.101],[.38,.15,.014],'blue',0,[0,0,-.28])
  a.cyl([0,0,0],.23,.25,'steel',[Math.PI/2,0,0]); return a.finish()
}
export function makeGuard(m: Materials, high: boolean, part:'body'|'shoe'|'arm') {
  const a=builder(m,high)
  if(part==='shoe') {
    a.box([0,.066,.035],[.18,.132,.31],'rubber',.045)
    a.box([0,.01,.035],[.185,.02,.315],'rubber',.005)
  } else if(part==='arm') {
    a.beam([0,0,0],[-.035,-.2,.035],.065,'blue')
    a.beam([-.035,-.2,.035],[-.025,-.37,.09],.057,'blue')
    a.put(new SphereGeometry(.066,10,8),'skin',[-.025,-.41,.09])
  } else {
    a.box([0,1.16,0],[.45,.58,.29],'blue',.14)
    a.box([0,1.17,.16],[.33,.48,.06],'amber',.035)
    a.box([0,1.13,.2],[.35,.055,.016],'white')
    a.cyl([0,1.47,0],.07,.19,'skin');a.put(new SphereGeometry(.157,12,8),'skin',[0,1.65,0])
    a.cyl([0,1.79,0],.17,.065,'blue');a.box([0,1.78,.12],[.25,.025,.18],'blue',.025)
    a.beam([.26,1.38,0],[.32,1.09,.18],.063,'blue')
    a.put(new SphereGeometry(.069,8,6),'skin',[.32,1.05,.2]);a.box([.27,1.1,.27],[.25,.29,.04],'dark',.025,[.25,0,0])
    a.box([.27,1.1,.295],[.19,.22,.008],'joint',.01,[.25,0,0])
  }
  return a.finish()
}

export function makeTrackGeometry(second:boolean) {
  const geometries:BufferGeometry[]=[]
  for(const s of[-1,1])for(const e of[-1,1]){
    const x=s*(second?1.55:1.75),z=e*(second?3:3.8)
    geometries.push(new BoxGeometry(.66,.018,.055).translate(x-s*.32,0,z),new BoxGeometry(.055,.018,.75).translate(x,0,z-e*.36))
  }
  const merged=mergeGeometries(geometries,false)!;geometries.forEach(g=>g.dispose());return merged
}

export function contactTexture() {
  const bytes=new Uint8Array(64*64*4)
  for(let y=0;y<64;y++)for(let x=0;x<64;x++) { const i=(y*64+x)*4,u=(x/63-.5)*2,v=(y/63-.5)*2;bytes.set([255,255,255,Math.round(Math.exp(-4*(u**6+v**6))*210)],i) }
  const t=new DataTexture(bytes,64,64,RGBAFormat);t.magFilter=t.minFilter=LinearFilter;t.needsUpdate=true;return t
}

/** Small repeated actor parts use vertex colors to retain color separation in a single draw. */
export function coloredParts(parts:Part[],material:MeshStandardMaterial):Part[]{
 const list=parts.map(p=>{const g=p.geometry.index?p.geometry.toNonIndexed():p.geometry.clone(),a=g.attributes.position,c=p.material.color,colors=new Float32Array(a.count*3);for(let i=0;i<a.count;i++)colors.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new Float32BufferAttribute(colors,3));p.geometry.dispose();return g})
 const merged=mergeGeometries(list,false)!;list.forEach(g=>g.dispose());return[{geometry:merged,material}]
}
export function makeIncidentFixtures(m:Materials,high:boolean){
 const a=builder(m,high)
 // Outer instruction and an open inspection bay, distinct from the secure inner boundary.
 a.cyl([1.5,1.74,23],.065,3.22,'steel');a.box([1.5,3.25,22.96],[2.1,1.3,.08],'steel',.025)
 a.cyl([1.2,2.3,6.05],.05,.8,'steel');a.box([1.2,2.65,6.16],[2,.8,.08],'steel',.025)
 a.box([4.8,.131,24],[6.3,.003,.38],'white')
 for(const x of[8.2,12])a.box([x,.132,25],[.09,.004,8],'amber')
 for(const z of[21,29])a.box([10.1,.132,z],[3.8,.004,.09],'amber')
 for(const x of[1.9,3.25,4.6,5.95,7.3,8.65])a.cyl([x,.12,7.4],.3,.035,'steel')
 // Platform intercom: its head is reachable while the guard stays behind protective steelwork.
 a.box([9.48,1.02,7.1],[.16,1.25,.16],'steel',.02);a.box([9.48,1.78,7.1],[.3,.4,.18],'dark',.025)
 for(let y=1.68;y<1.88;y+=.05)a.box([9.48,y,7.198],[.2,.015,.008],'steel')
 a.box([9.48,1.59,7.205],[.10,.035,.025],'amber',.01)
 for(const x of[9.15,10.2,12.5,15.8])a.cyl([x,.88,8.65],.1,1.5,'blue')
 a.beam([9.15,1.3,8.65],[15.8,1.3,8.65],.052,'steel')
 a.box([14.05,1.44,7.06],[1.1,2.1,.42],'joint',.06)
 a.box([14.05,2.45,7.30],[1.7,1.02,.2],'dark',.045)
 a.box([14.05,1.35,7.37],[1.2,.12,.5],'steel',.035)
 a.box([14.26,1.43,7.40],[.14,.06,.14],'amber',.02)
 // Lane detector is a ground loop with an adjacent contact/status indicator, not a laser beam.
 for(const x of[2.2,7.2])a.box([x,.133,16],[.07,.006,3],'joint')
 for(const z of[14.5,17.5])a.box([4.7,.133,z],[5,.006,.07],'joint')
 return a.finish()
}
export function makeBollards(m:Materials,high:boolean){const a=builder(m,high);for(const x of[1.9,3.25,4.6,5.95,7.3,8.65]){a.cyl([x,-.55,7.4],.24,1.2,'steel');a.cyl([x,-.12,7.4],.245,.13,'amber');a.cyl([x,.025,7.4],.24,.05,'dark')}return a.finish()}
export function makePerson(m:Materials,high:boolean,role:'guard'|'staff'|'operator'){
 const a=builder(m,high),shirt=role==='guard'?'blue':role==='staff'?'paleBlue':'joint'
 a.box([0,1.16,0],[.45,.58,.29],shirt,.13);a.cyl([0,1.47,0],.07,.19,'skin');a.put(new SphereGeometry(.157,12,8),'skin',[0,1.65,0])
 if(role==='guard'){a.cyl([0,1.79,0],.17,.065,'blue');a.box([0,1.17,.16],[.33,.48,.06],'amber',.035);a.box([0,1.13,.2],[.35,.05,.016],'white')}
 a.beam([.26,1.38,0],[.30,1.02,.07],.06,shirt);a.put(new SphereGeometry(.065,8,6),'skin',[.30,.97,.08])
 return a.finish()
}
export function makeDriver(m:Materials,high:boolean){const a=builder(m,high)
 a.box([.57,1.72,-2.0],[.57,.16,.58],'dark',.06);a.box([.57,1.20,-2],[.15,.90,.15],'steel');a.box([.57,.75,-2.78],[.5,.04,.4],'dark');a.box([.57,2.10,-1.77],[.55,.88,.12],'dark',.07)
 a.box([.57,2.05,-2.14],[.45,.59,.28],'amber',.10);a.cyl([.57,2.37,-2.2],.07,.16,'skin');a.put(new SphereGeometry(.155,12,8),'skin',[.57,2.53,-2.2])
 for(const x of[.44,.70]){a.beam([x,1.76,-2.1],[x,1.54,-2.52],.07,'dark');a.beam([x,1.54,-2.52],[x,.88,-2.67],.065,'dark');a.box([x,.83,-2.78],[.18,.12,.33],'rubber',.03)}
 a.box([.57,1.75,-3],[.8,.22,.3],'dark',.04);a.beam([.57,1.7,-3],[.57,1.99,-2.76],.045,'steel');return a.finish()
}
export function makeSteering(m:Materials,high:boolean){const a=builder(m,high);a.put(new TorusGeometry(.23,.026,6,high?24:16),'rubber');for(let i=0;i<3;i++)a.beam([0,0,0],[Math.sin(i*Math.PI*2/3)*.22,Math.cos(i*Math.PI*2/3)*.22,0],.016,'steel');a.cyl([0,0,0],.055,.05,'dark',[Math.PI/2,0,0]);for(const x of[-.23,.23])a.put(new SphereGeometry(.05,8,6),'skin',[x,0,0]);return a.finish()}
