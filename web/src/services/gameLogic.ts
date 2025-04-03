import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { GameManager } from './GameManager';
import { GameConstants } from '../constants/GameConstants';

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
        gamePhase: this.getGamePhase(),
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
      gamePhase: gameState.gamePhase,
      players: gameState.players?.length || 0,
      cubes: Object.keys(gameState.cubes || {}).length
    });
  }

  public build(playerId: number, position: number[]): boolean {
    if (!this._initialized) {
      logger.warn('Game not initialized, cannot build');
      return false;
    }

    const result = this.gameManager.build(playerId, position);
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

    const result = this.gameManager.move(playerId, position);
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
    const state = this.gameManager.getGameState();
    // Ensure the state has all required fields
    return {
      ...state,
      currentPlayerId: state.currentPlayerId || this.getCurrentPlayer(),
      gamePhase: state.gamePhase || 'playing',
      players: state.players || [],
      cubes: state.cubes || {},
      logs: state.logs || []
    };
  }

  public getCurrentPlayer(): number | null {
    return this.gameManager.getCurrentPlayer();
  }

  public getGamePhase(): string {
    return this.gameManager.getGamePhase();
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