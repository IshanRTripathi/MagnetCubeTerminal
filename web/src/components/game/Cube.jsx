import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { useBox } from '@react-three/cannon'
import { MagneticPhysics } from '../../services/physics'

const physics = new MagneticPhysics()

function Cube({ position, color = '#ffffff', id }) {
  const [ref, api] = useBox(() => ({
    position,
    mass: 1,
    args: [1, 1, 1],
    material: {
      friction: 0.3,
      restitution: 0.2
    }
  }))

  useEffect(() => {
    // Add cube to physics simulation
    physics.addCube(id, position)
    return () => {
      // Remove cube from physics simulation
      physics.removeCube(id)
    }
  }, [id, position])

  useFrame((state, delta) => {
    // Update physics simulation
    physics.update(delta)

    // Get updated position from physics
    const newPosition = physics.getCubePosition(id)
    if (newPosition) {
      api.position.set(...newPosition)
    }
  })

  return (
    <Box
      ref={ref}
      args={[1, 1, 1]}
      position={position}
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
  )
}

export default Cube 