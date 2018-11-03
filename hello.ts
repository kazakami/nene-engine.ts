import * as CANNON from "cannon";
import * as THREE from "three";
import { Start } from "./kzkm-engine.ts/src/Core";
import { PhysicBox, PhysicObject, PhysicObjects, PhysicSphere } from "./kzkm-engine.ts/src/PhysicObject";
import { Scene } from "./kzkm-engine.ts/src/Scene";
import { Unit } from "./kzkm-engine.ts/src/Unit";

class LoadScene extends Scene {
    public Init(): void {
        super.Init();
        this.core.LoadObjMtl("resources/ente progress_export.obj", "resources/ente progress_export.mtl", "ente");
        this.core.LoadObjMtl("resources/ball.obj", "resources/ball.mtl", "ball");
        this.core.LoadTexture("resources/png_alphablend_test.png", "circle");
    }
    public Update(): void {
        super.Update();
        if (this.core.IsAllResourcesAvaiable()) {
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
        this.AddUnit(new Board());
        this.AddUnit(new Ball(0, 10, 0));
        this.AddUnit(new Ball(5, 5, 0));
        this.AddUnit(new Ball(0, 3, 4));
        this.camera.position.z = 15;
        this.camera.position.y = 15;
        this.camera.lookAt(0, 0, 0);
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        this.sprt = this.core.MakeSpriteFromTexture("circle");
        this.sprt.scale.set(100, 100, 1);
        this.scene2d.add(this.sprt);
        this.onMouseClickCallback = (e) => {
            this.core.SaveImage("ScreenShot.png");
        };
        this.onWindowResizeCallback = (e) => {
            this.core.ChangeCanvasSize(window.innerWidth, window.innerHeight);
        };
    }
    public Update(): void {
        super.Update();
        this.sprt.position.set(this.core.mouseX, this.core.mouseY, 1);
    }
}

class Ball extends Unit {
    public ball: PhysicSphere;
    private x: number;
    private y: number;
    private z: number;
    constructor(x = 0, y = 0, z = 0) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
    public Init(): void {
        this.ball = new PhysicSphere(1, 1, this.core.GetObject("ball"));
        this.ball.position.set(this.x, this.y, this.z);
        this.AddPhysicObject(this.ball);
        this.ball.SetCollideCallback((c) => {
            console.log(c.position);
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
        this.floor.AddShapeFromJSON("resources/FloorPhysic.json");
        this.AddPhysicObject(this.floor);
    }
    public Update(): void {
        super.Update();
        this.floor.OrientAndRotate(
            this.core.mouseX,
            100,
            -this.core.mouseY,
            this.frame / 100 * 0);
    }
}

// ゲームの開始
Start("init", new LoadScene());
