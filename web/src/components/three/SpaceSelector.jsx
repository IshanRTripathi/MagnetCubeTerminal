import React, { useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { useSelector } from 'react-redux'
import * as THREE from 'three'
import { logger } from '../../utils/logger'
import styles from './SpaceSelector.module.css'
import { ActionManager } from '../../services/ActionManager'
import { GameLogic } from '../../services/gameLogic.js'

const SpaceSelector = () => {
  const { camera, scene, gl } = useThree()
  const [hoveredPosition, setHoveredPosition] = useState(null)
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const actionManager = ActionManager.getInstance()
  const gameLogic = GameLogic.getInstance()
  const currentPlayerId = useSelector(state => state.game?.currentPlayer?.id)
  const gamePhase = useSelector(state => state.game?.gameState)

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
    if (!isActionActive || !validPositions) return;

    const intersects = raycaster.intersectObjects(event.object.parent.children, true);
    if (intersects.length > 0) {
      // Log all intersections for debugging
      console.log(`[SpaceSelector] Raycaster hit ${intersects.length} objects`);
      intersects.forEach((intersect, index) => {
        console.log(`  [Intersection ${index}]`, {
          name: intersect.object.name || 'Unnamed',
          type: intersect.object.type,
          uuid: intersect.object.uuid,
          userData: intersect.object.userData,
          parentType: intersect.object.parent?.type,
          distance: intersect.distance
        });
      });

      // Find the first valid clicked object
      const firstValidClickedObject = intersects.find(intersect => {
        // Skip the click catcher plane
        if (intersect.object.name === 'Click catcher plane') return false;
        
        const position = intersect.point;
        // Round the position to match the grid
        const roundedPosition = [
          Math.round(position[0] * 2) / 2,
          Math.round(position[1]),
          Math.round(position[2] * 2) / 2
        ];
        
        return validPositions.some(validPosition => {
          return Math.abs(validPosition[0] - roundedPosition[0]) < 0.1 && 
                 Math.abs(validPosition[2] - roundedPosition[2]) < 0.1;
        });
      });

      if (firstValidClickedObject) {
        // Round the position to match the grid
        const position = [
          Math.round(firstValidClickedObject.point[0] * 2) / 2,
          Math.round(firstValidClickedObject.point[1]),
          Math.round(firstValidClickedObject.point[2] * 2) / 2
        ];
        
        console.log('[SpaceSelector] First Valid Clicked Object Raw:', firstValidClickedObject.object);
        logger.info('Valid target clicked for action:', { action: currentAction, position });
        onValidTargetClick(position);
      } else {
        logger.warn('Invalid target clicked for action:', { action: currentAction });
      }
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