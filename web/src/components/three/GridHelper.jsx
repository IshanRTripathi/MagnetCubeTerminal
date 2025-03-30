import React from 'react'
import { Grid } from '@react-three/drei'

function GridHelper() {
  return (
    <Grid
      args={[10, 10]}
      position={[0, 0, 0]}
    />
  )
}

export default GridHelper 