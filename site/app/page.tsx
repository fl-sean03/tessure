import Image from "next/image"
import Link from "next/link"
import ScenariosInline from "@/components/scenarios-inline"
import { ArrowRight, Download } from "lucide-react"

export default function Home() {
  return (
    <main className="relative w-full bg-[#EEF1F5] text-[#0b1220] antialiased font-sans">
      <SiteNav />
      <Hero />
      <StatStrip />
      <Thesis />
      <Platform />
      <FusionNode />
      <EvidencePipeline />
      <ScenariosInline />
      <ProofBand />
      <CivilianPanel />
      <InfrastructureAtScale />
      <Resources />
      <ClosingCTA />
      <SiteFooter />
    </main>
  )
}

/* --------------------------------------------------------------------- */
/* Nav                                                                    */
/* --------------------------------------------------------------------- */

function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#D4D9DE] bg-[#EEF1F5]">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-display text-[19px] font-semibold tracking-tight text-[#0b1220]">
            Tessure
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B] md:block">
            / Systems
          </span>
        </Link>
        <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.14em] text-[#64748B] md:flex">
          <a href="#platform" className="transition hover:text-[#0b1220]">Platform</a>
          <a href="#pipeline" className="transition hover:text-[#0b1220]">Evidence</a>
          <a href="#scenarios" className="transition hover:text-[#0b1220]">Scenarios</a>
          <a href="#resources" className="transition hover:text-[#0b1220]">Resources</a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="inline-flex h-9 items-center gap-1 bg-[#0b1220] px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-[#1e40af]"
          >
            Request pilot
          </a>
        </div>
      </div>
    </header>
  )
}

/* --------------------------------------------------------------------- */
/* Hero — full-bleed photo with overlay                                   */
/* --------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0b1220]">
      <div className="relative h-[85vh] min-h-[620px] w-full md:h-[88vh]">
        <Image
          src="/hero-yard.jpg"
          alt="A large intermodal logistics yard at dawn, fog drifting between rows of stacked containers, a gantry crane silhouette in the distance"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/30 via-transparent to-[#0b1220]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/60 via-[#0b1220]/20 to-transparent" />

        {/* Top meta band */}
        <div className="absolute inset-x-0 top-0 border-b border-white/10">
          <div className="mx-auto flex h-10 max-w-[1280px] items-center justify-between px-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
            <span>01 / Critical Infrastructure Perimeter</span>
            <span className="hidden md:inline">Blue Hour · 04:47 local · Sector-3 Verified</span>
          </div>
        </div>

        {/* Headline overlay */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:pb-20">
          <div className="mx-auto max-w-[1280px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
              Tessure · Trusted Autonomous Security
            </p>
            <h1 className="font-display mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-7xl">
              Verified response,
              <br />
              not false alarms.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              Edge multi-sensor fusion for fixed critical infrastructure. Corroborate on-site. Sign
              the evidence. Overlay the VMS the customer already owns. No rip-and-replace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em]">
              <a
                href="#contact"
                className="inline-flex h-11 items-center gap-2 bg-white px-5 text-[#0b1220] transition hover:bg-[#1e40af] hover:text-white"
              >
                Request a pilot <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="/whitepapers/tessure-architecture.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 border border-white/30 px-5 text-white transition hover:bg-white/10"
              >
                <Download className="h-3.5 w-3.5" /> Architecture whitepaper
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Stat strip                                                             */
/* --------------------------------------------------------------------- */

function StatStrip() {
  const stats = [
    { num: "<5%", label: "False positives · 30-day tune" },
    { num: "~30s", label: "Detect → verify at the edge" },
    { num: "24h", label: "Autonomy during WAN loss" },
    { num: "$900", label: "Fusion Node BOM at 100 units" },
  ]
  return (
    <section className="border-b border-[#D4D9DE] bg-[#EEF1F5]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 divide-x divide-[#D4D9DE] md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-8">
            <div className="font-display text-3xl font-semibold tracking-tight text-[#0b1220] md:text-4xl">
              {s.num}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Thesis — prose not cards                                               */
/* --------------------------------------------------------------------- */

function Thesis() {
  return (
    <section className="border-b border-[#D4D9DE]">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1e40af]">
            § 01 · The thesis
          </p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#0b1220] md:text-5xl">
            False alarms are not an AI-video problem. They are a sensor-fusion problem.
          </h2>
        </div>
        <div className="space-y-5 text-[15px] leading-[1.7] text-[#334155] md:text-base md:leading-[1.75]">
          <p>
            For a decade the category answered noise with more cameras and more analytics. It
            didn't work. Single-modality systems bottom out at around eighty-five percent accuracy
            on outdoor perimeters because rain, fog, wildlife, and shadows all defeat them.
            Adversaries defeat them by choosing conditions.
          </p>
          <p>
            Video confirms class. Radar confirms range and velocity. Thermal confirms heat
            signature. Acoustic confirms rotor, engine, or gunshot. Fused at the edge, they
            corroborate each other before a human sees anything.
          </p>
          <p>
            Two seconds of honest engineering math beats a year of model tuning on a single
            modality. Tessure is the fusion brain. Your VMS keeps its job.
          </p>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Platform — typographic list                                            */
/* --------------------------------------------------------------------- */

function Platform() {
  const modules = [
    {
      code: "01",
      name: "Fusion Node",
      spec: "Edge appliance · Jetson Orin NX · IP67",
      body:
        "Ingests four to sixty-four video streams, radar, thermal, and acoustic. Runs all perception and fusion locally. Twenty-four hours of autonomy during WAN loss.",
    },
    {
      code: "02",
      name: "Command",
      spec: "Web · thin · policy-driven",
      body:
        "Operators see only verified events. Side-by-side corroboration view. Policy playbooks gate actions. No raw video streaming by default.",
    },
    {
      code: "03",
      name: "Evidence",
      spec: "sha-256 · merkle · site-key",
      body:
        "Every verified event is hashed, Merkle-rooted, signed with the site's key, and exportable for insurance, law enforcement, or regulator review.",
    },
    {
      code: "04",
      name: "Integrations",
      spec: "ONVIF · VMS · ACS · SIEM · CoT",
      body:
        "Genetec, Milestone, Lenel, CCURE, Splunk, Elastic, Sentinel, TAK/CoT, PagerDuty, ServiceNow. Overlay, not replace.",
    },
    {
      code: "05",
      name: "Cloud Assist",
      spec: "Optional · cross-site · model fleet",
      body:
        "Cross-site aggregation, fleet management, and model distribution for customers that opt in. Edge-first means Cloud Assist is additive, never required.",
    },
  ]
  return (
    <section id="platform" className="border-b border-[#D4D9DE] bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1e40af]">
              § 02 · Platform
            </p>
            <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#0b1220] md:text-5xl">
              Five modules.
              <br />
              One verified stream.
            </h2>
            <p className="mt-6 max-w-sm text-[14px] leading-[1.7] text-[#475569]">
              A fusion brain sitting atop the VMS, access control, and dispatch infrastructure
              the customer already owns. No rip-and-replace.
            </p>
          </div>
          <div className="divide-y divide-[#D4D9DE] border-t border-[#D4D9DE]">
            {modules.map((m) => (
              <div key={m.code} className="grid grid-cols-[3rem_1fr] gap-6 py-7 md:grid-cols-[4rem_1fr_1fr]">
                <div className="font-mono text-[11px] tracking-[0.1em] text-[#94A3B8]">{m.code}</div>
                <div>
                  <div className="font-display text-[22px] font-semibold tracking-tight text-[#0b1220]">
                    {m.name}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                    {m.spec}
                  </div>
                </div>
                <p className="text-[14px] leading-[1.65] text-[#334155] md:col-span-1">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Fusion Node spotlight                                                  */
/* --------------------------------------------------------------------- */

function FusionNode() {
  return (
    <section className="border-b border-[#D4D9DE] bg-[#EEF1F5]">
      <div className="mx-auto grid max-w-[1280px] gap-0 md:grid-cols-2">
        <div className="relative order-2 aspect-[4/5] min-h-[520px] md:order-1 md:aspect-auto">
          <Image
            src="/fusion-node.jpg"
            alt="Matte anthracite Tessure Fusion Node edge appliance on a neutral grey studio backdrop, showing heatsink fins and a front-mounted RJ45 port"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 px-6 py-20 md:order-2 md:px-14 md:py-28">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1e40af]">
            § 03 · Fusion Node · Hardware
          </p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#0b1220] md:text-5xl">
            Passive, ruggedized, signed at boot.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-[#334155]">
            NVIDIA Jetson Orin NX, one hundred TOPS of on-device inference, IP67 enclosure, no
            fans. Hashes and signs evidence locally. Continues to operate for twenty-four hours
            without a WAN connection.
          </p>
          <dl className="mt-10 divide-y divide-[#D4D9DE] border-y border-[#D4D9DE] font-mono text-[12px]">
            {[
              ["compute", "Jetson Orin NX · 100 TOPS"],
              ["environment", "IP67 · −20 to 60 °C"],
              ["inputs", "16 video · 4 radar · thermal · acoustic"],
              ["power", "12–48 V DC · 40 W typical · 80 W peak"],
              ["offline", "24 h edge autonomy"],
              ["root of trust", "TPM-anchored · signed boot"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <dt className="uppercase tracking-[0.14em] text-[#64748B]">{k}</dt>
                <dd className="text-right text-[#0b1220]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Evidence pipeline diagram                                              */
/* --------------------------------------------------------------------- */

function EvidencePipelineDiagram() {
  const stages = [
    { num: "01", label: "Event", detail: "sensor.detect()" },
    { num: "02", label: "Fuse", detail: "cross-modality" },
    { num: "03", label: "Verify", detail: "confidence · policy" },
    { num: "04", label: "Sign", detail: "sha256 · merkle" },
    { num: "05", label: "Deliver", detail: "vms · siem · le" },
  ]
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 1120 340"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full min-w-[960px]"
        role="img"
        aria-label="Tessure evidence pipeline: event, fuse, verify, sign, deliver"
      >
        <defs>
          <linearGradient id="flowLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#1e40af" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <line x1="100" y1="160" x2="1020" y2="160" stroke="url(#flowLine)" strokeWidth="1.5" />

        <circle r="3.5" fill="#B8532B" className="motion-reduce:hidden">
          <animate attributeName="cx" values="100;1020" dur="5.5s" repeatCount="indefinite" />
          <animate attributeName="cy" values="160" dur="5.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="5.5s" repeatCount="indefinite" />
        </circle>

        {stages.map((_, i) => {
          const x = 100 + i * 230
          return <circle key={i} cx={x} cy="160" r="4" fill="#0b1220" />
        })}

        {stages.map((s, i) => {
          const x = 100 + i * 230
          return (
            <g key={s.num}>
              <rect x={x - 34} y="56" width="68" height="48" fill="#ffffff" stroke="#0b1220" strokeWidth="1" />
              <text
                x={x}
                y="86"
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize="13"
                fontWeight="500"
                fill="#0b1220"
              >
                {s.num}
              </text>
              <line x1={x} y1="104" x2={x} y2="156" stroke="#CBD2D8" strokeWidth="1" />
              <text
                x={x}
                y="210"
                textAnchor="middle"
                fontFamily="var(--font-display), var(--font-sans), sans-serif"
                fontWeight="600"
                fontSize="24"
                letterSpacing="-0.01em"
                fill="#0b1220"
              >
                {s.label}
              </text>
              <text
                x={x}
                y="236"
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize="11"
                fill="#64748B"
              >
                {s.detail}
              </text>
            </g>
          )
        })}

        <polygon points="1020,153 1038,160 1020,167" fill="#0b1220" />
        <line x1="100" y1="290" x2="1020" y2="290" stroke="#CBD2D8" strokeWidth="1" />
        <text
          x="100"
          y="312"
          fontFamily="var(--font-mono), monospace"
          fontSize="11"
          fill="#94A3B8"
        >
          // Evidence Pipeline · every verified event packaged, hashed, signed, delivered
        </text>
      </svg>
    </div>
  )
}

function EvidencePipeline() {
  return (
    <section id="pipeline" className="border-b border-[#D4D9DE] bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-24">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1e40af]">
              § 04 · Evidence
            </p>
            <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#0b1220] md:text-5xl">
              Five stages from event to signed artifact.
            </h2>
          </div>
          <p className="text-[15px] leading-[1.7] text-[#334155]">
            Single-modality camera systems produce footage. That is not evidence. Insurance
            underwriters, civil courts, and police require provenance, integrity, and chain of
            custody. Tessure ships evidence as a first-class product &mdash; hashed, Merkle-rooted,
            site-signed &mdash; delivered to your VMS, SIEM, or insurer with nothing extra to wire up.
          </p>
        </div>
        <div className="mt-14">
          <EvidencePipelineDiagram />
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Proof band — no card wrap                                              */
/* --------------------------------------------------------------------- */

function ProofBand() {
  return (
    <section className="border-b border-[#D4D9DE] bg-[#EEF1F5]">
      <div className="mx-auto max-w-[1280px] px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1e40af]">
              § 06 · The case
            </p>
            <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#0b1220] md:text-5xl">
              The numbers the category gave up on.
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-[1.7] text-[#334155]">
              Physical security has been paying for noise for a decade. Fusion turns &ldquo;something
              moved&rdquo; into an adult human, 1.8 m, 20 m from the fence, moving toward asset at 0.8
              m/s. Operators stop being classifiers and start being decision-makers.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10">
            {[
              ["94–99%", "Industry-measured FP rate on single-modality perimeter"],
              ["<5%", "Tessure design target after 30-day tune"],
              ["$725M", "US cargo theft 2025 · Verisk CargoNet · +60% YoY"],
              ["3,500+", "Physical incidents at critical infra 2024 · E-ISAC"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-5xl font-semibold tracking-tight text-[#0b1220] md:text-6xl">
                  {n}
                </dt>
                <dd className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[#64748B]">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-16 border-t border-[#D4D9DE] pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">
            Compliance posture
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#475569]">
            {["SOC 2 Type 1 · pending", "ISO 27001 · planned", "UL", "FCC Part 15", "CE", "NERC CIP-014 aligned", "TSA SD02F aware"].map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Civilian-enterprise panel — full-bleed photo with overlay              */
/* --------------------------------------------------------------------- */

function CivilianPanel() {
  return (
    <section className="relative overflow-hidden border-b border-[#0b1220]">
      <div className="absolute inset-0">
        <Image
          src="/renders/editorial/gsoc-operator.jpg"
          alt="A calm modern GSOC operator working at a wide technical workstation with three understated monitors in soft ambient lighting"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/95 via-[#0b1220]/75 to-[#0b1220]/10" />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6 py-28 md:py-40">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#93c5fd]">
            § 07 · Position
          </p>
          <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            Built for the VP Security,
            <br />
            not the warfighter.
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.75] text-white/75">
            Tessure is engineered for risk officers, facilities VPs, GSOC operators, and insurance
            loss-control teams &mdash; the people who hold liability for critical commercial
            infrastructure. Not DoD-inherited aesthetics. Not militarized workflows. Trusted
            infrastructure, quietly.
          </p>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Infrastructure at scale — full-bleed transmission corridor             */
/* --------------------------------------------------------------------- */

function InfrastructureAtScale() {
  return (
    <section className="relative overflow-hidden border-b border-[#D4D9DE] bg-[#0b1220]">
      <div className="relative h-[540px] w-full md:h-[640px]">
        <Image
          src="/renders/editorial/transmission-corridor.jpg"
          alt="A wide high-voltage transmission corridor cutting across rolling farmland at first light, low ground fog, lattice steel towers marching into the distance"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/90 via-[#0b1220]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:pb-20">
          <div className="mx-auto max-w-[1280px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
              § 08 · Scale
            </p>
            <p className="font-display mt-4 max-w-3xl text-2xl font-medium leading-[1.3] tracking-tight text-white md:text-4xl">
              Fifty-five thousand NERC-registered sites. One thousand five hundred high-risk
              transmission substations. Every one of them is a physical-security problem we are
              still solving with 2010-era tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Resources — list, not cards                                            */
/* --------------------------------------------------------------------- */

function Resources() {
  const docs = [
    {
      code: "A",
      title: "Architecture whitepaper",
      meta: "14 pp · technical",
      href: "/whitepapers/tessure-architecture.pdf",
    },
    {
      code: "B",
      title: "Privacy posture brief",
      meta: "9 pp · legal + ops",
      href: "/whitepapers/tessure-privacy.pdf",
    },
    {
      code: "C",
      title: "Pilot-readiness checklist",
      meta: "2 pp · operations",
      href: "/whitepapers/tessure-pilot-readiness.pdf",
    },
  ]
  return (
    <section id="resources" className="border-b border-[#D4D9DE] bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#1e40af]">
              § 09 · Resources
            </p>
            <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[#0b1220] md:text-5xl">
              Read the architecture before you call.
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-[1.7] text-[#334155]">
              The whitepapers cover the fusion engine, the evidence pipeline, privacy posture, and
              the integration surface. Written for the people who defend the purchase internally.
            </p>
          </div>
          <div className="divide-y divide-[#D4D9DE] border-y border-[#D4D9DE]">
            {docs.map((d) => (
              <a
                key={d.code}
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-6 py-6 transition hover:bg-[#EEF1F5]"
              >
                <div className="font-mono text-[11px] tracking-[0.1em] text-[#94A3B8]">{d.code}</div>
                <div>
                  <div className="font-display text-[22px] font-semibold tracking-tight text-[#0b1220] group-hover:text-[#1e40af]">
                    {d.title}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                    {d.meta}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#1e40af]">
                  PDF <Download className="h-3.5 w-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Closing CTA — solid deep slate band                                    */
/* --------------------------------------------------------------------- */

function ClosingCTA() {
  return (
    <section id="contact" className="bg-[#0b1220]">
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:py-32">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#93c5fd]">
              § 10 · Pilot
            </p>
            <h2 className="font-display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
              Sixty days.
              <br />
              One site.
              <br />
              Measured against your baseline.
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-[15px] leading-[1.7] text-white/70">
              Tessure funds the hardware and the install. You measure false-positive reduction and
              MTTA against your existing baseline. Keep the data either way. Convert on value.
            </p>
            <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em]">
              <a
                href="mailto:sean.florez@colorado.edu?subject=Tessure%20pilot%20inquiry"
                className="inline-flex h-11 items-center gap-2 bg-white px-5 text-[#0b1220] transition hover:bg-[#1e40af] hover:text-white"
              >
                Request a pilot <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#scenarios"
                className="inline-flex h-11 items-center gap-2 border border-white/25 px-5 text-white transition hover:bg-white/10"
              >
                Open scenarios
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------------- */
/* Footer                                                                 */
/* --------------------------------------------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-[#1e293b] bg-[#0b1220] text-white/60">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <span className="font-display text-lg font-semibold tracking-tight text-white">Tessure</span>
            <p className="mt-3 max-w-sm text-[13px] leading-[1.6] text-white/55">
              Trusted autonomous security. Edge multi-sensor fusion for critical fixed
              infrastructure. Tessure Systems, Inc.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Platform</p>
            <ul className="mt-4 space-y-2 text-[13px]">
              <li><a href="#platform" className="hover:text-white">Fusion Node</a></li>
              <li><a href="#platform" className="hover:text-white">Command</a></li>
              <li><a href="#pipeline" className="hover:text-white">Evidence</a></li>
              <li><a href="#platform" className="hover:text-white">Integrations</a></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Company</p>
            <ul className="mt-4 space-y-2 text-[13px]">
              <li><a href="#scenarios" className="hover:text-white">Scenarios</a></li>
              <li><a href="#resources" className="hover:text-white">Resources</a></li>
              <li>
                <a href="https://github.com/fl-sean03/tessure" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
              </li>
              <li>
                <a href="mailto:sean.florez@colorado.edu" className="hover:text-white">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Tessure Systems, Inc.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <span>v3 · photo-essay rebuild</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
