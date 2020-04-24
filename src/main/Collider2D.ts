import * as THREE from "three";

export abstract class Figure {
    public name: string = "";
    public helper: THREE.Object3D;
    public onCollideCallback: (figure: Figure) => void = null;
    /**
     * 当たり判定が有効か表す。デフォルトではtrue
     */
    public available = true;
    protected helperGenerated = false;
    private mX: number;
    private mY: number;
    public get x(): number { return this.mX; }
    public set x(x: number) {
        this.mX = x;
        if (this.helperGenerated) {
            this.SyncHelper();
        }
    }
    public get y(): number { return this.mY; }
    public set y(y: number) {
        this.mY = y;
        if (this.helperGenerated) {
            this.SyncHelper();
        }
    }
    /**
     * 当たり判定の範囲を表示するmeshを生成する
     * @param color 線の色。初期値は0xffffff
     */
    public GenerateHelper(color?: THREE.Color): void { this.helperGenerated = true; }
    public SyncHelper(): void { return; }
}

export class Point extends Figure {
    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
    public GenerateHelper(color: THREE.Color = new THREE.Color(0xffffff)): void {
        super.GenerateHelper();
        const mat = new THREE.PointsMaterial({ color: color });
        const geo = new THREE.Geometry();
        geo.vertices.push(new THREE.Vector3(0, 0, 0));
        this.helper = new THREE.Points(geo, mat);
        geo.dispose();
        mat.dispose();
        this.SyncHelper();
    }
    public SyncHelper(): void {
        this.helper.position.set(this.x, this.y, 2);
    }
}

export class Circle extends Figure {
    private mRadius: number;
    private mSegments: number = 16;
    public get segments(): number { return this.mSegments; }
    public set segments(segments: number) {
        this.mSegments = segments;
        if (this.helperGenerated) {
            this.GenerateHelper();
        }
    }
    public get radius(): number { return this.mRadius; }
    public set radius(radius: number) {
        this.mRadius = radius;
        if (this.helperGenerated) {
            this.GenerateHelper();
        }
    }
    constructor(x: number, y: number, raduis: number) {
        super();
        this.x = x;
        this.y = y;
        this.radius = raduis;
    }
    public GenerateHelper(color: THREE.Color = new THREE.Color(0xffffff)): void {
        super.GenerateHelper();
        const mat = new THREE.LineBasicMaterial({ color: color });
        const geo = new THREE.Geometry();
        for (let i = 0; i < this.mSegments + 1; i++) {
            geo.vertices.push(
                new THREE.Vector3(
                    this.mRadius * Math.cos(2 * Math.PI * (i / this.mSegments)),
                    this.mRadius * Math.sin(2 * Math.PI * (i / this.mSegments)),
                    0));
        }
        this.helper = new THREE.Line(geo, mat);
        geo.dispose();
        mat.dispose();
        this.SyncHelper();
    }
    public SyncHelper(): void {
        this.helper.position.set(this.x, this.y, 2);
    }
}

export class Rectangle extends Figure {
    private mWidth: number;
    private mHeight: number;
    public get width(): number { return this.mWidth; }
    public set width(width: number) {
        this.mWidth = width;
        if (this.helperGenerated) {
            this.GenerateHelper();
        }
    }
    public get height(): number { return this.mHeight; }
    public set height(height: number) {
        this.mHeight = height;
        if (this.helperGenerated) {
            this.GenerateHelper();
        }
    }
    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    public GenerateHelper(color: THREE.Color = new THREE.Color(0xffffff)): void {
        super.GenerateHelper();
        const mat = new THREE.LineBasicMaterial({ color: color });
        const geo = new THREE.Geometry();
        geo.vertices.push(
            new THREE.Vector3(this.width / 2, this.height / 2, 0),
            new THREE.Vector3(-this.width / 2, this.height / 2, 0),
            new THREE.Vector3(-this.width / 2, -this.height / 2, 0),
            new THREE.Vector3(this.width / 2, -this.height / 2, 0),
            new THREE.Vector3(this.width / 2, this.height / 2, 0),
        );
        this.helper = new THREE.Line(geo, mat);
        geo.dispose();
        mat.dispose();
        this.SyncHelper();
    }
    public SyncHelper(): void {
        this.helper.position.set(this.x, this.y, 2);
    }
}

export function collideTest(f1: Figure, f2: Figure): boolean {
    if (!f1.available || !f2.available) {
        return false;
    }
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

/**
 * 与えられた図形の配列の要素同士の当たり判定を行い、当たっていればonCollideCallbackを呼ぶ
 * @param figures 当たり判定を行う図形の配列
 */
export function collide(figures: Figure[]): void {
    const length = figures.length;
    for (let i = 0; i < length - 1; i++) {
        for (let j = i + 1; j < length; j++) {
            if (collideTest(figures[i], figures[j])) {
                if (figures[i].onCollideCallback) {
                    figures[i].onCollideCallback(figures[j]);
                }
                if (figures[j].onCollideCallback) {
                    figures[j].onCollideCallback(figures[i]);
                }
            }
        }
    }
}

/**
 * 図形のグループを2つ与え、グループ1とグループ2の間で当たっている図形があればonCollideCallbackよ呼ぶ
 * @param figures1 図形のグループ1
 * @param figures2 図形のグループ2
 */
export function collide2(figures1: Figure[], figures2: Figure[]) {
    const l1 = figures1.length;
    const l2 = figures2.length;
    for (let i = 0; i < l1; i++) {
        for (let j = 0; j < l2; j++) {
            if (collideTest(figures1[i], figures2[j])) {
                if (figures1[i].onCollideCallback) {
                    figures1[i].onCollideCallback(figures2[j]);
                }
                if (figures2[j].onCollideCallback) {
                    figures2[j].onCollideCallback(figures1[i]);
                }
            }
        }
    }
}
