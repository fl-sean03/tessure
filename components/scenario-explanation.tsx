"use client"

import { SCENARIOS } from "@/lib/scenario-types"
import { useScenarioStore } from "@/lib/scenario-store"
import { Shield, Eye, CheckCircle, Zap, Award } from "lucide-react"

export default function ScenarioExplanation() {
  const { currentScenario } = useScenarioStore()
  const scenario = SCENARIOS[currentScenario]

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="bg-white rounded-xl border-2 border-[#e2e8f0] shadow-lg p-8">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-[#0f172a] mb-3">{scenario.name}</h3>
          <p className="text-lg text-[#475569]">{scenario.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#64748b] uppercase mb-2">Environment</h4>
              <p className="text-[#0f172a]">{scenario.environment}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#64748b] uppercase mb-2">Threat Vectors</h4>
              <div className="flex flex-wrap gap-2">
                {scenario.threats.map((threat) => (
                  <span key={threat} className="px-3 py-1 bg-[#fee2e2] text-[#991b1b] rounded-lg text-sm font-medium">
                    {threat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#64748b] uppercase mb-2">Sensor Array</h4>
              <div className="flex flex-wrap gap-2">
                {scenario.sensors.map((sensor) => (
                  <span key={sensor} className="px-3 py-1 bg-[#dbeafe] text-[#1e40af] rounded-lg text-sm font-medium">
                    {sensor}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#64748b] uppercase mb-2">Response Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {scenario.responses.map((response) => (
                  <span key={response} className="px-3 py-1 bg-[#d1fae5] text-[#065f46] rounded-lg text-sm font-medium">
                    {response}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-[#fef3c7] border-2 border-[#f59e0b] rounded-lg">
            <Shield className="w-6 h-6 text-[#92400e] flex-shrink-0 mt-1" />
            <div>
              <h5 className="font-bold text-[#92400e] mb-1">Situation</h5>
              <p className="text-[#78350f]">{scenario.explanation.situation}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#dbeafe] border-2 border-[#3b82f6] rounded-lg">
            <Eye className="w-6 h-6 text-[#1e40af] flex-shrink-0 mt-1" />
            <div>
              <h5 className="font-bold text-[#1e40af] mb-1">Detection & Fusion</h5>
              <p className="text-[#1e3a8a]">{scenario.explanation.detection}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#e0e7ff] border-2 border-[#6366f1] rounded-lg">
            <CheckCircle className="w-6 h-6 text-[#4338ca] flex-shrink-0 mt-1" />
            <div>
              <h5 className="font-bold text-[#4338ca] mb-1">Verification</h5>
              <p className="text-[#3730a3]">{scenario.explanation.verification}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#fee2e2] border-2 border-[#ef4444] rounded-lg">
            <Zap className="w-6 h-6 text-[#991b1b] flex-shrink-0 mt-1" />
            <div>
              <h5 className="font-bold text-[#991b1b] mb-1">Automated Response</h5>
              <p className="text-[#7f1d1d]">{scenario.explanation.response}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#d1fae5] border-2 border-[#10b981] rounded-lg">
            <Award className="w-6 h-6 text-[#065f46] flex-shrink-0 mt-1" />
            <div>
              <h5 className="font-bold text-[#065f46] mb-1">Outcome & Evidence</h5>
              <p className="text-[#064e3b]">{scenario.explanation.outcome}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-[#e2e8f0]">
          <h4 className="text-sm font-bold text-[#64748b] uppercase mb-4">How Tessure Enables This</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#f8fafc] rounded-lg">
              <div className="text-2xl font-bold text-[#1e40af] mb-1">{scenario.kpis.detectToVerify}</div>
              <div className="text-sm text-[#475569]">Median detect-to-verify time via multi-sensor fusion</div>
            </div>
            <div className="p-4 bg-[#f8fafc] rounded-lg">
              <div className="text-2xl font-bold text-[#1e40af] mb-1">{scenario.kpis.mtta}</div>
              <div className="text-sm text-[#475569]">Mean time to action through SOP automation</div>
            </div>
            <div className="p-4 bg-[#f8fafc] rounded-lg">
              <div className="text-2xl font-bold text-[#10b981] mb-1">{scenario.kpis.falsePositive}</div>
              <div className="text-sm text-[#475569]">False positive rate after 30-day tuning</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
