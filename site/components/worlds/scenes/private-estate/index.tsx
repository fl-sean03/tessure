'use client'
import type { SceneModule, WorldProps } from '../../contract'
import { definition } from './content'
import { WildlifeWorld } from './wildlife'
import { IntrusionWorld } from './incident'
function World(props:WorldProps){return props.scenarioId==='wildlife'?<WildlifeWorld {...props}/>:<IntrusionWorld {...props}/>}
const scene:SceneModule={definition,World}
export default scene
