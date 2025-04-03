import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { gameConfig } from '../../config/GameConfig';
import { boardState, Position } from '../BoardStateManager';
import { HeightCalculator } from '../utils/HeightCalculator';

export class BuildPositionCalculator {
  private static instance: BuildPositionCalculator;
  private heightCalculator: HeightCalculator;

  private constructor() {
    this.heightCalculator = HeightCalculator.getInstance();
    logger.info('Build position calculator initialized');
  }

  public static getInstance(): BuildPositionCalculator {
    if (!BuildPositionCalculator.instance) {
      BuildPositionCalculator.instance = new BuildPositionCalculator();
    }
    return BuildPositionCalculator.instance;
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

      // Calculate the height for the new cube
      const newCubeHeight = this.heightCalculator.calculateBuildHeight(targetX, targetZ);

      // Check for players at or above the target height
      if (this.heightCalculator.hasPlayerAtHeight(targetX, targetZ, newCubeHeight)) {
        logger.info('Cannot build: Player at or above target height', { 
          targetX, 
          targetZ, 
          newCubeHeight 
        });
        continue;
      }

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

  private isWithinBounds(pos: Position): boolean {
    const config = gameConfig.getConfig();
    return (
      pos.x >= -config.board.size/2 &&
      pos.x <= config.board.size/2 &&
      pos.z >= -config.board.size/2 &&
      pos.z <= config.board.size/2
    );
  }
} 