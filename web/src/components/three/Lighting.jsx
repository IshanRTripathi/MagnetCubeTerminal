import React from 'react'
import { UniversalLogger } from '../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();

const Lighting = () => {
  const directionalLightRef = React.useRef()
  
  logger.debug('Rendering Lighting')

  return (
    <>
      <ambientLight intensity={0.4} />
      
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
      />
      
      <pointLight 
        position={[0, 10, 0]} 
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      <hemisphereLight
        skyColor="#ffffff"
        groundColor="#000000"
        intensity={0.3}
      />
    </>
  )
}

export default React.memo(Lighting) 