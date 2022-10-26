package entities;

import static config.CommonConfiguration.PLAYER_PIECE;

import java.util.List;

public class Climber implements Piece{
    int id;
    int totalCubes;
    Position position;
    ClimberColour colour;
    List<PowerCard> powerCards;
    Boolean canBuild;
    Boolean canMove;
    Boolean canRoll;
    String pieceType = PLAYER_PIECE;

    public Climber(int id, int totalCubes, Position position, ClimberColour colour,
                   List<PowerCard> powerCards, Boolean canBuild, Boolean canMove, Boolean canRoll) {
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
    public String getPieceType() {
        return pieceType;
    }

    public int getId() {
        return id;
    }

    public int getTotalCubes() {
        return totalCubes;
    }

    @Override
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

    public void setId(int id) {
        this.id = id;
    }

    public void setTotalCubes(int totalCubes) {
        this.totalCubes = totalCubes;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public void setColour(ClimberColour colour) {
        this.colour = colour;
    }

    public void setPowerCards(List<PowerCard> powerCards) {
        this.powerCards = powerCards;
    }

    public void setCanBuild(Boolean canBuild) {
        this.canBuild = canBuild;
    }

    public void setCanMove(Boolean canMove) {
        this.canMove = canMove;
    }

    public void setCanRoll(Boolean canRoll) {
        this.canRoll = canRoll;
    }

    @Override
    public String toString() {
//        return "P"+id+"_";
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
