import { logger } from '../../utils/logger';
import { gameConfig } from '../../config/GameConfig';
import { Position } from '../validators/MovementValidator';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  Scene,
  PlaneGeometry,
  Points,
  BufferGeometry,
  PointsMaterial,
  BufferAttribute,
  DoubleSide
} from 'three';

export interface HighlightOptions {
  color: string;
  opacity?: number;
  particleEffect?: boolean;
}

export class MovementHighlighter {
  private static instance: MovementHighlighter;
  private highlightedMeshes: Mesh[] = [];

  private constructor() {
    logger.info('Movement highlighter initialized');
  }

  public static getInstance(): MovementHighlighter {
    if (!MovementHighlighter.instance) {
      MovementHighlighter.instance = new MovementHighlighter();
    }
    return MovementHighlighter.instance;
  }

  /**
   * Highlights valid move positions
   * @param positions Array of valid positions to highlight
   * @param scene Three.js scene to add highlights to
   * @param options Highlight customization options
   */
  public highlightValidMoves(
    positions: Position[],
    scene: Scene,
    options?: HighlightOptions
  ): void {
    logger.info('Highlighting valid moves', { 
      positions,
      options 
    });

    this.clearHighlights(scene);

    const config = gameConfig.getConfig();
    const highlightColor = options?.color || config.highlight.moveHighlightColor;
    const opacity = options?.opacity || 0.5;

    positions.forEach(position => {
      const highlight = this.createHighlightMesh(position, highlightColor, opacity);
      scene.add(highlight);
      this.highlightedMeshes.push(highlight);

      if ((options?.particleEffect ?? config.highlight.particleEffect)) {
        this.addParticleEffect(position, scene, highlightColor);
      }
    });
  }

  /**
   * Clears all current highlights from the scene
   * @param scene Three.js scene to remove highlights from
   */
  public clearHighlights(scene: Scene): void {
    logger.info('Clearing movement highlights');
    
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
    // Create a plane geometry for the highlight
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: opacity,
      side: DoubleSide
    });

    const mesh = new Mesh(geometry, material);
    mesh.position.set(position.x, position.y + 0.01, position.z); // Slightly above the cube
    mesh.rotation.x = -Math.PI / 2; // Lay flat

    return mesh;
  }

  private addParticleEffect(
    position: Position,
    scene: Scene,
    color: string
  ): void {
    // Simple particle effect implementation
    // This can be enhanced later with more sophisticated particle systems
    const particles = new Points(
      new BufferGeometry(),
      new PointsMaterial({
        color: new Color(color),
        size: 0.1,
        transparent: true,
        opacity: 0.6
      })
    );

    const particleCount = 5;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = position.y + Math.random() * 0.5;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.5;
    }

    particles.geometry.setAttribute(
      'position',
      new BufferAttribute(positions, 3)
    );

    scene.add(particles);
    this.highlightedMeshes.push(particles as unknown as Mesh);
  }
} 