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
    }
    public Update(): void {
        super.Update();
        if (this.core.IsObjectAvailable("ente")) {
            // オブジェクトenteが読み込まれればルーム遷移
            this.core.AddScene("game", new GameScene());
            this.core.ChangeScene("game");
        } else {
            // console.log("now loading model");
        }
    }
}

class GameScene extends Scene {
    public sprt: THREE.Sprite;
    public Init(): void {
        super.Init();
        this.AddUnit(new Board());
        this.AddUnit(new Ball());
        this.camera.position.z = 15;
        this.camera.position.y = 15;
        this.camera.lookAt(0, 0, 0);
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        const tex = this.core.textureLoader.load("resources/png_alphablend_test.png");
        const mat = new THREE.SpriteMaterial({ color: 0xFFFFFF, map: tex });
        this.sprt = new THREE.Sprite(mat);
        mat.dispose();
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
    public Init(): void {
        this.ball = new PhysicSphere(1, 1);
        this.ball.phyBody.position.set(0, 10, 0);
        this.AddPhysicObject(this.ball);
        this.ball.SetCollideCallback((c) => {
            console.log(c.position);
        });
    }
    public Fin(): void {
        return;
    }
}

class Board extends Unit {
    public floor: PhysicObjects;
    public Init(): void {
        this.floor = new PhysicObjects(0, "floor");
        this.floor.phyBody.position.set(0, -10, 0);
        this.floor.AddShapeFromJSON("resources/FloorPhysic.json");
        this.AddPhysicObject(this.floor);
        return;
    }
    public Update(): void {
        super.Update();
        this.floor.OrientAndRotate(
            this.core.mouseX,
            100,
            - this.core.mouseY,
            this.frame / 100 * 0);
    }
    public Fin(): void {
        return;
    }
}

// ゲームの開始
Start("init", new LoadScene());
