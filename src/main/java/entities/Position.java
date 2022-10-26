package entities;

import java.util.Objects;

public class Position {
    float x;
    float y;
    float z;

    public Position(float x, float y, float z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public Position(Position position) {
        this.x =position.x;
        this.y=position.y;
        this.z=position.z;
    }

    public float getX() {
        return x;
    }

    public void setX(float x) {
        this.x = x;
    }

    public float getY() {
        return y;
    }

    public void setY(float y) {
        this.y = y;
    }

    public float getZ() {
        return z;
    }

    public void setZ(float z) {
        this.z = z;
    }

    @Override
    public String toString() {
        return "(" +
            "x=" + x +
            ", y=" + y +
            ", z=" + z +
            ')';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Position position = (Position) o;
        return Float.compare(position.x, x) == 0 && Float.compare(position.y, y) == 0 && Float.compare(position.z, z) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x+","+y+","+z);
    }
}
