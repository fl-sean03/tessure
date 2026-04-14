"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { Html } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import { Camera, UAV, Sensor, Radar } from "../shared/sensor-models"

type LogisticsYardSceneProps = {
  onDeviceClick?: (deviceName: string) => void
}

export default function LogisticsYardScene({ onDeviceClick }: LogisticsYardSceneProps) {
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
  const insiderRef = useRef<Group>(null)
  const forkliftRef = useRef<Group>(null)
  const accompliceRef = useRef<Group>(null)

  useFrame((state) => {
    if (!insiderRef.current || !forkliftRef.current || !accompliceRef.current || !isActive) return

    const elapsed = state.clock.elapsedTime
    const speed = 0.55
    const pathProgress = (elapsed * speed) % 100

    let insiderX, insiderZ, forkliftX, forkliftZ, accompliceX, accompliceZ

    // Insider (Employee #2847) moving container with forklift
    if (pathProgress < 25) {
      insiderX = -12
      insiderZ = -18 + (pathProgress / 25) * 8
      forkliftX = insiderX
      forkliftZ = insiderZ
    } else if (pathProgress < 50) {
      const localProgress = (pathProgress - 25) / 25
      insiderX = -12 + localProgress * 10
      insiderZ = -10 + localProgress * 12
      forkliftX = insiderX
      forkliftZ = insiderZ
    } else if (pathProgress < 75) {
      const localProgress = (pathProgress - 50) / 25
      insiderX = -2 + localProgress * 8
      insiderZ = 2 + localProgress * 10
      forkliftX = insiderX
      forkliftZ = insiderZ
    } else {
      const localProgress = (pathProgress - 75) / 25
      insiderX = 6 + localProgress * 5
      insiderZ = 12 + localProgress * 6
      forkliftX = insiderX
      forkliftZ = insiderZ
    }

    // External accomplice at fence Section 7
    accompliceX = 42
    accompliceZ = 18 + Math.sin(elapsed) * 2

    insiderRef.current.position.set(insiderX, 1.5, insiderZ)
    forkliftRef.current.position.set(forkliftX, 0.8, forkliftZ)
    accompliceRef.current.position.set(accompliceX, 0.9, accompliceZ)
    setIntruderPosition([insiderX, 1.5, insiderZ])

    // Fiber optic fence sensor + badge anomaly
    if (pathProgress > 18 && phase === "idle") {
      setPhase("detected")
      addDetectedSensor("fiber-fence")
      addSystemLog({
        type: "alert",
        message: "Fence sensor: 12-foot section under stress at Section 7 - CUTTING ATTEMPT",
      })
      setTimeout(() => {
        addDetectedSensor("badge-system")
        addSystemLog({
          type: "alert",
          message: "Badge system: Employee #2847 badged in at 2:55 AM - OFF-SHIFT, no work scheduled",
        })
      }, 800)
      setTimeout(() => {
        addDetectedSensor("rfid-container")
        addSystemLog({
          type: "alert",
          message: "RFID: Container C-4472 moved 40 feet - No authorized forklift dispatch",
        })
      }, 1600)
    }

    // PTZ verification, facial recognition
    if (pathProgress > 38 && phase === "detected") {
      setPhase("verifying")
      addTrackingCamera("cam-yard-ptz")
      addSystemLog({ type: "verifying", message: "PTZ cameras: One individual using bolt cutters at fence" })
      setTimeout(() => {
        addTrackingCamera("cam-container")
        addSystemLog({ type: "verifying", message: "Forklift operator: Facial recognition matches Employee #2847" })
      }, 1200)
      setTimeout(() => {
        addSystemLog({ type: "verifying", message: "Second individual: Unknown, no badge, face obscured" })
      }, 2400)
    }

    // Coordinated insider theft confirmed
    if (pathProgress > 58 && phase === "verifying") {
      setPhase("verified")
      dispatchDrone("uav-yard")
      addSystemLog({ type: "verified", message: "COORDINATED INSIDER-ASSISTED THEFT CONFIRMED" })
      setTimeout(() => {
        addSystemLog({ type: "verified", message: "Container C-4472 value: $340,000 electronics shipment at risk" })
      }, 800)
    }

    // Response: forklift disable, credential revoke
    if (pathProgress > 72 && phase === "verified") {
      setPhase("responding")
      addSystemLog({
        type: "responding",
        message: "Forklift remotely disabled via telematics - Engine kill switch activated",
      })
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Employee #2847 access credentials REVOKED instantly" })
      }, 800)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Security patrol dispatched - ETA 90 seconds" })
      }, 1600)
      setTimeout(() => {
        addSystemLog({ type: "responding", message: "Perimeter lights activating at Section 7" })
      }, 2400)
      setTimeout(() => {
        addSystemLog({
          type: "responding",
          message: "Law enforcement auto-notified with live video + evidence package",
        })
      }, 3200)
    }
  })

  return (
    <group>
      {/* ========== GROUND ========== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#3D3D3D" metalness={0.15} roughness={0.9} />
      </mesh>

      {/* Yard concrete surface */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[90, 0.04, 90]} />
        <meshStandardMaterial color="#555555" metalness={0.2} roughness={0.85} />
      </mesh>

      {/* Road markings */}
      {[
        { pos: [0, 0.05, -25], size: [0.3, 0.02, 30] },
        { pos: [0, 0.05, 15], size: [0.3, 0.02, 30] },
        { pos: [-20, 0.05, 0], size: [30, 0.02, 0.3] },
      ].map((marking, i) => (
        <mesh key={`marking-${i}`} position={marking.pos as [number, number, number]}>
          <boxGeometry args={marking.size as [number, number, number]} />
          <meshStandardMaterial color="#FFD54F" metalness={0.1} roughness={0.9} />
        </mesh>
      ))}

      {/* ========== MAIN WAREHOUSE ========== */}
      <group position={[-22, 0, -18]}>
        {/* Warehouse structure */}
        <mesh position={[0, 8, 0]} castShadow receiveShadow>
          <boxGeometry args={[30, 16, 35]} />
          <meshStandardMaterial color="#5D5040" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Corrugated roof */}
        <mesh position={[0, 16.5, 0]} castShadow>
          <boxGeometry args={[32, 1, 37]} />
          <meshStandardMaterial color="#37474F" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Loading bay doors */}
        {[-10, 0, 10].map((z, i) => (
          <group key={`bay-${i}`} position={[15.01, 4, z]}>
            <mesh>
              <boxGeometry args={[0.2, 8, 7]} />
              <meshStandardMaterial color="#263238" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Door frame */}
            <mesh position={[0.1, 0, -3.6]}>
              <boxGeometry args={[0.3, 8, 0.3]} />
              <meshStandardMaterial color="#424242" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0.1, 0, 3.6]}>
              <boxGeometry args={[0.3, 8, 0.3]} />
              <meshStandardMaterial color="#424242" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}
        {/* Office section attached to warehouse */}
        <mesh position={[-12, 5, 15]} castShadow>
          <boxGeometry args={[6, 10, 8]} />
          <meshStandardMaterial color="#78909C" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Office windows */}
        {[3, 6, 9].map((y, i) => (
          <mesh key={`office-window-${i}`} position={[-15.01, y, 15]}>
            <boxGeometry args={[0.1, 2, 5]} />
            <meshStandardMaterial color="#87CEEB" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* ========== LOADING DOCK PLATFORM ========== */}
      <group position={[8, 0, -10]}>
        {/* Dock platform */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 4, 18]} />
          <meshStandardMaterial color="#4E4E4E" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Dock levelers */}
        {[-5, 5].map((z, i) => (
          <mesh key={`leveler-${i}`} position={[10.01, 3.5, z]}>
            <boxGeometry args={[0.3, 3, 5]} />
            <meshStandardMaterial color="#37474F" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* Dock bumpers */}
        {[-5, 5].map((z, i) => (
          <mesh key={`bumper-${i}`} position={[10.3, 2, z]} castShadow>
            <boxGeometry args={[0.6, 2, 4]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.4} roughness={0.7} />
          </mesh>
        ))}
        {/* Dock shelter canopy */}
        {[-5, 5].map((z, i) => (
          <mesh key={`canopy-${i}`} position={[12, 5, z]} castShadow>
            <boxGeometry args={[4, 6, 6]} />
            <meshStandardMaterial color="#616161" metalness={0.4} roughness={0.6} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>

      {/* ========== ADMIN OFFICE BUILDING ========== */}
      <group position={[25, 0, -28]}>
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[15, 10, 15]} />
          <meshStandardMaterial color="#90A4AE" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Windows */}
        {[-4, 0, 4].map((x) =>
          [3, 7].map((y, j) => (
            <mesh key={`admin-window-${x}-${y}`} position={[x, y, 7.51]}>
              <boxGeometry args={[2.5, 2, 0.1]} />
              <meshStandardMaterial color="#87CEEB" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
            </mesh>
          )),
        )}
        {/* Entrance */}
        <mesh position={[0, 2.5, 7.51]}>
          <boxGeometry args={[3, 5, 0.1]} />
          <meshStandardMaterial color="#1565C0" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* ========== CARGO CONTAINERS - Multiple stacks ========== */}
      {/* Main container stack area (includes C-4472) */}
      {[
        { pos: [-5, 1.5, 15], color: "#C62828", id: "C-4472" },
        { pos: [-5, 4.5, 15], color: "#1565C0", id: "C-4471" },
        { pos: [0, 1.5, 15], color: "#2E7D32", id: "C-4470" },
        { pos: [0, 4.5, 15], color: "#F57F17", id: "C-4469" },
        { pos: [5, 1.5, 15], color: "#6A1B9A", id: "C-4468" },
        { pos: [-5, 1.5, 24], color: "#00838F", id: "C-4467" },
        { pos: [0, 1.5, 24], color: "#E65100", id: "C-4466" },
        { pos: [5, 1.5, 24], color: "#AD1457", id: "C-4465" },
        { pos: [-5, 4.5, 24], color: "#1B5E20", id: "C-4464" },
        { pos: [0, 4.5, 24], color: "#0277BD", id: "C-4463" },
      ].map((container, i) => (
        <group key={`container-${i}`} position={container.pos as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4, 3, 9]} />
            <meshStandardMaterial
              color={container.color}
              metalness={0.6}
              roughness={0.4}
              emissive={
                container.id === "C-4472" && detectedSensors.includes("rfid-container") ? container.color : "#000000"
              }
              emissiveIntensity={container.id === "C-4472" && detectedSensors.includes("rfid-container") ? 0.5 : 0}
            />
          </mesh>
          {/* Container doors */}
          <mesh position={[0, 0, 4.51]}>
            <boxGeometry args={[3.8, 2.8, 0.1]} />
            <meshStandardMaterial color="#37474F" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Container ID label */}
          {container.id === "C-4472" && (
            <Html distanceFactor={10} position={[0, 2, 4.6]}>
              <div className="bg-black/70 text-white px-2 py-0.5 rounded text-xs font-mono">{container.id}</div>
            </Html>
          )}
        </group>
      ))}

      {/* Additional container row */}
      {[
        { pos: [-12, 1.5, 28], color: "#37474F" },
        { pos: [-12, 4.5, 28], color: "#5D4037" },
        { pos: [-17, 1.5, 28], color: "#455A64" },
      ].map((container, i) => (
        <mesh key={`extra-container-${i}`} position={container.pos as [number, number, number]} castShadow>
          <boxGeometry args={[4, 3, 9]} />
          <meshStandardMaterial color={container.color} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* ========== PARKED TRUCKS ========== */}
      {[
        [20, 0, -5],
        [20, 0, 8],
      ].map((pos, i) => (
        <group key={`truck-${i}`} position={pos as [number, number, number]}>
          {/* Trailer */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <boxGeometry args={[3.5, 5, 12]} />
            <meshStandardMaterial color="#ECEFF1" metalness={0.4} roughness={0.5} />
          </mesh>
          {/* Cab */}
          <mesh position={[0, 2, -7.5]} castShadow>
            <boxGeometry args={[3.5, 4, 3]} />
            <meshStandardMaterial color="#B71C1C" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Cab windows */}
          <mesh position={[0, 3.5, -8.8]}>
            <boxGeometry args={[3, 1.5, 0.1]} />
            <meshStandardMaterial color="#37474F" metalness={0.8} roughness={0.2} transparent opacity={0.7} />
          </mesh>
          {/* Wheels */}
          {[
            [-1.5, 0.6, -7],
            [1.5, 0.6, -7],
            [-1.5, 0.6, 0],
            [1.5, 0.6, 0],
            [-1.5, 0.6, 4],
            [1.5, 0.6, 4],
          ].map((wpos, j) => (
            <mesh
              key={`wheel-${j}`}
              position={wpos as [number, number, number]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
              <meshStandardMaterial color="#1C1C1C" metalness={0.4} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ========== PERIMETER FENCE ========== */}
      {[
        { pos: [0, 3, 42], size: [90, 6, 0.2] },
        { pos: [0, 3, -42], size: [90, 6, 0.2] },
        { pos: [42, 3, 0], size: [0.2, 6, 84] },
        { pos: [-42, 3, 0], size: [0.2, 6, 84] },
      ].map((fence, i) => (
        <mesh key={`fence-${i}`} position={fence.pos as [number, number, number]} castShadow>
          <boxGeometry args={fence.size as [number, number, number]} />
          <meshStandardMaterial color="#455A64" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Fence posts */}
      {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((x) => (
        <mesh key={`post-front-${x}`} position={[x, 3, 42]} castShadow>
          <boxGeometry args={[0.3, 6, 0.3]} />
          <meshStandardMaterial color="#37474F" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Section 7 - fence breach point (highlighted) */}
      <group position={[42, 0, 18]}>
        <mesh position={[0, 3, 0]} castShadow>
          <boxGeometry args={[0.3, 6, 14]} />
          <meshStandardMaterial
            color="#B71C1C"
            metalness={0.6}
            roughness={0.4}
            emissive={detectedSensors.includes("fiber-fence") ? "#ff0000" : "#000000"}
            emissiveIntensity={detectedSensors.includes("fiber-fence") ? 0.6 : 0}
          />
        </mesh>
        {/* Section marker */}
        <Html distanceFactor={15} position={[1, 5, 0]}>
          <div className="bg-red-600/80 text-white px-2 py-0.5 rounded text-xs font-bold">SECTION 7</div>
        </Html>
      </group>

      {/* ========== MAIN GATE ========== */}
      <group position={[0, 0, 42]}>
        {/* Gate posts */}
        {[-7, 7].map((x, i) => (
          <mesh key={`gate-post-${i}`} position={[x, 4, 0]} castShadow>
            <boxGeometry args={[1.2, 8, 1.2]} />
            <meshStandardMaterial color="#37474F" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* Gate barrier arm */}
        <mesh position={[0, 4, 0]} castShadow>
          <boxGeometry args={[14, 0.6, 0.4]} />
          <meshStandardMaterial color="#4CAF50" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Guard booth */}
        <mesh position={[-12, 2.5, 3]} castShadow>
          <boxGeometry args={[5, 5, 5]} />
          <meshStandardMaterial color="#78909C" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Guard booth window */}
        <mesh position={[-9.49, 3, 3]}>
          <boxGeometry args={[0.1, 2.5, 3]} />
          <meshStandardMaterial color="#87CEEB" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* ========== SENSORS & CAMERAS ========== */}
      {/* Warehouse cameras */}
      <Camera
        position={[-7, 15.5, -18]}
        rotation={[0, Math.PI / 2, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-yard-ptz"
        isTracking={trackingCameras.includes("cam-yard-ptz")}
      />
      <Camera
        position={[-22, 15.5, 0]}
        rotation={[0, Math.PI, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-warehouse-2"
        isTracking={trackingCameras.includes("cam-warehouse-2")}
      />
      <Camera
        position={[-22, 15.5, -35.5]}
        rotation={[0, 0, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-warehouse-3"
        isTracking={trackingCameras.includes("cam-warehouse-3")}
      />

      {/* Container yard cameras on poles */}
      {[
        { pos: [-5, 0, 32], id: "cam-container" },
        { pos: [10, 0, 20], id: "cam-containers-2" },
      ].map((cam, i) => (
        <group key={`cam-pole-${i}`} position={cam.pos as [number, number, number]}>
          {/* Pole */}
          <mesh position={[0, 4.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 9, 8]} />
            <meshStandardMaterial color="#607D8B" metalness={0.6} roughness={0.4} />
          </mesh>
          <Camera
            position={[0, 9, 0]}
            rotation={[0, i === 0 ? Math.PI : -Math.PI / 2, 0]}
            onDeviceClick={onDeviceClick}
            id={cam.id}
            isTracking={trackingCameras.includes(cam.id)}
          />
        </group>
      ))}

      {/* Gate LPR cameras */}
      <Camera
        position={[-7, 7.5, 42]}
        rotation={[0, Math.PI, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-gate-lpr"
        isTracking={trackingCameras.includes("cam-gate-lpr")}
      />
      <Camera
        position={[7, 7.5, 42]}
        rotation={[0, Math.PI, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-gate-lpr-2"
        isTracking={trackingCameras.includes("cam-gate-lpr-2")}
      />

      {/* Office camera */}
      <Camera
        position={[25, 9.5, -28]}
        rotation={[0, Math.PI / 2, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-office"
        isTracking={trackingCameras.includes("cam-office")}
      />

      {/* Fiber optic fence sensor (Section 7) */}
      <Sensor
        position={[42, 4, 18]}
        onDeviceClick={onDeviceClick}
        id="fiber-fence"
        isDetecting={detectedSensors.includes("fiber-fence")}
      />

      {/* Badge reader at warehouse entrance */}
      <Sensor
        position={[-7, 2.5, -18]}
        onDeviceClick={onDeviceClick}
        id="badge-system"
        isDetecting={detectedSensors.includes("badge-system")}
      />

      {/* RFID container tracking */}
      <Sensor
        position={[-5, 4, 15]}
        onDeviceClick={onDeviceClick}
        id="rfid-container"
        isDetecting={detectedSensors.includes("rfid-container")}
      />

      {/* Perimeter sensors */}
      <Sensor
        position={[42, 4, -15]}
        onDeviceClick={onDeviceClick}
        id="perimeter-sensor-1"
        isDetecting={detectedSensors.includes("perimeter-sensor-1")}
      />
      <Sensor
        position={[-42, 4, 15]}
        onDeviceClick={onDeviceClick}
        id="perimeter-sensor-2"
        isDetecting={detectedSensors.includes("perimeter-sensor-2")}
      />
      <Sensor
        position={[0, 4, -42]}
        onDeviceClick={onDeviceClick}
        id="perimeter-sensor-3"
        isDetecting={detectedSensors.includes("perimeter-sensor-3")}
      />

      {/* Radar on warehouse roof */}
      <Radar position={[-22, 17.5, -18]} onDeviceClick={onDeviceClick} id="radar-warehouse" />

      {/* Radar at admin office */}
      <Radar position={[25, 11, -28]} onDeviceClick={onDeviceClick} id="radar-office" />

      {/* UAVs */}
      <UAV
        position={[0, 25, 5]}
        onDeviceClick={onDeviceClick}
        id="uav-yard"
        type="rapid-response"
        isDispatched={dispatchedDrones.includes("uav-yard")}
      />
      <UAV
        position={[-25, 22, 20]}
        onDeviceClick={onDeviceClick}
        id="uav-patrol"
        type="patrol"
        isDispatched={dispatchedDrones.includes("uav-patrol")}
      />

      {/* ========== FORKLIFT (moving container) ========== */}
      {isActive && (
        <group ref={forkliftRef}>
          {/* Forklift body */}
          <mesh castShadow>
            <boxGeometry args={[2, 1.4, 3]} />
            <meshStandardMaterial
              color="#F57F17"
              emissive="#FF8F00"
              emissiveIntensity={0.4}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          {/* Driver cage */}
          <mesh position={[0, 1.4, -0.4]} castShadow>
            <boxGeometry args={[1.8, 1.8, 1.4]} />
            <meshStandardMaterial color="#424242" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Mast */}
          <mesh position={[0, 2, 1.8]} castShadow>
            <boxGeometry args={[0.25, 4, 0.25]} />
            <meshStandardMaterial color="#616161" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Forks */}
          {[-0.6, 0.6].map((x, i) => (
            <mesh key={`fork-${i}`} position={[x, 0.35, 2.5]} castShadow>
              <boxGeometry args={[0.18, 0.12, 2]} />
              <meshStandardMaterial color="#424242" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
          {/* Warning light */}
          <mesh position={[0, 2.5, -0.4]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FF9800" emissive="#FF9800" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {/* ========== INSIDER THREAT (Employee #2847) ========== */}
      {isActive && (
        <group ref={insiderRef}>
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
            <meshStandardMaterial color="#FF9800" emissive="#F57C00" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.24, 16, 16]} />
            <meshStandardMaterial color="#FFB74D" emissive="#F57C00" emissiveIntensity={0.3} />
          </mesh>
          {/* Hard hat */}
          <mesh position={[0, 1.45, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#FFC107" />
          </mesh>
          <pointLight position={[0, 2, 0]} intensity={2} color="#ff9800" distance={8} />
          <Html distanceFactor={12} position={[0, 3, 0]}>
            <div className="bg-orange-500/90 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap animate-pulse">
              INSIDER - Employee #2847
            </div>
          </Html>
        </group>
      )}

      {/* ========== EXTERNAL ACCOMPLICE (at fence) ========== */}
      {isActive && (
        <group ref={accompliceRef}>
          <mesh castShadow>
            <capsuleGeometry args={[0.28, 1.1, 8, 16]} />
            <meshStandardMaterial color="#D32F2F" emissive="#B71C1C" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#EF5350" emissive="#B71C1C" emissiveIntensity={0.3} />
          </mesh>
          {/* Bolt cutters */}
          <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.08, 0.8, 0.08]} />
            <meshStandardMaterial color="#424242" metalness={0.7} roughness={0.3} />
          </mesh>
          <pointLight position={[0, 2, 0]} intensity={2} color="#ff3333" distance={8} />
          <Html distanceFactor={12} position={[0, 2.8, 0]}>
            <div className="bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap animate-pulse">
              ACCOMPLICE - Fence Breach
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}
