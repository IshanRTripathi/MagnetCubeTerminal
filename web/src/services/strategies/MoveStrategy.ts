import { Position, boardState } from '../BoardStateManager';
import { Scene, Mesh, BoxGeometry, MeshBasicMaterial, Color, Points, BufferGeometry, PointsMaterial, BufferAttribute, DoubleSide } from 'three';
import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { gameConfig } from '../../config/GameConfig';
import { BaseActionStrategy, ActionValidationResult, HighlightOptions } from './ActionStrategy';
import { GameConstants } from '../../constants/GameConstants';

export class MoveStrategy extends BaseActionStrategy {
  private static instance: MoveStrategy;
  private highlightedMeshes: Mesh[] = [];

  private constructor() {
    super();
    logger.info('MoveStrategy initialized');
  }

  public static getInstance(): MoveStrategy {
    if (!MoveStrategy.instance) {
      MoveStrategy.instance = new MoveStrategy();
    }
    return MoveStrategy.instance; 
  }

  public getValidPositions(playerPos: Position): Position[] {
    logger.info('Getting valid move positions from', { playerPos });
    
    const validPositions: Position[] = [];
    const directions = gameConfig.getConfig().movement.allowedDirections;

    // Check each cardinal direction
    for (const direction of directions) {
      const targetX = Math.round((playerPos.x + direction.x) * 2) / 2;
      const targetZ = Math.round((playerPos.z + direction.z) * 2) / 2;

      // Check if target is within board bounds
      if (!this.isWithinBounds({ x: targetX, y: 0, z: targetZ })) {
        continue;
      }

      // Get all objects at target position
      const targetObjects = boardState.getObjectsAt(targetX, targetZ);
      const targetTopObject = boardState.getTopObject(targetX, targetZ);

      logger.info('Checking move position', {
        targetX,
        targetZ,
        targetObjects: targetObjects.map(obj => ({
          type: obj.type,
          height: obj.height,
          id: obj.id
        })),
        topObject: targetTopObject ? {
          type: targetTopObject.type,
          height: targetTopObject.height,
          id: targetTopObject.id
        } : null
      });

      // Cannot move if there's a player at this position
      const hasPlayer = targetObjects.some(obj => obj.type === GameConstants.OBJECT_TYPE_PLAYER);
      if (hasPlayer) {
        logger.info('Cannot move: Position occupied by player', { targetX, targetZ });
        continue;
      }

      // Get the height of the current position and target position
      const currentTopObject = boardState.getTopObject(playerPos.x, playerPos.z);
      const currentHeight = currentTopObject?.height || 0;

      // Calculate target height based on existing objects
      let targetHeight = 0;
      const cubesAtTarget = targetObjects.filter(obj => obj.type === GameConstants.OBJECT_TYPE_CUBE);
      if (cubesAtTarget.length > 0) {
        // Get the height of the topmost cube
        const topCube = cubesAtTarget.reduce((highest, cube) => 
          cube.height > highest.height ? cube : highest
        , cubesAtTarget[0]);
        targetHeight = topCube.height + 1;
      }

      const heightDiff = targetHeight - currentHeight;
      const config = gameConfig.getConfig();

      // Check height constraints for movement
      if (heightDiff > config.movement.maxClimbHeight) {
        logger.info('Cannot move: Height difference too large', {
          heightDiff,
          maxClimbHeight: config.movement.maxClimbHeight
        });
        continue;
      }

      if (config.movement.maxDescendHeight > 0 && 
          -heightDiff > config.movement.maxDescendHeight) {
        logger.info('Cannot move: Descent too steep', {
          heightDiff,
          maxDescendHeight: config.movement.maxDescendHeight
        });
        continue;
      }

      // If we reach here, the position is valid
      const validPosition: Position = {
        x: targetX,
        y: targetHeight,
        z: targetZ
      };

      validPositions.push(validPosition);
      logger.info('Valid move position found', { 
        validPosition,
        currentHeight,
        targetHeight,
        heightDiff,
        direction
      });
    }

    logger.info('Valid move positions complete', { 
      playerPos,
      validPositions,
      count: validPositions.length
    });

    return validPositions;
  }

  private getInvalidMoveReason(sourcePos: Position, targetPos: Position): string | null {
    // Check if target is within board bounds
    if (!this.isWithinBounds(targetPos)) {
      return 'Target position is out of bounds';
    }

    const config = gameConfig.getConfig();

    // Check if move is in an allowed direction
    const dx = targetPos.x - sourcePos.x;
    const dz = targetPos.z - sourcePos.z;
    const isValidDirection = config.movement.allowedDirections.some(
      dir => Math.abs(dx - dir.x) < 0.1 && Math.abs(dz - dir.z) < 0.1
    );
    if (!isValidDirection) {
      return 'Invalid move direction';
    }

    // Get top objects at source and target positions
    const sourceTopObject = boardState.getTopObject(sourcePos.x, sourcePos.z);
    const targetTopObject = boardState.getTopObject(targetPos.x, targetPos.z);

    const sourceHeight = sourceTopObject?.height || 0;
    const targetHeight = targetTopObject?.height || 0;
    const heightDiff = targetHeight - sourceHeight;

    // Check if climb height is within allowed range
    if (heightDiff > config.movement.maxClimbHeight) {
      return `Height difference ${heightDiff} exceeds max climb height ${config.movement.maxClimbHeight}`;
    }

    // Check if descend height is within allowed range (if configured)
    if (config.movement.maxDescendHeight > 0 && 
        -heightDiff > config.movement.maxDescendHeight) {
      return `Descent height ${-heightDiff} exceeds max descend height ${config.movement.maxDescendHeight}`;
    }

    // Check if target position is occupied by a player
    const targetObjects = boardState.getObjectsAt(targetPos.x, targetPos.z);
    if (targetObjects.some(obj => obj.type === GameConstants.OBJECT_TYPE_PLAYER)) {
      return 'Target position is occupied by a player';
    }

    return null;
  }

  public validateAction(sourcePosition: Position, targetPosition: Position): ActionValidationResult {
    logger.info('Validating move position', { sourcePosition, targetPosition });

    const reason = this.getInvalidMoveReason(sourcePosition, targetPosition);
    if (reason) {
      logger.warn('Invalid move position', { reason, sourcePosition, targetPosition });
      return { isValid: false, reason };
    }

    return { isValid: true };
  }

  public highlightValidPositions(
    positions: Position[],
    scene: Scene,
    options?: HighlightOptions
  ): void {
    logger.info('Highlighting valid move positions', {
      positions,
      options
    });

    this.clearHighlights(scene);

    const config = gameConfig.getConfig();
    // Log incoming options and config value
    logger.debug('[MoveStrategy] Received options:', options);
    logger.debug('[MoveStrategy] Config particleEffect default:', config.highlight.particleEffect);

    const highlightColor = options?.color || config.highlight.moveHighlightColor;
    const opacity = options?.opacity || 0.3;
    const showParticles = options?.particleEffect ?? config.highlight.particleEffect;
    // Log the calculated value
    logger.debug('[MoveStrategy] Calculated showParticles:', showParticles);

    positions.forEach(position => {
      const highlight = this.createHighlightMesh(position, highlightColor, opacity);
      scene.add(highlight);
      this.highlightedMeshes.push(highlight);

      if (showParticles) {
        logger.info('[MoveStrategy] Adding particle effect because showParticles is true');
        this.addParticleEffect(position, scene, highlightColor);
      }
    });
  }

  public clearHighlights(scene: Scene): void {
    logger.info('Clearing move highlights');
    
    this.highlightedMeshes.forEach(mesh => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as MeshBasicMaterial).dispose();
    });
    
    this.highlightedMeshes = [];
  }

  private createHighlightMesh(
    position: Position,
    color: string,
    opacity: number
  ): Mesh {
    // Create a plane geometry for the top face only
    const geometry = new BoxGeometry(1.02, 0.02, 1.02); // Very thin box to act as a plane
    const material = new MeshBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: opacity,
      side: DoubleSide,
      depthWrite: false
    });

    const mesh = new Mesh(geometry, material);
    mesh.raycast = () => {};
    
    // Position the plane slightly above the surface
    mesh.position.set(
      position.x,
      position.y + 0.01, // Just slightly above the surface
      position.z
    );

    logger.info('Created move highlight mesh', {
      position: mesh.position,
      originalY: position.y,
      adjustedY: position.y + 0.01,
      color,
      opacity
    });

    return mesh;
  }

  private addParticleEffect(
    position: Position,
    scene: Scene,
    color: string
  ): void {
    const particles = new Points(
      new BufferGeometry(),
      new PointsMaterial({
        color: new Color(color),
        size: 0.1,
        transparent: true,
        opacity: 0.6
      })
    );

    const particleCount = 8;
    const positions = new Float32Array(particleCount * 3);

    // Create particles in a column above the position
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = position.y + (i / particleCount) * 1.5;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.2;
    }

    particles.geometry.setAttribute(
      'position',
      new BufferAttribute(positions, 3)
    );

    scene.add(particles);
    this.highlightedMeshes.push(particles as unknown as Mesh);
  }
} 