import { logger } from '../../utils/logger';
import { gameConfig } from '../../config/GameConfig';
import { boardState, Position, BoardObject } from '../BoardStateManager';

export interface BuildValidationResult {
  isValid: boolean;
  reason?: string;
}

export class BuildValidator {
  private static instance: BuildValidator;

  private constructor() {
    logger.info('Build validator initialized');
  }

  public static getInstance(): BuildValidator {
    if (!BuildValidator.instance) {
      BuildValidator.instance = new BuildValidator();
    }
    return BuildValidator.instance;
  }

  /**
   * Gets all valid positions where a cube can be built from the player's position
   */
  public getValidBuildPositions(playerPos: Position): Position[] {
    logger.info('Getting valid build positions from', { playerPos });
    
    const validPositions: Position[] = [];
    const directions = gameConfig.getConfig().movement.allowedDirections;

    // Check each cardinal direction
    for (const direction of directions) {
      const targetX = Math.round((playerPos.x + direction.x) * 2) / 2;
      const targetZ = Math.round((playerPos.z + direction.z) * 2) / 2;

      // Check if target is within board bounds
      if (!this.isWithinBounds({ x: targetX, y: 0, z: targetZ })) {
        continue;
      }

      // Get all objects at target position
      const targetObjects = boardState.getObjectsAt(targetX, targetZ);
      const targetTopObject = boardState.getTopObject(targetX, targetZ);

      logger.info('Checking build position', {
        targetX,
        targetZ,
        targetObjects,
        targetTopObject
      });

      // Cannot build if there's a player at this position
      const hasPlayer = targetObjects.some(obj => obj.type === 'player');
      if (hasPlayer) {
        logger.info('Cannot build: Position occupied by player', { targetX, targetZ });
        continue;
      }

      // Calculate the height for the new cube
      // If there's a cube, build on top of it (height + 1)
      // If it's ground, build at height 1
      const newCubeHeight = targetTopObject?.type === 'cube' ? targetTopObject.height + 1 : 1;

      logger.info('Height calculation', {
        targetTopObject,
        newCubeHeight,
        hasExistingCube: targetTopObject?.type === 'cube'
      });

      // Check if height difference is within build limits
      const config = gameConfig.getConfig();
      if (config.build.maxBuildHeight > 0 && 
          newCubeHeight > config.build.maxBuildHeight) {
        logger.info('Cannot build: Exceeds maximum height', {
          newCubeHeight,
          maxBuildHeight: config.build.maxBuildHeight
        });
        continue;
      }

      // If we reach here, we can build at this position
      const validPosition: Position = {
        x: targetX,
        y: newCubeHeight,
        z: targetZ
      };

      validPositions.push(validPosition);
      logger.info('Valid build position found', { 
        validPosition,
        targetTopObject,
        newCubeHeight,
        direction
      });
    }

    logger.info('Valid build positions complete', { 
      playerPos,
      validPositions,
      count: validPositions.length
    });

    return validPositions;
  }

  /**
   * Validates if a build action at the target position is valid
   */
  public validateBuild(
    playerPos: Position,
    targetPos: Position,
    boardState: Map<string, Position>,
    playerPositions: Map<string, Position>
  ): BuildValidationResult {
    logger.info('Validating build action', {
      playerPos,
      targetPos
    });

    // Check if target position is occupied by a player
    if (this.isPositionOccupied(targetPos, playerPositions)) {
      return {
        isValid: false,
        reason: 'Cannot build where a player is standing'
      };
    }

    // Check if the build location is adjacent to player
    if (!this.isAdjacentToPlayer(playerPos, targetPos)) {
      return {
        isValid: false,
        reason: 'Build location must be adjacent to player'
      };
    }

    // Check if the build height is valid
    const currentHeight = this.getHeightAtPosition(targetPos, boardState);
    const config = gameConfig.getConfig();
    
    if (config.build.maxBuildHeight > 0 && 
        currentHeight >= config.build.maxBuildHeight) {
      return {
        isValid: false,
        reason: 'Maximum build height exceeded'
      };
    }

    return { isValid: true };
  }

  private isPositionOccupied(
    position: Position,
    playerPositions: Map<string, Position>
  ): boolean {
    return Array.from(playerPositions.values()).some(
      pos => pos.x === position.x && pos.z === position.z
    );
  }

  private isAdjacentToPlayer(
    playerPos: Position,
    buildPos: Position
  ): boolean {
    const dx = Math.abs(buildPos.x - playerPos.x);
    const dz = Math.abs(buildPos.z - playerPos.z);
    
    // Must be exactly one unit away in either x or z direction
    return (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
  }

  private getHeightAtPosition(
    pos: Position,
    boardState: Map<string, Position>
  ): number {
    return Array.from(boardState.values())
      .filter(cube => cube.x === pos.x && cube.z === pos.z)
      .reduce((maxHeight, cube) => Math.max(maxHeight, cube.y), 0);
  }

  private isWithinBounds(pos: Position): boolean {
    const config = gameConfig.getConfig();
    return (
      pos.x >= -config.board.size/2 &&
      pos.x <= config.board.size/2 &&
      pos.z >= -config.board.size/2 &&
      pos.z <= config.board.size/2
    );
  }

  /**
   * Validates if a build at target position is valid from source position
   */
  public validateBuildPosition(sourcePos: Position, targetPos: Position): boolean {
    logger.info('Validating build position', { sourcePos, targetPos });

    const reason = this.getInvalidBuildReason(sourcePos, targetPos);
    if (reason) {
      logger.warn('Invalid build position', { reason, sourcePos, targetPos });
      return false;
    }

    return true;
  }

  private getInvalidBuildReason(sourcePos: Position, targetPos: Position): string | null {
    // Check if target is within board bounds
    if (!this.isWithinBounds(targetPos)) {
      return 'Target position is out of bounds';
    }

    const config = gameConfig.getConfig();

    // Check if target requires adjacent position
    if (config.build.requireAdjacent) {
      const dx = Math.abs(targetPos.x - sourcePos.x);
      const dz = Math.abs(targetPos.z - sourcePos.z);
      if (dx > 1 || dz > 1 || (dx === 1 && dz === 1)) {
        return 'Build position must be adjacent to player';
      }
    }

    // Get top objects at source and target positions
    const sourceTopObject = boardState.getTopObject(sourcePos.x, sourcePos.z);
    const targetTopObject = boardState.getTopObject(targetPos.x, targetPos.z);

    const sourceHeight = sourceTopObject?.height || 0;
    const targetHeight = targetTopObject?.height || 0;
    const heightDiff = targetHeight - sourceHeight;

    // Check if height difference is within allowed range
    if (config.build.maxBuildHeight > 0 && heightDiff > config.build.maxBuildHeight) {
      return `Height difference ${heightDiff} exceeds max build height ${config.build.maxBuildHeight}`;
    }

    // Check if target position is occupied by a player
    const targetObjects = boardState.getObjectsAt(targetPos.x, targetPos.z);
    if (targetObjects.some(obj => obj.type === 'player')) {
      return 'Target position is occupied by a player';
    }

    return null;
  }
} 