import { BoxGeometry, BufferGeometry, Color, CylinderGeometry, DataTexture, DoubleSide, ExtrudeGeometry, Float32BufferAttribute, LinearFilter, LinearMipmapLinearFilter, MeshStandardMaterial, Object3D, Quaternion, RepeatWrapping, RGBAFormat, Shape, SphereGeometry, TubeGeometry, Vector3, CatmullRomCurve3 } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Vec3 } from '../../contract'
import { seeded } from '../../math'
import { cameras, devicePoint } from './devices'

const colors = { earth: '#5a4955', edge: '#98858a', lawn: '#69795f', lawnLight: '#788568', paving: '#b6a49c', gravel: '#c2b5a0', stone: '#8d7c78', timber: '#986d58', woodLight: '#c39b76', joint: '#78604f', plum: '#643d55', canvas: '#eee1c8', steel: '#b6b4be', dark: '#2c293a', glass: '#444c65', warm: '#ffce88', white: '#eee7ca', sage: '#8caa9f', blue: '#7389a6', terracotta: '#b96c53', leaf: '#566852' }
export type Finish = keyof typeof colors
export type Part = { geometry: BufferGeometry; material: MeshStandardMaterial }
export function materials() {
  const m = Object.fromEntries(Object.entries(colors).map(([k,c]) => [k, new MeshStandardMaterial({ color: c, roughness: .83 })])) as Record<Finish, MeshStandardMaterial>
  for (const key of ['lawn','paving','timber','canvas'] as Finish[]) {
    const data = new Uint8Array(64*64*4), base=new Color(colors[key])
    for(let i=0;i<4096;i++){const grain=1+(seeded(i+51)-.5)*(key==='lawn'?.24:.1); for(let j=0;j<3;j++)data[i*4+j]=Math.min(255,[base.r,base.g,base.b][j]*255*grain);data[i*4+3]=255}
    const tex = new DataTexture(data,64,64,RGBAFormat);tex.wrapS=tex.wrapT=RepeatWrapping;tex.repeat.set(6,6);tex.magFilter=LinearFilter;tex.minFilter=LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true
    m[key].color.set('white');m[key].map=tex
  }
  m.joint.userData.noShadow=true
  m.steel.metalness=.7;m.steel.roughness=.36;m.glass.metalness=.3;m.glass.roughness=.25
  m.warm.emissive.set('#ffd398');m.warm.emissiveIntensity=1.8;m.canvas.side=DoubleSide
  return m
}
export function assembly(m:ReturnType<typeof materials>, high:boolean) {
  const bins=new Map<Finish,BufferGeometry[]>()
  function put(source:BufferGeometry, f:Finish, p:Vec3=[0,0,0], r:Vec3=[0,0,0], s:Vec3=[1,1,1]) {
    const o=new Object3D();o.position.set(...p);o.rotation.set(...r);o.scale.set(...s);o.updateMatrix();source.applyMatrix4(o.matrix)
    const g=source.index?source.toNonIndexed():source;if(g!==source)source.dispose()
    if(!g.attributes.uv)g.setAttribute('uv',new Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2))
    if(!g.attributes.normal)g.computeVertexNormals()
    const list=bins.get(f)||[];list.push(g);bins.set(f,list)
  }
  function box(p:Vec3,s:Vec3,f:Finish,b=.03,r:Vec3=[0,0,0]) { put(b?new RoundedBoxGeometry(...s,1,Math.min(b,Math.min(...s)*.35)):new BoxGeometry(...s),f,p,r) }
  function cyl(p:Vec3,rad:number,h:number,f:Finish,r:Vec3=[0,0,0],top=rad){put(new CylinderGeometry(top,rad,h,high?12:8),f,p,r)}
  function beam(a:Vec3,b:Vec3,rad:number,f:Finish){const start=new Vector3(...a),end=new Vector3(...b),d=end.clone().sub(start);const g=new CylinderGeometry(rad,rad,d.length(),high?8:6);g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),d.normalize()));put(g,f,start.add(end).multiplyScalar(.5).toArray() as Vec3)}
  function tube(p:Vec3[],rad:number,f:Finish){put(new TubeGeometry(new CatmullRomCurve3(p.map(v=>new Vector3(...v))),high?32:20,rad,6,false),f)}
  function slab(p:Vec3,w:number,d:number,h:number,r:number,f:Finish){const sh=new Shape();sh.moveTo(-w/2+r,-d/2);sh.lineTo(w/2-r,-d/2);sh.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);sh.lineTo(w/2,d/2-r);sh.quadraticCurveTo(w/2,d/2,w/2-r,d/2);sh.lineTo(-w/2+r,d/2);sh.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);sh.lineTo(-w/2,-d/2+r);sh.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);const g=new ExtrudeGeometry(sh,{depth:h,bevelEnabled:true,bevelSize:.04,bevelThickness:.035,bevelSegments:1,curveSegments:8});g.rotateX(-Math.PI/2);put(g,f,p)}
  function surface(fn:(u:number,v:number)=>Vec3,nu:number,nv:number,f:Finish){const pos:number[]=[],uv:number[]=[];for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){for(const [du,dv] of [[0,0],[0,1],[1,0],[1,0],[0,1],[1,1]]){const u=(i+du)/nu,v=(j+dv)/nv;pos.push(...fn(u,v));uv.push(u,v)}}const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(pos,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.computeVertexNormals();put(g,f)}
  function finish(){return [...bins].map(([f,list])=>{const geometry=mergeGeometries(list,false)!;list.forEach(g=>g.dispose());return {geometry,material:m[f]}})}
  return {put,box,cyl,beam,tube,slab,surface,finish}
}
export function makeSite(m:ReturnType<typeof materials>, high:boolean) {
  const a=assembly(m,high)
  a.slab([0,-1.5,1],49,37,.65,5,'earth');a.slab([0,-.86,1],48.7,36.7,.5,5,'edge');a.slab([0,-.36,1],48.3,36.3,.35,4.8,'lawn')
  // A terraced fan rises away from the performance, with narrow stone risers and timber seat edges.
  const cx=-7,cz=-9
  for(let row=0;row<5;row++) {
    const inner=6+row*2.05,outer=inner+2.05,y=.14+row*.36
    a.surface((u,v)=>{const th=-1.22+u*2.10,r=inner+v*(outer-inner);return[cx+Math.sin(th)*r,y,cz+Math.cos(th)*r]},high?60:40,1,row%2?'lawnLight':'lawn')
    a.surface((u,v)=>{const th=-1.22+u*2.10;return[cx+Math.sin(th)*outer,v*y,cz+Math.cos(th)*outer]},high?60:40,1,'stone')
    for(const [lo,hi] of [[-.99,-.11],[.11,.83]])a.tube(Array.from({length:25},(_,i)=>{const th=lo+(hi-lo)*i/24;return[cx+Math.sin(th)*(outer-.18),y+.13,cz+Math.cos(th)*(outer-.18)]}),.11,'woodLight')
  }
  // Central radial stair interrupts the grass without an implausible vertical climb.
  for(let i=0;i<15;i++)a.box([cx,.06+i*.12,cz+6.1+i*.65],[1.05,.12,.68],'gravel',.018)
  a.slab([-7,.02,-9],15.4,9.1,.62,1.1,'dark');a.slab([-7,.64,-9],15.2,8.9,.1,1.1,'timber')
  for(let i=0;i<24;i++)a.box([-14.1+i*.61,.753,-9],[.014,.012,8.4],'woodLight',0)
  // Tensile roof: a continuous doubly-curved fabric, stitched seams and tied high corners.
  const roof=(u:number,v:number):Vec3=>[-7+(u-.5)*15,5.75+2.2*Math.pow((u-.5)*2,2)+.75*Math.pow((v-.5)*2,2),-9+(v-.5)*9]
  a.surface(roof,high?36:24,high?18:12,'canvas')
  for(let j=0;j<=6;j++)a.tube(Array.from({length:25},(_,i)=>{const p=roof(j/6,i/24);p[1]+=.018;return p}),.02,'gravel')
  for(const u of [0,1])a.tube(Array.from({length:25},(_,i)=>roof(u,i/24)),.065,'canvas')
  for(const v of [0,1])a.tube(Array.from({length:25},(_,i)=>roof(i/24,v)),.065,'canvas')
  for(const x of [-14.5,.5])for(const z of [-13.5,-4.5]){
    a.box([x,.14,z],[.65,.25,.65],'dark',.06);a.cyl([x,4.4,z],.10,8.6,'steel');a.beam([x,8.7,z],[x+Math.sign(x+7)*1.3,.1,z],.025,'steel')
  }
  // Open triangular stage trusses, no solid placeholder beams.
  for(const z of [-12.8,-5.1]){
    for(const y of [4.4,4.95])a.beam([-14,y,z],[0,y,z],.065,'steel')
    for(let x=-14;x<0;x+=.7)a.beam([x,4.4,z],[x+.7,4.95,z],.036,'steel')
    for(let x=-12.5;x<0;x+=2.3){a.beam([x,4.45,z],[x,4.32,z],.05,'steel');a.cyl([x,4.2,z],.18,.4,'dark',[-.4,0,0]);a.cyl([x,4.009,z+.083],.135,.014,'warm',[-.4,0,0])}
  }
  for(const z of [-12.8,-5.1])for(const [x,mast] of [[-14,-14.5],[0,.5]]){const mz=z===-12.8?-13.5:-4.5;a.beam([x,4.95,z],[mast,4.95,mz],.065,'steel');a.beam([x,4.4,z],[mast,4.4,mz],.065,'steel');a.box([mast,4.675,mz],[.24,.72,.24],'steel',.035)}
  a.box([-7,2.4,-13.2],[11.8,3.3,.09],'plum',.01)
  for(let i=0;i<30;i++)a.box([-12.6+i*.39,2.4,-13.11],[.08,3.3,.1],'plum',.025)
  for(const x of [-13.4,-.6])for(let j=0;j<3;j++){a.box([x,3.7-j*.46,-5.1],[.72,.42,.54],'dark',.07);a.box([x,3.7-j*.46,-4.81],[.61,.33,.035],'glass',.025)}
  for(const x of [-13.4,-.6]){for(const dx of [-.25,.25])a.beam([x+dx,4.4,-5.1],[x+dx,3.94,-5.1],.035,'steel');a.box([x,3.94,-5.1],[.78,.07,.56],'dark',.025);for(let j=0;j<2;j++)for(const dx of [-.27,.27])a.beam([x+dx,3.5-j*.46,-5.1],[x+dx,3.42-j*.46,-5.1],.023,'steel')}
  // Drum kit, microphone stands and floor wedges make the stage legible at hero scale.
  a.cyl([-8,1.25,-10.2],.48,.58,'plum',[Math.PI/2,0,0]);a.cyl([-8,1.25,-9.89],.42,.03,'canvas',[Math.PI/2,0,0])
  for(const [x,z] of [[-8.7,-10.4],[-7.1,-10.5],[-6.6,-9.9]]){a.cyl([x,1.09,z],.025,.64,'steel');for(const dx of [-.18,.18])a.beam([x,1.03,z],[x+dx,.78,z+.16],.022,'steel');a.cyl([x,1.55,z],.29,.32,'plum');a.cyl([x,1.73,z],.27,.02,'canvas')}
  for(const dx of [-.32,.32])a.beam([-8+dx,1.15,-10.18],[-8+dx,.78,-9.75],.025,'steel')
  for(const x of [-9.2,-6.4]){a.cyl([x,1.42,-10.5],.025,1.35,'steel');a.cyl([x,2.12,-10.5],.41,.025,'woodLight')}
  for(const x of [-11,-5,-2.5]){a.cyl([x,1.48,-7],.023,1.45,'steel');a.beam([x,2.15,-7],[x+.3,2.25,-6.8],.025,'steel');a.beam([x+.3,2.25,-6.8],[x+.44,2.28,-6.72],.047,'dark');a.box([x,.86,-5.2],[.8,.35,.54],'dark',.05,[.2,0,0]);for(let j=0;j<3;j++){const th=j*2.094;a.beam([x,.82,-7],[x+Math.sin(th)*.35,.77,-7+Math.cos(th)*.35],.022,'steel')}}
  // Pale concourse and a separate curved frontage bypass; planks give the alternate route material identity.
  a.slab([0,.025,10.8],45,4.7,.09,1.8,'paving')
  a.slab([3,.015,15.7],23,3.4,.1,1.6,'timber')
  a.slab([-7,.025,13.4],3.4,7.5,.09,1.6,'timber');a.slab([13,.025,13.4],3.4,7.5,.09,1.6,'timber')
  for(let x=-7.7;x<14.5;x+=.48)a.box([x,.15,15.7],[.023,.001,2.85],'joint',0)
  for(const x of [-7,13])for(let z=10.2;z<14.2;z+=.46)a.box([x,.15,z],[2.85,.001,.023],'joint',0)
  // Dedicated staff corridor, equipment apron and public-side verification pad.
  a.slab([-4.7,.025,13.5],1.8,2.1,.09,.15,'timber');a.slab([8.2,.025,2.4],8.2,15.6,.09,.3,'gravel');a.slab([12.7,.025,7.3],3.7,3.0,.09,.3,'gravel')
  function barrier(x:number,z:number,len:number,angle=0){const point=(dx:number,y:number,dz=0):Vec3=>[x+Math.cos(angle)*dx-Math.sin(angle)*dz,y,z+Math.sin(angle)*dx+Math.cos(angle)*dz];for(const dx of [-len/2,len/2]){a.beam(point(dx,.15),point(dx,1.17),.037,'steel');a.beam(point(dx,.13,-.32),point(dx,.13,.32),.055,'dark')}for(const y of [.32,1.16])a.beam(point(-len/2,y),point(len/2,y),.032,'steel');for(let dx=-len/2+.22;dx<len/2;dx+=.22)a.beam(point(dx,.33),point(dx,1.15),.018,'steel')}
  for(const x of [-3.3,-.6,2.1])barrier(x,8.35,2.5)
  for(const x of [-.6,2.1,5,7.7,10.4])barrier(x,13.2,2.5)
  for(const x of [-18,-15.3,-12.6])barrier(x,8.35,2.5)
  // Stalls: framed open counters, deep striped awnings, pitched canvas roof, cups, equipment and wheels.
  function stall(x:number,z:number,w:number,color:Finish){a.box([x,.23,z],[w+.3,.36,3.2],'dark',.06);a.box([x,1.01,z+.1],[w,1.25,2.75],color,.07);a.box([x,2.25,z-1.2],[w,1.4,.12],'timber',.025);a.box([x,1.53,z+1.5],[w+.3,.14,.65],'woodLight',.04)
    for(const side of [-1,1]){a.box([x+side*(w/2-.1),2.1,z+1.35],[.12,1.3,.12],'steel',.02);a.box([x+side*(w/2-.1),2.1,z-1.25],[.12,1.3,.12],'steel',.02)}
    a.surface((u,v)=>[x+(u-.5)*(w+.5),3.2-.7*Math.abs((v-.5)*2),z+(v-.5)*3.6],12,2,'canvas')
    for(let i=0;i<6;i++){a.box([x-w/2+(i+.5)*w/6,2.72,z+1.8],[w/6,.34,.07],i%2?color:'canvas',.012);a.box([x-w/2+(i+.5)*w/6,2.61,z+1.25],[w/6,.05,1.15],i%2?color:'canvas',.01,[-.16,0,0])}
    a.box([x,2.75,z+1.22],[w-.3,.065,.08],'warm',.015)
    for(let i=0;i<5;i++)a.cyl([x-w*.36+i*w*.17,1.74,z+1.5],.07,.23,'canvas')
    a.box([x+w*.24,1.87,z+.45],[.6,.65,.6],'steel',.065);a.box([x+w*.24,1.98,z+.77],[.38,.23,.02],'dark',.02)
    for(const dx of [-w*.35,w*.35])a.cyl([x+dx,.25,z+1.45],.23,.14,'dark',[Math.PI/2,0,0])
  }
  stall(15,4.5,4.8,'plum');stall(19,-2,4.4,'sage');stall(-19,3,4.2,'terracotta')
  // Fold-out tables and covered service supplies.
  for(const [x,z] of [[18,7.5],[21,5],[-20,7]]){a.cyl([x,.87,z],.72,.10,'woodLight');a.cyl([x,.47,z],.055,.78,'steel');a.cyl([x,.1,z],.42,.06,'dark');for(let j=0;j<3;j++){const th=j*2.094;a.cyl([x+Math.sin(th),.48,z+Math.cos(th)],.24,.1,'timber');a.cyl([x+Math.sin(th),.27,z+Math.cos(th)],.045,.4,'steel')}}
  for(const x of [10.7,11.5]){a.box([x,.45,1.8],[.62,.82,.62],'plum',.09);a.box([x,.91,1.8],[.66,.10,.66],'dark',.05);a.box([x,1,1.8],[.24,.08,.35],'dark',.035)}
  // Warm festoon bulbs hang on catenary-like wires, backed by real tapered poles.
  for(const [x,z] of [[-21,8],[-9,8],[3,8],[14,8],[22,8]]){a.cyl([x,2.25,z],.07,4.5,'dark',undefined,.04);a.box([x,.16,z],[.5,.25,.5],'stone',.04)}
  for(const [x1,x2] of [[-21,-9],[-9,3],[3,14],[14,22]]){const pts=Array.from({length:21},(_,i):Vec3=>{const u=i/20;return[x1+(x2-x1)*u,4.55-.65*Math.sin(u*Math.PI),8]});a.tube(pts,.016,'dark');for(let j=1;j<9;j++){const u=j/9,x=x1+(x2-x1)*u,y=4.55-.65*Math.sin(u*Math.PI);a.cyl([x,y-.1,8],.022,.18,'dark');a.put(new SphereGeometry(.065,8,6),'warm',[x,y-.22,8])}}
  // Fixed, down-aimed cameras: connected mounts, separate lens and overhanging weather hood.
  for(const d of cameras){const [x,y,z]=d.post,back=devicePoint(d,[0,-.04,-.40]);a.box([x,y+.12,z],[.68,.24,.68],'stone',.06);a.cyl([x,(y+4.25)/2,z],.075,4.25-y,'steel',undefined,.045);a.box([x,3.95,z],[.18,.35,.18],'steel',.025);a.beam([x,4.12,z],back,.055,'steel');a.cyl(back,.07,.18,'dark');a.box([x,1.4,z+.11],[.25,.38,.18],'dark',.03)
    const put=(p:Vec3,size:Vec3,f:Finish)=>{const verts:number[]=[],g=new BoxGeometry(...size).toNonIndexed(),pos=g.attributes.position;for(let i=0;i<pos.count;i++)verts.push(...devicePoint(d,[pos.getX(i)+p[0],pos.getY(i)+p[1],pos.getZ(i)+p[2]]));g.setAttribute('position',new Float32BufferAttribute(verts,3));g.computeVertexNormals();a.put(g,f)}
    put([0,0,-.32],[.4,.31,.67],'canvas');put([0,.205,-.25],[.49,.045,.84],'canvas');put([0,0,.025],[.31,.24,.045],'dark');const lens=new CylinderGeometry(.093,.093,.035,high?16:10);lens.rotateX(Math.PI/2);const lp=lens.attributes.position,verts:number[]=[];for(let i=0;i<lp.count;i++)verts.push(...devicePoint(d,[lp.getX(i),lp.getY(i),lp.getZ(i)+.06]));lens.setAttribute('position',new Float32BufferAttribute(verts,3));lens.computeVertexNormals();a.put(lens,'glass')
  }
  // Irregular multi-lobed tree silhouettes behind the stage and beyond the stalls.
  for(const [x,z,s] of [[-20,-11,1.1],[-17,-15,1],[-4,-15,1],[10,-11,1.3],[20,-11,1.15],[22,13,.65]]){a.tube([[x,0,z],[x+.12,1.9*s,z],[x-.35,3.8*s,z+.1]],.16*s,'timber');for(let j=0;j<7;j++){const th=j*2.4,r=.3+seeded(j+x)*1.1;a.put(new SphereGeometry(1,high?10:8,high?8:6),j%3?'leaf':'lawn',[x+Math.cos(th)*r*s,3.1*s+seeded(j+z)*1.3*s,z+Math.sin(th)*r*s],[0,j,0],[1.2*s,(.9+seeded(j)*.4)*s,1.05*s])}}
  for(let i=0;i<(high?75:40);i++){const x=-22+seeded(i+20)*43,z=-15+seeded(i+90)*2.2;a.put(new SphereGeometry(1,6,4),'leaf',[x,.2,z],[0,i,0],[.2+seeded(i)*.3,.25,.27])}
  return a.finish()
}
export function makeSign(m:ReturnType<typeof materials>,high:boolean,head=false){const a=assembly(m,high)
  if(!head){a.box([0,.065,0],[.70,.13,.54],'dark',.035);a.cyl([0,.83,0],.047,1.65,'steel');a.cyl([0,1.6,0],.09,.16,'dark');for(const y of [1.50,1.70])a.cyl([0,y,0],.115,.04,'steel')}
  else{a.cyl([0,0,0],.063,.28,'steel');a.box([0,.18,0],[1.45,.56,.11],'plum',.055);for(const face of [-1,1]){a.box([-.1,.18,face*.068],[.73,.085,.018],'canvas',.01);a.box([.30,.30,face*.068],[.37,.085,.018],'canvas',.01,[0,0,-.65]);a.box([.30,.06,face*.068],[.37,.085,.018],'canvas',.01,[0,0,.65])}a.beam([0,-.35,0],[0,-.35,.28],.026,'steel');a.cyl([0,-.35,.28],.035,.16,'dark');a.beam([0,-.35,0],[0,0,0],.035,'steel')}
  return a.finish()
}
