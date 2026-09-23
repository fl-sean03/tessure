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
const slugs = ['private-estate','data-center','resort-marina','event-overlay','logistics-yard','critical-infrastructure']
const ids = ['detect','verify','correlate','decide','respond','resolve']
for (const slug of slugs) {
  const { definition: s } = await import(`../components/worlds/scenes/${slug}/content.ts`)
  assert.equal(s.id, slug)
  assert.deepEqual(s.beats.map(b => b.id), ids)
  assert(s.beats.every((b,i) => b.title && b.body && b.evidence.length && (i === 0 || b.at > s.beats[i-1].at)))
  assert(s.duration > s.beats.at(-1).at)
  assert(s.beats[0].at >= 3 && s.beats[0].at <= 6, 'normal life before detect')
  assert(s.establishing.title && s.establishing.body)
  assert(s.practicalLightLimit >= 0 && s.practicalLightLimit <= 3)
  assert(s.palette.exposure > 0 && s.palette.hemisphereIntensity >= 0)
  assert(s.palette.shadowBounds.right > s.palette.shadowBounds.left)
  assert(s.beats[3].action)
  assert.equal(s.cameras[0].at, 0)
  assert(s.cameras.at(-1).at >= s.duration)
  for (const t of [0, ...s.beats.map(b => b.at), s.duration]) {
    for (const mobile of [true,false]) {
      const pose = sampleCamera(s.cameras,t,mobile)
      assert([...pose.position,...pose.target,pose.fov].every(Number.isFinite))
      sampleCamera(s.cameras,s.duration-t,mobile)
      assert.deepEqual(sampleCamera(s.cameras,t,mobile),pose,'seek must not depend on prior time')
    }
  }
}
const path=[{at:0,position:[0,0,0]},{at:5,position:[5,2,0]},{at:10,position:[5,2,10]}]
assert.deepEqual(samplePath(path,-5),[0,0,0]); assert.deepEqual(samplePath(path,15),[5,2,10]); assert.deepEqual(samplePath(path,5),[5,2,0])
const point=samplePath(path,3);samplePath(path,9);assert.deepEqual(samplePath(path,3),point)
console.log('PASS: six narrative contracts; finite desktop/phone cameras; absolute-time seeking and path endpoints.')

const cuts=[{at:0,position:[0,0,10],target:[0,0,0],easing:'linear'},{at:4,position:[10,5,0],target:[1,0,0],cut:true},{at:8,position:[20,10,0],target:[2,0,0],interpolation:'spline'}]
assert.deepEqual(sampleCamera(cuts,3.999,false).position,[0,0,10])
assert.deepEqual(sampleCamera(cuts,4,false).position,[10,5,0])
assert.deepEqual(sampleCamera(cuts,0,false).position,[0,0,10])
assert.deepEqual(sampleCamera(cuts,8,false).position,[20,10,0])
const arc=[{at:0,position:[0,0,0],target:[0,0,0],interpolation:'spline',easing:'linear'},{at:5,position:[10,10,0],target:[0,0,0],interpolation:'spline',easing:'linear'},{at:10,position:[20,0,0],target:[0,0,0]}]
assert.notDeepEqual(sampleCamera(arc,2.5,false).position,[5,5,0], 'spline has curvature')
console.log('PASS: establishing interval, lighting bounds, exact camera cuts and curved spline interpolation.')
