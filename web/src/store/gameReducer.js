import { createSlice } from '@reduxjs/toolkit'
import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();

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
    initializeGame: (state, action) => {
      const { players, cubes, currentPlayerId, gamePhase, turnNumber } = action.payload;
      logger.info('Reducer: Setting initial state from GameLogic', { payload: action.payload });

      state.players = players; // Assume payload.players is already the correct array
      state.cubes = cubes;     // Assume payload.cubes is already the correct object
      state.currentPlayer = players.find(p => p.id === currentPlayerId) || null;
      state.gameState = gamePhase;
      state.turnNumber = turnNumber;
      state.logs = []; // Clear logs on new init
      state.selectedAction = null;

      if (state.gameState === 'playing') {
        addGameLog(state, "Game started - Player " + (state.currentPlayer?.id || '?') + "'s turn");
      }
      logger.info('Redux state updated from GameLogic', { 
        players: state.players.length,
        currentPlayer: state.currentPlayer?.id,
        cubes: Object.keys(state.cubes).length,
        gameState: state.gameState
      });

      // Log the entire state after initialization
      console.log("[initializeGame] Initial state:", JSON.stringify(state, null, 2));
    },
    
    // Added reducer for moving a player
    movePlayer: (state, action) => {
      const { playerId, newPosition } = action.payload;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex !== -1) {
        // Apply mutations to the draft player within the array
        state.players[playerIndex].position = newPosition;
        state.players[playerIndex].canMove = false; 
        addGameLog(state, `Player ${playerId} moved to [${newPosition.join(', ')}]`);

        // If this was the current player, update the state.currentPlayer reference
        // by explicitly re-assigning from the (potentially) new array reference
        if (state.currentPlayer && state.currentPlayer.id === playerId) {
           state.currentPlayer = state.players[playerIndex]; 
           // Explicitly set canBuild and canRoll to true
           state.currentPlayer.canBuild = true;
           state.currentPlayer.canRoll = true;
           // Log the entire state after updating currentPlayer
           console.log("[movePlayer] State after updating currentPlayer:", JSON.stringify(state, null, 2));
        }
      } else {
        logger.error(`Reducer movePlayer: Player ${playerId} not found.`);
      }
    },

    // Added reducer for adding a cube
    addCube: (state, action) => {
      const { id, position, owner = null } = action.payload; // Use payload directly
      if (!state.cubes[id]) { 
        state.cubes[id] = { id, position, owner }; // Set owner if provided
        addGameLog(state, `Cube ${id} added at [${position.join(', ')}]`);
      } else {
         logger.warn(`Reducer addCube: Cube ${id} already exists.`);
      }
    },

    selectAction: (state, action) => {
      const { actionType } = action.payload
      state.selectedAction = actionType
      addGameLog(state, `${state.currentPlayer.id === 2 ? 'Blue' : 'Red'} player selected ${actionType}`)
    },

    nextTurn: (state) => {
      const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayer.id);
      const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
      const nextPlayer = state.players[nextPlayerIndex]; // Get the next player object

      // Reset action flags for the *new* current player
      nextPlayer.canMove = true;
      nextPlayer.canBuild = true;
      nextPlayer.canRoll = true;

      // Update the currentPlayer reference to the next player
      state.currentPlayer = nextPlayer; // Assign the reference to the new current player
      state.turnNumber++;
      state.selectedAction = null;

      const playerColors = {
        1: 'Red',
        2: 'Blue',
        3: 'Green',
        4: 'Yellow'
      };

      addGameLog(state, `Turn ${state.turnNumber} - ${playerColors[state.currentPlayer.id]}'s turn`);

      // Log the entire state after updating currentPlayer
      console.log("[nextTurn] State after updating currentPlayer:", JSON.stringify(state, null, 2));
    },

    updateGameState: (state, action) => {
      const { gameState, stateData } = action.payload
      let hasChanges = false;
      
      if (gameState && gameState !== state.gameState) {
        state.gameState = gameState;
        hasChanges = true;
      }
      
      if (stateData) {
        // Update players if provided and changed
        if (stateData.players) {
          const newPlayers = stateData.players.map(player => ({
            ...player,
            id: parseInt(player.id),
            position: Array.isArray(player.position) ? player.position : [player.position.x, player.position.y, player.position.z]
          }));

          // Only update if players have changed
          if (JSON.stringify(newPlayers) !== JSON.stringify(state.players)) {
            state.players = newPlayers;
            hasChanges = true;
          }
        }
        
        // Update current player if provided and changed
        if (stateData.currentPlayerId) {
          const newCurrentPlayer = state.players.find(p => p.id.toString() === stateData.currentPlayerId);
          if (newCurrentPlayer && (!state.currentPlayer || state.currentPlayer.id !== newCurrentPlayer.id)) {
            state.currentPlayer = newCurrentPlayer;
            hasChanges = true;
          }
        }
        
        // Update board state if provided and changed
        if (stateData.board) {
          const newCubes = stateData.board.reduce((acc, cube) => {
            acc[cube.id] = {
              ...cube,
              position: Array.isArray(cube.position) ? cube.position : [cube.position.x, cube.position.y, cube.position.z]
            }
            return acc;
          }, {});

          // Only update if cubes have changed
          if (JSON.stringify(newCubes) !== JSON.stringify(state.cubes)) {
            state.cubes = newCubes;
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        logger.info('Game state updated', { 
          newGameState: gameState,
          stateDataUpdated: stateData ? Object.keys(stateData) : []
        });
      } else {
        logger.debug('No changes in game state update');
      }
    }
  }
})

export const { 
  initializeGame, 
  movePlayer,
  addCube,
  selectAction, 
  nextTurn,
  updateGameState 
} = gameSlice.actions

export default gameSlice.reducer 