import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logger } from '../utils/logger'
import { GameLogic } from '../services/gameLogic'
import { initializeGame } from '../store/gameReducer'

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
  const gameLogic = GameLogic.getInstance()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      logger.info('Initializing game state')
      dispatch(initializeGame())
      initialized.current = true
    }
  }, [dispatch])

  const value = {
    game,
    dispatch,
    gameLogic
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
} 