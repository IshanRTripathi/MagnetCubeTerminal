import React, { useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../../context/GameContext'
import { logger } from '../../utils/logger'
import styles from './SpaceSelector.module.css'

const SpaceSelector = () => {
  const { camera, scene } = useThree()
  const { selectedPowerCard, dispatch } = useGame()
  const [hoveredCube, setHoveredCube] = useState(null)

  // Raycaster for mouse interaction
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  // Handle mouse movement
  const onPointerMove = (event) => {
    if (!selectedPowerCard) return

    // Calculate mouse position in normalized device coordinates
    const rect = event.target.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)

    // Find intersected objects
    const intersects = raycaster.intersectObjects(scene.children, true)
    
    // Find the first intersected cube
    const cubeIntersect = intersects.find(intersect => 
      intersect.object.userData.type === 'cube'
    )

    if (cubeIntersect) {
      const cubeId = cubeIntersect.object.userData.id
      if (hoveredCube !== cubeId) {
        setHoveredCube(cubeId)
        logger.debug('Cube hovered', { cubeId })
      }
    } else {
      if (hoveredCube) {
        setHoveredCube(null)
      }
    }
  }

  // Handle click
  const onPointerDown = (event) => {
    if (!selectedPowerCard || !hoveredCube) return

    logger.info('Cube selected for power card', {
      cubeId: hoveredCube,
      powerCard: selectedPowerCard
    })

    // Dispatch action to use power card on selected cube
    dispatch({
      type: 'game/usePowerCard',
      payload: {
        cardId: selectedPowerCard,
        target: hoveredCube
      }
    })

    setSelectedCard(null)
  }

  return (
    <group
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
    >
      {/* Invisible plane to catch events */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

export default SpaceSelector 