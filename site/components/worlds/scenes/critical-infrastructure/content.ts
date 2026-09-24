import type { SceneDefinition } from '../../contract'

export const definition: SceneDefinition = {
  id: 'critical-infrastructure', number: '06', name: 'Critical infrastructure',
  subtitle: 'Local context when the link goes quiet',
  description: 'At a remote substation, perimeter observations and the state of the connection belong in the same picture.',
  lesson: 'An unavailable remote link is a visible limitation. Local observations can support a human handoff without implying that the site is safe.',
  setting: 'Remote substation · blue hour',
  establishing: { title: 'The last maintenance round', body: 'A technician checks the yard as evening settles over the foothills. The local station and remote link are available in this fictional site study.' },
  duration: 52,
  poster: '/worlds/critical-infrastructure/poster.webp',
  posterAlt: 'A blue-hour substation in ochre foothills: ribbed transformers, ceramic insulators and silver gantries beside a warmly lit control shelter and a physical cabinet showing the unavailable remote link and retained local record.',
  palette: {
    background: '#627b9a', fog: '#627b9a', fogNear: 72, fogFar: 195,
    ambient: 0.36, sun: '#abcaf1', sunIntensity: 1.85, sunPosition: [-28, 38, 22],
    hemisphereSky: '#bbd7f8', hemisphereGround: '#8e6846', hemisphereIntensity: 0.95,
    exposure: 1.06, toneMapping: 'aces',
    shadowBounds: { left: -35, right: 35, top: 29, bottom: -29, near: 1, far: 115, bias: -0.00015, normalBias: 0.045, mapSize: 2048 },
  },
  practicalLightLimit: 2,
  cameras: [
    { at: 0, position: [37, 25, 46], target: [0, 2, 0], mobilePosition: [31, 27, 53], mobileTarget: [1, 2.6, 1], fov: 40, easing: 'smoother', interpolation: 'spline' },
    { at: 3, cut: true, position: [12.3, 4.8, 15.5], target: [9, 1.9, 6.7], mobilePosition: [10.5, 4.3, 13.8], mobileTarget: [8.9, 2, 6.7], fov: 38, easing: 'smooth' },
    { at: 4, position: [12.3, 4.8, 15.5], target: [9, 1.9, 6.7], mobilePosition: [10.5, 4.3, 13.8], mobileTarget: [8.9, 2, 6.7], fov: 38, easing: 'smooth' },
    { at: 6, cut: true, position: [29, 18, 39], target: [-5, 2.5, 3], mobilePosition: [-1, 8, 25], mobileTarget: [-8, 1.8, 12.5], fov: 40, easing: 'smooth', interpolation: 'spline' },
    { at: 10, position: [13, 11, 30], target: [-4, 2.1, 8], mobilePosition: [7, 12, 33], mobileTarget: [-5, 2, 8], fov: 40, easing: 'smooth' },
    { at: 12, cut: true, position: [3, 5.4, 25], target: [-3.7, 1.5, 12], mobilePosition: [-0.5, 5.2, 26], mobileTarget: [-3.7, 1.6, 12.3], fov: 40, easing: 'linear', interpolation: 'spline' },
    { at: 19, position: [10, 5.8, 26], target: [3, 1.7, 12], mobilePosition: [6, 5.8, 26], mobileTarget: [3, 1.6, 12], fov: 40, easing: 'smooth' },
    { at: 20, cut: true, position: [26, 13, 29], target: [8, 2.5, 6], mobilePosition: [19, 14, 30], mobileTarget: [9, 2.5, 6], fov: 40, easing: 'smoother', interpolation: 'spline' },
    { at: 29, position: [23, 7.8, 23], target: [11, 1.9, 6.9], mobilePosition: [18.5, 9, 28], mobileTarget: [11.1, 2, 8.8], fov: 38, easing: 'smooth', interpolation: 'spline' },
    { at: 34, position: [22, 7, 25], target: [12, 1.7, 9.5], mobilePosition: [18, 7.5, 25], mobileTarget: [12, 1.7, 9.5], fov: 38, easing: 'smooth', interpolation: 'spline' },
    { at: 38, position: [20, 6.4, 26], target: [11.6, 1.7, 11], mobilePosition: [12.7, 6.1, 20], mobileTarget: [9.7, 1.2, 9.8], fov: 38, easing: 'smoother', interpolation: 'spline' },
    { at: 43, position: [24, 10, 31], target: [9, 2, 8], mobilePosition: [19, 13, 34], mobileTarget: [10, 2, 7], fov: 40, easing: 'smoother', interpolation: 'spline' },
    { at: 44, cut: true, position: [12.3, 4.8, 15.5], target: [9, 1.9, 6.7], mobilePosition: [10.5, 4.3, 13.8], mobileTarget: [8.9, 2, 6.7], fov: 38, easing: 'smooth' },
    { at: 46, position: [12.3, 4.8, 15.5], target: [9, 1.9, 6.7], mobilePosition: [10.5, 4.3, 13.8], mobileTarget: [8.9, 2, 6.7], fov: 38, easing: 'smooth' },
    { at: 49, cut: true, position: [36, 23, 44], target: [2, 2, 1], mobilePosition: [30, 26, 52], mobileTarget: [3, 2.5, 2], fov: 40, easing: 'smooth', interpolation: 'spline' },
    { at: 52, position: [37, 25, 46], target: [0, 2, 0], mobilePosition: [31, 27, 53], mobileTarget: [1, 2.6, 1], fov: 40 },
  ],
  beats: [
    { id: 'detect', at: 4, title: 'Movement beyond the fence', body: 'A person moves along the outer perimeter as the illustrated backhaul becomes unavailable. These are two observations; the interruption does not establish an attack.', evidence: [
      { source: 'Ground radar', detail: 'Movement follows the outside of the southern fence.' },
      { source: 'Remote link', detail: 'Unavailable in this simulation; local inputs remain visible and the local node stays powered.' },
    ] },
    { id: 'verify', at: 12, title: 'Two local views, one crossing', body: 'The proposed on-site system checks the radar observation against thermal and camera views. A person is visible outside the fence; purpose and permission are unknown.', evidence: [
      { source: 'Thermal view', detail: 'A warm silhouette continues along the perimeter path.' },
      { source: 'Perimeter camera', detail: 'The person remains on the outer side of the fence.' },
    ] },
    { id: 'correlate', at: 20, title: 'Keep the local picture together', body: 'The proposed node automatically links the local observations. At this remote equipment yard, a perimeter check needs site context even when remote review is unavailable.', evidence: [
      { source: 'Local node', detail: 'Radar, thermal and camera observations refer to the same perimeter movement.' },
      { source: 'Connection state', detail: 'Remote review unavailable. The local event is retained here.' },
    ] },
    { id: 'decide', at: 29, title: 'A decision at the site', body: 'The on-site operator reviews the local evidence and requests a guard check. Unknown intent remains unknown; the connection state alone cannot settle the event.', evidence: [
      { source: 'On-site operator', detail: 'Local guard verification selected in the authored sequence.' },
      { source: 'Review boundary', detail: 'The guard has not approached the perimeter before this decision.' },
    ], action: 'Request local guard verification' },
    { id: 'respond', at: 38, title: 'A local handoff, a queued record', body: 'Following the illustrated operator decision, a guard walks to the inside of the perimeter to verify locally. The observations and request stay queued at the node.', evidence: [
      { source: 'Local guard', detail: 'The requested perimeter check is in progress.' },
      { source: 'Event record', detail: 'Observations and operator request queued; remote link still unavailable.' },
    ] },
    { id: 'resolve', at: 46, title: 'Ready to sync; verification still open', body: 'The illustrated connection returns and the local record is ready to synchronize. The guard check remains open. This sequence demonstrates no actual offline endurance or equipment protection.', evidence: [
      { source: 'Remote link', detail: 'Connection available again in the authored illustration.' },
      { source: 'Local record', detail: 'Ready to sync. Guard verification pending; no all-clear claimed.' },
    ] },
  ],
}
