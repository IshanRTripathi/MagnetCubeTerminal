import React, { useEffect, useRef, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { MagneticPhysics } from '../../services/physics'
import { logger } from '../../utils/logger'
import { Vector3 } from 'three'

const Cube = forwardRef(({ position, color = '#ffffff', id }, ref) => {
  useEffect(() => {
    const physics = MagneticPhysics.getInstance()
    physics.init()
    physics.addCube(id, position)

    return () => {
      physics.removeCube(id)
    }
  }, [id, position])

  return (
    <RigidBody
      ref={ref}
      type="fixed"
      position={position}
      colliders="cuboid"
    >
      <Box
        args={[1, 1, 1]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </Box>
    </RigidBody>
  )
})

Cube.displayName = 'Cube'

export default React.memo(Cube)