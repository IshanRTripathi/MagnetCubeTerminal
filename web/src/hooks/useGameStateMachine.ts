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
    const updateInterval = setInterval(() => {
      setCurrentState(stateMachineInstance!.getCurrentStateName());
      setStateData(stateMachineInstance!.getStateData());
    }, 100); // Poll for updates every 100ms

    return () => clearInterval(updateInterval);
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    if (!initialized.current) {
      stateMachineInstance!.loadPersistedState();
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
    gameOver: gameOverOperations
  };
}; 