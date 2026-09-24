import type { CameraKey, ScenarioVariant, SceneDefinition } from '../../contract'
import { T } from './incident'
const view=(at:number,position:[number,number,number],target:[number,number,number],mobilePosition=position,mobileTarget=target,cut=true,fov=42):CameraKey=>({at,position,target,mobilePosition,mobileTarget,cut,fov,easing:'smoother'})
export const incident:ScenarioVariant={
 id:'staff-passage-breach',label:'Breach during a crowd pinch',role:'primary',duration:T.end,
 lesson:'Separate a restricted-access incident from public crowd pressure. Correlate physical passages with access events, hold the inner boundary and coordinate security with stewards without closing public exits.',
 establishing:{title:'Two routes beside an evening performance',body:'Authored red-team simulation. A teal-clad stage worker approaches the staff entrance; an orange-clad intruder follows. Yellow-clad stewards manage public arrivals and returns on the adjacent concourse. Blue-clad security staffs the inner boundary and public-side checkpoint. These are fictional roles, not identities inferred by sensing.',evidence:[{kind:'uncertainty',source:'Authored scenario',detail:'Roles and intent are scripted ground truth. Public-flow observations remain anonymous.'}]},
 poster:'/worlds/event-overlay/poster.webp',posterAlt:'Violet evening amphitheatre with a restricted staff passage beside two public streams, a staffed checkpoint and separate timber relief route.',
 cameras:[
 view(0,[33,30,41],[0,1,3],[24,29,38],[1,1,5]),
 view(4,[15,9,20],[7,1,8.4],[13,8,17],[7,1.1,8.4]),
 view(T.detect,[12.5,5.4,15.7],[6.8,1.1,8.6],[11.4,5.4,14.8],[6.9,1.1,8.5]),
 view(11,[12.5,5.4,15.7],[6.8,1.1,8.6],[11.4,5.4,14.8],[6.9,1.1,8.5],false),
 view(14,[12.5,6.5,14.7],[7,1,6.8],[11.7,6.3,14.3],[7,1.1,7.2],false),
 view(T.verify,[14,10,16],[7.3,1.4,6.5],[13.5,9.7,16],[7.3,1.4,6.5]),
 view(22,[14,7,10],[7.5,1.2,2.8],[14.5,9.5,12.5],[8.4,1.9,3]),
 view(T.correlate,[14.5,7.5,8],[8,1.2,2.4],[13.3,7.5,8.4],[8,1.3,2.4]),
 view(T.decide,[22,18,29],[2,1,9],[15,21,30],[2,1,10]),
 view(T.respond,[13.5,6.4,9],[7.3,1.2,2.7],[12.4,6.4,9],[7.3,1.2,2.7]),
 view(37.8,[13.5,6.4,9],[7.3,1.2,2.7],[12.4,6.4,9],[7.3,1.2,2.7],false),
 view(38.5,[.5,7.6,23],[-6.9,1,14.5],[-.8,7.1,22],[-6.9,1.1,14.5]),
 view(T.reliefReady,[.5,7.6,23],[-6.9,1,14.5],[-.8,7.1,22],[-6.9,1.1,14.5],false),
 view(T.stopView,[1,7.5,10],[7.3,1,4],[1,7,10],[7.3,1.1,4]),
 view(51,[1.3,8,15],[7.4,1,7.6],[1.3,8,15],[7.4,1.1,7.6],false),
 view(55,[4,13,26],[-3,1,13.5],[2,12,23],[-4,1.1,13.8]),
 view(61,[17.5,7.1,15.5],[10.8,1.2,8.1],[17,7.2,15.5],[10.8,1.2,8.1]),
 view(T.checkpoint,[17.5,7.1,15.5],[10.8,1.2,8.1],[17,7.2,15.5],[10.8,1.2,8.1],false),
 view(T.resolve,[24,20,32],[2,1,9],[16,22,32],[2,1,10]),
 view(75,[12,13,25],[5,1,13],[12,14,25],[5,1,13]),
 view(82,[17.5,7.1,15.5],[10.8,1.2,8.1],[17,7.2,15.5],[10.8,1.2,8.1]),
 view(T.end,[25,23,35],[1,1,8],[18,24,35],[2,1,10]),
 ],
 beats:[
 {id:'detect',at:T.detect,title:'One credential, an open staff passage',body:'The authorized worker presents a credential. One access permission opens the staff gate. The orange-clad intruder waits directly behind, separate from the public streams.',evidence:[{kind:'observed',source:'Staff reader · illustrative record',detail:'One permitted entry event, followed by the opening contact.'}],subevents:[
 {id:'passage-open',at:T.entryClear,title:'The permitted opening is clear',body:'The staff leaf is fully open. The worker begins passing through; the intruder remains outside and has no separate credential event.',evidence:[{kind:'observed',source:'Reader + gate contact',detail:'One permitted opening, now fully clear.'}]},
 {id:'second-crossing',at:T.secondPassage,title:'A second person crosses',body:'After the worker passes, the intruder follows through the same opening without another access event and continues beyond the restricted line. Public arrivals and returns slow independently at the adjacent pinch.',evidence:[{kind:'observed',source:'C1 · Staff passage',detail:'Two physical passages through one opening; no face identification.'},{kind:'observed',source:'Reader/contact records',detail:'One permitted opening; no second credential event in this script.'}]}]},
 {id:'verify',at:T.verify,title:'Continue the track; keep crowd pressure separate',body:'C1 observes the entrance crossing. C2 observes continued movement toward backstage. The permitted worker proceeds to the equipment apron while the intruder remains in the approach corridor. Opposing public flows have stopped at the nearby pinch.',evidence:[{kind:'observed',source:'C1 + C2 fixed views',detail:'Entrance passage and backstage approach are separate, partial views.'},{kind:'observed',source:'Anonymous public-flow observation',detail:'Two public directions slow at the adjacent concourse; no density estimate or individual identity.'},{kind:'uncertainty',source:'Coverage limits',detail:'Illustrative sectors are partial; fencing, equipment and other people can obscure a view.'}]},
 {id:'correlate',at:T.correlate,title:'Access mismatch beside public pressure',body:'Proposed local correlation links the second crossing, single permission and continued backstage approach. The controller raises a review cue and holds new inner-access permissions by site policy. The intruder pauses short of the inner boundary. Public exits stay usable.',evidence:[{kind:'correlation',source:'Proposed local controller',detail:'One permission + second physical crossing + continued approach form one reviewable incident.'},{kind:'response',source:'Preauthorized access policy',detail:'New inner-access release is held pending staff verification; the public outlet is unchanged.'},{kind:'uncertainty',source:'Investigation',detail:'Intent is authored ground truth, not an inference from clothing or camera appearance.'}]},
 {id:'decide',at:T.decide,title:'Protect backstage and open the relief route',body:'Security will secure the clear inner gate and guide the intruder to the public-side checkpoint. Stewards will turn the sign, open the separate relief gate and split public flow. The two responses have different purposes.',action:'Protect backstage and open the relief route',evidence:[{kind:'observed',source:'Current physical state',detail:'Intruder short of equipment; public streams held at the pinch; relief gate still closed.'},{kind:'uncertainty',source:'Human review',detail:'Staff must verify access authority. The illustration does not establish guilt or a safety-performance result.'}]},
 {id:'respond',at:T.respond,title:'Two teams, two controlled actions',body:'After approval, security secures the clear inner staff gate through the local controller and approaches the stopped intruder. Both stewards move to the public relief entrance. No gate closes across a person and no public exit is locked.',evidence:[{kind:'response',source:'Authorized response',detail:'Inner staff gate closes in a clear opening; security and stewards take separate positions.'}],subevents:[
 {id:'inner-secured',at:T.innerClosed,title:'The inner boundary is secured',body:'The inner gate finishes closing behind the security officer. The worker remains on the equipment side. The intruder is on the approach side, short of both officer and gate.',evidence:[{kind:'observed',source:'Inner gate/contact',detail:'Closed inner boundary; no person in its swept opening.'}]},
 {id:'hands-on-relief',at:T.signStart,title:'Stewards operate the public route',body:'One steward grips the sign crank; the second reaches the relief-gate crank. The sign post and weighted base stay planted as its head turns. The relief leaf swings into the unused verge before public flow resumes.',evidence:[{kind:'response',source:'Steward actions',detail:'Visible hand contact turns the sign head and the geared relief-gate crank; public streams still held.'}]},
 {id:'relief-open',at:T.reliefReady,title:'The alternative opens before arrivals move',body:'The gate is fully open and the sign points toward the timber frontage. Arrivals behind the steward begin taking the relief route while returning visitors keep the concourse. Stewards guide the split.',evidence:[{kind:'response',source:'Public route',detail:'Gate clear and wayfinding turned before redirected foot traffic starts.'}]},
 {id:'security-stop',at:T.stopView,title:'Security gives a clear stop signal',body:'With the inner gate closed, the officer signals the stopped intruder before guiding a return to the staffed checkpoint. Stewards have opened the separate public relief route.',evidence:[{kind:'response',source:'Security officer',detail:'A visible stop hand reinforces the restricted boundary before the officer leads the return.'}]},
 {id:'security-guidance',at:T.escort,title:'Security directs a return to the checkpoint',body:'After a visible stop signal, the officer leads back along the staff passage. The intruder turns, follows and exits to the staffed public-side checkpoint. The inner boundary remains closed.',evidence:[{kind:'response',source:'Security direction',detail:'Two distinct actors walk out along the staff corridor; no forced detention or automated identity claim.'}]},
 {id:'checkpoint-reached',at:T.checkpoint,title:'At the staffed checkpoint',body:'The intruder stops beside the officer and checkpoint attendant. The worker stays on the restricted equipment apron. Public relief continues separately.',evidence:[{kind:'observed',source:'Checkpoint + inner boundary',detail:'Intruder at checkpoint, inner gate closed, equipment not reached by the intruder in this script.'}]}]},
 {id:'resolve',at:T.resolve,title:'Backstage protected; public routes separate',body:'In this authored outcome, the breach has been interrupted before the intruder reaches restricted equipment. Security stays at the staffed checkpoint. Arrivals use the timber relief route and returns use the concourse, visibly clearing the earlier opposing-flow pinch.',evidence:[{kind:'observed',source:'Physical outcome',detail:'Intruder at checkpoint; inner boundary closed; separate public streams moving.'},{kind:'correlation',source:'Illustrative incident record',detail:'Access discrepancy, complementary camera observations, human decision and steward actions remain separately attributed.'},{kind:'uncertainty',source:'Limits',detail:'No identity, calibrated coverage, density percentage, injury or measured prevention claim.'}]},
 ],fallbackStills:[],
}
const states=[{id:'establish',at:0,title:incident.establishing.title},...incident.beats.flatMap(b=>[{id:b.id,at:b.at,title:b.title},...(b.subevents||[])])]
incident.fallbackStills=states.map(s=>({state:s.id,at:s.at,src:`/worlds/event-overlay/incident-${s.id}.webp`,alt:`Authored event-access incident at ${s.at} illustration seconds: ${s.title}.`}))
export const definition:SceneDefinition={id:'event-overlay',number:'04',name:'Event overlay',subtitle:'Protect backstage. Keep public routes open.',description:'A restricted-access breach coincides with a crowd pinch. Independent observations lead to a secured inner boundary, security guidance and steward-operated public relief.',setting:'Lawn amphitheatre · violet evening',poster:incident.poster,posterAlt:incident.posterAlt,
  palette: {
    background: '#56516b', fog: '#69627a', fogNear: 75, fogFar: 165,
    ambient: 0.34, sun: '#d9c3e6', sunIntensity: 1.65, sunPosition: [-24, 30, 18],
    hemisphereSky: '#b7afeb', hemisphereGround: '#4b364b', hemisphereIntensity: 1.2,
    exposure: 1.14, toneMapping: 'aces',
    shadowBounds: { left: -33, right: 33, top: 30, bottom: -28, near: 1, far: 100, bias: -0.00025, normalBias: 0.035, mapSize: 2048 },
  },
  practicalLightLimit: 3,
 defaultScenario:incident.id,scenarios:[incident],
}
