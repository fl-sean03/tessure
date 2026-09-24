import type { Vec3 } from '../../contract'
import { mix, progress, smooth } from '../../math'
import { makeWalkingPath, smoothMinimum, smoother, solveTwoBone, walkingDistance } from '../../kinematics'

export const walkerRig = { upper: .39, lower: .39, hipY: .83, hipWidth: .115, ankleY: .075, reach: .772 }
export type FootPose = { position: Vec3; yaw: number; planted: boolean }
function landing(p: Vec3, yaw: number, side: number): FootPose {
  const lateral = side ? .12 : -.12
  return { position: [p[0] + Math.cos(yaw) * lateral, p[1], p[2] - Math.sin(yaw) * lateral], yaw, planted: true }
}
function makeWalker(positions: [number, number, number, number][], start: number, end: number) {
  const [x, y, z, yaw] = positions[0], initial: [FootPose, FootPose] = [landing([x, y, z], yaw, 0), landing([x, y, z], yaw, 1)]
  const landings = positions.slice(1).map(([x, y, z, yaw], i) => ({ ...landing([x, y, z], yaw, i % 2), side: i % 2 }))
  const pairs: [FootPose, FootPose][] = [initial]
  for (const step of landings) { const pair = [...pairs.at(-1)!] as [FootPose, FootPose]; pair[step.side] = step; pairs.push(pair) }
  const centers = pairs.map(pair => pair[0].position.map((v, i) => (v + pair[1].position[i]) / 2) as Vec3)
  const round = (points: Vec3[]) => points.map((p, i) => i === 0 || i === points.length - 1 ? p : p.map((v, j) => .25 * points[i - 1][j] + .5 * v + .25 * points[i + 1][j]) as Vec3)
  const path = makeWalkingPath(round(round(centers))), distanceAt = (t: number) => walkingDistance(t, start, end, path.length, .65)
  function timeAt(distance: number) { let lo = start, hi = end; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (distanceAt(m) < distance) lo = m; else hi = m } return (lo + hi) / 2 }
  const times = path.knots.map((d, i) => i === 0 ? start : i === path.knots.length - 1 ? end : timeAt(d))
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
    const shot = path.sample(distanceAt(time)), feet = [foot(0, time), foot(1, time)], position = [...shot.position] as Vec3
    const yaw = mix(headings[shot.segment], headings[shot.segment + 1], smoother(shot.u))
    position[1] = smoothMinimum(position[1] - .035 + .009 * Math.sin(Math.PI * shot.u) ** 2, limit(position, yaw, feet))
    const pole: Vec3 = [Math.sin(yaw), 0, Math.cos(yaw)]
    const legs = feet.map((f, side) => solveTwoBone(hipAt(position, yaw, side), [f.position[0], f.position[1] + walkerRig.ankleY, f.position[2]], pole, walkerRig.upper, walkerRig.lower))
    const forward = (f: FootPose) => (f.position[0] - position[0]) * Math.sin(yaw) + (f.position[2] - position[2]) * Math.cos(yaw)
    return { position, yaw, feet, legs, armSwing: (forward(feet[1]) - forward(feet[0])) * .55, signal: smooth(progress(time, end, end + 1.5)) }
  }
  return { pose, footfalls, initial, start, end, path }
}
const staffLandings: [number, number, number, number][] = [[-11, .575, 2.75, Math.PI / 2]]
for (let x = -10.6; x < -2.65; x += .4) staffLandings.push([x, .575, 2.75, Math.PI / 2])
staffLandings.push([-2.42, .575, 2.8, 1.15], [-2.42, .575, 3.12, .35], [-2.42, .575, 3.55, 0], [-2.42, .575, 4, 0], [-2.25, .575, 4.43, .25], [-2, .575, 4.85, .25], [-2, .575, 5.3, 0], [-2, .575, 5.65, .45], [-2, .575, 5.9, 1.05], [-2, .575, 5.9, 1.05])
export const attendantWalk = makeWalker(staffLandings, 28, 35.5)
const guestLandings: [number, number, number, number][] = []
for (let i = 0; i <= 8; i++) { const x = -22 + i * .375; guestLandings.push([x, 1.26, -14.4 + .0085 * x * x, Math.atan2(1, .017 * x)]) }
guestLandings.push([...guestLandings.at(-1)!])
export const guestWalk = makeWalker(guestLandings, 0, 18)
