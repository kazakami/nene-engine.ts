abstract class Figure {
    public x: number;
    public y: number;
}

class Point extends Figure {}

class Circle extends Figure {
    public radius: number;
}
