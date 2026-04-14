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
    blurb: "Power, pipelines, water · NERC CIP-014 · TSA SD02F",
    image: "/renders/hero/R1-1-substation-dusk.jpg",
  },
  {
    id: "data-center",
    name: "Data center",
    blurb: "Hyperscale + colo · vehicle-ram · cyber-physical",
    image: "/renders/hero/R1-2-data-center-aisle.jpg",
  },
  {
    id: "logistics-yard",
    name: "Logistics yard",
    blurb: "Prologis-tenant · cargo + insider",
    image: "/renders/hero/R1-3-logistics-yard-dawn.jpg",
  },
  {
    id: "private-estate",
    name: "Private estate",
    blurb: "Insurance-driven · discreet · privacy-first",
    image: "/renders/editorial/private-estate-night.jpg",
  },
  {
    id: "resort-marina",
    name: "Resort & marina",
    blurb: "Waterborne · UAS · guest-privacy",
    image: "/renders/editorial/marina-dusk.jpg",
  },
  {
    id: "event-overlay",
    name: "Event overlay",
    blurb: "Temporary deploy · crowd · perimeter · UAS",
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
    <section id="scenarios" className="border-b border-[#D4D9DE] bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1e40af]">
              § 05 · Scenarios
            </p>
            <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#0b1220] md:text-5xl">
              Six site archetypes.
              <br />
              One fusion engine.
            </h2>
          </div>
          <p className="text-[15px] leading-[1.7] text-[#334155]">
            Pick a scenario to load into the simulation below. Each walks the detect → verify →
            act loop end-to-end, with realistic sensor placement and the SOP response a verified
            event triggers. The simulation updates in-page when a card is selected.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-px border border-[#D4D9DE] bg-[#D4D9DE] md:grid-cols-3">
          {scenarios.map((s) => {
            const active = currentScenario === s.id
            return (
              <button
                key={s.id}
                onClick={() => handleCardClick(s.id)}
                aria-pressed={active}
                className={`group relative overflow-hidden bg-white text-left transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1e40af] ${
                  active ? "ring-2 ring-inset ring-[#1e40af]" : "hover:bg-[#EEF1F5]"
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/60 via-transparent to-transparent" />
                  {active && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-[#B8532B] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      Active
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-[2rem_1fr] gap-3 px-5 py-5">
                  <div className="font-mono text-[10px] tracking-[0.1em] text-[#94A3B8]">
                    {String(scenarios.findIndex((x) => x.id === s.id) + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="font-display text-[18px] font-semibold leading-tight tracking-tight text-[#0b1220]">
                      {s.name}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64748B]">
                      {s.blurb}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div id="live-simulation" className="mt-16 scroll-mt-20">
          <div className="border border-[#D4D9DE] bg-[#EEF1F5]">
            <div className="flex items-center justify-between border-b border-[#D4D9DE] px-6 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">
              <span>Live simulation · drag · scroll · click sensors</span>
              <span className="hidden text-[#0b1220] md:inline">Scenario loaded above</span>
            </div>
            <DefenseDemo />
            <ScenarioExplanation />
          </div>
        </div>
      </div>
    </section>
  )
}
