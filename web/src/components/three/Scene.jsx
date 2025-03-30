import React, { useEffect } from 'react'
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
import SpaceSelector from './SpaceSelector'

function Scene() {
  useEffect(() => {
    logger.info('Scene initialized')
    return () => {
      logger.info('Scene cleanup')
    }
  }, [])

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
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      <Physics
        gravity={[0, -9.81, 0]}
        debug={false}
        onWorkerCreated={() => {
          logger.info('Physics initialized')
        }}
        onWorkerDestroyed={() => {
          logger.info('Physics cleanup')
        }}
      >
        <Lighting />
        <GridHelper />
        <GameBoard />
        <SpaceSelector />
      </Physics>
    </>
  )
}

export default Scene 