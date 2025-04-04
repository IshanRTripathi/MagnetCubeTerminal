import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();

const game = GameLogic.getInstance();

export const actionValidation = () => (next) => (action) => {
  // logger.info('Validating action', { type: action.type, payload: action.payload });

  // Validate actions before they are dispatched
  switch (action.type) {
    case 'game/build':
      const isValidPlacement = game.physics.isValidPlacement(action.payload)
      if (!isValidPlacement) {
        logger.warn('Invalid build action', {
          position: action.payload,
          reason: 'Invalid placement position'
        })
        return
      }
      logger.info('Build action validated', { position: action.payload })
      break

    case 'game/move':
      const currentPos = game.getCurrentPlayerPosition()
      const isValidMove = game.isValidMove(currentPos, action.payload)
      if (!isValidMove) {
        logger.warn('Invalid move action', {
          from: currentPos,
          to: action.payload,
          reason: 'Invalid move position'
        })
        return
      }
      logger.info('Move action validated', {
        from: currentPos,
        to: action.payload
      })
      break

    case 'game/roll':
      logger.info('Roll action validated')
      break

    case 'game/endTurn':
      logger.info('End turn action validated')
      break

    default:
      logger.debug('Action type not requiring validation', { type: action.type })
  }

  logger.debug('Action passed validation, dispatching', { type: action.type })
  next(action)
}