"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { useScenarioStore } from "@/lib/scenario-store"
import { Html } from "@react-three/drei"

export default function IntrusionScenario() {
  const intruderRef = useRef<Group>(null)
  const {
    intruderPosition,
    setIntruderPosition,
    phase,
    setPhase,
    detectedSensors,
    addDetectedSensor,
    trackingCameras,
    addTrackingCamera,
    dispatchedDrones,
    dispatchDrone,
    addSystemLog,
  } = useScenarioStore()

  const prevPhaseRef = useRef(phase)

  useEffect(() => {
    if (prevPhaseRef.current !== phase) {
      // Add system log when phase changes
      if (phase === "detected") {
        addSystemLog({ type: "alert", message: "Perimeter breach detected" })
      } else if (phase === "verifying") {
        addSystemLog({ type: "verifying", message: "Edge AI analyzing threat" })
      } else if (phase === "verified") {
        addSystemLog({ type: "verified", message: "Threat confirmed by multi-sensor fusion" })
      } else if (phase === "responding") {
        addSystemLog({ type: "responding", message: "Autonomous response initiated" })
      }
      prevPhaseRef.current = phase
    }
  }, [phase, addSystemLog])

  useFrame((state) => {
    if (!intruderRef.current) return

    const elapsed = state.clock.elapsedTime

    const speed = 0.70
    const pathProgress = (elapsed * speed) % 100

    let x, z

    if (pathProgress < 20) {
      // Starting far outside perimeter, approaching slowly
      x = -25 + (pathProgress / 20) * 8
      z = 35 - (pathProgress / 20) * 8
    } else if (pathProgress < 40) {
      // Crossing perimeter boundary
      const localProgress = (pathProgress - 20) / 20
      x = -17 + localProgress * 7
      z = 27 - localProgress * 7
    } else if (pathProgress < 60) {
      // Moving through outer zone toward building
      const localProgress = (pathProgress - 40) / 20
      x = -10 + localProgress * 6
      z = 20 - localProgress * 6
    } else if (pathProgress < 80) {
      // Approaching building
      const localProgress = (pathProgress - 60) / 20
      x = -4 + localProgress * 4
      z = 14 - localProgress * 8
    } else {
      // Near building entrance
      const localProgress = (pathProgress - 80) / 20
      x = 0
      z = 6 - localProgress * 2
    }

    intruderRef.current.position.set(x, 0.9, z)
    setIntruderPosition([x, 0.9, z])

    // Detection phase - triggers when crossing outer perimeter
    if (pathProgress > 22 && phase === "idle") {
      setPhase("detected")
      addDetectedSensor("sensor-3")
      setTimeout(() => addDetectedSensor("sensor-1"), 1500)
    }

    // Verification phase - PTZ cameras engage after detection
    if (pathProgress > 35 && phase === "detected") {
      setPhase("verifying")
      addTrackingCamera("cam-6")
      setTimeout(() => addTrackingCamera("cam-5"), 1200)
    }

    // Verified phase - multi-sensor fusion confirms threat
    if (pathProgress > 50 && phase === "verifying") {
      setPhase("verified")
      dispatchDrone("uav-2")
    }

    // Response phase - full autonomous response activated
    if (pathProgress > 65 && phase === "verified") {
      setPhase("responding")
      setTimeout(() => dispatchDrone("uav-1"), 2000)
    }
  })

  return (
    <group ref={intruderRef}>
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
        <meshStandardMaterial
          color="#ff3333"
          emissive="#ff0000"
          emissiveIntensity={0.5}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>

      {phase !== "idle" && (
        <>
          <pointLight position={[0, 2, 0]} intensity={2} color="#ff0000" distance={8} />
          <Html distanceFactor={10} position={[0, 2.5, 0]}>
            <div className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap animate-pulse">
              ⚠️ THREAT DETECTED
            </div>
          </Html>
        </>
      )}

      {phase !== "idle" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[2, 2.5, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  )
}
