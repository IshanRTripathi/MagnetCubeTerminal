import React, { useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import GridHelper from './GridHelper'
import MagneticFieldVisualizer from './MagneticFieldVisualizer'
import SpaceSelector from './SpaceSelector'
import Player from './Player'
import { UniversalLogger } from '../utils/UniversalLogger'
import * as THREE from 'three'

const logger = UniversalLogger.getInstance();

const GameScene = () => {
  const { cubes, currentPlayer, players } = useGame()

  useEffect(() => {
    // Ensure the camera is positioned correctly
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    // Ensure lighting is added to the scene
    const scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(ambientLight, directionalLight);

    // Ensure the ground plane is at the correct height
    const groundPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0x808080 })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = 0; // Ensure ground is at y = 0
    scene.add(groundPlane);

    // Ensure the renderer is configured correctly
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.render(scene, camera);
  }, []);

  return (
    <>
      <GridHelper />
      <MagneticFieldVisualizer />
      <SpaceSelector />

      {/* Render cubes */}
      {Object.entries(cubes).map(([id, cube]) => (
        <mesh
          key={id}
          position={cube.position}
          userData={{
            type: 'cube',
            id,
            owner: cube.owner
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={cube.owner === currentPlayer.id ? '#00ff00' : '#ff0000'}
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Render all players */}
      {players.map((player) => (
        <Player key={player.id} player={player} />
      ))}
    </>
  )
}

export default GameScene