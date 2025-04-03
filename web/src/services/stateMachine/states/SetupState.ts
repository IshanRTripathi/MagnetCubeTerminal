import { GameState } from './GameState';
import { GameStateMachine, StateData } from '../GameStateMachine';
import { GameConstants } from '../../../constants/GameConstants';
import { UniversalLogger } from '../../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
export class SetupState extends GameState {
  constructor(stateMachine: GameStateMachine) {
    super(stateMachine, GameConstants.STATE_SETUP);
  }

  onEnter(): void {
    logger.info('Entering Setup State', { state: this.stateName });
    // Initialize game setup UI and listeners
  }

  onExit(): void {
    logger.info('Exiting Setup State', { state: this.stateName });
    // Cleanup setup UI and listeners
  }

  update(): void {
    // Handle ongoing setup state logic
  }

  public addPlayer(name: string): void {
    const stateData = this.stateMachine.getStateData();
    const newPlayer = {
      id: `player_${Date.now()}`,
      name,
      score: 0
    };

    logger.info('Adding new player', { state: this.stateName, player: newPlayer });

    this.stateMachine.updateStateData({
      players: [...stateData.players, newPlayer]
    });
  }

  public startGame(): void {
    const stateData = this.stateMachine.getStateData();
    if (stateData.players.length < 2) {
      const error = 'At least 2 players are required to start the game';
      logger.error(error, { 
        state: this.stateName, 
        playerCount: stateData.players.length 
      });
      throw new Error(error);
    }

    logger.info('Starting game', {
      state: this.stateName,
      players: stateData.players,
      firstPlayer: stateData.players[0]
    });

    const board = this.createInitialBoard();
    logger.debug('Initial board created', { 
      state: this.stateName, 
      board 
    });

    this.stateMachine.updateStateData({
      currentPlayerId: stateData.players[0].id,
      board
    });

    this.stateMachine.transitionTo('playing');
  }

  private createInitialBoard(): any {
    // Initialize your game board structure here
    return {
      // Add your board initialization logic
    };
  }
} 