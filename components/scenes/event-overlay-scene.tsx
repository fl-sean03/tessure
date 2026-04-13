"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { Html } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import { Camera, UAV, Sensor, Radar } from "../shared/sensor-models"
import * as THREE from "three"

type EventOverlaySceneProps = {
  onDeviceClick?: (deviceName: string) => void
}

// Animated stage light with sweeping beam
function StageLight({ position, color, intensity = 2.5 }: { position: [number, number, number]; color: string; intensity?: number }) {
  const lightRef = useRef<THREE.SpotLight>(null)
  const targetRef = useRef({ x: 0, z: 0 })

  useFrame((state) => {
    if (lightRef.current) {
      targetRef.current.x = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 20
      targetRef.current.z = Math.cos(state.clock.elapsedTime * 0.3 + position[2]) * 15
      lightRef.current.target.position.set(targetRef.current.x, 0, targetRef.current.z)
      lightRef.current.target.updateMatrixWorld()
    }
  })

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      <spotLight
        ref={lightRef}
        position={[0, -0.5, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={intensity}
        color={color}
        distance={60}
        castShadow
      />
    </group>
  )
}

// LED screen with animated content
function LEDScreen({ position, size, color }: { position: [number, number, number]; size: [number, number]; color: string }) {
  const screenRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
  })

  return (
    <mesh ref={screenRef} position={position}>
      <boxGeometry args={[size[0], size[1], 0.3]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  )
}

// Animated crowd density visualization
function CrowdDensityZone({ position, phase, density }: { position: [number, number, number]; phase: string; density: number }) {
  const zoneRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (zoneRef.current) {
      const mat = zoneRef.current.material as THREE.MeshBasicMaterial
      if (phase === "detected" || phase === "verifying" || phase === "verified" || phase === "responding") {
        mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.1
        mat.color.setHex(density > 6 ? 0xEF4444 : density > 4 ? 0xF59E0B : 0x22C55E)
      } else {
        mat.opacity = 0.05
        mat.color.setHex(0x22C55E)
      }
    }
  })

  return (
    <mesh ref={zoneRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[8, 32]} />
      <meshBasicMaterial color="#22C55E" transparent opacity={0.05} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Animated crowd cluster
function CrowdCluster({ position, count, phase }: { position: [number, number, number]; count: number; phase: string }) {
  const clusterRef = useRef<Group>(null)

  const people = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 6,
      height: 0.8 + Math.random() * 0.4,
      offset: Math.random() * Math.PI * 2,
    }))
  }, [count])

  useFrame((state) => {
    if (clusterRef.current) {
      clusterRef.current.children.forEach((child, i) => {
        const mesh = child as Mesh
        const p = people[i]
        mesh.position.y = p.height / 2 + Math.sin(state.clock.elapsedTime * 2 + p.offset) * 0.05
      })
    }
  })

  const crowdColor = phase === "responding" ? "#F59E0B" : phase === "verified" ? "#DC2626" : "#6B7280"

  return (
    <group ref={clusterRef} position={position}>
      {people.map((p, i) => (
        <mesh key={i} position={[p.x, p.height / 2, p.z]}>
          <capsuleGeometry args={[0.15, p.height * 0.6, 4, 8]} />
          <meshStandardMaterial
            color={crowdColor}
            emissive={phase !== "idle" ? crowdColor : "#000000"}
            emissiveIntensity={phase !== "idle" ? 0.3 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function EventOverlayScene({ onDeviceClick }: EventOverlaySceneProps) {
  const {
    isActive,
    phase,
    setIntruderPosition,
    setPhase,
    addDetectedSensor,
    addTrackingCamera,
    dispatchDrone,
    addSystemLog,
    trackingCameras,
    dispatchedDrones,
    detectedSensors,
  } = useScenarioStore()
  const crowdRef = useRef<Group>(null)
  const pathProgress = useRef(0)

  // Crowd surge path toward stage
  const crowdPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-18, 0, 20),
      new THREE.Vector3(-14, 0, 16),
      new THREE.Vector3(-8, 0, 10),
      new THREE.Vector3(-3, 0, 4),
      new THREE.Vector3(0, 0, -2),
      new THREE.Vector3(2, 0, -6),
    ])
  }, [])

  useFrame((state, delta) => {
    if (!crowdRef.current || !isActive) {
      pathProgress.current = 0
      return
    }

    pathProgress.current += delta * 0.025
    if (pathProgress.current > 1) pathProgress.current = 0

    const point = crowdPath.getPoint(pathProgress.current)
    crowdRef.current.position.lerp(point, 0.06)
    setIntruderPosition([point.x, point.y, point.z])

    const progress = pathProgress.current * 100

    if (progress > 12 && phase === "idle") {
      setPhase("detected")
      addDetectedSensor("crowd-analytics")
      addSystemLog({ type: "alert", message: "Crowd density: 7 people/sqm in Zone B - DANGER THRESHOLD EXCEEDED" })
      setTimeout(() => {
        addDetectedSensor("flow-detector")
        addSystemLog({ type: "alert", message: "Wrong-way flow: 12 individuals pushing upstream in Corridor 3" })
      }, 1000)
      setTimeout(() => {
        addSystemLog({ type: "alert", message: "Thermal imaging: Body heat concentration confirmed" })
      }, 2000)
    }

    if (progress > 30 && phase === "detected") {
      setPhase("verifying")
      addTrackingCamera("cam-overhead-b")
      addSystemLog({ type: "verifying", message: "Overhead view: Crowd compression visible, no clear egress path" })
      setTimeout(() => {
        addSystemLog({ type: "verifying", message: "Wrong-way analysis: 8 intoxicated, 4 moving toward restricted backstage" })
      }, 1200)
      setTimeout(() => {
        addSystemLog({ type: "verifying", message: "Medical risk: MODERATE - Heat stress + compression factors" })
      }, 2400)
    }

    if (progress > 48 && phase === "verifying") {
      setPhase("verified")
      dispatchDrone("uav-event")
      addSystemLog({ type: "verified", message: "CROWD SURGE CONFIRMED - 200+ individuals, stampede risk HIGH" })
      setTimeout(() => {
        addSystemLog({ type: "verified", message: "No weapons visible - Medical standby team alerted" })
      }, 800)
    }

    if (progress > 62 && phase === "verified") {
      setPhase("responding")
      addSystemLog({ type: "responding", message: "PA ANNOUNCEMENT: 'Please step back from Stage B for safety'" })
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Stage lighting adjusted to encourage crowd dispersal" })
      }, 800)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Security teams dispatched to Zone B and Corridor 3" })
      }, 1600)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "VIP area access temporarily locked" })
      }, 2400)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Crowd density reducing: 4.2 people/sqm - SAFE LEVELS RESTORED" })
      }, 4000)
    }
  })

  return (
    <group>
      {/* ========== GROUND ========== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#1A3D25" metalness={0.05} roughness={0.98} />
      </mesh>

      {/* Event grounds */}
      <mesh position={[0, 0.03, 5]} receiveShadow>
        <boxGeometry args={[70, 0.06, 50]} />
        <meshStandardMaterial color="#3D2B1F" metalness={0.1} roughness={0.92} />
      </mesh>

      {/* Stage pit area */}
      <mesh position={[0, 0.04, -5]} receiveShadow>
        <boxGeometry args={[40, 0.02, 12]} />
        <meshStandardMaterial color="#2D1F1A" metalness={0.15} roughness={0.88} />
      </mesh>

      {/* ========== MAIN STAGE ========== */}
      <group position={[0, 0, -18]}>
        {/* Stage platform */}
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[40, 6, 15]} />
          <meshStandardMaterial color="#0A0A0A" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Stage front edge */}
        <mesh position={[0, 0.5, 7.5]} castShadow>
          <boxGeometry args={[40, 1, 0.5]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Stage backdrop */}
        <mesh position={[0, 10, -7]} castShadow>
          <boxGeometry args={[38, 14, 2]} />
          <meshStandardMaterial color="#050505" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Main LED screen */}
        <LEDScreen position={[0, 10, -5.9]} size={[32, 10]} color="#1D4ED8" />

        {/* Side LED screens */}
        <LEDScreen position={[-17, 8, -5.5]} size={[4, 6]} color="#7C3AED" />
        <LEDScreen position={[17, 8, -5.5]} size={[4, 6]} color="#7C3AED" />

        {/* Stage roof */}
        <mesh position={[0, 18, -3]} castShadow>
          <boxGeometry args={[44, 1.5, 20]} />
          <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Stage truss towers */}
        {[[-18, 0, 5], [18, 0, 5], [-18, 0, -8], [18, 0, -8]].map((pos, i) => (
          <mesh key={`truss-${i}`} position={[pos[0], 9, pos[2]]} castShadow>
            <boxGeometry args={[1.5, 18, 1.5]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* Speaker arrays */}
        {[-12, 0, 12].map((x, i) => (
          <mesh key={`speaker-${i}`} position={[x, 13, 3]} castShadow>
            <boxGeometry args={[2, 4, 2]} />
            <meshStandardMaterial color="#0A0A0A" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ========== SPEAKER TOWERS ========== */}
      {[[-25, 0, -15], [25, 0, -15]].map((pos, i) => (
        <group key={`speaker-tower-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 6, 0]} castShadow>
            <boxGeometry args={[4, 12, 4]} />
            <meshStandardMaterial color="#0F0F0F" metalness={0.6} roughness={0.4} />
          </mesh>
          {[3, 6, 9, 12].map((y, j) => (
            <mesh key={`speaker-unit-${j}`} position={[i === 0 ? 2.1 : -2.1, y, 0]}>
              <boxGeometry args={[0.3, 2, 3]} />
              <meshStandardMaterial color="#0A0A0A" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ========== LIGHTING TOWERS WITH ANIMATED LIGHTS ========== */}
      {[[-32, 0, -10], [32, 0, -10], [-32, 0, 15], [32, 0, 15], [-32, 0, 35], [32, 0, 35]].map((pos, i) => (
        <group key={`light-tower-${i}`} position={pos as [number, number, number]}>
          {/* Tower base */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[3, 1, 3]} />
            <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Tower pole */}
          <mesh position={[0, 10, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.45, 18, 16]} />
            <meshStandardMaterial color="#4B5563" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Light platform */}
          <mesh position={[0, 19.5, 0]} castShadow>
            <boxGeometry args={[3, 0.5, 3]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Stage lights */}
          <StageLight
            position={[0, 18.5, 0]}
            color={["#FBBF24", "#3B82F6", "#EC4899", "#22C55E"][i % 4]}
          />
        </group>
      ))}

      {/* ========== VIP PLATFORM ========== */}
      <group position={[-28, 0, 5]}>
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 5, 18]} />
          <meshStandardMaterial color="#1E1B4B" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* VIP railing */}
        <mesh position={[0, 5.3, 9]} castShadow>
          <boxGeometry args={[14, 0.8, 0.12]} />
          <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.3} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[7, 5.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.8, 18]} />
          <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.3} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* VIP lounge */}
        <mesh position={[-3, 7, -5]} castShadow>
          <boxGeometry args={[8, 4, 8]} />
          <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* VIP sign */}
        <mesh position={[7.01, 4, 5]}>
          <boxGeometry args={[0.1, 2, 4]} />
          <meshStandardMaterial color="#D946EF" emissive="#D946EF" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* ========== VENDOR VILLAGE ========== */}
      {[[35, 0, -10], [35, 0, 2], [35, 0, 14], [35, 0, 26]].map((pos, i) => (
        <group key={`vendor-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 3, 0]} castShadow>
            <boxGeometry args={[7, 6, 8]} />
            <meshStandardMaterial color="#FAFAFA" metalness={0.1} roughness={0.92} />
          </mesh>
          <mesh position={[0, 6.8, 0]} castShadow>
            <coneGeometry args={[6, 3, 4]} />
            <meshStandardMaterial
              color={["#DC2626", "#1D4ED8", "#16A34A", "#EA580C"][i]}
              metalness={0.25}
              roughness={0.75}
            />
          </mesh>
        </group>
      ))}

      {/* ========== ENTRY GATES ========== */}
      {[[-22, 0, 38], [0, 0, 38], [22, 0, 38]].map((pos, i) => (
        <group key={`gate-${i}`} position={pos as [number, number, number]}>
          {[-4, 4].map((x, j) => (
            <mesh key={`post-${j}`} position={[x, 3.5, 0]} castShadow>
              <boxGeometry args={[1, 7, 1]} />
              <meshStandardMaterial color="#1E3A8A" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 7.2, 0]} castShadow>
            <boxGeometry args={[9, 0.6, 0.6]} />
            <meshStandardMaterial color="#2563EB" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Turnstiles */}
          {[-2, 0, 2].map((x, j) => (
            <mesh key={`turnstile-${j}`} position={[x, 1.5, 1.5]} castShadow>
              <boxGeometry args={[1.2, 3, 0.8]} />
              <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ========== CROWD CONTROL BARRIERS ========== */}
      <mesh position={[0, 0.75, -8]} castShadow>
        <boxGeometry args={[44, 1.5, 0.4]} />
        <meshStandardMaterial color="#EA580C" metalness={0.7} roughness={0.3} />
      </mesh>
      {[
        { pos: [0, 0.75, 32], size: [70, 1.5, 0.4] },
        { pos: [0, 0.75, -28], size: [70, 1.5, 0.4] },
        { pos: [40, 0.75, 2], size: [0.4, 1.5, 60] },
        { pos: [-40, 0.75, 2], size: [0.4, 1.5, 60] },
      ].map((barrier, i) => (
        <mesh key={`barrier-${i}`} position={barrier.pos as [number, number, number]} castShadow>
          <boxGeometry args={barrier.size as [number, number, number]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* ========== SOUND BOOTH ========== */}
      <group position={[0, 0, 15]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[8, 4, 6]} />
          <meshStandardMaterial color="#171717" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 4.2, 2]}>
          <boxGeometry args={[6, 0.4, 2]} />
          <meshStandardMaterial color="#0F0F0F" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ========== MEDICAL TENT ========== */}
      <group position={[-38, 0, 28]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[8, 5, 10]} />
          <meshStandardMaterial color="#FAFAFA" metalness={0.1} roughness={0.92} />
        </mesh>
        {/* Red cross */}
        <mesh position={[4.01, 3, 0]}>
          <boxGeometry args={[0.1, 3, 0.8]} />
          <meshStandardMaterial color="#DC2626" emissive="#DC2626" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[4.01, 3, 0]}>
          <boxGeometry args={[0.1, 0.8, 3]} />
          <meshStandardMaterial color="#DC2626" emissive="#DC2626" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* ========== CROWD DENSITY ZONES ========== */}
      <CrowdDensityZone position={[-5, 0.1, 0]} phase={phase} density={7} />
      <CrowdDensityZone position={[8, 0.1, 5]} phase={phase} density={4} />

      {/* ========== SENSORS & CAMERAS ========== */}
      <Camera position={[-18, 16, -18]} rotation={[0, Math.PI / 3, 0]} onDeviceClick={onDeviceClick} id="stage-left" isTracking={trackingCameras.includes("cam-stage-left")} />
      <Camera position={[18, 16, -18]} rotation={[0, -Math.PI / 3, 0]} onDeviceClick={onDeviceClick} id="stage-right" isTracking={trackingCameras.includes("cam-stage-right")} />
      <Camera position={[-32, 18, -10]} rotation={[0, Math.PI / 4, 0]} onDeviceClick={onDeviceClick} id="overhead-b" isTracking={trackingCameras.includes("cam-overhead-b")} />
      <Camera position={[32, 18, -10]} rotation={[0, -Math.PI / 4, 0]} onDeviceClick={onDeviceClick} id="overhead-2" isTracking={trackingCameras.includes("cam-overhead-2")} />
      <Camera position={[-32, 18, 15]} rotation={[0, Math.PI / 6, 0]} onDeviceClick={onDeviceClick} id="overhead-3" isTracking={trackingCameras.includes("cam-overhead-3")} />
      <Camera position={[32, 18, 15]} rotation={[0, -Math.PI / 6, 0]} onDeviceClick={onDeviceClick} id="overhead-4" isTracking={trackingCameras.includes("cam-overhead-4")} />
      <Camera position={[-22, 7, 38]} rotation={[0, Math.PI, 0]} onDeviceClick={onDeviceClick} id="gate-1" isTracking={trackingCameras.includes("cam-gate-1")} />
      <Camera position={[0, 7, 38]} rotation={[0, Math.PI, 0]} onDeviceClick={onDeviceClick} id="gate-2" isTracking={trackingCameras.includes("cam-gate-2")} />
      <Camera position={[22, 7, 38]} rotation={[0, Math.PI, 0]} onDeviceClick={onDeviceClick} id="gate-3" isTracking={trackingCameras.includes("cam-gate-3")} />
      <Camera position={[-21, 6, 5]} rotation={[0, Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="vip" isTracking={trackingCameras.includes("cam-vip")} />

      <Sensor position={[-12, 1.5, 5]} onDeviceClick={onDeviceClick} id="crowd-analytics" isDetecting={detectedSensors.includes("crowd-analytics")} />
      <Sensor position={[5, 1.5, 10]} onDeviceClick={onDeviceClick} id="flow-detector" isDetecting={detectedSensors.includes("flow-detector")} />
      <Sensor position={[-8, 1.5, -5]} onDeviceClick={onDeviceClick} id="density-b" isDetecting={detectedSensors.includes("density-b")} />
      <Sensor position={[0, 1.5, 30]} onDeviceClick={onDeviceClick} id="entry-sensor" isDetecting={detectedSensors.includes("entry-sensor")} />

      <Radar position={[0, 20, -18]} onDeviceClick={onDeviceClick} id="stage" />

      <UAV position={[0, 28, 5]} onDeviceClick={onDeviceClick} id="event" type="rapid-response" isDispatched={dispatchedDrones.includes("uav-event")} />
      <UAV position={[-20, 25, 25]} onDeviceClick={onDeviceClick} id="patrol" type="patrol" isDispatched={dispatchedDrones.includes("uav-patrol")} />

      {/* ========== ANIMATED CROWD SURGE ========== */}
      {isActive && (
        <group ref={crowdRef}>
          <CrowdCluster position={[0, 0, 0]} count={25} phase={phase} />
          <pointLight position={[0, 3, 0]} intensity={phase === "responding" ? 3 : 1.5} color={phase === "responding" ? "#F59E0B" : "#EF4444"} distance={12} />
          <Html distanceFactor={15} position={[0, 4, 0]}>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${
              phase === "responding" ? "bg-amber-500 text-black" : phase === "verified" ? "bg-red-600 text-white animate-pulse" : "bg-red-500/90 text-white"
            }`}>
              {phase === "responding" ? "CROWD DISPERSING - 4.2/sqm" : "CROWD SURGE - 7+/sqm DANGER"}
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}
