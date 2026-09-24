import type { SceneDefinition } from '../../contract'

export const definition: SceneDefinition = {
  id: 'resort-marina', number: '03', name: 'Resort & marina',
  subtitle: 'The shoreline is part of the site',
  description: 'A small craft approaches a service berth. Harbor staff turn an uncertain arrival into a welcome.',
  lesson: 'Coverage and response belong to the real boundary: here, open water, working berths and a visitor welcome.',
  setting: 'Sheltered inlet · late golden sun', duration: 50,
  establishing: { title: 'An ordinary afternoon on the inlet', body: 'Guests linger under the waterfront awnings. Moored boats rise gently with the water; a small craft enters the sheltered harbor.' },
  poster: '/worlds/resort-marina/poster.webp',
  posterAlt: 'Golden sunlight on a stepped seaside resort, palm-lined beach and timber marina; a burgundy launch approaches the stone service quay across teal water.',
  palette: {
    background: '#d9d9ca', fog: '#d9d9ca', fogNear: 75, fogFar: 165,
    ambient: 0.38, sun: '#ffdfa8', sunIntensity: 3.3, sunPosition: [-38, 32, 24],
    hemisphereSky: '#b8d6de', hemisphereGround: '#70664e', hemisphereIntensity: 1.05,
    exposure: 1.08, toneMapping: 'aces',
    shadowBounds: { left: -45, right: 45, top: 36, bottom: -36, near: 1, far: 145, bias: -0.00025, normalBias: 0.035, mapSize: 2048 },
  },
  practicalLightLimit: 0,
  cameras: [
    { at: 0, position: [40, 25, 48], target: [0, 1, -3], mobilePosition: [22, 24, 53], mobileTarget: [4, 1, 5], fov: 42, easing: 'smoother', interpolation: 'spline' },
    { at: 4, position: [32, 16, 39], target: [7, 0.9, 5], mobilePosition: [21, 15, 40], mobileTarget: [10, 0.6, 8], fov: 39, easing: 'smooth', interpolation: 'spline' },
    { at: 12, position: [24, 10, 25], target: [12, 0.9, 7], mobilePosition: [20, 12, 29], mobileTarget: [13, 0.8, 8], fov: 39, cut: true, easing: 'smoother', interpolation: 'spline' },
    { at: 20, position: [26, 20, 32], target: [6, 0.7, 1], mobilePosition: [20, 21, 35], mobileTarget: [9, 0.8, 3], fov: 42, easing: 'smooth', interpolation: 'spline' },
    { at: 28, position: [23, 16, 30], target: [7, 0.7, 3], mobilePosition: [20, 17, 32], mobileTarget: [10, 0.8, 5], fov: 40, easing: 'easeIn', interpolation: 'spline' },
    { at: 36, position: [11, 10, 25], target: [1, 0.8, 5], mobilePosition: [9, 10, 24], mobileTarget: [2.8, 0.8, 6], fov: 40, easing: 'smoother', interpolation: 'spline' },
    { at: 44, position: [30, 25, 43], target: [-4, 1, -3], mobilePosition: [13, 19, 32], mobileTarget: [-2, 1, 1], fov: 40, easing: 'easeOut', interpolation: 'spline' },
    { at: 50, position: [32, 26, 45], target: [-4, 1, -3], mobilePosition: [13, 19, 32], mobileTarget: [-2, 1, 1], fov: 40 },
  ],
  beats: [
    { id: 'detect', at: 4, title: 'A craft turns toward the working quay', body: 'The shore radar follows a small craft inside the inlet. Its course points toward a service berth; its purpose is unknown.', evidence: [{ source: 'Shore radar', detail: 'A continuous surface track approaches the eastern quay.' }] },
    { id: 'verify', at: 12, title: 'Two views, the same arrival', body: 'In this concept, automatic on-site verification links the continuing radar track with a vessel silhouette in shore camera and thermal views. The observations support presence and location, not intent.', evidence: [{ source: 'Shore camera', detail: 'A small open launch remains visible beyond the service buoys.' }, { source: 'Thermal view', detail: 'A warm vessel silhouette persists at the corresponding location.' }] },
    { id: 'correlate', at: 20, title: 'A service berth is not the visitor entrance', body: 'The proposed local system automatically relates the observations to the marked working-water boundary. The resort needs to keep its service access usable while helping an unfamiliar arrival find the public pontoons.', evidence: [{ source: 'Site context', detail: 'Amber buoys mark the service approach; timber pontoons provide visitor access to the west.' }, { source: 'Linked observations', detail: 'The craft remains outside the marked working berth.' }] },
    { id: 'decide', at: 28, title: 'Let the harbor team make the welcome', body: 'The operator reviews the linked observations and the two approaches. The craft has slowed outside the buoys. Staff guidance is the site’s ordinary way to clarify an arrival.', evidence: [{ source: 'Operator review', detail: 'No purpose or permission has been inferred from the vessel track.' }], action: 'Ask harbor staff to guide the arrival' },
    { id: 'respond', at: 36, title: 'A person on the pontoon, a new course', body: 'After the illustrative approval, a harbor attendant moves to the visitor pontoon and signals the welcome. The launch turns across open water toward that berth.', evidence: [{ source: 'Harbor staff', detail: 'An attendant is at the outer visitor finger.' }, { source: 'Updated track', detail: 'The illustrated course now leads west, clear of the working quay.' }] },
    { id: 'resolve', at: 44, title: 'Arrival handed to the harbor team', body: 'The launch settles beside the visitor pontoon. The illustrative record links the shore observations, operator decision and staff handoff. The visitor’s purpose remains for the harbor team to establish.', evidence: [{ source: 'Handoff record', detail: 'Guidance requested; arrival at the visitor berth recorded.' }, { source: 'Remaining uncertainty', detail: 'Purpose and permission still require a conversation.' }] },
  ],
}
