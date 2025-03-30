import React from 'react'
import { useSelector } from 'react-redux'
import styles from './PlayerInfo.module.css'

const PlayerInfo = () => {
  const currentPlayer = useSelector(state => state.game.currentPlayer)
  const turnNumber = useSelector(state => state.game.turnNumber)

  if (!currentPlayer) return null

  const playerNames = {
    1: 'Red',
    2: 'Blue',
    3: 'Green',
    4: 'Yellow'
  }

  return (
    <div className={styles.playerInfo}>
      <div className={styles.turnInfo}>
        <span>Turn {turnNumber}</span>
      </div>
      <div 
        className={styles.currentPlayer}
        style={{ '--player-color': currentPlayer.color }}
      >
        <div className={styles.playerIndicator} />
        <span>{playerNames[currentPlayer.id]}'s Turn</span>
      </div>
    </div>
  )
}

export default PlayerInfo 