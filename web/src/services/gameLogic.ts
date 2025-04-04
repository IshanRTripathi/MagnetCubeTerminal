import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { GameManager } from './GameManager';
import { GameConstants } from '../constants/GameConstants';
import { store } from '../store';

export class GameLogic {
  private static instance: GameLogic;
  private gameManager: GameManager;
  private stateMachine: any;
  private _stateMachineAttached: boolean;
  private _initialized: boolean;

  private constructor() {
    this.gameManager = GameManager.getInstance();
    this.stateMachine = null;
    this._stateMachineAttached = false;
    this._initialized = false;
    logger.info('GameLogic initialized');
  }

  public static getInstance(): GameLogic {
    if (!GameLogic.instance) {
      GameLogic.instance = new GameLogic();
    }
    return GameLogic.instance;
  }

  public setStateMachine(stateMachine: any): void {
    // Only attach if not already attached or if the interface has changed
    if (!this._stateMachineAttached || 
        !this.stateMachine || 
        this.stateMachine.getStateData !== stateMachine.getStateData) {
      this.stateMachine = stateMachine;
      this._stateMachineAttached = true;
      
      // If already initialized, update state machine with current state
      if (this._initialized) {
        const gameState = this.getGameState();
        if (this.stateMachine.updateStateData) {
          this.stateMachine.updateStateData({
            ...gameState,
            moveHistory: [],
            timestamp: Date.now()
          });
        }
      }
      
      logger.info('State machine attached to GameLogic', { 
        currentPlayer: this.getCurrentPlayer(),
        gameState: this.getGameState(),
        initialized: this._initialized
      });
    }
  }

  public initializeGame(): void {
    if (this._initialized) {
      logger.info('Game already initialized, skipping initialization');
      return;
    }

    // Initialize game state
    this.gameManager.initializeGame();
    
    // Get the current game state
    const gameState = this.getGameState();
    
    // Update state machine if attached
    if (this.stateMachine && this.stateMachine.updateStateData) {
      this.stateMachine.updateStateData({
        ...gameState,
        moveHistory: [],
        timestamp: Date.now()
      });
    }

    this._initialized = true;

    logger.info('Game initialization complete', {
      currentPlayer: gameState.currentPlayerId,
      gameState: gameState.gameState,
      players: gameState.players?.length || 0,
      cubes: Object.keys(gameState.cubes || {}).length
    });
  }

  public build(playerId: number, position: number[]): boolean {
    if (!this._initialized) {
      logger.warn('Game not initialized, cannot build');
      return false;
    }

    const result: boolean = this.gameManager.build(playerId, position);
    if (result && this.stateMachine && this.stateMachine.updateStateData) {
      const gameState = this.getGameState();
      this.stateMachine.updateStateData({
        ...gameState,
        moveHistory: [...(this.stateMachine.getStateData()?.moveHistory || []), {
          type: 'build',
          playerId,
          position,
          timestamp: Date.now()
        }]
      });
    }
    return result;
  }

  public move(playerId: number, position: number[]): boolean {
    if (!this._initialized) {
      logger.warn('Game not initialized, cannot move');
      return false;
    }

    const result: boolean = this.gameManager.move(playerId, position);
    if (result && this.stateMachine && this.stateMachine.updateStateData) {
      const gameState = this.getGameState();
      this.stateMachine.updateStateData({
        ...gameState,
        moveHistory: [...(this.stateMachine.getStateData()?.moveHistory || []), {
          type: 'move',
          playerId,
          position,
          timestamp: Date.now()
        }]
      });
    }
    return result;
  }

  public getGameState(): any {
    const state = store.getState().game; // Access the 'game' slice of the Redux state

    // Ensure the state has all required fields
    return {
      ...state,
      currentPlayerId: state.currentPlayerId || this.getCurrentPlayer(), // Fallback to the current player if not set
      gameState: state.gameState || 'playing', // Default to 'playing' if game state is undefined
      players: state.players || [], // Ensure players array is defined
      cubes: state.cubes || {}, // Ensure cubes object is defined
      logs: state.logs || [] // Ensure logs array is defined
    };
  }

  public getCurrentPlayer(): number | null {
    return this.gameManager.getCurrentPlayer();
  }

  public endTurn(): void {
    if (!this._initialized) {
      logger.warn('Game not initialized, cannot end turn');
      return;
    }

    this.gameManager.endTurn();
    if (this.stateMachine && this.stateMachine.updateStateData) {
      const gameState = this.getGameState();
      this.stateMachine.updateStateData({
        ...gameState,
        moveHistory: [...(this.stateMachine.getStateData()?.moveHistory || []), {
          type: 'endTurn',
          playerId: this.getCurrentPlayer(),
          timestamp: Date.now()
        }]
      });
    }
  }
}