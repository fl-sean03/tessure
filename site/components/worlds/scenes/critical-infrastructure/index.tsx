import type { SceneModule } from '../../contract'
import { ReferenceWorld } from '../../reference'
import { definition } from './content'
const scene: SceneModule = { definition, World: ReferenceWorld }
export default scene
