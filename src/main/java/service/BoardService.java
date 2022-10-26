package service;

import static config.CommonConfiguration.positionPieceMap;
import static config.CommonConfiguration.usedCubes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import entities.Cube;
import entities.Piece;
import entities.Position;

public class BoardService {

    public void initialiseBoard() {
        Position position = null;

        // top right
        position = new Position(1, 0, 1);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));
        position = new Position(1, 0, 3);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));
        position = new Position(3, 0, 1);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));

        // top left
        position = new Position(-1, 0, 1);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));
        position = new Position(-1, 0, 3);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));
        position = new Position(-3, 0, 1);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));

        // bottom left
        position = new Position(-1, 0, -1);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));
        position = new Position(-1, 0, -3);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));
        position = new Position(-3, 0, -1);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));

        // bottom right
        position = new Position(1, 0, -1);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));
        position = new Position(1, 0, -3);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));
        position = new Position(3, 0, -1);
        positionPieceMap.put(position, new Cube(usedCubes++, position, "COMPUTER", true));

        System.out.println("Board Initialised: "+ positionPieceMap);
    }

    public void printBoardLayout(int level) {
        Map<Integer, List<Piece>> levelWisePieces = new HashMap<>();
        positionPieceMap.values().forEach(piece -> {
            int playerLevel = Math.round(piece.getPosition().getY());
            if(!levelWisePieces.containsKey(playerLevel)){
                levelWisePieces.put(playerLevel, new ArrayList<>());
            }
            levelWisePieces.get(playerLevel).add(piece);
        });
        System.out.println(levelWisePieces.get(level));
    }
}
