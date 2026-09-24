'use client'
import { createRoot, extend, useFrame, useThree, type Catalogue } from '@react-three/fiber'
import { Component, useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { ACESFilmicToneMapping, NeutralToneMapping, PerspectiveCamera, PCFShadowMap, SRGBColorSpace, WebGLRenderer } from 'three'
extend(THREE as unknown as Catalogue)
import type { MutableRefObject } from 'react'
import type { Layers, Quality, RenderStats, SceneClock, SceneModule } from './contract'
import { sampleCamera } from './math'
import { AuthoredResourceCache } from './resource-stats'

type Props = {
  scene: SceneModule; clock: MutableRefObject<SceneClock>; layers: Layers; quality: Quality;
  revision: number; decisionPassed: MutableRefObject<boolean>; onTime: (time: number) => void;
  onPause: () => void; onFailure: () => void; onReady: () => void; onDowngrade: () => void
}
declare global {
  interface Window { __TESSURE_STATS__?: RenderStats; __TESSURE_CONTEXTS__?: number; __TESSURE_FRAMES__?: RenderStats[] }
}
type Timing = MutableRefObject<{ start: number }>
function Director({ scene, clock, quality, revision, decisionPassed, onTime, onPause, onDowngrade, timing }: Props & { timing: Timing }) {
  const { camera, size, gl, invalidate } = useThree()
  const lastUpdate = useRef(0)
  const slow = useRef(0)
  const decision = scene.definition.beats.find(b => b.id === 'decide')!.at
  useEffect(() => { invalidate() }, [revision, quality, scene, invalidate])
  useFrame((_, delta) => {
    const start = performance.now()
    timing.current.start = start
    const state = clock.current
    if (state.playing) {
      const next = Math.min(scene.definition.duration, state.time + Math.min(delta, 0.08))
      if (!decisionPassed.current && next >= decision) {
        state.time = decision; state.playing = false; onPause(); onTime(decision)
      } else {
        state.time = next
        if (next >= scene.definition.duration) { state.playing = false; onPause() }
      }
    }
    const shot = sampleCamera(scene.definition.cameras, state.time, size.width < 640)
    camera.position.set(...shot.position)
    camera.lookAt(...shot.target)
    if (camera instanceof PerspectiveCamera && camera.fov !== shot.fov) { camera.fov = shot.fov; camera.updateProjectionMatrix() }
    if (start - lastUpdate.current > 150 || !state.playing) {
      onTime(state.time)
      lastUpdate.current = start
    }
    // Coarse sustained-frame backstop. Software rendering is reported separately in evidence.
    if (state.playing && quality === 'high' && delta > 0.06) slow.current += 1
    else slow.current = Math.max(0, slow.current - 1)
    if (slow.current > 100) { slow.current = 0; onDowngrade() }
    if (state.playing) invalidate()
  }, -100)
  return null
}
function FrameEnd({ module, clock, quality, layers, revision, timing, owned }: { module: SceneModule; clock: MutableRefObject<SceneClock>; quality: Quality; layers: Layers; revision: number; timing: Timing; owned: MutableRefObject<THREE.Group | null> }) {
  const cache = useRef<AuthoredResourceCache | null>(null)
  if (!cache.current) cache.current = new AuthoredResourceCache()
  useLayoutEffect(() => { cache.current!.invalidate() }, [module, quality, layers.sensors, layers.tracks, revision])
  useEffect(() => () => cache.current!.dispose(), [])
  useFrame(({ gl, scene, camera }, delta) => {
    gl.render(scene, camera)
    if (!owned.current) return
    const resources = cache.current!.read(owned.current)
    const stats: RenderStats = { scene: module.definition.id, time: clock.current.time, quality, ...resources, calls: gl.info.render.calls, triangles: gl.info.render.triangles, textures: gl.info.memory.textures, geometries: gl.info.memory.geometries, frameMs: delta * 1000, jsFrameMs: performance.now() - timing.current.start }
    window.__TESSURE_STATS__ = stats
    const frames = window.__TESSURE_FRAMES__ ||= []
    frames.push(stats); if (frames.length > 300) frames.shift()
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
  const { scene, quality, clock, layers } = props
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
    <group ref={owned} key={scene.definition.id}><World clock={clock} quality={quality} layers={layers} /></group>
    <Director {...props} timing={timing} />
    <FrameEnd module={scene} clock={clock} quality={quality} layers={layers} revision={props.revision} timing={timing} owned={owned} />
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
      onCreated: () => { if (root.current === r) latest.current.onReady() },
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
  useEffect(draw, [draw, props.scene, props.quality, props.layers, props.revision, props.decisionPassed])
  return <div ref={container} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden="true" />
}
