import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { scenariosFor, selectScenario, stateAt, storyStates, evidenceLabels } from '../components/worlds/scenario.ts'
import { sampleCamera } from '../components/worlds/math.ts'

export const anchorIds = ['detect', 'verify', 'correlate', 'decide', 'respond', 'resolve']
const slugPattern = /^[a-z][a-z0-9-]*$/
const text = value => typeof value === 'string' && value.trim().length > 0
const finite = value => typeof value === 'number' && Number.isFinite(value)

/** Content/asset contract, not proof of a rendered incident or real sensor capability. */
export function validateWorld(world, { release = false, publicDir } = {}) {
  const modern = Boolean(world.scenarios)
  assert(text(world.id) && slugPattern.test(world.id), 'stable world id')
  assert(world.practicalLightLimit >= 0 && world.practicalLightLimit <= 3)
  assert(world.palette.exposure > 0 && world.palette.hemisphereIntensity >= 0)
  assert(world.palette.shadowBounds.right > world.palette.shadowBounds.left)
  const localImage = src => typeof src === 'string' && src.startsWith(`/worlds/${world.id}/`) && !src.includes('..') && !/[?#\\]/.test(src)
  const asset = (src, alt) => {
    assert(localImage(src) && text(alt), 'local world image and meaningful alt text')
    if (publicDir) assert(existsSync(resolve(publicDir, src.slice(1))), `missing authored image: ${src}`)
  }
  asset(world.poster, world.posterAlt)
  if (release) assert(modern, `${world.id}: legacy story cannot pass expanded release acceptance`)
  const scenarios = scenariosFor(world)
  if (modern) {
    assert(scenarios.length > 0 && new Set(scenarios.map(s => s.id)).size === scenarios.length, 'unique scenario IDs')
    assert.equal(scenarios.filter(s => s.role === 'primary').length, 1, 'one primary scenario')
    assert.equal(scenarios.find(s => s.id === world.defaultScenario)?.role, 'primary', 'default is the primary incident')
    assert.deepEqual(scenarios.map(s => s.role).sort(), world.id === 'private-estate' ? ['comparison', 'primary'] : ['primary'], 'estate comparison only; no missing/extra variants')
    for (const scenario of scenarios) assert(slugPattern.test(scenario.id) && text(scenario.label), 'stable scenario ID and label')
  }
  for (const scenario of scenarios) {
    assert(finite(scenario.duration) && scenario.duration > 0)
    assert(text(scenario.lesson) && text(scenario.establishing.title) && text(scenario.establishing.body))
    assert.deepEqual(scenario.beats.map(b => b.id), anchorIds, 'six ordered anchors')
    assert(scenario.beats[0].at >= 3, 'normal site activity before detection')
    assert(scenario.duration > scenario.beats.at(-1).at, 'visible terminal record before stop')
    assert.equal(scenario.beats.filter(b => b.action).length, 1, 'one human decision')
    assert(text(scenario.beats[3].action), 'decide names the authorized response')
    const states = storyStates(scenario)
    assert.equal(new Set(states.map(s => s.id)).size, states.length, 'state IDs unique across anchors and subevents')
    assert(states.every((state, i) => slugPattern.test(state.id) && finite(state.at) && state.at >= 0 && state.at < scenario.duration && (i === 0 || state.at > states[i - 1].at)), 'all story states strictly ordered inside duration')
    for (const state of states) {
      assert(text(state.title) && text(state.body), 'each state has a complete text equivalent')
      assert(Array.isArray(state.evidence), 'state evidence collection')
      if (state.anchor !== 'establish') assert(state.evidence.length, 'each incident state has attributed evidence')
      for (const entry of state.evidence) {
        assert(text(entry.source) && text(entry.detail), 'evidence source and observation')
        if (modern) assert(Object.hasOwn(evidenceLabels, entry.kind), 'new evidence declares observation/correlation/response/uncertainty')
      }
    }
    // The flattened order also rejects a subevent crossing the next anchor.
    if (scenario.fallbackStills) {
      const frames = scenario.fallbackStills
      assert(frames.length && frames[0].at === 0, 'state stills start at zero')
      assert(frames.every((frame, i) => finite(frame.at) && frame.at >= 0 && frame.at <= scenario.duration && (i === 0 || frame.at > frames[i - 1].at)), 'strictly ordered still times')
      for (const frame of frames) {
        asset(frame.src, frame.alt)
        if (modern) {
          const state = states.find(item => item.id === frame.state)
          assert(state && state.at === frame.at, 'still binds an exact narrative state boundary')
        }
      }
      if (modern) for (const state of states.filter(s => s.material !== false)) assert(frames.some(f => f.state === state.id && f.at === state.at), `material state ${state.id} needs its matching still`)
    } else assert(!modern, 'new scenarios require state-matched stills')
    asset(scenario.poster, scenario.posterAlt)
    assert(scenario.cameras.length >= 2 && scenario.cameras[0].at === 0)
    assert(scenario.cameras.at(-1).at >= scenario.duration, 'camera covers terminal hold')
    assert(scenario.cameras.every((key, i) => finite(key.at) && (i === 0 || key.at > scenario.cameras[i - 1].at) && (key.fov === undefined || (key.fov >= 15 && key.fov <= 90))), 'ordered camera keys and usable field of view')
    const times = new Set([0, scenario.duration, ...states.flatMap(s => [Math.max(0, s.at - 0.001), s.at, Math.min(scenario.duration, s.at + 0.001)])])
    for (const time of times) {
      const first = stateAt(scenario, time)
      assert(first.cue.at <= time, 'no future narrative')
      assert(!first.still || first.still.at <= time, 'no future still')
      stateAt(scenario, scenario.duration - time)
      assert.deepEqual(stateAt(scenario, time), first, 'state selection independent of playback history')
      for (const mobile of [true, false]) {
        const pose = sampleCamera(scenario.cameras, time, mobile)
        assert([...pose.position, ...pose.target, pose.fov].every(Number.isFinite), 'finite desktop/phone camera')
        sampleCamera(scenario.cameras, scenario.duration - time, mobile)
        assert.deepEqual(sampleCamera(scenario.cameras, time, mobile), pose, 'camera seek independent of playback history')
      }
    }
  }
  assert.equal(selectScenario(world, 'missing-scenario').id, selectScenario(world).id, 'unknown scenario returns to explicit default')
  return { id: world.id, scenarios: scenarios.length, migrated: modern }
}
