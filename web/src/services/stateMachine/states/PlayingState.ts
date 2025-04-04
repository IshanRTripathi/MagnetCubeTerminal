import { GameState } from './GameState';
import { GameStateMachine } from '../GameStateMachine';
import { ActionManager } from '../../ActionManager';
import { ActionType } from '../../strategies/ActionStrategyContext';
import { Position, BoardObject } from '../../GameBoardManager';
import { GameBoardManager } from '../../GameBoardManager';
import { GameConstants } from '../../../constants/GameConstants';
import { UniversalLogger } from '../../../utils/UniversalLogger';
import { ActionHandler } from '../../ActionHandler';

const logger = UniversalLogger.getInstance();

interface Move {
  playerId: string;
  action: string;
  position: Position;
  value?: number;
  timestamp: number;
}

export class PlayingState extends GameState {
  private actionManager: ActionManager;
  private actionHandler: ActionHandler;
  private gameBoard = GameBoardManager.getInstance();

  constructor(stateMachine: GameStateMachine) {
    super(stateMachine, GameConstants.STATE_PLAYING);
    this.actionManager = ActionManager.getInstance();
    this.actionHandler = ActionHandler.getInstance();
    logger.info('Playing state initialized');
  }

  onEnter(): void {
    logger.info('Entering playing state', { state: this.stateName });
    const stateData = this.stateMachine.getStateData();
    // Initialize board state with current game state
    this.gameBoard.clear();
    
    // Add cubes to board state
    if (stateData.board && Array.isArray(stateData.board)) {
      stateData.board.forEach((cube: any) => {
        if (cube && cube.position) {
          const pos = Array.isArray(cube.position)
            ? { x: cube.position[0], y: cube.position[1], z: cube.position[2] }
            : cube.position;
          
          this.gameBoard.updatePosition(pos.x, pos.z, {
            type: GameConstants.OBJECT_TYPE_CUBE,
            height: pos.y,
            id: cube.id
          });
        }
      });
    } else {
      logger.warn('No board data or invalid board data in state', { 
        state: this.stateName,
        board: stateData.board 
      });
    }
    
    // Add players to board state
    if (stateData.players && Array.isArray(stateData.players)) {
      stateData.players.forEach((player: any) => {
        if (player && player.position) {
          const pos = Array.isArray(player.position)
            ? { x: player.position[0], y: player.position[1], z: player.position[2] }
            : player.position;
          
          this.gameBoard.updatePosition(pos.x, pos.z, {
            type: GameConstants.OBJECT_TYPE_PLAYER,
            height: pos.y,
            id: player.id.toString(),
            color: player.color
          });
          
          logger.info('Added player to board state', { 
            player, 
            position: pos,
            bottomY: pos.y,
            topY: pos.y + 1
          });
        }
      });
    } else {
      logger.warn('No players data or invalid players data in state', { 
        state: this.stateName,
        players: stateData.players 
      });
    }

    logger.info('Board state initialized', { stateData });
  }

  onExit(): void {
    logger.info('Exiting playing state', { state: this.stateName });
    this.actionManager.clearAction();
    this.gameBoard.clear();
  }

  selectAction(
    actionType: ActionType, 
    playerPos: number[] | Position, 
    particlesEnabled: boolean
  ): void {
    logger.info('Action selected', { 
      state: this.stateName,
      actionType, 
      playerPos,
      particlesEnabled
    });
    
    const stateData = this.stateMachine.getStateData();
    if (!stateData) {
      logger.error('No state data available', { state: this.stateName });
      return;
    }

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

    const position: Position = Array.isArray(playerPos) 
      ? { x: playerPos[0], y: playerPos[1], z: playerPos[2] }
      : playerPos;

    this.actionManager.startAction(
      actionType,
      position,
      currentPlayer.color,
      particlesEnabled
    );

    logger.info('Action selected in state machine', {
      actionType,
      playerId: currentPlayer.id,
      position: position,
      color: currentPlayer.color,
      particles: particlesEnabled
    });
  }

  handleMove(targetPos: Position): void {
    const stateData = this.stateMachine.getStateData();
    if (!stateData || !stateData.currentPlayerId) {
      logger.error('No state data or current player ID available', { state: this.stateName });
      return;
    }

    const currentPlayerId = parseInt(stateData.currentPlayerId);
    const success = this.actionHandler.move(currentPlayerId, [targetPos.x, targetPos.y, targetPos.z]);

    if (!success) {
      logger.warn('Move action failed', { state: this.stateName, targetPos });
    }
  }

  handleBuild(targetPos: Position): void {
    const stateData = this.stateMachine.getStateData();
    if (!stateData || !stateData.currentPlayerId) {
      logger.error('No state data or current player ID available', { state: this.stateName });
      return;
    }

    const currentPlayerId = parseInt(stateData.currentPlayerId);
    const success = this.actionHandler.build(currentPlayerId, [targetPos.x, targetPos.y, targetPos.z]);

    if (!success) {
      logger.warn('Build action failed', { state: this.stateName, targetPos });
    }
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