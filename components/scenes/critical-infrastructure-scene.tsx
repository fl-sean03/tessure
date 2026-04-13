"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group, Mesh } from "three"
import { Html } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import { Camera, UAV, Sensor, Radar } from "../shared/sensor-models"
import * as THREE from "three"

type CriticalInfrastructureSceneProps = {
  onDeviceClick?: (deviceName: string) => void
}

// Animated power line with electric arc effect
function PowerLine({ start, end, phase }: { start: [number, number, number]; end: [number, number, number]; phase: string }) {
  const lineRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (lineRef.current && phase === "responding") {
      const mat = lineRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 10) * 0.2
    }
  })

  const midY = Math.min(start[1], end[1]) - 2
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    new THREE.Vector3((start[0] + end[0]) / 2, midY, (start[2] + end[2]) / 2),
    new THREE.Vector3(...end)
  )
  const points = curve.getPoints(20)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <line ref={lineRef as any} geometry={geometry}>
      <lineBasicMaterial color={phase === "responding" ? "#EF4444" : "#374151"} linewidth={2} />
    </line>
  )
}

// Animated cooling tower steam
function CoolingTowerSteam({ position }: { position: [number, number, number] }) {
  const steamRef = useRef<Group>(null)
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      offset: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      radius: 0.5 + Math.random() * 1,
    }))
  }, [])

  useFrame((state) => {
    if (steamRef.current) {
      steamRef.current.children.forEach((child, i) => {
        const p = particles[i]
        const mesh = child as Mesh
        mesh.position.y = 2 + ((state.clock.elapsedTime * p.speed + i * 0.5) % 3)
        mesh.position.x = Math.sin(state.clock.elapsedTime + p.offset) * p.radius
        mesh.position.z = Math.cos(state.clock.elapsedTime + p.offset) * p.radius
        const scale = 0.5 + mesh.position.y * 0.3
        mesh.scale.setScalar(scale)
        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.opacity = Math.max(0, 0.3 - mesh.position.y * 0.08)
      })
    }
  })

  return (
    <group ref={steamRef} position={position}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial color="#E2E8F0" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// Animated drone with propellers
function AttackDrone({ position, index, phase }: { position: [number, number, number]; index: number; phase: string }) {
  const droneRef = useRef<Group>(null)
  const rotorRefs = useRef<Mesh[]>([])
  const isDisabled = phase === "responding" && index < 3

  useFrame((state) => {
    if (droneRef.current) {
      // Wobble effect
      droneRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.5
      
      if (isDisabled) {
        // Falling/disabled effect
        droneRef.current.position.y -= state.clock.elapsedTime * 0.01
        droneRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.3
        droneRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 2) * 0.3
      }
    }

    // Spin rotors
    rotorRefs.current.forEach((rotor, i) => {
      if (rotor) {
        rotor.rotation.y = state.clock.elapsedTime * (isDisabled ? 10 : 40) + i * Math.PI / 2
      }
    })
  })

  return (
    <group ref={droneRef} position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial
          color={isDisabled ? "#FBBF24" : "#7F1D1D"}
          emissive={isDisabled ? "#FBBF24" : "#EF4444"}
          emissiveIntensity={isDisabled ? 0.3 : 0.6}
        />
      </mesh>
      {/* Rotors */}
      {[[-0.5, 0.2, -0.5], [0.5, 0.2, -0.5], [-0.5, 0.2, 0.5], [0.5, 0.2, 0.5]].map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) rotorRefs.current[i] = el }}
          position={pos as [number, number, number]}
        >
          <cylinderGeometry args={[0.25, 0.25, 0.05, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} transparent opacity={isDisabled ? 0.3 : 0.6} />
        </mesh>
      ))}
      {/* Status light */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={isDisabled ? "#FBBF24" : "#EF4444"}
          emissive={isDisabled ? "#FBBF24" : "#EF4444"}
          emissiveIntensity={0.8}
        />
      </mesh>
      {!isDisabled && <pointLight position={[0, 0, 0]} intensity={0.5} color="#EF4444" distance={5} />}
    </group>
  )
}

// Animated barrier that deploys
function DeployableBarrier({ position, deployed }: { position: [number, number, number]; deployed: boolean }) {
  const barrierRef = useRef<Mesh>(null)

  useFrame(() => {
    if (barrierRef.current) {
      const targetHeight = deployed ? 1.5 : 0.2
      barrierRef.current.scale.y += (targetHeight - barrierRef.current.scale.y) * 0.08
      barrierRef.current.position.y = barrierRef.current.scale.y * 0.5
    }
  })

  return (
    <mesh ref={barrierRef} position={position} castShadow>
      <boxGeometry args={[2, 1, 0.5]} />
      <meshStandardMaterial
        color="#DC2626"
        emissive={deployed ? "#EF4444" : "#000000"}
        emissiveIntensity={deployed ? 0.5 : 0}
        metalness={0.6}
        roughness={0.4}
      />
    </mesh>
  )
}

export default function CriticalInfrastructureScene({ onDeviceClick }: CriticalInfrastructureSceneProps) {
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
  const truckRef = useRef<Group>(null)
  const dronesRef = useRef<Group>(null)
  const pathProgress = useRef(0)

  // Smooth truck path
  const truckPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2, 70),
      new THREE.Vector3(0, 2, 55),
      new THREE.Vector3(2, 2, 40),
      new THREE.Vector3(5, 2, 28),
      // Stop point
      new THREE.Vector3(5, 2, 25),
      // Reverse
      new THREE.Vector3(3, 2, 35),
      new THREE.Vector3(0, 2, 50),
    ])
  }, [])

  useFrame((state, delta) => {
    if (!truckRef.current || !dronesRef.current || !isActive) {
      pathProgress.current = 0
      return
    }

    pathProgress.current += delta * 0.022
    if (pathProgress.current > 1) pathProgress.current = 0

    const point = truckPath.getPoint(pathProgress.current)
    const tangent = truckPath.getTangent(pathProgress.current)

    truckRef.current.position.lerp(point, 0.06)
    const angle = Math.atan2(tangent.x, tangent.z)
    truckRef.current.rotation.y += (angle - truckRef.current.rotation.y) * 0.08

    // Drone swarm rotation
    dronesRef.current.position.set(0, 20 + Math.sin(state.clock.elapsedTime) * 3, 0)
    dronesRef.current.rotation.y = state.clock.elapsedTime * 0.2

    setIntruderPosition([point.x, point.y, point.z])

    const progress = pathProgress.current * 100

    if (progress > 10 && phase === "idle") {
      setPhase("detected")
      addDetectedSensor("radar-north")
      addSystemLog({ type: "alert", message: "RADAR: 6 small aerial objects detected at 1.2km - Coordinated flight pattern" })
      setTimeout(() => {
        addDetectedSensor("radar-south")
        addSystemLog({ type: "alert", message: "RADAR: Large vehicle (8+ tons) approaching at 35 mph on access road" })
      }, 800)
      setTimeout(() => {
        addSystemLog({ type: "alert", message: "SCADA: Anomalous ping on substation control network" })
      }, 1600)
    }

    if (progress > 28 && phase === "detected") {
      setPhase("verifying")
      addTrackingCamera("cam-perimeter-north")
      addSystemLog({ type: "verifying", message: "RF analysis: Commercial drone frequencies detected - NOT authorized operators" })
      setTimeout(() => {
        addTrackingCamera("cam-perimeter-east")
        addSystemLog({ type: "verifying", message: "PTZ cameras: Truck has no markings, license plate obscured" })
      }, 1200)
      setTimeout(() => {
        addSystemLog({ type: "verifying", message: "SCADA correlation: Cyber probe from IP matching drone controller pattern" })
      }, 2400)
    }

    if (progress > 45 && phase === "verifying") {
      setPhase("verified")
      dispatchDrone("counter-uas")
      addSystemLog({ type: "verified", message: "COORDINATED CYBER-PHYSICAL ATTACK CONFIRMED - Multi-vector threat" })
      setTimeout(() => {
        addSystemLog({ type: "verified", message: "Threat assessment: Drone swarm + vehicle ram + cyber intrusion" })
      }, 800)
    }

    if (progress > 60 && phase === "verified") {
      setPhase("responding")
      addSystemLog({ type: "responding", message: "Counter-UAS system ACTIVATED - RF jamming on drone frequencies" })
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "3 of 6 drones lost control, descending" })
      }, 800)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Vehicle barriers DEPLOYED on access road" })
      }, 1600)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Truck stopped 800m from outer perimeter" })
      }, 2400)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Grid control isolated - Manual override enabled" })
      }, 3200)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Law enforcement + National Guard alerted - ETA 8 minutes" })
      }, 4000)
    }
  })

  const dronePositions: [number, number, number][] = [
    [0, 0, 0], [6, 1, 4], [-6, -1, 4], [4, 2, -5], [-4, -2, -5], [0, 1, 8]
  ]

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#292524" metalness={0.1} roughness={0.95} />
      </mesh>

      {/* Facility concrete */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[80, 0.06, 80]} />
        <meshStandardMaterial color="#525252" metalness={0.2} roughness={0.85} />
      </mesh>

      {/* Access road */}
      <mesh position={[0, 0.04, 50]} receiveShadow>
        <boxGeometry args={[12, 0.02, 40]} />
        <meshStandardMaterial color="#1C1917" metalness={0.15} roughness={0.9} />
      </mesh>

      {/* ========== MAIN POWER PLANT ========== */}
      <group position={[0, 0, -15]}>
        {/* Foundation */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[37, 1, 27]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Main structure */}
        <mesh position={[0, 10.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[35, 20, 25]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Industrial details */}
        <mesh position={[0, 21.5, 0]} castShadow>
          <boxGeometry args={[37, 2, 27]} />
          <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Bay doors */}
        {[-10, 10].map((x, i) => (
          <mesh key={`door-${i}`} position={[x, 5, 12.51]}>
            <boxGeometry args={[8, 10, 0.2]} />
            <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}

        {/* Windows */}
        {[-12, -4, 4, 12].map((x, i) => (
          <mesh key={`window-${i}`} position={[x, 16, 12.51]}>
            <boxGeometry args={[3, 3, 0.1]} />
            <meshStandardMaterial color="#1E3A5F" metalness={0.9} roughness={0.1} transparent opacity={0.6} />
          </mesh>
        ))}

        {/* Roof vents */}
        {[[-10, 22.5, -8], [10, 22.5, -8], [0, 22.5, 5]].map((pos, i) => (
          <mesh key={`vent-${i}`} position={pos as [number, number, number]} castShadow>
            <boxGeometry args={[4, 3, 4]} />
            <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ========== COOLING TOWERS ========== */}
      {[[-28, 0, -20], [-28, 0, -5]].map((pos, i) => (
        <group key={`cooling-tower-${i}`} position={pos as [number, number, number]}>
          {/* Base */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[8, 8, 1, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Tower */}
          <mesh position={[0, 15, 0]} castShadow>
            <cylinderGeometry args={[6, 8, 28, 24]} />
            <meshStandardMaterial color="#64748B" metalness={0.4} roughness={0.6} />
          </mesh>
          {/* Steam */}
          <CoolingTowerSteam position={[0, 30, 0]} />
        </group>
      ))}

      {/* ========== TRANSFORMERS ========== */}
      {[[25, 0, -10], [25, 0, 5], [25, 0, 20]].map((pos, i) => (
        <group key={`transformer-${i}`} position={pos as [number, number, number]}>
          <mesh position={[0, 3.5, 0]} castShadow>
            <boxGeometry args={[6, 7, 5]} />
            <meshStandardMaterial color="#1F2937" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Cooling fins */}
          {[-2.5, 0, 2.5].map((z, j) => (
            <mesh key={`fin-${j}`} position={[3.1, 3.5, z]} castShadow>
              <boxGeometry args={[0.2, 5, 0.8]} />
              <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          {/* Bushings */}
          {[-1.5, 0, 1.5].map((x, j) => (
            <mesh key={`bushing-${j}`} position={[x, 8, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.35, 3, 8]} />
              <meshStandardMaterial color="#78350F" metalness={0.4} roughness={0.6} />
            </mesh>
          ))}
          {/* Warning light */}
          <mesh position={[0, 7.5, 2.6]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}

      {/* ========== TRANSMISSION TOWERS ========== */}
      {[[35, 0, -25], [35, 0, 10]].map((pos, i) => (
        <group key={`tower-${i}`} position={pos as [number, number, number]}>
          {/* Legs */}
          {[[-2, 0, -2], [2, 0, -2], [-2, 0, 2], [2, 0, 2]].map((lpos, j) => (
            <mesh key={`leg-${j}`} position={[lpos[0] * 0.7, 12, lpos[2] * 0.7]} castShadow>
              <boxGeometry args={[0.35, 24, 0.35]} />
              <meshStandardMaterial color="#4B5563" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          {/* Cross arms */}
          {[8, 16, 22].map((y, j) => (
            <mesh key={`arm-${j}`} position={[0, y, 0]} castShadow>
              <boxGeometry args={[8 - j, 0.35, 0.35]} />
              <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          {/* Insulators */}
          {[-3, 0, 3].map((x, j) => (
            <mesh key={`insulator-${j}`} position={[x, 23, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.18, 2, 8]} />
              <meshStandardMaterial color="#9CA3AF" metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ========== CONTROL BUILDING ========== */}
      <group position={[-15, 0, 18]}>
        <mesh position={[0, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 8, 12]} />
          <meshStandardMaterial color="#4B5563" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Windows */}
        {[-4, 0, 4].map((x, i) => (
          <mesh key={`ctrl-window-${i}`} position={[x, 5, 6.01]}>
            <boxGeometry args={[2.5, 3, 0.1]} />
            <meshStandardMaterial color="#1E3A5F" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Door */}
        <mesh position={[0, 2.5, 6.01]}>
          <boxGeometry args={[3, 5, 0.1]} />
          <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Satellite dish */}
        <mesh position={[5, 9, 0]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[2, 2, 0.3, 16]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* ========== PERIMETER FENCING ========== */}
      {/* Outer fence */}
      {[
        { pos: [0, 3.5, 50], size: [100, 7, 0.15] },
        { pos: [0, 3.5, -50], size: [100, 7, 0.15] },
        { pos: [50, 3.5, 0], size: [0.15, 7, 100] },
        { pos: [-50, 3.5, 0], size: [0.15, 7, 100] },
      ].map((fence, i) => (
        <mesh key={`outer-fence-${i}`} position={fence.pos as [number, number, number]} castShadow>
          <boxGeometry args={fence.size as [number, number, number]} />
          <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Inner fence */}
      {[
        { pos: [0, 3, 40], size: [80, 6, 0.1] },
        { pos: [0, 3, -40], size: [80, 6, 0.1] },
        { pos: [40, 3, 0], size: [0.1, 6, 80] },
        { pos: [-40, 3, 0], size: [0.1, 6, 80] },
      ].map((fence, i) => (
        <mesh key={`inner-fence-${i}`} position={fence.pos as [number, number, number]} castShadow>
          <boxGeometry args={fence.size as [number, number, number]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* ========== MAIN GATE WITH DEPLOYABLE BARRIERS ========== */}
      <group position={[0, 0, 50]}>
        {/* Gate posts */}
        {[-8, 8].map((x, i) => (
          <mesh key={`gate-post-${i}`} position={[x, 4.5, 0]} castShadow>
            <boxGeometry args={[1.5, 9, 1.5]} />
            <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Guard booth */}
        <mesh position={[-14, 3, 3]} castShadow>
          <boxGeometry args={[6, 6, 6]} />
          <meshStandardMaterial color="#4B5563" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Deployable barriers */}
        {[-4, 0, 4].map((x, i) => (
          <DeployableBarrier key={`barrier-${i}`} position={[x, 0, 5]} deployed={phase === "responding"} />
        ))}
        {/* Full barrier wall when responding */}
        {phase === "responding" && (
          <mesh position={[0, 1.5, 8]} castShadow>
            <boxGeometry args={[16, 3, 0.8]} />
            <meshStandardMaterial color="#7F1D1D" emissive="#EF4444" emissiveIntensity={0.4} />
          </mesh>
        )}
      </group>

      {/* ========== SENSORS & CAMERAS ========== */}
      <Camera position={[50, 6.5, 25]} rotation={[0, -Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="perimeter-east" isTracking={trackingCameras.includes("cam-perimeter-east")} />
      <Camera position={[-50, 6.5, 25]} rotation={[0, Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="perimeter-west" isTracking={trackingCameras.includes("cam-perimeter-west")} />
      <Camera position={[25, 6.5, 50]} rotation={[0, Math.PI, 0]} onDeviceClick={onDeviceClick} id="perimeter-north" isTracking={trackingCameras.includes("cam-perimeter-north")} />
      <Camera position={[-25, 6.5, 50]} rotation={[0, Math.PI, 0]} onDeviceClick={onDeviceClick} id="perimeter-north-2" isTracking={trackingCameras.includes("cam-perimeter-north-2")} />
      <Camera position={[0, 6.5, -50]} rotation={[0, 0, 0]} onDeviceClick={onDeviceClick} id="perimeter-south" isTracking={trackingCameras.includes("cam-perimeter-south")} />
      <Camera position={[40, 5.5, 20]} rotation={[0, -Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="inner-east" isTracking={trackingCameras.includes("cam-inner-east")} />
      <Camera position={[-40, 5.5, 20]} rotation={[0, Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="inner-west" isTracking={trackingCameras.includes("cam-inner-west")} />
      <Camera position={[0, 21.5, -15]} rotation={[0, Math.PI / 2, 0]} onDeviceClick={onDeviceClick} id="plant-roof" isTracking={trackingCameras.includes("cam-plant-roof")} />
      <Camera position={[-15, 8, 18]} rotation={[0, 0, 0]} onDeviceClick={onDeviceClick} id="control" isTracking={trackingCameras.includes("cam-control")} />

      {/* Radar systems */}
      <Radar position={[35, 25, -25]} onDeviceClick={onDeviceClick} id="north" />
      <Radar position={[35, 25, 10]} onDeviceClick={onDeviceClick} id="south" />
      <Radar position={[-15, 9, 18]} onDeviceClick={onDeviceClick} id="control" />

      {/* Perimeter sensors */}
      <Sensor position={[50, 4, 0]} onDeviceClick={onDeviceClick} id="outer-east" isDetecting={detectedSensors.includes("sensor-outer-east")} />
      <Sensor position={[-50, 4, 0]} onDeviceClick={onDeviceClick} id="outer-west" isDetecting={detectedSensors.includes("sensor-outer-west")} />
      <Sensor position={[0, 4, 50]} onDeviceClick={onDeviceClick} id="outer-north" isDetecting={detectedSensors.includes("sensor-outer-north")} />
      <Sensor position={[-15, 4.5, 18]} onDeviceClick={onDeviceClick} id="scada" isDetecting={detectedSensors.includes("scada-monitor")} />

      {/* UAVs */}
      <UAV position={[0, 35, 0]} onDeviceClick={onDeviceClick} id="counter-uas" type="rapid-response" isDispatched={dispatchedDrones.includes("counter-uas")} />
      <UAV position={[-30, 30, 20]} onDeviceClick={onDeviceClick} id="patrol-1" type="patrol" isDispatched={dispatchedDrones.includes("patrol-uas-1")} />
      <UAV position={[30, 30, -20]} onDeviceClick={onDeviceClick} id="patrol-2" type="patrol" isDispatched={dispatchedDrones.includes("patrol-uas-2")} />

      {/* ========== ATTACK TRUCK ========== */}
      {isActive && (
        <group ref={truckRef}>
          {/* Cab */}
          <mesh position={[0, 1.5, -4]} castShadow>
            <boxGeometry args={[4, 4, 3]} />
            <meshStandardMaterial
              color="#1C1917"
              emissive="#1C1917"
              emissiveIntensity={0.15}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          {/* Cargo */}
          <mesh position={[0, 1, 2]} castShadow>
            <boxGeometry args={[4.5, 3, 8]} />
            <meshStandardMaterial color="#1F2937" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Windshield */}
          <mesh position={[0, 3, -5.3]}>
            <boxGeometry args={[3.5, 2, 0.1]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
          </mesh>
          {/* Wheels */}
          {[[-2, 0, -3], [2, 0, -3], [-2, 0, 0], [2, 0, 0], [-2, 0, 4], [2, 0, 4]].map((wpos, i) => (
            <mesh key={`truck-wheel-${i}`} position={wpos as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.8, 0.8, 0.6, 16]} />
              <meshStandardMaterial color="#1C1917" metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
          <pointLight position={[0, 4, 0]} intensity={3} color="#EF4444" distance={12} />
          <Html distanceFactor={15} position={[0, 5, 0]}>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${
              phase === "responding" ? "bg-red-600 text-white animate-pulse" : "bg-red-500/90 text-white"
            }`}>
              HOSTILE VEHICLE - 8+ tons
            </div>
          </Html>
        </group>
      )}

      {/* ========== DRONE SWARM ========== */}
      {isActive && (
        <group ref={dronesRef}>
          {dronePositions.map((offset, i) => (
            <AttackDrone key={`attack-drone-${i}`} position={offset} index={i} phase={phase} />
          ))}
          <Html distanceFactor={20} position={[0, 8, 0]}>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg ${
              phase === "responding" ? "bg-amber-500 text-black" : "bg-red-500/90 text-white animate-pulse"
            }`}>
              {phase === "responding" ? "DRONE SWARM - 3/6 DISABLED" : "DRONE SWARM - 6 HOSTILES"}
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}
