"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { Html } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import { Camera, UAV, Sensor, Radar } from "../shared/sensor-models"
import * as THREE from "three"

type DataCenterSceneProps = {
  onDeviceClick?: (deviceName: string) => void
}

// Animated HVAC with spinning fans
function AnimatedHVAC({ position }: { position: [number, number, number] }) {
  const fanRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (fanRef.current) {
      fanRef.current.rotation.y = state.clock.elapsedTime * 2
    }
  })

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[6, 3, 6]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Fan grill */}
      <mesh position={[0, 1.51, 0]} ref={fanRef}>
        <cylinderGeometry args={[2, 2, 0.2, 6]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Vent slots */}
      <mesh position={[3.01, 0, 0]}>
        <boxGeometry args={[0.1, 2.5, 5]} />
        <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

// Animated bollard that rises during response
function AnimatedBollard({ position, phase, index }: { position: [number, number, number]; phase: string; index: number }) {
  const bollardRef = useRef<Mesh>(null)
  const targetHeight = phase === "responding" || phase === "verified" ? 1.4 : 0.5

  useFrame(() => {
    if (bollardRef.current) {
      const currentY = bollardRef.current.position.y
      bollardRef.current.position.y += (targetHeight / 2 - currentY) * 0.05
    }
  })

  return (
    <mesh ref={bollardRef} position={[position[0], 0.25, position[2]]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, targetHeight, 16]} />
      <meshStandardMaterial
        color="#FBBF24"
        metalness={0.8}
        roughness={0.2}
        emissive={phase === "responding" ? "#F59E0B" : "#000000"}
        emissiveIntensity={phase === "responding" ? 0.6 : 0}
      />
    </mesh>
  )
}

// Animated server rack lights
function ServerRackLights({ position }: { position: [number, number, number] }) {
  const lightsRef = useRef<Group>(null)

  useFrame((state) => {
    if (lightsRef.current) {
      lightsRef.current.children.forEach((light, i) => {
        const mat = (light as Mesh).material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3 + i * 0.5) * 0.3
      })
    }
  })

  return (
    <group ref={lightsRef} position={position}>
      {[0, 0.4, 0.8, 1.2, 1.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.05, 0.1, 0.05]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#22C55E" : "#3B82F6"}
            emissive={i % 2 === 0 ? "#22C55E" : "#3B82F6"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function DataCenterScene({ onDeviceClick }: DataCenterSceneProps) {
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
  const vehicleRef = useRef<Group>(null)
  const pathProgress = useRef(0)

  // Smooth bezier path for vehicle
  const vehiclePath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-50, 1, 50),
      new THREE.Vector3(-50, 1, 35),
      new THREE.Vector3(-40, 1, 25),
      new THREE.Vector3(-30, 1, 18),
      new THREE.Vector3(-20, 1, 14),
      new THREE.Vector3(-15, 1, 12),
      // Stop and reverse
      new THREE.Vector3(-20, 1, 18),
      new THREE.Vector3(-30, 1, 28),
      new THREE.Vector3(-40, 1, 40),
    ])
  }, [])

  useFrame((state, delta) => {
    if (!vehicleRef.current || !isActive) {
      pathProgress.current = 0
      return
    }

    pathProgress.current += delta * 0.025
    if (pathProgress.current > 1) pathProgress.current = 0

    const point = vehiclePath.getPoint(pathProgress.current)
    const tangent = vehiclePath.getTangent(pathProgress.current)

    vehicleRef.current.position.lerp(point, 0.08)
    
    const angle = Math.atan2(tangent.x, tangent.z)
    vehicleRef.current.rotation.y += (angle - vehicleRef.current.rotation.y) * 0.1

    setIntruderPosition([point.x, point.y, point.z])

    const progress = pathProgress.current * 100

    if (progress > 12 && phase === "idle") {
      setPhase("detected")
      addDetectedSensor("alpr-gate2")
      addSystemLog({ type: "alert", message: "ALPR: Unknown plate detected - No database match" })
      setTimeout(() => {
        addDetectedSensor("speed-radar")
        addSystemLog({ type: "alert", message: "Speed radar: 45 mph in 15 mph zone - HIGH SPEED APPROACH" })
      }, 600)
      setTimeout(() => {
        addDetectedSensor("undercarriage-scanner")
        addSystemLog({ type: "alert", message: "Undercarriage scanner: Anomalous mass distribution detected" })
      }, 1200)
      setTimeout(() => {
        addSystemLog({ type: "alert", message: "CYBER: Port-scanning activity from internal IP - BMS targeted" })
      }, 1800)
    }

    if (progress > 28 && phase === "detected") {
      setPhase("verifying")
      addTrackingCamera("cam-gate2-ptz")
      addSystemLog({ type: "verifying", message: "PTZ cameras: Driver + passenger faces captured" })
      setTimeout(() => {
        addSystemLog({ type: "verifying", message: "Vehicle analysis: Rental vehicle, out-of-state plates" })
      }, 1000)
      setTimeout(() => {
        addSystemLog({ type: "verifying", message: "CYBER: Port scan targeting Building Management System (BMS)" })
      }, 2000)
    }

    if (progress > 45 && phase === "verifying") {
      setPhase("verified")
      dispatchDrone("uav-security")
      addSystemLog({ type: "verified", message: "MULTI-VECTOR THREAT CONFIRMED - Physical + Cyber coordinated attack" })
      setTimeout(() => {
        addSystemLog({ type: "verified", message: "Automated bollards deploying in 2.1 seconds" })
      }, 800)
    }

    if (progress > 60 && phase === "verified") {
      setPhase("responding")
      addSystemLog({ type: "responding", message: "BOLLARDS DEPLOYED - Physical barrier active" })
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Gate 2 lockdown complete - All gates heightened verification" })
      }, 800)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "SOC alerted with fused evidence - Law enforcement auto-notified" })
      }, 1600)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Internal IP isolated by network segmentation" })
      }, 2400)
    }
  })

  return (
    <group>
      {/* ========== GROUND ========== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#374151" metalness={0.2} roughness={0.85} />
      </mesh>

      {/* Parking lot */}
      <mesh position={[-35, 0.02, 0]} receiveShadow>
        <boxGeometry args={[35, 0.04, 50]} />
        <meshStandardMaterial color="#1F2937" metalness={0.25} roughness={0.8} />
      </mesh>

      {/* Parking lines */}
      {[-45, -40, -35, -30, -25].map((x, i) => (
        <mesh key={`line-${i}`} position={[x, 0.03, 0]}>
          <boxGeometry args={[0.15, 0.02, 4]} />
          <meshStandardMaterial color="#FBBF24" metalness={0.1} roughness={0.9} />
        </mesh>
      ))}

      {/* Access road */}
      <mesh position={[-30, 0.03, 25]} receiveShadow>
        <boxGeometry args={[10, 0.06, 50]} />
        <meshStandardMaterial color="#111827" metalness={0.15} roughness={0.9} />
      </mesh>

      {/* Road center line */}
      <mesh position={[-30, 0.04, 25]}>
        <boxGeometry args={[0.2, 0.02, 45]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* ========== MAIN DATA CENTER BUILDING ========== */}
      <group position={[0, 0, -12]}>
        {/* Foundation */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[42, 1, 37]} />
          <meshStandardMaterial color="#1F2937" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Main structure - sleek modern design */}
        <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[40, 16, 35]} />
          <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Glass accent strip */}
        <mesh position={[0, 15, 17.51]}>
          <boxGeometry args={[35, 2, 0.1]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.95} roughness={0.05} transparent opacity={0.7} emissive="#3B82F6" emissiveIntensity={0.3} />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 17, 0]} castShadow>
          <boxGeometry args={[42, 1, 37]} />
          <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* HVAC units */}
        {[[-12, 18, -10], [12, 18, -10], [0, 18, 8], [-12, 18, 8], [12, 18, 8]].map((pos, i) => (
          <AnimatedHVAC key={`hvac-${i}`} position={pos as [number, number, number]} />
        ))}

        {/* Cooling towers */}
        {[[-15, 18, 12], [15, 18, 12]].map((pos, i) => (
          <group key={`cooling-${i}`} position={pos as [number, number, number]}>
            <mesh castShadow>
              <cylinderGeometry args={[2.5, 3, 5, 20]} />
              <meshStandardMaterial color="#64748B" metalness={0.75} roughness={0.25} />
            </mesh>
            {/* Steam effect placeholder */}
            <mesh position={[0, 3, 0]}>
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshStandardMaterial color="#E2E8F0" transparent opacity={0.15} />
            </mesh>
          </group>
        ))}

        {/* Server rack indicators */}
        {[-15, -10, -5, 0, 5, 10, 15].map((x, i) => (
          <ServerRackLights key={`rack-${i}`} position={[x, 6, 17.6]} />
        ))}

        {/* Generator building */}
        <group position={[25, 0, 5]}>
          <mesh position={[0, 3.5, 0]} castShadow>
            <boxGeometry args={[8, 7, 10]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 8, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.6, 3, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ========== SECONDARY DATA HALL ========== */}
      <group position={[-20, 0, 12]}>
        <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 13, 22]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Blue accent */}
        <mesh position={[-10.01, 6.5, 0]}>
          <boxGeometry args={[0.1, 10, 1]} />
          <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* ========== SECURITY CHECKPOINT & GATE 2 ========== */}
      <group position={[-30, 0, 18]}>
        {/* Guard booth */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 5, 5]} />
          <meshStandardMaterial color="#64748B" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Tinted windows */}
        <mesh position={[0, 3, 2.51]}>
          <boxGeometry args={[4, 2.5, 0.1]} />
          <meshStandardMaterial color="#1E3A5F" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
        </mesh>

        {/* Gate barrier arm */}
        <mesh position={[8, 3.5, 0]} castShadow>
          <boxGeometry args={[10, 0.3, 0.3]} />
          <meshStandardMaterial color="#DC2626" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[3, 2, 0]} castShadow>
          <boxGeometry args={[1, 4, 1]} />
          <meshStandardMaterial color="#1F2937" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* ========== ANIMATED BOLLARDS ========== */}
      {[-34, -32, -30, -28, -26].map((x, i) => (
        <AnimatedBollard key={`bollard-${i}`} position={[x, 0, 14]} phase={phase} index={i} />
      ))}

      {/* Undercarriage scanner pad */}
      <mesh position={[-30, 0.06, 12]} receiveShadow>
        <boxGeometry args={[10, 0.12, 4]} />
        <meshStandardMaterial
          color="#1D4ED8"
          metalness={0.85}
          roughness={0.15}
          emissive="#1D4ED8"
          emissiveIntensity={detectedSensors.includes("undercarriage-scanner") ? 0.7 : 0.2}
        />
      </mesh>

      {/* ========== LOADING DOCK ========== */}
      <group position={[30, 0, 8]}>
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 4, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
        </mesh>
        {[-3, 3].map((z, i) => (
          <mesh key={`dock-door-${i}`} position={[7.01, 2.5, z]}>
            <boxGeometry args={[0.1, 4.5, 5]} />
            <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* ========== PERIMETER FENCE - Double Layer ========== */}
      {/* Outer fence */}
      {[
        { pos: [0, 2.5, 50], size: [100, 5, 0.1] },
        { pos: [0, 2.5, -50], size: [100, 5, 0.1] },
        { pos: [50, 2.5, 0], size: [0.1, 5, 100] },
        { pos: [-50, 2.5, 0], size: [0.1, 5, 100] },
      ].map((fence, i) => (
        <mesh key={`outer-fence-${i}`} position={fence.pos as [number, number, number]} castShadow>
          <boxGeometry args={fence.size as [number, number, number]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Inner fence (security red) */}
      {[
        { pos: [0, 2.5, 42], size: [84, 5, 0.08] },
        { pos: [0, 2.5, -42], size: [84, 5, 0.08] },
        { pos: [42, 2.5, 0], size: [0.08, 5, 84] },
        { pos: [-42, 2.5, 0], size: [0.08, 5, 84] },
      ].map((fence, i) => (
        <mesh key={`inner-fence-${i}`} position={fence.pos as [number, number, number]} castShadow>
          <boxGeometry args={fence.size as [number, number, number]} />
          <meshStandardMaterial
            color="#7F1D1D"
            metalness={0.7}
            roughness={0.3}
            emissive={phase === "responding" ? "#EF4444" : "#000000"}
            emissiveIntensity={phase === "responding" ? 0.3 : 0}
          />
        </mesh>
      ))}

      {/* ========== SENSORS & CAMERAS ========== */}
      <Camera position={[-28, 4.5, 18]} rotation={[0, -Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="alpr-gate2" isTracking={trackingCameras.includes("alpr-gate2")} />
      <Camera position={[-32, 4.5, 18]} rotation={[0, Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="gate2-ptz" isTracking={trackingCameras.includes("cam-gate2-ptz")} />
      <Sensor position={[-30, 3.5, 22]} onDeviceClick={onDeviceClick} id="speed-radar" isDetecting={detectedSensors.includes("speed-radar")} />
      <Sensor position={[-30, 0.8, 12]} onDeviceClick={onDeviceClick} id="undercarriage" isDetecting={detectedSensors.includes("undercarriage-scanner")} />

      {/* Building cameras */}
      <Camera position={[20, 16, -12]} rotation={[0, Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="dc-east" isTracking={trackingCameras.includes("cam-dc-east")} />
      <Camera position={[-20, 16, -12]} rotation={[0, -Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="dc-west" isTracking={trackingCameras.includes("cam-dc-west")} />
      <Camera position={[0, 16, 5.5]} rotation={[0, Math.PI, 0]} onDeviceClick={onDeviceClick} id="dc-north" isTracking={trackingCameras.includes("cam-dc-north")} />
      <Camera position={[37, 4.5, 8]} rotation={[0, Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="dock" isTracking={trackingCameras.includes("cam-dock")} />

      {/* Parking lot cameras */}
      <Camera position={[-52, 7, 10]} rotation={[0, Math.PI / 4, 0]} onDeviceClick={onDeviceClick} id="parking-1" isTracking={trackingCameras.includes("cam-parking-1")} />
      <Camera position={[-52, 7, -15]} rotation={[0, Math.PI / 3, 0]} onDeviceClick={onDeviceClick} id="parking-2" isTracking={trackingCameras.includes("cam-parking-2")} />

      {/* Perimeter sensors */}
      <Sensor position={[50, 3, 25]} onDeviceClick={onDeviceClick} id="fence-1" isDetecting={detectedSensors.includes("fence-sensor-1")} />
      <Sensor position={[50, 3, -25]} onDeviceClick={onDeviceClick} id="fence-2" isDetecting={detectedSensors.includes("fence-sensor-2")} />
      <Sensor position={[-50, 3, 25]} onDeviceClick={onDeviceClick} id="fence-3" isDetecting={detectedSensors.includes("fence-sensor-3")} />
      <Sensor position={[-50, 3, -25]} onDeviceClick={onDeviceClick} id="fence-4" isDetecting={detectedSensors.includes("fence-sensor-4")} />

      {/* Radar systems */}
      <Radar position={[0, 18.5, -12]} onDeviceClick={onDeviceClick} id="main" />
      <Radar position={[-30, 6, 18]} onDeviceClick={onDeviceClick} id="gate" />

      {/* UAVs */}
      <UAV position={[35, 18, 0]} onDeviceClick={onDeviceClick} id="security" type="rapid-response" isDispatched={dispatchedDrones.includes("uav-security")} />
      <UAV position={[-35, 20, -20]} onDeviceClick={onDeviceClick} id="patrol" type="patrol" isDispatched={dispatchedDrones.includes("uav-patrol")} />

      {/* ========== HOSTILE VEHICLE ========== */}
      {isActive && (
        <group ref={vehicleRef}>
          {/* Vehicle body - aggressive box truck */}
          <mesh castShadow position={[0, 0.7, 0]}>
            <boxGeometry args={[3, 2.2, 6]} />
            <meshStandardMaterial
              color="#7F1D1D"
              emissive={phase === "responding" ? "#EF4444" : "#DC2626"}
              emissiveIntensity={phase === "responding" ? 0.5 : 0.3}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          {/* Cab */}
          <mesh castShadow position={[0, 1.4, -3.2]}>
            <boxGeometry args={[2.8, 1.6, 2]} />
            <meshStandardMaterial color="#991B1B" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Windshield */}
          <mesh position={[0, 1.8, -4.2]}>
            <boxGeometry args={[2.5, 1, 0.1]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
          </mesh>
          {/* Wheels */}
          {[[-1.2, -0.4, -2.8], [1.2, -0.4, -2.8], [-1.2, -0.4, 2], [1.2, -0.4, 2]].map((pos, i) => (
            <mesh key={`wheel-${i}`} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
              <meshStandardMaterial color="#1C1917" metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
          {/* Alert light */}
          <pointLight position={[0, 3.5, 0]} intensity={phase === "responding" ? 4 : 2} color="#EF4444" distance={15} />
          <Html distanceFactor={12} position={[0, 4.5, 0]}>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${
              phase === "responding" ? "bg-red-600 text-white animate-pulse" : "bg-red-500/90 text-white"
            }`}>
              HOSTILE VEHICLE - 45 MPH
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}
