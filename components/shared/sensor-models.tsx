"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"
import { Html } from "@react-three/drei"
import { useScenarioStore } from "@/lib/scenario-store"
import * as THREE from "three"

type SensorProps = {
  position: [number, number, number]
  onDeviceClick?: (deviceName: string) => void
  id: string
  isDetecting?: boolean
}

// Animated detection ring component
function DetectionRing({ active, color = "#F59E0B" }: { active: boolean; color?: string }) {
  const ringRef = useRef<Mesh>(null)
  const [scale, setScale] = useState(0.1)

  useFrame((state, delta) => {
    if (!ringRef.current) return
    if (active) {
      setScale((prev) => {
        const newScale = prev + delta * 2
        return newScale > 3 ? 0.1 : newScale
      })
      ringRef.current.scale.setScalar(scale)
      ringRef.current.material.opacity = Math.max(0, 1 - scale / 3)
    }
  })

  if (!active) return null

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <ringGeometry args={[0.9, 1, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Radar sweep beam
function RadarSweep({ active }: { active: boolean }) {
  const sweepRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (sweepRef.current && active) {
      sweepRef.current.rotation.z = state.clock.elapsedTime * 2
    }
  })

  return (
    <mesh ref={sweepRef} rotation={[Math.PI / 4, 0, 0]} position={[0, 0.1, 0.8]}>
      <planeGeometry args={[0.1, 1.2]} />
      <meshBasicMaterial color="#3B82F6" transparent opacity={active ? 0.6 : 0.2} side={THREE.DoubleSide} />
    </mesh>
  )
}

export function Camera({ position, rotation, onDeviceClick, id, isTracking }: any) {
  const groupRef = useRef<Group>(null)
  const beamRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const intruderPosition = useScenarioStore((state) => state.intruderPosition)
  const phase = useScenarioStore((state) => state.phase)

  useFrame((state) => {
    if (groupRef.current) {
      if (isTracking && intruderPosition) {
        const targetX = intruderPosition[0] - position[0]
        const targetZ = intruderPosition[2] - position[2]
        const targetAngle = Math.atan2(targetX, targetZ)
        // Smooth rotation with easing
        groupRef.current.rotation.y += (targetAngle - groupRef.current.rotation.y) * 0.08
      } else if (hovered) {
        groupRef.current.rotation.y += 0.01
      }
    }

    // Animate beam opacity
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = isTracking ? 0.25 + Math.sin(state.clock.elapsedTime * 4) * 0.1 : 0
    }
  })

  const handleClick = () => {
    onDeviceClick?.(`Security Camera ${id}`)
  }

  const cameraColor = isTracking ? "#EF4444" : phase !== "idle" ? "#F59E0B" : hovered ? "#00ffff" : "#4a5568"

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Camera body - more detailed */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.25, 0.4]} />
        <meshStandardMaterial
          color={cameraColor}
          emissive={isTracking ? "#ff0000" : hovered ? "#00ffff" : "#000000"}
          emissiveIntensity={isTracking ? 0.8 : hovered ? 0.5 : 0}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Camera lens housing */}
      <mesh position={[0, 0, 0.25]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Lens glass */}
      <mesh position={[0, 0, 0.33]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial
          color={isTracking ? "#ff0000" : "#1565C0"}
          emissive={isTracking ? "#ff0000" : "#1565C0"}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Status LED */}
      <mesh position={[0.12, 0.1, 0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color={isTracking ? "#ff0000" : "#10b981"}
          emissive={isTracking ? "#ff0000" : "#10b981"}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Tracking beam - visible when tracking */}
      {isTracking && (
        <mesh ref={beamRef} position={[0, 0, 8]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[2.5, 15, 16, 1, true]} />
          <meshBasicMaterial color="#EF4444" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}

      {isTracking && (
        <spotLight position={[0, 0, 0.5]} angle={0.25} penumbra={0.5} intensity={3} color="#ff0000" distance={35} />
      )}

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-[#0A0F1C]/95 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none border border-[#2563EB]/50 shadow-lg shadow-blue-500/20">
            <span className="font-semibold">CAM-{id}</span>
            {isTracking && <span className="ml-2 text-red-400 animate-pulse">TRACKING</span>}
          </div>
        </Html>
      )}
    </group>
  )
}

export function UAV({ position, onDeviceClick, id, type, isDispatched }: any) {
  const groupRef = useRef<Group>(null)
  const rotorsRef = useRef<Group[]>([])
  const [hovered, setHovered] = useState(false)
  const intruderPosition = useScenarioStore((state) => state.intruderPosition)
  const phase = useScenarioStore((state) => state.phase)

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
          // Smooth eased movement
          const speed = Math.min(0.15, distance * 0.02)
          groupRef.current.position.x += (dx / distance) * speed
          groupRef.current.position.z += (dz / distance) * speed
          
          // Tilt in direction of movement
          groupRef.current.rotation.z = (dx / distance) * 0.2
          groupRef.current.rotation.x = (dz / distance) * 0.2
        }

        // Hovering motion
        groupRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 3) * 0.4
      } else {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.5
        groupRef.current.rotation.y += 0.005
      }
    }

    // Spin rotors
    rotorsRef.current.forEach((rotor, i) => {
      if (rotor) {
        rotor.rotation.y = state.clock.elapsedTime * (isDispatched ? 50 : 20) + i * Math.PI / 2
      }
    })
  })

  const handleClick = () => {
    onDeviceClick?.(`UAV Drone ${id}`)
  }

  const droneColor = isDispatched ? "#EF4444" : phase !== "idle" ? "#F59E0B" : hovered ? "#3B82F6" : "#1E293B"

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.2, 0.7]} />
        <meshStandardMaterial
          color={droneColor}
          emissive={isDispatched ? "#ff0000" : hovered ? "#3B82F6" : "#000000"}
          emissiveIntensity={isDispatched ? 0.6 : hovered ? 0.4 : 0}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Arms */}
      {[
        [0.4, 0, 0.4],
        [-0.4, 0, 0.4],
        [0.4, 0, -0.4],
        [-0.4, 0, -0.4],
      ].map((pos, i) => (
        <group key={`arm-${i}`}>
          <mesh position={[pos[0] * 0.5, 0.05, pos[2] * 0.5]} castShadow>
            <boxGeometry args={[Math.abs(pos[0]) * 0.8, 0.08, 0.08]} />
            <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[pos[0], 0.05, pos[2]] as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
            <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Rotors with spinning animation */}
      {[
        [0.4, 0.15, 0.4],
        [-0.4, 0.15, 0.4],
        [0.4, 0.15, -0.4],
        [-0.4, 0.15, -0.4],
      ].map((pos, i) => (
        <group
          key={i}
          position={pos as [number, number, number]}
          ref={(el) => {
            if (el) rotorsRef.current[i] = el
          }}
        >
          <mesh>
            <cylinderGeometry args={[0.28, 0.28, 0.02, 16]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={isDispatched ? 0.7 : 0.4} />
          </mesh>
          {/* Rotor blades */}
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.01, 0.05]} />
            <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.5, 0.01, 0.05]} />
            <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Camera gimbal */}
      <mesh position={[0, -0.15, 0.1]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color="#1565C0"
          emissive="#1565C0"
          emissiveIntensity={isDispatched ? 1 : 0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Status lights */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={isDispatched ? "#ff0000" : "#10b981"}
          emissive={isDispatched ? "#ff0000" : "#10b981"}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Navigation lights */}
      {[
        [0.4, 0.1, 0.4, "#ff0000"],
        [-0.4, 0.1, 0.4, "#00ff00"],
        [0.4, 0.1, -0.4, "#ffffff"],
        [-0.4, 0.1, -0.4, "#ffffff"],
      ].map(([x, y, z, color], i) => (
        <mesh key={`nav-${i}`} position={[x as number, y as number, z as number]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color={color as string} emissive={color as string} emissiveIntensity={1.5} />
        </mesh>
      ))}

      {isDispatched && (
        <>
          <spotLight
            position={[0, -0.5, 0]}
            angle={0.5}
            penumbra={0.5}
            intensity={4}
            color="#ffffff"
            distance={25}
          />
          <pointLight position={[0, 0, 0]} intensity={2} color="#ff0000" distance={8} />
        </>
      )}

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-[#0A0F1C]/95 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none border border-[#2563EB]/50 shadow-lg shadow-blue-500/20">
            <span className="font-semibold">UAV-{id}</span>
            <span className="ml-2 text-gray-400">{type}</span>
            {isDispatched && <span className="ml-2 text-red-400 animate-pulse">ACTIVE</span>}
          </div>
        </Html>
      )}
    </group>
  )
}

export function Sensor({ position, onDeviceClick, id, isDetecting }: SensorProps) {
  const [hovered, setHovered] = useState(false)
  const lightRef = useRef<Mesh>(null)
  const coneRef = useRef<Mesh>(null)
  const pulseRef = useRef<Mesh>(null)
  const intruderPosition = useScenarioStore((state) => state.intruderPosition)
  const phase = useScenarioStore((state) => state.phase)

  useFrame((state) => {
    if (lightRef.current) {
      const mat = lightRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = isDetecting
        ? 1.5 + Math.sin(state.clock.elapsedTime * 6) * 0.8
        : 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }

    if (coneRef.current && isDetecting && intruderPosition) {
      const sensorPos = new THREE.Vector3(position[0], position[1] + 1.2, position[2])
      const targetPos = new THREE.Vector3(intruderPosition[0], intruderPosition[1], intruderPosition[2])
      const direction = targetPos.sub(sensorPos).normalize()

      const angle = Math.atan2(direction.x, direction.z)
      const tilt = Math.asin(direction.y)

      // Smooth rotation
      coneRef.current.rotation.y += (angle - coneRef.current.rotation.y) * 0.1
      coneRef.current.rotation.x += (-tilt + Math.PI / 2 - coneRef.current.rotation.x) * 0.1
    }

    // Pulse animation
    if (pulseRef.current && isDetecting) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2
      pulseRef.current.scale.setScalar(scale)
    }
  })

  const handleClick = () => {
    onDeviceClick?.(`Perimeter Sensor ${id}`)
  }

  const sensorColor = isDetecting ? "#EF4444" : phase !== "idle" ? "#F59E0B" : hovered ? "#10B981" : "#1E293B"

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Pole */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Sensor housing */}
      <mesh position={[0, 1.2, 0]} castShadow ref={pulseRef}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial
          color={sensorColor}
          emissive={isDetecting ? "#EF4444" : hovered ? "#10B981" : "#000000"}
          emissiveIntensity={isDetecting ? 0.8 : hovered ? 0.4 : 0}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Sensor band detail */}
      <mesh position={[0, 1.2, 0]}>
        <torusGeometry args={[0.22, 0.02, 8, 32]} />
        <meshStandardMaterial color="#1F2937" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Status LED */}
      <mesh ref={lightRef} position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={isDetecting ? "#EF4444" : "#10B981"}
          emissive={isDetecting ? "#EF4444" : "#10B981"}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Detection cone */}
      {isDetecting && (
        <mesh ref={coneRef} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[4, 12, 24, 1, true]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Detection rings */}
      <DetectionRing active={isDetecting || false} color={isDetecting ? "#EF4444" : "#F59E0B"} />

      {isDetecting && <pointLight position={[0, 1.2, 0]} intensity={2} color="#EF4444" distance={6} />}

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-[#0A0F1C]/95 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none border border-[#2563EB]/50 shadow-lg shadow-blue-500/20">
            <span className="font-semibold">SENSOR-{id}</span>
            {isDetecting && <span className="ml-2 text-red-400 animate-pulse">ALERT</span>}
          </div>
        </Html>
      )}
    </group>
  )
}

export function Radar({ position, onDeviceClick, id }: any) {
  const dishRef = useRef<Group>(null)
  const sweepRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const isActive = useScenarioStore((state) => state.isActive)
  const phase = useScenarioStore((state) => state.phase)

  useFrame((state) => {
    if (dishRef.current) {
      dishRef.current.rotation.y += isActive ? 0.04 : 0.015
    }
    if (sweepRef.current) {
      sweepRef.current.rotation.z = state.clock.elapsedTime * (isActive ? 3 : 1.5)
      const mat = sweepRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = isActive ? 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2 : 0.2
    }
  })

  const handleClick = () => {
    onDeviceClick?.(`Radar System ${id}`)
  }

  const radarColor = isActive ? "#3B82F6" : phase !== "idle" ? "#F59E0B" : hovered ? "#3B82F6" : "#1E293B"

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base platform */}
      <mesh castShadow>
        <cylinderGeometry args={[0.9, 1.1, 0.5, 20]} />
        <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rotating assembly */}
      <group ref={dishRef} position={[0, 0.5, 0]}>
        {/* Dish */}
        <mesh rotation={[Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[1.3, 1.3, 0.12, 36]} />
          <meshStandardMaterial
            color={radarColor}
            emissive={isActive ? "#3B82F6" : hovered ? "#3B82F6" : "#000000"}
            emissiveIntensity={isActive ? 0.6 : hovered ? 0.4 : 0}
            metalness={0.92}
            roughness={0.08}
          />
        </mesh>

        {/* Dish rim */}
        <mesh rotation={[Math.PI / 4, 0, 0]} position={[0, 0.07, 0]}>
          <torusGeometry args={[1.3, 0.04, 8, 36]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Feed horn */}
        <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.12, 0.6, 12]} />
          <meshStandardMaterial
            color={isActive ? "#ff0000" : "#10b981"}
            emissive={isActive ? "#ff0000" : "#10b981"}
            emissiveIntensity={1.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Sweep beam visualization */}
        <mesh ref={sweepRef} rotation={[Math.PI / 4, 0, 0]} position={[0, 0.1, 0.7]}>
          <planeGeometry args={[0.08, 1.4]} />
          <meshBasicMaterial color="#3B82F6" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Status indicator */}
      <mesh position={[0, 0.3, 0.8]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color={isActive ? "#10B981" : "#6B7280"}
          emissive={isActive ? "#10B981" : "#000000"}
          emissiveIntensity={isActive ? 1.5 : 0}
        />
      </mesh>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-[#0A0F1C]/95 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none border border-[#2563EB]/50 shadow-lg shadow-blue-500/20">
            <span className="font-semibold">RADAR-{id}</span>
            {isActive && <span className="ml-2 text-green-400">SCANNING</span>}
          </div>
        </Html>
      )}
    </group>
  )
}
