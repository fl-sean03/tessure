import { create } from "zustand"
import type { ScenarioType } from "./scenario-types"

type Phase = "idle" | "detected" | "verifying" | "verified" | "responding"

type SystemLog = {
  id: string
  type: "alert" | "info" | "verifying" | "verified" | "responding"
  message: string
  timestamp: Date
}

type ScenarioState = {
  isActive: boolean
  phase: Phase
  currentScenario: ScenarioType
  intruderPosition: [number, number, number]
  detectedSensors: string[]
  trackingCameras: string[]
  dispatchedDrones: string[]
  systemLogs: SystemLog[]
  startScenario: () => void
  stopScenario: () => void
  resetScenario: () => void
  setPhase: (phase: Phase) => void
  setScenario: (scenario: ScenarioType) => void
  setIntruderPosition: (pos: [number, number, number]) => void
  addDetectedSensor: (id: string) => void
  addTrackingCamera: (id: string) => void
  dispatchDrone: (id: string) => void
  addSystemLog: (log: Omit<SystemLog, "id" | "timestamp">) => void
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  isActive: false,
  phase: "idle",
  currentScenario: "private-estate",
  intruderPosition: [-25, 0.9, 35],
  detectedSensors: [],
  trackingCameras: [],
  dispatchedDrones: [],
  systemLogs: [
    {
      id: "init-1",
      type: "info",
      message: "All systems operational",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: "init-2",
      type: "info",
      message: "Routine sensor calibration complete",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
  ],
  startScenario: () =>
    set({
      isActive: true,
      phase: "idle",
      detectedSensors: [],
      trackingCameras: [],
      dispatchedDrones: [],
      intruderPosition: [-25, 0.9, 35],
    }),
  stopScenario: () =>
    set({
      isActive: false,
      phase: "idle",
      detectedSensors: [],
      trackingCameras: [],
      dispatchedDrones: [],
    }),
  resetScenario: () =>
    set({
      isActive: false,
      phase: "idle",
      detectedSensors: [],
      trackingCameras: [],
      dispatchedDrones: [],
      intruderPosition: [-25, 0.9, 35],
      systemLogs: [
        {
          id: "reset-1",
          type: "info",
          message: "System reset complete",
          timestamp: new Date(),
        },
        {
          id: "reset-2",
          type: "info",
          message: "All systems operational",
          timestamp: new Date(Date.now() - 1000),
        },
      ],
    }),
  setPhase: (phase) => set({ phase }),
  setScenario: (scenario) =>
    set({
      currentScenario: scenario,
      isActive: false,
      phase: "idle",
      detectedSensors: [],
      trackingCameras: [],
      dispatchedDrones: [],
      systemLogs: [
        {
          id: `scenario-change-${Date.now()}-${Math.random()}`,
          type: "info",
          message: `Switched to ${scenario} scenario`,
          timestamp: new Date(),
        },
        {
          id: `scenario-change-${Date.now()}-${Math.random()}`,
          type: "info",
          message: "All systems operational",
          timestamp: new Date(Date.now() - 1000),
        },
      ],
    }),
  setIntruderPosition: (pos) => set({ intruderPosition: pos }),
  addDetectedSensor: (id) =>
    set((state) => ({
      detectedSensors: state.detectedSensors.includes(id) ? state.detectedSensors : [...state.detectedSensors, id],
    })),
  addTrackingCamera: (id) =>
    set((state) => ({
      trackingCameras: state.trackingCameras.includes(id) ? state.trackingCameras : [...state.trackingCameras, id],
    })),
  dispatchDrone: (id) =>
    set((state) => ({
      dispatchedDrones: state.dispatchedDrones.includes(id) ? state.dispatchedDrones : [...state.dispatchedDrones, id],
    })),
  addSystemLog: (log) =>
    set((state) => ({
      systemLogs: [
        {
          ...log,
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
        },
        ...state.systemLogs,
      ],
    })),
}))
