import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { catalogue, findScene } from '@/components/worlds/catalogue'
import WorldExplorer from '@/components/worlds/explorer'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
export const dynamicParams = false
export function generateStaticParams() { return catalogue.map(s => ({ slug: s.id })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const s = findScene(slug)
  return s ? { title: `${s.name}: ${s.subtitle}`, description: `${s.description} An illustrative world exploring a physical security concept.`, alternates: { canonical: `/worlds/${slug}` }, openGraph: { title: `${s.name} — Tessure`, description: s.description, images: [{ url: '/opengraph-image', width: 1200, height: 630 }] } } : {}
}
export default async function ScenePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = findScene(slug); if (!s) notFound()
  return <><SiteHeader /><main id="main" className="scene-page section-width"><p className="eyebrow">An illustrative Tessure world</p><h1>{s.name}</h1><p className="scene-page-intro">{s.description} Explore the proposed role of connected evidence and human decisions. This is an authored illustration, not working detection software.</p><WorldExplorer initialScene={slug} /><a className="text-link" href="/#system">Explore the proposed Tessure system →</a></main><SiteFooter /></>
}
