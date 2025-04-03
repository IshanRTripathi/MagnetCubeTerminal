import React, { useEffect, useRef, forwardRef } from 'react'
import { useSelector } from 'react-redux'
import { Text } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three' 
import { useFeature } from '../../config/featureFlags'

const Player = forwardRef(({ id, position, color }, ref) => {
  const currentPlayer = useSelector(state => state.game?.currentPlayer)
  const isCurrentPlayer = currentPlayer?.id === id
  const particlesRef = useRef()
  const particlesEnabled = useFeature('PARTICLE_EFFECTS')
  const meshRef = useRef();

  // Define consistent sizes for all meshes
  const playerSize = 0.4
  const fieldSize = playerSize * 1.5
  const wireframeSize = fieldSize
  const labelHeight = fieldSize * 1.2

  // Ensure position is an array and has valid numbers
  const [x, y, z] = Array.isArray(position) ? position : [0, 0, 0]
  
  // Adjust y position to raise the player by half its height
  const adjustedPosition = [x, y + 0.5, z]

  // Only create particles if the flag is enabled
  const particles = isCurrentPlayer && particlesEnabled ? Array.from({ length: 30 }, () => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ),
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    ),
    scale: Math.random() * 0.1 + 0.05,
    lifetime: Math.random() * 2 + 1
  })) : []

  // Prepare userData object
  const playerUserData = { type: 'player', id: id };

  // Log userData directly from the mesh ref when it's available
  useEffect(() => {
    if (meshRef.current) {
      logger.info(` ${id} DIRECT Mesh ref userData:`, meshRef.current.userData);
    }
  }, [id]);

  useEffect(() => {
    return () => {
      // Cleanup if needed
    }
  }, [])

  useFrame((state, delta) => {
    if (isCurrentPlayer && particlesEnabled && particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const data = particles[i]
        
        // Update position based on velocity
        particle.position.add(data.velocity)
        
        // Add some random movement
        data.velocity.x += (Math.random() - 0.5) * 0.001
        data.velocity.y += (Math.random() - 0.5) * 0.001
        data.velocity.z += (Math.random() - 0.5) * 0.001
        
        // Dampen velocity for more natural movement
        data.velocity.multiplyScalar(0.99)
        
        // Keep particles within bounds of the player
        const maxDistance = 1.5
        if (particle.position.length() > maxDistance) {
          particle.position.normalize().multiplyScalar(maxDistance)
          // Bounce back towards player
          data.velocity.multiplyScalar(-0.5)
        }
        
        // Fade opacity based on distance from center
        const distance = particle.position.length()
        const opacity = 1 - (distance / maxDistance)
        particle.material.opacity = opacity * 0.6
      })
    }
  })

  return (
    <RigidBody
      ref={ref}
      type="kinematicPosition"
      position={adjustedPosition}
      onCollisionEnter={() => {
        logger.info('Player collision detected')
      }}
      onCollisionExit={() => {
        logger.info('Player collision ended')
      }}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerEnter={() => {}}
        onPointerLeave={() => {}}
        onClick={() => {}}
        userData={playerUserData}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Conditionally render particle group */}
      {isCurrentPlayer && particlesEnabled && (
        <group ref={particlesRef}>
          {particles.map((particle, i) => (
            <mesh key={i} position={particle.position.toArray()}>
              <sphereGeometry args={[particle.scale, 8, 8]} />
              <meshBasicMaterial 
                color={color}
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}
    </RigidBody>
  )
})

// Add display name for React DevTools
Player.displayName = 'Player'

export default Player 