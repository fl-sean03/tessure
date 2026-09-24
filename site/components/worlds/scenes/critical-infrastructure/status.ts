import { CanvasTexture, SRGBColorSpace } from 'three'

/** Four static, self-drawn faces for the physical cabinet; no animated texture clock. */
export function statusAtlas() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 768
  const c = canvas.getContext('2d')!
  for (let state = 0; state < 4; state++) {
    c.save(); c.translate((state % 2) * 512, Math.floor(state / 2) * 384)
    const up = state === 0 || state === 3, ink = up ? '#d8e9ec' : '#efbd76'
    c.fillStyle = '#142733'; c.fillRect(0, 0, 512, 384)
    c.textAlign = 'center'; c.fillStyle = '#adbec4'; c.font = '600 29px sans-serif'; c.fillText('REMOTE LINK', 256, 47)
    c.fillStyle = ink; c.font = '700 49px sans-serif'; c.fillText(up ? 'CONNECTED' : 'UNAVAILABLE', 256, 108)
    // Two endpoint sockets; a joined channel versus a conspicuous break, not a power switch.
    c.strokeStyle = ink; c.lineWidth = 10; c.lineJoin = 'round'
    c.strokeRect(54, 143, 62, 56); c.strokeRect(396, 143, 62, 56)
    c.beginPath(); c.moveTo(116, 171); c.lineTo(up ? 396 : 213, 171)
    if (!up) { c.moveTo(299, 171); c.lineTo(396, 171); c.moveTo(242, 144); c.lineTo(222, 198); c.moveTo(289, 144); c.lineTo(269, 198) }
    c.stroke()
    c.fillStyle = '#203744'; c.fillRect(20, 223, 472, 90)
    c.strokeStyle = ink; c.lineWidth = 5
    for (let i = 0; i < 3; i++) c.strokeRect(34 + i * 12, 251 - i * 8, 66, 43)
    c.fillStyle = ink; c.font = `700 ${state === 3 ? 36 : state === 2 ? 49 : 43}px sans-serif`
    c.fillText(['NO QUEUE', 'LOCAL ONLY', 'QUEUED', 'READY TO SYNC'][state], 300, 282)
    // Invariant local-power rail. Its meaning is repeated in the accessible narrative.
    c.fillStyle = '#adc9ce'; c.beginPath(); c.arc(46, 347, 9, 0, Math.PI * 2); c.fill()
    c.font = '600 29px sans-serif'; c.fillText('LOCAL NODE ON', 276, 357)
    c.restore()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace; texture.repeat.set(0.5, 0.5); texture.offset.set(0, 0.5)
  return texture
}
