import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './gameReducer'
import { actionValidation } from './middleware/actionValidation'
import { logger } from '../utils/logger'

export const createStore = () => {
  logger.info('Configuring Redux store')
  
  return configureStore({
    reducer: {
      game: gameReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(actionValidation),
    devTools: process.env.NODE_ENV !== 'production'
  })
}

// Create and export the store instance
export const store = createStore()

export default store 