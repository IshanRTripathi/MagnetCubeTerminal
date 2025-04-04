import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { ActionManager } from '../services/ActionManager';
import { UniversalLogger } from '../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  Raycaster,
  Vector2,
  Vector3,
  Object3D
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const GameBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { game, stateMachine } = useGame();
  const actionManager = ActionManager.getInstance();
  const sceneRef = useRef<Scene | null>(null);
  const cubesRef = useRef<Map<string, Mesh>>(new Map());

  useEffect(() => {
    if (!canvasRef.current) return;

    logger.info('Initializing game board');

    // Scene setup
    const scene = new Scene();
    sceneRef.current = scene;
    scene.background = new Color(0x87ceeb);

    // Camera setup
    const camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const ambientLight = new AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Set the scene in the ActionManager
    actionManager.setScene(scene);

    // Create base grid
    const gridSize = 5;
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        const geometry = new BoxGeometry(1, 0.1, 1);
        const material = new MeshStandardMaterial({ 
          color: 0x808080,
          transparent: true,
          opacity: 0.5
        });
        const cube = new Mesh(geometry, material);
        cube.position.set(x, -0.05, z);
        scene.add(cube);
      }
    }

    logger.info('Game board initialized' + JSON.stringify({
      gridSize,
      cameraPosition: camera.position
    }));

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      logger.debug('Window resized' + JSON.stringify({
        width: window.innerWidth,
        height: window.innerHeight
      }));
    };

    window.addEventListener('resize', handleResize);

    // Raycaster setup
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    // Handle cube clicks
    const handleCubeClick = (event: MouseEvent) => {
      if (!canvasRef.current) return;

      // Calculate mouse position in normalized device coordinates
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const position = intersection.point;

        // Round to grid coordinates
        const gridPosition = {
          x: Math.round(position.x),
          y: Math.round(position.y),
          z: Math.round(position.z)
        };

        logger.info('Cube clicked', {
          rawPosition: position,
          gridPosition,
          intersectionDistance: intersection.distance
        });

        const currentAction = actionManager.getCurrentAction();
        const playingState = stateMachine?.getCurrentState();

        if (!playingState || !('handleMove' in playingState)) {
          logger.warn('Invalid game state for handling cube clicks');
          return;
        }

        if (currentAction.type === 'move') {
          if (actionManager.isValidActionPosition(gridPosition)) {
            playingState.handleMove(gridPosition);
            logger.info('Move action processed', { position: gridPosition });
          } else {
            logger.warn('Invalid move position', { position: gridPosition });
          }
        } else if (currentAction.type === 'build') {
          if (actionManager.isValidActionPosition(gridPosition)) {
            playingState.handleBuild(gridPosition);
            logger.info('Build action processed', { position: gridPosition });
          } else {
            logger.warn('Invalid build position', { position: gridPosition });
          }
        }
      }
    };

    canvasRef.current.addEventListener('click', handleCubeClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      logger.info('Cleaning up game board');
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('click', handleCubeClick);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [stateMachine]);

  // Update cubes when game state changes
  useEffect(() => {
    if (!sceneRef.current || !game) return;

    const scene = sceneRef.current;
    const cubes = cubesRef.current;

    // Remove old cubes
    cubes.forEach((cube) => {
      scene.remove(cube);
      cube.geometry.dispose();
      (cube.material as MeshStandardMaterial).dispose();
    });
    cubes.clear();

    // Add new cubes from game state
    if (game.board) {
      game.board.forEach((cube: any) => {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ color: 0x00ff00 });
        const mesh = new Mesh(geometry, material);
        
        // Adjust cube positions to ensure tight packing
        const adjustedX = Math.round(cube.position.x);
        const adjustedY = Math.round(cube.position.y);
        const adjustedZ = Math.round(cube.position.z);
        mesh.position.set(adjustedX, adjustedY, adjustedZ);
        
        scene.add(mesh);
        cubes.set(cube.id, mesh);
      });

      logger.info('Updated game board cubes', {
        cubeCount: game.board.length
      });
    }
  }, [game?.board]);

  return <canvas ref={canvasRef} />;
};