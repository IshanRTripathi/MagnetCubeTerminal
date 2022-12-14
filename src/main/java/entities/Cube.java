package entities;

import static config.CommonConfiguration.CUBE_PIECE;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class Cube implements Piece{
    int id;
    Position position;
    String placedBy;
    boolean isOnTop;
    String pieceType = CUBE_PIECE;

    public Cube(int id, Position position, String placedBy, boolean isOnTop) {
        this.id = id;
        this.position = position;
        this.placedBy = placedBy;
        this.isOnTop = isOnTop;
    }

    @Override
    public String getPieceType() {
        return pieceType;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Override
    public Position getPosition() {
        return position;
    }

    @Override
    public void setPosition(Position position) {
        this.position = position;
    }

    public String getPlacedBy() {
        return placedBy;
    }

    public void setPlacedBy(String placedBy) {
        this.placedBy = placedBy;
    }

    public boolean isOnTop() {
        return isOnTop;
    }

    public void setOnTop(boolean onTop) {
        isOnTop = onTop;
    }

    @Override
    public String toString() {
//        return "C"+id+"_";
        return "Cube{" +
            "id=" + id +
            ", position=" + position +
            ", placedBy=" + placedBy +
            ", isOnTop=" + isOnTop +
            "}";
    }
}
