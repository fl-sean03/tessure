import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Tessure — Trusted Autonomous Security",
    description:
      "Edge multi-sensor fusion for critical infrastructure. Verified response in seconds.",
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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
