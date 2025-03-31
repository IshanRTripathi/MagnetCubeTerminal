import { logger } from '../../utils/logger';
import { gameConfig } from '../../config/GameConfig';
import { Position } from './MovementValidator';

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
   * Validates if a build action at the target position is valid
   * @param playerPos Current position of the player attempting to build
   * @param targetPos Position where the player wants to build
   * @param boardState Current state of the game board
   * @param playerPositions Positions of all players
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

  /**
   * Gets all valid build positions from the player's current position
   * @param playerPos Current position of the player
   * @param boardState Current state of the game board
   * @param playerPositions Positions of all players
   */
  public getValidBuildPositions(
    playerPos: Position,
    boardState: Map<string, Position>,
    playerPositions: Map<string, Position>
  ): Position[] {
    const validPositions: Position[] = [];
    const directions = [
      { x: 1, z: 0 },  // East
      { x: -1, z: 0 }, // West
      { x: 0, z: 1 },  // North
      { x: 0, z: -1 }  // South
    ];

    const currentHeight = this.getHeightAtPosition(playerPos, boardState);

    for (const dir of directions) {
      const targetPos = {
        x: playerPos.x + dir.x,
        y: currentHeight,  // Start at current height level
        z: playerPos.z + dir.z
      };

      if (this.validateBuild(playerPos, targetPos, boardState, playerPositions).isValid) {
        validPositions.push(targetPos);
      }
    }

    logger.info('Valid build positions calculated', {
      playerPos,
      validPositions
    });

    return validPositions;
  }
} 