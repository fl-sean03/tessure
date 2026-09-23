import type { SceneDefinition } from '../../contract'

/** A fictional yard sequence. Times are authored playback, not detection latency. */
export const definition: SceneDefinition = {
  id: 'logistics-yard', number: '05', name: 'Logistics yard',
  subtitle: 'Put movement in context',
  description: 'A loaded trailer leaves its row. The dispatch record changes what that movement means.',
  lesson: 'Recognizing a vehicle is only the beginning. Its movement matters in the context of the yard’s expected releases.',
  establishing: {
    title: 'First light on the loading apron',
    body: 'The gantry prepares for another lift. Containers wait in their rows, and a loaded yard tractor joins the outbound aisle.',
  },
  setting: 'Intermodal yard · first light', duration: 48,
  poster: '/worlds/logistics-yard/poster.webp',
  posterAlt: 'An amber-lit intermodal yard with a braced gantry, ribbed container rows and a loaded terminal tractor beside the dispatch verification bay.',
  palette: {
    background: '#d9c7b3', fog: '#d9c7b3', fogNear: 60, fogFar: 145,
    ambient: 0.13, sun: '#ffd8a7', sunIntensity: 3.8, sunPosition: [-38, 25, 32],
    hemisphereSky: '#c2d4e1', hemisphereGround: '#695642', hemisphereIntensity: 1.05,
    exposure: 1.04, toneMapping: 'aces',
    shadowBounds: { left: -51, right: 51, top: 39, bottom: -39, near: 1, far: 135, bias: -0.00015, normalBias: 0.035, mapSize: 2048 },
  },
  practicalLightLimit: 2,
  cameras: [
    { at: 0, position: [8, 8, 29], target: [-14, 5.2, -6], mobilePosition: [-1, 9, 28], mobileTarget: [-16, 5, -3], fov: 44, easing: 'linear', interpolation: 'spline' },
    { at: 4, position: [4, 5.6, 22], target: [-16, 2.1, -0.6], mobilePosition: [0, 6.5, 24], mobileTarget: [-16, 2.7, -1], fov: 43, easing: 'linear', interpolation: 'spline' },
    { at: 10.9, position: [12, 6, 19], target: [-5.4, 2.2, -1], mobilePosition: [9, 7, 24], mobileTarget: [-5, 2.4, -0.5], fov: 43 },
    { at: 11, position: [10, 7.5, 17], target: [-5.5, 2.1, -.4], mobilePosition: [9, 8, 20], mobileTarget: [-5.5, 2.3, -.2], fov: 43, cut: true, easing: 'linear', interpolation: 'spline' },
    { at: 17.9, position: [20, 8, 17], target: [3, 2, -.5], mobilePosition: [19, 9, 20], mobileTarget: [3, 2.3, -.2], fov: 43 },
    { at: 18, position: [29, 12, 22], target: [10, 2.3, -2.2], mobilePosition: [26, 11, 23], mobileTarget: [9.5, 2.6, -1], fov: 42, cut: true, easing: 'smoother', interpolation: 'spline' },
    { at: 26, position: [31, 10, 20], target: [14, 2, -2.5], mobilePosition: [30, 10, 22], mobileTarget: [14, 2, -1.5], fov: 42, easing: 'smooth', interpolation: 'spline' },
    { at: 34, position: [27, 8, 17], target: [14, 1.8, -2], mobilePosition: [27, 9, 20], mobileTarget: [14, 2, -1.5], fov: 42, easing: 'smoother', interpolation: 'spline' },
    { at: 42, position: [36, 27, 36], target: [3, 2, -5], mobilePosition: [31, 23, 30], mobileTarget: [10, 2, -3], fov: 44, easing: 'smooth' },
    { at: 48, position: [39, 29, 39], target: [2, 2, -6], mobilePosition: [32, 24, 31], mobileTarget: [10, 2, -3], fov: 44 },
  ],
  beats: [
    { id: 'detect', at: 4, title: 'A load leaves the row', body: 'A yard tractor carries a container toward the outbound apron. Movement is expected here; its release still needs context.', evidence: [{ source: 'Raised aisle camera', detail: 'A loaded trailer emerges from the cargo row.' }] },
    { id: 'verify', at: 11, title: 'Keep the load in view', body: 'Container stacks interrupt the camera’s line of sight. The proposed system automatically checks and links camera and apron radar observations on site to follow the same vehicle and load.', evidence: [{ source: 'Aisle camera', detail: 'The row edge briefly obscured the trailer.' }, { source: 'Apron radar', detail: 'The illustrated track continues into the open lane.' }] },
    { id: 'correlate', at: 18, title: 'No matching release shown', body: 'The proposed local system checks that movement against the dispatch record. No matching release is shown, so the site team has an operational question to resolve.', evidence: [{ source: 'Dispatch movement record', detail: 'No release is linked to this outbound move.' }, { source: 'Linked observation', detail: 'The loaded tractor is approaching the verification bay.' }] },
    { id: 'decide', at: 26, title: 'The supervisor holds release', body: 'The vehicle waits at the normal verification point. The supervisor reviews the observations and requests a record check; the missing match does not establish intent.', evidence: [{ source: 'Human review', detail: 'The release remains pending a site check.' }], action: 'Hold release for record check' },
    { id: 'respond', at: 34, title: 'A handoff at the bay', body: 'Following that decision, the supervisor comes to the verification bay with the record. The loaded vehicle stays paused and the outbound barrier stays closed.', evidence: [{ source: 'Site handoff', detail: 'Supervisor and vehicle meet at the marked bay.' }, { source: 'Release status', detail: 'Held while the movement record is checked.' }] },
    { id: 'resolve', at: 42, title: 'Awaiting site verification', body: 'The track, source observations and supervisor’s hold decision remain linked in one illustrative record. The scene ends with the release unresolved.', evidence: [{ source: 'Event record', detail: 'Camera, radar and dispatch context retained together.' }, { source: 'Recorded decision', detail: 'Hold release for record check.' }] },
  ],
}
