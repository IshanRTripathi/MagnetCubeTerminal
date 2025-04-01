import React, { useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../../context/GameContext'
import { logger } from '../../utils/logger'
import styles from './SpaceSelector.module.css'
import { ActionManager } from '../../services/ActionManager'

const SpaceSelector = () => {
  const { camera, scene, gl } = useThree()
  const { selectedPowerCard, dispatch } = useGame()
  const [hoveredPosition, setHoveredPosition] = useState(null)
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const actionManager = ActionManager.getInstance()

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
      const clickedObject = intersection.object;
      const intersectionPoint = intersection.point;
      const clickedGridPos = getGridPosition(intersection);

      // Log the *first valid* hit object details (as before)
      console.log('[SpaceSelector] First Valid Clicked Object Raw:', clickedObject);
      
      // Log specific details again, including explicit parent info
      logger.info('Object clicked', {
        objectName: clickedObject.name || 'Unnamed',
        objectType: clickedObject.type, 
        objectID: clickedObject.uuid, 
        parentName: clickedObject.parent?.name || 'N/A',
        parentType: clickedObject.parent?.type || 'N/A',
        parentID: clickedObject.parent?.uuid || 'N/A',
        userData: clickedObject.userData, 
        position: clickedObject.position.toArray(),
        worldPosition: clickedObject.getWorldPosition(new THREE.Vector3()).toArray(), 
        distance: intersection.distance, 
        intersectionPoint: intersectionPoint.toArray(),
        gridPosition: clickedGridPos
      });

      // --- Action Validation Logic ---
      if (clickedGridPos) {
        const currentAction = actionManager.getCurrentAction();
        const validPositions = currentAction?.validPositions || [];

        const isClickValidActionTarget = currentAction && validPositions.some(
          pos => pos.x === clickedGridPos.x && 
                 pos.y === clickedGridPos.y && 
                 pos.z === clickedGridPos.z
        );

        if (isClickValidActionTarget) {
          logger.info(`Valid target clicked for action: ${currentAction.type}`, { 
            action: currentAction.type, 
            position: clickedGridPos 
          });
          // TODO: Trigger the actual action (e.g., stateMachine.handleMove(clickedGridPos))
        } else {
            logger.info('Clicked on a grid position, but it is not a valid target for the current action (if any).', {
                clickedPosition: clickedGridPos,
                currentActionType: currentAction?.type || 'None'
            });
        }
      }
      // --- End Action Validation Logic ---

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