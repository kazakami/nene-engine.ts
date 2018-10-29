import * as CANNON from "cannon";
import * as THREE from "three";
import { core, Start } from "./kzkm-engine.ts/src/Core";
import { PhysicBox, PhysicObject, PhysicObjects, PhysicSphere } from "./kzkm-engine.ts/src/PhysicObject";
import { Scene } from "./kzkm-engine.ts/src/Scene";
import { Unit } from "./kzkm-engine.ts/src/Unit";

class LoadScene extends Scene {
    public Init(): void {
        super.Init();
        core.LoadObjMtl("resources/ente progress_export.obj", "resources/ente progress_export.mtl", "ente");
    }
    public Update(): void {
        super.Update();
        if (core.IsObjectAvailable("ente")) {
            // オブジェクトenteが読み込まれればルーム遷移
            core.AddScene("game", new GameScene());
            core.ChangeScene("game");
        } else {
            // console.log("now loading model");
        }
    }
}

class GameScene extends Scene {
    public sprt: THREE.Sprite;
    public Init(): void {
        super.Init();
        // this.LoadFromFile("resources/PhysicObjects.json");
        this.AddUnit(new Board());
        this.AddUnit(new Ball());
        this.camera.position.z = 15;
        this.camera.position.y = 15;
        this.camera.lookAt(0, 0, 0);
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        const mat = new THREE.SpriteMaterial({ color: 0xFF0000 });
        this.sprt = new THREE.Sprite(mat);
        this.sprt.scale.set(10, 10, 1);
        this.scene2d.add(this.sprt);
        this.onMouseClickCallback = (e) => {
            core.SaveImage("ScreenShot.png");
        };
    }
    public Update(): void {
        super.Update();
        this.sprt.position.set(0, 0, 1);
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
        this.floor.OrientAndRotate(core.mouseX - core.windowSizeX / 2, 100, core.mouseY - core.windowSizeY / 2
            , this.frame / 100 * 0);
    }
    public Fin(): void {
        return;
    }
}

// ゲームの開始
Start("init", new LoadScene());
