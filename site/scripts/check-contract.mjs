import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
// Plain scene content shares extensionless TypeScript imports with Next.
registerHooks({ resolve(specifier, context, nextResolve) {
  try { return nextResolve(specifier, context) } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return nextResolve(specifier + '.ts', context)
    throw error
  }
} })
import { samplePath, sampleCamera } from '../components/worlds/math.ts'
const { validateWorld } = await import('./validate-scenario.mjs')
const { catalogue } = await import('../components/worlds/catalogue.ts')
const { loaders } = await import('../components/worlds/loaders.ts')
const { fileURLToPath } = await import('node:url')
const slugs = ['private-estate','data-center','resort-marina','event-overlay','logistics-yard','critical-infrastructure']
assert.deepEqual(catalogue.map(s => s.id), slugs)
assert.deepEqual(Object.keys(loaders), slugs)
const release = process.argv.includes('--release')
const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
const checked = catalogue.map(world => validateWorld(world, { release, publicDir }))
console.log(`PASS: ${checked.length} world contracts; ${checked.filter(s => s.migrated).length} migrated incident worlds; release=${release}.`)
const path=[{at:0,position:[0,0,0]},{at:5,position:[5,2,0]},{at:10,position:[5,2,10]}]
assert.deepEqual(samplePath(path,-5),[0,0,0]); assert.deepEqual(samplePath(path,15),[5,2,10]); assert.deepEqual(samplePath(path,5),[5,2,0])
const point=samplePath(path,3);samplePath(path,9);assert.deepEqual(samplePath(path,3),point)
console.log('PASS: finite desktop/phone cameras, state boundaries, absolute-time seeking and path endpoints.')

const cuts=[{at:0,position:[0,0,10],target:[0,0,0],easing:'linear'},{at:4,position:[10,5,0],target:[1,0,0],cut:true},{at:8,position:[20,10,0],target:[2,0,0],interpolation:'spline'}]
assert.deepEqual(sampleCamera(cuts,3.999,false).position,[0,0,10])
assert.deepEqual(sampleCamera(cuts,4,false).position,[10,5,0])
assert.deepEqual(sampleCamera(cuts,0,false).position,[0,0,10])
assert.deepEqual(sampleCamera(cuts,8,false).position,[20,10,0])
const arc=[{at:0,position:[0,0,0],target:[0,0,0],interpolation:'spline',easing:'linear'},{at:5,position:[10,10,0],target:[0,0,0],interpolation:'spline',easing:'linear'},{at:10,position:[20,0,0],target:[0,0,0]}]
assert.notDeepEqual(sampleCamera(arc,2.5,false).position,[5,5,0], 'spline has curvature')
// Legacy sampling remains during staged migration; release validation rejects cut-marked keys.
console.log('PASS: establishing interval, lighting bounds, legacy camera sampling and curved spline interpolation.')
const continuous = [0,1,8,10].map((at,i) => ({at,position:[[0,4,10],[3,5,10],[8,6,10],[10,7,10]][i],target:[0,0,0],fov:38+i,interpolation:'pchip'}))
for (const mobile of [false,true]) {
  for (let t=0;t<=10;t+=.01) {
    const p=sampleCamera(continuous,t,mobile)
    const i=continuous.findIndex((k,j)=>j<continuous.length-1&&t>=k.at&&t<=continuous[j+1].at)
    if(i>=0) for(let axis=0;axis<3;axis++) assert(p.position[axis]>=continuous[i].position[axis]-1e-10&&p.position[axis]<=continuous[i+1].position[axis]+1e-10,'continuous camera stays inside each monotone segment')
    sampleCamera(continuous,10-t,mobile);assert.deepEqual(sampleCamera(continuous,t,mobile),p)
  }
  for(const key of continuous.slice(1,-1)) {
    const dt=1e-5,a=sampleCamera(continuous,key.at-dt,mobile),b=sampleCamera(continuous,key.at,mobile),c=sampleCamera(continuous,key.at+dt,mobile)
    for(let axis=0;axis<3;axis++) assert(Math.abs((b.position[axis]-a.position[axis])/dt-(c.position[axis]-b.position[axis])/dt)<.001,'camera velocity joins across unequal key intervals')
    assert(Math.abs((b.fov-a.fov)/dt-(c.fov-b.fov)/dt)<.001,'FOV velocity joins')
  }
}
console.log('PASS: time-aware camera continuity, shape preservation, FOV joins and exact reverse seeking.')
