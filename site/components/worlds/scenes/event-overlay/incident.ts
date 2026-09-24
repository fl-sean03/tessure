import { progress } from '../../math'
import { smoother } from '../../kinematics'
export const T={detect:7,readerOn:6.6,entryOpen:7.8,entryClear:9.4,workerStart:9.6,workerAt:21,intruderStart:12,intruderAt:26,secondPassage:16,verify:18,correlate:27,decide:34,respond:34.2,innerClose:35,innerClosed:37,guardAt:40,signAt:38.5,grasp:39.25,signStart:39.3,signEnd:41.3,reliefStart:39.3,reliefOpen:41.3,reliefReady:42.2,stopView:42.5,escort:44,checkpoint:65,resolve:68,end:88} as const
export const ids={signSteward:79,reliefSteward:80,worker:81,intruder:82,guard:83,attendant:84} as const
export const entryYaw=(t:number)=>Math.PI/2*smoother(progress(t,T.entryOpen,T.entryClear))
export const innerYaw=(t:number)=>Math.PI/2*(1-smoother(progress(t,T.innerClose,T.innerClosed)))
export const reliefYaw=(t:number)=>Math.PI/2*smoother(progress(t,T.reliefStart,T.reliefOpen))
