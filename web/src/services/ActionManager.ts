import { Scene } from 'three';
import { Position } from './BoardStateManager';
import { ActionStrategyContext, ActionType } from './strategies/ActionStrategyContext';
import { GameConstants } from '../constants/GameConstants';
import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
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
  private sceneInitializationQueue: (() => void)[] = [];

  private constructor() {
    this.currentAction = {
      type: GameConstants.ACTION_NONE,
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

  public setScene(scene: Scene | null): void {
    this.scene = scene;
    if (scene) {
      logger.info('Scene set in action manager', { sceneId: scene.id });
      // Process any queued operations
      while (this.sceneInitializationQueue.length > 0) {
        const operation = this.sceneInitializationQueue.shift();
        operation?.();
      }
    }
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
      // Queue the clear operation for when scene is available
      this.sceneInitializationQueue.push(() => this.clearAction());
      logger.debug('Clear action queued: waiting for scene initialization');
      return;
    }

    this.strategyContext.clearHighlights(this.scene);
    this.strategyContext.setStrategy(GameConstants.ACTION_NONE);

    this.currentAction = {
      type: GameConstants.ACTION_NONE,
      isProcessing: false,
      validPositions: []
    };

    logger.info('Action cleared', { sceneId: this.scene.id });
  }

  /**
   * Starts a new action of the specified type
   * @param actionType Type of action to start
   * @param sourcePosition Current player position
   * @param playerColor Color to use for highlights
   * @param particlesEnabled Whether particle effects should be shown for highlights
   */
  public startAction(
    actionType: ActionType,
    sourcePosition: Position,
    playerColor: string = GameConstants.HIGHLIGHT_COLOR_DEFAULT,
    particlesEnabled: boolean
  ): void {
    if (!this.scene) {
      logger.error('Cannot start action: scene not set');
      return;
    }

    logger.info('Starting action', { actionType, sourcePosition, playerColor, particlesEnabled });
    this.clearAction();
    if (actionType === GameConstants.ACTION_NONE) return;

    this.strategyContext.setStrategy(actionType);
    let validPositions = this.strategyContext.getValidPositions(sourcePosition);
    
    // Filter out positions that are invalid according to the current game state
    validPositions = validPositions.filter(pos => {
      const result = this.strategyContext.validateAction(sourcePosition, pos);
      if (!result.isValid) {
        logger.debug('Filtering out invalid position', { 
          position: pos, 
          reason: result.reason 
        });
        return false;
      }
      return true;
    });
    
    this.strategyContext.highlightValidPositions(validPositions, this.scene, {
      color: playerColor,
      opacity: GameConstants.HIGHLIGHT_OPACITY,
      particleEffect: particlesEnabled
    });

    this.currentAction = {
      type: actionType,
      isProcessing: false,
      validPositions,
      sourcePosition
    };

    logger.info('Action started', { 
      type: actionType,
      validPositions: validPositions.length,
      particles: particlesEnabled
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

  // Added method to explicitly clear highlights
  public clearHighlights(scene: Scene): void {
      if (!this.scene) {
        logger.warn('Cannot clear highlights: scene not set.');
        return;
      }
      this.strategyContext.clearHighlights(scene);
      logger.info('Highlights cleared explicitly via ActionManager.');
  }

  // Added method to end the current action and clear highlights
  public endCurrentAction(): void {
      this.clearAction(); // clearAction already handles highlight clearing and resetting state
      logger.info('Current action ended via ActionManager.');
  }
} 