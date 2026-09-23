import type { SceneModule } from './contract'
export const loaders: Record<string, () => Promise<{ default: SceneModule }>> = {
  'private-estate': () => import('./scenes/private-estate'),
  'data-center': () => import('./scenes/data-center'),
  'resort-marina': () => import('./scenes/resort-marina'),
  'event-overlay': () => import('./scenes/event-overlay'),
  'logistics-yard': () => import('./scenes/logistics-yard'),
  'critical-infrastructure': () => import('./scenes/critical-infrastructure'),
}
