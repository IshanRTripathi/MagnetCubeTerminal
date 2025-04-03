import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();;
import { gameConfig } from '../../config/GameConfig';
import { Position } from '../BoardStateManager';
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  Scene,
  BoxGeometry,
  Points,
  BufferGeometry,
  PointsMaterial,
  BufferAttribute,
  DoubleSide
} from 'three';

export interface BuildHighlightOptions {
  color: string;
  opacity?: number;
  particleEffect?: boolean;
}

export class BuildHighlighter {
  private static instance: BuildHighlighter;
  private highlightedMeshes: Mesh[] = [];

  private constructor() {
    logger.info('Build highlighter initialized');
  }

  public static getInstance(): BuildHighlighter {
    if (!BuildHighlighter.instance) {
      BuildHighlighter.instance = new BuildHighlighter();
    }
    return BuildHighlighter.instance;
  }

  /**
   * Highlights valid build positions
   * @param positions Array of valid positions to highlight
   * @param scene Three.js scene to add highlights to
   * @param options Highlight customization options
   */
  public highlightValidBuildPositions(
    positions: Position[],
    scene: Scene,
    options?: BuildHighlightOptions
  ): void {
    logger.info('Highlighting valid build positions', {
      positions,
      options
    });

    this.clearHighlights(scene);

    const config = gameConfig.getConfig();
    const highlightColor = options?.color || config.highlight.buildHighlightColor;
    const opacity = options?.opacity || 0.3;

    positions.forEach(position => {
      const highlight = this.createBuildHighlightMesh(position, highlightColor, opacity);
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
    // Create a transparent cube to show where the block would be placed
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: opacity,
      side: DoubleSide
    });

    const mesh = new Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z); // Place at exact position

    return mesh;
  }

  private addParticleEffect(
    position: Position,
    scene: Scene,
    color: string
  ): void {
    // Create rising particle effect for build locations
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

    // Create particles in a column above the build position
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