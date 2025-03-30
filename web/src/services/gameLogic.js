import { logger } from '../utils/logger'
import { MagneticPhysics } from './physics'

export class GameLogic {
  static instance = null

  static getInstance() {
    if (!GameLogic.instance) {
      GameLogic.instance = new GameLogic()
    }
    return GameLogic.instance
  }

  constructor() {
    if (GameLogic.instance) {
      return GameLogic.instance
    }

    logger.info('Initializing GameLogic')
    this.physics = new MagneticPhysics()
    this.currentPlayer = 1
    this.players = new Map()
    this.cubes = new Map()
    this.powerCards = new Map()
    this.gamePhase = 'setup'
    GameLogic.instance = this
  }

  // Initialize the game
  initializeGame(playerCount = 2) {
    logger.info('Initializing game', { playerCount })
    this.gamePhase = 'playing'
    this.currentPlayer = 1
    
    // Initialize players
    for (let i = 1; i <= playerCount; i++) {
      this.players.set(i, {
        id: i,
        position: [0, 1, 0],
        color: this.getPlayerColor(i),
        powerCards: []
      })
      logger.info('Player initialized', { playerId: i, position: [0, 1, 0] })
    }

    // Initialize base cubes
    this.addCube('cube-1', [0, 0, 0])
    this.addCube('cube-2', [1, 0, 0])
    this.addCube('cube-3', [0, 0, 1])
    logger.info('Game initialization complete')
  }

  // Get player color based on ID
  getPlayerColor(playerId) {
    const colors = {
      1: '#ff0000', // Red
      2: '#00ff00', // Green
      3: '#0000ff', // Blue
      4: '#ffff00'  // Yellow
    }
    return colors[playerId] || '#ffffff'
  }

  // Add a cube to the game
  addCube(id, position) {
    logger.info('Adding cube', { id, position })
    this.cubes.set(id, {
      id,
      position,
      color: 'rgba(255, 255, 255, 0.6)'
    })
    this.physics.addCube(id, position)
    logger.info('Cube added successfully', { id, position })
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
    
    // Validate position
    if (!this.physics.isValidPlacement(position)) {
      logger.warn('Invalid build position', { position })
      return false
    }

    // Create new cube
    const cubeId = `cube-${this.cubes.size + 1}`
    this.addCube(cubeId, position)
    logger.info('Build action successful', { cubeId, position })
    return true
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

    // Validate move (implement path finding and rules)
    if (!this.isValidMove(player.position, newPosition)) {
      logger.warn('Invalid move attempted', {
        playerId,
        from: player.position,
        to: newPosition
      })
      return false
    }

    // Update player position
    const oldPosition = [...player.position]
    player.position = newPosition
    logger.info('Move action successful', {
      playerId,
      from: oldPosition,
      to: newPosition
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
    const nextPlayer = (this.currentPlayer % this.players.size) + 1
    this.currentPlayer = nextPlayer
    logger.info('Turn ended', { nextPlayer })
  }

  // Get game state
  getGameState() {
    logger.info('Getting game state')
    return {
      currentPlayer: this.currentPlayer,
      players: Array.from(this.players.values()),
      cubes: Array.from(this.cubes.values()),
      gamePhase: this.gamePhase
    }
  }
} 