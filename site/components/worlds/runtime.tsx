'use client'
import { createRoot, extend, useFrame, useThree, type Catalogue } from '@react-three/fiber'
import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { ACESFilmicToneMapping, NeutralToneMapping, PerspectiveCamera, PCFShadowMap, SRGBColorSpace, WebGLRenderer } from 'three'
extend(THREE as unknown as Catalogue)
import type { MutableRefObject } from 'react'
import type { Layers, Quality, RenderStats, ResolvedScenario, SceneClock, SceneModule } from './contract'
import { sampleCamera } from './math'
import { AuthoredResourceCache } from './resource-stats'
import { storyStates } from './scenario'

type Props = {
  scene: SceneModule; scenario: ResolvedScenario; clock: MutableRefObject<SceneClock>; layers: Layers; quality: Quality;
  revision: number; decisionPassed: MutableRefObject<boolean>; onTime: (time: number) => void;
  onPause: () => void; onFailure: () => void; onReady: (key: string) => void; onDowngrade: () => void
}
declare global {
  interface Window { __TESSURE_STATS__?: RenderStats; __TESSURE_CONTEXTS__?: number; __TESSURE_FRAMES__?: RenderStats[] }
}
type Timing = MutableRefObject<{ start: number }>
function Director({ scene, scenario, clock, quality, revision, decisionPassed, onTime, onPause, onDowngrade, timing }: Props & { timing: Timing }) {
  const { camera, size, gl, invalidate } = useThree()
  const lastUpdate = useRef(0)
  const lastCue = useRef(-1)
  const cueTimes = useMemo(() => storyStates(scenario).map(cue => cue.at), [scenario])
  const slow = useRef(0)
  const decision = scenario.beats.find(b => b.id === 'decide')!.at
  useEffect(() => { invalidate(); slow.current = 0 }, [revision, quality, scene, scenario, invalidate])
  useFrame((_, delta) => {
    const start = performance.now()
    timing.current.start = start
    const state = clock.current
    if (state.playing) {
      const next = Math.min(scenario.duration, state.time + Math.min(delta, 0.08))
      if (!decisionPassed.current && next >= decision) {
        state.time = decision; state.playing = false; onPause(); onTime(decision)
      } else {
        state.time = next
        if (next >= scenario.duration) { state.playing = false; onPause() }
      }
    }
    const shot = sampleCamera(scenario.cameras, state.time, size.width < 640)
    camera.position.set(...shot.position)
    camera.lookAt(...shot.target)
    if (camera instanceof PerspectiveCamera && camera.fov !== shot.fov) { camera.fov = shot.fov; camera.updateProjectionMatrix() }
    const cue = cueTimes.findLastIndex(at => state.time >= at)
    if (cue !== lastCue.current || start - lastUpdate.current > 150 || !state.playing) {
      onTime(state.time)
      lastUpdate.current = start
      lastCue.current = cue
    }
    // Coarse sustained-frame backstop. Software rendering is reported separately in evidence.
    if (state.playing && quality === 'high' && delta > 0.06) slow.current += 1
    else slow.current = Math.max(0, slow.current - 1)
    if (slow.current > 100) { slow.current = 0; onDowngrade() }
    if (state.playing) invalidate()
  }, -100)
  return null
}
function FrameEnd({ module, scenario, onReady, clock, quality, layers, revision, timing, owned }: { module: SceneModule; scenario: ResolvedScenario; onReady: Props['onReady']; clock: MutableRefObject<SceneClock>; quality: Quality; layers: Layers; revision: number; timing: Timing; owned: MutableRefObject<THREE.Group | null> }) {
  const cache = useRef<AuthoredResourceCache | null>(null)
  const shown = useRef('')
  if (!cache.current) cache.current = new AuthoredResourceCache()
  useLayoutEffect(() => { cache.current!.invalidate() }, [module, scenario, quality, layers.sensors, layers.tracks, revision])
  useEffect(() => () => cache.current!.dispose(), [])
  useFrame(({ gl, scene, camera }, delta) => {
    gl.render(scene, camera)
    if (!owned.current) return
    const resources = cache.current!.read(owned.current)
    const stats: RenderStats = { scene: module.definition.id, scenario: scenario.id, time: clock.current.time, quality, ...resources, calls: gl.info.render.calls, triangles: gl.info.render.triangles, textures: gl.info.memory.textures, geometries: gl.info.memory.geometries, frameMs: delta * 1000, jsFrameMs: performance.now() - timing.current.start }
    window.__TESSURE_STATS__ = stats
    const frames = window.__TESSURE_FRAMES__ ||= []
    frames.push(stats); if (frames.length > 300) frames.shift()
    const key = `${module.definition.id}/${scenario.id}`
    // A rapid A→B→A selection may commit only A. Its reset revision still
    // needs a fresh-frame acknowledgement before the poster can be removed.
    const frameKey = `${key}/${revision}`
    if (shown.current !== frameKey) { shown.current = frameKey; onReady(key) }
  }, 1)
  return null
}
class WorldBoundary extends Component<{ children: ReactNode; onError: () => void }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.error ? null : this.props.children }
}
function Contents(props: Props) {
  const { scene, scenario, quality, clock, layers } = props
  const { palette } = scene.definition
  const World = scene.World
  const timing = useRef({ start: 0 })
  const owned = useRef<THREE.Group | null>(null)
  return <>
    <color attach="background" args={[palette.background]} />
    <fog attach="fog" args={[palette.fog, palette.fogNear, palette.fogFar]} />
    <ambientLight intensity={palette.ambient} />
    <hemisphereLight color={palette.hemisphereSky} groundColor={palette.hemisphereGround} intensity={palette.hemisphereIntensity} />
    <directionalLight key={`${scene.definition.id}-${quality}`} color={palette.sun} position={palette.sunPosition} intensity={palette.sunIntensity} castShadow={quality === 'high'} shadow-mapSize={[quality === 'high' ? palette.shadowBounds.mapSize : 512, quality === 'high' ? palette.shadowBounds.mapSize : 512]} shadow-camera-left={palette.shadowBounds.left} shadow-camera-right={palette.shadowBounds.right} shadow-camera-top={palette.shadowBounds.top} shadow-camera-bottom={palette.shadowBounds.bottom} shadow-camera-near={palette.shadowBounds.near} shadow-camera-far={palette.shadowBounds.far} shadow-bias={palette.shadowBounds.bias} shadow-normalBias={palette.shadowBounds.normalBias} />
    <group ref={owned} key={`${scene.definition.id}/${scenario.id}`}><World clock={clock} quality={quality} layers={layers} scenarioId={scenario.id} /></group>
    <Director {...props} timing={timing} />
    <FrameEnd module={scene} scenario={scenario} onReady={props.onReady} clock={clock} quality={quality} layers={layers} revision={props.revision} timing={timing} owned={owned} />
  </>
}
/** Own initialization so unavailable WebGL cannot escape an async Canvas configure call. */
export default function WorldRuntime(props: Props) {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const container = useRef<HTMLDivElement>(null)
  const root = useRef<ReturnType<typeof createRoot> | null>(null)
  const renderer = useRef<WebGLRenderer | null>(null)
  const latest = useRef(props)
  latest.current = props
  const draw = useCallback(() => {
    const r = root.current, c = canvas.current, gl = renderer.current
    if (!r || !c || !gl) return
    const p = latest.current
    const rect = c.parentElement!.getBoundingClientRect()
    r.configure({
      gl, frameloop: 'demand', dpr: p.quality === 'high' ? [1, 1.5] : 1,
      size: { width: rect.width, height: rect.height, top: 0, left: 0 },
      shadows: p.quality === 'high' ? { type: PCFShadowMap } : false,
      camera: { near: 0.5, far: 600, fov: 38 },
    }).then(() => {
      gl.toneMapping = latest.current.scene.definition.palette.toneMapping === 'neutral' ? NeutralToneMapping : ACESFilmicToneMapping
      gl.toneMappingExposure = latest.current.scene.definition.palette.exposure
      if (root.current === r) r.render(<WorldBoundary onError={latest.current.onFailure}><Contents {...latest.current} /></WorldBoundary>)
    }).catch(() => { if (root.current === r) latest.current.onFailure() })
  }, [])
  useEffect(() => {
    const host = container.current!
    const c = document.createElement('canvas')
    c.style.cssText = 'width:100%;height:100%;display:block'
    c.setAttribute('aria-hidden', 'true')
    host.appendChild(c); canvas.current = c
    // Use the stage's own context for both the capability check and renderer.
    // A separate probe canvas would briefly consume a second WebGL context.
    const attributes: WebGLContextAttributes = { antialias: true, alpha: false, powerPreference: 'low-power' }
    let context: WebGL2RenderingContext | null = null
    try { context = c.getContext('webgl2', attributes) } catch { /* unavailable or denied */ }
    if (!context) { c.remove(); canvas.current = null; latest.current.onFailure(); return }
    let gl: WebGLRenderer
    try {
      gl = new WebGLRenderer({ canvas: c, context, ...attributes })
    } catch {
      context.getExtension('WEBGL_lose_context')?.loseContext()
      c.remove(); canvas.current = null; latest.current.onFailure(); return
    }
    const loseContext = gl.forceContextLoss.bind(gl)
    let released = false
    gl.forceContextLoss = () => { if (!released) { released = true; if (!gl.getContext().isContextLost()) loseContext() } }
    gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; gl.outputColorSpace = SRGBColorSpace
    renderer.current = gl
    const r = createRoot(c); root.current = r
    window.__TESSURE_CONTEXTS__ = (window.__TESSURE_CONTEXTS__ || 0) + 1
    const lost = (e: Event) => { e.preventDefault(); latest.current.onFailure() }
    c.addEventListener('webglcontextlost', lost)
    const observer = new ResizeObserver(draw)
    observer.observe(c.parentElement!)
    draw()
    return () => {
      observer.disconnect(); c.removeEventListener('webglcontextlost', lost)
      root.current = null; renderer.current = null; canvas.current = null; r.unmount()
      // R3F also cleans up later; release this exact renderer immediately to avoid overlap.
      gl.dispose(); gl.forceContextLoss(); c.remove()
      window.__TESSURE_CONTEXTS__ = Math.max(0, (window.__TESSURE_CONTEXTS__ || 1) - 1)
    }
  }, [draw])
  useEffect(draw, [draw, props.scene, props.scenario, props.quality, props.layers, props.revision, props.decisionPassed])
  return <div ref={container} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden="true" />
}
