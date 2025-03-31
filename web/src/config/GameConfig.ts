import { logger } from '../utils/logger';

export interface Direction {
  x: number;
  z: number;
}

export interface MovementConfig {
  maxClimbHeight: number;      // Maximum height a player can climb (default: 1)
  maxDescendHeight: number;    // Maximum height a player can descend (default: 0 for unlimited)
  allowedDirections: Direction[]; // Array of allowed movement directions
}

export interface BuildConfig {
  maxBuildHeight: number;      // Maximum height difference for building (0 for unlimited)
  requireAdjacent: boolean;    // Whether building requires adjacent position
}

export interface HighlightConfig {
  moveHighlightColor: string;  // Color for movement highlights
  buildHighlightColor: string; // Color for build highlights
  particleEffect: boolean;     // Whether to show particle effects
}

export interface BoardConfig {
  size: number;               // Size of the board (NxN)
}

export interface GameConfig {
  movement: MovementConfig;
  build: BuildConfig;
  highlight: HighlightConfig;
  board: BoardConfig;
}

class GameConfigManager {
  private static instance: GameConfigManager;
  private config: GameConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
    logger.info('Game configuration initialized with default values');
  }

  public static getInstance(): GameConfigManager {
    if (!GameConfigManager.instance) {
      GameConfigManager.instance = new GameConfigManager();
    }
    return GameConfigManager.instance;
  }

  private getDefaultConfig(): GameConfig {
    return {
      movement: {
        maxClimbHeight: 1,
        maxDescendHeight: 0, // 0 means unlimited
        allowedDirections: [
          { x: 0, z: 1 },  // north
          { x: 0, z: -1 }, // south
          { x: 1, z: 0 },  // east
          { x: -1, z: 0 }  // west
        ]
      },
      build: {
        maxBuildHeight: 0, // 0 means unlimited
        requireAdjacent: true
      },
      highlight: {
        moveHighlightColor: '#ffffff',
        buildHighlightColor: '#00ff00',
        particleEffect: true
      },
      board: {
        size: 8 // Default 8x8 board
      }
    };
  }

  public getConfig(): GameConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<GameConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    logger.info('Game configuration updated', { newConfig });
  }

  public validateConfig(): boolean {
    const isValid = 
      this.config.movement.maxClimbHeight >= 0 &&
      this.config.movement.maxDescendHeight >= 0 &&
      this.config.movement.allowedDirections.length > 0 &&
      this.config.build.maxBuildHeight >= 0 &&
      this.config.board.size > 0;

    if (!isValid) {
      logger.error('Invalid game configuration detected', { config: this.config });
    }

    return isValid;
  }
}

export const gameConfig = GameConfigManager.getInstance(); 