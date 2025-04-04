import { Position } from './GameBoardManager';
import { GameConstants } from '../constants/GameConstants';
import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
export interface Player {
  id: number;
  color: string;
  position: number[];
  powerCards: any[];
  magneticFieldStrength: number;
  canMove: boolean;
  canBuild: boolean;
  canRoll: boolean;
}

export interface Cube {
  id: string;
  position: number[];
  owner: number | null;
  size: number;
}

export class GameStateManager {
  private static instance: GameStateManager;
  private players: Map<number, Player>;
  private cubes: Map<string, Cube>;
  private currentPlayer: number | null;
  private gameState: string;
  private currentCubeId: number;

  private constructor() {
    this.players = new Map();
    this.cubes = new Map();
    this.currentPlayer = null;
    this.gameState = GameConstants.STATE_SETUP;
    this.currentCubeId = 0;
    logger.info('GameStateManager initialized');
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  public getPlayers(): Map<number, Player> {
    return this.players;
  }

  public getCubes(): Map<string, Cube> {
    return this.cubes;
  }

  public getCurrentPlayer(): number | null {
    return this.currentPlayer;
  }

  public setCurrentPlayer(playerId: number): void {
    this.currentPlayer = playerId;
    logger.info('Current player set', { playerId });
  }

  public getGameState(): string {
    return this.gameState;
  }

  public setGameState(state: string): void {
    this.gameState = state;
    logger.info('Game state set', { state });
  }

  public addPlayer(player: Player): void {
    this.players.set(player.id, player);
    logger.info('Player added', { playerId: player.id });
  }

  public removePlayer(playerId: number): void {
    this.players.delete(playerId);
    logger.info('Player removed', { playerId });
  }

  public addCube(cube: Cube): void {
    const cubeId = this.getNextCubeId().toString();
    cube.id = cubeId; // Ensure the cube ID is set correctly
    this.cubes.set(cubeId, cube);
    logger.info('Cube added', { cubeId, position: cube.position, owner: cube.owner });
  }

  public validateCubePosition(position: number[]): boolean {
    // Add validation logic for cube positions
    const isValid = !Array.from(this.cubes.values()).some(cube =>
      cube.position[0] === position[0] &&
      cube.position[1] === position[1] &&
      cube.position[2] === position[2]
    );
    if (!isValid) {
      logger.warn('Invalid cube position', { position });
    }
    return isValid;
  }

  public validatePlayerPosition(playerId: number, position: number[]): boolean {
    const player = this.getPlayer(playerId);
    if (!player) {
      logger.error('Player not found for validation', { playerId });
      return false;
    }
    const isValid = !Array.from(this.players.values()).some(p =>
      p.id !== playerId &&
      p.position[0] === position[0] &&
      p.position[1] === position[1] &&
      p.position[2] === position[2]
    );
    if (!isValid) {
      logger.warn('Invalid player position', { playerId, position });
    }
    return isValid;
  }

  public removeCube(cubeId: string): void {
    this.cubes.delete(cubeId);
    logger.info('Cube removed', { cubeId });
  }

  public getPlayer(playerId: number): Player | undefined {
    return this.players.get(playerId);
  }

  public getCube(cubeId: string): Cube | undefined {
    return this.cubes.get(cubeId);
  }

  public clearState(): void {
    this.players.clear();
    this.cubes.clear();
    this.currentPlayer = null;
    this.gameState = GameConstants.STATE_SETUP;
    logger.info('Game state cleared');
  }

  public toJSON(): any {
    return {
      players: Array.from(this.players.values()),
      cubes: Array.from(this.cubes.values()),
      currentPlayer: this.currentPlayer,
      gameState: this.gameState
    };
  }
  public getNextCubeId(): number {
    return this.currentCubeId++;
  }

  public printBoardData(): void {
    const playersData = Array.from(this.players.values());
    const cubesData = Array.from(this.cubes.values());

    logger.info('Board Data:', {
      players: playersData,
      cubes: cubesData
    });
  }
}