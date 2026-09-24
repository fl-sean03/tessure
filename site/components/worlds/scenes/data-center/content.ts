import type { SceneDefinition, ScenarioVariant, CameraKey } from '../../contract'
import { T } from './timing'
const view=(at:number,position:[number,number,number],target:[number,number,number],mobilePosition=position,mobileTarget=target,cut=true):CameraKey=>({at,position,target,mobilePosition,mobileTarget,fov:39,cut,easing:'smoother'})
const incident:ScenarioVariant={
 id:'vehicle-control-incident',label:'Vehicle approach + control anomaly',role:'primary',duration:T.end,
 lesson:'Physical access and command authority are separate. Correlate relevant evidence, protect the inner lane, then verify the truck and controller locally.',
 establishing:{title:'A working campus, two access boundaries',body:'Authored red-team simulation. A legitimate service van clears the inner lane. Staff use a protected path; a truck approaches the outer stop instruction. Cooling and site power remain on.'},
 poster:'/worlds/data-center/poster.webp',posterAlt:'A truck stopped before raised inner bollards, with a guard at the protected pavilion and a separate local access console.',
 cameras:[
 view(0,[34,25,45],[1,2,6],[31,30,48],[5,1.7,10]),
 view(T.detect,[18,10,43],[5,1.5,26],[16,12,44],[5,1.5,27]),
 view(T.crossed,[15,7,35],[4.8,1.5,24],[15,10,36],[4.8,1.5,24]),
 view(T.anomaly,[16,3.5,11.3],[14.05,2.2,7.3],[15.7,3.4,10.8],[14.05,2.2,7.25]),
 view(T.verify,[18,12,29],[5,2,17],[18,15,30],[5,1.8,17]),
 view(16,[12.3,6.5,13.8],[8.65,4.9,7.5],[10.5,5.8,13.2],[8.6,5,7.5]),
 view(18,[13,7.8,26],[1.8,2.3,18.6],[9.8,6.3,19.6],[.7,2.7,15.8]),
 view(T.lane,[4.8,3.8,10],[1.2,2.45,6.2],[4.2,3.2,9],[1.2,2.45,6.2]),
 view(T.correlate,[18,11,25],[5.5,1,11],[19,14,27],[5.5,1,12]),
 view(T.bollardsUp,[16,8,19],[5.5,1,9.5],[17,11,21],[5.5,1,10]),
 view(T.stopped,[9,4.3,6],[5.35,2,9.9],[8.4,3.7,6.3],[5.35,2,9.8]),
 view(T.decide,[20,12,24],[7.5,1.5,10],[21,16,28],[7.5,1.5,11]),
 view(T.respond,[16.6,3.6,11.7],[14.1,2,7.55],[16.2,3.5,11],[14.1,2,7.5]),
 view(T.local,[16.6,3.6,11.7],[14.1,2,7.55],[16.2,3.5,11],[14.1,2,7.5],false),
 view(38,[24,11,23],[13,1.3,8],[25,16,26],[13,1.3,8]),
 view(T.guardReady,[14,4.3,13],[9.9,1.3,7.6],[14,5.5,14],[10,1.3,7.7]),
 view(T.reverse,[22,15,33],[7,1.4,17],[23,20,36],[7.2,1.5,18]),
 view(T.reverseMiddle,[23,14,36],[8.4,1.5,22],[23,20,39],[8.4,1.5,22]),
 view(T.reverseSecond,[23,14,36],[8.4,1.5,22],[23,20,39],[8.4,1.5,22],false),
 view(T.parked,[23,13,39],[10,1.3,24],[24,17,42],[10,1.4,24]),
 view(T.resolve,[27,20,37],[9,1.5,15],[28,25,41],[10,1.5,16]),
 view(68,[14,4.2,12],[10,1.3,7.3],[13.5,4.4,12],[9.9,1.35,7.3]),
 view(T.checked,[16,3.5,11.3],[14.05,2.2,7.3],[15.7,3.4,10.8],[14.05,2.2,7.25]),
 view(76,[32,24,41],[6,1.5,10],[30,28,43],[9,1.5,14]),
 view(T.end,[32,24,41],[6,1.5,10],[30,28,43],[9,1.5,14],false),
 ],
 beats:[
 {id:'detect',at:T.detect,title:'The truck closes on the stop line',body:'The fictional red-team driver accelerates toward the restricted approach. The fixed radar contributes motion and distance; the camera supplies a separate view.',evidence:[{kind:'observed',source:'Approach radar',detail:'An approaching vehicle accelerates toward the marked stopping position.'}],subevents:[
 {id:'stop-crossed',at:T.crossed,title:'Past the outer instruction',body:'The truck passes STOP without waiting. The secure inner gate remains closed; the open apron is not containment.',evidence:[{kind:'observed',source:'Fixed gate camera',detail:'The truck crosses the outer stopping line and continues toward the inner boundary.'}]},
 {id:'commands-rejected',at:T.anomaly,title:'A separate control anomaly',body:'The local access controller rejects unauthorized open commands. This record is independent of the truck observation.',evidence:[{kind:'observed',source:'Local access controller · illustrative',detail:'Remote open requests rejected; closed gate contact unchanged.'},{kind:'uncertainty',source:'Attribution',detail:'The controller record does not establish that the driver sent these commands.'}]}]},
 {id:'verify',at:T.verify,title:'Observe the approach; check the controller',body:'The fixed camera confirms continued approach. The panel radar contributes the approaching track. The local controller independently reports rejection, rather than a successful opening.',evidence:[{kind:'observed',source:'Camera + fixed-panel radar',detail:'A moving truck occupies the authored approach sector. No plate, face or intent recognition is claimed.'},{kind:'observed',source:'Gate contact',detail:'Closed.'}],subevents:[
 {id:'camera-view',at:16,title:'A fixed camera sees the approach',body:'The lens is aimed down the approach. Its contribution is the visible truck and boundary crossing, not the driver’s identity or intent.',evidence:[{kind:'observed',source:'Fixed gate camera',detail:'Truck continues along the restricted approach.'}]},
 {id:'radar-view',at:18,title:'A fixed panel contributes the track',body:'The aimed panel radar independently contributes the moving approach track. Its illustration does not require a rotating scanner or claim calibrated range.',evidence:[{kind:'observed',source:'Approach radar',detail:'Approaching truck remains in the authored sector.'}]},
 {id:'lane-presence',at:T.lane,title:'Presence in the inner approach',body:'The ground loop indicates lane presence while the gate contact stays closed. These are different physical states.',evidence:[{kind:'observed',source:'Lane detector + gate contact',detail:'Approach occupied; gate closed. The controller continues to reject open requests.'}]}]},
 {id:'correlate',at:T.correlate,title:'Hold the inner access',body:'Proposed on-site correlation groups the relevant approach and controller records. A preauthorized access hold raises the inner bollards while their swept lane is empty; the truck brakes.',evidence:[{kind:'correlation',source:'Proposed local correlation',detail:'Related place and time group physical and control evidence; this is not proof of a common source.'},{kind:'response',source:'Preauthorized access policy',detail:'Inner bollard hold begins with the lift area empty. Gate remains closed.'}],subevents:[
 {id:'inner-secured',at:T.bollardsUp,title:'Bollards up before arrival',body:'The bollards reach full height before the truck reaches them. The protected inner lane remains closed.',evidence:[{kind:'response',source:'Inner-access state',detail:'Bollards raised; gate closed; no vehicle above the moving mechanisms.'}]},
 {id:'truck-braked',at:T.stopped,title:'The truck stops short',body:'The driver brakes to a stop before the raised bollards. The driver remains at the controls; nobody enters the truck’s path.',evidence:[{kind:'observed',source:'Camera + lane presence',detail:'Truck stationary outside the protected inner boundary.'}]}]},
 {id:'decide',at:T.decide,title:'Keep the boundary; verify locally',body:'Hold vehicle access, isolate remote gate commands and verify locally. The proposed isolation affects the local command path; cooling and site power continue.',action:'Hold access and verify locally',evidence:[{kind:'observed',source:'Current access state',detail:'Truck stopped; inner gate closed and bollards raised.'},{kind:'uncertainty',source:'Investigation',detail:'Vehicle authorization and the source of the rejected commands remain under review.'}]},
 {id:'respond',at:T.respond,title:'An operator takes local authority',body:'After the human decision, the local operator uses the physical console. The guard moves to the protected inspection point and staff move behind the inner boundary.',evidence:[{kind:'response',source:'Authorized local response',detail:'Operator begins the local-only command-path change; the guard and staff stay on protected paths.'}],subevents:[
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
