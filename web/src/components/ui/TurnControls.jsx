import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectAction } from '../../store/gameReducer'
import styles from './TurnControls.module.css'

const TurnControls = () => {
  const dispatch = useDispatch()
  const currentPlayer = useSelector(state => state.game.currentPlayer)
  const selectedAction = useSelector(state => state.game.selectedAction)

  if (!currentPlayer) return null

  const handleActionSelect = (actionType) => {
    dispatch(selectAction({ actionType }))
  }

  return (
    <div className={styles.turnControls}>
      <h3 className={styles.title}>Your Turn</h3>
      <div className={styles.actionCards}>
        {/* Move Action Card */}
        <button 
          className={`${styles.actionCard} ${selectedAction === 'move' ? styles.selected : ''}`}
          onClick={() => handleActionSelect('move')}
          disabled={!currentPlayer.canMove}
        >
          <h4>Move</h4>
          <p>Move one space up/down on adjacent cubes</p>
        </button>

        {/* Build Action Card */}
        <button 
          className={`${styles.actionCard} ${selectedAction === 'build' ? styles.selected : ''}`}
          onClick={() => handleActionSelect('build')}
          disabled={!currentPlayer.canBuild}
        >
          <h4>Build</h4>
          <p>Stack a cube on the ground or on other cubes</p>
        </button>

        {/* Roll Action Card */}
        <button 
          className={`${styles.actionCard} ${selectedAction === 'roll' ? styles.selected : ''}`}
          onClick={() => handleActionSelect('roll')}
          disabled={!currentPlayer.canRoll}
        >
          <h4>Roll</h4>
          <p>Roll action (details to be added)</p>
        </button>
      </div>
    </div>
  )
}

export default TurnControls 