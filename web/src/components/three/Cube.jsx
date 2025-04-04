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

  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      console.log(`[Cube ${id} /three] DIRECT Mesh ref userData:`, meshRef.current.userData);
    }
  }, [id]);

  // useEffect(() => {
  //   if (meshRef.current) {
  //     // Update the cube's position in the UI
  //     meshRef.current.position.set(position[0], position[1], position[2]);
  //     logger.info('Cube position updated in UI', { id, position });
  //   }
  // }, [position]);

  // useEffect(() => {
  //   if (props.position) {
  //       const { x, y, z } = props.position;
  //       meshRef.current.position.set(x, y, z);
  //   }
  // }, [props.position]);

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