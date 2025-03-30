import React from 'react'
import { Physics } from '@react-three/rapier'
import { 
  Stars,
  Environment,
  OrbitControls
} from '@react-three/drei'
import { logger } from '../../utils/logger'
import GridHelper from './GridHelper'
import Lighting from './Lighting'
import GameBoard from './GameBoard'

function Scene() {
  logger.debug('Rendering Scene')

  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
      <Stars 
        radius={50}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
      />
      <Lighting />
      <Physics
        gravity={[0, -9.81, 0]}
        debug={false}
      >
        <GridHelper />
        <GameBoard />
      </Physics>
    </>
  )
}

export default Scene 