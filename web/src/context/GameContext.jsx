import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logger } from '../utils/logger'
import { GameLogic } from '../services/gameLogic'
import { initializeGame } from '../store/gameReducer'
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
  const gameLogic = useMemo(() => GameLogic.getInstance(), [])
  const initialized = useRef(false)
  
  // Initialize state machine
  const { 
    currentState, 
    stateData, 
    setup, 
    playing, 
    gameOver,
    stateMachine
  } = useGameStateMachine()

  // Create state machine interface - memoize to prevent unnecessary recreation
  const stateMachineInterface = useMemo(() => ({
    transitionTo: (state) => {
      logger.info('State machine transition requested', { 
        from: currentState, 
        to: state 
      })

      // First transition the state machine
      if (stateMachine) {
        stateMachine.transitionTo(state)
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
  }), [currentState, stateData, playing, gameOver, stateMachine])

  // Initialize game once
  useEffect(() => {
    const initGame = () => {
      if (!initialized.current) {
        logger.info('Initializing game state')
        
        // First attach state machine
        gameLogic.setStateMachine(stateMachineInterface)
        
        // Initialize game in Redux first
        dispatch(initializeGame())
        
        // Mark as initialized immediately to prevent multiple runs
        initialized.current = true
      }
    }

    initGame()
  }, [gameLogic, stateMachineInterface, dispatch]) // Remove game and stateMachine from deps

  // Handle Redux state updates separately
  useEffect(() => {
    if (initialized.current && game.currentPlayer && stateMachine && currentState !== 'playing') {
      // Update state machine data before transitioning
      const boardArray = Object.values(game.cubes).map(cube => ({
        id: cube.id,
        position: cube.position
      }));

      stateMachine.updateStateData({
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

      // Now transition state machine
      stateMachineInterface.transitionTo('playing')
      
      logger.info('Game initialization complete', {
        gameState: game.gameState,
        currentPlayer: game.currentPlayer,
        machineState: currentState,
        stateData: stateMachine.getStateData()
      })
    }
  }, [game.currentPlayer, stateMachine, currentState])

  // Sync Redux state with state machine
  useEffect(() => {
    if (game.gameState !== currentState && currentState) {
      logger.info('Syncing game state', { 
        reduxState: game.gameState, 
        machineState: currentState 
      })
      
      // Only update Redux state if state machine is in a valid state
      if (currentState !== 'setup') {
        dispatch({ 
          type: 'game/setState', 
          payload: currentState 
        })
      }
    }
  }, [currentState, game.gameState, dispatch])

  // Handle state machine setup completion
  useEffect(() => {
    if (stateData && stateData.players.length > 0 && currentState === 'setup') {
      logger.info('Setup complete, transitioning to playing state')
      setup?.startGame()
    }
  }, [stateData, currentState, setup])

  const value = {
    game,
    dispatch,
    gameLogic,
    currentPlayer: game.currentPlayer,
    stateMachine: {
      currentState,
      stateData,
      setup,
      playing,
      gameOver
    }
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
} 