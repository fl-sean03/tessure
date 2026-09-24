/** Fictional playback seconds, shared by narration and the physical choreography. */
export const T = { detect:8, groundContact:18, controlDenied:19, verify:21, linkLoss:27, correlate:33, decide:43, respond:44, sheltered:62, innerSecured:64, groundWithdraw:66, groundGone:80, airClear:81, dockOpen:82, dockOpened:84, spool:84.2, lift:85.5, cruise:89, inspect:93, return:99, descend:104, landed:107, stopped:108.5, dockClose:109, dockClosed:111, linkReturn:112, resolve:115, end:124 } as const
export const inner = { hinge:[17.7,1.1,8.9] as [number,number,number],length:5.2,button:[13.85,1.65,6.912] as [number,number,number] }
export const controlState = (t:number) => t<T.controlDenied?0:t<T.correlate?1:t<T.innerSecured?2:3
export const connectionState = (t:number) => t<T.linkLoss?0:t<T.correlate?1:t<T.linkReturn?2:3
