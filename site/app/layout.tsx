import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
const sans = localFont({ src: [{ path: '../public/fonts/ibm-plex-sans-latin-400-normal.woff2', weight: '400' }, { path: '../public/fonts/ibm-plex-sans-latin-500-normal.woff2', weight: '500' }, { path: '../public/fonts/ibm-plex-sans-latin-600-normal.woff2', weight: '600' }], variable: '--font-sans', display: 'swap' })
const mono = localFont({ src: '../public/fonts/ibm-plex-mono-latin-400-normal.woff2', variable: '--font-mono', display: 'swap', preload: false })
export const metadata: Metadata = {
  metadataBase: new URL('https://v0-tessure.vercel.app'),
  title: { default: 'Tessure — Many signals. One clear picture.', template: '%s — Tessure' },
  description: 'A physical security concept designed to correlate and verify sensor observations on site, connecting evidence with human decisions and local response. Explore six fictional security incidents.',
  alternates: { canonical: '/' },
  openGraph: { title: 'Tessure — Many signals. One clear picture.', description: 'Explore a concept for physical security built around context, evidence and human decisions.', type: 'website', locale: 'en_US', images: [{ url: '/social/home.jpg', width: 1200, height: 630, alt: 'Tessure: Many signals. One clear picture. An original logistics-yard cargo-diversion illustration.' }] },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/icon.svg' },
}
export const viewport: Viewport = { themeColor: '#f3f2ed', width: 'device-width', initialScale: 1 }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${sans.variable} ${mono.variable}`}><a className="skip-link" href="#main">Skip to content</a>{children}</body></html> }
