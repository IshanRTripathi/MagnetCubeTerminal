package config;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import entities.Climber;
import entities.Cube;
import entities.PowerCard;
import entities.ClimberColour;
import entities.Position;

public class CommonConfiguration {
    public static final Set<Position> availablePlayerPositions = new HashSet<>(){{
        add(new Position(3, 0, 3));
        add(new Position(-3, 0, 3));
        add(new Position(3, 0, -3));
        add(new Position(-3, 0, -3));
    }};

    public static final Set<ClimberColour> availablePlayerColours = new HashSet<>(Arrays.asList(ClimberColour.values()));

    public static final Set<PowerCard> availablePowerCards = new HashSet<>(Arrays.asList(PowerCard.values()));

    public static Map<Position, Cube> positionCubeMap = new HashMap<>();

    public static int usedCubes = 0;

    public static List<Climber> playersList;
}
