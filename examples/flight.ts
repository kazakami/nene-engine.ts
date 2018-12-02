import * as THREE from "three";
import { Scene, Start, Unit } from "../src/nene-engine";

class LoadScene extends Scene {
    public Init() {
        this.core.LoadObjMtl("resources/models/ente progress_export.obj",
                             "resources/models/ente progress_export.mtl", "ente");
        this.core.LoadObjMtl("resources/models/progress_export.obj", "resources/models/progress_export.mtl", "plane");
        this.core.LoadTexture("resources/images/grass.png", "grass");
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
        this.backgroundColor = new THREE.Color(0.6, 0.8, 0.9);
        this.scene.fog = new THREE.Fog(0xffffff, 1, 5000);
        const heights = (() => {
            const data = new Uint8Array(256 * 256);
            for (let i = 0; i < 256 * 256; i++) {
                data[i] = Math.random() * 0;
            }
            return data;
        })();
        const groundGeo = new THREE.PlaneBufferGeometry(1000, 1000, 255, 255);
        const vertices = groundGeo.attributes.position.array;
        const num = vertices.length;
        for (let i = 0; i < num; i++) {
            groundGeo.attributes.position.setZ(i, heights[i]);
        }
        const groundMat = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0.6, 0.4, 0.35),
            map: this.core.GetTexture("grass")});
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);
        this.AddUnit(new Player());
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
    }
}

class Player extends Unit {
    private plane: THREE.Object3D;
    private x: number = 0;
    private y: number = 10;
    private z: number = 0;
    private vx: number = 0;
    private vy: number = 0;
    private vz: number = 0;
    private rot: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1);
    public Init() {
        this.plane = this.core.GetObject("plane");
        this.AddObject(this.plane);
    }
    public Update() {
        const dir = new THREE.Vector3(0, 0, 1);
        dir.applyQuaternion(this.rot);
        const up = new THREE.Vector3(0, 1, 0);
        up.applyQuaternion(this.rot);
        const pitchAxis = new THREE.Vector3(1, 0, 0);
        pitchAxis.applyQuaternion(this.rot);
        if (this.core.IsKeyDown("a")) {
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(dir, -0.1);
            this.rot.multiplyQuaternions(q, this.rot);
        }
        if (this.core.IsKeyDown("d")) {
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(dir, 0.1);
            this.rot.multiplyQuaternions(q, this.rot);
        }
        if (this.core.IsKeyDown("w")) {
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(pitchAxis, 0.1);
            this.rot.multiplyQuaternions(q, this.rot);
        }
        if (this.core.IsKeyDown("s")) {
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(pitchAxis, -0.1);
            this.rot.multiplyQuaternions(q, this.rot);
        }
        const speed = 1;
        this.vx = dir.x * speed;
        this.vy = dir.y * speed;
        this.vz = dir.z * speed;
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        const v = new THREE.Vector3(0, 0.3, -1);
        v.applyQuaternion(this.rot);
        const dis = 20;
        v.multiplyScalar(dis);
        this.scene.camera.up.set(up.x, up.y, up.z);
        this.scene.camera.position.set(this.x + v.x, this.y + v.y, this.z + v.z);
        this.scene.camera.lookAt(this.x, this.y, this.z);
        this.plane.position.set(this.x, this.y, this.z);
        this.plane.setRotationFromQuaternion(this.rot);
    }
}

const c = Start("initScene", new LoadScene());
