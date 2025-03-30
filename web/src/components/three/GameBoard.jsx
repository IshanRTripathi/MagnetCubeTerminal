import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RigidBody } from '@react-three/rapier'
import { logger } from '../../utils/logger'
import { MagneticPhysics } from '../../services/physics'
import Cube from './Cube'
import Player from './Player'

function Ground() {
  return (
    <RigidBody 
      type="fixed" 
      position={[0, -0.5, 0]} 
      rotation={[-Math.PI / 2, 0, 0]}
      onCollisionEnter={() => {
        logger.info('Ground collision detected')
      }}
    >
      <mesh receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#111"
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>
    </RigidBody>
  )
}

function GameBoard() {
  const game = useSelector(state => state.game)
  const players = game?.players || []
  const cubes = game?.cubes || {}

  useEffect(() => {
    logger.info('Game board initialized')
    const physics = MagneticPhysics.getInstance()
    physics.init()
    
    return () => {
      logger.info('Game board cleanup')
      physics.dispose()
    }
  }, [])

  useEffect(() => {
    if (players.length > 0) {
      logger.info('Player state updated')
    }
  }, [players])

  useEffect(() => {
    if (Object.keys(cubes).length > 0) {
      logger.info('Cube state updated')
    }
  }, [cubes])

  return (
    <group>
      <Ground />
      
      {players.map(player => (
        <Player key={player.id} {...player} />
      ))}

      {Object.values(cubes).map(cube => (
        <Cube 
          key={cube.id}
          id={cube.id}
          position={cube.position}
          color={cube.owner ? players.find(p => p.id === cube.owner)?.color : '#ffffff'}
        />
      ))}
    </group>
  )
}

export default React.memo(GameBoard) 