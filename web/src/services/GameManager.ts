import { GameStateManager } from './GameStateManager';
import { ActionHandler } from './ActionHandler';
import { MagneticPhysics } from './physics';
import { GameConstants } from '../constants/GameConstants';
import { store } from '../store';
import { movePlayer, addCube as addCubeAction } from '../store/gameReducer';
import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
export class GameManager {
  private static instance: GameManager;
  private stateManager: GameStateManager;
  private actionHandler: ActionHandler;
  private physics: MagneticPhysics;

  private constructor() {
    this.stateManager = GameStateManager.getInstance();
    this.actionHandler = ActionHandler.getInstance();
    this.physics = MagneticPhysics.getInstance();
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
    this.physics.init();

    // Set up initial game state
    this.stateManager.setGamePhase(GameConstants.STATE_PLAYING);
    this.stateManager.setCurrentPlayer(2); // Start with player 2 (Blue)

    // Dispatch initial state to Redux
    store.dispatch({
      type: 'game/initialize',
      payload: this.stateManager.toJSON()
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

  public move(playerId: number, position: number[]): boolean {
    const success = this.actionHandler.move(playerId, position);
    if (success) {
      // Update Redux store
      store.dispatch(movePlayer({
        playerId,
        position
      }));
    }
    return success;
  }

  public getGameState(): any {
    return this.stateManager.toJSON();
  }

  public getCurrentPlayer(): number | null {
    return this.stateManager.getCurrentPlayer();
  }

  public getGamePhase(): string {
    return this.stateManager.getGamePhase();
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