package service.actions;

import static config.CommonConfiguration.CUBE_LENGTH_X;
import static config.CommonConfiguration.CUBE_LENGTH_Y;
import static config.CommonConfiguration.CUBE_LENGTH_Z;
import static config.CommonConfiguration.CUBE_PIECE;
import static config.CommonConfiguration.MAXIMUM_BUILD_CAPACITY;
import static config.CommonConfiguration.positionPieceMap;
import static config.CommonConfiguration.usedCubes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.concurrent.atomic.AtomicBoolean;

import entities.Climber;
import entities.Cube;
import entities.Position;

public class BuildActionService {
    private final Scanner sc = new Scanner(System.in);

    public void performBuildAction(Climber currentPlayer) {

        if(!currentPlayer.getCanBuild()){
            System.out.println("Player cannot build in this turn, already used it");
            return;
        }

        Position playerPosition = currentPlayer.getPosition();
        System.out.println("Current player position: " + playerPosition);
        int totalBuiltCells = 1;
        while (totalBuiltCells <= MAXIMUM_BUILD_CAPACITY) {
            System.out.println("Building cell number " + totalBuiltCells + " for player " + currentPlayer.getColour().name());

            System.out.println("Enter x-coordinate of the cell");
            int x = Integer.parseInt(sc.nextLine());
            System.out.println("Enter y-coordinate of the cell");
            int y = Integer.parseInt(sc.nextLine());
            System.out.println("Enter z-coordinate of the cell");
            int z = Integer.parseInt(sc.nextLine());

            Position position = new Position(x, y, z);
            boolean isValidPosition = validatePositionToBuild(position, currentPlayer);

            if(isValidPosition) {
                System.out.println(position + " is a valid position!");
                totalBuiltCells++;
                Cube builtCube = new Cube(usedCubes++, position, "Player"+currentPlayer.getId(), true);
                // isOnTop for all cells below this cell should be set to false

                // commented below line as the update is done before returning from validateConnectedNeighbours function
                // updateCellStatus(new Position(position));
                positionPieceMap.put(position, builtCube);
            } else {
                System.out.println(position + " is not a valid position!");
            }
        }
        // build action complete
        currentPlayer.setCanBuild(false);
    }

    private void updateCellStatus(Position position) {
        while (position.getY() >= 0) {
            ((Cube) positionPieceMap.get(position)).setOnTop(false);
            position.setY(position.getY() - CUBE_LENGTH_Y);
        }
    }

    private boolean validatePositionToBuild(Position newCubePosition, Climber currentPlayer) {
        /*
        1. Players may build anywhere on the mountain by stacking cubes
            or by connecting cubes on ground level.
        2. Players can’t build cubes on or under players.
        3. Players can’t build overhangs or disconnected cubes.
        4. Players must finish building 2 cubes before their next action.
        */
        Map<String, List<Cube>> cubesAtSameXZ = new HashMap<>();

        // map x and z coordinates with the players to get the
        // valid level/position of the new cube position
        positionPieceMap.values().stream()
            .filter(piece -> piece.getPieceType().equals(CUBE_PIECE))
            .forEach(piece -> {
                Cube cube = (Cube) piece;
                String currentXZ = cube.getPosition().getX()+","+ cube.getPosition().getZ();
                if(!cubesAtSameXZ.containsKey(currentXZ)){
                    cubesAtSameXZ.put(currentXZ, new ArrayList<>());
                }
                cubesAtSameXZ.get(currentXZ).add(cube);
            });

        // check if no player's y-coordinate is between the range 0 to maximumHeightSoFar for the same value of x and z
        boolean b1 = validateClashWithPlayerAndCubePiece(newCubePosition);
        // check if current cube's y-coordinate is >= maximumHeightSoFar
        boolean b2 = validateVerticalPosition(newCubePosition, cubesAtSameXZ, currentPlayer);
        // check if current cube has at least one touching cube in 4-direction
        boolean b3 = validateConnectedNeighbours(newCubePosition, cubesAtSameXZ);

        return b1 && b2 && b3;
    }

    private boolean validateClashWithPlayerAndCubePiece(Position newCubePosition) {
        boolean res =  !positionPieceMap.containsKey(newCubePosition);
        System.out.println("validateClashWithPlayerAndCubePiece returned " + res);
        return res;
    }

    private boolean validateVerticalPosition(Position newCubePosition, Map<String, List<Cube>> cubesAtSameXZ, Climber currentPlayer) {
        boolean res;
        String newCubeXZ = newCubePosition.getX()+","+newCubePosition.getZ();
        if(cubesAtSameXZ.containsKey(newCubeXZ)){
            // there are already some cubes at that xz, so need to check y > max length of current vertical tower
            // i.e the size of the tower * cube size
            int nextValidYCoordinatePosition = cubesAtSameXZ.get(newCubeXZ).size() * CUBE_LENGTH_Y;
            System.out.println("Next valid y-coordinate position should be "
                + nextValidYCoordinatePosition + " for the provided x and z coordinates");
            res = (nextValidYCoordinatePosition == newCubePosition.getY());
        } else {
            System.out.println("Adding new ground level cube");
            positionPieceMap.put(newCubePosition, new Cube(usedCubes++, newCubePosition, currentPlayer.getId()+"", true));
            res = true;
        }
        System.out.println("validateVerticalPosition returned " + res);
        return res;
    }

    private boolean validateConnectedNeighbours(Position newCubePosition, Map<String, List<Cube>> cubesAtSameXZ) {
        // check if there's any cube already attached to this cube in the 5 faces, i.e excluding the top face
        AtomicBoolean result = new AtomicBoolean(false);
        if(newCubePosition.getY() > 0){
            // check bottom face if it is not the 1st cube on that vertical column
            cubesAtSameXZ.values().forEach(x -> {
                if (result.get()== Boolean.FALSE
                    && x.get(x.size()-1).getPosition().getY() == newCubePosition.getY() - CUBE_LENGTH_Y){
                    System.out.println(x.get(x.size()-1) + " is touching the new cube's bottom face at " + newCubePosition);
                    result.set(true);
                }
            });
        } else {
            // else check for the other 4 faces of newCube with all vertical row's 1st cubes only
            cubesAtSameXZ.values().forEach(x -> {
                if (result.get() == Boolean.FALSE) {
                    Cube firstCubeOfVerticalColumn = x.get(0);
                    Position comparingPosition = firstCubeOfVerticalColumn.getPosition();
                    if (comparingPosition.getX() == newCubePosition.getX() - CUBE_LENGTH_X && comparingPosition.getZ() == newCubePosition.getZ()) {
                        System.out.println(firstCubeOfVerticalColumn + " is touching the new cube's face at " + newCubePosition);
                        result.set(true);
                    }
                    else if (comparingPosition.getX() == newCubePosition.getX() + CUBE_LENGTH_X && comparingPosition.getZ() == newCubePosition.getZ()) {
                        System.out.println(firstCubeOfVerticalColumn + " is touching the new cube's face at " + newCubePosition);
                        result.set(true);
                    }
                    else if (comparingPosition.getZ() == newCubePosition.getZ() - CUBE_LENGTH_Z && comparingPosition.getX() == newCubePosition.getX()) {
                        System.out.println(firstCubeOfVerticalColumn + " is touching the new cube's face at " + newCubePosition);
                        result.set(true);
                    }
                    else if (comparingPosition.getZ() == newCubePosition.getZ() + CUBE_LENGTH_Z && comparingPosition.getX() == newCubePosition.getX()) {
                        System.out.println(firstCubeOfVerticalColumn + " is touching the new cube's face at " + newCubePosition);
                        result.set(true);
                    }
                    if(result.get() == true){
                        firstCubeOfVerticalColumn.setOnTop(false);
                    }
                }
            });
        }
        System.out.println("validateConnectedNeighbours returned " + result.get());
        return result.get();
    }
}
