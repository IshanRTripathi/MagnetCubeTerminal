import React, { useRef, useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'

const Ground = () => {
  console.log('[Ground /three] Rendering');
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      console.log(`[Ground /three] DIRECT Mesh ref userData:`, meshRef.current.userData);
    }
  }, []);

  return (
    <RigidBody type="fixed" position={[0, -0.5, 0]}>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        userData={{ type: 'ground' }}
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