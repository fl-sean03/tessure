import Hero from "@/components/hero"
import DefenseDemo from "@/components/defense-demo"
import ScenarioSelector from "@/components/scenario-selector"
import ScenarioExplanation from "@/components/scenario-explanation"

export default function Home() {
  return (
    <main className="relative w-full bg-[#f8fafc]">
      <Hero />
      <ScenarioSelector />
      <DefenseDemo />
      <ScenarioExplanation />
    </main>
  )
}
