import * as CANNON from "cannon";
import * as THREE from "three";
import { core, Start } from "./kzkm-engine.ts/src/Core";
import { PhysicBox, PhysicObject } from "./kzkm-engine.ts/src/PhysicObject";
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
        // this.LoadFromFile("resources/PhysicObjects.json");
        this.AddUnit(new Board());
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

class Board extends Unit {
    public floor: PhysicObject;
    public normal: THREE.Vector3;
    public Init(): void {
        this.floor = new PhysicBox(0, 20, 1, 20);
        this.AddPhysicObject(this.floor);
        this.normal = new THREE.Vector3(1, 1, 1).normalize();
        return;
    }
    public Update(): void {
        super.Update();
        const up = new THREE.Vector3(0, 1, 0);
        const dir = new THREE.Vector3();
        dir.crossVectors(up, this.normal).normalize();
        const dot = up.dot(this.normal);
        const rad = Math.acos(dot);
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(dir, rad);
        console.log(rad);
        this.floor.PhyBody.quaternion.set(q.x, q.y, q.z, q.w);
    }
    public Fin(): void {
        return;
    }
}

// const loader = new THREE.FileLoader();
// loader.load("index.html", (res) => { console.log(JSON.parse(res)); });

// ゲームの開始
Start("init", new LoadRoom());
