import type { SceneDefinition } from '../../contract'

export const definition: SceneDefinition = {
  id: 'data-center', number: '02', name: 'Data center',
  subtitle: 'A vehicle is not an authorization',
  description: 'Two arrivals at a service gate. Only one belongs to the scheduled delivery.',
  lesson: 'Seeing where a vehicle is does not establish its permission to enter. Site records change the decision.',
  establishing: {
    title: 'An ordinary delivery window',
    body: 'After rain, a scheduled delivery approaches the service gate. The campus continues its normal work.',
  },
  setting: 'Campus service gate · after rain', duration: 48,
  poster: '/worlds/data-center/poster.webp',
  posterAlt: 'A chalk-white data-center campus with rooftop cooling fans, a cobalt gatehouse and two separate vehicles on a rain-dark service lane.',
  palette: {
    background: '#cbd7dd', fog: '#cbd7dd', fogNear: 80, fogFar: 180,
    ambient: 0.65, hemisphereSky: '#e3effb', hemisphereGround: '#646e71', hemisphereIntensity: 1.65,
    sun: '#fff5df', sunIntensity: 2.5, sunPosition: [-24, 46, 30],
    exposure: 1.04, toneMapping: 'aces',
    shadowBounds: { left: -44, right: 40, top: 45, bottom: -38, near: 1, far: 130, bias: -0.00015, normalBias: 0.035, mapSize: 2048 },
  },
  practicalLightLimit: 1,
  cameras: [
    { at: 0, position: [36, 28, 48], target: [-4, 2, 5], mobilePosition: [31, 30, 57], mobileTarget: [-2, 2.5, 7], fov: 39, easing: 'smoother', interpolation: 'spline' },
    { at: 4, position: [14, 10, 44], target: [2.6, 2, 16], mobilePosition: [15, 16, 45], mobileTarget: [4.4, 1.5, 20], fov: 39, cut: true, easing: 'smooth', interpolation: 'spline' },
    { at: 11, position: [22, 17, 33], target: [4, 1.8, 12], mobilePosition: [23, 21, 37], mobileTarget: [4.4, 1.7, 12], fov: 38, easing: 'smoother', interpolation: 'spline' },
    { at: 18, position: [20, 11, 22], target: [5.8, 1.6, 7.5], mobilePosition: [21, 14, 28], mobileTarget: [6.5, 1.5, 9.5], fov: 39, cut: true, easing: 'smooth', interpolation: 'spline' },
    { at: 26, position: [19, 9, 19.5], target: [6.3, 1.5, 8], mobilePosition: [20, 12, 23], mobileTarget: [6.6, 1.5, 8.1], fov: 39, easing: 'smoother', interpolation: 'spline' },
    { at: 34, position: [19, 10, 21], target: [7.1, 1.3, 8.4], mobilePosition: [19, 12, 23], mobileTarget: [6.8, 1.25, 8.7], fov: 39, easing: 'smooth', interpolation: 'spline' },
    { at: 42, position: [36, 29, 36], target: [-1, 2, 0], mobilePosition: [27, 30, 34], mobileTarget: [4, 1.7, 2], fov: 40, cut: true, easing: 'smoother', interpolation: 'spline' },
    { at: 48, position: [39, 31, 39], target: [-2, 2, -1], mobilePosition: [28, 31, 35], mobileTarget: [4, 1.7, 2], fov: 40 },
  ],
  beats: [
    { id: 'detect', at: 4, title: 'A second arrival in the lane', body: 'Another vehicle follows the scheduled delivery toward the service entrance. Its reason for arriving is unknown.', evidence: [{ source: 'Gate camera', detail: 'A smaller van is visible behind the delivery truck.' }] },
    { id: 'verify', at: 11, title: 'Two vehicles, two observations', body: 'In the proposed on-site workflow, camera and approach radar observations are automatically checked together. They describe separate vehicles, not a shared permission.', evidence: [{ source: 'Approach radar', detail: 'Two separated moving returns occupy the approach lane.' }, { source: 'Gate camera', detail: 'The leading truck and following van remain visually distinct.' }] },
    { id: 'correlate', at: 18, title: 'Only the delivery has a match', body: 'Automatic on-site correlation links the scheduled truck to an illustrative access event. No matching arrival record is shown for the following van. A service entrance needs this distinction before entry.', evidence: [{ source: 'Access-control event · illustrative', detail: 'The scheduled delivery is matched to this gate opening.' }, { source: 'Arrival record · illustrative', detail: 'No separate match is shown for the second vehicle.' }] },
    { id: 'decide', at: 26, title: 'Presence does not grant entry', body: 'The operator has one evidence-backed picture: two vehicles, one matched arrival. The second van is stopped outside; its authorization still needs a separate check.', evidence: [{ source: 'Operator review', detail: 'The unmatched arrival is referred to the gate team.' }], action: 'Request separate gate verification' },
    { id: 'respond', at: 34, title: 'A person makes the next check', body: 'In the authored response, the gate stays closed and a guard approaches the marked stopping point. The scheduled delivery turns toward receiving; the second arrival waits outside.', evidence: [{ source: 'Gate state', detail: 'The arm remains lowered after the matched truck clears.' }, { source: 'Gate team', detail: 'A guard approaches from the protected walkway.' }] },
    { id: 'resolve', at: 42, title: 'A recorded verification handoff', body: 'The observations and operator request are attached to an illustrative event record. The guard takes over verification. The van’s permission and intent remain undetermined.', evidence: [{ source: 'Event record · illustrative', detail: 'Camera, radar and access event linked to the request.' }, { source: 'Handoff', detail: 'Gate-team verification remains pending.' }] },
  ],
}
