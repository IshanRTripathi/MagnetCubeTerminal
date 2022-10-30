package service.actions;

import static config.CommonConfiguration.BLANK;
import static config.CommonConfiguration.CUBE_LENGTH_X;
import static config.CommonConfiguration.CUBE_LENGTH_Y;
import static config.CommonConfiguration.CUBE_LENGTH_Z;
import static config.CommonConfiguration.CUBE_PIECE;
import static config.CommonConfiguration.GRAPPLE;
import static config.CommonConfiguration.PLAYER_PIECE;
import static config.CommonConfiguration.WIND;
import static config.CommonConfiguration.playersList;
import static config.CommonConfiguration.positionPieceMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.stream.Collectors;

import entities.Climber;
import entities.Cube;
import entities.Piece;
import entities.Position;

public class RollDiceActionService {

    private final Scanner sc = new Scanner(System.in);
    final static List<String> diceValues = new ArrayList<>(List.of(GRAPPLE, GRAPPLE, GRAPPLE, BLANK, BLANK, WIND));

    public String getRandomDiceValue(){
        return diceValues.get((int) ((Math.round(Math.random()*53))%6));
    }

    public void performRollAction(Climber currentPlayer) {
        if(!currentPlayer.getCanRoll()){
            System.out.println("Player already rolled the dice");
            return;
        }
        System.out.println("Rolling the dice for player " + currentPlayer);
        String diceOutput = getRandomDiceValue();
        System.out.println("Dice output: " + diceOutput);

        switch (diceOutput) {
            case GRAPPLE:
                performGrappleAction(currentPlayer);
                break;
            case WIND:
                performWindAction(currentPlayer);
                break;
            case BLANK:
                performBlankAction(currentPlayer);
                break;
            default:
                System.out.println("Invalid dice roll output");
        }
    }

    private void performBlankAction(Climber currentPlayer) {
        System.out.println("Performing blank action");
        currentPlayer.setCanRoll(false);
        positionPieceMap.put(currentPlayer.getPosition(), currentPlayer);
    }

    private void performWindAction(Climber currentPlayer) {
        boolean movementDone = false;
        while(!movementDone) {
            System.out.println("Enter W to shift ALL players in the forward direction i.e away from camera");
            System.out.println("Enter A to shift ALL players in the left direction");
            System.out.println("Enter S to shift ALL players in the backward direction i.e towards the camera");
            System.out.println("Enter D to shift ALL players in the right direction");

            String choice = sc.nextLine();

            switch (choice) {
                case "W":
                    movementDone = movePlayersInForwardDirection();
                    break;
                case "A":
                    movementDone = movePlayersInLeftDirection();
                    break;
                case "S":
                    movementDone = movePlayersInBackwardDirection();
                    break;
                case "D":
                    movementDone = movePlayersInRightDirection();
                    break;
                default:
                    System.out.println("Invalid input: " + choice);
            }
        }
        currentPlayer.setCanRoll(false);
        positionPieceMap.put(currentPlayer.getPosition(), currentPlayer);
    }

    private boolean movePlayersInForwardDirection() {
        Map<Position, Piece> updatedPositionPieceMap = new HashMap<>();
        List<Position> positionsToRemoveFromMap = new ArrayList<>();
        positionPieceMap.values()
            .stream().filter(piece -> piece.getPieceType().equals(PLAYER_PIECE))
            .forEach(piece -> {
                Position piecePosition = piece.getPosition();
                positionsToRemoveFromMap.add(piecePosition);
                piecePosition.setX(piecePosition.getZ() + CUBE_LENGTH_Z);
                if(positionPieceMap.containsKey(piecePosition)){
                    if(positionPieceMap.get(piecePosition).getPosition().getY() <= piecePosition.getY()) {
                        // shift to the position
                        System.out.println("Shifting position to new column in the back");
                        piecePosition.setY(positionPieceMap.get(piecePosition).getPosition().getY());
                        piece.setPosition(piecePosition);
                        updatedPositionPieceMap.put(piecePosition, piece);
                    } else {
                        // cannot shift player because of a blocker
                        positionsToRemoveFromMap.remove(positionsToRemoveFromMap.size()-1);
                        System.out.println("Cannot shift player because of a blocker");
                    }
                } else {
                    // shift player to ground position
                    System.out.println("Shifting position to ground level as now new column exists");
                    piecePosition.setY(0);
                    piece.setPosition(piecePosition);
                    updatedPositionPieceMap.put(piecePosition, piece);
                }
            });
        System.out.println("Total pieces updated: " + updatedPositionPieceMap);
        positionsToRemoveFromMap.forEach(position -> positionPieceMap.remove(position));
        updatedPositionPieceMap.values().forEach(piece -> {
            positionPieceMap.put(piece.getPosition(), piece);
        });
        if(!updatedPositionPieceMap.isEmpty()) {
            System.out.println("New layout after using wind: " + positionPieceMap);
        } else {
            System.out.println("No changes made to the layout as no update to player positions");
        }
        return true;
    }

    private boolean movePlayersInLeftDirection() {
        Map<Position, Piece> updatedPositionPieceMap = new HashMap<>();
        List<Position> positionsToRemoveFromMap = new ArrayList<>();
        positionPieceMap.values()
            .stream().filter(piece -> piece.getPieceType().equals(PLAYER_PIECE))
            .forEach(piece -> {
                Position piecePosition = piece.getPosition();
                positionsToRemoveFromMap.add(piecePosition);
                piecePosition.setX(piecePosition.getX() - CUBE_LENGTH_X);
                if(positionPieceMap.containsKey(piecePosition)){
                    if(positionPieceMap.get(piecePosition).getPosition().getY() <= piecePosition.getY()) {
                        // shift to the position
                        System.out.println("Shifting position to new column in the left");
                        piecePosition.setY(positionPieceMap.get(piecePosition).getPosition().getY());
                        piece.setPosition(piecePosition);
                        updatedPositionPieceMap.put(piecePosition, piece);
                    } else {
                        // cannot shift player because of a blocker
                        positionsToRemoveFromMap.remove(positionsToRemoveFromMap.size()-1);
                        System.out.println("Cannot shift player because of a blocker");
                    }
                } else {
                    // shift player to ground position
                    System.out.println("Shifting position to ground level as now new column exists");
                    piecePosition.setY(0);
                    piece.setPosition(piecePosition);
                    updatedPositionPieceMap.put(piecePosition, piece);
                }
            });
        System.out.println("Total pieces updated: " + updatedPositionPieceMap);
        positionsToRemoveFromMap.forEach(position -> positionPieceMap.remove(position));
        updatedPositionPieceMap.values().forEach(piece -> {
            positionPieceMap.put(piece.getPosition(), piece);
        });
        if(!updatedPositionPieceMap.isEmpty()) {
            System.out.println("New layout after using wind: " + positionPieceMap);
        } else {
            System.out.println("No changes made to the layout as no update to player positions");
        }
        return true;
    }

    private boolean movePlayersInBackwardDirection() {
        Map<Position, Piece> updatedPositionPieceMap = new HashMap<>();
        List<Position> positionsToRemoveFromMap = new ArrayList<>();
        positionPieceMap.values()
            .stream().filter(piece -> piece.getPieceType().equals(PLAYER_PIECE))
            .forEach(piece -> {
                Position piecePosition = piece.getPosition();
                positionsToRemoveFromMap.add(piecePosition);
                piecePosition.setX(piecePosition.getZ() - CUBE_LENGTH_Z);
                if(positionPieceMap.containsKey(piecePosition)){
                    if(positionPieceMap.get(piecePosition).getPosition().getY() <= piecePosition.getY()) {
                        // shift to the position
                        System.out.println("Shifting position to new column in the back");
                        piecePosition.setY(positionPieceMap.get(piecePosition).getPosition().getY());
                        piece.setPosition(piecePosition);
                        updatedPositionPieceMap.put(piecePosition, piece);
                    } else {
                        // cannot shift player because of a blocker
                        positionsToRemoveFromMap.remove(positionsToRemoveFromMap.size()-1);
                        System.out.println("Cannot shift player because of a blocker");
                    }
                } else {
                    // shift player to ground position
                    System.out.println("Shifting position to ground level as now new column exists");
                    piecePosition.setY(0);
                    piece.setPosition(piecePosition);
                    updatedPositionPieceMap.put(piecePosition, piece);
                }
            });
        System.out.println("Total pieces updated: " + updatedPositionPieceMap);
        positionsToRemoveFromMap.forEach(position -> positionPieceMap.remove(position));
        updatedPositionPieceMap.values().forEach(piece -> {
            positionPieceMap.put(piece.getPosition(), piece);
        });
        if(!updatedPositionPieceMap.isEmpty()) {
            System.out.println("New layout after using wind: " + positionPieceMap);
        } else {
            System.out.println("No changes made to the layout as no update to player positions");
        }
        return true;
    }

    private boolean movePlayersInRightDirection() {
        Map<Position, Piece> updatedPositionPieceMap = new HashMap<>();
        List<Position> positionsToRemoveFromMap = new ArrayList<>();
        positionPieceMap.values()
            .stream().filter(piece -> piece.getPieceType().equals(PLAYER_PIECE))
            .forEach(piece -> {
                Position piecePosition = piece.getPosition();
                positionsToRemoveFromMap.add(piecePosition);
                piecePosition.setX(piecePosition.getX() + CUBE_LENGTH_X);
                if(positionPieceMap.containsKey(piecePosition)){
                    if(positionPieceMap.get(piecePosition).getPosition().getY() <= piecePosition.getY()) {
                        // shift to the position
                        System.out.println("Shifting position to new column in the right");
                        piecePosition.setY(positionPieceMap.get(piecePosition).getPosition().getY());
                        piece.setPosition(piecePosition);
                        updatedPositionPieceMap.put(piecePosition, piece);
                    } else {
                        // cannot shift player because of a blocker
                        positionsToRemoveFromMap.remove(positionsToRemoveFromMap.size()-1);
                        System.out.println("Cannot shift player because of a blocker");
                    }
                } else {
                    // shift player to ground position
                    System.out.println("Shifting position to ground level as now new column exists");
                    piecePosition.setY(0);
                    piece.setPosition(piecePosition);
                    updatedPositionPieceMap.put(piecePosition, piece);
                }
            });
        System.out.println("Total pieces updated: " + updatedPositionPieceMap);
        positionsToRemoveFromMap.forEach(position -> positionPieceMap.remove(position));
        updatedPositionPieceMap.values().forEach(piece -> {
            positionPieceMap.put(piece.getPosition(), piece);
        });
        if(!updatedPositionPieceMap.isEmpty()) {
            System.out.println("New layout after using wind: " + positionPieceMap);
        } else {
            System.out.println("No changes made to the layout as no update to player positions");
        }
        return true;
    }

    private void performGrappleAction(Climber currentPlayer) {
        Position playerPosition = currentPlayer.getPosition();
        List<Position> possiblePositions = getAllPossiblePositionsToGrapple(playerPosition);
        System.out.println("Possible grappling positions: " + possiblePositions);
        while(true) {
            System.out.println("Enter x-coordinate of the cell");
            int x = Integer.parseInt(sc.nextLine());
            System.out.println("Enter y-coordinate of the cell");
            int y = Integer.parseInt(sc.nextLine());
            System.out.println("Enter z-coordinate of the cell");
            int z = Integer.parseInt(sc.nextLine());

            Position position = new Position(x, y, z);

            if (possiblePositions.contains(position)) {
                System.out.println("Moving player from " + playerPosition + " => " + position);
                positionPieceMap.remove(playerPosition);
                currentPlayer.setPosition(position);
                currentPlayer.setCanRoll(false);
                positionPieceMap.put(position, currentPlayer);
                System.out.println("All player status: " + playersList);
                break;
            } else {
                System.out.println("Enter valid input position");
            }
        }
        currentPlayer.setCanRoll(false);
        positionPieceMap.put(currentPlayer.getPosition(), currentPlayer);
    }

    private List<Position> getAllPossiblePositionsToGrapple(Position playerPosition) {
        return positionPieceMap.values().stream()
            .filter(piece -> piece.getPieceType().equals(CUBE_PIECE))
            .filter(piece -> {
                // filter only 1 and 2 level up cubes
                return playerPosition.getY() + CUBE_LENGTH_Y == piece.getPosition().getY() ||
                    playerPosition.getY() + (2 * CUBE_LENGTH_Y) == piece.getPosition().getY();
            }).map(Piece::getPosition)
            .filter(cubePosition -> {
                // filter only adjacent positions to grapple
                return (cubePosition.getX() + CUBE_LENGTH_X == playerPosition.getX() && cubePosition.getZ() == playerPosition.getZ()) ||
                    (cubePosition.getX() - CUBE_LENGTH_X == playerPosition.getX() && cubePosition.getZ() == playerPosition.getZ()) ||
                    (cubePosition.getZ() + CUBE_LENGTH_Z == playerPosition.getZ() && cubePosition.getX() == playerPosition.getX()) ||
                    (cubePosition.getZ() - CUBE_LENGTH_Z == playerPosition.getZ() && cubePosition.getX() == playerPosition.getX());
            })
            .collect(Collectors.toList());
    }
}
