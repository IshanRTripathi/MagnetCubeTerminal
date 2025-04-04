import { Position } from './GameBoardManager';
import { GameConstants } from '../constants/GameConstants';
import { UniversalLogger } from '../utils/UniversalLogger';
import { GameStateManager } from './GameStateManager';
import { BuildValidator } from './validators/BuildValidator';

const logger = UniversalLogger.getInstance();

export class ActionHandler {
  private static instance: ActionHandler;
  private stateManager: GameStateManager;
  private buildValidator: BuildValidator;

  private constructor() {
    this.stateManager = GameStateManager.getInstance();
    this.buildValidator = BuildValidator.getInstance();
    logger.info('ActionHandler initialized');
  }

  public static getInstance(): ActionHandler {
    if (!ActionHandler.instance) {
      ActionHandler.instance = new ActionHandler();
    }
    return ActionHandler.instance;
  }

  public build(playerId: number, position: number[]): boolean {
    logger.info('Attempting build action', { playerId, position });

    // 1. Phase check
    if (this.stateManager.getGameState() !== GameConstants.STATE_PLAYING) {
      logger.warn('Build action attempted in wrong phase', {
        currentPhase: this.stateManager.getGameState(),
        requiredPhase: GameConstants.STATE_PLAYING
      });
      return false;
    }

    // 2. Player check
    if (playerId !== this.stateManager.getCurrentPlayer()) {
      logger.warn('Build action attempted by wrong player', {
        currentPlayer: this.stateManager.getCurrentPlayer(),
        attemptingPlayer: playerId
      });
      return false;
    }

    // 3. Get current player
    const player = this.stateManager.getPlayer(playerId);
    if (!player) {
      logger.error('Player not found', { playerId });
      return false;
    }

    // 4. Convert position to Position type for BuildValidator
    const buildPosition: Position = {
      x: Math.round(position[0] * 2) / 2,
      y: Math.round(position[1]),
      z: Math.round(position[2] * 2) / 2
    };

    const playerPosition: Position = {
      x: player.position[0],
      y: player.position[1],
      z: player.position[2]
    };

    // 5. Validate build using BuildValidator
    const validationResult = this.buildValidator.validateBuild(
      playerPosition,
      buildPosition,
      this.convertCubesToPositions(),
      this.convertPlayersToPositions()
    );

    if (!validationResult.isValid) {
      logger.warn('Invalid build position', {
        position: buildPosition,
        reason: validationResult.reason
      });
      return false;
    }

    // 6. Create and add cube
    const newCube: { id: string; position: number[]; owner: number; size: number } = {
      id: "0",
      position: [buildPosition.x, buildPosition.y, buildPosition.z],
      owner: playerId,
      size: 1
    };

    this.stateManager.addCube(newCube);
    // this.physics.addCube(newCube.id, newCube.position);

    // 7. Mark build action as used
    player.canBuild = false;

    logger.info('Build action successful', {
      newCube: newCube,
      playerId
    });

    return true;
  }

  private isValidMove(from: number[], to: number[]): boolean {
    // Check if move is within one space in any direction
    const dx = Math.abs(to[0] - from[0]);
    const dy = Math.abs(to[1] - from[1]);
    const dz = Math.abs(to[2] - from[2]);

    if (dx > 1 || dy > 1 || dz > 1) {
      logger.info('Move validation failed: distance too far', { dx, dy, dz });
      return false;
    }

    // Check if destination is occupied
    for (const player of this.stateManager.getPlayers().values()) {
      if (player.position[0] === to[0] &&
          player.position[1] === to[1] &&
          player.position[2] === to[2]) {
        logger.info('Move validation failed: destination occupied', {
          byPlayer: player.id,
          position: to
        });
        return false;
      }
    }

    return true;
  }

  private convertCubesToPositions(): Map<string, Position> {
    const positions = new Map<string, Position>();
    for (const [id, cube] of this.stateManager.getCubes()) {
      positions.set(id, {
        x: cube.position[0],
        y: cube.position[1],
        z: cube.position[2]
      });
    }
    return positions;
  }

  private convertPlayersToPositions(): Map<string, Position> {
    const positions = new Map<string, Position>();
    for (const [id, player] of this.stateManager.getPlayers()) {
      positions.set(id.toString(), {
        x: player.position[0],
        y: player.position[1],
        z: player.position[2]
      });
    }
    return positions;
  }
}