import type { SceneDefinition } from './contract'

/** Golden visual exemplar. Authored observations, never a performance demonstration. */
export const definition: SceneDefinition = {
  id: 'logistics-yard', number: '05', name: 'Logistics yard',
  subtitle: 'Put movement in context',
  description: 'A cargo move. An unmatched release. One question for the person in charge.',
  lesson: 'A vehicle track becomes useful when it meets the site’s operational context.',
  setting: 'Gate study · first light', duration: 48,
  establishing: { title: 'An ordinary outbound arrival', body: 'A cargo vehicle approaches the site’s normal verification point. The gate is controlled and a member of the site team is nearby.' },
  poster: '/reference/poster.webp',
  posterAlt: 'Concept miniature of a cargo truck approaching a controlled logistics gate in warm first light.',
  palette: {
    background: '#ced7d9', fog: '#ced7d9', fogNear: 75, fogFar: 160,
    ambient: 0.16, sun: '#ffe0aa', sunIntensity: 4.2, sunPosition: [-28, 26, 21],
    hemisphereSky: '#b6d2ed', hemisphereGround: '#635849', hemisphereIntensity: 1.05,
    exposure: 1.03, toneMapping: 'aces',
    shadowBounds: { left: -32, right: 32, top: 31, bottom: -31, near: 1, far: 120, bias: -0.00015, normalBias: 0.025, mapSize: 2048 },
  },
  practicalLightLimit: 2,
  cameras: [
    { at: 0, position: [34, 26, 41], target: [-1, 1.6, -1], mobilePosition: [31, 30, 43], mobileTarget: [-1, 1.5, 0], fov: 38, easing: 'smoother', interpolation: 'spline' },
    { at: 11, position: [24, 18, 32], target: [-0.5, 2, 1], mobilePosition: [22, 22, 32], mobileTarget: [0, 2, 2], fov: 38, easing: 'smoother', interpolation: 'spline' },
    { at: 26, position: [22, 17, 30], target: [1, 2, 1.5], mobilePosition: [20, 20, 29], mobileTarget: [1.5, 2, 2.5], fov: 38, easing: 'smoother', interpolation: 'spline' },
    { at: 34, position: [24, 18, 31], target: [1, 2, 1.5], mobilePosition: [22, 21, 31], mobileTarget: [1.5, 2, 2], fov: 38, easing: 'smoother', interpolation: 'spline' },
    { at: 48, position: [34, 26, 41], target: [-1, 1.6, -1], mobilePosition: [31, 30, 43], mobileTarget: [-1, 1.5, 0], fov: 38 },
  ],
  beats: [
    { id: 'detect', at: 4, title: 'Cargo is on the move', body: 'A loaded vehicle approaches the outbound verification point.', evidence: [{ source: 'Yard camera', detail: 'An authored observation of a vehicle and its load.' }] },
    { id: 'verify', at: 11, title: 'Different observations, one vehicle', body: 'Camera, radar and thermal observations converge on the same vehicle as it slows at the gate.', evidence: [{ source: 'Camera + radar + thermal', detail: 'Three illustrative observations refer to the same physical event.' }] },
    { id: 'correlate', at: 18, title: 'The movement needs context', body: 'The illustrated movement record has no matching release. The vehicle remains at the normal verification point.', evidence: [{ source: 'Movement record', detail: 'No matching release is illustrated. This is a question for the site team, not a finding of wrongdoing.' }] },
    { id: 'decide', at: 26, title: 'A person decides what happens next', body: 'The supervisor reviews the linked observations and chooses to hold the outbound release for a record check.', evidence: [{ source: 'Supervisor review', detail: 'The sequence stops here. The scene does not operate a real gate.' }], action: 'Hold release and ask the site team to check the record' },
    { id: 'respond', at: 34, title: 'Check at the verification point', body: 'A member of the site team walks to the gate. The vehicle remains stationary and the barrier stays controlled.', evidence: [{ source: 'Site team', detail: 'An illustrative on-site check, following the authored human decision.' }] },
    { id: 'resolve', at: 42, title: 'Keep the decision with the evidence', body: 'The observations and the hold decision stay together in a record awaiting site verification.', evidence: [{ source: 'Illustrative event record', detail: 'The scene leaves the release unresolved; it does not invent a completed verification.' }] },
  ],
}
