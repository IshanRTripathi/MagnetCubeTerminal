import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RigidBody } from '@react-three/rapier'
import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
// import { MagneticPhysics } from '../../services/physics' // Removed unused import
import Cube from './Cube'
import Player from './Player'
import Ground from './Ground'

const GameBoard = () => {
  const cubes = useSelector((state) => state.game.cubes);
  const players = useSelector((state) => state.game.players);

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
    <>
      <Ground />
      
      {cubes.map((cube) => (
        <Cube key={cube.id} position={cube.position} />
      ))}
      {players.map((player) => (
        <Player key={player.id} position={player.position} color={player.color} />
      ))}
    </>
  );
};

export default React.memo(GameBoard)