import React, { useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useSelector } from 'react-redux'
import * as THREE from 'three'
import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
import styles from './SpaceSelector.module.css'
import { ActionManager } from '../../services/ActionManager'
import { GameLogic } from '../../services/GameActionLogic'

const SpaceSelector = () => {
  const { camera, scene, gl } = useThree()
  const [hoveredPosition, setHoveredPosition] = useState(null)
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const actionManager = ActionManager.getInstance()
  const gameLogic = GameLogic.getInstance()
  const currentPlayerId = useSelector(state => state.game?.currentPlayer?.id)
  const gameState = useSelector(state => state.game?.gameState)

  // Recalculate valid positions when action type changes
  useEffect(() => {
    if (!currentPlayerId || gameState !== 'playing') return;

    const currentAction = actionManager.getCurrentAction();
    if (!currentAction) return;

    let validPositions = [];
    switch (currentAction.type) {
      case 'move':
        validPositions = gameLogic.getValidMovePositions(currentPlayerId);
        break;
      case 'build':
        const player = gameLogic.players.get(currentPlayerId);
        if (player) {
          // Convert player position to Position type
          const playerPosition = {
            x: player.position[0],
            y: player.position[1],
            z: player.position[2]
          };
          // Get valid build positions from the validator
          validPositions = gameLogic.buildValidator.getValidBuildPositions(playerPosition);
        }
        break;
      default:
        return;
    }

    // Update action manager with new valid positions
    actionManager.updateValidPositions(validPositions);
    
    logger.info('Recalculated valid positions', {
      actionType: currentAction.type,
      count: validPositions.length
    });
  }, [currentPlayerId, gameState, actionManager.getCurrentAction()?.type, gameLogic.boardState]);

  const getGridPosition = (intersection) => {
    const position = intersection.point
    // Calculate center of the grid cell for x/z
    // Keep y calculation based on height
    const yOffset = -0.01; 
    return {
      x: Math.floor(position.x) + 0.5,
      y: Math.ceil(position.y + yOffset),
      z: Math.floor(position.z) + 0.5
    }
  }

  const onPointerMove = (event) => {
    const rect = gl.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  const onPointerDown = (event) => {
    const rect = gl.domElement.getBoundingClientRect()
    const clickMouse = new THREE.Vector2()
    clickMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    clickMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    camera.updateMatrixWorld();

    raycaster.setFromCamera(clickMouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    // --- Start Debug Logging --- 
    console.log(`[SpaceSelector] Raycaster hit ${intersects.length} objects`);
    intersects.forEach((intersect, index) => {
      const obj = intersect.object;
      console.log(`  [Intersection ${index}]`, {
        name: obj.name || 'Unnamed',
        type: obj.type,
        uuid: obj.uuid,
        userData: obj.userData, // Check userData on each hit object
        parentType: obj.parent?.type,
        parentUUID: obj.parent?.uuid,
        distance: intersect.distance
      });
    });
    // --- End Debug Logging --- 

    const validIntersects = intersects.filter(intersect => {
        const obj = intersect.object;
        const isHighlight = !obj.userData?.type;
        return obj.material && obj.material.visible !== false && 
               obj.name !== "Click catcher plane" &&
               obj.type !== 'GridHelper' &&
               !obj.type.includes('Light')
    });

    if (validIntersects.length > 0) {
      const intersection = validIntersects[0];
      const clickedGridPos = getGridPosition(intersection);

      logger.info('Object clicked in SpaceSelector', { gridPosition: clickedGridPos });

      // Delegate action execution to GameLogic
      const currentAction = actionManager.getCurrentAction();
      if (currentAction && clickedGridPos) {
        let actionSuccess = false;
        if(currentAction.type === 'move') actionSuccess = gameLogic.move(currentPlayerId, clickedGridPos);
        else if(currentAction.type === 'move') actionSuccess = gameLogic.move(currentPlayerId, clickedGridPos);

        if (actionSuccess) {
          logger.info(`Action '${currentAction.type}' performed successfully.`);
          actionManager.clearHighlights(scene);
          actionManager.endCurrentAction();
        } else {
          logger.error(`Action '${currentAction.type}' failed.`);
          actionManager.clearHighlights(scene);
          actionManager.endCurrentAction();
        }
      }
    } else {
      logger.info('Empty space or non-interactive object clicked');
    }
  }

  return (
    <group
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
    >
      {/* Invisible plane to catch events - ensures clicks are registered even in empty space */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} name="Click catcher plane">
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default SpaceSelector