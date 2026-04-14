"use client"

import Image from "next/image"
import { useScenarioStore } from "@/lib/scenario-store"
import type { ScenarioType } from "@/lib/scenario-types"
import DefenseDemo from "./defense-demo"
import ScenarioExplanation from "./scenario-explanation"

type Scenario = {
  id: ScenarioType
  name: string
  blurb: string
  image: string
}

const scenarios: Scenario[] = [
  {
    id: "critical-infrastructure",
    name: "Critical infrastructure",
    blurb: "Power substations, pipelines, water. NERC CIP-014 and TSA SD02F aligned.",
    image: "/renders/hero/R1-1-substation-dusk.jpg",
  },
  {
    id: "data-center",
    name: "Data center",
    blurb: "Hyperscale and colo campuses. Vehicle-ram + tailgating + cyber-physical correlation.",
    image: "/renders/hero/R1-2-data-center-aisle.jpg",
  },
  {
    id: "logistics-yard",
    name: "Logistics yard",
    blurb: "Prologis-tenant industrial and intermodal. After-hours fence + cargo verification.",
    image: "/renders/hero/R1-3-logistics-yard-dawn.jpg",
  },
  {
    id: "private-estate",
    name: "Private estate",
    blurb: "High-value residences. Insurance-driven; discreet; privacy-first.",
    image: "/renders/editorial/private-estate-night.jpg",
  },
  {
    id: "resort-marina",
    name: "Resort & marina",
    blurb: "Coastal properties. Waterborne intrusion + UAS surveillance.",
    image: "/renders/editorial/marina-dusk.jpg",
  },
  {
    id: "event-overlay",
    name: "Event overlay",
    blurb: "Temporary deploy. Crowd-density management; VIP perimeter; drone detection.",
    image: "/renders/editorial/event-venue-evening.jpg",
  },
]

export default function ScenariosInline() {
  const { currentScenario, setScenario } = useScenarioStore()

  const handleCardClick = (id: ScenarioType) => {
    setScenario(id)
    const target = document.getElementById("live-simulation")
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <section id="scenarios" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#1e40af]">Scenarios</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a] md:text-4xl">
              Six site archetypes. One fusion engine.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Pick a scenario to load into the live simulation below. Each walks the detect →
              verify → act loop end-to-end, with realistic sensor placement and the SOP response
              a verified event triggers.
            </p>
          </div>
          <a
            href="#live-simulation"
            className="hidden items-center gap-1 text-sm font-medium text-[#1e40af] hover:text-[#1e3a8a] md:inline-flex"
          >
            Jump to simulation →
          </a>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => {
            const active = currentScenario === s.id
            return (
              <button
                key={s.id}
                onClick={() => handleCardClick(s.id)}
                aria-pressed={active}
                className={`group overflow-hidden rounded-xl border text-left transition focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:ring-offset-2 ${
                  active
                    ? "border-[#1e40af] bg-white shadow-md ring-1 ring-[#1e40af]/30"
                    : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#1e40af]/30 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition group-hover:scale-[1.02]"
                  />
                  {active && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#1e40af] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white shadow">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      Active
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-base font-semibold text-[#0f172a]">{s.name}</h3>
                  <p className="mt-1 text-sm text-[#475569]">{s.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1e40af] group-hover:text-[#1e3a8a]">
                    {active ? "Loaded below" : "Load into simulation"} →
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div id="live-simulation" className="mt-16 scroll-mt-20">
          <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4 md:p-6">
            <DefenseDemo />
            <ScenarioExplanation />
          </div>
        </div>
      </div>
    </section>
  )
}
