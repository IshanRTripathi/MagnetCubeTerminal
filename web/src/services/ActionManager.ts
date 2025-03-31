import { logger } from '../utils/logger';
import { Scene } from 'three';
import { Position } from './BoardStateManager';
import { ActionStrategyContext, ActionType } from './strategies/ActionStrategyContext';

export interface ActionState {
  type: ActionType;
  isProcessing: boolean;
  validPositions: Position[];
  sourcePosition?: Position;
}

export class ActionManager {
  private static instance: ActionManager;
  private currentAction: ActionState;
  private scene: Scene | null = null;
  private readonly strategyContext: ActionStrategyContext;

  private constructor() {
    this.currentAction = {
      type: 'none',
      isProcessing: false,
      validPositions: []
    };

    this.strategyContext = ActionStrategyContext.getInstance();
    logger.info('Action manager initialized');
  }

  public static getInstance(): ActionManager {
    if (!ActionManager.instance) {
      ActionManager.instance = new ActionManager();
    }
    return ActionManager.instance;
  }

  public setScene(scene: Scene): void {
    this.scene = scene;
    logger.info('Scene set in action manager');
  }

  public getCurrentAction(): ActionState {
    return { ...this.currentAction };
  }

  public setProcessing(isProcessing: boolean): void {
    this.currentAction.isProcessing = isProcessing;
    logger.info('Action processing state updated', { isProcessing });
  }

  public clearAction(): void {
    if (!this.scene) {
      logger.error('Cannot clear action: scene not set');
      return;
    }

    this.strategyContext.clearHighlights(this.scene);
    this.strategyContext.setStrategy('none');

    this.currentAction = {
      type: 'none',
      isProcessing: false,
      validPositions: []
    };

    logger.info('Action cleared');
  }

  /**
   * Starts a new action of the specified type
   * @param actionType Type of action to start
   * @param sourcePosition Current player position
   * @param playerColor Color to use for highlights
   */
  public startAction(
    actionType: ActionType,
    sourcePosition: Position,
    playerColor: string = '#ffffff'
  ): void {
    if (!this.scene) {
      logger.error('Cannot start action: scene not set');
      return;
    }

    logger.info('Starting action', { actionType, sourcePosition, playerColor });

    // Clear any existing action
    this.clearAction();

    if (actionType === 'none') {
      return;
    }

    // Set the strategy for this action type
    this.strategyContext.setStrategy(actionType);

    // Calculate valid positions
    const validPositions = this.strategyContext.getValidPositions(sourcePosition);
    
    // Highlight valid positions
    this.strategyContext.highlightValidPositions(validPositions, this.scene, {
      color: playerColor,
      opacity: 0.6,
      particleEffect: true
    });

    // Update current action state
    this.currentAction = {
      type: actionType,
      isProcessing: false,
      validPositions,
      sourcePosition
    };

    logger.info('Action started', { 
      type: actionType,
      validPositions: validPositions.length
    });
  }

  /**
   * Validates if a position is valid for the current action
   * @param targetPos Position to validate
   */
  public isValidActionPosition(targetPos: Position): boolean {
    if (!this.currentAction.sourcePosition) {
      logger.warn('No source position set for validation');
      return false;
    }

    const result = this.strategyContext.validateAction(
      this.currentAction.sourcePosition,
      targetPos
    );

    if (!result.isValid) {
      logger.warn('Invalid action position', { 
        reason: result.reason,
        targetPos 
      });
    }

    return result.isValid;
  }
} 