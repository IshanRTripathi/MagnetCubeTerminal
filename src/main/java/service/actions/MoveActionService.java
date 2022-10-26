package service.actions;

import static config.CommonConfiguration.CUBE_LENGTH_X;
import static config.CommonConfiguration.CUBE_LENGTH_Y;
import static config.CommonConfiguration.CUBE_LENGTH_Z;
import static config.CommonConfiguration.CUBE_PIECE;
import static config.CommonConfiguration.PLAYER_PIECE;
import static config.CommonConfiguration.playersList;
import static config.CommonConfiguration.positionPieceMap;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
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
            currentPlayer.setPosition(position);
            currentPlayer.setCanMove(false);
            positionPieceMap.put(position, currentPlayer);
            System.out.println("All player status: " + playersList);
        }
    }

    private void findSameLevelPositionsToMove(List<Position> validPositionsToMove, Climber currentPlayer) {
        // first apply bfs with current player's position as start point
        // finally filter only those cubes whose isOnTop is true
        // the path finding should be only in 4-directional way (with y-coordinate as constant) and not diagonal way
        Position currentPlayerPosition = currentPlayer.getPosition();

        List<Piece> piecesWalkableByPlayer = positionPieceMap.values().stream()
            .filter(piece -> piece.getPosition().getY() == currentPlayerPosition.getY() - CUBE_LENGTH_Y)
            .collect(Collectors.toList());

        // find smallest x value and greatest z value to set the bounds for the array and also to shift the indexes so that bfs can be applied
        var valuesHolder = new Object() {
            int smallestX = Integer.MAX_VALUE;
            int largestZ = Integer.MIN_VALUE;
        };
        AtomicReference<Float> playerPositionX = new AtomicReference<>(-1.0f);
        AtomicReference<Float> playerPositionZ = new AtomicReference<>(-1.0f);
        positionPieceMap.values().forEach(piece -> {
            valuesHolder.smallestX = (int) Math.min(valuesHolder.smallestX, piece.getPosition().getX());
            valuesHolder.largestZ = (int) Math.max(valuesHolder.largestZ, piece.getPosition().getZ());
        });
        valuesHolder.smallestX = Math.abs(valuesHolder.smallestX); // because smallestX will always be negative
        Piece[][] pieceArray = new Piece[valuesHolder.smallestX + 1][valuesHolder.largestZ + 1];

        piecesWalkableByPlayer.forEach(piece -> {
            int adjustedX = (int) ((piece.getPosition().getX() + valuesHolder.smallestX)/(CUBE_LENGTH_X));
            int adjustedZ = (int) ((piece.getPosition().getZ() + valuesHolder.largestZ)/(CUBE_LENGTH_Z));
            pieceArray[adjustedX][adjustedZ] = piece;
            if(piece.getPieceType().equals(PLAYER_PIECE) && piece.getPosition().equals(currentPlayerPosition)){
                playerPositionX.set(currentPlayerPosition.getX());
                playerPositionZ.set(currentPlayerPosition.getZ());
            }
        });
        System.out.println("Piece Array value for pieces on the same plane =>");
        for(Piece[] pieces: pieceArray){
            System.out.println("++++++++++++++++++++++++");
            System.out.println("+ "+Arrays.toString(pieces)+" +");
        }

        // perform bfs from current player's position in the array to check which possible 4-way direction can it move such that
        // the destination cube is on top and there is no player blocking the way
        // in between the cubes don't need to be on the top
        breadthFirstSearchForValidCubePositions(validPositionsToMove, pieceArray, currentPlayerPosition);
    }

    private void breadthFirstSearchForValidCubePositions(List<Position> validPositionsToMove, Piece[][] pieceArray, Position currentPlayerPosition) {
        if (pieceArray == null || pieceArray.length == 0 || pieceArray[0].length == 0) {
            System.out.println("PieceArray is not valid" + Arrays.deepToString(pieceArray));
            return;
        }
        Set<String> visitedPositionIndexes = new HashSet<>();
        int x = Math.round(currentPlayerPosition.getX());
        int y = Math.round(currentPlayerPosition.getY());
        int z = Math.round(currentPlayerPosition.getZ());
        bfs(visitedPositionIndexes, pieceArray, x+1, z);
        bfs(visitedPositionIndexes, pieceArray, x-1, z);
        bfs(visitedPositionIndexes, pieceArray, x, z+1);
        bfs(visitedPositionIndexes, pieceArray, x, z-1);

        List<Piece> cubePositionsOnSameLevel = visitedPositionIndexes.stream()
            .map(visitedPosition -> {
                return positionPieceMap.get(new Position(x, y, z));
            })
            .filter(piece -> {
                return piece.getPieceType().equals(CUBE_PIECE) && ((Cube) piece).isOnTop();
            })
            .collect(Collectors.toList());
        System.out.println("Cube Positions On Same Level That Can Be Reached: " + cubePositionsOnSameLevel);
        validPositionsToMove.addAll(cubePositionsOnSameLevel.stream().map(Piece::getPosition).collect(Collectors.toList()));
    }

    private void bfs(Set<String> visitedPositions, Piece[][] pieceArray, int x, int z) {
        if(x<0 || x>=pieceArray.length || z<0 || z>=pieceArray[x].length
            || pieceArray[x][z].getPieceType().equals(PLAYER_PIECE) || visitedPositions.contains(x+","+z)){
            return;
        }
        visitedPositions.add(x+","+z);
        bfs(visitedPositions, pieceArray, x+1, z);
        bfs(visitedPositions, pieceArray, x-1, z);
        bfs(visitedPositions, pieceArray, x, z+1);
        bfs(visitedPositions, pieceArray, x, z-1);
    }

    private void findAdjacentUpperLevelPositions(List<Position> validPositionsToMove, Climber currentPlayer) {
        // only just next cubes that are at y+1 level
        List<Position> temp = new ArrayList<>();
        List<Position> adjacentPositions = getFourDirectionalAdjacentPositions(currentPlayer).stream()
            .filter(position -> {
                return position.getY() == currentPlayer.getPosition().getY();
            }).collect(Collectors.toList());

        adjacentPositions.forEach(position -> {
            if(positionPieceMap.containsKey(position) && ((Cube) positionPieceMap.get(position)).isOnTop()){
                temp.add(position);
            }
        });
        System.out.println("Total adjacent positions one level up than player: " + currentPlayer.getPosition() + "->\n" + temp);
        validPositionsToMove.addAll(temp);
    }

    private List<Position> getFourDirectionalAdjacentPositions(Climber currentPlayer) {
        Position position = currentPlayer.getPosition();
        Map<String, Cube> highestCubeAtEachXZ = new HashMap<>();
        positionPieceMap.values().stream()
//            .filter(piece -> piece.getPosition().getY() -1 == currentPlayer.getPosition().getY()) => this shpould be only in case of next upper adjacent
//            position logic
            .filter(piece -> piece.getPieceType().equals(CUBE_PIECE))
            .forEach(piece -> {
                Cube cube = (Cube) piece;
                String currentXZ = cube.getPosition().getX()+","+ cube.getPosition().getZ();
                if(highestCubeAtEachXZ.containsKey(currentXZ) && highestCubeAtEachXZ.get(currentXZ).getPosition().getY() == cube.getPosition().getY()) {
                    highestCubeAtEachXZ.put(currentXZ, cube);
                } else if (!highestCubeAtEachXZ.containsKey(currentXZ)) {
                    highestCubeAtEachXZ.put(currentXZ, cube);
                } else {
                    System.out.println("Not updating the current cube info" + cube);
                }
            });
//        System.out.println("highestCubeAtSameXZ: ");
//        highestCubeAtSameXZ.values().forEach(System.out::println);

        Position p1 = new Position(position);
        p1.setX(p1.getX() - CUBE_LENGTH_X);
        checkMapContainsXZEntryForCurrentPlayer(currentPlayer, highestCubeAtEachXZ, p1);

        Position p2 = new Position(position);
        p2.setX(p2.getX() + CUBE_LENGTH_X);
        checkMapContainsXZEntryForCurrentPlayer(currentPlayer, highestCubeAtEachXZ, p2);

        Position p3 = new Position(position);
        p3.setZ(p3.getZ() - CUBE_LENGTH_Z);
        checkMapContainsXZEntryForCurrentPlayer(currentPlayer, highestCubeAtEachXZ, p3);

        Position p4 = new Position(position);
        p4.setZ(p4.getZ() + CUBE_LENGTH_Z);
        checkMapContainsXZEntryForCurrentPlayer(currentPlayer, highestCubeAtEachXZ, p4);
        return new ArrayList<>(List.of(p1, p2, p3, p4));
    }

    private void checkMapContainsXZEntryForCurrentPlayer(Climber currentPlayer, Map<String, Cube> highestCubeAtEachXZ, Position p) {
        if(highestCubeAtEachXZ.containsKey(p.getX()+","+ p.getZ())) {
            p.setY(highestCubeAtEachXZ.get(p.getX()+","+ p.getZ()).getPosition().getY());
        } else {
            p.setY(0);
        }
        highestCubeAtEachXZ.put(p.getX()+","+ p.getZ(), new Cube(-1, p, currentPlayer.getId()+"", true));
    }

    private void findAdjacentLowerLevelPositions(List<Position> validPositionsToMove, Climber currentPlayer) {
        List<Position> adjacentPositions = getFourDirectionalAdjacentPositions(currentPlayer)
            .stream().filter(cubePosition -> {
                // the highest cube's position should be lower than current player's y
                return cubePosition.getY() < currentPlayer.getPosition().getY();
            }).collect(Collectors.toList());
        System.out.println("Adjacent cells lower than current player: " + adjacentPositions);
        validPositionsToMove.addAll(adjacentPositions);
        // generate adjacent xz pair keys and
        // check if the map contains any cubes at that xz
        // check if they have y < currentplayer position.y
        // if no cube then it can be a ground position
        // if there are cubes, then top place can be a valid position if it is lower
    }
}
