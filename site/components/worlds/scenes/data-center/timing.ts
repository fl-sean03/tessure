/** Fictional illustration seconds; shared by physical state and narrative, never measured latency. */
export const T = { detect:6, crossed:10, anomaly:12, verify:15, lane:20, correlate:24, bollardsUp:26, stopped:29, decide:31, respond:33, local:36, guardStart:36, guardReady:44, reverse:46, reverseMiddle:53, reverseSecond:55, parked:63, wheelsSettled:65, resolve:66, checked:72, end:82 } as const
export const controllerState=(t:number)=>t>=T.checked?'CHECK COMPLETE':t>=T.local?'LOCAL ONLY':t>=T.anomaly?'OPEN REJECTED':'REMOTE ENABLED'
export const gateContact=()=> 'CLOSED'
export const laneOccupied=(z:number)=>z-3.5<=18&&z+3.5>=14
