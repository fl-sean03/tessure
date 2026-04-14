"use client"

import { Button } from "@/components/ui/button"
import { useScenarioStore } from "@/lib/scenario-store"
import { useState, useEffect } from "react"

export default function ScenarioControl() {
  const { isActive, phase, startScenario, stopScenario, detectedSensors, trackingCameras, dispatchedDrones } =
    useScenarioStore()
  const [timeline, setTimeline] = useState<Array<{ time: number; event: string; kpi?: string }>>([])
  const [startTime, setStartTime] = useState<number>(0)

  useEffect(() => {
    if (isActive && startTime === 0) {
      setStartTime(Date.now())
      setTimeline([{ time: 0, event: "Scenario initiated" }])
    }

    if (!isActive) {
      setStartTime(0)
      setTimeline([])
    }
  }, [isActive, startTime])

  useEffect(() => {
    if (!isActive || startTime === 0) return

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    if (phase === "detected" && !timeline.some((e) => e.event.includes("Perimeter breach"))) {
      setTimeline((prev) => [
        ...prev,
        {
          time: Number.parseFloat(elapsed),
          event: `Perimeter breach detected by sensors ${detectedSensors.join(", ")}`,
          kpi: "Detection: T+0s",
        },
      ])
    }

    if (phase === "verifying" && !timeline.some((e) => e.event.includes("Auto-verification"))) {
      setTimeline((prev) => [
        ...prev,
        {
          time: Number.parseFloat(elapsed),
          event: `Auto-verification initiated via cameras ${trackingCameras.join(", ")}`,
          kpi: `Detect→Verify: ${elapsed}s ✓ (Target: ≤30s)`,
        },
      ])
    }

    if (phase === "verified" && !timeline.some((e) => e.event.includes("Threat verified"))) {
      setTimeline((prev) => [
        ...prev,
        {
          time: Number.parseFloat(elapsed),
          event: "Threat verified - Human operator notified",
          kpi: `Verification complete: ${elapsed}s`,
        },
      ])
    }

    if (phase === "responding" && !timeline.some((e) => e.event.includes("SOP macro"))) {
      setTimeline((prev) => [
        ...prev,
        {
          time: Number.parseFloat(elapsed),
          event: `SOP macro executed: Drones ${dispatchedDrones.join(", ")} dispatched, perimeter lights activated`,
          kpi: `MTTA: ${elapsed}s ✓ (Target: ≤60s)`,
        },
      ])
    }
  }, [phase, isActive, startTime, detectedSensors, trackingCameras, dispatchedDrones, timeline])

  return (
    <>
      <div className="absolute top-20 left-4 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-4 w-80 shadow-2xl">
        <h3 className="text-lg font-bold text-cyan-400 mb-3">Intrusion Scenario</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Status:</span>
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full ${
                !isActive
                  ? "bg-slate-700 text-slate-300"
                  : phase === "detected"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : phase === "verifying"
                      ? "bg-orange-500/20 text-orange-400"
                      : phase === "verified"
                        ? "bg-red-500/20 text-red-400"
                        : phase === "responding"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-green-500/20 text-green-400"
              }`}
            >
              {!isActive ? "STANDBY" : phase.toUpperCase()}
            </span>
          </div>

          {isActive && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Sensors Active:</span>
                <span className="text-cyan-400 font-mono">{detectedSensors.length}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Cameras Tracking:</span>
                <span className="text-cyan-400 font-mono">{trackingCameras.length}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Drones Dispatched:</span>
                <span className="text-cyan-400 font-mono">{dispatchedDrones.length}</span>
              </div>
            </div>
          )}

          <Button
            onClick={isActive ? stopScenario : startScenario}
            className={`w-full ${isActive ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600"}`}
          >
            {isActive ? "Stop Scenario" : "Start Intrusion Scenario"}
          </Button>
        </div>
      </div>

      {isActive && timeline.length > 0 && (
        <div className="absolute bottom-20 right-4 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-4 w-96 max-h-80 overflow-y-auto shadow-2xl">
          <h3 className="text-lg font-bold text-cyan-400 mb-3 sticky top-0 bg-slate-900 pb-2">Response Timeline</h3>

          <div className="space-y-3">
            {timeline.map((entry, i) => (
              <div key={i} className="border-l-2 border-cyan-500/50 pl-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono text-cyan-400">T+{entry.time}s</span>
                  {entry.kpi && (
                    <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                      {entry.kpi}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-200 mt-1">{entry.event}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
