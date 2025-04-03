import { Position } from '../BoardStateManager';
import { Scene } from 'three';
import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { gameConfig } from '../../config/GameConfig';

export interface HighlightOptions {
  color: string;
  opacity?: number;
  particleEffect?: boolean;
}

export interface ActionValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface IActionStrategy {
  getValidPositions(sourcePos: Position): Position[];
  validateAction(sourcePos: Position, targetPos: Position): ActionValidationResult;
  highlightValidPositions(positions: Position[], scene: Scene, options?: HighlightOptions): void;
  clearHighlights(scene: Scene): void;
}

export abstract class BaseActionStrategy implements IActionStrategy {
  protected constructor() {
    logger.info(`${this.constructor.name} strategy initialized`);
  }

  abstract getValidPositions(sourcePos: Position): Position[];
  abstract validateAction(sourcePos: Position, targetPos: Position): ActionValidationResult;
  abstract highlightValidPositions(positions: Position[], scene: Scene, options?: HighlightOptions): void;
  abstract clearHighlights(scene: Scene): void;

  protected isWithinBounds(pos: Position): boolean {
    const config = gameConfig.getConfig();
    return (
      pos.x >= -config.board.size/2 &&
      pos.x <= config.board.size/2 &&
      pos.z >= -config.board.size/2 &&
      pos.z <= config.board.size/2
    );
  }
} 