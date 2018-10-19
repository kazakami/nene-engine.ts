import * as THREE from "three";
import { core, Start } from "./kzkm-engine.ts/src/Core";
import { PhysicObject } from "./kzkm-engine.ts/src/PhysicObject";
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
    public Init(): void {
        return;
    }
    public Fin(): void {
        return;
    }
}

// const loader = new THREE.FileLoader();
// loader.load("index.html", (res) => { console.log(JSON.parse(res)); });

// ゲームの開始
Start("init", new LoadRoom());
