"use client"

import { useState, useEffect } from "react"
import { useScenarioStore } from "@/lib/scenario-store"

export default function DefenseHUD() {
  const [time, setTime] = useState(new Date())
  const { isActive, phase, detectedSensors, trackingCameras, dispatchedDrones } = useScenarioStore()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const threatCount = isActive ? 1 : 0

  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-950/95 to-transparent backdrop-blur-md border-b border-cyan-500/30 p-4 shadow-2xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Autonomous Perimeter Defence Platform</h1>
              <p className="text-xs text-cyan-400">Data Center Alpha - High Value Site</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-400">System Time</p>
              <p className="text-sm font-mono text-white">{time.toLocaleTimeString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isActive ? "bg-red-500 animate-pulse" : "bg-green-500 animate-pulse"
                }`}
              />
              <span className={`text-sm font-medium ${isActive ? "text-red-400" : "text-green-400"}`}>
                {isActive ? `THREAT ACTIVE - ${phase.toUpperCase()}` : "All Systems Operational"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/95 to-transparent backdrop-blur-md border-t border-cyan-500/30 p-4 shadow-2xl">
        <div className="flex items-center justify-around max-w-6xl mx-auto">
          <StatCard
            icon="📹"
            label="Cameras"
            value="8"
            active={trackingCameras.length}
            status={trackingCameras.length > 0 ? "tracking" : "active"}
          />
          <StatCard
            icon="🛸"
            label="UAVs"
            value="3"
            active={dispatchedDrones.length}
            status={dispatchedDrones.length > 0 ? "dispatched" : "active"}
          />
          <StatCard
            icon="📡"
            label="Sensors"
            value="4"
            active={detectedSensors.length}
            status={detectedSensors.length > 0 ? "detecting" : "active"}
          />
          <StatCard
            icon="💻"
            label="Edge Nodes"
            value="2"
            active={isActive ? 2 : 0}
            status={isActive ? "processing" : "active"}
          />
          <StatCard
            icon="🎯"
            label="Radar"
            value="1"
            active={isActive ? 1 : 0}
            status={isActive ? "tracking" : "active"}
          />
          <StatCard
            icon="⚠️"
            label="Threats"
            value={threatCount.toString()}
            active={threatCount}
            status={threatCount > 0 ? "alert" : "clear"}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-24 left-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 text-xs text-slate-300 max-w-xs shadow-xl">
        <p className="font-semibold text-cyan-400 mb-2">Controls:</p>
        <ul className="space-y-1">
          <li>
            • <span className="text-white">Click</span> defense components for details
          </li>
          <li>
            • <span className="text-white">Drag</span> to rotate camera view
          </li>
          <li>
            • <span className="text-white">Scroll</span> to zoom in/out
          </li>
          <li>
            • <span className="text-white">Start Scenario</span> to see intrusion response
          </li>
        </ul>
      </div>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  active,
  status,
}: {
  icon: string
  label: string
  value: string
  active?: number
  status: string
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-900/60 rounded-lg px-4 py-2 border border-slate-700/50 backdrop-blur-sm">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-white">
            {active !== undefined && active > 0 ? `${active}/${value}` : value}
          </p>
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              status === "active"
                ? "bg-green-500/20 text-green-400"
                : status === "clear"
                  ? "bg-blue-500/20 text-blue-400"
                  : status === "tracking" ||
                      status === "detecting" ||
                      status === "dispatched" ||
                      status === "processing"
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-red-500/20 text-red-400"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  )
}
