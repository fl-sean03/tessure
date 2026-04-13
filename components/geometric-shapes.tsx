"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshDistortMaterial, Float, Text3D } from "@react-three/drei"
import * as THREE from "three"

function InteractiveSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01

      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={clicked ? "#a855f7" : "#6366f1"}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

function InteractiveTorus({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.z += 0.005
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <torusGeometry args={[1, 0.4, 32, 100]} />
        <meshStandardMaterial
          color={hovered ? "#ec4899" : "#8b5cf6"}
          roughness={0.3}
          metalness={0.7}
          emissive={hovered ? "#ec4899" : "#8b5cf6"}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>
    </Float>
  )
}

function InteractiveBox({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.008
      meshRef.current.rotation.y += 0.008
    }
  })

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color={hovered ? "#06b6d4" : "#3b82f6"}
          roughness={0.4}
          metalness={0.6}
          wireframe={hovered}
        />
      </mesh>
    </Float>
  )
}

function InteractiveOctahedron({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.012
      meshRef.current.rotation.y += 0.006
    }
  })

  return (
    <Float speed={2.2} rotationIntensity={0.6} floatIntensity={0.6}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color={hovered ? "#f59e0b" : "#d946ef"}
          roughness={0.2}
          metalness={0.9}
          emissive={hovered ? "#f59e0b" : "#d946ef"}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  )
}

function CenterText() {
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
      <Text3D
        font="/fonts/Geist_Bold.json"
        size={0.5}
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
        position={[-2.5, 0, 0]}
      >
        EXPLORE
        <meshStandardMaterial
          color="#a855f7"
          roughness={0.3}
          metalness={0.8}
          emissive="#a855f7"
          emissiveIntensity={0.3}
        />
      </Text3D>
    </Float>
  )
}

export default function GeometricShapes() {
  return (
    <group>
      <InteractiveSphere position={[-3, 2, 0]} />
      <InteractiveTorus position={[3, 2, 0]} />
      <InteractiveBox position={[-3, -2, 0]} />
      <InteractiveOctahedron position={[3, -2, 0]} />
      <CenterText />
    </group>
  )
}
