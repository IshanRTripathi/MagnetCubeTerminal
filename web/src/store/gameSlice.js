import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentPlayer: 1,
  players: [
    { id: 1, position: [0, 1, 0], color: '#ff0000' },
    { id: 2, position: [1, 1, 0], color: '#00ff00' },
    { id: 3, position: [0, 1, 1], color: '#0000ff' },
    { id: 4, position: [1, 1, 1], color: '#ffff00' }
  ],
  cubes: [
    { position: [0, 0, 0], color: '#ffffff' },
    { position: [1, 0, 0], color: '#ffffff' },
    { position: [0, 0, 1], color: '#ffffff' }
  ],
  powerCards: [],
  gamePhase: 'setup', // setup, playing, ended
  lastAction: null,
  selectedAction: null // build, move, roll, null
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentPlayer: (state, action) => {
      state.currentPlayer = action.payload
    },
    movePlayer: (state, action) => {
      const { playerId, newPosition } = action.payload
      const player = state.players.find(p => p.id === playerId)
      if (player) {
        player.position = newPosition
      }
    },
    addCube: (state, action) => {
      state.cubes.push(action.payload)
    },
    setGamePhase: (state, action) => {
      state.gamePhase = action.payload
    },
    setLastAction: (state, action) => {
      state.lastAction = action.payload
    },
    setSelectedAction: (state, action) => {
      state.selectedAction = action.payload
    },
    build: (state, action) => {
      state.cubes.push({
        position: action.payload,
        color: '#ffffff'
      })
      state.lastAction = 'build'
    },
    move: (state, action) => {
      const { playerId, position } = action.payload
      const player = state.players.find(p => p.id === playerId)
      if (player) {
        player.position = position
      }
      state.lastAction = 'move'
    },
    roll: (state) => {
      state.lastAction = 'roll'
    },
    endTurn: (state) => {
      state.currentPlayer = (state.currentPlayer % state.players.length) + 1
      state.selectedAction = null
    }
  }
})

export const {
  setCurrentPlayer,
  movePlayer,
  addCube,
  setGamePhase,
  setLastAction,
  setSelectedAction,
  build,
  move,
  roll,
  endTurn
} = gameSlice.actions

export default gameSlice.reducer 