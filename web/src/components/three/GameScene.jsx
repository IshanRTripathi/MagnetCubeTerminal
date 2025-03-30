import React from 'react'
import { useGame } from '../../context/GameContext'
import GridHelper from './GridHelper'
import MagneticFieldVisualizer from './MagneticFieldVisualizer'
import SpaceSelector from './SpaceSelector'
import { logger } from '../../utils/logger'

const GameScene = () => {
  const { cubes, currentPlayer } = useGame()

  return (
    <>
      <GridHelper />
      <MagneticFieldVisualizer />
      <SpaceSelector />

      {/* Render cubes */}
      {Object.entries(cubes).map(([id, cube]) => (
        <mesh
          key={id}
          position={cube.position}
          userData={{
            type: 'cube',
            id,
            owner: cube.owner
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={cube.owner === currentPlayer.id ? '#00ff00' : '#ff0000'}
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Render players */}
      {currentPlayer && (
        <mesh position={currentPlayer.position}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#0000ff" />
        </mesh>
      )}
    </>
  )
}

export default GameScene 