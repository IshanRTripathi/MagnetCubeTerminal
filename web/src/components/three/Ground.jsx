import React from 'react'
import { RigidBody } from '@react-three/rapier'

const Ground = () => {
  return (
    <RigidBody type="fixed" position={[0, -0.5, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.8}
          metalness={0.2}
          emissive="#000000"
          emissiveIntensity={0.1}
        />
      </mesh>
    </RigidBody>
  )
}

export default Ground 