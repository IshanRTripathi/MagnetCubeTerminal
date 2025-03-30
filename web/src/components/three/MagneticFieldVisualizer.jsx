import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const getLOD = (distance) => {
  // Use THREE.MathUtils for clamping
  const normalizedDistance = THREE.MathUtils.clamp(distance, 5, 20)
  return Math.floor(THREE.MathUtils.mapLinear(normalizedDistance, 5, 20, 20, 5))
}

const MagneticFieldVisualizer = ({ position, strength = 1, color }) => {
  const fieldGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 32, 32)
    return geometry
  }, [])

  const fieldMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: color || '#ffffff',
      transparent: true,
      opacity: 0.2,
      wireframe: true
    })
  }, [color])

  // Create field lines
  const fieldLines = useMemo(() => {
    const lines = []
    const lod = getLOD(10) // Default distance for initial LOD
    
    for (let i = 0; i < lod; i++) {
      const angle = (i / lod) * Math.PI * 2
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * strength,
          Math.sin(angle) * strength,
          0
        )
      ])
      
      const points = curve.getPoints(50)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      lines.push(geometry)
    }
    
    return lines
  }, [strength])

  useFrame((state) => {
    // Add any animation updates here if needed
  })

  return (
    <group position={position}>
      <mesh geometry={fieldGeometry} material={fieldMaterial}>
        {fieldLines.map((geometry, index) => (
          <line key={index} geometry={geometry}>
            <lineBasicMaterial
              attach="material"
              color={color || '#ffffff'}
              opacity={0.3}
              transparent
              linewidth={1}
            />
          </line>
        ))}
      </mesh>
    </group>
  )
}

export default MagneticFieldVisualizer 