package service;

import static config.CommonConfiguration.playersList;
import static config.CommonConfiguration.positionPieceMap;

import java.util.ArrayList;
import java.util.List;

import config.CommonConfiguration;
import entities.Climber;
import entities.ClimberColour;
import entities.Position;
import entities.PowerCard;

public class PlayerService {

    public void initialisePlayers(int numberOfPlayers) {
        playersList = new ArrayList<>();
        for(int i=0; i<numberOfPlayers; i++) {
            Climber player = new Climber(i, getTotalCubes(numberOfPlayers), getAvailablePosition(), getAvailableColour(), getRandomPowerCards(), true, true, true);
            playersList.add(player);
            positionPieceMap.put(player.getPosition(), player);
            System.out.println("Player initialised: " + player);
        }
    }

    private int getTotalCubes(int numberOfPlayers) {
        switch (numberOfPlayers) {
            case 2:
                return 28;
            case 3:
                return 18;
            case 4:
                return 14;
            default:
                return 0;
        }
    }

    private List<PowerCard> getRandomPowerCards() {
        PowerCard powerCard1 = CommonConfiguration.availablePowerCards.stream().findAny().get();
        CommonConfiguration.availablePowerCards.remove(powerCard1);

        PowerCard powerCard2 = CommonConfiguration.availablePowerCards.stream().findAny().get();
        CommonConfiguration.availablePowerCards.remove(powerCard2);

        return List.of(powerCard1, powerCard2);
    }

    private ClimberColour getAvailableColour() {
        ClimberColour colour = CommonConfiguration.availablePlayerColours.stream().findAny().get();
        CommonConfiguration.availablePlayerColours.remove(colour);
        return colour;
    }

    private Position getAvailablePosition() {
        Position position = CommonConfiguration.availablePlayerPositions.stream().findAny().get();
        CommonConfiguration.availablePlayerPositions.remove(position);
        return position;
    }
}
