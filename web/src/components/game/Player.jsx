import React, { useEffect } from 'react'
import { useSphere } from '@react-three/cannon'
import { Sphere } from '@react-three/drei'

function Player({ position, color = '#ff0000', id }) {
  const [ref] = useSphere(() => ({
    position,
    mass: 1,
    args: [0.5],
    material: {
      friction: 0.3,
      restitution: 0.2
    }
  }))

  // Log userData directly from the mesh ref when it's available
  useEffect(() => {
    if (ref.current) {
      console.log(`[Player ${id}] Mesh ref userData:`, ref.current.userData);
    }
  }, [id]); // Run when id changes or ref becomes available

  const playerUserData = { type: 'player', id: id };

  return (
    <Sphere
      ref={ref}
      args={[0.5, 32, 32]}
      castShadow
      receiveShadow
      userData={playerUserData}
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