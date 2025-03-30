import { GameState } from './GameState';
import { GameStateMachine, GameStateData } from '../GameStateMachine';
import { logger } from '../../../utils/logger';

interface Move {
  playerId: string;
  action: string;
  position: { x: number; y: number; z: number };
  timestamp: number;
}

export class PlayingState extends GameState {
  constructor(stateMachine: GameStateMachine) {
    super(stateMachine, 'PlayingState');
  }

  onEnter(): void {
    logger.info('Entering Playing State', { state: this.stateName });
    // Initialize game board UI and game controls
  }

  onExit(): void {
    logger.info('Exiting Playing State', { state: this.stateName });
    // Cleanup game board UI and controls
  }

  update(): void {
    // Handle ongoing game logic, animations, etc.
  }

  public makeMove(move: Omit<Move, 'timestamp'>): void {
    logger.debug('Attempting move', { state: this.stateName, move });
    
    const stateData = this.stateMachine.getStateData();
    
    // Validate move
    if (!this.isValidMove(move)) {
      const error = 'Invalid move';
      logger.error(error, { 
        state: this.stateName,
        move, 
        currentPlayerId: stateData.currentPlayerId 
      });
      throw new Error(error);
    }

    // Record the move
    const fullMove: Move = {
      ...move,
      timestamp: Date.now()
    };

    logger.info('Move recorded', { state: this.stateName, move: fullMove });

    // Update game state
    this.stateMachine.updateStateData({
      moveHistory: [...stateData.moveHistory, fullMove]
    });

    // Check for game end conditions
    if (this.checkGameEnd()) {
      logger.info('Game end condition met', {
        state: this.stateName,
        moveHistory: stateData.moveHistory,
        lastMove: fullMove
      });
      this.stateMachine.transitionTo('gameOver');
      return;
    }

    // Move to next player
    this.nextTurn();
  }

  private isValidMove(move: Omit<Move, 'timestamp'>): boolean {
    const stateData = this.stateMachine.getStateData();
    
    // Verify it's the player's turn
    if (move.playerId !== stateData.currentPlayerId) {
      logger.warn('Move attempted by wrong player', {
        state: this.stateName,
        expectedPlayer: stateData.currentPlayerId,
        attemptingPlayer: move.playerId
      });
      return false;
    }

    // Add your move validation logic here
    return true;
  }

  private checkGameEnd(): boolean {
    const stateData = this.stateMachine.getStateData();
    logger.debug('Checking game end conditions', {
      state: this.stateName,
      moveCount: stateData.moveHistory.length,
      board: stateData.board
    });
    // Add your game end condition checks here
    return false;
  }

  private nextTurn(): void {
    const stateData = this.stateMachine.getStateData();
    const currentPlayerIndex = stateData.players.findIndex(
      player => player.id === stateData.currentPlayerId
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % stateData.players.length;
    const nextPlayer = stateData.players[nextPlayerIndex];
    
    logger.info('Moving to next player', {
      state: this.stateName,
      currentPlayer: stateData.players[currentPlayerIndex],
      nextPlayer
    });

    this.stateMachine.updateStateData({
      currentPlayerId: nextPlayer.id
    });
  }

  public getCurrentPlayer(): { id: string; name: string; score: number } {
    const stateData = this.stateMachine.getStateData();
    const currentPlayer = stateData.players.find(
      player => player.id === stateData.currentPlayerId
    );
    
    if (!currentPlayer) {
      const error = 'Current player not found';
      logger.error(error, {
        state: this.stateName,
        currentPlayerId: stateData.currentPlayerId,
        players: stateData.players
      });
      throw new Error(error);
    }

    return currentPlayer;
  }
} 