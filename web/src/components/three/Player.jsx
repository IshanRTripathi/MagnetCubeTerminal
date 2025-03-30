import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Text } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { logger } from '../../utils/logger'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Player = ({ id, position, color }) => {
  const currentPlayer = useSelector(state => state.game?.currentPlayer)
  const isCurrentPlayer = currentPlayer?.id === id
  const particlesRef = useRef()

  // Define consistent sizes for all meshes
  const playerSize = 0.4
  const fieldSize = playerSize * 1.5
  const wireframeSize = fieldSize
  const labelHeight = fieldSize * 1.2

  // Ensure position is an array and has valid numbers
  const [x, y, z] = Array.isArray(position) ? position : [0, 0, 0]

  // Create particles with random initial positions and velocities
  const particles = isCurrentPlayer ? Array.from({ length: 30 }, () => ({
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

  useEffect(() => {
    logger.info('Player mounted')
    return () => {
      logger.info('Player unmounting')
    }
  }, [])

  useFrame((state, delta) => {
    if (isCurrentPlayer && particlesRef.current) {
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
      type="kinematicPosition"
      position={position}
      onCollisionEnter={() => {
        logger.info('Player collision detected')
      }}
      onCollisionExit={() => {
        logger.info('Player collision ended')
      }}
    >
      <mesh
        castShadow
        receiveShadow
        onPointerEnter={() => {}}
        onPointerLeave={() => {}}
        onClick={() => {}}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Particles for current player */}
      {isCurrentPlayer && (
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
}

export default Player 