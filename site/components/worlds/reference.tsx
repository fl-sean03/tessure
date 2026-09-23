'use client'
import { useMemo } from 'react'
import type { WorldProps } from './contract'
import { Box, Instances, Motion, Person, Sensor, Marker, type Instance } from './primitives'
import { seeded } from './math'

/** Small reproducible reference slice for the shared runtime, replaced per scene. */
export function ReferenceWorld({ clock, layers, quality }: WorldProps) {
  const containers = useMemo<Instance[]>(() => Array.from({ length: 32 }, (_, i) => ({ position: [-20 + (i % 8) * 5.5, 2 + Math.floor(i / 16) * 3.1, -14 + (Math.floor(i / 8) % 2) * 27], scale: [4.8, 3, 9] })), [])
  const ribs = useMemo<Instance[]>(() => containers.flatMap(c => Array.from({ length: 10 }, (_, j) => ({ position: [c.position[0] - 2.2 + j * 0.48, c.position[1], c.position[2] + 4.55], scale: [0.1, 2.8, 0.12] }))), [containers])
  const trees = useMemo<Instance[]>(() => Array.from({ length: quality === 'high' ? 60 : 24 }, (_, i) => ({ position: [-38 + seeded(i) * 76, 2 + seeded(i + 20) * 2, (i % 2 ? 1 : -1) * (24 + seeded(i + 6) * 8)], scale: [2 + seeded(i + 2) * 3, 4 + seeded(i + 3) * 4, 2 + seeded(i + 2) * 3] })), [quality])
  return <group>
    <Box position={[0, -1.5, 0]} size={[90, 3, 72]} color="#a5b39b" />
    <Box position={[0, 0.02, 0]} size={[70, 0.15, 46]} color="#adb4a7" />
    <Box position={[0, 0.12, 0]} size={[78, 0.12, 8]} color="#737e79" />
    <Instances items={containers} color="#a27156" />
    {quality === 'high' && <Instances items={ribs} color="#bb8e6d" />}
    <Instances items={trees} geometry="cone" color="#697d66" />
    <Box position={[27, 3, -15]} size={[11, 6, 14]} color="#dddacb" />
    <Box position={[27, 6.2, -15]} size={[11.6, 0.4, 14.6]} color="#6a7771" />
    <Instances items={Array.from({ length: 5 }, (_, i) => ({ position: [23 + i * 2, 3.4, -7.95], scale: [1.2, 2.4, 0.1] }))} color="#516d70" />
    <Box position={[-5, 12, -12]} size={[1, 24, 1]} color="#546764" />
    <Box position={[-5, 12, 12]} size={[1, 24, 1]} color="#546764" />
    <Box position={[-5, 24, 0]} size={[2, 2, 28]} color="#667b72" />
    <Sensor position={[15, 0, 5]} />
    <Sensor position={[-20, 0, -5]} />
    <Motion clock={clock} points={[{ at: 0, position: [-25, 0.25, 0] }, { at: 22, position: [5, 0.25, 0] }, { at: 44, position: [14, 0.25, 0] }]}>
      <Box position={[0, 1.5, 0]} size={[2.8, 2.4, 7]} color="#ebe4c7" />
      <Box position={[0, 2.8, 2.5]} size={[2.6, 1, 1.4]} color="#416c72" />
      <Instances items={[-1,1].flatMap(x => [-2.2,2.2].map(z => ({ position: [x * 1.4, 0.65, z] as [number,number,number], scale: [0.4, 1.3, 1.3] as [number,number,number], rotation: [0,0,Math.PI/2] as [number,number,number] })))} geometry="cylinder" color="#34423e" />
    </Motion>
    <group position={[19, 0.2, 4]}><Person color="#dcb773" /></group>
    {layers.sensors && <><Marker position={[15, 0.35, 5]} radius={10} color="#518b80" /><Marker position={[-20, 0.35, -5]} radius={12} color="#518b80" /></>}
    {layers.tracks && <Box position={[0, 0.27, 0]} size={[64, 0.015, 0.12]} color="#efcf8b" castShadow={false} />}
  </group>
}
