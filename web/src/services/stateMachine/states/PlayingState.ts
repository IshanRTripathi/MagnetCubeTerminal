import { logger } from '../../../utils/logger';
import { GameState } from './GameState';
import { GameStateMachine } from '../GameStateMachine';
import { ActionManager, ActionType } from '../../ActionManager';
import { Position } from '../../validators/MovementValidator';

interface Move {
  playerId: string;
  action: string;
  position: Position;
  value?: number;
  timestamp: number;
}

export class PlayingState extends GameState {
  private actionManager: ActionManager;

  constructor(stateMachine: GameStateMachine) {
    super(stateMachine, 'playing');
    this.actionManager = ActionManager.getInstance();
    logger.info('Playing state initialized');
  }

  onEnter(): void {
    logger.info('Entering playing state', { state: this.stateName });
    const stateData = this.stateMachine.getStateData();
    logger.info('Current game state', { stateData });
  }

  onExit(): void {
    logger.info('Exiting playing state', { state: this.stateName });
    this.actionManager.clearAction();
  }

  selectAction(actionType: ActionType, playerPos: number[] | Position): void {
    logger.info('Action selected', { 
      state: this.stateName,
      actionType, 
      playerPos 
    });
    
    const stateData = this.stateMachine.getStateData();
    if (!stateData) {
      logger.error('No state data available', { state: this.stateName });
      return;
    }

    // Get current player's color
    const currentPlayer = stateData.players.find(
      p => p.id.toString() === stateData.currentPlayerId
    );
    
    if (!currentPlayer) {
      logger.error('Current player not found', { 
        state: this.stateName,
        currentPlayerId: stateData.currentPlayerId 
      });
      return;
    }

    // Convert array position to Position object if needed
    const position: Position = Array.isArray(playerPos) 
      ? { x: playerPos[0], y: playerPos[1], z: playerPos[2] }
      : playerPos;

    // Get current board state and player positions
    const boardState = new Map<string, Position>();
    const playerPositions = new Map<string, Position>();

    // Convert board state from state data
    if (stateData.board) {
      stateData.board.forEach((cube: any) => {
        const cubePos = Array.isArray(cube.position)
          ? { x: cube.position[0], y: cube.position[1], z: cube.position[2] }
          : cube.position;
        boardState.set(cube.id, cubePos);
      });
    }

    // Convert player positions from state data
    if (stateData.players) {
      stateData.players.forEach((player: any) => {
        if (player.position) {
          const pos = Array.isArray(player.position)
            ? { x: player.position[0], y: player.position[1], z: player.position[2] }
            : player.position;
          playerPositions.set(player.id.toString(), pos);
        }
      });
    }

    logger.info('Starting action with converted positions', {
      playerPosition: position,
      boardState: Array.from(boardState.entries()),
      playerPositions: Array.from(playerPositions.entries())
    });

    // Start the action using ActionManager
    this.actionManager.startAction(
      actionType,
      position,
      boardState,
      playerPositions,
      currentPlayer.color
    );

    logger.info('Action selected in state machine', {
      actionType,
      playerId: currentPlayer.id,
      position: position,
      color: currentPlayer.color
    });
  }

  handleMove(targetPos: Position): void {
    const currentAction = this.actionManager.getCurrentAction();
    
    if (currentAction.type !== 'move') {
      logger.warn('Attempted move but current action is not move', { 
        state: this.stateName,
        currentAction 
      });
      return;
    }

    if (!this.actionManager.isValidActionPosition(targetPos)) {
      logger.warn('Invalid move position selected', { 
        state: this.stateName,
        targetPos 
      });
      return;
    }

    logger.info('Processing move action', { 
      state: this.stateName,
      targetPos 
    });
    this.actionManager.setProcessing(true);

    // Update state data with new position
    const stateData = this.stateMachine.getStateData();
    if (stateData && stateData.currentPlayerId) {
      const playerIndex = stateData.players.findIndex(
        (p: any) => p.id.toString() === stateData.currentPlayerId
      );

      if (playerIndex !== -1) {
        if (!stateData.players[playerIndex].position) {
          stateData.players[playerIndex].position = { x: 0, y: 0, z: 0 };
        }
        stateData.players[playerIndex].position = targetPos;
        this.stateMachine.updateStateData(stateData);
        logger.info('Player position updated', {
          state: this.stateName,
          playerId: stateData.currentPlayerId,
          newPosition: targetPos
        });
      }
    }

    this.actionManager.setProcessing(false);
    this.actionManager.clearAction();
  }

  handleBuild(targetPos: Position): void {
    const currentAction = this.actionManager.getCurrentAction();
    
    if (currentAction.type !== 'build') {
      logger.warn('Attempted build but current action is not build', { 
        state: this.stateName,
        currentAction 
      });
      return;
    }

    if (!this.actionManager.isValidActionPosition(targetPos)) {
      logger.warn('Invalid build position selected', { 
        state: this.stateName,
        targetPos 
      });
      return;
    }

    logger.info('Processing build action', { 
      state: this.stateName,
      targetPos 
    });
    this.actionManager.setProcessing(true);

    // Update state data with new cube
    const stateData = this.stateMachine.getStateData();
    if (stateData) {
      if (!stateData.board) {
        stateData.board = [];
      }

      stateData.board.push({
        id: `cube-${stateData.board.length}`,
        position: targetPos
      });

      this.stateMachine.updateStateData(stateData);
      logger.info('New cube added to board', {
        state: this.stateName,
        cubeId: `cube-${stateData.board.length - 1}`,
        position: targetPos
      });
    }

    this.actionManager.setProcessing(false);
    this.actionManager.clearAction();
  }

  update(): void {
    // Handle any continuous updates if needed
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