import { definition as s1 } from './scenes/private-estate/content'
import { definition as s2 } from './scenes/data-center/content'
import { definition as s3 } from './scenes/resort-marina/content'
import { definition as s4 } from './scenes/event-overlay/content'
import { definition as s5 } from './scenes/logistics-yard/content'
import { definition as s6 } from './scenes/critical-infrastructure/content'
export const catalogue = [s1, s2, s3, s4, s5, s6]
export const findScene = (id: string) => catalogue.find(s => s.id === id)
