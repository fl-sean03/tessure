import type { Vec3 } from '../../contract'
import { mix, progress, smooth } from '../../math'
import { makeWalkingPath, smoothMinimum, smoother, solveTwoBone, walkingDistance } from '../../kinematics'

export const walkerRig = { upper: .39, lower: .39, hipY: .83, hipWidth: .115, ankleY: .075, reach: .772 }
export type FootPose = { position: Vec3; yaw: number; planted: boolean }
function landing(p: Vec3, yaw: number, side: number): FootPose {
  const lateral = side ? .12 : -.12
  return { position: [p[0] + Math.cos(yaw) * lateral, p[1], p[2] - Math.sin(yaw) * lateral], yaw, planted: true }
}
export function makeWalker(positions: [number, number, number, number][], start: number, end: number, turning = false) {
  const [x, y, z, yaw] = positions[0], initial: [FootPose, FootPose] = [landing([x, y, z], yaw, 0), landing([x, y, z], yaw, 1)]
  const landings = positions.slice(1).map(([x, y, z, yaw], i) => ({ ...landing([x, y, z], yaw, i % 2), side: i % 2 }))
  const pairs: [FootPose, FootPose][] = [initial]
  for (const step of landings) { const pair = [...pairs.at(-1)!] as [FootPose, FootPose]; pair[step.side] = step; pairs.push(pair) }
  const centers = pairs.map(pair => pair[0].position.map((v, i) => (v + pair[1].position[i]) / 2) as Vec3)
  const round = (points: Vec3[]) => points.map((p, i) => i === 0 || i === points.length - 1 ? p : p.map((v, j) => .25 * points[i - 1][j] + .5 * v + .25 * points[i + 1][j]) as Vec3)
  const path = makeWalkingPath(round(round(centers))), distanceAt = (t: number) => walkingDistance(t, start, end, path.length, .65)
  function timeAt(distance: number) { let lo = start, hi = end; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (distanceAt(m) < distance) lo = m; else hi = m } return (lo + hi) / 2 }
  const times = path.knots.map((d, i) => turning ? mix(start, end, i / (path.knots.length - 1)) : i === 0 ? start : i === path.knots.length - 1 ? end : timeAt(d))
  const footfalls = landings.map((step, i) => ({ ...step, from: times[i], to: times[i + 1] }))
  function foot(side: number, time: number): FootPose {
    let previous = initial[side]
    for (const step of footfalls) {
      if (step.side !== side) continue
      if (time <= step.from) return previous
      if (time >= step.to) { previous = step; continue }
      const phase = progress(time, step.from, step.to)
      if (phase <= .08) return previous
      if (phase >= .92) return step
      const u = progress(phase, .08, .92), travel = smoother(u)
      return { position: [mix(previous.position[0], step.position[0], travel), mix(previous.position[1], step.position[1], travel) + .085 * Math.sin(Math.PI * u) ** 2, mix(previous.position[2], step.position[2], travel)], yaw: mix(previous.yaw, step.yaw, travel), planted: false }
    }
    return previous
  }
  const headings = pairs.map(pair => (pair[0].yaw + pair[1].yaw) / 2)
  function hipAt(p: Vec3, yaw: number, side: number): Vec3 { const x = side ? walkerRig.hipWidth : -walkerRig.hipWidth; return [p[0] + Math.cos(yaw) * x, p[1] + walkerRig.hipY, p[2] - Math.sin(yaw) * x] }
  function limit(p: Vec3, yaw: number, feet: FootPose[]) {
    const h = feet.map((f, side) => { const hip = hipAt(p, yaw, side), d = Math.hypot(hip[0] - f.position[0], hip[2] - f.position[2]); return f.position[1] + walkerRig.ankleY + Math.sqrt(Math.max(0, walkerRig.reach ** 2 - d ** 2)) - walkerRig.hipY })
    return smoothMinimum(h[0], h[1])
  }
  function pose(time: number) {
    let shot = path.sample(distanceAt(time))
    if (turning) { const phase = progress(time, start, end) * (centers.length - 1), segment = Math.min(centers.length - 2, Math.floor(phase)), u = phase - segment; shot = { ...shot, segment, u, position: centers[segment].map((v, i) => mix(v, centers[segment + 1][i], smoother(u))) as Vec3 } }
    const feet = [foot(0, time), foot(1, time)], position = [...shot.position] as Vec3
    const yaw = mix(headings[shot.segment], headings[shot.segment + 1], smoother(shot.u))
    position[1] = smoothMinimum(position[1] - .035 + .009 * Math.sin(Math.PI * shot.u) ** 2, limit(position, yaw, feet))
    const pole: Vec3 = [Math.sin(yaw), 0, Math.cos(yaw)]
    const legs = feet.map((f, side) => solveTwoBone(hipAt(position, yaw, side), [f.position[0], f.position[1] + walkerRig.ankleY, f.position[2]], pole, walkerRig.upper, walkerRig.lower))
    const forward = (f: FootPose) => (f.position[0] - position[0]) * Math.sin(yaw) + (f.position[2] - position[2]) * Math.cos(yaw)
    return { position, yaw, feet, legs, armSwing: (forward(feet[1]) - forward(feet[0])) * .55, signal: smooth(progress(time, end, end + 1.5)) }
  }
  return { pose, footfalls, initial, start, end, path }
}

export type Walk = ReturnType<typeof makeWalker>
export function route(points:[number,number,number][],height:number,start:number,end:number):Walk {
 const steps:[number,number,number,number][]=[]
 for(let i=0;i<points.length;i++){const[x,z,yaw]=points[i];if(!i){steps.push([x,height,z,yaw]);continue}const a=points[i-1],n=Math.max(2,Math.ceil(Math.hypot(x-a[0],z-a[1])/.34));for(let j=1;j<=n;j++)steps.push([mix(a[0],x,j/n),height,mix(a[1],z,j/n),mix(a[2],yaw,j/n)])}
 steps.push([...steps.at(-1)!]);return makeWalker(steps,start,end)
}

function turnAt(x:number,z:number,from:number,to:number,start:number,end:number){const steps:[number,number,number,number][]=[];for(let i=0;i<=8;i++)steps.push([x,1.12,z,mix(from,to,i/8)]);steps.push([...steps.at(-1)!]);return makeWalker(steps,start,end,true)}
const staffOut=route([[14.4,.1,-Math.PI/2],[10.5,.1,-Math.PI/2],[10.5,-.45,-Math.PI]],1.12,36,41)
const staffTurn=turnAt(10.5,-.45,-Math.PI,-Math.PI*1.5,75,77)
const staffCheck=route([[10.5,-.45,-Math.PI*1.5],[11,-.45,-Math.PI*1.5]],1.12,77,81)
export const attendantWalk={...staffOut,pose:(t:number)=>{const p=(t<75?staffOut:t<77?staffTurn:staffCheck).pose(t);return{...p,signal:smooth(progress(t,41,42))*(1-smooth(progress(t,74,75)))}}}
function visitor(x:number,z:number,turnStart:number){const normal=route([[x,z,Math.PI/2],[x+4,z,Math.PI/2]],1.12,0,9),backTurn=turnAt(x+4,z,Math.PI/2,Math.PI*1.5,turnStart,turnStart+3),back=route([[x+4,z,Math.PI*1.5],[x,z,Math.PI*1.5]],1.12,turnStart+3,47),resumeTurn=turnAt(x,z,Math.PI*1.5,Math.PI*.5,87,89),resume=route([[x,z,Math.PI/2],[x+3,z,Math.PI/2]],1.12,89,94);return{...normal,pose:(t:number)=>(t<turnStart?normal:t<turnStart+3?backTurn:t<87?back:t<89?resumeTurn:resume).pose(t)}}
export const guestWalk=visitor(3,-.8,38)
export const companionWalk=visitor(1.2,.15,39)
