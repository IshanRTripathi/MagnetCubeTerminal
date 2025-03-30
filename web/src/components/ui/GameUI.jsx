import React from 'react'
import { useSelector } from 'react-redux'
import PlayerInfo from './PlayerInfo'
import PowerCards from './PowerCards'
import GameControls from './GameControls'
import LogDisplay from './LogDisplay'
import styles from './GameUI.module.css'

const GameUI = () => {
  const gameState = useSelector(state => state.game.gameState)
  const currentPlayer = useSelector(state => state.game.currentPlayer)

  // Only show game status when needed
  if (gameState === 'setup') {
    return null
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