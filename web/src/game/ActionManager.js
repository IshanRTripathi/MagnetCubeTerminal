const highlightValidBuildPositions = () => {
  const validPositions = [];
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      const position = [x, 0, z];
      if (isValidBuildPosition(position)) {
        validPositions.push(position);
      }
    }
  }
  console.log('Valid build positions:', validPositions);
  logger.info('Valid build positions found', { facesCount: validPositions.length, positions: validPositions });
  highlightPositions(validPositions, { color: 0x00ff00, opacity: 0.5 });
}; 