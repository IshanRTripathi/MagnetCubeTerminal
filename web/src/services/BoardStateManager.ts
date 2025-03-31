import { logger } from '../utils/logger';
import { gameConfig } from '../config/GameConfig';

export type ObjectType = 'ground' | 'cube' | 'player';

export interface BoardObject {
  type: ObjectType;
  height: number;  // y-coordinate of the top surface
  id?: string;     // for cubes and players
  color?: string;  // for players
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface BoardPosition {
  objects: BoardObject[];
}

export class BoardStateManager {
  private static instance: BoardStateManager;
  private boardState: Map<string, BoardPosition>;

  private constructor() {
    this.boardState = new Map();
    logger.info('Board state manager initialized');
  }

  public static getInstance(): BoardStateManager {
    if (!BoardStateManager.instance) {
      BoardStateManager.instance = new BoardStateManager();
    }
    return BoardStateManager.instance;
  }

  private getPositionKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  public updatePosition(x: number, z: number, object: BoardObject): void {
    const key = this.getPositionKey(x, z);
    const currentPosition = this.boardState.get(key) || { objects: [] };
    
    // If it's a player, remove any existing player at this position
    if (object.type === 'player') {
      currentPosition.objects = currentPosition.objects.filter(obj => obj.type !== 'player');
    }
    
    // Add the new object, keeping the array sorted by height
    currentPosition.objects.push(object);
    currentPosition.objects.sort((a, b) => a.height - b.height);
    
    this.boardState.set(key, currentPosition);
    // logger.info('Position updated', { x, z, object, currentState: currentPosition });
  }

  public removeObject(x: number, z: number, id: string): void {
    const key = this.getPositionKey(x, z);
    const position = this.boardState.get(key);
    
    if (position) {
      position.objects = position.objects.filter(obj => obj.id !== id);
      if (position.objects.length === 0) {
        this.boardState.delete(key);
      } else {
        this.boardState.set(key, position);
      }
      logger.info('Object removed', { x, z, id });
    }
  }

  public getValidMoves(playerPos: Position): Position[] {
    const validMoves: Position[] = [];
    const directions = [
      { x: 0, z: 1 },   // North
      { x: 0, z: -1 },  // South
      { x: 1, z: 0 },   // East
      { x: -1, z: 0 }   // West
    ];

    const currentKey = this.getPositionKey(playerPos.x, playerPos.z);
    const currentPosition = this.boardState.get(currentKey);
    const currentHeight = this.getTopHeight(currentPosition);

    for (const dir of directions) {
      const targetX = playerPos.x + dir.x;
      const targetZ = playerPos.z + dir.z;
      const targetKey = this.getPositionKey(targetX, targetZ);
      const targetPosition = this.boardState.get(targetKey);

      if (this.isValidMove(currentHeight, targetPosition)) {
        const targetHeight = this.getTopHeight(targetPosition);
        validMoves.push({ x: targetX, y: targetHeight, z: targetZ });
      }
    }

    logger.info('Valid moves calculated', { 
      playerPos, 
      validMoves,
      currentHeight 
    });

    return validMoves;
  }

  private getTopHeight(position?: BoardPosition): number {
    if (!position || position.objects.length === 0) return 0;
    return position.objects[position.objects.length - 1].height;
  }

  private isValidMove(currentHeight: number, targetPosition?: BoardPosition): boolean {
    if (!targetPosition) return true; // Can move to empty space

    const config = gameConfig.getConfig();
    const targetHeight = this.getTopHeight(targetPosition);
    const heightDiff = targetHeight - currentHeight;

    // Check if target has a player
    const hasPlayer = targetPosition.objects.some(obj => obj.type === 'player');
    if (hasPlayer) return false;

    // Check height difference
    if (heightDiff > 0) {
      // Moving up
      return heightDiff <= config.movement.maxClimbHeight;
    } else if (heightDiff < 0) {
      // Moving down
      return config.movement.maxDescendHeight === 0 || 
             Math.abs(heightDiff) <= config.movement.maxDescendHeight;
    }

    return true; // Same height
  }

  public getObjectsAt(x: number, z: number): BoardObject[] {
    const position = this.boardState.get(this.getPositionKey(x, z));
    return position?.objects || [];
  }

  public getTopObject(x: number, z: number): BoardObject | undefined {
    const objects = this.getObjectsAt(x, z);
    return objects.length > 0 ? objects[objects.length - 1] : undefined;
  }

  public clear(): void {
    this.boardState.clear();
    logger.info('Board state cleared');
  }
}

export const boardState = BoardStateManager.getInstance(); 