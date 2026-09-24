'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { heroFilm } from './hero-film'

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
  const moment = heroFilm.moments[phase]
  return <div className="hero-visual" ref={container} data-film-playing={playing}>
    <Image src={heroFilm.poster} alt={heroFilm.posterAlt} fill priority sizes="(max-width: 760px) 100vw, 57vw" />
    {enabled && <video ref={video} className={`hero-film ${started ? 'has-started' : ''}`} src={heroFilm.src} muted playsInline loop preload="auto" autoPlay aria-hidden="true" onPlaying={() => { setPlaying(true); setStarted(true) }} onPause={() => setPlaying(false)} onError={() => { setEnabled(false); setStarted(false) }} onTimeUpdate={e => setPhase(Math.max(0, heroFilm.moments.findLastIndex(moment => moment.at <= e.currentTarget.currentTime)))} />}
    <div className="hero-visual-top"><span>Illustrative world / 05</span><span>A cargo diversion</span></div>
    <div className="hero-sources" aria-hidden="true">{['Camera', 'Radar', 'Thermal'].map((source, i) => <span key={source} className={!started || i < moment.sources ? 'observed' : ''}><i />{source}</span>)}<span className="hero-event">→ One event</span></div>
    <div className="hero-annotation"><span className="annotation-dot" /><div><strong>{started ? moment.title : 'A marked load takes the wrong route.'}</strong><span>{started ? moment.detail : 'Proposed local correlation. Human-directed response.'}</span></div></div>
    <p className="visual-caption">Authored illustration · no live sensor data</p>
    {enabled && started && <button className="hero-motion" aria-label={playing ? 'Pause hero illustration' : 'Play hero illustration'} onClick={() => { paused.current = playing; if (playing) video.current?.pause(); else video.current?.play().catch(() => setPlaying(false)) }}>{playing ? 'Ⅱ Pause' : '▷ Play'}</button>}
  </div>
}
