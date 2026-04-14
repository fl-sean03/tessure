"use client"

import { SCENARIOS } from "@/lib/scenario-types"
import { useScenarioStore } from "@/lib/scenario-store"
import { Check } from "lucide-react"

export default function ScenarioSelector() {
  const { currentScenario, setScenario, isActive } = useScenarioStore()

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#0f172a] mb-2">Select Deployment Scenario</h3>
        <p className="text-[#475569]">
          Explore how Tessure adapts to different environments, threats, and operational requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(SCENARIOS).map((scenario) => {
          const isSelected = currentScenario === scenario.id
          return (
            <button
              key={scenario.id}
              onClick={() => !isActive && setScenario(scenario.id)}
              disabled={isActive}
              className={`
                relative p-6 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? "border-[#1e40af] bg-[#eff6ff] shadow-lg"
                    : "border-[#e2e8f0] bg-white hover:border-[#3b82f6] hover:shadow-md"
                }
                ${isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[#1e40af] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <h4 className="text-lg font-bold text-[#0f172a] mb-2 pr-8">{scenario.name}</h4>
              <p className="text-sm text-[#475569] mb-4">{scenario.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#64748b] uppercase">Environment:</span>
                  <span className="text-xs text-[#0f172a]">{scenario.environment.slice(0, 40)}...</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {scenario.threats.slice(0, 3).map((threat) => (
                    <span key={threat} className="text-xs px-2 py-1 bg-[#fee2e2] text-[#991b1b] rounded-md font-medium">
                      {threat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-[#64748b] mb-1">Detect→Verify</div>
                  <div className="text-sm font-bold text-[#1e40af]">{scenario.kpis.detectToVerify}</div>
                </div>
                <div>
                  <div className="text-xs text-[#64748b] mb-1">MTTA</div>
                  <div className="text-sm font-bold text-[#1e40af]">{scenario.kpis.mtta}</div>
                </div>
                <div>
                  <div className="text-xs text-[#64748b] mb-1">False +</div>
                  <div className="text-sm font-bold text-[#10b981]">{scenario.kpis.falsePositive}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
