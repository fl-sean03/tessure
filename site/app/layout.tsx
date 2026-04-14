import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
})

const plexDisplay = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-display",
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://v0-tessure.vercel.app"),
  title: {
    default: "Tessure — Trusted Autonomous Security",
    template: "%s — Tessure",
  },
  description:
    "Edge multi-sensor fusion for critical infrastructure. Verified response in seconds. Overlays existing VMS. Privacy by default.",
  openGraph: {
    title: "Tessure — Trusted Autonomous Security",
    description:
      "Edge multi-sensor fusion for critical infrastructure. Verified response in seconds.",
    type: "website",
    siteName: "Tessure",
    images: [{ url: "/og.jpg", width: 1120, height: 630, alt: "Tessure — Trusted Autonomous Security" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tessure — Trusted Autonomous Security",
    description:
      "Edge multi-sensor fusion for critical infrastructure. Verified response in seconds.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexDisplay.variable} ${plexMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
