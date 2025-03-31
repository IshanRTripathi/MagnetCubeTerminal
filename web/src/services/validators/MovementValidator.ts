import { logger } from '../../utils/logger';
import { gameConfig } from '../../config/GameConfig';
import { Vector3 } from 'three';

export interface Position {
  x: number;
  y: number;
  z: number;
}

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
   * Validates if a move from current position to target position is valid
   * @param currentPos Current position of the player
   * @param targetPos Target position to move to
   * @param boardState Current state of the game board
   * @param playerPositions Positions of all players
   */
  public validateMove(
    currentPos: Position,
    targetPos: Position,
    boardState: Map<string, Position>,
    playerPositions: Map<string, Position>
  ): MoveValidationResult {
    logger.info('Validating move', { 
      from: currentPos, 
      to: targetPos 
    });

    // Check if target position is occupied by another player
    if (this.isPositionOccupied(targetPos, playerPositions)) {
      return {
        isValid: false,
        reason: 'Position is occupied by another player'
      };
    }

    // Check if move is in allowed direction
    if (!this.isValidDirection(currentPos, targetPos)) {
      return {
        isValid: false,
        reason: 'Invalid movement direction'
      };
    }

    // Check height difference
    const heightDifference = this.getHeightDifference(currentPos, targetPos, boardState);
    if (!this.isValidHeightDifference(heightDifference)) {
      return {
        isValid: false,
        reason: 'Invalid height difference'
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

  private isValidDirection(from: Position, to: Position): boolean {
    const dx = Math.abs(to.x - from.x);
    const dz = Math.abs(to.z - from.z);
    
    // Only one coordinate should change by 1
    return (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
  }

  private getHeightDifference(
    from: Position,
    to: Position,
    boardState: Map<string, Position>
  ): number {
    const fromHeight = this.getHeightAtPosition(from, boardState);
    const toHeight = this.getHeightAtPosition(to, boardState);
    return toHeight - fromHeight;
  }

  private getHeightAtPosition(
    pos: Position,
    boardState: Map<string, Position>
  ): number {
    // Find the highest cube at this x,z coordinate
    return Array.from(boardState.values())
      .filter(cube => cube.x === pos.x && cube.z === pos.z)
      .reduce((maxHeight, cube) => Math.max(maxHeight, cube.y), 0);
  }

  private isValidHeightDifference(heightDiff: number): boolean {
    const config = gameConfig.getConfig();
    
    // Moving up
    if (heightDiff > 0) {
      return heightDiff <= config.movement.maxClimbHeight;
    }
    
    // Moving down
    if (heightDiff < 0) {
      return config.movement.maxDescendHeight === 0 || 
             Math.abs(heightDiff) <= config.movement.maxDescendHeight;
    }

    // Same height
    return true;
  }

  /**
   * Gets all valid moves from a given position
   * @param currentPos Current position of the player
   * @param boardState Current state of the game board
   * @param playerPositions Positions of all players
   */
  public getValidMoves(
    currentPos: Position,
    boardState: Map<string, Position>,
    playerPositions: Map<string, Position>
  ): Position[] {
    const validMoves: Position[] = [];
    const directions = [
      { x: 1, z: 0 },  // East
      { x: -1, z: 0 }, // West
      { x: 0, z: 1 },  // North
      { x: 0, z: -1 }  // South
    ];

    for (const dir of directions) {
      // Get the base position
      const targetX = currentPos.x + dir.x;
      const targetZ = currentPos.z + dir.z;

      // Get the height of cubes at this position
      const baseHeight = Array.from(boardState.values())
        .filter(cube => cube.x === targetX && cube.z === targetZ)
        .reduce((maxHeight, cube) => Math.max(maxHeight, cube.y), 0);

      // Add 0.5 units to the height if there's a cube (for the top face)
      const targetY = baseHeight + (baseHeight > 0 ? 0.5 : 0);

      const targetPos = {
        x: targetX,
        y: targetY,
        z: targetZ
      };

      if (this.validateMove(currentPos, targetPos, boardState, playerPositions).isValid) {
        validMoves.push(targetPos);
        logger.debug('Added valid move position', { 
          targetPos,
          baseHeight,
          hasCube: baseHeight > 0
        });
      }
    }

    logger.info('Valid moves calculated', { 
      currentPos, 
      validMoves 
    });

    return validMoves;
  }
} 