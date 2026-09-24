'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Layers, Quality, SceneClock, SceneModule } from './contract'
import { catalogue, findScene } from './catalogue'
import { loaders } from './loaders'
const Runtime = dynamic(() => import('./runtime'), { ssr: false })
const labels = { establish: 'Normal site activity', detect: 'Detect', verify: 'Verify', correlate: 'Correlate', decide: 'Human review', respond: 'Respond', resolve: 'Record' }
class StageBoundary extends Component<{ children: ReactNode; onError: () => void }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.error ? null : this.props.children }
}
export default function WorldExplorer({ initialScene = 'logistics-yard' }: { initialScene?: string }) {
  const [selected, setSelected] = useState(initialScene)
  const definition = findScene(selected) || catalogue[4]
  const [module, setModule] = useState<SceneModule | null>(null)
  const [active, setActive] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [decisionPassed, updateDecisionPassed] = useState(false)
  const decisionPassedRef = useRef(false)
  function setDecisionPassed(value: boolean) { decisionPassedRef.current = value; updateDecisionPassed(value) }
  const [layers, setLayers] = useState<Layers>({ sensors: false, tracks: true })
  const [quality, setQuality] = useState<Quality>('high')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [revision, setRevision] = useState(0)
  const clock = useRef<SceneClock>({ time: 0, playing: false })
  const stage = useRef<HTMLDivElement>(null)
  const intendedPlay = useRef(false)
  const beat = [...definition.beats].reverse().find(b => time >= b.at) || { id: 'establish' as const, ...definition.establishing, evidence: [] }
  const decision = definition.beats.find(b => b.id === 'decide')!
  const atDecision = time >= decision.at && time < definition.beats.find(b => b.id === 'respond')!.at && !decisionPassed
  const pause = useCallback(() => { intendedPlay.current = false; clock.current.playing = false; setPlaying(false) }, [])
  const fail = useCallback(() => { setFailed(true); setActive(false); setLoading(false); pause() }, [pause])
  const onReady = useCallback(() => { setReady(true); setLoading(false) }, [])
  const downgrade = useCallback(() => setQuality('low'), [])
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setReducedMotion(motion.matches); if (motion.matches) pause() }
    update(); motion.addEventListener('change', update)
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    if (innerWidth < 640 || (nav.deviceMemory && nav.deviceMemory <= 4) || nav.connection?.saveData || navigator.hardwareConcurrency <= 4) setQuality('low')
    if (new URLSearchParams(location.search).get('view') === 'static' || typeof window.WebGL2RenderingContext === 'undefined') setFailed(true)
    return () => motion.removeEventListener('change', update)
  }, [pause])
  useEffect(() => {
    const hidden = () => { if (document.hidden) pause() }
    document.addEventListener('visibilitychange', hidden)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        const rect = stage.current?.getBoundingClientRect()
        if (!rect || rect.bottom <= 0 || rect.top >= innerHeight) pause()
      }
    // Match the fully-offscreen guard: a higher threshold can notify before
    // the last pixels leave, then never notify again at the viewport edge.
    }, { threshold: 0 })
    if (stage.current) observer.observe(stage.current)
    return () => { document.removeEventListener('visibilitychange', hidden); observer.disconnect() }
  }, [pause])
  useEffect(() => {
    if (!active) return
    let cancelled = false
    setLoading(true)
    loaders[selected]().then(loaded => {
      if (cancelled) return
      setModule(loaded.default); setLoading(false)
      if (intendedPlay.current) { clock.current.playing = true; setPlaying(true); intendedPlay.current = false }
      setRevision(v => v + 1)
    }).catch(() => { if (!cancelled) fail() })
    return () => { cancelled = true }
  }, [selected, active, fail])
  function choose(id: string) {
    if (id === selected) return
    pause(); setSelected(id); setTime(0); clock.current.time = 0
    setDecisionPassed(false); setRevision(v => v + 1)
    // Keep a single Canvas alive through world swaps; the poster covers the pending scene.
  }
  function seek(value: number) {
    pause(); const next = Math.min(definition.duration, Math.max(0, value))
    clock.current.time = next; setTime(next); setDecisionPassed(next > decision.at)
    setRevision(v => v + 1)
  }
  function play() {
    if (playing) { pause(); return }
    if (reducedMotion) return
    if (time >= definition.duration) { clock.current.time = 0; setTime(0); setDecisionPassed(false) }
    if (atDecision) return
    stage.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
    if (!active) { intendedPlay.current = true; setActive(true); setLoading(true); return }
    if (module?.definition.id !== selected || loading) { intendedPlay.current = true; return }
    clock.current.playing = true; setPlaying(true); setRevision(v => v + 1)
  }
  function continueDecision() {
    if (active && (loading || module?.definition.id !== selected)) return
    setDecisionPassed(true)
    if (active && !reducedMotion) { stage.current?.scrollIntoView({ block: 'center', behavior: 'instant' }); clock.current.playing = true; setPlaying(true); setRevision(v => v + 1) }
    else seek(definition.beats.find(b => b.id === 'respond')!.at)
  }
  const currentModule = module?.definition.id === selected
  return <div className="world-explorer" data-scene={selected} data-beat={beat.id} data-playing={playing} data-ready={ready && currentModule}>
    <div className="world-index" aria-label="Choose an illustrative world">
      {catalogue.map(s => <button key={s.id} className={`world-choice ${selected === s.id ? 'selected' : ''}`} aria-pressed={selected === s.id} onClick={() => choose(s.id)}>
        {/* Self-made scene posters. Lazy-loaded; essential labels remain HTML. */}
        <img src={s.poster} alt="" loading="lazy" width="240" height="160" />
        <span><small>{s.number}</small>{s.name}<span aria-hidden="true">↗</span></span>
      </button>)}
    </div>
    <div className="world-heading"><div><p className="eyebrow">World {definition.number} <span className="dot-separator">/</span> {definition.name}</p><h3>{definition.subtitle}</h3></div><p>{definition.description}</p></div>
    <div className="world-console">
      <div ref={stage} className="world-stage" aria-label={`${definition.name} illustrative scene`}>
        <img className={`world-poster ${active && currentModule && ready && !failed ? 'is-hidden' : ''}`} src={definition.poster} alt={definition.posterAlt} width="1440" height="960" />
        {active && !failed && module && <div className="world-canvas"><StageBoundary onError={fail}><Runtime scene={module} clock={clock} layers={layers} quality={quality} revision={revision} decisionPassed={decisionPassedRef} onTime={setTime} onPause={pause} onFailure={fail} onReady={onReady} onDowngrade={downgrade} /></StageBoundary></div>}
        <div className="stage-meta"><span className="stage-label"><i />Illustrative world</span><span>{definition.setting}</span></div>
        {!active && !failed && <button className="stage-launch" onClick={() => { intendedPlay.current = !reducedMotion && time < decision.at; setActive(true); setLoading(true) }}><span aria-hidden="true">▷</span>{reducedMotion ? 'Enable a still 3D view' : 'Enter the world'}<small>{reducedMotion ? 'Reduced motion · manual exploration' : 'A guided sequence · you control the pace'}</small></button>}
        {loading && <div className="stage-loading" role="status">Preparing the world…</div>}
        {failed && <div className="stage-fallback">Static view <span>The complete story is available in the beat controls and text below.</span></div>}
        <div className="stage-footer">{active && currentModule && !reducedMotion && <button className="stage-play" onClick={play} disabled={atDecision || loading} aria-label={playing ? "Pause world motion" : "Play world motion"}>{playing ? "Ⅱ Pause" : "▷ Play"}</button>}<span>{quality === 'low' ? 'Light detail' : 'Full detail'}<span aria-hidden="true"> · </span>{active ? '3D illustration' : 'Scene study'}</span><Link href={`/worlds/${selected}`}>Open world page <span aria-hidden="true">↗</span></Link></div>
      </div>
      <aside className="evidence-panel" aria-label="Illustrated event evidence">
        <div className="evidence-kicker"><span>From signal to decision</span><span>{String(definition.beats.findIndex(b => b.id === beat.id) + 1).padStart(2, '0')} / 06</span></div>
        <div className="evidence-current" aria-live="polite" aria-atomic="true"><p className={`beat-label ${beat.id}`}>{labels[beat.id]}</p><h4>{beat.title}</h4><p>{beat.body}</p></div>
        <div className="evidence-sources">{beat.evidence.map((e, i) => <div key={`${beat.id}-${i}`}><span className="source-marker" aria-hidden="true" /><div><strong>{e.source}</strong><p>{e.detail}</p></div></div>)}</div>
        {atDecision && <div className="decision-panel"><p>Illustrative operator decision</p><strong>{decision.action}</strong><button className="button primary" onClick={continueDecision} disabled={loading || (active && !currentModule)}>Continue illustrative response <span aria-hidden="true">→</span></button><span>Or stay here and review the evidence.</span></div>}
        <p className="evidence-caption">Authored observations. No live sensor data or real-world controls.</p>
      </aside>
    </div>
    <div className="timeline-controls">
      <button className="play-control" onClick={play} disabled={failed || atDecision || reducedMotion || loading || (active && !currentModule)} aria-label={playing ? 'Pause sequence' : time >= definition.duration ? 'Replay sequence' : 'Play sequence'}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span><span>{playing ? 'Pause' : time >= definition.duration ? 'Replay' : 'Play'}</span></button>
      <label className="scrubber"><span className="sr-only">Illustrative playback time</span><input aria-valuetext={`${Math.floor(time)} of ${definition.duration} illustration seconds`} type="range" min="0" max={definition.duration} step="0.1" value={time} onChange={e => seek(Number(e.target.value))} /><span><b>{String(Math.floor(time)).padStart(2, '0')}</b> / {definition.duration}s <span className="time-note">illustration</span></span></label>
      <div className="layer-controls" aria-label="Scene layers"><button aria-pressed={layers.sensors} onClick={() => { setLayers(s => ({ ...s, sensors: !s.sensors })); setRevision(v => v + 1) }}>Sensors</button><button aria-pressed={layers.tracks} onClick={() => { setLayers(s => ({ ...s, tracks: !s.tracks })); setRevision(v => v + 1) }}>Tracks</button><button aria-label={active ? 'Switch to static view' : 'Use static view'} aria-pressed={!active} onClick={() => { setActive(false); pause(); setReady(false) }}>Static</button></div>
    </div>
    <div className="beat-navigation" aria-label="Jump to an authored beat">{definition.beats.map((b, i) => <button key={b.id} aria-pressed={b.id === beat.id} onClick={() => seek(b.at)}><small>{String(i + 1).padStart(2, '0')}</small><span>{labels[b.id]}</span><span className="beat-dot" aria-hidden="true" /></button>)}</div>
    <div className="world-notes"><p><span className="eyebrow">The idea this world explores</span>{definition.lesson}</p><details><summary>Read the story as text <span aria-hidden="true">+</span></summary><ol>{definition.beats.map(b => <li key={b.id}><span>{b.at}s · {labels[b.id]}</span><h4>{b.title}</h4><p>{b.body}</p>{b.action && <p>Illustrative decision: {b.action}.</p>}</li>)}</ol></details></div>
  </div>
}
