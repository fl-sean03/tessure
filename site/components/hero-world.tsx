'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const moments = [
  { title: 'A movement enters the picture.', detail: 'Camera · an approaching vehicle', sources: 1 },
  { title: 'Separate observations. One event.', detail: 'Camera + radar · the same path', sources: 2 },
  { title: 'Evidence, before a decision.', detail: 'Camera + radar + thermal · checked together', sources: 3 },
]
export default function HeroWorld() {
  const video = useRef<HTMLVideoElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const visible = useRef(true)
  const [enabled, setEnabled] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    const update = () => {
      const capable = !motion.matches && !nav.connection?.saveData && !(nav.deviceMemory && nav.deviceMemory <= 4) && !(nav.hardwareConcurrency && nav.hardwareConcurrency <= 4)
      setEnabled(capable)
      if (!capable) { video.current?.pause(); setStarted(false) }
    }
    update(); motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!enabled) return
    const sync = () => {
      if (!visible.current || document.hidden || paused.current) video.current?.pause()
      else video.current?.play().catch(() => { setPlaying(false) })
    }
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; sync() }, { threshold: .15 })
    if (container.current) observer.observe(container.current)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [enabled])
  const moment = moments[phase]
  return <div className="hero-visual" ref={container} data-film-playing={playing}>
    <Image src="/reference/poster.webp" alt="A richly lit miniature cargo gate: a truck approaches a staffed checkpoint between corrugated containers, with complementary sensors watching its path." fill priority sizes="(max-width: 760px) 100vw, 57vw" />
    {enabled && <video ref={video} className={`hero-film ${started ? 'has-started' : ''}`} src="/reference/hero-loop.mp4" muted playsInline loop preload="auto" autoPlay aria-hidden="true" onPlaying={() => { setPlaying(true); setStarted(true) }} onPause={() => setPlaying(false)} onError={() => { setEnabled(false); setStarted(false) }} onTimeUpdate={e => setPhase(Math.min(2, Math.floor(e.currentTarget.currentTime / 4)))} />}
    <div className="hero-visual-top"><span>Illustrative world / 05</span><span>First light at the gate</span></div>
    <div className="hero-sources" aria-hidden="true">{['Camera', 'Radar', 'Thermal'].map((source, i) => <span key={source} className={!started || i < moment.sources ? 'observed' : ''}><i />{source}</span>)}<span className="hero-event">→ One event</span></div>
    <div className="hero-annotation"><span className="annotation-dot" /><div><strong>{started ? moment.title : 'Separate signals. A shared picture.'}</strong><span>{started ? moment.detail : 'Designed to connect observations before a person acts.'}</span></div></div>
    <p className="visual-caption">Authored illustration · no live sensor data</p>
    {enabled && started && <button className="hero-motion" aria-label={playing ? 'Pause hero illustration' : 'Play hero illustration'} onClick={() => { paused.current = playing; if (playing) video.current?.pause(); else video.current?.play().catch(() => setPlaying(false)) }}>{playing ? 'Ⅱ Pause' : '▷ Play'}</button>}
  </div>
}
