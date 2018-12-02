import * as THREE from "three";
import { Scene, Start, Unit } from "../src/nene-engine";

class LoadScene extends Scene {
    public Init() {
        this.core.LoadObjMtl("resources/models/ente progress_export.obj",
                             "resources/models/ente progress_export.mtl", "ente");
        this.core.LoadObjMtl("resources/models/progress_export.obj", "resources/models/progress_export.mtl", "plane");
    }
    public Update(): void {
        if (this.core.IsAllResourcesAvailable()) {
            // オブジェクトenteが読み込まれればシーン遷移
            this.core.AddAndChangeScene("game", new GameScene());
        }
    }
    public DrawText(): void {
        const [a, b] = this.core.GetAllResourcesLoadingProgress();
        this.core.DrawText("Now Loading " + a + "/" + b, 0, 0);
    }
}

class GameScene extends Scene {
    public Init() {
        this.backgroundColor = new THREE.Color(0x887766);
        this.AddUnit(new Player());
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
    }
}

class Player extends Unit {
    private plane: THREE.Object3D;
    private x: number = 0;
    private y: number = 0;
    private z: number = 0;
    private rot: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1);
    public Init() {
        this.plane = this.core.GetObject("plane");
        this.AddObject(this.plane);
    }
    public Update() {
        const v = new THREE.Vector3(0, -0.3, 1);
        v.applyQuaternion(this.rot);
        const dis = 20;
        v.multiplyScalar(dis);
        this.scene.camera.position.set(this.x - v.x, this.y - v.y, this.z - v.z);
        this.scene.camera.lookAt(this.x, this.y, this.z);
    }
}

const c = Start("initScene", new LoadScene());
