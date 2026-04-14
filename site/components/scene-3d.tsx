"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"
import GeometricShapes from "./geometric-shapes"
import LoadingFallback from "./loading-fallback"

export default function Scene3D() {
  return (
    <div className="w-full h-screen">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          enableZoom={true}
          minDistance={5}
          maxDistance={15}
        />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#a855f7" />

        <Suspense fallback={<LoadingFallback />}>
          <GeometricShapes />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}
