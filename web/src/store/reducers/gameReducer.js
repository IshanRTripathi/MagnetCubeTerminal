import { logger } from '../../utils/logger'

const initialState = {
  players: [],
  currentPlayer: null,
  cubes: {},
  selectedPowerCard: null,
  logs: [],
  gameState: 'initializing'
}

const gameReducer = (state = initialState, action) => {
  logger.debug('Game reducer action', { action })

  switch (action.type) {
    case 'game/initialize':
      return {
        ...state,
        players: action.payload.players,
        currentPlayer: action.payload.players[0],
        gameState: 'playing',
        logs: []
      }

    case 'game/build':
      return {
        ...state,
        cubes: {
          ...state.cubes,
          [action.payload.id]: action.payload
        },
        logs: [
          ...state.logs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Player ${state.currentPlayer.id} built cube at ${action.payload.position.join(', ')}`,
            context: action.payload
          }
        ]
      }

    case 'game/move':
      return {
        ...state,
        players: state.players.map(player =>
          player.id === state.currentPlayer.id
            ? { ...player, position: action.payload }
            : player
        ),
        logs: [
          ...state.logs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Player ${state.currentPlayer.id} moved to ${action.payload.join(', ')}`,
            context: action.payload
          }
        ]
      }

    case 'game/roll':
      return {
        ...state,
        logs: [
          ...state.logs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Player ${state.currentPlayer.id} rolled ${action.payload}`,
            context: action.payload
          }
        ]
      }

    case 'game/endTurn':
      const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayer.id)
      const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length
      const nextPlayer = state.players[nextPlayerIndex]

      return {
        ...state,
        currentPlayer: nextPlayer,
        logs: [
          ...state.logs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Turn ended. Next player: ${nextPlayer.id}`,
            context: { nextPlayer: nextPlayer.id }
          }
        ]
      }

    case 'game/usePowerCard':
      return {
        ...state,
        selectedPowerCard: null,
        logs: [
          ...state.logs,
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Player ${state.currentPlayer.id} used power card on cube ${action.payload.target}`,
            context: action.payload
          }
        ]
      }

    default:
      return state
  }
}

export default gameReducer 