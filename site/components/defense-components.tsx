"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"
import { Html } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import * as THREE from "three"

type Vec3 = [number, number, number]
type DeviceClickHandler = (deviceName: string) => void

type DefenseComponentsProps = {
  onDeviceClick?: DeviceClickHandler
}

type CameraProps = {
  position: Vec3
  rotation: Vec3
  onDeviceClick?: DeviceClickHandler
  id: string
  isTracking?: boolean
}

type UAVProps = {
  position: Vec3
  onDeviceClick?: DeviceClickHandler
  id: string
  type: "rapid-response" | "patrol" | "surveillance"
  isDispatched?: boolean
}

type EdgeComputeProps = {
  position: Vec3
  onDeviceClick?: DeviceClickHandler
  id: string
}

type SensorProps = {
  position: Vec3
  onDeviceClick?: DeviceClickHandler
  id: string
  isDetecting?: boolean
}

type RadarProps = {
  position: Vec3
  onDeviceClick?: DeviceClickHandler
  id: string
}

export default function DefenseComponents({ onDeviceClick }: DefenseComponentsProps) {
  const { trackingCameras, dispatchedDrones, detectedSensors } = useScenarioStore()

  return (
    <group>
      {/* Security Cameras */}
      <Camera
        position={[6, 6, 8]}
        rotation={[0, Math.PI, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-1"
        isTracking={trackingCameras.includes("cam-1")}
      />
      <Camera
        position={[-6, 6, 8]}
        rotation={[0, Math.PI, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-2"
        isTracking={trackingCameras.includes("cam-2")}
      />
      <Camera
        position={[6, 6, -8]}
        rotation={[0, 0, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-3"
        isTracking={trackingCameras.includes("cam-3")}
      />
      <Camera
        position={[-6, 6, -8]}
        rotation={[0, 0, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-4"
        isTracking={trackingCameras.includes("cam-4")}
      />

      {/* Perimeter Cameras on Towers */}
      <Camera
        position={[14, 6, 19]}
        rotation={[0, -Math.PI / 4, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-5"
        isTracking={trackingCameras.includes("cam-5")}
      />
      <Camera
        position={[-14, 6, 19]}
        rotation={[0, Math.PI / 4, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-6"
        isTracking={trackingCameras.includes("cam-6")}
      />
      <Camera
        position={[14, 6, -19]}
        rotation={[0, Math.PI / 4, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-7"
        isTracking={trackingCameras.includes("cam-7")}
      />
      <Camera
        position={[-14, 6, -19]}
        rotation={[0, -Math.PI / 4, 0]}
        onDeviceClick={onDeviceClick}
        id="cam-8"
        isTracking={trackingCameras.includes("cam-8")}
      />

      {/* UAV Drones */}
      <UAV
        position={[10, 12, 10]}
        onDeviceClick={onDeviceClick}
        id="uav-1"
        type="patrol"
        isDispatched={dispatchedDrones.includes("uav-1")}
      />
      <UAV
        position={[-10, 15, -10]}
        onDeviceClick={onDeviceClick}
        id="uav-2"
        type="surveillance"
        isDispatched={dispatchedDrones.includes("uav-2")}
      />
      <UAV
        position={[15, 18, -5]}
        onDeviceClick={onDeviceClick}
        id="uav-3"
        type="rapid-response"
        isDispatched={dispatchedDrones.includes("uav-3")}
      />

      {/* Edge Compute Nodes */}
      <EdgeCompute position={[-3, 8.5, 0]} onDeviceClick={onDeviceClick} id="edge-1" />
      <EdgeCompute position={[3, 8.5, 0]} onDeviceClick={onDeviceClick} id="edge-2" />

      {/* Perimeter Sensors */}
      <Sensor
        position={[15, 2, 10]}
        onDeviceClick={onDeviceClick}
        id="sensor-1"
        isDetecting={detectedSensors.includes("sensor-1")}
      />
      <Sensor
        position={[15, 2, -10]}
        onDeviceClick={onDeviceClick}
        id="sensor-2"
        isDetecting={detectedSensors.includes("sensor-2")}
      />
      <Sensor
        position={[-15, 2, 10]}
        onDeviceClick={onDeviceClick}
        id="sensor-3"
        isDetecting={detectedSensors.includes("sensor-3")}
      />
      <Sensor
        position={[-15, 2, -10]}
        onDeviceClick={onDeviceClick}
        id="sensor-4"
        isDetecting={detectedSensors.includes("sensor-4")}
      />

      {/* Radar System */}
      <Radar position={[0, 9, 0]} onDeviceClick={onDeviceClick} id="radar-1" />
    </group>
  )
}

function Camera({ position, rotation, onDeviceClick, id, isTracking }: CameraProps) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const intruderPosition = useScenarioStore((state) => state.intruderPosition)

  useFrame((state) => {
    if (groupRef.current) {
      if (isTracking && intruderPosition) {
        const targetX = intruderPosition[0] - position[0]
        const targetZ = intruderPosition[2] - position[2]
        const targetAngle = Math.atan2(targetX, targetZ)
        groupRef.current.rotation.y = targetAngle
      } else if (hovered) {
        groupRef.current.rotation.y += 0.01
      }
    }
  })

  const handleClick = () => {
    onDeviceClick?.(`Security Camera ${id.split("-")[1]}`)
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 8]} />
        <meshStandardMaterial
          color={isTracking ? "#ff3333" : hovered ? "#00ffff" : "#4a5568"}
          emissive={isTracking ? "#ff0000" : hovered ? "#00ffff" : "#000000"}
          emissiveIntensity={isTracking ? 0.8 : hovered ? 0.5 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color={isTracking ? "#ff0000" : "#00ff00"}
          emissive={isTracking ? "#ff0000" : "#00ff00"}
          emissiveIntensity={1.5}
        />
      </mesh>

      {isTracking && (
        <spotLight position={[0, 0, 0.5]} angle={0.3} penumbra={0.5} intensity={2} color="#ff0000" distance={30} />
      )}

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-slate-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
            Camera {id.split("-")[1]} {isTracking && "- TRACKING"}
          </div>
        </Html>
      )}
    </group>
  )
}

function UAV({ position, onDeviceClick, id, type, isDispatched }: UAVProps) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const intruderPosition = useScenarioStore((state) => state.intruderPosition)

  useFrame((state) => {
    if (groupRef.current) {
      if (isDispatched && intruderPosition) {
        const targetX = intruderPosition[0]
        const targetZ = intruderPosition[2]
        const currentX = groupRef.current.position.x
        const currentZ = groupRef.current.position.z

        const dx = targetX - currentX
        const dz = targetZ - currentZ
        const distance = Math.sqrt(dx * dx + dz * dz)

        if (distance > 3) {
          groupRef.current.position.x += (dx / distance) * 0.05
          groupRef.current.position.z += (dz / distance) * 0.05
        }

        groupRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 2) * 0.3
      } else {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5
      }
      groupRef.current.rotation.y += 0.02
    }
  })

  const handleClick = () => {
    onDeviceClick?.(`UAV Drone ${id.split("-")[1]}`)
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial
          color={isDispatched ? "#ff3333" : hovered ? "#ff6b00" : "#2d3748"}
          emissive={isDispatched ? "#ff0000" : hovered ? "#ff6b00" : "#000000"}
          emissiveIntensity={isDispatched ? 0.8 : hovered ? 0.5 : 0}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {[
        [0.4, 0.15, 0.4],
        [-0.4, 0.15, 0.4],
        [0.4, 0.15, -0.4],
        [-0.4, 0.15, -0.4],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={0.3} />
        </mesh>
      ))}

      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color={isDispatched ? "#ff0000" : "#00ff00"}
          emissive={isDispatched ? "#ff0000" : "#00ff00"}
          emissiveIntensity={1.5}
        />
      </mesh>

      {isDispatched && (
        <spotLight position={[0, -0.5, 0]} angle={0.4} penumbra={0.5} intensity={3} color="#ff0000" distance={20} />
      )}

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-slate-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
            UAV {id.split("-")[1]} - {type} {isDispatched && "- DISPATCHED"}
          </div>
        </Html>
      )}
    </group>
  )
}

function EdgeCompute({ position, onDeviceClick, id }: EdgeComputeProps) {
  const [hovered, setHovered] = useState(false)
  const isActive = useScenarioStore((state) => state.isActive)

  const handleClick = () => {
    onDeviceClick?.(`Edge Compute Node ${id.split("-")[1]}`)
  }

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.8, 1.5]} />
        <meshStandardMaterial
          color={isActive ? "#8b5cf6" : hovered ? "#8b5cf6" : "#374151"}
          emissive={isActive ? "#8b5cf6" : hovered ? "#8b5cf6" : "#000000"}
          emissiveIntensity={isActive ? 0.8 : hovered ? 0.5 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={i} position={[0.76, 0, z]}>
          <planeGeometry args={[0.5, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.41, 0.7]}>
          <boxGeometry args={[0.05, 0.02, 0.05]} />
          <meshStandardMaterial
            color={isActive ? "#ff00ff" : i % 2 === 0 ? "#00ff00" : "#0080ff"}
            emissive={isActive ? "#ff00ff" : i % 2 === 0 ? "#00ff00" : "#0080ff"}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-[#111827]/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none border border-[#2563EB]">
            Edge Compute {id.split("-")[1]} {isActive && "- PROCESSING"}
          </div>
        </Html>
      )}
    </group>
  )
}

function Sensor({ position, onDeviceClick, id, isDetecting }: SensorProps) {
  const [hovered, setHovered] = useState(false)
  const lightRef = useRef<Mesh>(null)
  const coneRef = useRef<Mesh>(null)
  const intruderPosition = useScenarioStore((state) => state.intruderPosition)

  useFrame((state) => {
    if (lightRef.current) {
      const mat = lightRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = isDetecting
        ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.5
        : 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5
    }

    if (coneRef.current && isDetecting && intruderPosition) {
      const sensorPos = new THREE.Vector3(position[0], position[1] + 1.2, position[2])
      const targetPos = new THREE.Vector3(intruderPosition[0], intruderPosition[1], intruderPosition[2])
      const direction = targetPos.sub(sensorPos).normalize()

      const angle = Math.atan2(direction.x, direction.z)
      const tilt = Math.asin(direction.y)

      coneRef.current.rotation.y = angle
      coneRef.current.rotation.x = -tilt + Math.PI / 2
    }
  })

  const handleClick = () => {
    onDeviceClick?.(`Perimeter Sensor ${id.split("-")[1]}`)
  }

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={isDetecting ? "#EF4444" : hovered ? "#10B981" : "#111827"}
          emissive={isDetecting ? "#EF4444" : hovered ? "#10B981" : "#000000"}
          emissiveIntensity={isDetecting ? 0.8 : hovered ? 0.5 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={lightRef} position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color={isDetecting ? "#EF4444" : "#10B981"}
          emissive={isDetecting ? "#EF4444" : "#10B981"}
          emissiveIntensity={1}
        />
      </mesh>

      {isDetecting && (
        <mesh ref={coneRef} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[3, 8, 16, 1, true]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-[#111827]/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none border border-[#2563EB]">
            Sensor {id.split("-")[1]} {isDetecting && "- DETECTING"}
          </div>
        </Html>
      )}
    </group>
  )
}

function Radar({ position, onDeviceClick, id }: RadarProps) {
  const dishRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const isActive = useScenarioStore((state) => state.isActive)

  useFrame(() => {
    if (dishRef.current) {
      dishRef.current.rotation.y += isActive ? 0.03 : 0.01
    }
  })

  const handleClick = () => {
    onDeviceClick?.("Primary Radar System")
  }

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.8, 1, 0.5, 16]} />
        <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
      </mesh>

      <group ref={dishRef} position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
          <meshStandardMaterial
            color={isActive ? "#3b82f6" : hovered ? "#3b82f6" : "#1e293b"}
            emissive={isActive ? "#3b82f6" : hovered ? "#3b82f6" : "#000000"}
            emissiveIntensity={isActive ? 0.8 : hovered ? 0.5 : 0}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        <mesh position={[0, 0, 0.8]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.1, 0.5, 8]} />
          <meshStandardMaterial
            color={isActive ? "#ff0000" : "#00ff00"}
            emissive={isActive ? "#ff0000" : "#00ff00"}
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-slate-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
            Radar System {isActive && "- SCANNING"}
          </div>
        </Html>
      )}
    </group>
  )
}
