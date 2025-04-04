import { createSlice } from '@reduxjs/toolkit';
import { UniversalLogger } from '../utils/UniversalLogger';

const logger = UniversalLogger.getInstance();

const initialState = {
  players: [], // Players will be populated during board initialization
  cubes: [], // Cubes will be populated during board initialization
  currentPlayer: null,
  logs: [],
  gameState: 'setup',
  turnNumber: 0,
  selectedAction: null,
};

const addGameLog = (state, message) => {
  const timestamp = new Date().toLocaleTimeString();
  state.logs.unshift(`[${timestamp}] ${message}`);
  if (state.logs.length > 50) {
    state.logs.pop();
  }
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state, action) => {
      const { players, cubes, currentPlayerId, gameState, turnNumber } = action.payload;
      logger.info('Reducer: Setting initial state from GameLogic', { payload: action.payload });

      state.players = players || [];
      state.cubes = cubes || []; // Cubes are initialized here
      state.currentPlayer = players.find((p) => p.id === currentPlayerId) || null;
      state.gameState = gameState || 'setup';
      state.turnNumber = turnNumber || 0;
      state.logs = [];
      state.selectedAction = null;

      if (state.gameState === 'playing') {
        addGameLog(state, `Game started - Player ${state.currentPlayer?.id || '?'}'s turn`);
      }
    },
    setGameState: (state, action) => {
      const { gameState, stateData } = action.payload;

      // Ensure the game state is set to "playing"
      if (gameState !== 'playing') {
        logger.warn('Game state is not "playing"', { gameState });
        return;
      }

      // Extract players, cubes, and currentPlayerId from stateData
      const players = stateData.players || [];
      const cubes = stateData.board.reduce((acc, cube) => {
        acc.push({ id: cube.id, position: cube.position });
        return acc;
      }, []);
      const currentPlayer = players.find(player => player.id === stateData.currentPlayerId.toString()) || null;

      // Set default action availability properties to true during initialization
      if (currentPlayer) {
        currentPlayer.canMove = true;
        currentPlayer.canBuild = true;
        currentPlayer.canRoll = true;
      }

      // Log the updated state for debugging
      // logger.info('Updating Redux state:', { players, cubes, currentPlayer });

      // Update the state
      state.gameState = gameState;
      state.players = players;
      state.cubes = cubes;
      state.currentPlayer = currentPlayer;
    },
    setCurrentPlayer: (state, action) => {
      const playerId = action.payload;

      // Update the current player based on the playerId
      state.currentPlayer = state.players.find(player => player.id === playerId) || null;
    },
    movePlayer: (state, action) => {
      const { playerId, newPosition } = action.payload;
      const player = state.players.find((p) => p.id === playerId);
      if (player) {
        player.position = newPosition;
        addGameLog(state, `Player ${playerId} moved to [${newPosition.join(', ')}]`);
      }
    },
    addCube: (state, action) => {
      const { id, position, owner = null } = action.payload;
      if (!state.cubes.find(cube => cube.id === id)) {
        state.cubes.push({ id, position, owner });
        addGameLog(state, `Cube ${id} added at [${position.join(', ')}]`);
      }
    },
    nextTurn: (state) => {
      const currentPlayerIndex = state.players.findIndex((p) => p.id === state.currentPlayer.id);
      const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
      state.currentPlayer = state.players[nextPlayerIndex];
      state.turnNumber++;
      state.selectedAction = null;
      addGameLog(state, `Turn ${state.turnNumber} - Player ${state.currentPlayer.id}'s turn`);
    },
    selectAction: (state, action) => {
      state.selectedAction = action.payload;
      addGameLog(state, `Player ${state.currentPlayer.id} selected action: ${action.payload}`);
    },
    addLog: (state, action) => {
      // Add a new log entry
      state.logs.push(action.payload);
    },
    incrementTurn: (state) => {
      // Increment the turn number
      state.turnNumber += 1;
    },
    setSelectedAction: (state, action) => {
      // Set the selected action
      state.selectedAction = action.payload;
    },
  },
});

export const {
  initializeGame,
  setGameState,
  setCurrentPlayer,
  movePlayer,
  addCube,
  updateCubePosition,
  nextTurn,
  selectAction,
  addLog,
  incrementTurn,
  setSelectedAction,
} = gameSlice.actions;

export default gameSlice.reducer;