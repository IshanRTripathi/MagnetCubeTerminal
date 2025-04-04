import { configureStore } from '@reduxjs/toolkit'
import gameSlice from './gameSlice'
import { actionValidation } from './middleware/actionValidation'
import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();

export const createStore = () => {
  logger.info('Configuring Redux store')
  
  return configureStore({
    reducer: {
      game: gameSlice
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(actionValidation),
    devTools: process.env.NODE_ENV !== 'production'
  })
}

// Create and export the store instance
export const store = createStore()

export default store 