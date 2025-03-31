import React, { useState } from 'react'
import { useGame } from '../../context/GameContext'
import { logger } from '../../utils/logger'
import styles from './TurnControls.module.css'

const ActionStatusCard = ({ message, onClose }) => (
  <div className={styles.statusCardOverlay} onClick={onClose}>
    <div className={styles.statusCard} onClick={e => e.stopPropagation()}>
      <h4>Action Status</h4>
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
)

const TurnControls = () => {
  const { game, currentPlayer, stateMachine } = useGame()
  const [statusMessage, setStatusMessage] = useState(null)

  const handleActionSelect = (actionType) => {
    // Check if action is available
    if (currentPlayer) {
      const canPerformAction = {
        move: currentPlayer.canMove,
        build: currentPlayer.canBuild,
        roll: currentPlayer.canRoll
      }[actionType]

      if (!canPerformAction) {
        setStatusMessage(`You have already used your ${actionType} action this turn.`)
        logger.info('Action not available', { 
          actionType,
          playerId: currentPlayer.id,
          canMove: currentPlayer.canMove,
          canBuild: currentPlayer.canBuild,
          canRoll: currentPlayer.canRoll
        })
        return
      }
    }

    logger.info('Action card clicked', { 
      actionType,
      currentPlayer,
      gameState: game?.gameState,
      hasStateMachine: !!stateMachine
    });

    if (!currentPlayer || !stateMachine) {
      setStatusMessage('Cannot perform action: Game not ready')
      return;
    }

    const playingState = stateMachine.playing;
    if (playingState && 'selectAction' in playingState) {
      try {
        playingState.selectAction(actionType, currentPlayer.position);
        logger.info('Action selected in state machine', {
          actionType,
          playerId: currentPlayer.id,
          position: currentPlayer.position,
          color: currentPlayer.color
        });
      } catch (error) {
        setStatusMessage(`Failed to perform ${actionType} action: ${error.message}`)
        logger.error('Failed to select action', {
          actionType,
          error: error instanceof Error ? error.message : 'Unknown error',
          playerId: currentPlayer.id
        });
      }
    } else {
      setStatusMessage('Game is not in a playable state')
      logger.warn('Current state does not support actions', {
        stateType: playingState?.constructor.name
      });
    }
  }

  const isActionDisabled = (actionType) => {
    const disabled = !game || !currentPlayer;
    
    logger.debug('Checking action card state', {
      actionType,
      disabled,
      hasGame: !!game,
      hasCurrentPlayer: !!currentPlayer,
      diceRolled: game?.diceRolled
    });
    
    if (disabled) return true;
    
    // Add any additional conditions for disabling specific actions
    if (actionType === 'roll') {
      return game.diceRolled;
    }
    
    return false;
  };

  // Always render the controls, even without currentPlayer
  return (
    <div className={styles.turnControls}>
      <h3 className={styles.title}>Actions</h3>
      <div className={styles.actionCards}>
        {/* Move Action Card */}
        <button 
          className={`${styles.actionCard} ${game?.selectedAction === 'move' ? styles.selected : ''}`}
          onClick={() => handleActionSelect('move')}
        >
          <h4>Move</h4>
          <p>Move one space up/down on adjacent cubes</p>
        </button>

        {/* Build Action Card */}
        <button 
          className={`${styles.actionCard} ${game?.selectedAction === 'build' ? styles.selected : ''}`}
          onClick={() => handleActionSelect('build')}
        >
          <h4>Build</h4>
          <p>Stack a cube on the ground or on other cubes</p>
        </button>

        {/* Roll Action Card */}
        <button 
          className={`${styles.actionCard} ${game?.selectedAction === 'roll' ? styles.selected : ''}`}
          onClick={() => handleActionSelect('roll')}
        >
          <h4>Roll</h4>
          <p>Roll action (details to be added)</p>
        </button>
      </div>

      {statusMessage && (
        <ActionStatusCard 
          message={statusMessage} 
          onClose={() => setStatusMessage(null)} 
        />
      )}
    </div>
  )
}

export default TurnControls 