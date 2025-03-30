import React from 'react'
import { useSphere } from '@react-three/cannon'
import { Sphere } from '@react-three/drei'

function Player({ position, color = '#ff0000' }) {
  const [ref] = useSphere(() => ({
    position,
    mass: 1,
    args: [0.5],
    material: {
      friction: 0.3,
      restitution: 0.2
    }
  }))

  return (
    <Sphere
      ref={ref}
      args={[0.5, 32, 32]}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.5}
      />
    </Sphere>
  )
}

export default Player 