import React from 'react'
import { useSelector } from 'react-redux'
import PlayerInfo from './PlayerInfo'
import PowerCards from './PowerCards'
import GameControls from './GameControls'
import LogDisplay from './LogDisplay'
import styles from './GameUI.module.css'
import { useGame } from '../../context/GameContext'

const GameUI = () => {
  const { stateMachine: { currentState } } = useGame()
  const currentPlayer = useSelector(state => state.game.currentPlayer)

  // Only show game UI when in playing or game over state
  if (currentState === 'setup') {
    return (
      <div className={styles.setupUI}>
        <h1>Game Setup</h1>
        <p>Setting up the game board...</p>
      </div>
    )
  }

  return (
    <div className={styles.gameUI}>
      {/* Top left - Player info */}
      <div className={styles.playerInfoContainer}>
        <PlayerInfo />
      </div>

      {/* Top right - Power cards */}
      <div className={styles.powerCardsContainer}>
        <PowerCards />
      </div>

      {/* Bottom - Game controls */}
      <div className={styles.controlsContainer}>
        <GameControls />
      </div>

      {/* Bottom right - Game log */}
      <div className={styles.logContainer}>
        <LogDisplay />
      </div>
    </div>
  )
}

export default GameUI 