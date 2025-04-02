const isValidBuildPosition = (position) => {
  // Round the position to match the grid
  const roundedPosition = [
    Math.round(position[0] * 2) / 2,
    Math.round(position[1]),
    Math.round(position[2] * 2) / 2
  ];
  
  // Check if the position is within the board boundaries
  if (roundedPosition[0] < -2 || roundedPosition[0] > 2 || 
      roundedPosition[2] < -2 || roundedPosition[2] > 2) {
    logger.warn('Position out of bounds', { position: roundedPosition });
    return false;
  }

  // Check if there is already a cube at the position
  for (const cubeId in cubes) {
    const cube = cubes[cubeId];
    if (Math.abs(cube.position[0] - roundedPosition[0]) < 0.1 && 
        Math.abs(cube.position[2] - roundedPosition[2]) < 0.1) {
      logger.warn('Position already occupied by a cube', { position: roundedPosition });
      return false;
    }
  }

  // Check if the position is adjacent to the current player
  const playerPosition = currentPlayer.position;
  const isAdjacent = Math.abs(playerPosition[0] - roundedPosition[0]) <= 1 && 
                     Math.abs(playerPosition[2] - roundedPosition[2]) <= 1;
  if (!isAdjacent) {
    logger.warn('Position not adjacent to player', { 
      playerPosition, 
      buildPosition: roundedPosition 
    });
    return false;
  }

  return true;
};

build: (position) => {
  // Round the position to match the grid
  const roundedPosition = [
    Math.round(position[0] * 2) / 2,
    Math.round(position[1]),
    Math.round(position[2] * 2) / 2
  ];
  
  // Check if the position is valid for building
  if (!isValidBuildPosition(roundedPosition)) {
    logger.warn('Invalid build position', { position: roundedPosition });
    return false;
  }

  // Add a new cube at the position
  const newCubeId = `cube-${Object.keys(cubes).length + 1}`;
  cubes[newCubeId] = {
    id: newCubeId,
    position: roundedPosition,
    owner: currentPlayer.id
  };

  // Update the current player's canBuild flag
  currentPlayer.canBuild = false;

  logger.info('Cube built', { cubeId: newCubeId, position: roundedPosition, owner: currentPlayer.id });
  return true;
}, 