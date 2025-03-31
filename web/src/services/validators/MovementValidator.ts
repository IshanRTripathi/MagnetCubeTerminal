import { logger } from '../../utils/logger';
import { gameConfig } from '../../config/GameConfig';
import { boardState, Position, BoardObject } from '../BoardStateManager';

export interface MoveValidationResult {
  isValid: boolean;
  reason?: string;
}

export class MovementValidator {
  private static instance: MovementValidator;

  private constructor() {
    logger.info('Movement validator initialized');
  }

  public static getInstance(): MovementValidator {
    if (!MovementValidator.instance) {
      MovementValidator.instance = new MovementValidator();
    }
    return MovementValidator.instance;
  }

  /**
   * Gets all valid moves for a player at the given position
   */
  public getValidMoves(playerPos: Position): Position[] {
    logger.info('Getting valid moves from position', { playerPos });
    
    const validMoves: Position[] = [];
    const directions = gameConfig.getConfig().movement.allowedDirections;
    
    // Get the source position's top object (where the player is)
    const sourceObjects = boardState.getObjectsAt(playerPos.x, playerPos.z);
    const sourceTopObject = boardState.getTopObject(playerPos.x, playerPos.z);
    const sourceHeight = sourceTopObject?.height || 0;

    logger.info('Source position details', { 
      sourceObjects,
      sourceTopObject,
      sourceHeight,
      playerPos 
    });

    // Check each cardinal direction
    for (const direction of directions) {
      const targetX = Math.round((playerPos.x + direction.x) * 2) / 2;
      const targetZ = Math.round((playerPos.z + direction.z) * 2) / 2;

      logger.info('Checking direction', {
        direction,
        targetX,
        targetZ,
        originalX: playerPos.x + direction.x,
        originalZ: playerPos.z + direction.z
      });

      // Check if target is within board bounds
      if (!this.isWithinBounds({ x: targetX, y: 0, z: targetZ })) {
        logger.info('Position out of bounds', { targetX, targetZ });
        continue;
      }

      // Get all objects and top object at target position
      const targetObjects = boardState.getObjectsAt(targetX, targetZ);
      const targetTopObject = boardState.getTopObject(targetX, targetZ);
      
      // If there's a cube, the player will be on top of it
      const hasCube = targetObjects.some(obj => obj.type === 'cube');
      const targetHeight = hasCube ? 1 : 0; // If there's a cube, player will be at height 1

      logger.info('Target position details', {
        targetX,
        targetZ,
        targetObjects,
        targetTopObject,
        hasCube,
        targetHeight,
        heightDifference: targetHeight - sourceHeight
      });

      // Check if target position is occupied by a player
      const hasPlayer = targetObjects.some(obj => obj.type === 'player');

      if (hasPlayer) {
        logger.info('Target position occupied by player', { 
          targetX, 
          targetZ,
          objects: targetObjects 
        });
        continue;
      }

      // Calculate height difference
      const heightDiff = targetHeight - sourceHeight;
      const config = gameConfig.getConfig();

      // Check if height difference is within allowed range
      if (heightDiff > config.movement.maxClimbHeight) {
        logger.info('Height difference too large to climb', { 
          sourceHeight,
          targetHeight,
          heightDiff,
          maxClimbHeight: config.movement.maxClimbHeight 
        });
        continue;
      }

      if (config.movement.maxDescendHeight > 0 && 
          -heightDiff > config.movement.maxDescendHeight) {
        logger.info('Height difference too large to descend', { 
          sourceHeight,
          targetHeight,
          heightDiff,
          maxDescendHeight: config.movement.maxDescendHeight 
        });
        continue;
      }

      // If we reach here, the move is valid
      const validMove: Position = {
        x: targetX,
        y: targetHeight, // Player will be at height 1 if moving onto a cube
        z: targetZ
      };

      validMoves.push(validMove);
      logger.info('Valid move found', { 
        validMove,
        sourceHeight,
        targetHeight,
        heightDiff,
        hasCube 
      });
    }

    logger.info('Valid moves calculation complete', { 
      playerPos,
      validMoves,
      count: validMoves.length
    });

    return validMoves;
  }

  /**
   * Validates if a move from source to target position is valid
   */
  public validateMove(sourcePos: Position, targetPos: Position): boolean {
    logger.info('Validating move', { sourcePos, targetPos });

    const reason = this.getInvalidMoveReason(sourcePos, targetPos);
    if (reason) {
      logger.warn('Invalid move', { reason, sourcePos, targetPos });
      return false;
    }

    return true;
  }

  private getInvalidMoveReason(sourcePos: Position, targetPos: Position): string | null {
    // Check if target is within board bounds
    if (!this.isWithinBounds(targetPos)) {
      return 'Target position is out of bounds';
    }

    // Get top objects at source and target positions
    const sourceTopObject = boardState.getTopObject(sourcePos.x, sourcePos.z);
    const targetTopObject = boardState.getTopObject(targetPos.x, targetPos.z);

    const sourceHeight = sourceTopObject?.height || 0;
    const targetHeight = targetTopObject?.height || 0;
    const heightDiff = targetHeight - sourceHeight;

    const config = gameConfig.getConfig();
    // Check if height difference is within allowed range
    if (heightDiff > config.movement.maxClimbHeight) {
      return `Height difference ${heightDiff} exceeds max climb height ${config.movement.maxClimbHeight}`;
    }
    if (-heightDiff > config.movement.maxDescendHeight) {
      return `Height difference ${-heightDiff} exceeds max descend height ${config.movement.maxDescendHeight}`;
    }

    // Check if target position is occupied by another player
    const targetObjects = boardState.getObjectsAt(targetPos.x, targetPos.z);
    if (targetObjects.some(obj => obj.type === 'player')) {
      return 'Target position is occupied by another player';
    }

    return null;
  }

  private isWithinBounds(pos: Position): boolean {
    const config = gameConfig.getConfig();
    const result = (
      pos.x >= -config.board.size/2 &&
      pos.x <= config.board.size/2 &&
      pos.z >= -config.board.size/2 &&
      pos.z <= config.board.size/2
    );

    logger.info('Bounds check', { 
      position: pos, 
      boardSize: config.board.size,
      isWithinBounds: result 
    });

    return result;
  }
} 