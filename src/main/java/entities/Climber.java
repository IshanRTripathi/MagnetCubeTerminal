package entities;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
public class Climber {
    int id;
    int totalCubes;
    Position position;
    ClimberColour colour;
    List<PowerCard> powerCards;
    Boolean canBuild;
    Boolean canMove;
    Boolean canRoll;

    public Climber(int id, int totalCubes, Position position, ClimberColour colour, List<PowerCard> powerCards, Boolean canBuild, Boolean canMove,
                   Boolean canRoll) {
        this.id = id;
        this.totalCubes = totalCubes;
        this.position = position;
        this.colour = colour;
        this.powerCards = powerCards;
        this.canBuild = canBuild;
        this.canMove = canMove;
        this.canRoll = canRoll;
    }

    @Override
    public String toString() {
        return "Climber{" +
            "id=" + id +
            ", totalCubes=" + totalCubes +
            ", position=" + position +
            ", colour=" + colour +
            ", powerCards=" + powerCards +
            ", canBuild=" + canBuild +
            ", canMove=" + canMove +
            ", canRoll=" + canRoll +
            '}';
    }
}
