import type { MetadataRoute } from 'next'
import { catalogue } from '@/components/worlds/catalogue'
export default function sitemap(): MetadataRoute.Sitemap { return ['', '/privacy', '/terms', ...catalogue.map(s => `/worlds/${s.id}`)].map(path => ({ url: `https://v0-tessure.vercel.app${path}`, changeFrequency: 'monthly', priority: path ? 0.6 : 1 })) }
