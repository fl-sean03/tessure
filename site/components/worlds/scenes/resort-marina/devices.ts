import { Vector3 } from 'three'
import type { Vec3 } from '../../contract'
import { assembly, type Materials } from './geometry'
export const sensorTarget: Vec3 = [16, 1, 16]
export const optics = [
  { id: 'shore-camera', position: [21.55, 3.65, .8] as Vec3, thermal: false },
  { id: 'sky-camera', position: [22.2, 3.65, .8] as Vec3, thermal: true },
].map(s => {
  const d = new Vector3(...(s.thermal ? [18, 10, 12] : sensorTarget)).sub(new Vector3(...s.position))
  const yaw = Math.atan2(d.x, d.z), pitch = Math.atan2(-d.y, Math.hypot(d.x, d.z))
  const lens = new Vector3(0, 0, s.thermal ? .35 : .48).applyAxisAngle(new Vector3(1, 0, 0), pitch).applyAxisAngle(new Vector3(0, 1, 0), yaw).add(new Vector3(...s.position)).toArray() as Vec3
  // An authored direction wedge, not calibrated field of view or detection range.
  const sector = [-.35, .35].map(angle => [lens[0] + Math.sin(yaw + angle) * 28, .05, lens[2] + Math.cos(yaw + angle) * 28] as Vec3)
  return { ...s, yaw, pitch, lens, sector }
})
export function makeOptic(m: Materials, high: boolean, thermal: boolean, mount = true) {
  const a = assembly(m, high)
  a.box([0, 0, 0], thermal ? [.48, .4, .57] : [.4, .32, .83], thermal ? 'dark' : 'ivory', .055)
  if (thermal) {
    a.box([0, 0, .296], [.39, .32, .035], 'steel', .035)
    a.cylinder([0, 0, .322], .125, .026, 'dark', [Math.PI / 2, 0, 0])
    a.cylinder([0, 0, .339], .088, .018, 'glass', [Math.PI / 2, 0, 0])
    a.box([0, .13, -.1], [.51, .14, .48], 'ivory', .035)
  } else {
    a.box([0, .18, .04], [.48, .065, .98], 'ivory', .025)
    a.cylinder([0, 0, .427], .126, .06, 'dark', [Math.PI / 2, 0, 0])
    a.cylinder([0, 0, .465], .088, .024, 'glass', [Math.PI / 2, 0, 0])
  }
  // Counter-rotate the support so the aimed head stays connected to its level crossarm.
  const pitch = optics.find(o => o.thermal === thermal)!.pitch
  const support = new Vector3(0, -.23, 0).applyAxisAngle(new Vector3(1, 0, 0), -pitch).toArray() as Vec3
  if (mount) a.cylinder(support, .065, .26, 'steel', [-pitch, 0, 0])
  return a.finish()
}
export function makeRadarArray(m: Materials, high: boolean) {
  const a = assembly(m, high)
  a.cylinder([0, 0, 0], .12, .24, 'steel')
  a.box([0, .18, 0], [1.55, .22, .25], 'ivory', .045)
  a.box([0, .18, .131], [1.37, .12, .024], 'cloth', .008)
  for (const x of [-.7, .7]) a.box([x, .18, 0], [.075, .27, .28], 'steel', .02)
  a.box([0, .05, -.04], [.28, .15, .2], 'dark', .025)
  return a.finish()
}
