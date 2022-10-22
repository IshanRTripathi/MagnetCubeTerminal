package entities;

public class Position {
    float x;
    float y;
    float z;

    public Position(float x, float y, float z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    @Override
    public String toString() {
        return "Position{" +
            "x=" + x +
            ", y=" + y +
            ", z=" + z +
            '}';
    }
}
