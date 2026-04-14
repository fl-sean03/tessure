"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import DefenseScene from "./defense-scene"
import { Button } from "./ui/button"
import { Play, RotateCcw, ChevronRight, X } from "lucide-react"
import { useScenarioStore } from "@/lib/scenario-store"

export default function DefenseDemo() {
  const { isActive, phase, startScenario, resetScenario, systemLogs } = useScenarioStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  const formatTimestamp = (date: Date) => {
    const now = Date.now()
    const diff = now - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 10) return "Just now"
    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleTimeString()
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case "alert":
        return { bg: "bg-[#fef3c7]", border: "border-[#f59e0b]", text: "text-[#92400e]" }
      case "verifying":
        return { bg: "bg-[#dbeafe]", border: "border-[#3b82f6]", text: "text-[#1e40af]" }
      case "verified":
        return { bg: "bg-[#d1fae5]", border: "border-[#10b981]", text: "text-[#065f46]" }
      case "responding":
        return { bg: "bg-[#fee2e2]", border: "border-[#ef4444]", text: "text-[#991b1b]" }
      default:
        return { bg: "bg-[#f1f5f9]", border: "border-[#cbd5e1]", text: "text-[#475569]" }
    }
  }

  return (
    <section id="demo" className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Section header */}
      <div className="text-center mb-12 z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4 text-balance">
          Interactive Tabletop Exercises
        </h2>
        <p className="text-lg text-[#475569] max-w-2xl mx-auto text-pretty">
          Explore real-world deployment scenarios. Watch how Tessure detects, verifies, and responds to threats across
          different environments using multi-sensor fusion and autonomous response.
        </p>
      </div>

      {/* 3D Canvas with Sidebar */}
      <div className="relative w-full max-w-7xl h-[600px] rounded-xl overflow-hidden border-2 border-[#cbd5e1] bg-white shadow-2xl">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#f8fafc]">
              <div className="text-[#475569]">Loading defense system...</div>
            </div>
          }
        >
          <Canvas camera={{ position: [25, 20, 25], fov: 60 }} shadows gl={{ antialias: true, alpha: false }}>
            <DefenseScene onDeviceClick={setSelectedDevice} />
          </Canvas>
        </Suspense>

        {/* Scenario controls overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          {!isActive ? (
            <Button
              onClick={startScenario}
              className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold shadow-lg"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Intrusion Scenario
            </Button>
          ) : (
            <Button
              onClick={resetScenario}
              variant="outline"
              className="bg-white/95 border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9] shadow-lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="outline"
            className="bg-white/95 backdrop-blur-sm border-[#cbd5e1] text-[#0f172a] hover:bg-[#f1f5f9] shadow-lg"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {sidebarOpen && (
          <div className="absolute top-0 right-0 w-80 h-full bg-white/98 backdrop-blur-md border-l-2 border-[#cbd5e1] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h3 className="text-[#0f172a] font-bold text-lg mb-4">System Information</h3>

              {/* System Status */}
              <div className="mb-6">
                <h4 className="text-[#475569] text-sm font-semibold mb-3">Status</h4>
                <div className="bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        phase === "detected"
                          ? "bg-[#f59e0b]"
                          : phase === "verifying"
                            ? "bg-[#3b82f6]"
                            : phase === "verified"
                              ? "bg-[#10b981]"
                              : phase === "responding"
                                ? "bg-[#ef4444]"
                                : "bg-[#64748b]"
                      }`}
                    />
                    <div className="text-[#0f172a] font-semibold text-sm">
                      {phase === "detected" && "Threat Detected"}
                      {phase === "verifying" && "Verifying..."}
                      {phase === "verified" && "Threat Verified"}
                      {phase === "responding" && "Response Active"}
                      {phase === "idle" && "System Ready"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Device Info */}
              {selectedDevice && (
                <div className="mb-6">
                  <h4 className="text-[#475569] text-sm font-semibold mb-3">Selected Device</h4>
                  <div className="bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-lg p-4">
                    <div className="text-[#0f172a] font-semibold mb-2">{selectedDevice}</div>
                    <div className="text-[#475569] text-sm space-y-1">
                      <div>
                        Status: <span className="text-[#10b981] font-semibold">Active</span>
                      </div>
                      <div>Uptime: 99.9%</div>
                      <div>Last Check: 2s ago</div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Updates - Now displays accumulated logs from store */}
              <div>
                <h4 className="text-[#475569] text-sm font-semibold mb-3">Recent Updates</h4>
                <div className="space-y-2">
                  {systemLogs.map((log) => {
                    const colors = getLogColor(log.type)
                    return (
                      <div key={log.id} className={`${colors.bg} border-2 ${colors.border} rounded-lg p-3`}>
                        <div className={`${colors.text} text-xs font-semibold mb-1 uppercase`}>{log.type}</div>
                        <div className="text-[#0f172a] text-sm font-medium">{log.message}</div>
                        <div className="text-[#64748b] text-xs mt-1">{formatTimestamp(log.timestamp)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border-2 border-[#cbd5e1] rounded-lg px-4 py-2 shadow-lg">
          <p className="text-[#475569] text-sm">
            <span className="text-[#0f172a] font-semibold">Drag</span> to rotate •{" "}
            <span className="text-[#0f172a] font-semibold">Scroll</span> to zoom •{" "}
            <span className="text-[#0f172a] font-semibold">Click</span> devices for info
          </p>
        </div>
      </div>
    </section>
  )
}
