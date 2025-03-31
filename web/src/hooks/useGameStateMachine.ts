import { useState, useEffect, useCallback, useRef } from 'react';
import { GameStateMachine, GameStateData } from '../services/stateMachine/GameStateMachine';
import { logger } from '../utils/logger';

// Singleton instance
let stateMachineInstance: GameStateMachine | null = null;

export const useGameStateMachine = () => {
  // Create the instance only once
  if (!stateMachineInstance) {
    logger.info('Creating GameStateMachine singleton instance');
    stateMachineInstance = new GameStateMachine();
  }

  const [currentState, setCurrentState] = useState(stateMachineInstance.getCurrentStateName());
  const [stateData, setStateData] = useState<GameStateData>(stateMachineInstance.getStateData());
  const initialized = useRef(false);

  // Update local state when state machine changes
  useEffect(() => {
    const updateState = () => {
      const newState = stateMachineInstance!.getCurrentStateName();
      const newStateData = stateMachineInstance!.getStateData();
      
      if (newState !== currentState) {
        logger.info('State changed', { from: currentState, to: newState });
        setCurrentState(newState);
      }
      
      if (JSON.stringify(newStateData) !== JSON.stringify(stateData)) {
        logger.info('State data changed', { oldData: stateData, newData: newStateData });
        setStateData(newStateData);
      }
    };

    const updateInterval = setInterval(updateState, 100); // Poll for updates every 100ms
    updateState(); // Initial update

    return () => clearInterval(updateInterval);
  }, [currentState, stateData]);

  // Load persisted state on mount
  useEffect(() => {
    if (!initialized.current) {
      const loaded = stateMachineInstance!.loadPersistedState();
      if (!loaded) {
        logger.info('No persisted state found, starting in setup state');
        stateMachineInstance!.transitionTo('setup');
      }
      initialized.current = true;
    }
  }, []);

  // Wrapper functions for state machine operations
  const saveGame = useCallback((name: string) => {
    stateMachineInstance!.saveGame(name);
  }, []);

  const loadGame = useCallback((name: string) => {
    return stateMachineInstance!.loadGame(name);
  }, []);

  const listSavedGames = useCallback(() => {
    return stateMachineInstance!.listSavedGames();
  }, []);

  // State-specific operations
  const setupOperations = {
    addPlayer: useCallback((name: string) => {
      if (currentState === 'setup') {
        (stateMachineInstance as any).states.get('setup').addPlayer(name);
      }
    }, [currentState]),

    startGame: useCallback(() => {
      if (currentState === 'setup') {
        logger.info('Starting game from setup state');
        (stateMachineInstance as any).states.get('setup').startGame();
      }
    }, [currentState])
  };

  const playingOperations = {
    makeMove: useCallback((move: any) => {
      if (currentState === 'playing') {
        (stateMachineInstance as any).states.get('playing').makeMove(move);
      }
    }, [currentState]),

    getCurrentPlayer: useCallback(() => {
      if (currentState === 'playing') {
        return (stateMachineInstance as any).states.get('playing').getCurrentPlayer();
      }
      return null;
    }, [currentState]),

    selectAction: useCallback((actionType: string, position: any) => {
      if (currentState === 'playing') {
        logger.info('Selecting action in playing state', { actionType, position });
        (stateMachineInstance as any).states.get('playing').selectAction(actionType, position);
      }
    }, [currentState])
  };

  const gameOverOperations = {
    getWinner: useCallback(() => {
      if (currentState === 'gameOver') {
        return (stateMachineInstance as any).states.get('gameOver').getWinner();
      }
      return null;
    }, [currentState]),

    getFinalScores: useCallback(() => {
      if (currentState === 'gameOver') {
        return (stateMachineInstance as any).states.get('gameOver').getFinalScores();
      }
      return [];
    }, [currentState]),

    startNewGame: useCallback(() => {
      if (currentState === 'gameOver') {
        (stateMachineInstance as any).states.get('gameOver').startNewGame();
      }
    }, [currentState])
  };

  return {
    currentState,
    stateData,
    saveGame,
    loadGame,
    listSavedGames,
    setup: setupOperations,
    playing: playingOperations,
    gameOver: gameOverOperations,
    stateMachine: stateMachineInstance
  };
}; 