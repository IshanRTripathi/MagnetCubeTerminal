import React from 'react'
import { useSelector } from 'react-redux'
import { useGame } from '../../context/GameContext'
import styles from './PlayerInfo.module.css'

const PlayerInfo = () => {
  const currentPlayer = useSelector(state => state.game.currentPlayer)
  const turnNumber = useSelector(state => state.game.turnNumber)
  const { stateMachine: { currentState, stateData } } = useGame()

  if (!currentPlayer || currentState === 'setup') return null

  const playerNames = {
    1: 'Red',
    2: 'Blue',
    3: 'Green',
    4: 'Yellow'
  }

  // Get player info from state machine data
  const playerInfo = stateData.players.find(p => p.id === currentPlayer.id)

  return (
    <div className={styles.playerInfo}>
      <div className={styles.turnInfo}>
        <span>Turn {turnNumber}</span>
        <span className={styles.gameState}>State: {currentState}</span>
      </div>
      <div 
        className={styles.currentPlayer}
        style={{ '--player-color': currentPlayer.color }}
      >
        <div className={styles.playerIndicator} />
        <span>{playerNames[currentPlayer.id]}'s Turn</span>
        {playerInfo && (
          <div className={styles.playerStats}>
            <span>Score: {playerInfo.score}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerInfo 