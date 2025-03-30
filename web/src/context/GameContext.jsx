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
    gameOver 
  } = useGameStateMachine()

  // Create state machine interface - memoize to prevent unnecessary recreation
  const stateMachineInterface = useMemo(() => ({
    transitionTo: (state) => {
      switch (state) {
        case 'playing':
          playing?.startGame()
          break
        case 'gameOver':
          gameOver?.endGame()
          break
        default:
          break
      }
    },
    getStateData: () => stateData,
    updateStateData: (newData) => {
      switch (currentState) {
        case 'playing':
          playing?.makeMove({
            type: 'updateState',
            data: newData
          })
          break
        case 'gameOver':
          gameOver?.updateFinalState(newData)
          break
        default:
          break
      }
    }
  }), [currentState, stateData, playing, gameOver])

  // Initialize game once
  useEffect(() => {
    if (!initialized.current) {
      logger.info('Initializing game state')
      // First attach state machine
      gameLogic.setStateMachine(stateMachineInterface)
      
      // Then initialize game which will properly update state machine
      dispatch(initializeGame())
      initialized.current = true
    }
  }, [gameLogic, stateMachineInterface, dispatch])

  // Sync Redux state with state machine
  useEffect(() => {
    if (game.gameState !== currentState) {
      logger.info('Syncing game state', { 
        reduxState: game.gameState, 
        machineState: currentState 
      })
      
      // Only update Redux state if state machine is in a valid state
      if (currentState && currentState !== 'setup') {
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
      setup?.complete()
    }
  }, [stateData, currentState, setup])

  const value = {
    game,
    dispatch,
    gameLogic,
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