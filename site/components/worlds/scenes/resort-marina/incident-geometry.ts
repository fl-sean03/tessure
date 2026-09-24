import { CylinderGeometry, SphereGeometry } from 'three'
import { assembly, batchParts, type Materials } from './geometry'
export function makeIncidentSite(m:Materials,high:boolean){const a=assembly(m,high)
 // A continuous public promenade reaches the service entrance; all response feet share this deck.
 a.box([5.3,.75,-.3],[13.4,.74,3.2],'stone',.05)
 a.box([12.35,.75,-.3],[1.3,.74,3.2],'stone',.03)
 for(let x=-1.2;x<12;x+=.65)a.box([x,1.095,-.3],[.62,.05,3.1],'sand',.01)
 for(const x of[8,12])for(const z of[-1.7,1.1]){a.cylinder([x,1.73,z],.075,1.22,'steel');a.box([x,1.17,z],[.25,.1,.25],'dark',.02)}
 // Restricted edge rail leaves the controlled gangway opening clear.
 for(const z of[-3.1,2.4]){a.beam([12,1.7,z],[12,1.7,z<0?-1.75:1.15],.055,'steel');a.cylinder([12,1.7,z],.055,1.16,'steel')}
 for(const x of[12.5,22]){a.cylinder([x,.25,16],.52,.5,'amber',[0,0,0],.3);a.cylinder([x,.85,16],.07,.7,'ivory');a.box([x,1.4,16],[.8,.62,.07],'amber',.035)}
 // Warning/control fixture, on the staff side of the service gate.
 a.cylinder([10.5,2.45,-1.35],.07,2.66,'steel');a.box([10.5,2.35,-1.35],[1.14,.82,.28],'dark',.05)
 a.cylinder([10.5,3.68,-1.35],.18,.17,'steel');a.cylinder([10.5,3.52,-1.03],.24,.4,'ivory',[Math.PI/2,0,0],.13);a.cylinder([10.5,3.52,-.81],.18,.02,'dark',[Math.PI/2,0,0])
 // Sign boards are physical and layer-independent; labels are placed by the scene.
 for(const [x,y,z,w]of[[14.2,2.55,-1.7,2.8],[5.5,2.25,-1.7,2.6]]){a.box([x,y,z],[w,.72,.12],'dark',.04);a.cylinder([x,y-.63,z],.04,.7,'steel')}
 return a.finish()}
export function makeGate(m:Materials,high:boolean,publicRoute=false){const a=assembly(m,high)
 for(const y of[.35,1.08])a.beam([0,y,0],[0,y,2.8],.048,'steel')
 for(let z=.05;z<2.8;z+=.35)a.beam([0,.35,z],[0,1.08,z],.026,'steel')
 a.box([0,.68,1.4],[.1,.47,2.5],publicRoute?'teal':'amber',.025)
 for(const y of[.32,.98])a.cylinder([0,y,0],.085,.17,'dark')
 a.box([.08,.9,2.58],[.13,.05,.23],'dark',.02)
 return high ? a.finish() : batchParts(a.finish(),m)}
export function makeAircraft(m:Materials,high:boolean){const a=assembly(m,high)
 a.cylinder([0,-.21,.25],.055,.2,'steel'); // Fixed stem overlaps airframe and spherical gimbal through its full aim.
 a.box([0,0,0],[.65,.27,.9],'dark',.11);a.box([0,.15,-.06],[.47,.09,.57],'burgundy',.04)
 for(const x of[-.75,.75])for(const z of[-.65,.65]){a.beam([x*.2,0,z*.25],[x,.04,z],.055,'dark');a.cylinder([x,.08,z],.13,.22,'steel');a.cylinder([x,.2,z],.08,.09,'dark');a.box([x,.045,z+.12],[.08,.04,.1],'ivory',.015)}
 for(const x of[-.28,.28]){a.beam([x,-.1,-.32],[x,-.42,-.32],.026,'steel');a.beam([x,-.1,.32],[x,-.42,.32],.026,'steel');a.beam([x,-.42,-.48],[x,-.42,.48],.028,'dark')}
 return high ? a.finish() : batchParts(a.finish(),m)}
export function makeRotor(m:Materials,high:boolean){const a=assembly(m,high);a.box([0,0,0],[.75,.018,.07],'dark',.025);a.cylinder([0,.015,0],.07,.05,'steel');return high ? a.finish() : batchParts(a.finish(),m)}
export function makeGimbal(m:Materials,high:boolean){const a=assembly(m,high);a.put(new SphereGeometry(.14,high?10:8,6),'dark',[0,0,0]);a.cylinder([0,0,.12],.085,.08,'glass',[Math.PI/2,0,0]);return high ? a.finish() : batchParts(a.finish(),m)}
export function makePassenger(m:Materials,high:boolean){const a=assembly(m,high)
 // Hip on forward bench, two feet on timber sole; anonymous fictional second occupant.
 a.box([-.05,1.32,1.61],[.35,.46,.25],'burgundy',.065);a.put(new SphereGeometry(.14,10,8),'skin',[-.05,1.69,1.61]);
 for(const x of[-.17,.07]){a.beam([x,1.1,1.58],[x,1.03,1.18],.065,'navy');a.beam([x,1.03,1.18],[x,.75,1.14],.06,'navy');a.box([x,.745,1.08],[.15,.09,.23],'dark',.025);a.beam([x+(x<0?-.12:.12),1.46,1.61],[x,1.14,1.3],.045,'skin')}
 return high ? a.finish() : batchParts(a.finish(),m)}
