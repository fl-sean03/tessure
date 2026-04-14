import DefenseDemo from "@/components/defense-demo"
import ScenarioSelector from "@/components/scenario-selector"
import ScenarioExplanation from "@/components/scenario-explanation"
import Link from "next/link"

export const metadata = {
  title: "Scenarios — Tessure",
  description:
    "Six interactive scenarios showing how Tessure detects, verifies, and responds to threats across critical infrastructure, data centers, logistics yards, estates, resorts, and event venues.",
}

export default function DemoPage() {
  return (
    <main className="relative w-full bg-[#f8fafc] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex items-center justify-between">
        <Link href="/" className="text-[#1e40af] font-semibold text-sm tracking-tight">
          ← Back to Tessure
        </Link>
        <span className="text-xs uppercase tracking-wider text-[#64748b]">
          Interactive scenarios · Beta
        </span>
      </div>
      <div className="max-w-5xl mx-auto px-6 pt-4 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] tracking-tight mb-4">
          Scenarios
        </h1>
        <p className="text-lg text-[#475569] max-w-3xl">
          Six tabletop exercises covering the site archetypes Tessure is built for. Each walks the
          detect → verify → act loop end-to-end, with multi-sensor fusion events and the SOP
          response they trigger. Drag to rotate, click sensors for detail.
        </p>
      </div>
      <ScenarioSelector />
      <DefenseDemo />
      <ScenarioExplanation />
    </main>
  )
}
