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

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public String getPlacedBy() {
        return placedBy;
    }

    public void setPlacedBy(String placedBy) {
        this.placedBy = placedBy;
    }

    public boolean getOnTop() {
        return isOnTop;
    }

    public void setOnTop(boolean onTop) {
        isOnTop = onTop;
    }

    @Override
    public String toString() {
        return "Cube{" +
            "\n, id=" + id +
            "\n, position=" + position +
            "\n, placedBy=" + placedBy +
            "\n, isOnTop=" + isOnTop +
            "\n}";
    }
}
