import { Vector3 } from 'three'
import { logger } from '../utils/logger'

const MIN_DISTANCE = 1.0 // Minimum distance between cube centers (1 unit = 1 cube width)

export class MagneticPhysics {
  static instance = null;

  static getInstance() {
    if (!MagneticPhysics.instance) {
      MagneticPhysics.instance = new MagneticPhysics();
    }
    return MagneticPhysics.instance;
  }

  constructor() {
    if (MagneticPhysics.instance) {
      return MagneticPhysics.instance;
    }

    logger.info('Initializing MagneticPhysics')
    this.cubes = new Map() // Store cube positions
    this.disposed = false
    this.initialized = false

    MagneticPhysics.instance = this
  }

  init() {
    if (this.initialized) return
    logger.info('Initializing physics system')
    this.initialized = true
    this.disposed = false
  }

  // Add a cube to the system
  addCube(cubeId, position) {
    if (this.disposed || !this.initialized) return

    const newPosition = new Vector3(...position)
    
    // Round position to nearest grid point
    newPosition.x = Math.round(newPosition.x)
    newPosition.y = Math.round(newPosition.y)
    newPosition.z = Math.round(newPosition.z)
    
    this.cubes.set(cubeId, newPosition)
  }

  // Remove a cube from the system
  removeCube(cubeId) {
    if (this.disposed || !this.initialized) return
    this.cubes.delete(cubeId)
  }

  // Get current position of a cube
  getCubePosition(cubeId) {
    if (this.disposed || !this.initialized) return null

    const position = this.cubes.get(cubeId)
    if (!position) {
      logger.warn('Attempted to get position of non-existent cube', { cubeId })
      return null
    }
    return position.toArray()
  }

  // Check if a position is valid for cube placement
  isValidPlacement(position) {
    if (this.disposed || !this.initialized) return false

    const pos = new Vector3(...position)
    
    // Round position to nearest grid point
    pos.x = Math.round(pos.x)
    pos.y = Math.round(pos.y)
    pos.z = Math.round(pos.z)
    
    // Check if position is too close to other cubes
    for (const [cubeId, cubePos] of this.cubes) {
      const distance = pos.distanceTo(cubePos)
      if (distance < MIN_DISTANCE) {
        return false
      }
    }

    return true
  }

  // Clean up physics system
  dispose() {
    if (this.disposed) return

    logger.info('Disposing physics system')
    this.disposed = true
    this.initialized = false
    this.cubes.clear()
    MagneticPhysics.instance = null
  }
} 