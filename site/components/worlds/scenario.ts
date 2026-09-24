import type { BeatId, Evidence, ResolvedScenario, SceneDefinition, StoryEvent } from './contract'

export const evidenceLabels = {
  observed: 'Observed', correlation: 'Proposed local correlation',
  response: 'Authorized response', uncertainty: 'Not established',
} as const

/** Preserve old inputs during the staged migration without labelling them red-team incidents. */
export function scenariosFor(world: SceneDefinition): ResolvedScenario[] {
  if (world.scenarios) return world.scenarios
  return [{ ...world, id: 'legacy', label: 'Illustrative sequence', role: 'legacy' }]
}

export function selectScenario(world: SceneDefinition, requested?: string): ResolvedScenario {
  const scenarios = scenariosFor(world)
  const selected = scenarios.find(s => s.id === requested) || scenarios.find(s => s.id === world.defaultScenario) || scenarios[0]
  if (!selected) throw new Error(`World ${world.id} has no scenario`)
  return selected
}

export type StoryState = StoryEvent & { anchor: BeatId | 'establish'; action?: string }

/** Flatten a linear narrative for the UI, text equivalent and boundary checks. No playback memory. */
export function storyStates(scenario: ResolvedScenario): StoryState[] {
  return [
    { id: 'establish', anchor: 'establish', at: 0, ...scenario.establishing, evidence: scenario.establishing.evidence || [] },
    ...scenario.beats.flatMap(beat => [
      { ...beat, anchor: beat.id },
      ...(beat.subevents || []).map(event => ({ ...event, anchor: beat.id })),
    ]),
  ]
}

export function stateAt(scenario: ResolvedScenario, time: number) {
  const at = Math.max(0, Math.min(scenario.duration, Number.isFinite(time) ? time : 0))
  const states = storyStates(scenario)
  const cue = states.findLast(state => state.at <= at) || states[0]
  const still = scenario.fallbackStills?.findLast(frame => frame.at <= at)
  return { cue, still }
}

export function groupEvidence(evidence: Evidence[]) {
  return [...Object.keys(evidenceLabels), ''].map(kind => ({
    kind,
    label: evidenceLabels[kind as keyof typeof evidenceLabels],
    entries: evidence.filter(entry => (entry.kind || '') === kind),
  })).filter(group => group.entries.length)
}
