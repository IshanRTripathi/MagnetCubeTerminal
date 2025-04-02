import { logger } from '../utils/logger'
import { MagneticPhysics } from './physics'
import { Singleton } from '../utils/Singleton'
import { store } from '../store' // Import the Redux store
import { movePlayer, addCube as addCubeAction } from '../store/gameReducer' // Import actions

// --- Moved Constants and Helpers from gameReducer --- 
const PLAYER_COLORS = {
  1: '#f44336', // Red
  2: '#2196F3', // Blue
  3: '#4CAF50', // Green
  4: '#FFC107'  // Yellow
}

const INITIAL_POSITIONS = {
  1: [-1.5, 0, -1.5], // Red - Bottom Left
  2: [1.5, 0, -1.5],  // Blue - Bottom Right
  3: [-1.5, 0, 1.5],  // Green - Top Left
  4: [1.5, 0, 1.5]    // Yellow - Top Right
}

// NOTE: Power card logic might need adjustment if POWER_CARDS object isn't moved/imported
// For now, using empty array or placeholder.
const INITIAL_POWER_CARDS = {
  1: [], 2: [], 3: [], 4: [] // Placeholder
}

const createInitialCubes = () => {
  const cubes = {}
  let cubeId = 1
  for (let z = -1.5; z <= 1.5; z++) {
    for (let x = -1.5; x <= 1.5; x++) {
      if ((Math.abs(x) === 1.5 && Math.abs(z) === 1.5)) {
        continue
      }
      cubes[`cube-${cubeId}`] = {
        id: `cube-${cubeId}`,
        position: [x, 0, z],
        owner: null,
        size: 1
      }
      cubeId++
    }
  }
  return cubes
}
// --- End Moved Constants and Helpers ---

let instance = null;

export class GameLogic {
  static getInstance() {
    if (!instance) {
      instance = Singleton.getInstance(GameLogic)
      logger.info('Initializing GameLogic')
    }
    return instance
  }

  constructor() {
    this.physics = MagneticPhysics.getInstance()
    this.currentPlayer = null // Start as null before init
    this.players = new Map()
    this.cubes = new Map()
    this.gamePhase = 'setup'
    this.stateMachine = null
    this._stateMachineAttached = false
  }

  setStateMachine(stateMachine) {
    // Only attach if not already attached or if the interface has changed
    if (!this._stateMachineAttached || 
        !this.stateMachine || 
        this.stateMachine.getStateData !== stateMachine.getStateData) {
      this.stateMachine = stateMachine
      this._stateMachineAttached = true
      logger.info('State machine attached to GameLogic')
    }
  }

  // Updated Initialize the game with detailed logic
  initializeGame() { // Removed playerCount default for now, uses constants
    logger.info('Initializing game with detailed setup')
    
    // Clear previous state
    this.players.clear();
    this.cubes.clear();

    // Create players based on constants
    Object.entries(PLAYER_COLORS).forEach(([idStr, color]) => {
      const id = parseInt(idStr);
      this.players.set(id, {
        id: id,
        color,
        position: INITIAL_POSITIONS[id],
        powerCards: INITIAL_POWER_CARDS[id] || [], // Use placeholder
        magneticFieldStrength: 1.0,
        canMove: true,
        canBuild: true,
        canRoll: true
        // Add any other necessary player properties
      });
      logger.info('Player initialized in GameLogic', { playerId: id, position: INITIAL_POSITIONS[id] })
    });

    // Initialize cubes
    const initialCubesObject = createInitialCubes();
    Object.values(initialCubesObject).forEach(cube => {
        this.cubes.set(cube.id, cube);
    });
    // Ensure physics service is aware of cubes (if needed by isValidPlacement)
    this.cubes.forEach(cube => {
        this.physics.addCube(cube.id, cube.position); 
    });

    // Set specific first player (Player 2 - Blue)
    this.currentPlayer = 2; 
    this.gamePhase = 'playing'; // Set phase AFTER setup is done
    // this.turnNumber = 1; // Let getGameState calculate turn number
    
    // Update state machine if attached (optional here, could be done after Redux update)
    if (this.stateMachine) {
      // ... update state machine data if necessary ...
      // this.stateMachine.transitionTo('playing');
    }
    
    logger.info('GameLogic initialization complete (Detailed)');
  }

  // getGameState method should remain as is from the previous step
  getGameState() {
    // Convert Maps to structures expected by Redux if necessary
    const cubesObject = {};
    this.cubes.forEach((value, key) => {
      cubesObject[key] = value;
    });

    // Ensure player positions are arrays (if they aren't already)
    const playersArray = Array.from(this.players.values()).map(player => ({
        ...player,
        position: Array.isArray(player.position) ? player.position : [0, 1, 0] // Default if somehow not set
    }));

    return {
      players: playersArray,
      cubes: cubesObject, 
      currentPlayerId: this.currentPlayer, // Use the ID
      gamePhase: this.gamePhase,
      turnNumber: this.gamePhase === 'playing' ? 1 : 0 // Set turn number based on phase
    };
  }

  // getPlayerColor method can likely be removed if PLAYER_COLORS constant is used directly
  // getPlayerColor(playerId) { ... }

  // addCube might need adjustment if createInitialCubes handles all initial cubes
  addCube(id, position) {
    // Only add if not already present from initialization
    if (!this.cubes.has(id)) {
        logger.info('Adding cube dynamically', { id, position })
        const newCube = {
            id,
            position,
            color: 'rgba(255, 255, 255, 0.6)' // Default color for dynamic cubes
        };
        this.cubes.set(id, newCube);
        this.physics.addCube(id, position); // Inform physics service

        // *** Dispatch action to update Redux store ***
        // Note: Using addCubeAction because addCube name is already used for the method
        store.dispatch(addCubeAction({ id: newCube.id, position: newCube.position })); 

        // Update state machine if attached
        // ... (state machine update logic) ...
    }
  }

  // Build action
  build(position) {
    logger.info('Attempting build action', { position })
    if (this.gamePhase !== 'playing') {
      logger.warn('Build action attempted in wrong phase', { 
        currentPhase: this.gamePhase,
        requiredPhase: 'playing'
      })
      return false
    }
    
    if (!this.physics.isValidPlacement(position)) {
      logger.warn('Invalid build position', { position })
      return false
    }

    const cubeId = `cube-${this.cubes.size + 1}`
    // Call this.addCube which now handles logic AND dispatching
    this.addCube(cubeId, position); 
    
    // Check if cube was actually added (it might already exist)
    if (this.cubes.has(cubeId)) {
        // Update state machine move history if attached
        if (this.stateMachine) {
          // ... state machine update logic ...
        }
        logger.info('Build action successful', { cubeId, position })
        return true; // Return true since the logical action succeeded
    } else {
        logger.warn('Build action failed: Cube already exists or addCube failed', { cubeId });
        return false;
    }
  }

  // Move action
  move(playerId, newPosition) {
    logger.info('Attempting move action', { playerId, newPosition })
    if (this.gamePhase !== 'playing') {
      logger.warn('Move action attempted in wrong phase', {
        currentPhase: this.gamePhase,
        requiredPhase: 'playing'
      })
      return false
    }
    if (playerId !== this.currentPlayer) {
      logger.warn('Move action attempted by wrong player', {
        currentPlayer: this.currentPlayer,
        attemptingPlayer: playerId
      })
      return false
    }

    const player = this.players.get(playerId)
    if (!player) {
      logger.error('Player not found', { playerId })
      return false
    }

    // Convert newPosition object to array if needed by isValidMove
    const toPositionArray = [newPosition.x, newPosition.y, newPosition.z];
    if (!this.isValidMove(player.position, toPositionArray)) {
      logger.warn('Invalid move attempted', {
        playerId,
        from: player.position,
        to: toPositionArray
      })
      return false
    }

    const oldPosition = [...player.position]
    // Update internal state (Map)
    player.position = toPositionArray; 

    // *** Dispatch action to update Redux store ***
    store.dispatch(movePlayer({ playerId: playerId, newPosition: toPositionArray }));

    // Update state machine if attached
    if (this.stateMachine) {
      const stateData = this.stateMachine.getStateData()
      this.stateMachine.updateStateData({
        ...stateData,
        moveHistory: [...stateData.moveHistory, {
          type: 'move',
          playerId,
          from: oldPosition,
          to: toPositionArray,
          timestamp: Date.now()
        }]
      })
    }

    logger.info('Move action successful', {
      playerId,
      from: oldPosition,
      to: toPositionArray // Log the array used
    })
    return true
  }

  // Roll action
  roll() {
    logger.info('Attempting roll action')
    if (this.gamePhase !== 'playing') {
      logger.warn('Roll action attempted in wrong phase', {
        currentPhase: this.gamePhase,
        requiredPhase: 'playing'
      })
      return false
    }

    // Simulate dice roll (1-6)
    const result = Math.floor(Math.random() * 6) + 1
    logger.info('Dice roll result', { result })
    
    // Apply roll result
    let success = false
    switch (result) {
      case 1: // Grapple up 1 space
        success = this.handleGrapple(1)
        break
      case 2: // Grapple up 2 spaces
        success = this.handleGrapple(2)
        break
      case 3: // Wind push
        success = this.handleWind()
        break
      default:
        success = true
    }

    logger.info('Roll action completed', { result, success })
    return success
  }

  // Handle grapple action
  handleGrapple(spaces) {
    logger.info('Handling grapple action', { spaces })
    const player = this.players.get(this.currentPlayer)
    if (!player) {
      logger.error('Player not found for grapple action', { currentPlayer: this.currentPlayer })
      return false
    }

    // 50% chance of successful grapple
    if (Math.random() > 0.5) {
      logger.info('Grapple action failed', { spaces })
      return false
    }

    // Move player up
    const newPosition = [...player.position]
    newPosition[1] += spaces
    const success = this.move(this.currentPlayer, newPosition)
    logger.info('Grapple action completed', { spaces, success })
    return success
  }

  // Handle wind action
  handleWind() {
    logger.info('Handling wind action')
    const player = this.players.get(this.currentPlayer)
    if (!player) {
      logger.error('Player not found for wind action', { currentPlayer: this.currentPlayer })
      return false
    }

    // Push all players in a random cardinal direction
    const directions = [
      [1, 0, 0],  // Right
      [-1, 0, 0], // Left
      [0, 0, 1],  // Forward
      [0, 0, -1]  // Backward
    ]
    
    const direction = directions[Math.floor(Math.random() * directions.length)]
    logger.info('Wind direction selected', { direction })
    
    let movedPlayers = 0
    for (const [id, p] of this.players) {
      const oldPosition = [...p.position]
      const newPosition = [
        p.position[0] + direction[0],
        p.position[1],
        p.position[2] + direction[2]
      ]
      
      if (this.isValidMove(p.position, newPosition)) {
        p.position = newPosition
        movedPlayers++
        logger.info('Player moved by wind', {
          playerId: id,
          from: oldPosition,
          to: newPosition
        })
      }
    }

    logger.info('Wind action completed', { movedPlayers })
    return true
  }

  // Validate move
  isValidMove(from, to) {
    logger.info('Validating move', { from, to })
    // Check if move is within one space in any direction
    const dx = Math.abs(to[0] - from[0])
    const dy = Math.abs(to[1] - from[1])
    const dz = Math.abs(to[2] - from[2])

    if (dx > 1 || dy > 1 || dz > 1) {
      logger.info('Move validation failed: distance too far', { dx, dy, dz })
      return false
    }

    // Check if destination is occupied
    for (const player of this.players.values()) {
      if (player.position[0] === to[0] &&
          player.position[1] === to[1] &&
          player.position[2] === to[2]) {
        logger.info('Move validation failed: destination occupied', {
          byPlayer: player.id,
          position: to
        })
        return false
      }
    }

    logger.info('Move validation successful')
    return true
  }

  // End turn
  endTurn() {
    logger.info('Ending turn', { currentPlayer: this.currentPlayer })
    const nextPlayer = this.currentPlayer % this.players.size + 1
    this.currentPlayer = nextPlayer

    // Update state machine if attached
    if (this.stateMachine) {
      const stateData = this.stateMachine.getStateData()
      this.stateMachine.updateStateData({
        ...stateData,
        currentPlayerId: nextPlayer.toString(),
        moveHistory: [...stateData.moveHistory, {
          type: 'endTurn',
          playerId: this.currentPlayer,
          nextPlayerId: nextPlayer,
          timestamp: Date.now()
        }]
      })
    }

    logger.info('Turn ended', { nextPlayer })
    return true
  }

  // Check for game over conditions
  checkGameOver() {
    // Implement your game over conditions here
    const isGameOver = false // Replace with actual logic

    if (isGameOver && this.stateMachine) {
      this.stateMachine.transitionTo('gameOver')
    }

    return isGameOver
  }
} 