import { builder, type Materials } from './model'
import type { Device } from './devices'
import { garden } from './incident-motion'
export const incidentDevices:Device[]=[
 {id:'camera',position:[-6.85,2.3,1.83],mount:[-6.85,2.45,1.445],target:[-3,1.05,7.2],near:5,far:9.4,halfAngle:.56},
 {id:'thermal',position:[.02,3.35,2.64],mount:[.02,3.42,2.415],target:[-2,1.25,6.5],near:5,far:9.4,halfAngle:1.04},
]
export function incidentSite(m:Materials){
 const b=builder(m)
 // A graded lower garden. Flat landing surfaces and gravel courses are real geometry.
 b.box([-2.1,.129,7],[17.1,.178,9.7],'grass')
 b.box([-6.6,.13,2.9],[3.4,.18,2.2],'gravel')
 b.box([-2.35,.216,7.55],[8.5,.008,3.55],'gravel')
 b.box([.25,.216,5.75],[9.6,.008,1.15],'gravel')
 b.box([-2.8,.216,3.75],[9.9,.008,.64],'gravel')
 b.box([-4.4,.216,10.45],[2,.008,2.85],'gravel')
 // Dry-stone boundary and distinct coping: the crossed wall continues through the frame.
 for(let i=0;i<24;i++){const x=-10.5+i*.7;for(let row=0;row<3;row++)b.box([x+(row%2?.18:0),.33+row*.19,garden.wallZ],[.66,.177,.34],'stone2',.028)}
 b.box([-2.35,.829,garden.wallZ],[17.05,.062,.38],'coping',.025)
 // Protected lower service path: guard remains on the home side of this fixed rail.
 for(let x=-5.65;x<2.1;x+=.75)b.box([x,.80,4.22],[.05,1.16,.05],'metal',.015)
 for(const y of[.66,1.36])b.beam([-5.65,y,4.22],[2.05,y,4.22],.035,'metal',.035,10)
 // Guard shelter is attached to the service outbuilding, with a clear exit around its post.
 b.box([-7.6,2.47,2.25],[2.3,.10,1.8],'roof',.025)
 for(const x of[-8.67,-6.53])b.box([x,1.32,3.08],[.075,2.2,.075],'wood')
 b.box([-8.8,.52,2.15],[.45,.65,.52],'wood',.04)
 // Separate hinged inner gate at the foot of the terrace stair.
 for(const x of[3.13,4.87])b.box([x,.94,garden.innerGateZ],[.12,1.44,.14],'stone2',.035)
 // Room shutter rail and jambs surround the resident's actual clear doorway.
 for(const x of[2.70,4.24])b.box([x,2.65,-.105],[.06,2.70,.13],'metal',.02)
 b.box([4.1,4.025,-.105],[3.0,.10,.18],'metal',.025)
 // A perimeter zone head on the coping, with its visible status LED authored separately.
 b.box([-3.45,.95,8.5],[.18,.20,.18],'metal',.03)
 b.box([-3.45,1.0,8.62],[.12,.065,.018],'dark')
 b.box([garden.crossX,.861,garden.wallZ],[1.25,.002,.38],'metal')
 b.beam([-3.775,.864,8.5],[-3.45,.89,8.5],.008,'dark',.008,6)
 // Four path luminaires; emission is switched by the correlated policy state.
 for(const x of[-4.4,-1.6,1.2,5.6]){b.box([x,.44,4.9],[.12,.44,.12],'metal',.025);b.box([x,.66,4.9],[.18,.025,.18],'dark')}
 return b.finish()
}
export function gateModel(m:Materials){const b=builder(m);for(const y of[.14,1.11])b.box([.80,y,0],[1.60,.065,.055],'metal');for(let x=.08;x<1.6;x+=.16)b.box([x,.625,0],[.027,.94,.027],'metal');b.box([1.50,.68,.035],[.08,.12,.03],'wood2');return b.finish()}
export function shutterModel(m:Materials){const b=builder(m);for(const x of[-.7,.7])b.box([x,1.27,0],[.045,2.54,.06],'metal');for(let y=.055;y<2.54;y+=.115)b.box([0,y,0],[1.39,.092,.065],'wood',.015);b.box([-.56,1.15,.058],[.03,.21,.04],'metal');return b.finish()}
