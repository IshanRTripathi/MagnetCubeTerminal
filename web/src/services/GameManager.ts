import { GameStateManager } from './GameStateManager';
import { ActionHandler } from './ActionHandler';
import { GameConstants } from '../constants/GameConstants';
import { store } from '../store';
import { movePlayer, addCube as addCubeAction } from '../store/gameSlice';
import { UniversalLogger } from '../utils/UniversalLogger'
import { GameBoardManager } from './GameBoardManager';
import { GameStateMachine } from './stateMachine/GameStateMachine';
import { useGameStateMachine } from '../hooks/useGameStateMachine';
import { PlayingState } from '../services/stateMachine/states/PlayingState';
import { Position } from './GameBoardManager';

const logger = UniversalLogger.getInstance();

export class GameManager {
  private static instance: GameManager;
  private stateManager: GameStateManager;
  private actionHandler: ActionHandler;
  private stateMachine: GameStateMachine;

  private constructor() {
    this.stateManager = GameStateManager.getInstance();
    this.actionHandler = ActionHandler.getInstance();
    this.stateMachine = GameStateMachine.getInstance();
    logger.info('GameManager initialized');
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public initializeGame(): void {
    logger.info('Initializing game');

    // Clear previous state
    this.stateManager.clearState();

    // Initialize physics
    // this.physics.init();

    // Set up initial game state
    this.stateManager.setGameState(GameConstants.STATE_PLAYING);
    this.stateManager.setCurrentPlayer(2); // Start with player 2 (Blue)

    // Dispatch initial state to Redux
    store.dispatch({
      type: 'game/initialize',
      payload: this.stateManager.toJSON()
    });
    logger.info('Game initialized', {
      gameState: this.stateManager.getGameState(),
      currentPlayer: this.stateManager.getCurrentPlayer()
    });
    logger.info('Game initialization complete');
  }

  public build(playerId: number, position: number[]): boolean {
    const success = this.actionHandler.build(playerId, position);
    if (success) {
      // Update Redux store
      store.dispatch(addCubeAction({
        id: `cube-${Date.now()}`,
        position,
        owner: playerId
      }));
    }
    return success;
  }

  public move(playerId: number, targetPosition: number[]): void {
    logger.info("Attempting move action in GameManager", { playerId, targetPosition });

    const currentState = this.stateMachine.getCurrentState();
    if (currentState instanceof PlayingState) {
      logger.info("Routing move action to PlayingState", { playerId, targetPosition });
      currentState.handleMove(targetPosition);
    } else {
      logger.error("Move action cannot be performed in the current state", { currentState });
    }
  }

  public getGameState(): string {
    return this.stateManager.getGameState();
  }

  public getCurrentPlayer(): number | null {
    return this.stateManager.getCurrentPlayer();
  }

  public endTurn(): void {
    const currentPlayer = this.stateManager.getCurrentPlayer();
    if (currentPlayer === null) return;

    // Reset player actions
    const player = this.stateManager.getPlayer(currentPlayer);
    if (player) {
      player.canMove = true;
      player.canBuild = true;
      player.canRoll = true;
    }

    // Set next player
    const nextPlayer = (currentPlayer % 4) + 1;
    this.stateManager.setCurrentPlayer(nextPlayer);

    logger.info('Turn ended', {
      previousPlayer: currentPlayer,
      nextPlayer
    });
  }
}