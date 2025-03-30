import { GameState } from './GameState';
import { GameStateMachine, GameStateData } from '../GameStateMachine';
import { logger } from '../../../utils/logger';

export class GameOverState extends GameState {
  constructor(stateMachine: GameStateMachine) {
    super(stateMachine, 'GameOverState');
  }

  onEnter(): void {
    logger.info('Entering Game Over State', { state: this.stateName });
    this.calculateFinalScores();
    // Initialize game over UI and display results
  }

  onExit(): void {
    logger.info('Exiting Game Over State', { state: this.stateName });
    // Cleanup game over UI
  }

  update(): void {
    // Handle any animations or state updates in game over screen
  }

  private calculateFinalScores(): void {
    const stateData = this.stateMachine.getStateData();
    logger.debug('Calculating final scores', {
      state: this.stateName,
      moveHistory: stateData.moveHistory,
      currentScores: stateData.players.map(p => ({ id: p.id, score: p.score }))
    });
    // Add your score calculation logic here
    // This is where you would analyze the moveHistory and board state
    // to determine final scores
  }

  public getWinner(): { id: string; name: string; score: number } {
    const stateData = this.stateMachine.getStateData();
    const winner = stateData.players.reduce((highest, current) => {
      return current.score > highest.score ? current : highest;
    });

    logger.info('Winner determined', {
      state: this.stateName,
      winner,
      allScores: stateData.players.map(p => ({ id: p.id, score: p.score }))
    });

    return winner;
  }

  public startNewGame(): void {
    logger.info('Starting new game', { state: this.stateName });
    
    // Get final state for logging
    const finalState = this.stateMachine.getStateData();
    logger.debug('Final game state before reset', { 
      state: this.stateName,
      finalState 
    });

    // Reset the game state and transition to setup
    this.stateMachine.updateStateData({
      players: [],
      currentPlayerId: '',
      board: null,
      moveHistory: []
    });

    this.stateMachine.transitionTo('setup');
  }

  public getFinalScores(): Array<{ id: string; name: string; score: number }> {
    const stateData = this.stateMachine.getStateData();
    const sortedScores = [...stateData.players].sort((a, b) => b.score - a.score);
    
    logger.info('Final scores calculated', {
      state: this.stateName,
      scores: sortedScores.map(p => ({ id: p.id, score: p.score }))
    });

    return sortedScores;
  }
} 