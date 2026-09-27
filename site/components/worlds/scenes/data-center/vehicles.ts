import { clamp, progress } from '../../math'
import { T } from './timing'

/** Authored metres, +Y up, vehicle forward -Z. Pose is referenced to the rear axle. */
export const roadY = .13
export const vehicleSpec = (small = false) => ({
  radius: small ? .43 : .51, halfTrack: (small ? 2.1 : 2.42) * .48,
  frontZ: small ? -1.5 : -2.3, rearZ: small ? 1.67 : 2.47,
  wheelbase: small ? 3.17 : 4.77,
})
export const wheelLayout = (small = false) => {
  const v = vehicleSpec(small)
  return [true, false].flatMap(front => [-1, 1].map(side => ({
    front, side, x: side * v.halfTrack, z: front ? v.frontZ : v.rearZ,
  })))
}
const wheels = wheelLayout(), truck = vehicleSpec()
const radius=9, angle=Math.PI/4
const smoother = (u: number) => u ** 3 * (10 + u * (-15 + 6 * u))
type Rear = { x: number; z: number; heading: number; curvature: number }
// Two reverse arcs, separated by a full stop to reverse steering. Rear-axle reference.
function reverseFirst(u:number):Rear { const h=u*angle;return{x:4.8+radius*(1-Math.cos(h)),z:12+truck.rearZ+radius*Math.sin(h),heading:h,curvature:-1/radius} }
function reverseSecond(u:number):Rear {const h=angle*(1-u),a=reverseFirst(1);return{x:a.x+radius*(Math.cos(h)-Math.cos(angle)),z:a.z+radius*(Math.sin(angle)-Math.sin(h)),heading:h,curvature:1/radius}}
function wheelPoint(p: Rear, x: number, z: number) {
  return [p.x + x * Math.cos(p.heading) + z * Math.sin(p.heading), p.z - x * Math.sin(p.heading) + z * Math.cos(p.heading)]
}
// Immutable arc-length tables, constructed once; no frame/delta integration or mutable travel state.
function table(path: (u: number) => Rear) {
  let previous = path(0), distance = 0
  const rolling = [0, 0, 0, 0], rows = [{ u: 0, distance, rolling: [...rolling] }]
  for (let i = 1; i <= 2048; i++) {
    const u = i / 2048, next = path(u)
    distance += Math.hypot(next.x - previous.x, next.z - previous.z)
    wheels.forEach((w, j) => {
      const a = wheelPoint(previous, w.x, w.front ? -truck.wheelbase : 0)
      const b = wheelPoint(next, w.x, w.front ? -truck.wheelbase : 0)
      const mid = path((i - .5) / 2048)
      const steer = w.front ? Math.atan2(truck.wheelbase * mid.curvature, 1 + w.x * mid.curvature) : 0
      const heading = mid.heading + steer
      const forward = -(b[0] - a[0]) * Math.sin(heading) - (b[1] - a[1]) * Math.cos(heading)
      rolling[j] += Math.sign(forward) * Math.hypot(b[0] - a[0], b[1] - a[1])
    })
    rows.push({ u, distance, rolling: [...rolling] }); previous = next
  }
  return rows
}
const firstTable=table(reverseFirst),secondTable=table(reverseSecond)
function sample(rows: ReturnType<typeof table>, distance: number) {
  const d = clamp(distance, 0, rows.at(-1)!.distance)
  let lo = 0, hi = rows.length - 1
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (rows[mid].distance <= d) lo = mid; else hi = mid }
  const a = rows[lo], b = rows[hi], u = (d - a.distance) / (b.distance - a.distance)
  return { u: a.u + (b.u - a.u) * u, rolling: a.rolling.map((v, i) => v + (b.rolling[i] - v) * u) }
}
type Key = [time: number, distance: number, velocity: number]
/** Quintic Hermite distance: prescribed positive velocities, zero acceleration at every join. */
function travel(t: number, keys: Key[]) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const [a, s0, v0] = keys[i - 1], [b, s1, v1] = keys[i], h = b - a, u = (t - a) / h
    const d = s1 - s0 - v0 * h, v = (v1 - v0) * h
    return s0 + v0 * h * u + (10 * d - 4 * v) * u ** 3 + (-15 * d + 7 * v) * u ** 4 + (6 * d - 3 * v) * u ** 5
  }
  return keys.at(-1)![1]
}
const truckKeys:Key[]=[[0,0,0],[T.detect,2.5,.7],[T.crossed,6.5,1.3],[T.verify,12,1],[T.correlate,17,.6],[T.stopped,21,0]]
export function vehiclePose(t:number,small=false){
 if(small){const s=15*smoother(progress(t,0,T.detect));return{x:4.8,z:-4-s,heading:0,rearX:4.8,rearZ:-4-s+1.67,wheels:[0,1,2,3].map(()=>({steer:0,roll:-s/.43,distance:s}))}}
 const forward=travel(t,truckKeys);let p:Rear={x:4.8,z:33+truck.rearZ-forward,heading:0,curvature:0},distances=[forward,forward,forward,forward],curvature=0
 if(t>=T.guardReady){
  const second=t>=T.reverseMiddle,rows=second?secondTable:firstTable
  const u=smoother(progress(t,second?T.reverseSecond:T.reverse,second?T.parked:T.reverseMiddle)),a=sample(rows,rows.at(-1)!.distance*u)
  p=(second?reverseSecond:reverseFirst)(a.u);distances=a.rolling.map((d,i)=>21+d+(second?firstTable.at(-1)!.rolling[i]:0))
  curvature=second?(-1+2*smoother(progress(t,T.reverseMiddle,T.reverseSecond)))/radius:-smoother(progress(t,T.guardReady,T.reverse))/radius
  curvature*=1-smoother(progress(t,T.parked,T.wheelsSettled))
 }
 return{x:p.x-truck.rearZ*Math.sin(p.heading),z:p.z-truck.rearZ*Math.cos(p.heading),heading:p.heading,rearX:p.x,rearZ:p.z,
  wheels:wheels.map((w,i)=>({steer:w.front?Math.atan2(truck.wheelbase*curvature,1+w.x*curvature):0,roll:-distances[i]/truck.radius,distance:distances[i]}))}
}
