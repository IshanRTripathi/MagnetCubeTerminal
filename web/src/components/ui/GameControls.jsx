import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedAction, build, move, roll, endTurn } from '../../store/gameSlice'
import { useGame } from '../../context/GameContext'
import PowerCardDeck from './PowerCardDeck'
import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();

const GameControls = () => {
  const { 
    currentPlayer, 
    turnPhase, 
    selectedPowerCard, 
    dispatch, 
    gameLogic: game,
    stateMachine: { playing, currentState }
  } = useGame()

  const handleBuild = () => {
    dispatch(setSelectedAction('build'))
    // In a real implementation, we would show a grid or 3D space selector
    // For now, we'll just build at a random position
    const position = [
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 5)
    ]
    
    if (game.build(position)) {
      dispatch(build(position))
      // Update state machine
      playing.makeMove({
        playerId: currentPlayer.id,
        action: 'build',
        position: { x: position[0], y: position[1], z: position[2] }
      })
    }
  }

  const handleMove = () => {
    dispatch(setSelectedAction('move'))
    // In a real implementation, we would show valid move positions
    // For now, we'll just move to a random adjacent position
    const currentPos = game.getGameState().players.find(p => p.id === currentPlayer).position
    const position = [
      currentPos[0] + (Math.random() > 0.5 ? 1 : -1),
      currentPos[1],
      currentPos[2] + (Math.random() > 0.5 ? 1 : -1)
    ]
    
    if (game.move(currentPlayer, position)) {
      dispatch(move({ playerId: currentPlayer, position }))
      // Update state machine
      playing.makeMove({
        playerId: currentPlayer.id,
        action: 'move',
        position: { x: position[0], y: position[1], z: position[2] }
      })
    }
  }

  const handleRoll = () => {
    if (!currentPlayer) return
    logger.info('Rolling dice', { playerId: currentPlayer.id })
    const roll = Math.floor(Math.random() * 6) + 1
    dispatch({ type: 'game/roll', payload: roll })
    // Update state machine
    playing.makeMove({
      playerId: currentPlayer.id,
      action: 'roll',
      value: roll
    })
  }

  const handleEndTurn = () => {
    if (!currentPlayer) return
    logger.info('Ending turn', { playerId: currentPlayer.id })
    dispatch({ type: 'game/endTurn' })
    // Update state machine
    playing.makeMove({
      playerId: currentPlayer.id,
      action: 'endTurn'
    })
  }

  if (!currentPlayer || currentState === 'setup') {
    return (
      <div className="game-controls">
        <div className="player-info">
          <h2>Setting up game...</h2>
        </div>
      </div>
    )
  }

  if (currentState === 'gameOver') {
    return (
      <div className="game-controls">
        <div className="player-info">
          <h2>Game Over!</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="game-controls">
      <div className="player-info">
        <h2>Player {currentPlayer.id}</h2>
        <p>Phase: {turnPhase}</p>
        {selectedPowerCard && (
          <p className="power-card-selected">
            Power Card Selected - Click on a cube to use it
          </p>
        )}
      </div>

      <div className="action-buttons">
        {turnPhase === 'start' && (
          <button
            onClick={handleRoll}
            className="action-button roll"
          >
            Roll Dice
          </button>
        )}

        {turnPhase === 'end' && (
          <button
            onClick={handleEndTurn}
            className="action-button end-turn"
          >
            End Turn
          </button>
        )}
      </div>

      <PowerCardDeck />

      <style jsx>{`
        .game-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }

        .player-info {
          text-align: center;
          margin-bottom: 8px;
        }

        .player-info h2 {
          margin: 0;
          color: #fff;
          font-size: 1.2em;
        }

        .player-info p {
          margin: 4px 0 0;
          color: #ccc;
          font-size: 0.9em;
        }

        .power-card-selected {
          color: #00ff00;
          font-weight: bold;
          margin-top: 8px;
          padding: 4px 8px;
          background: rgba(0, 255, 0, 0.1);
          border-radius: 4px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .action-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 1em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .action-button.roll {
          background-color: #4CAF50;
          color: white;
        }

        .action-button.end-turn {
          background-color: #f44336;
          color: white;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  )
}

export default GameControls 