import type { SceneDefinition, ScenarioVariant, CameraKey } from '../../contract'
import { T } from './timing'
const view=(at:number,position:[number,number,number],target:[number,number,number],mobilePosition=position,mobileTarget=target):CameraKey=>({at,position,target,mobilePosition,mobileTarget,fov:39,interpolation:'pchip'})
const incident:ScenarioVariant={
 id:'vehicle-control-incident',label:'Vehicle approach + control anomaly',role:'primary',duration:T.end,
 lesson:'Physical access and command authority are separate. Correlate relevant evidence, protect the inner lane, then verify the truck and controller locally.',
 establishing:{title:'A working campus, two access boundaries',body:'Authored red-team simulation. A legitimate service van clears the inner lane. Staff use a protected path; a truck approaches the outer stop instruction. Cooling and site power remain on.'},
 poster:'/worlds/data-center/poster.webp',posterAlt:'A truck approaching raised inner bollards, with a guard behind the protected pavilion rail and a separate local access console.',
 cameras:[
 // Approach the outer instruction, then travel along the observed access devices.
 view(0,[34,25,45],[1,2,6],[31,30,48],[5,1.7,10]),
 view(6,[19,11,41],[5,1.6,27],[20,14,44],[5,1.6,27]),
 view(10,[15,8.8,34],[4.8,1.6,24],[16,10,37],[4.8,1.6,24]),
 view(14,[16,3.5,11.3],[14.05,2.2,7.3],[15.7,3.4,10.8],[14.05,2.2,7.25]),
 view(15,[16,3.5,11.3],[14.05,2.2,7.3],[15.7,3.4,10.8],[14.05,2.2,7.25]),
 view(17,[12.3,6.5,13.8],[8.65,4.9,7.5],[10.5,5.8,13.2],[8.6,5,7.5]),
 view(17.5,[12.3,6.5,13.8],[8.65,4.9,7.5],[10.5,5.8,13.2],[8.6,5,7.5]),
 view(20,[9.8,6.3,19.6],[.7,2.7,15.8],[9.8,6.3,19.6],[.7,2.7,15.8]),
 view(21,[9.8,6.3,19.6],[.7,2.7,15.8],[9.8,6.3,19.6],[.7,2.7,15.8]),
 view(23,[4.8,3.8,10],[1.2,2.45,6.2],[4.2,3.2,9],[1.2,2.45,6.2]),
 // Pull above the clear bollard sweep, then show the stopped driver and local review.
 view(26,[16,8,19],[5.5,1,9.5],[17,11,21],[5.5,1,10]),
 view(28.5,[10.7,4.8,9.6],[5.5,2,10],[10.3,4.6,9.4],[5.5,2,10]),
 view(31,[16.6,3.6,11.7],[14.1,2,7.55],[16.2,3.5,11],[14.1,2,7.5]),
 view(33,[16.6,3.6,11.7],[14.1,2,7.55],[16.2,3.5,11],[14.1,2,7.5]),
 view(37.5,[16.6,3.6,11.7],[14.1,2,7.55],[16.2,3.5,11],[14.1,2,7.5]),
 // Stay with the protected staff/guard response before following both reverse arcs.
 view(41,[23,10,19],[13,1.3,7],[24,13,23],[13,1.3,7]),
 view(44,[14,4.3,13],[9.9,1.3,7.6],[14,5.5,14],[10,1.3,7.7]),
 view(44.5,[14,4.3,13],[9.9,1.3,7.6],[14,5.5,14],[10,1.3,7.7]),
 view(49,[22,12,30],[7,1.4,17],[23,17,34],[7.2,1.5,18]),
 view(53,[23,13,36],[8.4,1.5,22],[23,18,39],[8.4,1.5,22]),
 view(55,[23,13,36],[8.4,1.5,22],[23,18,39],[8.4,1.5,22]),
 view(63,[23,12,38],[10,1.3,24],[24,16,42],[10,1.4,24]),
 // Follow the local inspection, then retreat continuously to the recorded endpoint.
 view(66,[20,9,24],[10,1.3,12],[21,11,26],[10,1.3,12]),
 view(68,[14,4.2,12],[10,1.3,7.3],[13.5,4.4,12],[9.9,1.35,7.3]),
 view(70,[14,4.2,12],[10,1.3,7.3],[13.5,4.4,12],[9.9,1.35,7.3]),
 view(72,[16,3.5,11.3],[14.05,2.2,7.3],[15.7,3.4,10.8],[14.05,2.2,7.25]),
 view(74,[16,3.5,11.3],[14.05,2.2,7.3],[15.7,3.4,10.8],[14.05,2.2,7.25]),
 view(T.end,[32,24,41],[6,1.5,10],[30,28,43],[9,1.5,14]),
 ],
 beats:[
 {id:'detect',at:T.detect,title:'The truck closes on the stop line',body:'The fictional red-team driver accelerates toward the restricted approach. The fixed radar contributes motion and distance; the camera supplies a separate view.',evidence:[{kind:'observed',source:'Approach radar',detail:'An approaching vehicle accelerates toward the marked stopping position.'}],subevents:[
 {id:'stop-crossed',at:T.crossed,title:'Past the outer instruction',body:'The truck passes STOP without waiting. The secure inner gate remains closed; the open apron is not containment.',evidence:[{kind:'observed',source:'Fixed gate camera',detail:'The truck crosses the outer stopping line and continues toward the inner boundary.'}]},
 {id:'commands-rejected',at:T.anomaly,title:'A separate control anomaly',body:'The local access controller rejects unauthorized open commands. This record is independent of the truck observation.',evidence:[{kind:'observed',source:'Local access controller · illustrative',detail:'Remote open requests rejected; closed gate contact unchanged.'},{kind:'uncertainty',source:'Attribution',detail:'The controller record does not establish that the driver sent these commands.'}]}]},
 {id:'verify',at:T.verify,title:'Observe the approach; check the controller',body:'The fixed camera confirms continued approach. The panel radar contributes the approaching track. The local controller independently reports rejection, rather than a successful opening.',evidence:[{kind:'observed',source:'Camera + fixed-panel radar',detail:'A moving truck occupies the authored approach sector. No plate, face or intent recognition is claimed.'},{kind:'observed',source:'Gate contact',detail:'Closed.'}],subevents:[
 {id:'camera-view',at:17,title:'A fixed camera sees the approach',body:'The lens is aimed down the approach. Its contribution is the visible truck and boundary crossing, not the driver’s identity or intent.',evidence:[{kind:'observed',source:'Fixed gate camera',detail:'Truck continues along the restricted approach.'}]},
 {id:'radar-view',at:20,title:'A fixed panel contributes the track',body:'The aimed panel radar independently contributes the moving approach track. Its illustration does not require a rotating scanner or claim calibrated range.',evidence:[{kind:'observed',source:'Approach radar',detail:'Approaching truck remains in the authored sector.'}]},
 {id:'lane-presence',at:T.lane,title:'Presence in the inner approach',body:'The ground loop indicates lane presence while the gate contact stays closed. These are different physical states.',evidence:[{kind:'observed',source:'Lane detector + gate contact',detail:'Approach occupied; gate closed. The controller continues to reject open requests.'}]}]},
 {id:'correlate',at:T.correlate,title:'Hold the inner access',body:'Proposed on-site correlation groups the relevant approach and controller records. A preauthorized access hold raises the inner bollards while their swept lane is empty; the truck brakes.',evidence:[{kind:'correlation',source:'Proposed local correlation',detail:'Related place and time group physical and control evidence; this is not proof of a common source.'},{kind:'response',source:'Preauthorized access policy',detail:'Inner bollard hold begins with the lift area empty. Gate remains closed.'}],subevents:[
 {id:'inner-secured',at:T.bollardsUp,title:'Bollards up before arrival',body:'The bollards reach full height before the truck reaches them. The protected inner lane remains closed.',evidence:[{kind:'response',source:'Inner-access state',detail:'Bollards raised; gate closed; no vehicle above the moving mechanisms.'}]},
 {id:'truck-braked',at:T.stopped,title:'The truck stops short',body:'The driver brakes to a stop before the raised bollards. The driver remains at the controls; nobody enters the truck’s path.',evidence:[{kind:'observed',source:'Camera + lane presence',detail:'Truck stationary outside the protected inner boundary.'}]}]},
 {id:'decide',at:T.decide,title:'The operator reviews the access hold',body:'The on-site operator reviews the stopped truck, secured inner lane and rejected command record, then authorizes local-only gate commands and an on-site check. Cooling and site power continue.',action:'Operator review: keep access closed and verify locally',evidence:[{kind:'observed',source:'Current access state',detail:'Truck stopped; inner gate closed and bollards raised.'},{kind:'uncertainty',source:'Investigation',detail:'Vehicle authorization and the source of the rejected commands remain under review.'}]},
 {id:'respond',at:T.respond,title:'An operator takes local authority',body:'Following the on-site review, the local operator uses the physical console. The guard moves to the protected inspection point and staff move behind the inner boundary.',evidence:[{kind:'response',source:'Authorized local response',detail:'Operator begins the local-only command-path change; the guard and staff stay on protected paths.'}],subevents:[
 {id:'local-only',at:T.local,title:'Remote commands isolated locally',body:'The console now shows LOCAL ONLY. Cooling stays on. This is local access-command isolation, not a claim of network-wide protection.',evidence:[{kind:'response',source:'Local controller',detail:'Local-only gate-command authority selected; cooling indication unchanged.'}]},
 {id:'guard-ready',at:T.guardReady,title:'A protected direction to the driver',body:'The guard reaches the intercom point behind steel protection and directs the truck toward the open holding apron. Staff continue along the protected path.',evidence:[{kind:'response',source:'Gate team',detail:'Guard in protected position; driver prepares the reverse maneuver.'}]},
 {id:'reversing',at:T.reverse,title:'Reverse into the holding apron',body:'The driver steers and reverses away from the secure inner boundary under guard direction. The wheels roll backward; the truck does not turn in place.',evidence:[{kind:'observed',source:'Authored physical response',detail:'Reverse motion begins after a stopped steering setup.'}]},
 {id:'reverse-pause',at:T.reverseMiddle,title:'Stop, then change steering',body:'The truck pauses partway through the reverse maneuver. The driver changes the steering before continuing into the marked bay.',evidence:[{kind:'observed',source:'Vehicle state',detail:'Truck stationary during the change in steering direction.'}]},
 {id:'reverse-resumed',at:T.reverseSecond,title:'Align with the open bay',body:'A second reverse arc straightens the truck into the holding apron. Staff are now behind the protected inner boundary.',evidence:[{kind:'response',source:'Gate team + staff',detail:'Truck continues under guard direction; staff remain separated from the vehicle sweep.'}]},
 {id:'truck-held',at:T.parked,title:'Stopped under guard direction',body:'The truck stops in the open outer apron. The inner barrier stays secure. The truck is not physically contained by this open bay.',evidence:[{kind:'observed',source:'Holding-apron view',detail:'Truck stopped in the marked bay, away from the inner gate.'}]}]},
 {id:'resolve',at:T.resolve,title:'Inspect the held lane and controller',body:'The truck remains stopped under guard direction while the guard checks the protected lane/intercom and the operator checks local access state.',evidence:[{kind:'observed',source:'Gate team',detail:'Truck held in the open apron; inner barrier remains secure.'},{kind:'uncertainty',source:'Follow-up',detail:'Authorization and source attribution are still under review.'}],subevents:[
 {id:'local-check-complete',at:T.checked,title:'A local check, with questions retained',body:'The record joins the stopped truck, rejected remote commands and completed local access check. Cooling continues. It does not establish driver attribution, network-wide protection or absence of data loss.',evidence:[{kind:'response',source:'Local access check',detail:'Closed gate and raised bollards checked; command authority remains local-only.'},{kind:'observed',source:'Controller record',detail:'Rejected remote open commands retained with the physical approach record.'},{kind:'uncertainty',source:'Investigation',detail:'Truck authorization and the control anomaly’s source remain unresolved.'}]}]},
 ],
 fallbackStills:[],
}
const states=[{id:'establish',at:0,title:'Normal campus before the incident'},...incident.beats.flatMap(b=>[{id:b.id,at:b.at,title:b.title},...(b.subevents||[])])]
incident.fallbackStills=states.map(s=>({state:s.id,at:s.at,src:`/worlds/data-center/incident-${s.id}.webp`,alt:`Authored simulation at ${s.at} seconds: ${s.title}.`}))
export const definition:SceneDefinition={
 id:'data-center',number:'02',name:'Data center',subtitle:'Protect the inner boundary',description:'A threatening truck approach and separate rejected control commands prompt a local access hold and guarded verification.',
 setting:'Campus access incident · authored simulation',poster:incident.poster,posterAlt:incident.posterAlt,
  palette: {
    background: '#cbd7dd', fog: '#cbd7dd', fogNear: 80, fogFar: 180,
    ambient: 0.65, hemisphereSky: '#e3effb', hemisphereGround: '#646e71', hemisphereIntensity: 1.65,
    sun: '#fff5df', sunIntensity: 2.5, sunPosition: [-24, 46, 30],
    exposure: 1.04, toneMapping: 'aces',
    shadowBounds: { left: -44, right: 40, top: 45, bottom: -38, near: 1, far: 130, bias: -0.00015, normalBias: 0.035, mapSize: 2048 },
  },
 practicalLightLimit:1,defaultScenario:incident.id,scenarios:[incident],
}
