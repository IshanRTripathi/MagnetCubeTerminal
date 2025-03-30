import { createSlice } from '@reduxjs/toolkit'
import { logger } from '../utils/logger'

const PLAYER_COLORS = {
  1: '#f44336', // Red
  2: '#2196F3', // Blue
  3: '#4CAF50', // Green
  4: '#FFC107'  // Yellow
}

// Board layout (4x4 grid):
// pccp  where p=player, c=cube
// cccc  Each unit is 1x1
// cccc  No gaps between elements
// pccp
const INITIAL_POSITIONS = {
  1: [-1.5, 0, -1.5], // Red - Bottom Left
  2: [1.5, 0, -1.5],  // Blue - Bottom Right
  3: [-1.5, 0, 1.5],  // Green - Top Left
  4: [1.5, 0, 1.5]    // Yellow - Top Right
}

// Define power cards based on game rules
const POWER_CARDS = {
  ACCELERATE: { id: 'accelerate', name: 'Accelerate', description: 'Take an extra turn after this one', type: 'movement' },
  ARMAGEDDON: { id: 'armageddon', name: 'Armageddon', description: 'Remove 1 cube under any number of players', type: 'attack' },
  BARRIER: { id: 'barrier', name: 'Barrier', description: 'Negate wind or a power that would affect you', type: 'defense' },
  ECHO: { id: 'echo', name: 'Echo', description: 'Use one of your other powers once more', type: 'utility' },
  FREEZE: { id: 'freeze', name: 'Freeze', description: 'Each other player cannot perform their move action next turn', type: 'control' },
  GAMBLE: { id: 'gamble', name: 'Gamble', description: 'Perform the roll action twice this turn', type: 'utility' },
  IGNITE: { id: 'ignite', name: 'Ignite', description: 'Remove 1 or 2 cubes under any player', type: 'attack' },
  KICK: { id: 'kick', name: 'Kick', description: 'Move an adjacent player to any adjacent space', type: 'attack' },
  LEVITATE: { id: 'levitate', name: 'Levitate', description: 'Build directly under yourself', type: 'movement' },
  LIMITLESS: { id: 'limitless', name: 'Limitless', description: 'Move any number of times this turn', type: 'movement' },
  MASTERY: { id: 'mastery', name: 'Mastery', description: 'Perform a grapple action', type: 'utility' },
  REVIVE: { id: 'revive', name: 'Revive', description: 'Place yourself on any unoccupied space below level 3', type: 'movement' },
  ROAR: { id: 'roar', name: 'Roar', description: 'Adjacent players cannot move or grapple next turn', type: 'control' },
  STEAL: { id: 'steal', name: 'Steal', description: 'Move a cube from under another player to under yourself', type: 'attack' },
  TELEKINESIS: { id: 'telekinesis', name: 'Telekinesis', description: 'Move 2 unoccupied cubes to any valid position', type: 'utility' },
  TIME_STOP: { id: 'time_stop', name: 'Time Stop', description: 'End your turn without performing another action', type: 'utility' }
}

// Assign initial power cards to players
const INITIAL_POWER_CARDS = {
  1: [POWER_CARDS.IGNITE, POWER_CARDS.BARRIER],     // Red - Aggressive start
  2: [POWER_CARDS.FREEZE, POWER_CARDS.TELEKINESIS], // Blue - Control oriented
  3: [POWER_CARDS.LIMITLESS, POWER_CARDS.STEAL],    // Green - Mobile and tricky
  4: [POWER_CARDS.ROAR, POWER_CARDS.LEVITATE]       // Yellow - Defensive setup
}

// Create initial cube positions based on the board layout
const createInitialCubes = () => {
  const cubes = {}
  let cubeId = 1

  // Create the 4x4 grid of cubes
  // Using -0.5 to 0.5 range for inner cubes to make them adjacent
  for (let z = -1.5; z <= 1.5; z++) {
    for (let x = -1.5; x <= 1.5; x++) {
      // Skip positions where players start (corners)
      if ((Math.abs(x) === 1.5 && Math.abs(z) === 1.5)) {
        continue
      }
      
      cubes[`cube-${cubeId}`] = {
        id: `cube-${cubeId}`,
        position: [x, 0, z],
        owner: null,
        size: 1 // Adding explicit size for reference
      }
      cubeId++
    }
  }

  return cubes
}

// Add new action types for logging and action selection
const addGameLog = (state, message) => {
  const timestamp = new Date().toLocaleTimeString()
  state.logs.unshift(`[${timestamp}] ${message}`)
  // Keep only the last 50 logs
  if (state.logs.length > 50) {
    state.logs.pop()
  }
}

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    players: [],
    currentPlayer: null,
    cubes: {},
    logs: [],
    gameState: 'setup',
    turnNumber: 0,
    selectedAction: null
  },
  reducers: {
    initializeGame: (state) => {
      logger.info('Initializing game')
      
      // Create all 4 players with their colors and positions
      state.players = Object.entries(PLAYER_COLORS).map(([id, color]) => ({
        id: parseInt(id),
        color,
        position: INITIAL_POSITIONS[id],
        powerCards: INITIAL_POWER_CARDS[id],
        magneticFieldStrength: 1.0,
        canMove: true,
        canBuild: true,
        canRoll: true
      }))

      // Set first player (Blue)
      state.currentPlayer = state.players[1] // Player 2 is Blue
      state.gameState = 'playing'
      state.turnNumber = 1
      
      // Initialize cubes in the specified layout
      state.cubes = createInitialCubes()

      addGameLog(state, "Game started - Blue player's turn")

      logger.info('Game initialized', { 
        players: state.players,
        currentPlayer: state.currentPlayer,
        cubes: state.cubes
      })
    },
    
    selectAction: (state, action) => {
      const { actionType } = action.payload
      state.selectedAction = actionType
      addGameLog(state, `${state.currentPlayer.id === 2 ? 'Blue' : 'Red'} player selected ${actionType}`)
    },

    nextTurn: (state) => {
      const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayer.id)
      const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length
      state.currentPlayer = state.players[nextPlayerIndex]
      state.turnNumber++

      // Reset player actions for the new turn
      state.currentPlayer.canMove = true
      state.currentPlayer.canBuild = true
      state.currentPlayer.canRoll = true
      state.selectedAction = null

      const playerColors = {
        1: 'Red',
        2: 'Blue',
        3: 'Green',
        4: 'Yellow'
      }

      addGameLog(state, `Turn ${state.turnNumber} - ${playerColors[state.currentPlayer.id]}'s turn`)
    }
  }
})

export const { initializeGame, selectAction, nextTurn } = gameSlice.actions
export default gameSlice.reducer 