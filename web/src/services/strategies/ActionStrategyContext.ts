import { Position } from '../BoardStateManager';
import { Scene } from 'three';
import { logger } from '../../utils/logger';
import { IActionStrategy, HighlightOptions, ActionValidationResult } from './ActionStrategy';
import { BuildStrategy } from './BuildStrategy';
import { MoveStrategy } from './MoveStrategy';

export type ActionType = 'move' | 'build' | 'none';

export class ActionStrategyContext {
  private static instance: ActionStrategyContext;
  private currentStrategy: IActionStrategy | null = null;
  private readonly strategies: Map<ActionType, IActionStrategy>;

  private constructor() {
    this.strategies = new Map();
    this.strategies.set('build', BuildStrategy.getInstance());
    this.strategies.set('move', MoveStrategy.getInstance());
    logger.info('Action strategy context initialized');
  }

  public static getInstance(): ActionStrategyContext {
    if (!ActionStrategyContext.instance) {
      ActionStrategyContext.instance = new ActionStrategyContext();
    }
    return ActionStrategyContext.instance;
  }

  public setStrategy(actionType: ActionType): void {
    if (actionType === 'none') {
      this.currentStrategy = null;
      logger.info('Strategy cleared');
      return;
    }

    const strategy = this.strategies.get(actionType);
    if (!strategy) {
      logger.error('Invalid action type', { actionType });
      throw new Error(`Invalid action type: ${actionType}`);
    }

    this.currentStrategy = strategy;
    logger.info('Strategy set', { actionType });
  }

  public getValidPositions(sourcePos: Position): Position[] {
    if (!this.currentStrategy) {
      logger.warn('No strategy set for getting valid positions');
      return [];
    }

    return this.currentStrategy.getValidPositions(sourcePos);
  }

  public validateAction(sourcePos: Position, targetPos: Position): ActionValidationResult {
    if (!this.currentStrategy) {
      logger.warn('No strategy set for validating action');
      return { isValid: false, reason: 'No action type selected' };
    }

    return this.currentStrategy.validateAction(sourcePos, targetPos);
  }

  public highlightValidPositions(
    positions: Position[],
    scene: Scene,
    options?: HighlightOptions
  ): void {
    if (!this.currentStrategy) {
      logger.warn('No strategy set for highlighting positions');
      return;
    }

    this.currentStrategy.highlightValidPositions(positions, scene, options);
  }

  public clearHighlights(scene: Scene): void {
    if (!this.currentStrategy) {
      logger.warn('No strategy set for clearing highlights');
      return;
    }

    this.currentStrategy.clearHighlights(scene);
  }
} 