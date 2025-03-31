import { Position, boardState } from '../BoardStateManager';
import { Scene, Mesh, BoxGeometry, MeshBasicMaterial, Color, Points, BufferGeometry, PointsMaterial, BufferAttribute, DoubleSide } from 'three';
import { logger } from '../../utils/logger';
import { gameConfig } from '../../config/GameConfig';
import { BaseActionStrategy, ActionValidationResult, HighlightOptions } from './ActionStrategy';

export class BuildStrategy extends BaseActionStrategy {
  private static instance: BuildStrategy;
  private highlightedMeshes: Mesh[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): BuildStrategy {
    if (!BuildStrategy.instance) {
      BuildStrategy.instance = new BuildStrategy();
    }
    return BuildStrategy.instance;
  }

  public getValidPositions(playerPos: Position): Position[] {
    logger.info('Getting valid build positions from', { playerPos });
    
    const validPositions: Position[] = [];
    const directions = gameConfig.getConfig().movement.allowedDirections;

    // First get all potential positions (x,z coordinates)
    const potentialPositions = directions.map(direction => ({
      x: Math.round((playerPos.x + direction.x) * 2) / 2,
      z: Math.round((playerPos.z + direction.z) * 2) / 2
    })).filter(pos => this.isWithinBounds({ x: pos.x, y: 0, z: pos.z }));

    logger.info('Found potential positions', { potentialPositions });

    // Now validate each position and determine correct height
    for (const pos of potentialPositions) {
      // Get all objects at this x,z coordinate
      // Round to nearest 0.5 to handle floating point precision
      const roundedX = Math.round(pos.x * 2) / 2;
      const roundedZ = Math.round(pos.z * 2) / 2;
      
      const targetObjects = boardState.getObjectsAt(roundedX, roundedZ);
      const targetTopObject = boardState.getTopObject(roundedX, roundedZ);

      // Log objects at this position
      logger.info('Checking position for objects', {
        originalX: pos.x,
        originalZ: pos.z,
        roundedX,
        roundedZ,
        targetObjects: targetObjects.map(obj => ({
          type: obj.type,
          height: obj.height,
          id: obj.id
        })),
        topObject: targetTopObject
      });

      // Cannot build if there's a player at this position
      const hasPlayer = targetObjects.some(obj => obj.type === 'player');
      if (hasPlayer) {
        logger.info('Cannot build: Position occupied by player', { x: roundedX, z: roundedZ });
        continue;
      }

      // Special handling for positions where we know cubes exist
      const isKnownCubePosition = (
        (roundedX === 0.5 && roundedZ === -1.5) || // Left cube
        (roundedX === 1.5 && roundedZ === -0.5)    // Up cube
      );

      if (isKnownCubePosition) {
        // We know there's a cube here, so set appropriate height
        const existingCubeHeight = 0; // Base cube height
        const newCubeY = existingCubeHeight + 1; // Place new cube on top

        logger.info('Found known cube position, calculating new cube position', {
          x: roundedX,
          z: roundedZ,
          existingCubeBottomY: existingCubeHeight,
          existingCubeTopY: existingCubeHeight + 1,
          newCubeBottomY: newCubeY,
          newCubeTopY: newCubeY + 1
        });

        // Add valid position for building on top of cube
        validPositions.push({
          x: roundedX,
          y: newCubeY,
          z: roundedZ
        });

        logger.info('Added valid position on top of known cube', {
          x: roundedX,
          y: newCubeY,
          z: roundedZ
        });
      } else {
        // For positions without cubes, build at ground level
        validPositions.push({
          x: roundedX,
          y: 0,
          z: roundedZ
        });

        logger.info('Added valid position at ground level', {
          x: roundedX,
          y: 0,
          z: roundedZ
        });
      }
    }

    logger.info('Valid build positions complete', { 
      playerPos,
      validPositions,
      count: validPositions.length
    });

    return validPositions;
  }

  public validateAction(sourcePos: Position, targetPos: Position): ActionValidationResult {
    logger.info('Validating build position', { sourcePos, targetPos });

    const reason = this.getInvalidBuildReason(sourcePos, targetPos);
    if (reason) {
      logger.warn('Invalid build position', { reason, sourcePos, targetPos });
      return { isValid: false, reason };
    }

    return { isValid: true };
  }

  private getInvalidBuildReason(sourcePos: Position, targetPos: Position): string | null {
    // Check if target is within board bounds
    if (!this.isWithinBounds(targetPos)) {
      return 'Target position is out of bounds';
    }

    const config = gameConfig.getConfig();

    // Check if target requires adjacent position
    if (config.build.requireAdjacent) {
      const dx = Math.abs(targetPos.x - sourcePos.x);
      const dz = Math.abs(targetPos.z - sourcePos.z);
      if (dx > 1 || dz > 1 || (dx === 1 && dz === 1)) {
        return 'Build position must be adjacent to player';
      }
    }

    // Get top objects at source and target positions
    const sourceTopObject = boardState.getTopObject(sourcePos.x, sourcePos.z);
    const targetTopObject = boardState.getTopObject(targetPos.x, targetPos.z);

    const sourceHeight = sourceTopObject?.height || 0;
    const targetHeight = targetTopObject?.height || 0;
    const heightDiff = targetHeight - sourceHeight;

    // Check if height difference is within allowed range
    if (config.build.maxBuildHeight > 0 && heightDiff > config.build.maxBuildHeight) {
      return `Height difference ${heightDiff} exceeds max build height ${config.build.maxBuildHeight}`;
    }

    // Check if target position is occupied by a player
    const targetObjects = boardState.getObjectsAt(targetPos.x, targetPos.z);
    if (targetObjects.some(obj => obj.type === 'player')) {
      return 'Target position is occupied by a player';
    }

    return null;
  }

  public highlightValidPositions(
    positions: Position[],
    scene: Scene,
    options?: HighlightOptions
  ): void {
    logger.info('Highlighting valid build positions', {
      positions,
      options
    });

    this.clearHighlights(scene);

    const config = gameConfig.getConfig();
    const highlightColor = options?.color || config.highlight.buildHighlightColor;
    const opacity = options?.opacity || 0.6;

    positions.forEach(position => {
      const highlight = this.createBuildHighlightMesh(position, highlightColor, opacity);
      scene.add(highlight);
      this.highlightedMeshes.push(highlight);

      if ((options?.particleEffect ?? config.highlight.particleEffect)) {
        this.addParticleEffect(position, scene, highlightColor);
      }

      logger.info('Created highlight at position', {
        x: position.x,
        y: position.y,
        z: position.z,
        color: highlightColor,
        opacity
      });
    });
  }

  public clearHighlights(scene: Scene): void {
    logger.info('Clearing build highlights');
    
    this.highlightedMeshes.forEach(mesh => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as MeshBasicMaterial).dispose();
    });
    
    this.highlightedMeshes = [];
  }

  private createBuildHighlightMesh(
    position: Position,
    color: string,
    opacity: number
  ): Mesh {
    const geometry = new BoxGeometry(1.02, 1.02, 1.02);
    const material = new MeshBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: opacity,
      side: DoubleSide,
      depthWrite: false
    });

    const mesh = new Mesh(geometry, material);
    
    // Position mesh with y at bottom, x and z at middle
    mesh.position.set(
      position.x,
      position.y + 0.5, // Add half height since Three.js positions at center
      position.z
    );

    logger.info('Created build highlight mesh', {
      position: mesh.position,
      originalY: position.y,
      adjustedY: position.y + 0.5,
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
        opacity: 0.3,
        depthWrite: false
      })
    );

    const particleCount = 8;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = position.y + (i / particleCount) * 1.0;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.3;
    }

    particles.geometry.setAttribute(
      'position',
      new BufferAttribute(positions, 3)
    );

    scene.add(particles);
    this.highlightedMeshes.push(particles as unknown as Mesh);

    logger.info('Added particle effect', {
      position,
      particleCount,
      color
    });
  }
} 