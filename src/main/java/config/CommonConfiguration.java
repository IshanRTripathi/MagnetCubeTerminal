package config;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import entities.Climber;
import entities.ClimberColour;
import entities.Cube;
import entities.Position;
import entities.PowerCard;

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
    public static Map<Position, Climber> positionPlayerMap = new HashMap<>();

    public static int usedCubes = 0;

    public static List<Climber> playersList;

    public static final String BUILD_ACTION = "1";
    public static final String MOVE_ACTION = "2";
    public static final String ROLL_ACTION = "3";

    public static final Integer MAXIMUM_BUILD_CAPACITY = 2;

    public static final Integer CUBE_LENGTH_X = 2;
    public static final Integer CUBE_LENGTH_Y = 2;
    public static final Integer CUBE_LENGTH_Z = 2;
}
