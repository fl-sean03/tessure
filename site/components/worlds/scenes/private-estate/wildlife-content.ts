import type { ScenarioVariant } from '../../contract'

const legacy: import('../../contract').StoryTimeline & Record<string, unknown> = {
  id: 'private-estate', number: '01', name: 'Private estate',
  subtitle: 'The value of a quiet decision',
  description: 'A home at the woodland edge. One uncertain movement. A reason to leave the morning undisturbed.',
  lesson: 'Evidence can justify doing less. Here, an operator can dismiss a wildlife notification and preserve the reason for that decision.',
  establishing: {
    title: 'Before the house wakes',
    body: 'Warm rooms overlook the damp garden. At this occupied home, a useful response protects residents’ quiet and privacy as well as their security.',
  },
  setting: 'Woodland residence · misty dawn', duration: 46,
  poster: '/worlds/private-estate/wildlife-poster.webp',
  posterAlt: 'A russet fox passes a stepped limestone and timber home at dawn, with warm recessed windows and mist between the woodland trees. Original concept illustration.',
  practicalLightLimit: 2,
  palette: {
    background: '#bdcecf', fog: '#bdcecf', fogNear: 21, fogFar: 58,
    ambient: 0.36, sun: '#fff0d6', sunIntensity: 1.4, sunPosition: [-12, 22, 14],
    hemisphereSky: '#d6e8f0', hemisphereGround: '#52604b', hemisphereIntensity: 1.5,
    exposure: 1.05, toneMapping: 'aces',
    shadowBounds: { left: -24, right: 24, top: 22, bottom: -20, near: 1, far: 70, bias: -0.00018, normalBias: 0.025, mapSize: 2048 },
  },
  cameras: [
    { at: 0, position: [-17, 7, 22], target: [-0.9, 2.0, -0.2], mobilePosition: [-11, 6.2, 23], mobileTarget: [-2, 2.0, 0.8], fov: 42, easing: 'smoother', interpolation: 'spline' },
    { at: 4, position: [-11,4.4,13], target: [-5.5,1.7,2.4], mobilePosition: [-8.3,3.2,9.4], mobileTarget: [-6.5,1.4,3.1], fov: 46, easing: 'smooth', interpolation: 'spline' },
    { at: 10.9, position: [-9.5, 4.5, 15], target: [-1, 1.5, 0.8], mobilePosition: [-6.5, 4.5, 17], mobileTarget: [-1.6, 1.5, 1.7], fov: 42 },
    { at: 11, position: [-1.0,3.8,12], target: [-1.6,1.7,3.0], mobilePosition: [-1.8,3.7,11.5], mobileTarget: [-2.1,1.7,3.2], fov: 50, cut: true, easing: 'linear', interpolation: 'spline' },
    { at: 17.9, position: [-1.0,3.8,12], target: [-1.6,1.7,3.0], mobilePosition: [-1.8,3.7,11.5], mobileTarget: [-2.1,1.7,3.2], fov: 50 },
    { at: 18, cut: true, position: [3.6, 4.5, 15], target: [0.5, 1.8, 1.8], mobilePosition: [1, 3.8, 13.4], mobileTarget: [0.5, 1.65, 2.6], fov: 44, easing: 'smoother', interpolation: 'spline' },
    { at: 24.9, position: [5, 4.2, 13], target: [2.2, 1.5, 2.8], mobilePosition: [3, 4.2, 13.8], mobileTarget: [2.1, 1.65, 2.7], fov: 44 },
    { at: 25, position: [-3.2,3.5,10.2], target: [1.65,1.7,2.65], mobilePosition: [-1.8,3.3,10.5], mobileTarget: [1.65,1.3,2.8], fov: 46, cut: true, easing: 'smooth', interpolation: 'spline' },
    { at: 33, position: [0,3.8,12.3], target: [3,1.65,2.7], mobilePosition: [1,3.9,12.4], mobileTarget: [3.6,1.3,2.7], fov: 46, easing: 'smoother', interpolation: 'spline' },
    { at: 40, position: [15, 7.3, 22], target: [2.8, 2, 0.2], mobilePosition: [10, 6.5, 21], mobileTarget: [3.3, 1.9, 1.7], fov: 43, easing: 'smoother', interpolation: 'spline' },
    { at: 46, position: [16, 7.6, 23], target: [3, 2, 0.3], mobilePosition: [13, 6.3, 22], mobileTarget: [6, 1.8, 1.7], fov: 43 },
  ],
  beats: [
    { id: 'detect', at: 4, title: 'Something along the garden edge', body: 'The outbuilding camera picks up movement beside the planting. One partial view is not yet a reason to disturb the household.', evidence: [{ source: 'Garden camera', detail: 'A fixed, outward-facing camera observes movement on the gravel approach.' }] },
    { id: 'verify', at: 11, title: 'Low to the ground. Still moving.', body: 'Proposed on-site verification pairs garden motion with a warm fox outline. The inset is an Illustrative thermal-style view, shown only inside the drawn terrace sector. Heat alone does not explain the event.', evidence: [{ source: 'Terrace thermal', detail: 'Illustrative thermal-style view: a low warm outline in the authored garden sector; no temperatures.' }, { source: 'Garden camera', detail: 'Four legs, pointed ears and a long tail come into view.' }] },
    { id: 'correlate', at: 18, title: 'A path past the home', body: 'The proposed local correlation links the animal shape and continuous garden path. The movement passes the terrace; no entrance event is shown.', evidence: [{ source: 'Linked observations', detail: 'Camera and thermal observations follow the same garden passage.' }, { source: 'Entrance context', detail: 'No entrance event appears in this authored sequence.' }] },
    { id: 'decide', at: 25, title: 'A person makes the quiet call', body: 'The operator reviews the linked observations and chooses “Record as wildlife.” The reason is this animal’s passage, not a claim about the rest of the property.', evidence: [{ source: 'Review picture', detail: 'Animal outline, continuous path and entrance context stay together.' }, { source: 'Operator', detail: 'Proposed action: dismiss this notification without dispatch.' }], action: 'Record as wildlife' },
    { id: 'respond', at: 33, title: 'Notification dismissed. Morning continues.', body: 'Following the authored human decision, the amber notification closes into the record. No guard is dispatched; the fox continues towards the trees.', evidence: [{ source: 'Operator decision', detail: 'Recorded as wildlife; notification dismissed.' }, { source: 'Site response', detail: 'No dispatch is initiated in this illustration.' }] },
    { id: 'resolve', at: 40, title: 'Keep the reason, not the alarm', body: 'The supporting observations remain attached to the dismissal record. This resolves one illustrated event; it does not establish that the whole property is safe.', evidence: [{ source: 'Event record', detail: 'Garden camera + terrace thermal + path + human decision.' }, { source: 'Recorded outcome', detail: 'Wildlife notification closed without dispatch.' }] },
  ],
}

export const wildlife: ScenarioVariant = { ...legacy, id: 'wildlife', label: 'Benign wildlife comparison', role: 'comparison', beats: legacy.beats.map(b => ({ ...b, evidence: b.evidence.map(e => ({ ...e, kind: e.source === 'Linked observations' ? 'correlation' : ['Operator decision','Site response','Recorded outcome'].includes(e.source) ? 'response' : e.source === 'Operator' ? 'uncertainty' : 'observed' })) })), fallbackStills: [{ state: 'establish', at: 0, src: '/worlds/private-estate/wildlife-establish.webp', alt: 'An undisturbed woodland home before the fox passes.' }, ...legacy.beats.map(b => ({state:b.id,at:b.at,src:`/worlds/private-estate/wildlife-${b.id}.webp`,alt:b.title+' Original illustrative wildlife comparison.'}))] }
