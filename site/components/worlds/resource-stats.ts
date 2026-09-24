import * as THREE from 'three'
import type { ResourceStats } from './contract'

type RecordLike = Record<string, unknown>
const record = (value: unknown): RecordLike | null => value !== null && typeof value === 'object' ? value as RecordLike : null
type Totals = ResourceStats & { practicalLights: number; practicalShadows: number }

/** Union the referenced byte ranges, not entire possibly larger backing buffers. */
class ByteRanges {
  private ranges = new Map<ArrayBufferLike, [number, number][]>()
  add(value: unknown) {
    if (!ArrayBuffer.isView(value)) return false
    const list = this.ranges.get(value.buffer) || []
    list.push([value.byteOffset, value.byteOffset + value.byteLength])
    this.ranges.set(value.buffer, list)
    return true
  }
  bytes() {
    let bytes = 0
    for (const list of this.ranges.values()) {
      list.sort((a, b) => a[0] - b[0])
      let end = 0
      for (const [from, to] of list) { bytes += Math.max(0, to - Math.max(from, end)); end = Math.max(end, to) }
    }
    return bytes
  }
}

const channels = new Map<number, number>([
  [THREE.AlphaFormat, 1], [THREE.RedFormat, 1], [THREE.RedIntegerFormat, 1], [THREE.DepthFormat, 1],
  [THREE.RGFormat, 2], [THREE.RGIntegerFormat, 2], [THREE.RGBFormat, 3], [THREE.RGBIntegerFormat, 3],
  [THREE.RGBAFormat, 4], [THREE.RGBAIntegerFormat, 4],
])
const componentBytes = new Map<number, number>([
  [THREE.UnsignedByteType, 1], [THREE.ByteType, 1], [THREE.ShortType, 2], [THREE.UnsignedShortType, 2],
  [THREE.HalfFloatType, 2], [THREE.IntType, 4], [THREE.UnsignedIntType, 4], [THREE.FloatType, 4],
])
function pixelBytes(texture: THREE.Texture) {
  if (texture.type === THREE.UnsignedShort4444Type || texture.type === THREE.UnsignedShort5551Type) return 2
  if (texture.type === THREE.UnsignedInt248Type || texture.type === THREE.UnsignedInt5999Type || texture.type === THREE.UnsignedInt101111Type) return 4
  const count = channels.get(texture.format), bytes = componentBytes.get(texture.type)
  return count && bytes ? count * bytes : null
}
function dimensions(image: RecordLike) {
  const width = Number(image.videoWidth ?? image.naturalWidth ?? image.width)
  const height = Number(image.videoHeight ?? image.naturalHeight ?? image.height)
  const depth = Number(image.depth ?? 1)
  return [width, height, depth].every(n => Number.isInteger(n) && n > 0) ? [width, height, depth] : null
}

/** Visits invisible descendants as well. No renderer, browser, upload, or scene mutation. */
function collect(root: THREE.Object3D) {
  const geometry = new ByteRanges(), textureData = new ByteRanges()
  const attributes = new Set<object>(), geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>()
  const objects: THREE.Object3D[] = [], inferred = new Map<object, Map<string, number>>()
  let geometryByteUnknowns = 0, textureByteUnknowns = 0, practicalLights = 0, practicalShadows = 0
  function attribute(value: unknown) {
    const a = record(value)
    if (!a || attributes.has(a)) return
    attributes.add(a)
    const source = a.isInterleavedBufferAttribute ? record(a.data)?.array : a.array
    if (!geometry.add(source)) geometryByteUnknowns++
  }
  function estimate(key: object, variant: string, bytes: number) {
    const values = inferred.get(key) || new Map<string, number>()
    values.set(variant, Math.max(values.get(variant) || 0, bytes)); inferred.set(key, values)
  }
  function imagePayload(value: unknown, texture: THREE.Texture, generateMipmaps: boolean) {
    let image = record(value)
    if (image?.isDataTexture) image = record(image.image)
    if (!image) return false
    const data = image.data, size = dimensions(image), bpp = pixelBytes(texture)
    const raw = textureData.add(data)
    // Actual compressed mip arrays need no guessed block compression ratio.
    if (!raw && (!size || !bpp)) return false
    const key = raw ? (data as ArrayBufferView).buffer : image
    const range = raw ? `${(data as ArrayBufferView).byteOffset}:${(data as ArrayBufferView).byteLength}` : 'image'
    if (!raw && size && bpp) estimate(key, `${range}:base:${texture.format}:${texture.type}`, size[0] * size[1] * size[2] * bpp)
    if (generateMipmaps) {
      if (!size || !bpp) return false
      let [w, h, d] = size, mipBytes = 0
      const volume = Boolean((texture as THREE.Data3DTexture).isData3DTexture)
      while (w > 1 || h > 1 || volume && d > 1) {
        w = Math.max(1, Math.floor(w / 2)); h = Math.max(1, Math.floor(h / 2))
        if (volume) d = Math.max(1, Math.floor(d / 2))
        mipBytes += w * h * d * bpp
      }
      estimate(key, `${range}:mips:${size.join('x')}:${texture.format}:${texture.type}:${volume}`, mipBytes)
    }
    return true
  }
  function texture(value: unknown) {
    if (!record(value)?.isTexture) return
    const t = value as THREE.Texture
    if (textures.has(t)) return
    textures.add(t)
    let known = true
    if (t.isRenderTargetTexture) known = false // Renderer-owned targets are outside this payload estimate.
    else if ((t as THREE.CubeTexture).isCubeTexture) {
      // Explicit cube mip conventions vary; disclose unsupported data rather than guess.
      if (t.mipmaps.length || !Array.isArray(t.image) || t.image.length !== 6) known = false
      else for (const face of t.image) if (!imagePayload(face, t, t.generateMipmaps)) known = false
    } else if (t.mipmaps.length) {
      for (const mip of t.mipmaps) if (!imagePayload(mip, t, false)) known = false
    } else if (!imagePayload(t.image, t, t.generateMipmaps)) known = false
    if (!known) textureByteUnknowns++
  }
  function material(m: THREE.Material) {
    if (materials.has(m)) return
    materials.add(m)
    for (const value of Object.values(m)) texture(value)
    // Shader uniforms may nest texture arrays/structs. Avoid following arbitrary material internals.
    const visited = new Set<object>()
    function uniform(value: unknown) {
      if (ArrayBuffer.isView(value)) return
      const item = record(value)
      if (!item || visited.has(item)) return
      visited.add(item)
      if (item.isTexture) texture(item)
      else for (const child of Object.values(item)) uniform(child)
    }
    uniform((m as THREE.ShaderMaterial).uniforms)
  }
  root.traverse(object => {
    objects.push(object)
    const renderable = object as THREE.Mesh & THREE.InstancedMesh
    const g = renderable.geometry
    if (g?.isBufferGeometry && !geometries.has(g)) {
      geometries.add(g); attribute(g.index)
      for (const a of Object.values(g.attributes)) attribute(a)
      for (const list of Object.values(g.morphAttributes)) for (const a of list || []) attribute(a)
    }
    attribute(renderable.instanceMatrix); attribute(renderable.instanceColor)
    if (Array.isArray(renderable.material)) renderable.material.forEach(material)
    else if (renderable.material) material(renderable.material)
    if ((object as THREE.PointLight).isPointLight || (object as THREE.SpotLight).isSpotLight) {
      practicalLights++; if ((object as THREE.Light).castShadow) practicalShadows++
    }
  })
  let textureBytes = textureData.bytes()
  for (const values of inferred.values()) for (const bytes of values.values()) textureBytes += bytes
  const totals: Totals = { geometryBytes: geometry.bytes(), textureBytes, geometryByteUnknowns, textureByteUnknowns, resourceByteScope: 'authored-buffer-and-texture-payload', practicalLights, practicalShadows }
  return { totals, objects, geometries, materials, textures }
}

export function estimateAuthoredResources(root: THREE.Object3D): Totals { return collect(root).totals }

// A pixel upload can increment Texture.version every frame without allocating
// a different payload. Snapshot only its footprint, so those uploads stay cheap.
function textureFootprintChanged(texture: THREE.Texture) {
  const image = texture.image, mipmaps = texture.mipmaps, length = mipmaps.length
  const format = texture.format, type = texture.type, generate = texture.generateMipmaps
  const fields = ['data', 'width', 'height', 'depth', 'naturalWidth', 'naturalHeight', 'videoWidth', 'videoHeight', 'image']
  const snapshots: { object: RecordLike; values: unknown[] }[] = []
  function remember(value: unknown) {
    if (Array.isArray(value)) { for (const child of value) remember(child); return }
    const item = record(value)
    if (!item) return
    snapshots.push({ object: item, values: fields.map(key => item[key]) })
    if (item.isDataTexture) remember(item.image)
  }
  remember(image); remember(mipmaps)
  const faces = Array.isArray(image) ? image.slice() : null
  const levels = mipmaps.slice()
  return () => {
    if (texture.image !== image || texture.mipmaps !== mipmaps || mipmaps.length !== length || texture.format !== format || texture.type !== type || texture.generateMipmaps !== generate) return true
    if (faces && Array.isArray(image)) {
      if (image.length !== faces.length) return true
      for (let i = 0; i < faces.length; i++) if (image[i] !== faces[i]) return true
    }
    for (let i = 0; i < levels.length; i++) if (mipmaps[i] !== levels[i]) return true
    for (const snapshot of snapshots) for (let i = 0; i < fields.length; i++) if (snapshot.object[fields[i]] !== snapshot.values[i]) return true
    return false
  }
}

/** Static allocations are authored per module/quality/layer state; transforms and visibility do not invalidate. */
export class AuthoredResourceCache {
  private root: THREE.Object3D | null = null
  private dirty = true
  private totals: Totals | null = null
  private cleanup: (() => void)[] = []
  private versions: { resource: THREE.Texture | THREE.Material; version: number; sourceVersion?: number; footprintChanged?: () => boolean }[] = []
  invalidate = () => { this.dirty = true }
  read(root: THREE.Object3D): Totals {
    if (this.root !== root) this.dirty = true
    if (!this.dirty) for (const entry of this.versions) {
      const sourceVersion = entry.resource instanceof THREE.Texture ? entry.resource.source.version : undefined
      if (entry.resource.version !== entry.version || sourceVersion !== entry.sourceVersion) {
        if (!entry.footprintChanged || entry.footprintChanged()) { this.dirty = true; break }
        entry.version = entry.resource.version; entry.sourceVersion = sourceVersion
      }
    }
    if (this.dirty || !this.totals) {
      this.dispose(); this.root = root
      const data = collect(root)
      this.totals = data.totals
      for (const object of data.objects) {
        object.addEventListener('childadded', this.invalidate); object.addEventListener('childremoved', this.invalidate)
        this.cleanup.push(() => { object.removeEventListener('childadded', this.invalidate); object.removeEventListener('childremoved', this.invalidate) })
      }
      for (const resource of [...data.geometries, ...data.materials, ...data.textures]) {
        resource.addEventListener('dispose', this.invalidate)
        this.cleanup.push(() => resource.removeEventListener('dispose', this.invalidate))
      }
      this.versions = [...data.materials, ...data.textures].map(resource => ({ resource, version: resource.version, sourceVersion: resource instanceof THREE.Texture ? resource.source.version : undefined, footprintChanged: resource instanceof THREE.Texture ? textureFootprintChanged(resource) : undefined }))
      this.dirty = false
    }
    return this.totals
  }
  dispose() {
    for (const remove of this.cleanup) remove()
    this.cleanup = []; this.versions = []; this.root = null; this.totals = null; this.dirty = true
  }
}
