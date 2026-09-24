import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/site-chrome'
export default function NotFound() { return <><SiteHeader /><main id="main" className="not-found section-width"><p className="eyebrow">404 / Outside the map</p><h1>Let's find<br />a clearer path.</h1><p>This page isn't part of the Tessure world.</p><Link className="button primary" href="/#worlds">Explore the worlds ↗</Link></main><SiteFooter /></> }
