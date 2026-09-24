import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { PerspectiveCamera } from 'three'
registerHooks({ resolve(specifier, context, nextResolve) {
  try { return nextResolve(specifier, context) } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return nextResolve(specifier + '.ts', context)
    throw error
  }
} })
const { catalogue } = await import('../components/worlds/catalogue.ts')
const { scenariosFor, storyStates } = await import('../components/worlds/scenario.ts')
const { sampleCamera } = await import('../components/worlds/math.ts')
const selected = process.argv.find(a=>a.startsWith('--world='))?.slice(8)
if (selected) assert(catalogue.some(w=>w.id===selected),'known selected world')
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]))
const angle=(a,b)=>2*Math.acos(Math.min(1,Math.abs(a.reduce((s,v,i)=>s+v*b[i],0))))*180/Math.PI
const rows=[],camera=new PerspectiveCamera()
function pose(keys,time,mobile) {
  const p=sampleCamera(keys,time,mobile)
  assert([...p.position,...p.target,p.fov].every(Number.isFinite),'finite camera pose')
  assert(distance(p.position,p.target)>=1,'camera target stays away from eye')
  camera.position.set(...p.position);camera.lookAt(...p.target)
  return {...p,quaternion:camera.quaternion.toArray()}
}
for(const world of catalogue.filter(w=>!selected||w.id===selected)) for(const scenario of scenariosFor(world)) {
  assert(scenario.cameras.every(k=>!k.cut),`${world.id}/${scenario.id}: no authored camera cuts`)
  for(const mobile of [false,true]) {
    const limits={positionUnitsPerSecond:20,targetUnitsPerSecond:30,degreesPerSecond:60,fovDegreesPerSecond:20}
    const observed={positionUnitsPerSecond:0,targetUnitsPerSecond:0,degreesPerSecond:0,fovDegreesPerSecond:0}
    let previous=pose(scenario.cameras,0,mobile),previousTime=0,samples=1
    for(let step=1;step<=Math.ceil(scenario.duration/.02);step++) {
      const time=Math.min(scenario.duration,step*.02),p=pose(scenario.cameras,time,mobile),dt=time-previousTime
      observed.positionUnitsPerSecond=Math.max(observed.positionUnitsPerSecond,distance(p.position,previous.position)/dt)
      observed.targetUnitsPerSecond=Math.max(observed.targetUnitsPerSecond,distance(p.target,previous.target)/dt)
      observed.degreesPerSecond=Math.max(observed.degreesPerSecond,angle(p.quaternion,previous.quaternion)/dt)
      observed.fovDegreesPerSecond=Math.max(observed.fovDegreesPerSecond,Math.abs(p.fov-previous.fov)/dt)
      previous=p;previousTime=time;samples++
    }
    for(const [name,limit] of Object.entries(limits)) assert(observed[name]<=limit,`${world.id}/${scenario.id}/${mobile?'phone':'desktop'}: ${name} ${observed[name]} exceeds ${limit}; redesign camera timing/route`)
    const boundaries=new Set([...scenario.cameras.map(k=>k.at),...storyStates(scenario).map(s=>s.at)])
    for(const at of boundaries) {
      if(at<=0||at>=scenario.duration)continue
      const epsilon=1e-6,a=pose(scenario.cameras,at-epsilon,mobile),b=pose(scenario.cameras,at,mobile),c=pose(scenario.cameras,at+epsilon,mobile)
      assert(distance(a.position,c.position)<.0001 && distance(a.target,c.target)<.0001 && Math.abs(a.fov-c.fov)<.0001 && angle(a.quaternion,c.quaternion)<.001,'no boundary jump')
      const velocity=(x,y,key)=>x[key].map((v,i)=>(y[key][i]-v)/epsilon)
      assert(distance(velocity(a,b,'position'),velocity(b,c,'position'))<.02,'camera position velocity joins')
      assert(distance(velocity(a,b,'target'),velocity(b,c,'target'))<.02,'camera target velocity joins')
      assert(Math.abs((b.fov-a.fov)/epsilon-(c.fov-b.fov)/epsilon)<.02,'camera FOV velocity joins')
    }
    rows.push({world:world.id,scenario:scenario.id,viewport:mobile?'phone':'desktop',samples,boundaries:boundaries.size,observed,limits})
  }
}
console.log(JSON.stringify({pass:true,scope:'Source camera continuity/velocity checks, not rendered framing or obstacle clearance.',rows},null,2))
