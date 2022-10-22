package entities;

public class Cube {
    int id;
    Position position;
    String placedBy;
    boolean isOnTop;

    public Cube(int id, Position position, String placedBy, boolean isOnTop) {
        this.id = id;
        this.position = position;
        this.placedBy = placedBy;
        this.isOnTop = isOnTop;
    }

    @Override
    public String toString() {
        return "Cube{" +
            "\nid=" + id +
            "\n, position=" + position +
            "\n, placedBy='" + placedBy + '\'' +
            "\n, isOnTop=" + isOnTop +
            "\n}";
    }
}
