import { Position } from './BoardStateManager';
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
  private gamePhase: string;

  private constructor() {
    this.players = new Map();
    this.cubes = new Map();
    this.currentPlayer = null;
    this.gamePhase = GameConstants.STATE_SETUP;
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

  public getGamePhase(): string {
    return this.gamePhase;
  }

  public setGamePhase(phase: string): void {
    this.gamePhase = phase;
    logger.info('Game phase set', { phase });
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
    this.cubes.set(cube.id, cube);
    logger.info('Cube added', { cubeId: cube.id });
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
    this.gamePhase = GameConstants.STATE_SETUP;
    logger.info('Game state cleared');
  }

  public toJSON(): any {
    return {
      players: Array.from(this.players.values()),
      cubes: Array.from(this.cubes.values()),
      currentPlayer: this.currentPlayer,
      gamePhase: this.gamePhase
    };
  }
} 