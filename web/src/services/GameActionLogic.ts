import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { GameManager } from './GameManager';
import { GameConstants } from '../constants/GameConstants';
import { store } from '../store';
import { GameStateMachine } from './stateMachine/GameStateMachine';

export class GameLogic {
  private static instance: GameLogic;
  private gameManager: GameManager;
  private stateMachine: GameStateMachine;

  private constructor() {
    this.gameManager = GameManager.getInstance();
    this.stateMachine = GameStateMachine.getInstance();
    logger.info('GameLogic initialized');
  }

  public static getInstance(): GameLogic {
    if (!GameLogic.instance) {
      GameLogic.instance = new GameLogic();
    }
    return GameLogic.instance;
  }

  public initializeGame(): void {
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

    logger.info('Game initialization complete', {
      currentPlayer: gameState.currentPlayerId,
      gameState: gameState.gameState,
      players: gameState.players?.length || 0,
      cubes: Object.keys(gameState.cubes || {}).length
    });
  }

  public build(playerId: number, position: number[]): boolean {
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