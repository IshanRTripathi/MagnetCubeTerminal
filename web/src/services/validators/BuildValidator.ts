import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { gameConfig } from '../../config/GameConfig';
import { boardState, Position } from '../BoardStateManager';
import { HeightCalculator } from '../utils/HeightCalculator';
import { BuildPositionCalculator } from './BuildPositionCalculator';

export interface BuildValidationResult {
  isValid: boolean;
  reason?: string;
}
 
export class BuildValidator {
  private static instance: BuildValidator;
  private heightCalculator: HeightCalculator;
  private positionCalculator: BuildPositionCalculator;

  private constructor() {
    this.heightCalculator = HeightCalculator.getInstance();
    this.positionCalculator = BuildPositionCalculator.getInstance();
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
    return this.positionCalculator.getValidBuildPositions(playerPos);
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

  /**
   * Validates if a build at target position is valid from source position
   */
  public validateBuildPosition(sourcePos: Position, targetPos: Position): boolean {
    logger.info('Validating build position', { sourcePos, targetPos });

    // Check if target is within board bounds
    if (!this.positionCalculator['isWithinBounds'](targetPos)) {
      logger.warn('Invalid build position: Out of bounds', { targetPos });
      return false;
    }

    // Get objects at the target position
    const targetObjects = boardState.getObjectsAt(targetPos.x, targetPos.z);
    
    // Check for players at or above the target height
    if (this.heightCalculator.hasPlayerAtHeight(targetPos.x, targetPos.z, targetPos.y)) {
      logger.warn('Invalid build position: Player at or above target height', { targetPos });
      return false;
    }

    // Get cubes at this position, sorted by height
    const cubes = targetObjects
      .filter(obj => obj.type === 'cube')
      .sort((a, b) => b.height - a.height);

    // If building on ground (no cubes)
    if (cubes.length === 0) {
      // Check if there are adjacent cubes
      const adjacentPositions = [
        { x: targetPos.x + 1, z: targetPos.z },
        { x: targetPos.x - 1, z: targetPos.z },
        { x: targetPos.x, z: targetPos.z + 1 },
        { x: targetPos.x, z: targetPos.z - 1 }
      ];

      const hasAdjacentCube = adjacentPositions.some(pos => {
        const adjObjects = boardState.getObjectsAt(pos.x, pos.z);
        return adjObjects.some(obj => obj.type === 'cube');
      });

      if (!hasAdjacentCube) {
        logger.warn('Invalid build position: No adjacent cubes for ground build', { targetPos });
        return false;
      }

      // For ground builds, height must be 1
      if (targetPos.y !== 1) {
        logger.warn('Invalid build position: Ground builds must be at height 1', { targetPos });
        return false;
      }

      return true;
    }

    // Building on top of existing cubes
    const expectedHeight = this.heightCalculator.getExpectedHeight(targetPos.x, targetPos.z);

    if (targetPos.y !== expectedHeight) {
      logger.warn('Invalid build position: Must build at height one above highest cube', { 
        targetPos, 
        expectedHeight 
      });
      return false;
    }

    return true;
  }

  private isPositionOccupied(
    position: Position,
    playerPositions: Map<string, Position>
  ): boolean {
    return Array.from(playerPositions.values()).some(
      pos => pos.x === position.x && pos.z === position.z
    );
  }

  private getHeightAtPosition(
    pos: Position,
    boardState: Map<string, Position>
  ): number {
    return Array.from(boardState.values())
      .filter(cube => cube.x === pos.x && cube.z === pos.z)
      .reduce((maxHeight, cube) => Math.max(maxHeight, cube.y), 0);
  }
} 