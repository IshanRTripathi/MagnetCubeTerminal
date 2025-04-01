import { Position, boardState, BoardObject } from '../BoardStateManager';
import { Scene, Mesh, BoxGeometry, MeshBasicMaterial, Color, Points, BufferGeometry, PointsMaterial, BufferAttribute, DoubleSide } from 'three';
import { logger } from '../../utils/logger';
import { gameConfig } from '../../config/GameConfig';
import { BaseActionStrategy, ActionValidationResult, HighlightOptions } from './ActionStrategy';
import { GameConstants } from '../../constants/GameConstants';

interface CubeFace {
  position: Position;
  normal: { x: number; y: number; z: number };
  parentCube: { x: number; y: number; z: number };
}

export class BuildStrategy extends BaseActionStrategy {
  private static instance: BuildStrategy;
  private highlightedMeshes: Mesh[] = [];
  private lastCalculatedFaces: CubeFace[] = [];

  private constructor() {
    super();
    logger.info('BuildStrategy initialized');
  }

  public static getInstance(): BuildStrategy {
    if (!BuildStrategy.instance) {
      BuildStrategy.instance = new BuildStrategy();
    }
    return BuildStrategy.instance;
  }

  public getValidPositions(playerPos: Position): Position[] {
    logger.info('Getting valid build positions');
    
    // Calculate and store faces
    this.lastCalculatedFaces = this.findAllExposedCubeFaces();
    
    // Convert faces to positions
    const validPositions = this.lastCalculatedFaces.map(face => face.position);

    logger.info('Valid build positions found', {
      facesCount: this.lastCalculatedFaces.length,
      positions: validPositions
    });

    return validPositions;
  }

  private findAllExposedCubeFaces(): CubeFace[] {
    const exposedFaces: CubeFace[] = [];
    const occupiedPositions = new Set<string>(); // Track positions that are already occupied

    // Get all entries from the board state
    const entries = Array.from((boardState as any).boardState.entries()) as [string, { objects: BoardObject[] }][];
    
    // First, collect all positions that have objects (cubes or players)
    entries.forEach(([key, value]) => {
      if (value.objects.length > 0) {
        occupiedPositions.add(key);
      }
    });

    // Process each position for top faces
    for (const [key, value] of entries) {
      // Get cubes at this position
      const cubes = value.objects
        .filter(obj => obj.type === GameConstants.OBJECT_TYPE_CUBE)
        .sort((a, b) => b.height - a.height); // Sort by height descending

      if (cubes.length > 0) {
        const topCube = cubes[0];
        const [x, z] = key.split(',').map(Number);

        // Add face above the highest cube
        exposedFaces.push({
          position: {
            x: x,
            y: topCube.height + 1,
            z: z
          },
          normal: { x: 0, y: 1, z: 0 },
          parentCube: {
            x: x,
            y: topCube.height,
            z: z
          }
        });

        // Check adjacent ground positions
        const adjacentPositions = [
          { x: x + 1, z: z },
          { x: x - 1, z: z },
          { x: x, z: z + 1 },
          { x: x, z: z - 1 }
        ];

        for (const adjPos of adjacentPositions) {
          const adjKey = `${adjPos.x},${adjPos.z}`;
          
          // Skip if position is out of bounds
          if (!this.isWithinBounds({ x: adjPos.x, y: 0, z: adjPos.z })) {
            continue;
          }

          // Skip if position is already occupied
          if (occupiedPositions.has(adjKey)) {
            continue;
          }

          // Add ground-level face adjacent to cube
          exposedFaces.push({
            position: {
              x: adjPos.x,
              y: 0, // Ground level
              z: adjPos.z
            },
            normal: { x: 0, y: 1, z: 0 },
            parentCube: {
              x: x,
              y: 0,
              z: z
            }
          });

          // Mark this position as occupied so we don't add it again
          occupiedPositions.add(adjKey);
        }
      }
    }

    logger.info('Face detection complete:', {
      totalFaces: exposedFaces.length,
      faces: exposedFaces.map(face => ({
        position: face.position,
        normal: face.normal,
        parentCube: face.parentCube
      }))
    });

    return exposedFaces;
  }

  public validateAction(sourcePosition: Position, targetPosition: Position): ActionValidationResult {
    logger.info('Validating build position', { sourcePosition, targetPosition });

    // Check if target is within board bounds
    if (!this.isWithinBounds(targetPosition)) {
      return { isValid: false, reason: 'Target position is out of bounds' };
    }

    // Get objects at the target x,z coordinate
    const objects = boardState.getObjectsAt(targetPosition.x, targetPosition.z);
    const cubes = objects
      .filter(obj => obj.type === GameConstants.OBJECT_TYPE_CUBE)
      .sort((a, b) => b.height - a.height); // Sort by height descending

    // Check if there's a cube below the target position
    if (cubes.length === 0) {
      return { isValid: false, reason: 'No cube found below target position' };
    }

    const topCube = cubes[0];
    const isValidHeight = targetPosition.y === topCube.height + 1;

    if (!isValidHeight) {
      return { isValid: false, reason: 'Target position is not directly above the top cube' };
    }

    return { isValid: true };
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
    // Log incoming options and config value
    logger.debug('[BuildStrategy] Received options:', options);
    logger.debug('[BuildStrategy] Config particleEffect default:', config.highlight.particleEffect);

    const highlightColor = options?.color || config.highlight.buildHighlightColor;
    const opacity = options?.opacity || 0.3;
    const showParticles = options?.particleEffect ?? config.highlight.particleEffect;
    // Log the calculated value
    logger.debug('[BuildStrategy] Calculated showParticles:', showParticles);

    // Create highlights for each position
    positions.forEach(position => {
      // Create a face for highlighting
      const face: CubeFace = {
        position: position,
        normal: { x: 0, y: 1, z: 0 }, // Always highlighting top face
        parentCube: {
          x: position.x,
          y: position.y - 1, // Parent cube is one level below
          z: position.z
        }
      };

      const highlight = this.createFaceHighlight(face, highlightColor, opacity);
      scene.add(highlight);
      this.highlightedMeshes.push(highlight);

      if (showParticles) {
        logger.info('[BuildStrategy] Adding particle effect because showParticles is true');
        this.addParticleEffect(position, scene, highlightColor);
      }
    });
  }

  private createFaceHighlight(
    face: CubeFace,
    color: string,
    opacity: number
  ): Mesh {
    // Create a thin plane geometry for the face
    const geometry = new BoxGeometry(
      Math.abs(face.normal.x) === 1 ? 0.02 : 1.02,
      Math.abs(face.normal.y) === 1 ? 0.02 : 1.02,
      Math.abs(face.normal.z) === 1 ? 0.02 : 1.02
    );

    const material = new MeshBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: opacity,
      side: DoubleSide,
      depthWrite: false
    });

    const mesh = new Mesh(geometry, material);
    mesh.raycast = () => {};
    
    // Position the highlight slightly offset from the face
    const offset = 0.01; // Small offset to prevent z-fighting
    mesh.position.set(
      face.position.x - face.normal.x * offset,
      face.position.y - face.normal.y * offset,
      face.position.z - face.normal.z * offset
    );

    logger.debug('Created face highlight', {
      position: mesh.position,
      normal: face.normal,
      parentCube: face.parentCube
    });

    return mesh;
  }

  public clearHighlights(scene: Scene): void {
    logger.info('Clearing build highlights');
    
    this.highlightedMeshes.forEach(mesh => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as MeshBasicMaterial).dispose();
    });
    
    this.highlightedMeshes = [];
    // Clear stored faces when clearing highlights
    this.lastCalculatedFaces = [];
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