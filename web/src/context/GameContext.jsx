import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
import { GameLogic } from '../services/GameLogic'
import { initializeGame, setCurrentPlayer } from '../store/gameSlice'
import { useGameStateMachine } from '../hooks/useGameStateMachine'

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  const dispatch = useDispatch()
  const game = useSelector(state => state.game)
  const currentPlayer = useSelector((state) => state.game.currentPlayer);
  const gameLogic = useMemo(() => GameLogic.getInstance(), [])
  const initialized = useRef(false)
  const syncInProgress = useRef(false)
  
  // Initialize state machine
  const { 
    currentState, 
    stateData, 
    setup, 
    playing, 
    gameOver,
    stateMachine: stateMachineInstance
  } = useGameStateMachine()

  // Create state machine interface - memoize to prevent unnecessary recreation
  const stateMachineInterface = useMemo(() => ({
    transitionTo: (state) => {
      logger.info('State machine transition requested', { 
        from: currentState, 
        to: state 
      })

      // First transition the state machine
      if (stateMachineInstance) {
        stateMachineInstance.transitionTo(state)
        logger.info('State machine transitioned', {
          from: currentState,
          to: state,
          stateData
        })
      }
    },
    
    getStateData: () => stateData,
    updateStateData: (newData) => {
      switch (currentState) {
        case 'playing':
          if (playing) {
            playing.makeMove({
              type: 'updateState',
              data: newData
            })
          }
          break
        case 'gameOver':
          if (gameOver) {
            gameOver.updateFinalState(newData)
          }
          break
        default:
          break
      }
    }
  }), [currentState, stateData, playing, gameOver, stateMachineInstance])

  // Initialize game once
  useEffect(() => {
    const initGame = () => {
      if (!initialized.current) {
        logger.info('Initializing game via GameLogic service')
        
        // 1. Initialize the GameLogic service state
        gameLogic.initializeGame(); // Default player count
        
        // 2. Get the initial state *from* the GameLogic service
        const initialGameState = gameLogic.getGameState();
        logger.info('Retrieved initial state from GameLogic', { initialGameState });
        
        // 3. Dispatch action to set Redux state based on GameLogic state
        dispatch(initializeGame(initialGameState))
        
        // Optional: Attach state machine *after* GameLogic and Redux are initialized
        gameLogic.setStateMachine(stateMachineInterface)
        
        // Mark as initialized
        initialized.current = true
      }
    }

    initGame()
    // Dependencies: only dispatch. gameLogic instance is stable due to useMemo.
    // stateMachineInterface might be needed if attach happens here.
  }, [dispatch, gameLogic, stateMachineInterface]) 

  // Single effect to handle state synchronization
  useEffect(() => {
    if (!initialized.current || syncInProgress.current) {
      return;
    }

    syncInProgress.current = true;
    try {
      // Case 1: Game is initialized and we need to transition to playing
      if (game.currentPlayer && stateMachineInstance && currentState !== 'playing' && game.gameState === 'playing') {
        const boardArray = Object.values(game.cubes).map(cube => ({
          id: cube.id,
          position: cube.position
        }));

        stateMachineInstance.updateStateData({
          players: game.players.map(player => ({
            id: player.id.toString(),
            name: `Player ${player.id}`,
            score: player.score,
            position: player.position,
            color: player.color
          })),
          currentPlayerId: game.currentPlayer.id.toString(),
          board: boardArray,
          moveHistory: []
        });

        logger.info('Game state synchronized with Redux', {
          gameState: game.gameState,
          currentPlayer: game.currentPlayer,
          machineState: currentState
        });
      }
      // Case 2: State machine state changed and we need to update Redux
      else if (game.gameState !== currentState && currentState && currentState !== 'setup') {
        dispatch({ 
          type: 'game/setState', 
          payload: currentState 
        });
        
        logger.info('Redux state synchronized with state machine', {
          reduxState: game.gameState,
          machineState: currentState
        });
      }
      // Case 3: Setup is complete and we need to start the game
      else if (stateData?.players.length > 0 && currentState === 'setup' && game.gameState === 'setup') {
        setup?.startGame();
        logger.info('Setup complete, starting game');
      }
    } finally {
      syncInProgress.current = false;
    }
  }, [game.currentPlayer, game.gameState, currentState, stateData, stateMachineInstance, setup, dispatch, game.players, game.cubes])

  useEffect(() => {
    if (currentPlayer) {
      logger.info('Sync with Redux successful', { currentPlayer });
    }
  }, [currentPlayer]);

  const syncPlayerWithRedux = (playerDetails) => {
    // Update Redux store with player details
    dispatch(setCurrentPlayer(playerDetails));
    logger.info('Player details synchronized with Redux', { playerDetails });
  };

  const value = {
    game,
    dispatch,
    gameLogic,
    currentPlayer,
    syncPlayerWithRedux,
    stateMachine: {
      currentState,
      stateData,
      setup,
      playing,
      gameOver
    },
    stateMachineInstance
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}