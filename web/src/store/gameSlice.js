import { createSlice } from '@reduxjs/toolkit';
import { UniversalLogger } from '../utils/UniversalLogger';

const logger = UniversalLogger.getInstance();

const initialState = {
  players: [],
  currentPlayer: null,
  cubes: {},
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

      state.players = players;
      state.cubes = cubes;
      state.currentPlayer = players.find((p) => p.id === currentPlayerId) || null;
      state.gameState = gameState;
      state.turnNumber = turnNumber;
      state.logs = [];
      state.selectedAction = null;

      if (state.gameState === 'playing') {
        addGameLog(state, `Game started - Player ${state.currentPlayer?.id || '?'}'s turn`);
      }
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
      if (!state.cubes[id]) {
        state.cubes[id] = { id, position, owner };
        addGameLog(state, `Cube ${id} added at [${position.join(', ')}]`);
      }
    },
    setGameState: (state, action) => {
      state.gameState = action.payload;
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
  },
});

export const {
  initializeGame,
  movePlayer,
  addCube,
  setGameState,
  nextTurn,
  selectAction,
} = gameSlice.actions;

export default gameSlice.reducer;