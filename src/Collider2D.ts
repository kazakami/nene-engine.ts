export abstract class Figure {
    public x: number;
    public y: number;
}

export class Point extends Figure {
    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
}

export class Circle extends Figure {
    public radius: number;
    constructor(x: number, y: number, raduis: number) {
        super();
        this.x = x;
        this.y = y;
        this.radius = raduis;
    }
}

export class Rectangle extends Figure {
    public width: number;
    public height: number;
    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export function collideTest(f1: Figure, f2: Figure): boolean {
    if (f1 instanceof Point) {
        if (f2 instanceof Point) {
            return f1.x === f2.x && f1.y === f2.y;
        } else if (f2 instanceof Circle) {
            return (f1.x - f2.x) ** 2 + (f1.y - f2.y) ** 2 <= f2.radius ** 2;
        } else if (f2 instanceof Rectangle) {
            return f2.x - f2.width / 2 <= f1.x && f2.x + f2.width / 2 >= f1.x
                && f2.y - f2.height / 2 <= f1.y && f2.y + f2.height / 2 >= f1.y;
        } else {
            throw Error("undefined collide: " + f1 + ", " + f2);
        }
    } else if (f1 instanceof Circle) {
        if (f2 instanceof Point) {
            return collideTest(f2, f1);
        } else if (f2 instanceof Circle) {
            return (f1.x - f2.x) ** 2 + (f1.y - f2.y) ** 2 <= (f1.radius + f2.radius) ** 2;
        } else if (f2 instanceof Rectangle) {
            return collideTest(new Rectangle(f2.x, f2.y, f2.width + f1.radius * 2, f2.height), new Point(f1.x, f1.y))
                || collideTest(new Rectangle(f2.x, f2.y, f2.width, f2.height + f1.radius * 2), new Point(f1.x, f1.y))
                || collideTest(new Circle(f2.x + f2.width / 2, f2.y + f2.height / 2, f1.radius), new Point(f1.x, f1.y))
                || collideTest(new Circle(f2.x + f2.width / 2, f2.y - f2.height / 2, f1.radius), new Point(f1.x, f1.y))
                || collideTest(new Circle(f2.x - f2.width / 2, f2.y + f2.height / 2, f1.radius), new Point(f1.x, f1.y))
                || collideTest(new Circle(f2.x - f2.width / 2, f2.y - f2.height / 2, f1.radius), new Point(f1.x, f1.y));
        } else {
            throw Error("undefined collide: " + f1 + ", " + f2);
        }
    } else if (f1 instanceof Rectangle) {
        if (f2 instanceof Point) {
            return collideTest(f2, f1);
        } else if (f2 instanceof Circle) {
            return collideTest(f2, f1);
        } else if (f2 instanceof Rectangle) {
            return Math.abs(f1.x - f2.x) <= (f1.width + f2.width) / 2
                && Math.abs(f1.y - f2.y) <= (f1.height + f2.height) / 2;
        } else {
            throw Error("undefined collide: " + f1 + ", " + f2);
        }
    } else {
        throw Error("unknown collide: " + f1);
    }
}
