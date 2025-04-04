import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGame } from '../../context/GameContext';
import { UniversalLogger } from '../../utils/UniversalLogger';
const logger = UniversalLogger.getInstance();
import styles from './TurnControls.module.css';
import { useFeature } from '../../config/featureFlags';
import { PlayingState } from '../../services/stateMachine/states/PlayingState';

const ActionStatusCard = ({ message, onClose }) => (
  <div className={styles.statusCardOverlay} onClick={onClose}>
    <div className={styles.statusCard} onClick={e => e.stopPropagation()}>
      <h4>Action Status</h4>
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const TurnControls = React.memo(() => {
  const game = useSelector(state => state.game); // Ensure this selector only selects necessary state
  const currentPlayer = useSelector(state => state.game.currentPlayer); // Optimize selector if needed
  const { stateMachineInstance } = useGame();
  const [statusMessage, setStatusMessage] = useState(null);
  const particlesEnabled = useFeature('PARTICLE_EFFECTS');

  // Log Redux state and currentPlayer only when they change
  useEffect(() => {
    logger.info("Rendering TurnControls with currentPlayer:", JSON.stringify(currentPlayer));
    logger.info("Redux state (game):", JSON.stringify(game));
  }, [currentPlayer, game]);

  // Log player's position whenever it changes
  useEffect(() => {
    if (currentPlayer) {
      logger.info("Player position updated:", currentPlayer.position);
    }
  }, [currentPlayer?.position]);

  const handleActionSelect = (actionType) => {
    logger.info("Action card clicked", { actionType, currentPlayer });

    if (currentPlayer) {
      const canPerformAction = {
        move: currentPlayer.canMove,
        build: currentPlayer.canBuild,
        roll: currentPlayer.canRoll,
      }[actionType];

      if (!canPerformAction) {
        setStatusMessage(`You have already used your ${actionType} action this turn.`);
        logger.info("Action not available", {
          actionType,
          playerId: currentPlayer.id,
          canMove: currentPlayer.canMove,
          canBuild: currentPlayer.canBuild,
          canRoll: currentPlayer.canRoll,
        });
        return;
      }
    }

    if (!currentPlayer || !stateMachineInstance) {
      setStatusMessage("Cannot perform action: Game or StateMachine not ready");
      logger.warn("Action cannot be performed due to missing dependencies", {
        currentPlayer,
        stateMachineInstanceAvailable: !!stateMachineInstance,
      });
      return;
    }

    const currentState = stateMachineInstance.getCurrentState();

    if (currentState instanceof PlayingState && typeof currentState.selectAction === "function") {
      try {
        const targetPosition = currentPlayer.position; // Ensure targetPosition is passed correctly
        logger.info("Dispatching move action to state machine", {
          actionType,
          playerId: currentPlayer.id,
          position: targetPosition,
        });
        currentState.selectAction(actionType, targetPosition, particlesEnabled);
      } catch (error) {
        setStatusMessage(`Failed to perform ${actionType} action: ${error.message}`);
        logger.error("Failed to select action", {
          actionType,
          error: error instanceof Error ? error.message : "Unknown error",
          playerId: currentPlayer.id,
        });
      }
    } else {
      setStatusMessage("Game is not in a playable state or action not supported");
      logger.warn("Current state does not support selectAction", {
        currentStateName: currentState?.getName(),
      });
    }
  };

  const isActionDisabled = (actionType) => {
    if (!game || !currentPlayer) {
      return true;
    }

    // Log the currentPlayer properties for debugging
    // logger.info("Checking action availability for currentPlayer:", currentPlayer);

    switch (actionType) {
      case "move":
        return !currentPlayer.canMove;
      case "build":
        return !currentPlayer.canBuild;
      case "roll":
        return !currentPlayer.canRoll;
      default:
        return false;
    }
  };

  return (
    <>
      <div className={styles.actionCards}>
        <button
          className={`${styles.actionCard} ${game?.selectedAction === "move" ? styles.selected : ""}`}
          onClick={() => handleActionSelect("move")}
          disabled={isActionDisabled("move")}
        >
          <h4>Move</h4>
          <p>Move one space up/down on adjacent cubes</p>
        </button>

        <button
          className={`${styles.actionCard} ${game?.selectedAction === "build" ? styles.selected : ""}`}
          onClick={() => handleActionSelect("build")}
          disabled={isActionDisabled("build")}
        >
          <h4>Build</h4>
          <p>Stack a cube on the ground or on other cubes</p>
        </button>

        <button
          className={`${styles.actionCard} ${game?.selectedAction === "roll" ? styles.selected : ""}`}
          onClick={() => handleActionSelect("roll")}
          disabled={isActionDisabled("roll")}
        >
          <h4>Roll</h4>
          <p>Roll action (details to be added)</p>
        </button>
      </div>

      {statusMessage && (
        <ActionStatusCard message={statusMessage} onClose={() => setStatusMessage(null)} />
      )}

      {!currentPlayer && (
        <div className={styles.loadingMessage}>
          Loading current player...
        </div>
      )}
    </>
  );
});

export default TurnControls;