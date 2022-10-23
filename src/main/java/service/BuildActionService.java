package service;

import static config.CommonConfiguration.CUBE_LENGTH_Y;
import static config.CommonConfiguration.MAXIMUM_BUILD_CAPACITY;
import static config.CommonConfiguration.positionCubeMap;
import static config.CommonConfiguration.usedCubes;

import java.util.Scanner;

import entities.Climber;
import entities.Cube;
import entities.Position;

public class BuildActionService {
    private final Scanner sc = new Scanner(System.in);

    public void performBuildAction(Climber currentPlayer) {
        Position playerPosition = currentPlayer.getPosition();
        System.out.println("Current player position: " + playerPosition);
        int totalBuiltCells = 0;
        while (totalBuiltCells < MAXIMUM_BUILD_CAPACITY) {
            System.out.println("Building cell number " + totalBuiltCells + " for player " + currentPlayer.getId());

            System.out.println("Enter x-coordinate of the cell");
            int x = Integer.parseInt(sc.nextLine());
            System.out.println("Enter y-coordinate of the cell");
            int y = Integer.parseInt(sc.nextLine());
            System.out.println("Enter z-coordinate of the cell");
            int z = Integer.parseInt(sc.nextLine());

            Position position = new Position(x, y, z);
            boolean isValidPosition = validatePositionToBuild(position);

            if(isValidPosition) {
                System.out.println(position + " is a valid position!");
                totalBuiltCells++;
                Cube builtCube = new Cube(usedCubes++, position, "Player"+currentPlayer.getId(), true);
                // isOnTop for all cells below this cell should be set to false
                updateCellStatus(position);
                positionCubeMap.put(position, builtCube);
            } else {
                System.out.println(position + " is not a valid position!");
            }
        }

    }

    private void updateCellStatus(Position position) {
        while (position.getY() >= 0) {
            positionCubeMap.get(position).setOnTop(false);
            position.setY(position.getY() - CUBE_LENGTH_Y);
        }
    }

    private boolean validatePositionToBuild(Position playerPosition) {
        /*
        1. Players may build anywhere on the mountain by stacking cubes
            or by connecting cubes on ground level.
        2. Players can’t build cubes on or under players.
        3. Players can’t build overhangs or disconnected cubes.
        4. Players must finish building 2 cubes before their next action.
        */
        return false;
    }
}
