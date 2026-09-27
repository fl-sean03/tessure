import type { SceneDefinition, ScenarioVariant, Evidence, CameraKey, Vec3 } from '../../contract'
import { T } from './timing'
const view=(at:number,position:Vec3,target:Vec3,mobilePosition=position,mobileTarget=target,fov=45):CameraKey=>({at,position,target,mobilePosition,mobileTarget,fov,interpolation:'pchip'})
const observed=(source:string,detail:string):Evidence=>({kind:'observed',source,detail})
const response=(source:string,detail:string):Evidence=>({kind:'response',source,detail})
const correlate=(detail:string):Evidence=>({kind:'correlation',source:'Proposed local correlation',detail})
const uncertain=(detail:string):Evidence=>({kind:'uncertainty',source:'Not established',detail})
const incident:ScenarioVariant={id:'restricted-water-air',label:'Restricted water & aerial surveillance',role:'primary',duration:T.end,
 lesson:'Independent water and air observations support one human decision, followed by visible protection of the public waterfront.',
 establishing:{title:'A public waterfront beside a working quay',body:'Fictional red-team simulation. Visitors walk the public promenade; a kayak rests at the pontoons. Beyond the amber water markers, the service quay and its staff-controlled gangway are restricted. The burgundy craft has two unauthorized occupants; the separate quadcopter is a hostile observation actor. Those roles are authored ground truth, not identities inferred by sensors.'},
 poster:'/worlds/resort-marina/poster.webp',posterAlt:'Authored marina incident: a two-person burgundy craft inside water markers, a separate quadcopter above the service quay, and staff on the public waterfront.',
 cameras:[
 view(0,[38,23,43],[6,1,1],[26,24,44],[10,1,6]),
 view(3,[38,23,43],[6,1,1],[26,24,44],[10,1,6]),
 view(7,[45.45,22.41,56.61],[24.19,6.47,24.73],undefined,undefined,48),
 view(16,[24,7,24],[17.1,1.1,14.9],undefined,undefined,46),
 view(19,[24,7,24],[17.1,1.1,14.9],undefined,undefined,46),
 view(23,[21.8,7.4,8.7],[17.7,8.6,2.1],undefined,undefined,42),
 view(25,[21.8,7.4,8.7],[17.7,8.6,2.1],undefined,undefined,42),
 view(28,[15.5,5.8,7],[11,2.5,0],undefined,undefined,43),
 view(30,[14,4.1,4],[10.5,2.5,-1.2],undefined,undefined,43),
 view(32,[14,4.1,4],[10.5,2.5,-1.2],undefined,undefined,43),
 view(36,[16,6.5,11],[9.5,1.8,0],undefined,undefined,49),
 view(41,[16,6.5,11],[10.2,1.8,0],undefined,undefined,49),
 view(46,[16,7.5,13],[7.5,1.8,0],undefined,undefined,49),
 view(48,[16,7.5,13],[7.5,1.8,0],undefined,undefined,49),
 view(53,[29,16,28],[15,3.5,9],undefined,undefined,48),
 view(57,[29,17,26],[17,5,13],undefined,undefined,49),
 view(62,[19,10,27],[8,1,18],undefined,undefined,48),
 view(67,[18,10,38],[5,1,30],undefined,undefined,46),
 view(69.5,[35,16,36],[33,12,29],undefined,undefined,48),
 view(72,[44.4,13.2,42.1],[39.6,14.3,35.9],undefined,undefined,42),
 view(77,[49.2,14.3,49.3],[44.8,15.4,42.8],undefined,undefined,42),
 view(78.3,[49.8,14.6,50.2],[45,16,43],undefined,undefined,42),
 view(80.5,[45,24,30],[24,5,8],undefined,undefined,48),
 view(84,[16,5,5],[10.6,2.1,-.5],undefined,undefined,43),
 view(87,[20,12,18],[8,2,0],undefined,undefined,49),
 view(94,[30,22,36],[6,1,0],[25,23,37],[9,2,1],46),
 ],beats:[
 {id:'detect',at:T.detect,title:'Two approaches, two observation channels',body:'The unauthorized craft advances toward the marked service basin. Separately, the hostile quadcopter descends toward an observation leg over the restricted shore. The open-array radar contributes the water track; the pitched sky camera contributes the air track.',evidence:[observed('Water radar','A surface craft advances toward the amber water markers.'),observed('Sky camera','A separate aircraft approaches above the restricted shore.'),uncertain('The water radar is not shown detecting the aircraft. No common operator or identity is established.')],subevents:[{id:'water-crossing',at:T.crossing,title:'The craft crosses the restricted approach',body:'The two-person craft passes between the amber markers toward the working quay. Visitors remain on the public side; the service gangway is still open under staff control.',evidence:[observed('Water camera','The hull crosses the marked water boundary and continues inward.')]}]},
 {id:'verify',at:T.verify,title:'A craft with two occupants',body:'The water view corroborates the hull, the two seated occupants and the continuing approach. These are visible features; their unauthorized role belongs to the fictional script.',evidence:[observed('Water camera','Two occupants and an inward-moving hull are visible.'),uncertain('Faces, identity and intent are not inferred from this picture.')],subevents:[{id:'air-observation',at:T.airView,title:'A separate surveillance pass',body:'The sky view shows the quadcopter banking along the shore. Its rotors turn and its gimbal points toward the service area. This independently corroborates the authored aerial observation threat.',evidence:[observed('Sky camera','A banked aerial pass along the restricted shore.'),uncertain('No RF interception, shared operator or counter-drone control is depicted.')]}]},
 {id:'correlate',at:T.correlate,title:'One review, separate water and air tracks',body:'The proposed local system links the simultaneous restricted-water and aerial observations by place and time. At the shore control, a short amber link joins the separate blue water and amber air observation tiles. It preserves two tracks rather than claiming one identified operator.',evidence:[correlate('Water and air observations are grouped into a reviewable incident.'),observed('Shore control','The local warning indicator is lit; guests and the open gangway have not yet moved.'),uncertain('The connection is contextual; no common operator is established.')]},
 {id:'decide',at:T.decide,title:'The operator checks both tracks',body:'The operator reviews the separate observations while the craft holds off the quay, then authorizes a shore warning and protection of the nearby visitors.',evidence:[observed('Current site state','Open service gangway, visitors nearby, separate water and aerial tracks.'),uncertain('Departure has not happened; this in-story decision does not control the aircraft.')],action:'The operator authorizes a warning, secured service access and visitors moved back'},
 {id:'respond',at:T.respond,title:'A warning from shore; clear the gangway',body:'After the operator’s authored review, the visible speaker/beacon warning activates. The attendant steps from the service side through the open gangway and onto the public side before its powered leaf moves. Visitors turn back along the promenade.',evidence:[response('Authorized shore sequence','Activate warning, clear the gangway and guide visitors away.')],subevents:[
 {id:'gangway-secured',at:T.gateClosed,title:'Restricted access is closed',body:'The service leaf reaches its closed stop after the attendant clears its sweep. The attendant gestures west; visitors continue to the protected public side.',evidence:[observed('Service gangway','The leaf is closed with no person in its swept space.'),response('Attendant','An unarmed gesture redirects the visitors.')]},
 {id:'public-held',at:T.publicHeld,title:'Visitors back; the craft turns out',body:'Both visitors are behind the public line and its barrier is closed. The craft begins a slow turn away from the quay. This is the scripted adversary response to the visible shore warning, not guaranteed deterrence.',evidence:[observed('Public promenade','Visitors are behind the held route barrier.'),observed('Water camera','The craft begins turning outward.'),uncertain('The craft withdrawal is authored; no assured efficacy is claimed.')]},
 {id:'separate-withdrawals',at:T.airExit,title:'Separate outward routes',body:'The craft follows a clear route back toward open water. Independently, the hostile drone finishes its observation leg, banks away and departs on its own aerial route. Its retreat is a scripted choice; shore equipment does not jam or force it.',evidence:[observed('Water camera','The craft is moving outward; its wake follows speed and heading.'),observed('Sky camera','The drone leaves its shore observation leg.'),uncertain('No forced withdrawal or counter-drone capability is shown.')]}]},
 {id:'resolve',at:T.resolve,title:'Follow departures to the coverage edges',body:'The water and air tracks reach the edges of the illustrated observation area on separate routes. The gangway and public barrier stay held while the attendant starts a shore-side inspection.',evidence:[observed('Separate tracks','Both actors are departing the restricted waterfront.'),response('Attendant','The service entrance remains controlled during the check.')],subevents:[
 {id:'tracks-departed',at:T.departed,title:'The tracks have left this observation',body:'The craft is outside the inlet approach and the drone is beyond the aerial view. Warning indicators stop; the attendant looks across the closed service access to check the quay.',evidence:[observed('Coverage-edge record','Water and aerial departures recorded separately.'),uncertain('The record does not claim tracking beyond the illustrated coverage or identify either operator.')]},
 {id:'shore-checked',at:T.inspected,title:'The attendant completes the shore check',body:'The attendant stops at the service boundary and verifies the pictured quay clear. A green record tile marks this completed shore check. Restricted access remains closed.',evidence:[observed('Shore check','The attendant has reached the controlled boundary and checked the visible quay.'),response('Local record','Departure observations and the completed shore check are recorded.')]},
 {id:'public-reopened',at:T.publicOpen,title:'Public route reopened; service access controlled',body:'The public barrier is open and visitors resume their promenade walk. The restricted service gate stays closed. The record retains two departed tracks, protective shore actions and the completed local check.',evidence:[response('Public route','The promenade reopens after the check.'),observed('Restricted service gate','Service access remains closed.'),uncertain('No identity, universal site safety or guaranteed outcome is inferred.')]}]},
 ],fallbackStills:[]}
incident.fallbackStills=[{state:'establish',at:0,src:'/worlds/resort-marina/incident-establish.webp',alt:incident.establishing.title+' Authored simulation.'},...incident.beats.flatMap(b=>[b,...(b.subevents||[])]).map(b=>({state:b.id,at:b.at,src:`/worlds/resort-marina/incident-${b.id}.webp`,alt:b.title+' Authored simulation state.'}))]
export const definition:SceneDefinition={id:'resort-marina',number:'03',name:'Resort & marina',subtitle:'Two approaches to the restricted quay',description:'An unauthorized craft and a separate aerial surveillance threat approach a fictional resort. Independent observations lead to a human decision and visible shore protection.',setting:'Restricted service basin · golden coast',poster:incident.poster,posterAlt:incident.posterAlt,
  palette: {
    background: '#d9d9ca', fog: '#d9d9ca', fogNear: 75, fogFar: 165,
    ambient: 0.38, sun: '#ffdfa8', sunIntensity: 3.3, sunPosition: [-38, 32, 24],
    hemisphereSky: '#b8d6de', hemisphereGround: '#70664e', hemisphereIntensity: 1.05,
    exposure: 1.08, toneMapping: 'aces',
    shadowBounds: { left: -45, right: 45, top: 36, bottom: -36, near: 1, far: 145, bias: -0.00025, normalBias: 0.035, mapSize: 2048 },
  },
  practicalLightLimit: 0,
  defaultScenario:incident.id,scenarios:[incident],
}
