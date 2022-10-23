package entities;

import java.util.List;

import lombok.Getter;

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

    public int getId() {
        return id;
    }

    public int getTotalCubes() {
        return totalCubes;
    }

    public Position getPosition() {
        return position;
    }

    public ClimberColour getColour() {
        return colour;
    }

    public List<PowerCard> getPowerCards() {
        return powerCards;
    }

    public Boolean getCanBuild() {
        return canBuild;
    }

    public Boolean getCanMove() {
        return canMove;
    }

    public Boolean getCanRoll() {
        return canRoll;
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
