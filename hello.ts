import * as Cannon from "cannon";
import * as THREE from "three";
import { core, Start } from "./kzkm-engine.ts/src/Core";
import { PhysicBox, PhysicObject, PhysicPlane, PhysicSphere } from "./kzkm-engine.ts/src/PhysicObject";
import { Room } from "./kzkm-engine.ts/src/Room";
import { Unit } from "./kzkm-engine.ts/src/Unit";

class LoadRoom extends Room {
    public Init(): void {
        super.Init();
        core.LoadObjMtl("resources/ente progress_export.obj", "resources/ente progress_export.mtl", "ente");
    }
    public Update(): void {
        super.Update();
        if (core.IsObjectAvailable("ente")) {
            // オブジェクトenteが読み込まれればルーム遷移
            core.AddRoom("game", new GameRoom());
            core.ChangeRoom("game");
        } else {
            // console.log("now loading model");
        }
    }
}

class GameRoom extends Room {
    public sprt: THREE.Sprite;
    public Init(): void {
        super.Init();
        this.AddUnit(new Physic());
        this.camera.position.z = 10;
        this.camera.position.y = 10;
        this.camera.lookAt(0, 0, 0);
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        const mat = new THREE.SpriteMaterial({ color: 0xFF0000 });
        this.sprt = new THREE.Sprite(mat);
        this.sprt.scale.set(100, 100, 1);
        this.scene2d.add(this.sprt);
    }
    public Update(): void {
        super.Update();
        this.sprt.position.set(core.mouseX, core.mouseY, -1);
    }
}

class Physic extends Unit {
    public plane: PhysicPlane;
    public Draw(): void {
        return;
    }
    public Init(): void {
        this.plane = new PhysicPlane(0);
        const sphere1 = new PhysicSphere(1, 1);
        const sphere2 = new PhysicSphere(1, 1);
        const sphere3 = new PhysicSphere(1, 1);
        const box1 = new PhysicBox(1, 1, 1, 1);
        const box2 = new PhysicBox(1, 1, 1, 1);
        this.plane.PhyBody.quaternion.setFromAxisAngle(new Cannon.Vec3(1, 0, 0), -Math.PI / 2);
        sphere1.PhyBody.position.set(0, 10, 0);
        sphere2.PhyBody.position.set(1, 8, 0);
        sphere3.PhyBody.position.set(0, 6, 1);
        box1.PhyBody.position.set(1, 4, 1);
        box2.PhyBody.position.set(1, 2, 1);
        this.AddPhysicObject(this.plane);
        this.AddPhysicObject(sphere1);
        this.AddPhysicObject(sphere2);
        this.AddPhysicObject(sphere3);
        this.AddPhysicObject(box1);
        this.AddPhysicObject(box2);
    }
    public Update(): void {
        super.Update();
        this.plane.PhyBody.quaternion.setFromAxisAngle(new Cannon.Vec3(1, 0, 0),
          -Math.PI / 2 - 0.1 + 0 * Math.sin(this.frame / 100.0) / 5.0);
    }
    public Fin(): void {
        return;
    }
}

<<<<<<< HEAD
// const loader = new THREE.FileLoader();
// loader.load("index.html", (res) => { console.log(JSON.parse(res)); });
=======
const loader = new THREE.FileLoader();
loader.load("resources/PhysicObjects.json", (res) => { console.log(res); });
>>>>>>> 46c4b0890db2e55329a803ecb98a895d7db15c8c

// ゲームの開始
Start("init", new LoadRoom());
