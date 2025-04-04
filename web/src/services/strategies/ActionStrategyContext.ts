import { Position } from '../GameBoardManager';
import { Scene } from 'three';
import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { BuildStrategy } from './BuildStrategy';
import { MoveStrategy } from './MoveStrategy';
import { GameConstants } from '../../constants/GameConstants';
import { BaseActionStrategy } from './ActionStrategy';

export type ActionType = typeof GameConstants.ACTION_NONE | 
                        typeof GameConstants.ACTION_BUILD | 
                        typeof GameConstants.ACTION_MOVE | 
                        typeof GameConstants.ACTION_ROLL;

export interface IActionStrategy {
  getValidPositions(sourcePosition: Position): Position[];
  validateAction(sourcePosition: Position, targetPosition: Position): { isValid: boolean; reason?: string };
  highlightValidPositions(positions: Position[], scene: Scene, options?: { color?: string; opacity?: number; particleEffect?: boolean }): void;
  clearHighlights(scene: Scene): void;
}

export class ActionStrategyContext {
  private static instance: ActionStrategyContext;
  private currentStrategy: BaseActionStrategy | null = null;
  private buildStrategy: BuildStrategy;
  private moveStrategy: MoveStrategy;

  private constructor() {
    this.buildStrategy = BuildStrategy.getInstance();
    this.moveStrategy = MoveStrategy.getInstance();
  }

  public static getInstance(): ActionStrategyContext {
    if (!ActionStrategyContext.instance) {
      ActionStrategyContext.instance = new ActionStrategyContext();
    }
    return ActionStrategyContext.instance;
  }

  public setStrategy(actionType: ActionType): void {
    logger.info('Setting action strategy', { actionType });

    if (actionType === GameConstants.ACTION_NONE) {
      this.currentStrategy = null;
      return;
    }

    if (actionType === GameConstants.ACTION_MOVE) {
      this.currentStrategy = this.moveStrategy;
    } else if (actionType === GameConstants.ACTION_BUILD) {
      this.currentStrategy = this.buildStrategy;
    } else {
      logger.warn('Unknown action type', { actionType });
      this.currentStrategy = null;
    }
  }

  public getCurrentStrategy(): BaseActionStrategy | null {
    return this.currentStrategy;
  }

  public getValidPositions(sourcePosition: Position): Position[] {
    if (!this.currentStrategy) {
      logger.warn('No strategy set for getting valid positions');
      return [];
    }
    return this.currentStrategy.getValidPositions(sourcePosition);
  }

  public validateAction(sourcePosition: Position, targetPosition: Position): { isValid: boolean; reason?: string } {
    if (!this.currentStrategy) {
      logger.warn('No strategy set for validating action');
      return { isValid: false, reason: 'No action selected' };
    }
    return this.currentStrategy.validateAction(sourcePosition, targetPosition);
  }

  public highlightValidPositions(
    positions: Position[],
    scene: Scene,
    options: { color?: string; opacity?: number; particleEffect?: boolean } = {}
  ): void {
    if (!this.currentStrategy) {
      logger.warn('No strategy set for highlighting positions');
      return;
    }
    this.currentStrategy.highlightValidPositions(positions, scene, {
      color: options.color || GameConstants.HIGHLIGHT_COLOR_DEFAULT,
      opacity: options.opacity || GameConstants.HIGHLIGHT_OPACITY,
      particleEffect: options.particleEffect
    });
  }

  public clearHighlights(scene: Scene): void {
    if (!this.currentStrategy) {
      logger.warn('No strategy set for clearing highlights');
      return;
    }
    this.currentStrategy.clearHighlights(scene);
  }
} 