import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
registerHooks({ resolve(specifier, context, nextResolve) {
  try { return nextResolve(specifier, context) } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return nextResolve(specifier + '.ts', context)
    throw error
  }
} })
const { definition: source } = await import('../components/worlds/scenes/private-estate/content.ts')
const { selectScenario, stateAt, storyStates } = await import('../components/worlds/scenario.ts')
const { validateWorld } = await import('./validate-scenario.mjs')
// Stable independent timings exercise the shared contract while real owners migrate.
const beatIds = ['detect', 'verify', 'correlate', 'decide', 'respond', 'resolve']
const variant = (id, role, shift = 0) => {
  const beats = beatIds.map((anchor, i) => ({ id: anchor, at: [4,11,18,25,33,40][i] + shift, title: anchor, body: `Authored ${anchor}`, evidence: [{ source: 'Fixture observation', detail: 'A labelled synthetic contract input.', kind: 'observed' }], ...(anchor === 'decide' ? { action: 'Review this fixture' } : {}) }))
  beats[4].subevents = [{ id: 'return', at: 36 + shift, title: 'Return', body: 'The response enters a distinct material state.', evidence: [{ source: 'Fixture response', detail: 'Supported return.', kind: 'response' }] }]
  const story = { id, role, label: id, lesson: 'A synthetic fixture.', establishing: { title: 'Start', body: 'Normal operation.' }, duration: 46 + shift, beats, cameras: [{ at: 0, position: [0,5,10], target: [0,0,0] }, { at: 46 + shift, position: [1,5,10], target: [0,0,0] }], poster: '/worlds/private-estate/poster.webp', posterAlt: 'Fixture representative state.' }
  return { ...story, fallbackStills: storyStates(story).map(state => ({ at: state.at, state: state.id, src: `/worlds/private-estate/${id}-${state.id}.webp`, alt: `${id}: ${state.title}` })) }
}
const world = { id: source.id, number: source.number, name: source.name, subtitle: source.subtitle, description: source.description, setting: source.setting, poster: source.poster, posterAlt: source.posterAlt, palette: source.palette, practicalLightLimit: source.practicalLightLimit, defaultScenario: 'intrusion', scenarios: [variant('intrusion', 'primary'), variant('wildlife', 'comparison', 2)] }
validateWorld(world, { release: true })
const primary = selectScenario(world), wildlife = selectScenario(world, 'wildlife')
assert.equal(primary.id, 'intrusion'); assert.equal(wildlife.id, 'wildlife')
assert.equal(selectScenario(world, 'lost').id, 'intrusion')
assert.equal(stateAt(primary, 0).cue.id, 'establish')
assert.equal(stateAt(primary, -10).cue.id, 'establish')
assert.equal(stateAt(primary, 35.999).cue.id, 'respond')
assert.equal(stateAt(primary, 36).cue.id, 'return')
assert.equal(stateAt(primary, 36).still.state, 'return')
assert.equal(stateAt(wildlife, 36).cue.id, 'respond', 'comparison timing is its own')
assert.equal(stateAt(wildlife, 38).cue.id, 'return')
assert.equal(stateAt(primary, 200).cue.id, 'resolve')
assert.equal(stateAt(primary, NaN).cue.id, 'establish')
const expected = ['resolve','detect','return','establish','decide','verify','correlate']
assert.deepEqual([46,4,37,0,25,11,18].map(t => stateAt(primary,t).cue.id), expected)
const rejects = (change, match) => { const bad = structuredClone(world); change(bad); assert.throws(() => validateWorld(bad, { release: true }), match) }
rejects(w => { w.defaultScenario = 'wildlife' }, /default is the primary/)
rejects(w => { w.scenarios.pop() }, /estate comparison/)
rejects(w => { w.scenarios[0].beats[4].subevents[0].at = 41 }, /strictly ordered/)
rejects(w => { w.scenarios[0].beats[4].subevents[0].id = 'verify' }, /state IDs unique/)
rejects(w => { w.scenarios[0].fallbackStills = w.scenarios[0].fallbackStills.filter(f => f.state !== 'return') }, /material state return/)
rejects(w => { w.scenarios[0].fallbackStills[0].at = 1 }, /start at zero/)
rejects(w => { w.scenarios[0].fallbackStills[1].at = 3 }, /exact narrative state/)
rejects(w => { w.scenarios[0].fallbackStills[1].src = '/worlds/private-estate/../other.webp' }, /local world image/)
rejects(w => { w.scenarios[0].beats[0].evidence[0].kind = 'identity' }, /new evidence declares/)
rejects(w => { w.scenarios[0].beats[0].action = 'Launch' }, /one human decision/)
if (!source.scenarios) assert.throws(() => validateWorld(source, { release: true }), /legacy story cannot/)
console.log('PASS: synthetic estate primary/comparison, subevent boundaries, independent timing, direct/reverse state selection; invalid story/still/evidence/decision contracts rejected.')
