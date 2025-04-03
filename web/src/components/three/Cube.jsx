import React, { useEffect, useRef, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();

const Cube = forwardRef(({ position, color = '#ffffff', id }, ref) => {
  // Adjust y position to raise the cube by half its height
  const adjustedPosition = Array.isArray(position) 
    ? [position[0], position[1] + 0.5, position[2]]
    : position

  // Prepare userData object
  const cubeUserData = { type: 'cube', id: id };

  // Log userData directly from the mesh ref when it's available
  useEffect(() => {
    if (ref?.current) { // Check forwarded ref
      // The ref might point to the RigidBody, need to find the mesh
      // Let's assume the Box is the first child for now, this might need adjustment
      const mesh = ref.current.children?.[0];
      if (mesh) {
          console.log(`[Cube ${id} /three] Mesh ref userData:`, mesh.userData);
      }
    }
  }, [id, ref]);

  // NOTE: We likely need to get the mesh ref separately if the forwarded ref is for RigidBody
  const meshRef = useRef();
  useEffect(() => {
    if (meshRef.current) {
      console.log(`[Cube ${id} /three] DIRECT Mesh ref userData:`, meshRef.current.userData);
    }
  }, [id]);

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
        ref={meshRef}
        args={[1, 1, 1]}
        castShadow
        receiveShadow
        onClick={() => {}}
        onPointerEnter={() => {}}
        onPointerLeave={() => {}}
        userData={cubeUserData}
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