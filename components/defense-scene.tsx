"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Grid, Stars, ContactShadows } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import PrivateEstateScene from "./scenes/private-estate-scene"
import DataCenterScene from "./scenes/data-center-scene"
import ResortMarinaScene from "./scenes/resort-marina-scene"
import EventOverlayScene from "./scenes/event-overlay-scene"
import LogisticsYardScene from "./scenes/logistics-yard-scene"
import CriticalInfrastructureScene from "./scenes/critical-infrastructure-scene"
import * as THREE from "three"

type DefenseSceneProps = {
  onDeviceClick?: (deviceName: string) => void
}

// Animated ground grid with phase-based effects
function AnimatedGrid({ phase }: { phase: string }) {
  const gridColor = phase === "responding" ? "#EF4444" : phase === "verified" ? "#F59E0B" : "#3B82F6"

  return (
    <Grid
      args={[140, 140]}
      cellSize={2}
      cellThickness={0.5}
      cellColor="#334155"
      sectionSize={10}
      sectionThickness={1}
      sectionColor={gridColor}
      fadeDistance={120}
      fadeStrength={1.2}
      position={[0, 0.02, 0]}
    />
  )
}

// Ambient particles for atmosphere
function AmbientParticles({ count = 200 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120
    positions[i * 3 + 1] = Math.random() * 30 + 5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 120
  }

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.01
      const positions = points.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002
      }
      points.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#64748B" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

// Phase-based lighting
function DynamicLighting({ phase }: { phase: string }) {
  const mainLightRef = useRef<THREE.DirectionalLight>(null)
  const alertLightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (alertLightRef.current) {
      if (phase === "responding" || phase === "verified") {
        alertLightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 4) * 1.5
      } else if (phase === "detected" || phase === "verifying") {
        alertLightRef.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.5
      } else {
        alertLightRef.current.intensity = 0
      }
    }
  })

  const alertColor =
    phase === "responding" ? "#EF4444" : phase === "verified" ? "#F59E0B" : phase === "detected" ? "#FBBF24" : "#3B82F6"

  return (
    <>
      {/* Main directional light - soft daylight */}
      <directionalLight
        ref={mainLightRef}
        position={[30, 40, 20]}
        intensity={2}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={150}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0001}
      />

      {/* Fill light from opposite side */}
      <directionalLight position={[-30, 20, -20]} intensity={0.8} color="#E0F2FE" />

      {/* Ambient base light */}
      <ambientLight intensity={0.5} color="#F1F5F9" />

      {/* Cool blue accent light */}
      <pointLight position={[-25, 20, -25]} intensity={0.6} color="#3B82F6" distance={80} />

      {/* Warm accent light */}
      <pointLight position={[25, 15, 25]} intensity={0.4} color="#F59E0B" distance={60} />

      {/* Phase-based alert light */}
      <pointLight ref={alertLightRef} position={[0, 30, 0]} intensity={0} color={alertColor} distance={100} />

      {/* Rim light for depth */}
      <pointLight position={[0, 5, -60]} intensity={0.3} color="#94A3B8" distance={80} />
    </>
  )
}

export default function DefenseScene({ onDeviceClick }: DefenseSceneProps) {
  const { currentScenario, phase, isActive } = useScenarioStore()

  // Background color based on phase
  const bgColor =
    phase === "responding"
      ? "#1a0a0a"
      : phase === "verified"
        ? "#1a150a"
        : phase === "detected" || phase === "verifying"
          ? "#0f172a"
          : "#0f172a"

  // Fog color matching phase
  const fogColor =
    phase === "responding"
      ? "#2d1515"
      : phase === "verified"
        ? "#2d2515"
        : phase === "detected" || phase === "verifying"
          ? "#1e293b"
          : "#1e293b"

  return (
    <>
      <color attach="background" args={[bgColor]} />

      <DynamicLighting phase={phase} />

      <Environment preset="night" background={false} />

      {/* Subtle stars in background */}
      <Stars radius={150} depth={80} count={1500} factor={3} saturation={0} fade speed={0.5} />

      {/* Atmospheric fog */}
      <fog attach="fog" args={[fogColor, 50, 150]} />

      {/* Animated grid */}
      <AnimatedGrid phase={phase} />

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={150}
        blur={2}
        far={50}
        color="#000000"
      />

      {/* Ambient particles */}
      <AmbientParticles count={150} />

      {/* Scene content */}
      {currentScenario === "private-estate" && <PrivateEstateScene onDeviceClick={onDeviceClick} />}
      {currentScenario === "data-center" && <DataCenterScene onDeviceClick={onDeviceClick} />}
      {currentScenario === "resort-marina" && <ResortMarinaScene onDeviceClick={onDeviceClick} />}
      {currentScenario === "event-overlay" && <EventOverlayScene onDeviceClick={onDeviceClick} />}
      {currentScenario === "logistics-yard" && <LogisticsYardScene onDeviceClick={onDeviceClick} />}
      {currentScenario === "critical-infrastructure" && <CriticalInfrastructureScene onDeviceClick={onDeviceClick} />}

      {/* Enhanced orbit controls with smooth damping */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={20}
        maxDistance={120}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={Math.PI / 8}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
      />
    </>
  )
}
