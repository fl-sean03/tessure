"use client"

import { Button } from "@/components/ui/button"

export default function Hero() {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/files-blob/DefensePlatform-OkzInURtZS5Qqk1Vz7vpJ4H3RuyX93.pdf"
    link.download = "Tessure_Defense_Platform_Whitepaper.pdf"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-[#e0e7ff] to-[#f8fafc]" />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="mb-8 pt-20">
          <h1 className="text-6xl md:text-8xl font-bold text-[#0f172a] tracking-tight mb-4">Tessure</h1>
          <div className="h-1 w-24 bg-[#1e40af] mx-auto rounded-full" />
        </div>

        <p className="text-2xl md:text-3xl text-[#475569] font-medium mb-6 text-balance">Trusted Autonomous Security</p>

        <h2 className="text-4xl md:text-6xl font-bold text-[#0f172a] mb-8 text-balance leading-tight">
          Stop chasing false alarms.
          <br />
          <span className="text-[#1e40af]">Start securing with verified autonomy.</span>
        </h2>

        <p className="text-lg md:text-xl text-[#475569] max-w-3xl mx-auto mb-12 text-pretty leading-relaxed">
          Tessure fuses video, thermal, and radar sensors at the edge to deliver verified response in seconds—while
          preserving privacy and eliminating noise.
        </p>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            onClick={handleDownload}
          >
            View White Paper
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#1e40af] rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-[#1e40af] rounded-full" />
        </div>
      </div>
    </section>
  )
}
