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
console.log('PASS: establishing interval, lighting bounds, exact camera cuts and curved spline interpolation.')
