"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { Html } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import { Camera, UAV, Sensor, Radar } from "../shared/sensor-models"
import * as THREE from "three"

type ResortMarinaSceneProps = {
  onDeviceClick?: (deviceName: string) => void
}

// Animated water with wave effect
function AnimatedWater({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  const waterRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  return (
    <mesh ref={waterRef} position={position} receiveShadow>
      <boxGeometry args={[size[0], 1, size[1]]} />
      <meshStandardMaterial
        color="#0369A1"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.85}
        emissive="#0284C7"
        emissiveIntensity={0.1}
      />
    </mesh>
  )
}

// Animated palm tree with sway
function PalmTree({ position }: { position: [number, number, number] }) {
  const treeRef = useRef<Group>(null)

  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.03
      treeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6 + position[2]) * 0.02
    }
  })

  return (
    <group ref={treeRef} position={position}>
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 10, 8]} />
        <meshStandardMaterial color="#78523C" roughness={0.95} metalness={0.05} />
      </mesh>
      {[0, 60, 120, 180, 240, 300].map((angle, j) => (
        <group key={`frond-${j}`} rotation={[0, (angle * Math.PI) / 180, 0]}>
          <mesh position={[1.5, 10, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[3.5, 0.1, 0.8]} />
            <meshStandardMaterial color="#22C55E" roughness={0.85} metalness={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Animated boat bobbing in water
function MooredBoat({ position, color }: { position: [number, number, number]; color: string }) {
  const boatRef = useRef<Group>(null)

  useFrame((state) => {
    if (boatRef.current) {
      boatRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.15
      boatRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + position[2]) * 0.03
      boatRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.6) * 0.02
    }
  })

  return (
    <group ref={boatRef} position={position}>
      <mesh castShadow>
        <boxGeometry args={[2.5, 1.2, 6]} />
        <meshStandardMaterial color="#FAFAFA" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1, -1.2]} castShadow>
        <boxGeometry args={[2.2, 1, 2.5]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

// Animated surveillance drone with spinning rotors
function SurveillanceDrone({ position, elapsedTime, phase }: { position: [number, number, number]; elapsedTime: number; phase: string }) {
  const droneRef = useRef<Group>(null)
  const rotorRefs = useRef<Mesh[]>([])

  useFrame((state) => {
    if (droneRef.current) {
      // Circling motion
      droneRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.6) * 15
      droneRef.current.position.z = position[2] + Math.cos(state.clock.elapsedTime * 0.6) * 10
      droneRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.8
    }

    // Spin rotors
    rotorRefs.current.forEach((rotor, i) => {
      if (rotor) {
        rotor.rotation.y = state.clock.elapsedTime * 35 + i * Math.PI / 2
      }
    })
  })

  return (
    <group ref={droneRef} position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.14, 0.4]} />
        <meshStandardMaterial color="#1C1917" emissive="#EF4444" emissiveIntensity={0.6} />
      </mesh>
      {/* Rotors */}
      {[[0.22, 0.1, 0.22], [-0.22, 0.1, 0.22], [0.22, 0.1, -0.22], [-0.22, 0.1, -0.22]].map((pos, i) => (
        <mesh
          key={`rotor-${i}`}
          ref={(el) => { if (el) rotorRefs.current[i] = el }}
          position={pos as [number, number, number]}
        >
          <cylinderGeometry args={[0.14, 0.14, 0.025, 16]} />
          <meshStandardMaterial color="#374151" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Camera */}
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#1D4ED8" emissive="#1D4ED8" emissiveIntensity={0.5} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={1} color="#EF4444" distance={8} />
      <Html distanceFactor={10} position={[0, 1.5, 0]}>
        <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg ${
          phase === "responding" ? "bg-amber-500 text-black" : "bg-red-500/90 text-white animate-pulse"
        }`}>
          DJI MAVIC 3 - FILMING
        </div>
      </Html>
    </group>
  )
}

export default function ResortMarinaScene({ onDeviceClick }: ResortMarinaSceneProps) {
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
  const boatRef = useRef<Group>(null)
  const pathProgress = useRef(0)

  // Smooth boat path
  const boatPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-55, 0.3, -40),
      new THREE.Vector3(-45, 0.3, -32),
      new THREE.Vector3(-35, 0.3, -25),
      new THREE.Vector3(-25, 0.3, -18),
      new THREE.Vector3(-18, 0.3, -12),
      new THREE.Vector3(-12, 0.3, -6),
      new THREE.Vector3(-8, 0.3, 0),
    ])
  }, [])

  useFrame((state, delta) => {
    if (!boatRef.current || !isActive) {
      pathProgress.current = 0
      return
    }

    pathProgress.current += delta * 0.018
    if (pathProgress.current > 1) pathProgress.current = 0

    const point = boatPath.getPoint(pathProgress.current)
    const tangent = boatPath.getTangent(pathProgress.current)

    // Smooth movement with bobbing
    boatRef.current.position.lerp(
      new THREE.Vector3(point.x, point.y + Math.sin(state.clock.elapsedTime * 2) * 0.1, point.z),
      0.08
    )

    const angle = Math.atan2(tangent.x, tangent.z)
    boatRef.current.rotation.y += (angle - boatRef.current.rotation.y) * 0.1
    boatRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.05

    setIntruderPosition([point.x, point.y, point.z])

    const progress = pathProgress.current * 100

    if (progress > 15 && phase === "idle") {
      setPhase("detected")
      addDetectedSensor("marine-radar")
      addSystemLog({ type: "alert", message: "Marine radar: Slow-moving surface contact at 0.8 knots" })
      setTimeout(() => {
        addDetectedSensor("thermal-shore")
        addSystemLog({ type: "alert", message: "Thermal cameras: Human heat signature in small vessel" })
      }, 1000)
      setTimeout(() => {
        addSystemLog({ type: "alert", message: "Acoustic sensors: Low-frequency motor - Electric trolling motor" })
      }, 2000)
      setTimeout(() => {
        addDetectedSensor("rf-detector")
        addSystemLog({ type: "alert", message: "RF detector: DJI Mavic 3 drone transmitting video at 200 ft offshore" })
      }, 3000)
    }

    if (progress > 32 && phase === "detected") {
      setPhase("verifying")
      addTrackingCamera("cam-shore-ptz")
      addSystemLog({ type: "verifying", message: "Shoreline PTZ: Two individuals, no visible resort credentials" })
      setTimeout(() => {
        addSystemLog({ type: "verifying", message: "Drone flight path: Circling guest villa area - Likely filming" })
      }, 1500)
      setTimeout(() => {
        addSystemLog({ type: "verifying", message: "Vessel trajectory: Projecting toward private dock area" })
      }, 3000)
    }

    if (progress > 52 && phase === "verifying") {
      setPhase("verified")
      dispatchDrone("uav-tethered")
      addSystemLog({ type: "verified", message: "DUAL THREAT CONFIRMED - Waterborne intrusion + Aerial surveillance" })
    }

    if (progress > 68 && phase === "verified") {
      setPhase("responding")
      addSystemLog({ type: "responding", message: "Marina security patrol dispatched via encrypted radio" })
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Tethered observation drone launched for UAS tracking" })
      }, 800)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Perimeter lights activating along shoreline" })
      }, 1600)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Affected villa guests receiving discreet notification" })
      }, 2400)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Harbor master alerted for Coast Guard coordination" })
      }, 3200)
    }
  })

  const palmPositions: [number, number, number][] = [
    [-25, 0, 8], [-12, 0, 10], [8, 0, 10], [30, 0, 40], [48, 0, 18], [48, 0, 3], [48, 0, -12]
  ]

  const boatColors = ["#1D4ED8", "#059669", "#DC2626", "#7C3AED"]

  return (
    <group>
      {/* ========== WATER ========== */}
      <AnimatedWater position={[0, -0.5, -35]} size={[160, 90]} />

      {/* ========== BEACH ========== */}
      <mesh position={[0, 0.06, -5]} receiveShadow>
        <boxGeometry args={[110, 0.12, 35]} />
        <meshStandardMaterial color="#E7DBC6" metalness={0.05} roughness={0.98} />
      </mesh>

      {/* Beach gradient near water */}
      <mesh position={[0, 0.04, -18]} receiveShadow>
        <boxGeometry args={[110, 0.08, 10]} />
        <meshStandardMaterial color="#D4C4A8" metalness={0.08} roughness={0.95} />
      </mesh>

      {/* ========== MAIN RESORT HOTEL ========== */}
      <group position={[15, 0, 28]}>
        {/* Foundation */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[32, 1, 20]} />
          <meshStandardMaterial color="#D6D3D1" metalness={0.2} roughness={0.8} />
        </mesh>

        {/* Main building */}
        <mesh position={[0, 11.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[30, 22, 18]} />
          <meshStandardMaterial color="#FFFBEB" metalness={0.12} roughness={0.78} />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 23, 0]} castShadow>
          <boxGeometry args={[32, 1.5, 20]} />
          <meshStandardMaterial color="#78350F" metalness={0.35} roughness={0.65} />
        </mesh>

        {/* Windows grid */}
        {[-10, 0, 10].map((x) =>
          [6, 12, 18].map((y) => (
            <mesh key={`window-${x}-${y}`} position={[x, y, 9.01]}>
              <boxGeometry args={[4, 3, 0.1]} />
              <meshStandardMaterial color="#1E3A5F" metalness={0.9} roughness={0.1} transparent opacity={0.65} />
            </mesh>
          ))
        )}

        {/* Entrance canopy */}
        <mesh position={[0, 4, 12]} castShadow>
          <boxGeometry args={[15, 0.6, 8]} />
          <meshStandardMaterial color="#B8860B" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Columns */}
        {[-5, 5].map((x, i) => (
          <mesh key={`hotel-column-${i}`} position={[x, 2, 12]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 4, 16]} />
            <meshStandardMaterial color="#FAFAFA" metalness={0.25} roughness={0.65} />
          </mesh>
        ))}
      </group>

      {/* ========== GUEST VILLAS ========== */}
      {[[40, 0, 12], [40, 0, 0], [40, 0, -12]].map((pos, i) => (
        <group key={`villa-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
            <boxGeometry args={[10, 6, 10]} />
            <meshStandardMaterial color="#FFF7ED" metalness={0.1} roughness={0.85} />
          </mesh>
          <mesh position={[0, 6.8, 0]} castShadow>
            <coneGeometry args={[7.5, 3, 4]} />
            <meshStandardMaterial color="#78350F" metalness={0.35} roughness={0.65} />
          </mesh>
          {/* Villa windows */}
          <mesh position={[-5.01, 3, 0]}>
            <boxGeometry args={[0.1, 2.5, 3]} />
            <meshStandardMaterial color="#1E3A5F" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* ========== BEACH CABANAS ========== */}
      {[[-18, 0, -8], [-6, 0, -8], [6, 0, -8]].map((pos, i) => (
        <group key={`cabana-${i}`} position={pos as [number, number, number]}>
          {[[-2, 0, -2], [2, 0, -2], [-2, 0, 2], [2, 0, 2]].map((p, j) => (
            <mesh key={`cabana-post-${j}`} position={[p[0], 1.8, p[2]]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 3.6, 8]} />
              <meshStandardMaterial color="#78350F" roughness={0.9} metalness={0.1} />
            </mesh>
          ))}
          <mesh position={[0, 3.8, 0]} castShadow>
            <boxGeometry args={[5, 0.25, 5]} />
            <meshStandardMaterial color="#FEFCE8" metalness={0.1} roughness={0.92} />
          </mesh>
        </group>
      ))}

      {/* ========== POOL AREA ========== */}
      <group position={[-5, 0, 20]}>
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <boxGeometry args={[20, 0.3, 12]} />
          <meshStandardMaterial color="#0EA5E9" metalness={0.92} roughness={0.08} transparent opacity={0.88} />
        </mesh>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[26, 0.08, 18]} />
          <meshStandardMaterial color="#D6D3D1" metalness={0.18} roughness={0.82} />
        </mesh>
      </group>

      {/* ========== MARINA DOCKS ========== */}
      <mesh position={[-30, 0.4, -25]} castShadow receiveShadow>
        <boxGeometry args={[35, 0.8, 4]} />
        <meshStandardMaterial color="#78523C" metalness={0.2} roughness={0.85} />
      </mesh>

      {/* Finger docks */}
      {[-42, -36, -30, -24, -18].map((x, i) => (
        <mesh key={`finger-${i}`} position={[x, 0.4, -34]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.6, 16]} />
          <meshStandardMaterial color="#78523C" metalness={0.2} roughness={0.85} />
        </mesh>
      ))}

      {/* ========== MOORED BOATS ========== */}
      {[[-44, 0.5, -36], [-38, 0.5, -36], [-32, 0.5, -36], [-26, 0.5, -36]].map((pos, i) => (
        <MooredBoat key={`boat-${i}`} position={pos as [number, number, number]} color={boatColors[i]} />
      ))}

      {/* ========== PALM TREES ========== */}
      {palmPositions.map((pos, i) => (
        <PalmTree key={`palm-${i}`} position={pos} />
      ))}

      {/* ========== PERIMETER FENCE ========== */}
      <mesh position={[50, 2.5, 18]} castShadow>
        <boxGeometry args={[0.2, 5, 55]} />
        <meshStandardMaterial color="#78716C" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.5, 45]} castShadow>
        <boxGeometry args={[100, 5, 0.2]} />
        <meshStandardMaterial color="#78716C" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* ========== GROUND ========== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 25]} receiveShadow>
        <planeGeometry args={[110, 55]} />
        <meshStandardMaterial color="#22C55E" metalness={0.05} roughness={0.98} />
      </mesh>

      {/* ========== SENSORS & CAMERAS ========== */}
      <Radar position={[15, 24, 28]} onDeviceClick={onDeviceClick} id="marine" />
      
      {/* Dock radar pole */}
      <group position={[-48, 0, -25]}>
        <mesh position={[0, 4, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 8, 8]} />
          <meshStandardMaterial color="#4B5563" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      <Radar position={[-48, 8.5, -25]} onDeviceClick={onDeviceClick} id="dock" />

      {/* Hotel cameras */}
      <Camera position={[15, 22, 37]} rotation={[0, Math.PI, 0]} onDeviceClick={onDeviceClick} id="hotel-beach" isTracking={trackingCameras.includes("cam-hotel-beach")} />
      <Camera position={[30, 22, 28]} rotation={[0, Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="hotel-villas" isTracking={trackingCameras.includes("cam-hotel-villas")} />

      {/* Shoreline PTZ cameras */}
      {[[-22, 0, -12], [-6, 0, -12], [10, 0, -12]].map((pos, i) => (
        <group key={`shore-pole-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 6, 8]} />
            <meshStandardMaterial color="#4B5563" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <Camera position={[-22, 6, -12]} rotation={[0, -Math.PI / 3, 0]} onDeviceClick={onDeviceClick} id="shore-ptz" isTracking={trackingCameras.includes("cam-shore-ptz")} />
      <Camera position={[-6, 6, -12]} rotation={[0, -Math.PI / 4, 0]} onDeviceClick={onDeviceClick} id="shore-2" isTracking={trackingCameras.includes("cam-shore-2")} />
      <Camera position={[10, 6, -12]} rotation={[0, -Math.PI / 6, 0]} onDeviceClick={onDeviceClick} id="shore-3" isTracking={trackingCameras.includes("cam-shore-3")} />

      {/* Dock cameras */}
      <Camera position={[-48, 6, -25]} rotation={[0, Math.PI / 4, 0]} onDeviceClick={onDeviceClick} id="dock-1" isTracking={trackingCameras.includes("cam-dock-1")} />
      <Camera position={[-12, 1.5, -25]} rotation={[0, -Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="dock-2" isTracking={trackingCameras.includes("cam-dock-2")} />

      {/* Pool camera */}
      <group position={[-18, 0, 20]}>
        <mesh position={[0, 3.5, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 7, 8]} />
          <meshStandardMaterial color="#4B5563" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      <Camera position={[-18, 7, 20]} rotation={[0, Math.PI / 4, 0]} onDeviceClick={onDeviceClick} id="pool" isTracking={trackingCameras.includes("cam-pool")} />

      {/* Thermal sensors */}
      <Sensor position={[-28, 2, -14]} onDeviceClick={onDeviceClick} id="thermal-shore" isDetecting={detectedSensors.includes("thermal-shore")} />
      <Sensor position={[-12, 2, -14]} onDeviceClick={onDeviceClick} id="thermal-shore-2" isDetecting={detectedSensors.includes("thermal-shore-2")} />
      <Sensor position={[4, 2, -14]} onDeviceClick={onDeviceClick} id="thermal-shore-3" isDetecting={detectedSensors.includes("thermal-shore-3")} />

      {/* RF drone detector */}
      <Sensor position={[15, 23, 28]} onDeviceClick={onDeviceClick} id="rf-detector" isDetecting={detectedSensors.includes("rf-detector")} />

      {/* Acoustic sensor */}
      <Sensor position={[-35, 1, -20]} onDeviceClick={onDeviceClick} id="acoustic" isDetecting={detectedSensors.includes("acoustic-sensor")} />

      {/* UAVs */}
      <UAV position={[25, 18, 35]} onDeviceClick={onDeviceClick} id="tethered" type="rapid-response" isDispatched={dispatchedDrones.includes("uav-tethered")} />
      <UAV position={[-25, 22, 12]} onDeviceClick={onDeviceClick} id="patrol" type="patrol" isDispatched={dispatchedDrones.includes("uav-patrol")} />

      {/* ========== UNAUTHORIZED VESSEL ========== */}
      {isActive && (
        <group ref={boatRef}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.6, 3.5]} />
            <meshStandardMaterial
              color="#334155"
              emissive={phase === "responding" ? "#F59E0B" : "#475569"}
              emissiveIntensity={phase === "responding" ? 0.4 : 0.2}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          {/* Occupants */}
          {[[0, 0.7, -0.6], [0, 0.7, 0.9]].map((pos, i) => (
            <mesh key={`occupant-${i}`} position={pos as [number, number, number]} castShadow>
              <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
              <meshStandardMaterial
                color="#EA580C"
                emissive="#EA580C"
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
          <pointLight position={[0, 2.5, 0]} intensity={2} color="#F97316" distance={10} />
          <Html distanceFactor={10} position={[0, 3, 0]}>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${
              phase === "responding" ? "bg-amber-500 text-black" : "bg-orange-500/90 text-white animate-pulse"
            }`}>
              UNAUTHORIZED VESSEL - 0.8 kts
            </div>
          </Html>
        </group>
      )}

      {/* ========== SURVEILLANCE DRONE ========== */}
      {isActive && (
        <SurveillanceDrone position={[30, 14, 5]} elapsedTime={0} phase={phase} />
      )}
    </group>
  )
}
