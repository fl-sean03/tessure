import type { CameraKey, ScenarioVariant, SceneDefinition, StoryEvent, EvidenceKind, Vec3 } from '../../contract'
import { T } from './incident'
import { airPosition, type AirRole } from './flight'
const view=(at:number,position:Vec3,target:Vec3,mobilePosition=position,mobileTarget=target,cut=true,fov=44):CameraKey=>({at,position,target,mobilePosition,mobileTarget,cut,fov,easing:'smoother'})
const airView=(at:number,role:AirRole,offset:Vec3,cut=true):CameraKey=>{const p=airPosition(role,at),target:Vec3=[p[0],p[1]+.4,p[2]];return view(at,p.map((v,i)=>v+offset[i]) as Vec3,target,undefined,undefined,cut,46)}
const follow=(start:number,end:number,role:AirRole,offset:Vec3,cut=true)=>Array.from({length:Math.round((end-start)*2)+1},(_,i)=>({...airView(start+i/2,role,offset,i===0&&cut),easing:'linear' as const}))
const ev=(source:string,detail:string,kind:EvidenceKind='observed')=>({source,detail,kind})
const event=(id:string,at:number,title:string,body:string,source:string,detail:string,kind:EvidenceKind='observed'):StoryEvent=>({id,at,title,body,evidence:[ev(source,detail,kind)]})
export const incident:ScenarioVariant={
 id:'coordinated-incident',label:'Coordinated perimeter and control incident',role:'primary',duration:T.end,
 lesson:'Protect people locally while keeping ground, air and denied-control observations distinct. An unavailable remote link neither removes local command authority nor proves who caused the incident.',
 establishing:{title:'A powered site, a normal round',body:'Authored red-team simulation at a fictional substation. The technician completes a round; the operator and guard remain at the shelter. The white inspection drone is docked beside the yard. Equipment and local-node power stay on throughout.',evidence:[ev('Fictional roles','Two hostile aerial actors and a ground pair are scripted roles, not identities inferred from appearance.','uncertainty')]},
 poster:'/worlds/critical-infrastructure/poster.webp',posterAlt:'Blue-hour substation with powered local control shelter, protected inner work area and a separate inspection-drone dock beside the equipment yard.',
 cameras:[
 view(0,[37,25,46],[2,2,0],[31,27,53],[3,2.6,1],true,40),
 view(3,[2.3,4.5,12],[-3,1.1,6.5],[1.5,4.3,11.5],[-3,1.1,6.5]),
 view(6,[28.5,4,0],[23.5,1,-5.5],[27.4,3.8,-.5],[23.5,1,-5.5]),
 view(8,[22,6,24],[20,1.2,14.5],[23,6,24],[20.5,1.2,14.5]),
 ...follow(12,16,'hostile-west',[4,2,7]),
 view(16.1,[19.8,4.6,19.5],[16.4,1.4,12.3],[18.9,4.3,18.4],[16.2,1.4,12.2]),
 view(19,[15.6,3.7,12.8],[13.5,2.1,5.17],[14.5,3.2,11.4],[13.5,2.1,5.17]),
 view(21,[19.8,4.6,19.5],[16.4,1.4,12.3],[18.9,4.3,18.4],[16.2,1.4,12.2]),
 ...follow(24,26.5,'hostile-east',[4,2,7]),
 view(27,[12.3,4.8,15.5],[9,1.9,6.7],[10.5,4.3,13.8],[8.9,2,6.7],true,38),
 view(30,[21.7,7.7,13.5],[18.8,5.6,9.8],[21.7,7.7,13.5],[18.8,5.6,9.8]),
 view(33,[15.6,3.7,12.8],[13.5,2.1,5.17],[14.5,3.2,11.4],[13.5,2.1,5.17]),
 view(36,[12.3,4.8,15.5],[9,1.9,6.7],[10.5,4.3,13.8],[8.9,2,6.7],true,38),
 view(39,[25,12,27],[11.5,2,7],[23,15,29],[12,2,8]),
 view(43,[25,12,27],[11.5,2,7],[23,15,29],[12,2,8],false),
 view(44,[6,7,18],[-1.6,1.2,6.5],[5,6,17],[-1.6,1.2,6.5]),
 view(51,[14,7,19],[4,1.2,8],[11,7,19],[4,1.2,8],false),
 view(51.1,[24,6.5,17],[17.5,1.2,10],[22.5,5.7,17],[17.2,1.2,10]),
 view(59.5,[18.5,5.7,14],[12.4,1.6,6.6],[16.9,5.5,13.6],[12.5,1.6,6.6]),
 view(64,[21.7,6.8,17.8],[15.7,1.1,9.5],[20.4,6,17],[15.7,1.2,9.6]),
 view(66,[20,5.6,21],[16.8,1.2,12.7],[20,5.6,21],[16.8,1.2,12.7]),
 view(71.8,[25,6,25],[19,1.2,14.5],[24,6,25],[19,1.2,14.5],false),
 ...follow(72,75,'hostile-west',[4,2,7]),
 ...follow(75.1,80.6,'hostile-east',[-4,2,7]),
 view(81,[27,13,28],[16,2,10],[26,14,29],[17,2,10]),
 view(82,[28.5,4,0],[23.5,1,-5.5],[27.4,3.8,-.5],[23.5,1,-5.5]),
 ...follow(85.5,93,'defender',[4,2,6]),
 view(93.1,[30.3,10.8,14],[23.5,6.6,8.5],[29.6,10.8,13],[24,6.8,8.5]),
 view(99,[30.3,10.8,14],[23.5,6.6,8.5],[29.6,10.8,13],[24,6.8,8.5],false),
 ...follow(99.1,107.1,'defender',[4,2,6]),
 view(107.2,[28.5,4,0],[23.5,1,-5.5],[27.4,3.8,-.5],[23.5,1,-5.5]),
 view(111,[28.5,4,0],[23.5,1,-5.5],[27.4,3.8,-.5],[23.5,1,-5.5],false),
 view(112,[12.3,4.8,15.5],[9,1.9,6.7],[10.5,4.3,13.8],[8.9,2,6.7],true,38),
 view(115,[31,20,35],[9,2,5],[29,24,39],[10,2,5]),view(124,[31,20,35],[9,2,5],[29,24,39],[10,2,5],false),
 ],
 beats:[
 {id:'detect',at:T.detect,title:'Three incident streams emerge',body:'The ground pair approach the service boundary. A dark quadrotor enters from the west; an ochre six-rotor aircraft follows a different eastern path. These are hostile roles in this authored incident, not a sensor judgment about identity.',evidence:[ev('Ground approach + air tracks','Separate visible actors approach the fictional site.')],subevents:[
 event('western-air-track',12,'A separate western air track','The dark quadrotor banks into its western observation leg. The western sky head is pitched toward this approach; its observation is separate from the ground gate test.','Western sky camera','Distinct western aerial route, observed within a partial illustrative sector.'),
 event('gate-contact',T.groundContact,'The ground pair test the gate','One actor stops at the latch, turns and reaches to pull the locked gate; the second watches nearby. The gate flexes under the modeled contact but does not open.','Gate contact + camera','Deliberate physical boundary testing, independent of the air observations.'),
 event('control-denied',T.controlDenied,'A separate control anomaly','The local controller records unauthorized remote requests as denied. Local command authority and equipment power remain on. No remote request is shown operating a transformer.','Local controller','Remote requests denied; local command authority retained.'),
 ]},
 {id:'verify',at:T.verify,title:'Contributions corroborate the physical tracks',body:'The ground camera and proposed thermal aperture contribute boundary observations; no thermal image of a person is shown. Two pitched sky heads contribute distinct western and eastern aerial views. Concurrence alone does not identify a common organizer.',evidence:[ev('Camera / proposed thermal','Ground contact observations within partial illustrated sectors.'),ev('Aimed air sensing','Two independent aerial trajectories; no calibrated range or classification claim.')],subevents:[
 event('eastern-air-track',24,'An independent eastern approach','The ochre hexarotor approaches on the eastern track. A separate pitched sky head contributes this view; neither image proves who coordinates the actors.','Eastern sky camera','Six-rotor silhouette and independent eastern route.'),
 event('remote-unavailable',T.linkLoss,'The remote link becomes unavailable','The physical node shows UNAVAILABLE and LOCAL ONLY while its local-power rail stays lit. The outage is another observation; the scene does not attribute it to any actor.','Remote link + local node','Remote service unavailable; local inputs remain on.','uncertainty'),
 ]},
 {id:'correlate',at:T.correlate,title:'Local evidence supports a protective hold',body:'Proposed on-site correlation links concurrent ground contact, aerial tracks and denied requests. Preauthorized local alerts and an inner-access hold activate. Observations are queued at the node despite the lost remote link. Equipment remains powered.',evidence:[ev('Proposed on-site correlation','Ground, air and controller observations combined for local review.','correlation'),ev('Preauthorized policy','Local beacon/hold cue; remote commands remain isolated.','response'),ev('Attribution','Coordination is authored ground truth, not proof of an organizer from sensor observations.','uncertainty')]},
 {id:'decide',at:T.decide,title:'Protect the people and verify locally',body:'Direct the technician to shelter, secure the clear inner access and send the guard to a protected standoff. Keep remote commands isolated. Request a later inspection of the boundary gap only after both hostile tracks leave the flight corridor.',action:'Protect work area; keep remote commands isolated; verify locally',evidence:[ev('Current state','Staff await the decision; the defender remains docked.'),ev('Inspection condition','Human approval and a clear air corridor are both required.','response')]},
 {id:'respond',at:T.respond,title:'Staff carry out the local decision',body:'The technician withdraws along the apron toward shelter. The guard uses a separate inside-fence route to a protected warning position. The operator keeps local command authority; no electrical shutdown occurs.',evidence:[ev('Authorized ground response','Separate technician, guard and operator tasks begin after approval.','response')],subevents:[
 event('staff-sheltered',T.sheltered,'The work area clears','The technician reaches the shelter. The operator touches the local hold control; the inner barrier then closes across the now-clear access. The guard remains ahead of it, inside the outer fence.','Staff + physical control','Shelter arrival precedes barrier closure.','response'),
 event('inner-held',T.innerSecured,'Inner access secured','The inner barrier is down. The guard gives a visible warning from inside the closed outer gate, with a tablet and radio supporting the local check.','Local protective posture','Staff sheltered, inner access held, guard at protected standoff.','response'),
 event('ground-withdrawing',T.groundWithdraw,'The ground pair withdraw','Following the protective posture and warning, the ground actors turn away and leave along the outer approach. Their withdrawal is scripted; the scene makes no claim that software forces it.','Ground camera','Two separate actors visibly turn and depart.'),
 event('air-departures',70,'Two separate air departures','The dark quadrotor departs westward and the ochre hexarotor takes a different eastern route. No RF takeover, forced landing or cyber-to-air actuation is shown.','Independent air tracks','Both hostile aircraft make visible departure turns.'),
 event('west-air-withdrawing',72,'The western aircraft departs','The dark quadrotor turns and moves westward away from the yard. This is a scripted departure, not a forced flight-control response.','Western air track','Westward departure with visible motion against the foothills.'),
 event('east-air-withdrawing',75.1,'The eastern aircraft takes another route','The ochre hexarotor leaves along a separate eastern route. The white inspection aircraft remains docked until this second corridor has cleared.','Eastern air track','Separate departure; defender still parked.'),
 event('corridor-clear',T.airClear,'The local flight corridor clears','Both hostile tracks have left the inspection corridor. Ground actors have departed the service gate. The approved defender can now begin its boundary inspection; remote service is still unavailable.','Local track state','Corridor clearance precedes dock opening.','response'),
 event('dock-opening',T.dockOpen,'The requested inspection begins','The white defender remains supported while the two dock covers slide clear. Rotor spool begins only after the covers have opened.','Approved dock sequence','Opening before spool and takeoff.','response'),
 event('defender-lift',T.lift,'Lift into the clear side corridor','With rotors powered and covers clear, the defender lifts vertically beside the yard, away from people and energized equipment. It has no counter-drone role.','Proposed inspection aircraft','Takeoff follows approval and corridor clearance.','response'),
 event('defender-transit',T.cruise,'Along the safe side route','The aircraft translates along the outside of the eastern fence. Its gimbal is aimed toward boundary geometry rather than faces.','Aircraft + gimbal','Independent inspection route outside the work area.','response'),
 event('boundary-inspection',T.inspect,'Inspect the gap in ground coverage','The defender holds a lateral view of the outer boundary geometry. This supplies a view missing from the fixed ground sector; the guard performs the complementary ground check.','Proposed local inspection','Additional sight line at the boundary; no complete-coverage claim.','response'),
 event('defender-return',T.return,'Return with the local observation','The requested inspection is complete. The aircraft follows its clear side corridor back toward the open dock while the inner access remains held.','Inspection flight','Return begins; protective ground posture remains.','response'),
 event('defender-descend',T.descend,'Back over the open dock','The defender descends vertically above its pad. Rotor power stays on during descent and the covers remain open.','Dock approach','No closure before supported touchdown.','response'),
 event('defender-landed',T.landed,'Supported touchdown','Both skids settle onto the pad. Rotor rundown begins with the aircraft supported; the covers wait.','Pad contact','Landing before power-down.'),
 event('defender-stopped',T.stopped,'Rotors stop before closure','Rundown completes on the pad. The split covers then close above the stationary aircraft.','Dock sequence','Stationary rotors before cover motion.'),
 event('defender-closed',T.dockClosed,'Inspection aircraft secured','The defender is parked under the closed dock. The guard maintains the local check and the inner work area stays protected.','Local response record','Complete dock-to-dock cycle.','response'),
 event('remote-returned',T.linkReturn,'Connected again; ready to sync','The physical node shows CONNECTED and READY TO SYNC. Queued observations remain locally available. Link restoration does not settle attribution or authorize remote control.','Node + connection state','Remote connection restored; local power never changed.'),
 ]},
 {id:'resolve',at:T.resolve,title:'A protected site, an unresolved investigation',body:'In this authored sequence, the ground pair and both hostile aircraft have departed, the technician is sheltered, inner access is held and local inspection is complete. Denied requests and the ready-to-sync record remain distinct. Equipment stayed on; attribution and external investigation remain unresolved.',evidence:[ev('Local response record','Ground/air departures, inspection complete and inner hold recorded.','response'),ev('Control + connection record','Requests denied; remote link available; record ready to sync.'),ev('Illustration boundary','No measured prevention, downtime, endurance or all-clear claim.','uncertainty')]},
 ],
 fallbackStills:[],
}
const states=[{id:'establish',at:0,title:incident.establishing.title,body:incident.establishing.body},...incident.beats.flatMap(b=>[{id:b.id,at:b.at,title:b.title,body:b.body},...(b.subevents??[])])].sort((a,b)=>a.at-b.at)
incident.fallbackStills=states.map(s=>({state:s.id,at:s.at,src:`/worlds/critical-infrastructure/incident-${s.id}.webp`,alt:`Representative ${s.at}-second state. ${s.title}. ${s.body}`}))
export const definition:SceneDefinition={
 id:'critical-infrastructure',number:'06',name:'Critical infrastructure',subtitle:'Local protection during a coordinated incident',description:'A ground boundary test, two hostile aerial tracks and denied control requests meet a local protective response at a blue-hour substation.',setting:'Remote substation · blue hour',poster:incident.poster,posterAlt:incident.posterAlt,
  palette: {
    background: '#627b9a', fog: '#627b9a', fogNear: 72, fogFar: 195,
    ambient: 0.36, sun: '#abcaf1', sunIntensity: 1.85, sunPosition: [-28, 38, 22],
    hemisphereSky: '#bbd7f8', hemisphereGround: '#8e6846', hemisphereIntensity: 0.95,
    exposure: 1.06, toneMapping: 'aces',
    shadowBounds: { left: -35, right: 35, top: 29, bottom: -29, near: 1, far: 115, bias: -0.00015, normalBias: 0.045, mapSize: 2048 },
  },
  practicalLightLimit: 2,
 defaultScenario:incident.id,scenarios:[incident],
}
