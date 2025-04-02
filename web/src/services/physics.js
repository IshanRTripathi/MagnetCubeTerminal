import { Vector3 } from 'three'
import { logger } from '../utils/logger'
import { Singleton } from '../utils/Singleton'

const MIN_DISTANCE = 0.5 // Minimum distance for collision detection
const MAX_HEIGHT = 5    // Maximum build height

export class MagneticPhysics {
  static getInstance() {
    return Singleton.getInstance(MagneticPhysics)
  }

  constructor() {
    logger.info('Initializing MagneticPhysics')
    this.cubes = new Map()
    this.disposed = false
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    logger.info('Initializing physics system')
    this.initialized = true
    this.disposed = false
  }

  addCube(cubeId, position) {
    if (this.disposed || !this.initialized) return

    const newPosition = new Vector3(...position)
    
    // Normalize to grid
    newPosition.x = Math.round(newPosition.x * 2) / 2
    newPosition.y = Math.round(newPosition.y)
    newPosition.z = Math.round(newPosition.z * 2) / 2
    
    this.cubes.set(cubeId, newPosition)
    logger.debug('Added cube to physics', { cubeId, position: newPosition })
  }

  removeCube(cubeId) {
    if (this.disposed || !this.initialized) return
    this.cubes.delete(cubeId)
    logger.debug('Removed cube from physics', { cubeId })
  }

  getCubePosition(cubeId) {
    if (this.disposed || !this.initialized) return null

    const position = this.cubes.get(cubeId)
    if (!position) {
      logger.warn('Attempted to get position of non-existent cube', { cubeId })
      return null
    }
    return position.toArray()
  }

  isValidPlacement(position, playerPosition) {
    if (this.disposed || !this.initialized) {
      logger.warn('Physics system not ready');
      return false;
    }

    const pos = new Vector3(...position)
    const playerPos = new Vector3(...playerPosition)
    
    // Normalize to grid
    pos.x = Math.round(pos.x * 2) / 2
    pos.y = Math.round(pos.y)
    pos.z = Math.round(pos.z * 2) / 2

    logger.debug('Checking build position', { 
      normalized: pos.toArray(),
      original: position,
      playerPosition: playerPos.toArray()
    });

    // 1. Check height limit
    if (pos.y > MAX_HEIGHT) {
      logger.warn('Build position exceeds maximum height', { 
        height: pos.y,
        maxHeight: MAX_HEIGHT 
      });
      return false;
    }

    // 2. Check for exact position collision
    for (const [cubeId, cubePos] of this.cubes) {
      if (Math.abs(pos.x - cubePos.x) < MIN_DISTANCE &&
          Math.abs(pos.y - cubePos.y) < MIN_DISTANCE &&
          Math.abs(pos.z - cubePos.z) < MIN_DISTANCE) {
        logger.warn('Position already occupied', { 
          position: pos.toArray(),
          existingCube: cubeId 
        });
        return false;
      }
    }

    // 4. Check for support (must have cube below except at y=0)
    if (pos.y > 0) {
      let hasSupport = false;
      for (const [cubeId, cubePos] of this.cubes) {
        // Check for cube directly below
        if (Math.abs(pos.x - cubePos.x) < MIN_DISTANCE &&
            Math.abs(pos.z - cubePos.z) < MIN_DISTANCE &&
            Math.abs(pos.y - (cubePos.y + 1)) < MIN_DISTANCE) {
          hasSupport = true;
          break;
        }
      }
      if (!hasSupport) {
        logger.warn('No supporting cube found below position', { 
          position: pos.toArray() 
        });
        return false;
      }
    }

    logger.info('Position valid for build', { 
      position: pos.toArray(),
      playerPosition: playerPos.toArray()
    });
    return true;
  }

  dispose() {
    if (this.disposed) return

    logger.info('Disposing physics system')
    this.disposed = true
    this.initialized = false
    this.cubes.clear()
  }
} 