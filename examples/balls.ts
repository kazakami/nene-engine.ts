import * as THREE from "three";
import { PhysicObjects, PhysicSphere, Random, RandomColor, Scene, Start, Unit } from "../src/nene-engine";

class LoadScene extends Scene {
    public Init(): void {
        super.Init();
        this.core.LoadObjMtl("resources/models/ente progress_export.obj",
                             "resources/models/ente progress_export.mtl", "ente");
        this.core.LoadObjMtl("resources/models/ball.obj", "resources/models/ball.mtl", "ball");
        this.core.LoadTexture("resources/images/png_alphablend_test.png", "circle");
        this.core.LoadTexture("resources/images/star.png", "star");
        this.core.LoadFile("resources/shaders/sample1.vert", "sample1.vert");
        this.core.LoadFile("resources/shaders/sample1.frag", "sample1.frag");
    }
    public Update(): void {
        super.Update();
        console.log(this.core.GetAllResourcesLoadingProgress());
        if (this.core.IsAllResourcesAvailable()) {
            console.log("change");
            // オブジェクトenteが読み込まれればシーン遷移
            this.core.AddAndChangeScene("game", new GameScene());
        } else {
            console.log("now loading resources");
        }
    }
}

class GameScene extends Scene {
    public sprt: THREE.Sprite;
    public Init(): void {
        super.Init();
        this.backgroundColor = new THREE.Color(0x887766);
        this.AddUnit(new Board());
        this.AddUnit(new Ball(0, 10, 0));
        this.AddUnit(new Ball(5, 5, 0, true));
        this.AddUnit(new Ball(0, 3, 4));
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        this.sprt = this.core.MakeSpriteFromTexture("circle");
        this.sprt.scale.set(100, 100, 1);
        this.scene2d.add(this.sprt);
        this.onMouseClickCallback = () => {
            // this.core.SaveImage("ScreenShot.png");
        };
        this.onWindowResizeCallback = () => {
            this.core.ChangeCanvasSize(window.innerWidth, window.innerHeight);
        };
    }
    public Update(): void {
        super.Update();
        this.sprt.position.set(this.core.mouseX, this.core.mouseY, 1);
    }
    public Draw(): void {
        super.Draw();
        this.core.DrawText("🍣" + this.core.fps.toString(), this.core.mouseX, this.core.mouseY);
    }
}

class Particle extends Unit {
    private sprite: THREE.Object3D;
    constructor(private x: number, private y: number, private z: number,
                private vx: number, private vy: number, private vz: number) {
        super();
    }
    public Init(): void {
        this.sprite = new THREE.Object3D();
        this.sprite.add(this.core.MakeSpriteFromTexture("star", RandomColor()));
        this.sprite.position.set(this.x, this.y, this.z);
        this.AddObject(this.sprite);
    }
    public Update(): void {
        super.Update();
        this.vy -= 9.8 / 60 / 60;
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        this.sprite.position.set(this.x, this.y, this.z);
        if (this.frame > 100) {
            this.isAlive = false;
        }
    }
}

class Ball extends Unit {
    public ball: PhysicSphere;
    constructor(private x = 0, private y = 0, private z = 0, private shaded = false) {
        super();
    }
    public Init(): void {
        if (this.shaded) {
            const geo = new THREE.SphereBufferGeometry(1, 10, 10);
            const mat = new THREE.ShaderMaterial({
                fragmentShader: this.core.GetText("sample1.frag"),
                uniforms: {
                    hoge: {value: 0.5},
                },
                vertexShader: this.core.GetText("sample1.vert"),
            });
            mat.uniforms.hoge = {value: 1.0};
            const mesh = new THREE.Mesh(geo, mat);
            this.ball = new PhysicSphere(1, 1, "ball", mesh);
        } else {
            this.ball = new PhysicSphere(1, 1, "ball", this.core.GetObject("ball"));
        }
        this.ball.position.set(this.x, this.y, this.z);
        this.AddPhysicObject(this.ball);
        this.ball.SetCollideCallback((c) => {
            const p = c.collidePosition;
            for (let i = 0; i < 10; i++) {
                this.scene.AddUnit(new Particle(
                    p.x, p.y, p.z,
                    Random(0.1), Random(0.1), Random(0.1)));
            }
        });
    }
    public Update(): void {
        super.Update();
        if (this.ball.position.y < -30) {
            this.ball.position.set(this.x, this.y, this.z);
            this.ball.velocity.set(0, 0, 0);
            this.ball.quaternion.set(0, 0, 0, 1);
            this.ball.angularVelocity.set(0, 0, 0);
        }
    }
}

class Board extends Unit {
    public floor: PhysicObjects;
    public Init(): void {
        this.floor = new PhysicObjects(0, "floor");
        this.floor.position.set(0, -10, 0);
        this.floor.AddShapeFromJSON("resources/jsons/FloorPhysic.json");
        this.AddPhysicObject(this.floor);
    }
    public Update(): void {
        super.Update();
        this.floor.OrientAndRotate(
            this.core.mouseX,
            100,
            -this.core.mouseY);
    }
}

// ゲームの開始
Start("init", new LoadScene());
