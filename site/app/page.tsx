import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  LayoutDashboard,
  FileCheck,
  Workflow,
  Cloud,
  Radar,
  ArrowRight,
  Download,
  ChevronRight,
} from "lucide-react"

export default function Home() {
  return (
    <main className="relative w-full bg-[#f8fafc] text-[#0f172a] antialiased">
      <SiteNav />
      <Hero />
      <PilotLogoRow />
      <TriPillar />
      <PlatformModules />
      <EvidencePipeline />
      <ScenariosTeaser />
      <ProofRail />
      <InfrastructurePanel />
      <Resources />
      <ClosingCTA />
      <SiteFooter />
    </main>
  )
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-[#0f172a]">Tessure</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#platform" className="text-sm text-[#475569] transition hover:text-[#0f172a]">
            Platform
          </a>
          <a href="#pipeline" className="text-sm text-[#475569] transition hover:text-[#0f172a]">
            Evidence
          </a>
          <Link href="/demo" className="text-sm text-[#475569] transition hover:text-[#0f172a]">
            Scenarios
          </Link>
          <a href="#resources" className="text-sm text-[#475569] transition hover:text-[#0f172a]">
            Resources
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden text-sm text-[#475569] transition hover:text-[#0f172a] md:inline-block"
          >
            Contact
          </a>
          <Button
            asChild
            className="bg-[#1e40af] text-white shadow-sm hover:bg-[#1e3a8a]"
          >
            <a href="#contact">Request pilot</a>
          </Button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center top, rgba(0,0,0,0.8), rgba(0,0,0,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#1e40af]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted Autonomous Security
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-[#0f172a] md:text-6xl">
              Verified response,
              <br />
              not false alarms.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#475569]">
              Tessure fuses video, thermal, and radar at the edge to confirm real threats in
              seconds — and overlays the VMS your sites already run. No rip-and-replace.
              Evidence-grade audit trail by default.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#1e40af] text-white shadow-sm hover:bg-[#1e3a8a]"
              >
                <a href="#contact">
                  Request a pilot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f1f5f9]"
              >
                <a href="#resources">
                  <Download className="mr-2 h-4 w-4" />
                  Architecture whitepaper
                </a>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-[#e2e8f0] pt-6">
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#64748b]">False positives</dt>
                <dd className="mt-1 text-2xl font-semibold text-[#0f172a]">&lt;5%</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#64748b]">Detect → verify</dt>
                <dd className="mt-1 text-2xl font-semibold text-[#0f172a]">~30s</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#64748b]">Edge autonomy</dt>
                <dd className="mt-1 text-2xl font-semibold text-[#0f172a]">24h</dd>
              </div>
            </dl>
          </div>

          {/* Hero visual — Phase 5 placeholder; Phase 6 swaps in real infrastructure render */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-gradient-to-br from-[#e0e7ff] via-[#eef2ff] to-[#f1f5f9] shadow-xl">
              <div className="flex h-full items-center justify-center">
                <div className="max-w-[280px] px-6 text-center">
                  <Radar className="mx-auto h-12 w-12 text-[#1e40af]" strokeWidth={1.5} />
                  <p className="mt-4 text-sm uppercase tracking-wider text-[#1e40af]">
                    Hero visual placeholder
                  </p>
                  <p className="mt-3 text-sm text-[#475569]">
                    Phase 6 will swap in a FLUX 2 Max render: calm infrastructure editorial —
                    substation at dusk, colocation aisle, or port logistics yard in fog.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-xl md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-2 w-2 items-center justify-center">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-[#10b981] opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-[#10b981]" />
                </div>
                <span className="text-xs font-medium text-[#0f172a]">Sector 3 · Verified</span>
              </div>
              <p className="mt-1 text-[11px] text-[#64748b]">Radar + thermal + video · 94% confidence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PilotLogoRow() {
  return (
    <section className="border-y border-[#e2e8f0] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-[#64748b]">
          In pilot with critical-infrastructure and colocation operators
        </p>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-12 items-center justify-center rounded border border-dashed border-[#e2e8f0] bg-[#f8fafc] text-xs uppercase tracking-wider text-[#94a3b8]"
            >
              Pilot logo {i + 1}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-[#94a3b8]">
          Placeholder · real customer logos replace once NDAs permit use · Phase 7
        </p>
      </div>
    </section>
  )
}

function TriPillar() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Verified",
      body:
        "Multi-modal fusion — video, thermal, radar, acoustic — corroborates every event before it reaches an operator. False positives drop to &lt;5% after 30-day tune.",
    },
    {
      icon: Zap,
      title: "Fast",
      body:
        "Detection to verification in ~30 seconds at the edge. Verified event to operator in &lt;2 seconds from fusion decision. No cloud round-trip.",
    },
    {
      icon: Lock,
      title: "Private",
      body:
        "Data processed on-site. Identities masked until events verify. Evidence packages cryptographically hashed. Redaction by default.",
    },
  ]
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-8 md:grid-cols-3">
        {pillars.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-[#e2e8f0] bg-white p-8 shadow-sm">
            <Icon className="h-6 w-6 text-[#1e40af]" strokeWidth={1.75} />
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#0f172a]">{title}</h3>
            <p
              className="mt-3 text-sm leading-relaxed text-[#475569]"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function PlatformModules() {
  const modules = [
    {
      icon: Cpu,
      name: "Fusion Node",
      blurb: "Edge appliance. Jetson Orin NX. 4–64 video + radar + thermal + acoustic. IP67.",
    },
    {
      icon: LayoutDashboard,
      name: "Command",
      blurb: "Thin operator UI. Fused events only. Live corroboration view + policy playbooks.",
    },
    {
      icon: FileCheck,
      name: "Evidence",
      blurb: "Cryptographically signed event packages. Hashed. Exportable for insurance + LE.",
    },
    {
      icon: Workflow,
      name: "Integrations",
      blurb: "Genetec, Milestone, Lenel, CCURE, Splunk, TAK/CoT, PagerDuty, ServiceNow.",
    },
    {
      icon: Cloud,
      name: "Cloud Assist",
      blurb: "Optional cross-site aggregation, fleet management, model distribution.",
    },
  ]
  return (
    <section id="platform" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#1e40af]">The platform</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a] md:text-4xl">
            Five modules. One verified event stream. Your existing stack intact.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#475569]">
            Tessure is a fusion brain, not a rip-and-replace. It reads from your cameras, adds the
            modalities you're missing, corroborates, and hands verified events to the VMS, SIEM,
            dispatch, or response flow your sites already run.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {modules.map(({ icon: Icon, name, blurb }) => (
            <div
              key={name}
              className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6 transition hover:border-[#1e40af]/30 hover:bg-white hover:shadow-sm"
            >
              <Icon className="h-6 w-6 text-[#1e40af]" strokeWidth={1.5} />
              <h3 className="mt-4 text-sm font-semibold text-[#0f172a]">{name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#475569]">{blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EvidencePipeline() {
  const steps = [
    { step: "01", label: "Event", body: "Sensor detection: video + radar + thermal + acoustic." },
    { step: "02", label: "Fuse", body: "Edge fusion engine corroborates across modalities." },
    { step: "03", label: "Verify", body: "Confidence score + policy playbook lookup." },
    { step: "04", label: "Sign", body: "Evidence package hashed, Merkle-rooted, site-signed." },
    { step: "05", label: "Deliver", body: "VMS, SIEM, dispatch, insurance, LE — where you need it." },
  ]
  return (
    <section id="pipeline" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#1e40af]">The pipeline</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a] md:text-4xl">
          Every verified event ships with an auditable chain of custody.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#475569]">
          The Tessure signature: a five-stage pipeline from raw sensor event to cryptographically
          signed evidence package. Designed for the insurer, the regulator, and the investigator —
          not just the operator on shift.
        </p>
      </div>
      {/* Evidence diagram — Phase 5 placeholder. Phase 6 ships the hand-built SVG (signature asset). */}
      <div className="mt-12 overflow-x-auto">
        <div className="flex min-w-[720px] items-stretch gap-3">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="flex flex-1 items-stretch"
            >
              <div className="flex flex-1 flex-col justify-between rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1e40af]">
                    {s.step}
                  </div>
                  <div className="mt-2 font-mono text-sm font-semibold text-[#0f172a]">
                    {s.label}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#475569]">{s.body}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex w-6 items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-[#cbd5e1]" strokeWidth={2} />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-[#94a3b8]">
          Placeholder. Phase 6 ships the hand-built SVG diagram — Tessure's signature section, Trust
          Blue on Frost with IBM Plex Mono labels.
        </p>
      </div>
    </section>
  )
}

function ScenariosTeaser() {
  const scenarios = [
    { id: "critical-infrastructure", name: "Critical infrastructure", blurb: "Power, water, pipeline. Drone swarm + SCADA fused." },
    { id: "data-center", name: "Data center", blurb: "Vehicle ram + cyber-physical correlation." },
    { id: "logistics-yard", name: "Logistics yard", blurb: "After-hours cargo theft with insider assist." },
    { id: "private-estate", name: "Private estate", blurb: "Wooded perimeter, quiet verified response." },
    { id: "resort-marina", name: "Resort & marina", blurb: "Waterborne intrusion + UAS surveillance." },
    { id: "event-overlay", name: "Event overlay", blurb: "Crowd surge at a 15,000-person venue." },
  ]
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#1e40af]">Scenarios</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a] md:text-4xl">
              Six site archetypes. One fusion engine.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Each scenario walks the detect → verify → act loop for a specific site type, with
              realistic sensor placement and the SOP response a verified event triggers.
            </p>
          </div>
          <Link
            href="/demo"
            className="hidden items-center gap-1 text-sm font-medium text-[#1e40af] hover:text-[#1e3a8a] md:inline-flex"
          >
            Open interactive demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <Link
              key={s.id}
              href="/demo"
              className="group rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6 transition hover:border-[#1e40af]/30 hover:bg-white hover:shadow-sm"
            >
              <div className="aspect-[16/9] overflow-hidden rounded-lg bg-gradient-to-br from-[#e0e7ff] to-[#f1f5f9] text-xs uppercase tracking-wider text-[#94a3b8]">
                <div className="flex h-full items-center justify-center">Scenario thumbnail placeholder</div>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#0f172a]">{s.name}</h3>
              <p className="mt-1 text-sm text-[#475569]">{s.blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1e40af] group-hover:text-[#1e3a8a]">
                Open demo <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProofRail() {
  const stats = [
    { value: "94–99%", label: "Industry-measured FP rate on single-modality" },
    { value: "<5%", label: "Tessure design target after 30-day tune" },
    { value: "$725M", label: "US cargo theft 2025 (Verisk CargoNet, +60% YoY)" },
    { value: "3,500+", label: "Physical incidents at critical infra 2024 (E-ISAC)" },
  ]
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-10 shadow-sm md:p-14">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#1e40af]">The case</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a] md:text-4xl">
              The numbers physical security gave up on.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              Physical security has been paying for noise for a decade. Multi-modal edge fusion
              turns "someone or something moved" into "adult human, 1.8 m, 20 m from the fence,
              moving toward protected asset at 0.8 m/s." Operators stop being classifiers and
              start being decision-makers.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-semibold tracking-tight text-[#0f172a] md:text-4xl">
                  {s.value}
                </dt>
                <dd className="mt-2 text-xs leading-relaxed text-[#64748b]">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-12 border-t border-[#e2e8f0] pt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#64748b]">Compliance posture</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              "SOC 2 Type 1 (pending)",
              "ISO 27001 (planned)",
              "UL",
              "FCC Part 15",
              "CE",
              "NERC CIP-014 aligned",
              "TSA SD02F aware",
            ].map((b) => (
              <span
                key={b}
                className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-[#475569]"
              >
                {b}
              </span>
            ))}
          </div>
          <p className="mt-6 text-xs text-[#94a3b8]">
            Placeholder badges. Phase 6 / launch swaps in official cert marks.
          </p>
        </div>
      </div>
    </section>
  )
}

function InfrastructurePanel() {
  return (
    <section className="relative overflow-hidden border-y border-[#1e293b] bg-[#0f172a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#60a5fa 1px, transparent 1px), linear-gradient(90deg, #60a5fa 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#93c5fd]">Civilian-enterprise, not defense-tech</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Built for the VP Security, not the warfighter.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#cbd5e1]">
            Tessure is engineered for risk officers, facilities VPs, GSOC operators, and insurance
            loss-control teams — the actual people holding liability for critical commercial
            infrastructure. Not DoD-inherited aesthetics. Not militarized workflows. Not tactical
            pastiche. Trusted infrastructure, quietly.
          </p>
        </div>
      </div>
      <p className="relative mx-auto max-w-7xl px-6 pb-6 text-xs text-[#64748b]">
        Phase 6 swaps in a full-bleed editorial photo (substation at dusk / data-center aisle).
      </p>
    </section>
  )
}

function Resources() {
  return (
    <section id="resources" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#1e40af]">Resources</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a] md:text-4xl">
              Read the architecture before you call.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569]">
              The whitepaper covers the fusion engine, the evidence pipeline, privacy posture, edge
              autonomy, and the integration surface for major VMS/ACS/SIEM stacks. Written for the
              people who have to defend the purchase internally.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <a
              href="#"
              className="group flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6 transition hover:border-[#1e40af]/30 hover:bg-white hover:shadow-sm"
            >
              <div>
                <h3 className="text-base font-semibold text-[#0f172a]">
                  Architecture whitepaper (PDF)
                </h3>
                <p className="mt-1 text-sm text-[#475569]">15 pages · technical</p>
              </div>
              <Download className="h-5 w-5 text-[#1e40af]" />
            </a>
            <a
              href="#"
              className="group flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6 transition hover:border-[#1e40af]/30 hover:bg-white hover:shadow-sm"
            >
              <div>
                <h3 className="text-base font-semibold text-[#0f172a]">Privacy posture brief</h3>
                <p className="mt-1 text-sm text-[#475569]">6 pages · legal + ops</p>
              </div>
              <Download className="h-5 w-5 text-[#1e40af]" />
            </a>
            <a
              href="#"
              className="group flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6 transition hover:border-[#1e40af]/30 hover:bg-white hover:shadow-sm"
            >
              <div>
                <h3 className="text-base font-semibold text-[#0f172a]">Pilot-readiness checklist</h3>
                <p className="mt-1 text-sm text-[#475569]">1 page · operations</p>
              </div>
              <Download className="h-5 w-5 text-[#1e40af]" />
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-[#94a3b8]">
          Links placeholder. Phase 9 (launch) wires the actual downloads.
        </p>
      </div>
    </section>
  )
}

function ClosingCTA() {
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-24">
      <div className="rounded-2xl border border-[#1e40af]/20 bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc] p-10 text-center shadow-sm md:p-20">
        <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-[#0f172a] md:text-5xl">
          Run a 60-day pilot at one site.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#475569]">
          Tessure funds the hardware and the install. You measure false-positive reduction and
          MTTA against your baseline. Keep the data. Convert on value.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#1e40af] text-white shadow-sm hover:bg-[#1e3a8a]"
          >
            <a href="mailto:sean.florez@colorado.edu?subject=Tessure%20pilot%20inquiry">
              Request a pilot
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f1f5f9]"
          >
            <Link href="/demo">See the scenarios</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#e2e8f0] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="text-lg font-semibold tracking-tight text-[#0f172a]">Tessure</span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#475569]">
              Trusted autonomous security. Edge multi-sensor fusion for critical fixed
              infrastructure. Tessure Systems, Inc.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Platform
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#475569]">
              <li>
                <a href="#platform" className="hover:text-[#0f172a]">Fusion Node</a>
              </li>
              <li>
                <a href="#platform" className="hover:text-[#0f172a]">Command</a>
              </li>
              <li>
                <a href="#platform" className="hover:text-[#0f172a]">Evidence</a>
              </li>
              <li>
                <a href="#platform" className="hover:text-[#0f172a]">Integrations</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              Company
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#475569]">
              <li>
                <Link href="/demo" className="hover:text-[#0f172a]">Scenarios</Link>
              </li>
              <li>
                <a href="#resources" className="hover:text-[#0f172a]">Resources</a>
              </li>
              <li>
                <a
                  href="https://github.com/fl-sean03/tessure"
                  className="hover:text-[#0f172a]"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:sean.florez@colorado.edu"
                  className="hover:text-[#0f172a]"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-[#e2e8f0] pt-6 text-xs text-[#94a3b8] md:flex-row md:items-center md:justify-between">
          <span>© 2026 Tessure Systems, Inc. All rights reserved.</span>
          <span>v1 scaffold · Phase 5 of the idea-to-site playbook</span>
        </div>
      </div>
    </footer>
  )
}
