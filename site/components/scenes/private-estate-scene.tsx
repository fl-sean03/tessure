"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { Html } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import { Camera, UAV, Sensor, Radar } from "../shared/sensor-models"
import * as THREE from "three"

type PrivateEstateSceneProps = {
  onDeviceClick?: (deviceName: string) => void
}

// Animated lamp with flickering
function AnimatedLamp({ position, phase }: { position: [number, number, number]; phase: string }) {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (lightRef.current) {
      const flicker = phase === "responding" ? Math.sin(state.clock.elapsedTime * 8) * 0.3 : 0
      lightRef.current.intensity = phase === "responding" ? 3 + flicker : 0.8
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
        <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.5]} />
        <meshStandardMaterial
          color={phase === "responding" ? "#FEF3C7" : "#FDE68A"}
          emissive={phase === "responding" ? "#FCD34D" : "#FDE68A"}
          emissiveIntensity={phase === "responding" ? 1 : 0.3}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 4.5, 0]}
        intensity={0.8}
        color={phase === "responding" ? "#F59E0B" : "#FDE68A"}
        distance={15}
      />
    </group>
  )
}

// Animated tree with subtle sway
function Tree({ position }: { position: [number, number, number] }) {
  const treeRef = useRef<Group>(null)

  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02
    }
  })

  return (
    <group ref={treeRef} position={position}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 6, 8]} />
        <meshStandardMaterial color="#4A3728" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[0, 7, 0]} castShadow>
        <coneGeometry args={[3, 7, 8]} />
        <meshStandardMaterial color="#1B4332" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 5.5, 0]} castShadow>
        <coneGeometry args={[2.5, 4, 8]} />
        <meshStandardMaterial color="#2D5A45" roughness={0.85} metalness={0.05} />
      </mesh>
    </group>
  )
}

export default function PrivateEstateScene({ onDeviceClick }: PrivateEstateSceneProps) {
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
  const intruderRef = useRef<Group>(null)
  const pathProgress = useRef(0)

  // Bezier curve for smooth intruder path
  const intruderPath = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-30, 0.9, 30),
      new THREE.Vector3(-25, 0.9, 26),
      new THREE.Vector3(-18, 0.9, 20),
      new THREE.Vector3(-12, 0.9, 14),
      new THREE.Vector3(-6, 0.9, 8),
      new THREE.Vector3(-2, 0.9, 4),
      new THREE.Vector3(0, 0.9, 2),
    ])
    return curve
  }, [])

  useFrame((state, delta) => {
    if (!intruderRef.current || !isActive) {
      pathProgress.current = 0
      return
    }

    // Smooth progress along bezier curve
    pathProgress.current += delta * 0.03
    if (pathProgress.current > 1) pathProgress.current = 0

    const point = intruderPath.getPoint(pathProgress.current)
    const tangent = intruderPath.getTangent(pathProgress.current)

    // Smooth interpolation for position
    intruderRef.current.position.lerp(point, 0.1)
    
    // Rotate to face movement direction
    const angle = Math.atan2(tangent.x, tangent.z)
    intruderRef.current.rotation.y = angle

    setIntruderPosition([point.x, point.y, point.z])

    const progress = pathProgress.current * 100

    // Detection phases with smoother timing
    if (progress > 15 && phase === "idle") {
      setPhase("detected")
      addDetectedSensor("radar-ground")
      addSystemLog({ type: "alert", message: "Ground radar: Motion detected at Sector 3" })
      setTimeout(() => {
        addDetectedSensor("thermal-perimeter")
        addSystemLog({ type: "alert", message: "Thermal cameras: Human heat signature confirmed" })
      }, 1200)
      setTimeout(() => {
        addSystemLog({ type: "alert", message: "Multi-sensor fusion: Wildlife false positive eliminated" })
      }, 2000)
    }

    if (progress > 30 && phase === "detected") {
      setPhase("verifying")
      dispatchDrone("uav-dock")
      addSystemLog({ type: "verifying", message: "Autonomous drone dispatched from dock - ETA 12 seconds" })
      setTimeout(() => {
        addTrackingCamera("cam-ptz-1")
        addSystemLog({ type: "verifying", message: "PTZ cameras engaging target" })
      }, 1000)
    }

    if (progress > 50 && phase === "verifying") {
      setPhase("verified")
      addSystemLog({ type: "verified", message: "THREAT VERIFIED: Single adult male, no visible weapons" })
      setTimeout(() => {
        addSystemLog({ type: "verified", message: "Facial recognition attempted - Subject wearing mask" })
      }, 800)
    }

    if (progress > 70 && phase === "verified") {
      setPhase("responding")
      addSystemLog({ type: "responding", message: "SOP Engine: Perimeter lights illuminating Sector 3" })
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Audible warning broadcast initiated" })
      }, 600)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Security team alerted via encrypted push" })
      }, 1200)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Gate access points automatically locked" })
      }, 1800)
    }
  })

  const treePositions: [number, number, number][] = [
    [-38, 0, 28], [-35, 0, 32], [-32, 0, 26], [-40, 0, 24], [-36, 0, 20],
    [-42, 0, 30], [-30, 0, 35], [-44, 0, 22], [38, 0, 28], [35, 0, 32],
    [32, 0, 26], [-38, 0, -28], [-35, 0, -32], [-32, 0, -26],
    [38, 0, -28], [35, 0, -32], [32, 0, -26],
  ]

  return (
    <group>
      {/* ========== TERRAIN ========== */}
      {/* Main lawn with gradient */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#3D6B35"
          metalness={0.02}
          roughness={0.98}
        />
      </mesh>

      {/* Subtle terrain variation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[45, 64]} />
        <meshStandardMaterial color="#4A7C3F" metalness={0.02} roughness={0.95} />
      </mesh>

      {/* Gravel driveway with better texture */}
      <mesh position={[0, 0.03, 20]} receiveShadow>
        <boxGeometry args={[6, 0.06, 35]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.15} roughness={0.85} />
      </mesh>

      {/* Circular driveway */}
      <mesh position={[0, 0.03, 8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[4, 10, 48]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.15} roughness={0.85} />
      </mesh>

      {/* Wooded areas - animated trees */}
      {treePositions.map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} />
      ))}

      {/* ========== MAIN RESIDENCE - Georgian Style ========== */}
      <group position={[0, 0, 0]}>
        {/* Foundation */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[19, 0.6, 17]} />
          <meshStandardMaterial color="#4B5563" metalness={0.3} roughness={0.7} />
        </mesh>

        {/* Main structure */}
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 10, 16]} />
          <meshStandardMaterial color="#F5F0E6" metalness={0.08} roughness={0.85} />
        </mesh>

        {/* Hip roof */}
        <mesh position={[0, 10.75, 0]} castShadow>
          <boxGeometry args={[19, 1.5, 17]} />
          <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[0, 12, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[13, 2, 13]} />
          <meshStandardMaterial color="#1F2937" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Chimneys */}
        {[[-6, 12, -5], [6, 12, -5]].map((pos, i) => (
          <mesh key={`chimney-${i}`} position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[1.2, 4, 1.2]} />
            <meshStandardMaterial color="#7C3626" roughness={0.9} metalness={0.1} />
          </mesh>
        ))}

        {/* Front portico with columns */}
        <mesh position={[0, 4.5, 8.5]} castShadow>
          <boxGeometry args={[7, 9, 3]} />
          <meshStandardMaterial color="#FAFAF9" metalness={0.08} roughness={0.85} />
        </mesh>
        {[-2.2, 2.2].map((x, i) => (
          <mesh key={`column-${i}`} position={[x, 4.5, 10]} castShadow>
            <cylinderGeometry args={[0.35, 0.4, 9, 20]} />
            <meshStandardMaterial color="#FFFFFF" metalness={0.15} roughness={0.7} />
          </mesh>
        ))}

        {/* Pediment */}
        <mesh position={[0, 9.5, 10]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0, 3.5, 2, 3]} />
          <meshStandardMaterial color="#F5F0E6" metalness={0.08} roughness={0.85} />
        </mesh>

        {/* Windows with glass effect */}
        {[[-6, 7, 8.01], [-6, 3, 8.01], [6, 7, 8.01], [6, 3, 8.01]].map((pos, i) => (
          <group key={`front-window-${i}`} position={pos as [number, number, number]}>
            <mesh>
              <boxGeometry args={[2, 2.5, 0.1]} />
              <meshStandardMaterial
                color="#1E3A5F"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.7}
              />
            </mesh>
            {/* Window frame */}
            <mesh position={[0, 0, 0.05]}>
              <boxGeometry args={[2.2, 2.7, 0.05]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.2} roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Back windows */}
        {[[-6, 7, -8.01], [-6, 3, -8.01], [0, 7, -8.01], [0, 3, -8.01], [6, 7, -8.01], [6, 3, -8.01]].map((pos, i) => (
          <mesh key={`back-window-${i}`} position={pos as [number, number, number]}>
            <boxGeometry args={[2, 2.5, 0.1]} />
            <meshStandardMaterial color="#1E3A5F" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
          </mesh>
        ))}

        {/* Front door */}
        <mesh position={[0, 2.5, 10.1]}>
          <boxGeometry args={[2.2, 4.5, 0.2]} />
          <meshStandardMaterial color="#4A3728" metalness={0.25} roughness={0.75} />
        </mesh>
      </group>

      {/* ========== GUEST HOUSE ========== */}
      <group position={[-24, 0, -14]}>
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 7, 12]} />
          <meshStandardMaterial color="#E7E5E4" metalness={0.08} roughness={0.85} />
        </mesh>
        <mesh position={[0, 7.5, 0]} castShadow>
          <boxGeometry args={[11, 1, 13]} />
          <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.6} />
        </mesh>
        {[[-3, 4, 6.01], [3, 4, 6.01]].map((pos, i) => (
          <mesh key={`guest-window-${i}`} position={pos as [number, number, number]}>
            <boxGeometry args={[1.8, 2.2, 0.1]} />
            <meshStandardMaterial color="#1E3A5F" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>

      {/* ========== POOL HOUSE & POOL ========== */}
      <group position={[20, 0, -10]}>
        <mesh position={[0, 2.5, 4]} castShadow receiveShadow>
          <boxGeometry args={[8, 5, 6]} />
          <meshStandardMaterial color="#F5F0E6" metalness={0.08} roughness={0.85} />
        </mesh>
        {/* Pool with animated water effect */}
        <mesh position={[0, 0.2, -6]} receiveShadow>
          <boxGeometry args={[12, 0.4, 16]} />
          <meshStandardMaterial
            color="#0EA5E9"
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Pool deck */}
        <mesh position={[0, 0.08, -6]} receiveShadow>
          <boxGeometry args={[16, 0.16, 20]} />
          <meshStandardMaterial color="#D6D3D1" metalness={0.15} roughness={0.85} />
        </mesh>
      </group>

      {/* ========== GARAGE ========== */}
      <group position={[22, 0, 14]}>
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 6, 10]} />
          <meshStandardMaterial color="#E7E5E4" metalness={0.08} roughness={0.85} />
        </mesh>
        {[-3, 3].map((x, i) => (
          <mesh key={`garage-door-${i}`} position={[x, 2.5, 5.01]}>
            <boxGeometry args={[4, 4.5, 0.1]} />
            <meshStandardMaterial color="#4A3728" metalness={0.25} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ========== PERIMETER FENCE ========== */}
      {[
        { pos: [0, 1.5, 38], size: [76, 3, 0.15] },
        { pos: [0, 1.5, -38], size: [76, 3, 0.15] },
        { pos: [38, 1.5, 0], size: [0.15, 3, 76] },
        { pos: [-38, 1.5, 0], size: [0.15, 3, 76] },
      ].map((fence, i) => (
        <group key={`fence-${i}`}>
          {/* Stone base */}
          <mesh position={[fence.pos[0], 0.4, fence.pos[2]]} castShadow>
            <boxGeometry args={[fence.size[0] === 0.15 ? 0.6 : fence.size[0], 0.8, fence.size[2] === 0.15 ? 0.6 : fence.size[2]]} />
            <meshStandardMaterial color="#57534E" roughness={0.95} metalness={0.05} />
          </mesh>
          {/* Iron fence */}
          <mesh position={fence.pos as [number, number, number]} castShadow>
            <boxGeometry args={fence.size as [number, number, number]} />
            <meshStandardMaterial color="#1C1917" metalness={0.85} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Gate posts */}
      {[[-4, 0, 38], [4, 0, 38]].map((pos, i) => (
        <mesh key={`gate-post-${i}`} position={[pos[0], 2.5, pos[2]]} castShadow>
          <boxGeometry args={[1.5, 5, 1.5]} />
          <meshStandardMaterial color="#57534E" roughness={0.85} metalness={0.1} />
        </mesh>
      ))}

      {/* Main gate */}
      <mesh position={[0, 2, 38]} castShadow>
        <boxGeometry args={[8, 3.5, 0.1]} />
        <meshStandardMaterial color="#1C1917" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ========== DECORATIVE ELEMENTS ========== */}
      {/* Garden beds */}
      {[[-10, 0.15, 12], [10, 0.15, 12], [-10, 0.15, -8], [10, 0.15, -8]].map((pos, i) => (
        <mesh key={`garden-${i}`} position={pos as [number, number, number]} receiveShadow>
          <cylinderGeometry args={[3, 3, 0.3, 32]} />
          <meshStandardMaterial color="#2D5A45" metalness={0.02} roughness={0.98} />
        </mesh>
      ))}

      {/* Animated driveway lamp posts */}
      {[[-5, 0, 30], [5, 0, 30], [-5, 0, 22], [5, 0, 22], [-5, 0, 14], [5, 0, 14]].map((pos, i) => (
        <AnimatedLamp key={`lamp-${i}`} position={pos as [number, number, number]} phase={phase} />
      ))}

      {/* ========== SENSORS & CAMERAS ========== */}
      {/* Corner fence cameras */}
      <Camera position={[38, 3.2, 38]} rotation={[0, -Math.PI / 4, 0]} onDeviceClick={onDeviceClick} id="corner-1" isTracking={trackingCameras.includes("cam-corner-1")} />
      <Camera position={[-38, 3.2, 38]} rotation={[0, Math.PI / 4, 0]} onDeviceClick={onDeviceClick} id="corner-2" isTracking={trackingCameras.includes("cam-corner-2")} />
      <Camera position={[38, 3.2, -38]} rotation={[0, (3 * Math.PI) / 4, 0]} onDeviceClick={onDeviceClick} id="corner-3" isTracking={trackingCameras.includes("cam-corner-3")} />
      <Camera position={[-38, 3.2, -38]} rotation={[0, (-3 * Math.PI) / 4, 0]} onDeviceClick={onDeviceClick} id="corner-4" isTracking={trackingCameras.includes("cam-corner-4")} />

      {/* Main house PTZ cameras */}
      <Camera position={[9, 10, 8]} rotation={[0, Math.PI / 6, 0]} onDeviceClick={onDeviceClick} id="ptz-1" isTracking={trackingCameras.includes("cam-ptz-1")} />
      <Camera position={[-9, 10, 8]} rotation={[0, -Math.PI / 6, 0]} onDeviceClick={onDeviceClick} id="ptz-2" isTracking={trackingCameras.includes("cam-ptz-2")} />
      <Camera position={[0, 10, -8]} rotation={[0, Math.PI, 0]} onDeviceClick={onDeviceClick} id="ptz-3" isTracking={trackingCameras.includes("cam-ptz-3")} />

      {/* Thermal perimeter sensors */}
      <Sensor position={[-38, 2, 18]} onDeviceClick={onDeviceClick} id="thermal-perimeter" isDetecting={detectedSensors.includes("thermal-perimeter")} />
      <Sensor position={[-38, 2, -18]} onDeviceClick={onDeviceClick} id="thermal-2" isDetecting={detectedSensors.includes("thermal-perimeter-2")} />
      <Sensor position={[38, 2, 18]} onDeviceClick={onDeviceClick} id="thermal-3" isDetecting={detectedSensors.includes("thermal-perimeter-3")} />
      <Sensor position={[38, 2, -18]} onDeviceClick={onDeviceClick} id="thermal-4" isDetecting={detectedSensors.includes("thermal-perimeter-4")} />

      {/* Ground radar on roof */}
      <Radar position={[0, 13, 0]} onDeviceClick={onDeviceClick} id="radar-ground" />

      {/* Gate sensors */}
      <Sensor position={[-4, 3, 38]} onDeviceClick={onDeviceClick} id="gate-1" isDetecting={detectedSensors.includes("sensor-gate-1")} />
      <Sensor position={[4, 3, 38]} onDeviceClick={onDeviceClick} id="gate-2" isDetecting={detectedSensors.includes("sensor-gate-2")} />

      {/* UAV Drones */}
      <UAV position={[22, 10, 14]} onDeviceClick={onDeviceClick} id="dock" type="rapid-response" isDispatched={dispatchedDrones.includes("uav-dock")} />
      <UAV position={[-24, 12, -14]} onDeviceClick={onDeviceClick} id="patrol" type="patrol" isDispatched={dispatchedDrones.includes("uav-patrol")} />

      {/* ========== INTRUDER ========== */}
      {isActive && (
        <group ref={intruderRef}>
          {/* Body with glow effect */}
          <mesh castShadow position={[0, 0, 0]}>
            <capsuleGeometry args={[0.25, 1.1, 8, 16]} />
            <meshStandardMaterial
              color="#1C1917"
              emissive={phase === "responding" ? "#EF4444" : phase === "verified" ? "#F59E0B" : "#DC2626"}
              emissiveIntensity={phase === "responding" ? 0.6 : 0.3}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
          {/* Head */}
          <mesh castShadow position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial
              color="#1C1917"
              emissive={phase === "responding" ? "#EF4444" : "#DC2626"}
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Alert light */}
          <pointLight
            position={[0, 2, 0]}
            intensity={phase === "responding" ? 4 : 2}
            color={phase === "responding" ? "#EF4444" : "#F59E0B"}
            distance={10}
          />
          {/* Label */}
          <Html distanceFactor={12} position={[0, 2.5, 0]}>
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${
                phase === "responding"
                  ? "bg-red-600 text-white animate-pulse"
                  : phase === "verified"
                    ? "bg-amber-500 text-black"
                    : "bg-red-500/90 text-white"
              }`}
            >
              INTRUDER - Sector 3
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}
