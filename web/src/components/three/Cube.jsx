import React, { useEffect, useRef, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { MagneticPhysics } from '../../services/physics'
import { logger } from '../../utils/logger'
import { Vector3 } from 'three'

const Cube = forwardRef(({ position, color = '#ffffff', id }, ref) => {
  // Adjust y position to raise the cube by half its height
  const adjustedPosition = Array.isArray(position) 
    ? [position[0], position[1] + 0.5, position[2]]
    : position

  useEffect(() => {
    logger.info('Cube initialized')
    const physics = MagneticPhysics.getInstance()
    physics.init()
    physics.addCube(id, position)

    return () => {
      logger.info('Cube cleanup')
      physics.removeCube(id)
    }
  }, [id, position])

  return (
    <RigidBody
      ref={ref}
      type="fixed"
      position={adjustedPosition}
      colliders="cuboid"
      onCollisionEnter={() => {
        logger.info('Cube collision detected')
      }}
      onCollisionExit={() => {
        logger.info('Cube collision ended')
      }}
    >
      <Box
        args={[1, 1, 1]}
        castShadow
        receiveShadow
        onClick={() => {}}
        onPointerEnter={() => {}}
        onPointerLeave={() => {}}
      >
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.2}
          roughness={0.1}
          transparent={true}
          opacity={0.6}
        />
      </Box>
    </RigidBody>
  )
})

Cube.displayName = 'Cube'

export default React.memo(Cube)