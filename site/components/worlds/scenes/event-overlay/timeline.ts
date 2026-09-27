import type { CameraKey } from '../../contract'
import { sampleCamera } from '../../math'
import { T } from './incident'

// One monotone clock keeps every tested physical relationship intact. The story
// gives review, hand operation and camera travel time without a viewer gate.
export const timeMap: [number, number][] = [
  [0,0],[1,1],[26,26],[27,27],[32,34],[38,34.2],
  [40,37],[44,38.5],[44.9,39.25],[45,39.3],[47,40],[53,41.3],
  [54,42.2],[59,42.5],[60,43],[61,44],[76,65],[79,68],[88,88],
]
const clockKeys:CameraKey[]=timeMap.map(([at,time])=>({at,position:[time,0,0],target:[0,0,0],interpolation:'pchip'}))
export const motionTime=(time:number)=>sampleCamera(clockKeys,time,false).position[0]
export function storyTime(physical:number){
  let low=0,high:number=T.end
  for(let i=0;i<48;i++){const mid=(low+high)/2;if(motionTime(mid)<physical)low=mid;else high=mid}
  // Narrative completion cues never precede the corresponding physical state.
  return Math.ceil((high-1e-8)*10)/10
}
export const storyT=Object.fromEntries(Object.entries(T).map(([key,time])=>[key,storyTime(time)])) as Record<keyof typeof T,number>
