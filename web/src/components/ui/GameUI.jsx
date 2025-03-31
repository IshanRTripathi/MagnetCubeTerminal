import React from 'react'
import PlayerInfo from './PlayerInfo'
import PowerCards from './PowerCards'
import TurnControls from './TurnControls'
import LogDisplay from './LogDisplay'
import styles from './GameUI.module.css'
import { useGame } from '../../context/GameContext'

const GameUI = () => {
  const { game, stateMachine } = useGame()
  const { currentState } = stateMachine

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
        <TurnControls />
      </div>

      {/* Bottom right - Game log */}
      <div className={styles.logContainer}>
        <LogDisplay />
      </div>
    </div>
  )
}

export default GameUI 