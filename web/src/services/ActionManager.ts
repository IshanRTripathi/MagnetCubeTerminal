import { logger } from '../utils/logger';
import { MovementValidator, Position } from './validators/MovementValidator';
import { BuildValidator } from './validators/BuildValidator';
import { MovementHighlighter } from './highlight/MovementHighlighter';
import { BuildHighlighter } from './highlight/BuildHighlighter';
import { Scene } from 'three';

export type ActionType = 'move' | 'build' | 'roll' | 'none';

export interface ActionState {
  type: ActionType;
  isProcessing: boolean;
  validPositions: Position[];
}

export class ActionManager {
  private static instance: ActionManager;
  private currentAction: ActionState;
  private scene: Scene | null = null;

  private readonly movementValidator: MovementValidator;
  private readonly buildValidator: BuildValidator;
  private readonly movementHighlighter: MovementHighlighter;
  private readonly buildHighlighter: BuildHighlighter;

  private constructor() {
    this.currentAction = {
      type: 'none',
      isProcessing: false,
      validPositions: []
    };

    this.movementValidator = MovementValidator.getInstance();
    this.buildValidator = BuildValidator.getInstance();
    this.movementHighlighter = MovementHighlighter.getInstance();
    this.buildHighlighter = BuildHighlighter.getInstance();

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
  }

  /**
   * Starts a new action of the specified type
   * @param actionType Type of action to start
   * @param playerPos Current player position
   * @param boardState Current board state
   * @param playerPositions All player positions
   * @param playerColor Color to use for highlights
   */
  public startAction(
    actionType: ActionType,
    playerPos: Position,
    boardState: Map<string, Position>,
    playerPositions: Map<string, Position>,
    playerColor?: string
  ): void {
    if (!this.scene) {
      logger.error('Cannot start action: scene not set');
      return;
    }

    logger.info('Starting action', { actionType, playerPos, playerColor });

    // Clear any existing highlights
    this.clearHighlights();

    if (actionType === 'none') {
      this.currentAction = {
        type: 'none',
        isProcessing: false,
        validPositions: []
      };
      return;
    }

    // Calculate valid positions based on action type
    let validPositions: Position[] = [];
    
    if (actionType === 'move') {
      validPositions = this.movementValidator.getValidMoves(
        playerPos,
        boardState,
        playerPositions
      );
      this.movementHighlighter.highlightValidMoves(validPositions, this.scene, {
        color: playerColor || '#ffffff',
        opacity: 0.6,
        particleEffect: true
      });
    } else if (actionType === 'build') {
      validPositions = this.buildValidator.getValidBuildPositions(
        playerPos,
        boardState,
        playerPositions
      );
      this.buildHighlighter.highlightValidBuildPositions(validPositions, this.scene, {
        color: playerColor || '#ffffff',
        opacity: 0.6,
        particleEffect: true
      });
    }

    this.currentAction = {
      type: actionType,
      isProcessing: false,
      validPositions
    };
  }

  /**
   * Validates if a position is valid for the current action
   * @param position Position to validate
   */
  public isValidActionPosition(position: Position): boolean {
    return this.currentAction.validPositions.some(
      pos => pos.x === position.x && 
             pos.y === position.y && 
             pos.z === position.z
    );
  }

  /**
   * Gets the current action state
   */
  public getCurrentAction(): ActionState {
    return { ...this.currentAction };
  }

  /**
   * Clears the current action and all highlights
   */
  public clearAction(): void {
    logger.info('Clearing current action', { 
      previousAction: this.currentAction.type 
    });

    this.clearHighlights();
    
    this.currentAction = {
      type: 'none',
      isProcessing: false,
      validPositions: []
    };
  }

  private clearHighlights(): void {
    if (this.scene) {
      this.movementHighlighter.clearHighlights(this.scene);
      this.buildHighlighter.clearHighlights(this.scene);
    }
  }

  /**
   * Sets the processing state of the current action
   * @param isProcessing Whether the action is being processed
   */
  public setProcessing(isProcessing: boolean): void {
    this.currentAction.isProcessing = isProcessing;
    
    if (isProcessing) {
      logger.info('Action processing started', { 
        actionType: this.currentAction.type 
      });
    } else {
      logger.info('Action processing completed', { 
        actionType: this.currentAction.type 
      });
    }
  }
} 