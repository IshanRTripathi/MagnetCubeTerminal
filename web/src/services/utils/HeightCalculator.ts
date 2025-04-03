import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { Position, BoardObject } from '../BoardStateManager';
import { boardState } from '../BoardStateManager';

export class HeightCalculator {
  private static instance: HeightCalculator;

  private constructor() {
    logger.info('Height calculator initialized');
  }

  public static getInstance(): HeightCalculator {
    if (!HeightCalculator.instance) {
      HeightCalculator.instance = new HeightCalculator();
    }
    return HeightCalculator.instance;
  }

  /**
   * Calculates the height for a new cube at the given position
   */
  public calculateBuildHeight(x: number, z: number): number {
    const targetObjects = boardState.getObjectsAt(x, z);
    const targetTopObject = boardState.getTopObject(x, z);

    // If there's a cube, build on top of it (height + 1)
    // If it's ground, build at height 1
    return targetTopObject?.type === 'cube' ? targetTopObject.height + 1 : 1;
  }

  /**
   * Gets the expected height for building on top of existing cubes
   */
  public getExpectedHeight(x: number, z: number): number {
    const targetObjects = boardState.getObjectsAt(x, z);
    const cubes = targetObjects
      .filter(obj => obj.type === 'cube')
      .sort((a, b) => b.height - a.height);

    if (cubes.length === 0) {
      return 1; // Ground build
    }

    return cubes[0].height + 1; // Build on top of highest cube
  }

  /**
   * Checks if a position has a player at or above the given height
   */
  public hasPlayerAtHeight(x: number, z: number, height: number): boolean {
    const targetObjects = boardState.getObjectsAt(x, z);
    return targetObjects.some(obj => 
      obj.type === 'player' && obj.height >= height
    );
  }
} 