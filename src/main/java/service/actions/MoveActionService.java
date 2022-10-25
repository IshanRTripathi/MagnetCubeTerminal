package service.actions;

import static config.CommonConfiguration.CUBE_LENGTH_X;
import static config.CommonConfiguration.CUBE_LENGTH_Z;
import static config.CommonConfiguration.CUBE_PIECE;
import static config.CommonConfiguration.MAXIMUM_CUBE_PIECE;
import static config.CommonConfiguration.playersList;
import static config.CommonConfiguration.positionPieceMap;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.stream.Collectors;

import entities.Climber;
import entities.Cube;
import entities.Piece;
import entities.Position;

public class MoveActionService {
    private final Scanner sc = new Scanner(System.in);

    public void performMoveAction(Climber currentPlayer) {
        if(!currentPlayer.getCanMove()){
            System.out.println("Player cannot move in this turn, already used the move action");
            return;
        }

        Position playerPosition = currentPlayer.getPosition();
        System.out.println("Current player position: " + playerPosition);

        /*
        1. Move to any space on the same level that’s on a continuous path to your player.
        Paths are continuous through cubes and players on the same level, but not
        diagonally and not across spaces on lower levels. (e.g. players can move to A & B,
        but not C because paths can’t go diagonally across lower levels.)

        2. Move up an adjacent space no more than 1 level.

        3. Move down an adjacent space any amount of levels.

        NOTE:
        Players can move to any other space at ground level when at ground level.
        Players can’t be placed on spaces occupied by other players.
        If a player can’t Move after performing all other actions, they choose any space at the
        ground level to be placed instead.*/

        List<Position> validPositionsToMove = new ArrayList<>();
        findSameLevelPositionsToMove(validPositionsToMove, currentPlayer);
        findAdjacentUpperLevelPositions(validPositionsToMove, currentPlayer);
        findAdjacentLowerLevelPositions(validPositionsToMove, currentPlayer);

        System.out.println("Following are some valid positions where the current player can move: " + validPositionsToMove);

        // todo move all the input lines to a new class InputManager
        System.out.println("Enter x-coordinate of the cell");
        int x = Integer.parseInt(sc.nextLine());
        System.out.println("Enter y-coordinate of the cell");
        int y = Integer.parseInt(sc.nextLine());
        System.out.println("Enter z-coordinate of the cell");
        int z = Integer.parseInt(sc.nextLine());

        Position position = new Position(x, y, z);

        if(validPositionsToMove.contains(position)){
            System.out.println("Moving player from " + playerPosition + " => " + position);
            positionPieceMap.remove(playerPosition);
            positionPieceMap.put(position, currentPlayer);
            currentPlayer.setCanMove(false);
            playersList.set(currentPlayer.getId(), currentPlayer);
        }
    }

    private void findSameLevelPositionsToMove(List<Position> validPositionsToMove, Climber currentPlayer) {
        // first apply bfs with current player's position as start point
        // finally filter only those cubes whose isOnTop is true
        // the path finding should be only in 4-directional way (with y-coordinate as constant) and not diagonal way
        Position currentPlayerPosition = currentPlayer.getPosition();
        List<Piece> cubesInSamePlane = positionPieceMap.values().stream()
            .filter(piece -> piece.getPieceType().equals(CUBE_PIECE))
            .filter(piece -> piece.getPosition().getY() == currentPlayerPosition.getY())
            .collect(Collectors.toList());

        List<Piece> piecesInSamePlane = positionPieceMap.values().stream()
            .filter(piece -> piece.getPosition().getY() == currentPlayerPosition.getY())
            .collect(Collectors.toList());

        // find smallest x value and greatest z value to set the bounds for the array and also to shift the indexes so that bfs can be applied
        var valuesHolder = new Object() {
            int smallestX = Integer.MAX_VALUE;
            int largestZ = Integer.MIN_VALUE;
        };
        positionPieceMap.values().forEach(piece -> {
            valuesHolder.smallestX = (int) Math.min(valuesHolder.smallestX, piece.getPosition().getX());
            valuesHolder.largestZ = (int) Math.max(valuesHolder.largestZ, piece.getPosition().getZ());
        });
        valuesHolder.smallestX = Math.abs(valuesHolder.smallestX);
        Piece[][] pieceArray = new Piece[valuesHolder.smallestX + 1][valuesHolder.largestZ + 1];
        piecesInSamePlane.forEach(piece -> {
            int adjustedX = (int) ((piece.getPosition().getX() + valuesHolder.smallestX)/(CUBE_LENGTH_X));
            int adjustedZ = (int) ((piece.getPosition().getZ() + valuesHolder.largestZ)/(CUBE_LENGTH_Z));
            pieceArray[adjustedX][adjustedZ] = piece;
        });
        System.out.println("Piece Array value for pieces on the same plane =>");
        for(Piece[] pieces: pieceArray){
            System.out.println("+++++++++++++++++++++++");
            System.out.println(Arrays.toString(pieces));
        }

        // perform bfs from current player's position in the array to check which possible 4-way direction can it move such that
        // the destination cube is on top and there is no player blocking the way
        // in between the cubes don't need to be on the top

    }

    private void findAdjacentUpperLevelPositions(List<Position> validPositionsToMove, Climber currentPlayer) {
        // only just next cubes that are at y+1 level
        List<Position> temp = new ArrayList<>();
        List<Position> adjacentPositions = getFourDirectionalAdjacentPositions(currentPlayer);

        adjacentPositions.forEach(position -> {
            // getFourDirectionalAdjacentPositions returns the highest available cube, so need to update
            position.setY(currentPlayer.getPosition().getY() + 1);
            if(positionPieceMap.containsKey(position) && ((Cube) positionPieceMap.get(position)).getOnTop()){
                temp.add(position);
            }
        });
        System.out.println("Total adjacent positions one level up than player: " + currentPlayer.getPosition() + "->\n" + temp);
        validPositionsToMove.addAll(temp);
    }

    private List<Position> getFourDirectionalAdjacentPositions(Climber currentPlayer) {
        Position position = currentPlayer.getPosition();
        Map<String, Cube> highestCubeAtSameXZ = new HashMap<>();
        positionPieceMap.values().stream().filter(piece -> piece.getPieceType().equals(CUBE_PIECE)).forEach(piece -> {
            Cube cube = (Cube) piece;
            String currentXZ = cube.getPosition().getX()+","+ cube.getPosition().getZ();
            if(highestCubeAtSameXZ.containsKey(currentXZ) && highestCubeAtSameXZ.get(currentXZ).getPosition().getY() >= position.getY()) {
                highestCubeAtSameXZ.put(currentXZ, cube);
            } else {
                highestCubeAtSameXZ.put(currentXZ, cube);
            }
        });

        Position p1 = new Position(position);
        p1.setX(p1.getX() - CUBE_LENGTH_X);
        checkMapContainsXZEntryForCurrentPlayer(currentPlayer, highestCubeAtSameXZ, p1);

        Position p2 = new Position(position);
        p2.setX(p2.getX() + CUBE_LENGTH_X);
        checkMapContainsXZEntryForCurrentPlayer(currentPlayer, highestCubeAtSameXZ, p2);

        Position p3 = new Position(position);
        p3.setZ(p3.getZ() - CUBE_LENGTH_Z);
        checkMapContainsXZEntryForCurrentPlayer(currentPlayer, highestCubeAtSameXZ, p3);

        Position p4 = new Position(position);
        p4.setZ(p4.getZ() + CUBE_LENGTH_Z);
        checkMapContainsXZEntryForCurrentPlayer(currentPlayer, highestCubeAtSameXZ, p4);
        return new ArrayList<>(List.of(p1, p2, p3, p4));
    }

    private void checkMapContainsXZEntryForCurrentPlayer(Climber currentPlayer, Map<String, Cube> highestCubeAtSameXZ, Position p) {
        if(highestCubeAtSameXZ.containsKey(p.getX()+","+ p.getZ())) {
            p.setY(highestCubeAtSameXZ.get(p.getX()+","+ p.getZ()).getPosition().getY());
        } else {
            p.setY(0);
        }
        highestCubeAtSameXZ.put(p.getX()+","+ p.getZ(), new Cube(-1, p, currentPlayer.getId()+"", true));
    }

    private void findAdjacentLowerLevelPositions(List<Position> validPositionsToMove, Climber currentPlayer) {
        List<Position> adjacentPositions = getFourDirectionalAdjacentPositions(currentPlayer);
        System.out.println("Adjacent highest cells lower than current player: " + adjacentPositions);
        validPositionsToMove.addAll(adjacentPositions);
        // generate adjacent xz pair keys and
        // check if the map contains any cubes at that xz
        // check if they have y < currentplayer position.y
        // if no cube then it can be a ground position
        // if there are cubes, then top place can be a valid position if it is lower
    }
}
