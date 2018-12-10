import * as THREE from "three";
import { Scene, Start, Terrain, Unit } from "../src/nene-engine";

class LoadScene extends Scene {
    public Init() {
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
    private t: Terrain;
    public Init() {
        this.onWindowResize = () => {
            this.core.ChangeCanvasSize(window.innerWidth, window.innerHeight);
        };
        this.backgroundColor = new THREE.Color(0.6, 0.8, 0.9);
        this.scene.fog = new THREE.Fog(new THREE.Color(0.6, 0.8, 0.9).getHex(), 1, 3000);
        this.t = new Terrain();
        this.t.MakeGeometry(50, 50, 10, 10, 5, 5);
        this.scene.add(this.t.GetObject());
        for (let i = 0; i < this.t.GetWidthAllSegments(); i++) {
            for (let j = 0; j < this.t.GetDepthAllSegments(); j++) {
                this.t.SetHeight(i, j, Math.random() * 2, false);
            }
        }
        this.t.ComputeNorm(0, 0, this.t.GetWidthAllSegments(), this.t.GetDepthAllSegments());
        // this.t.SetHeight(5, 5, 10, false);
        // this.t.ComputeNorm();
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        this.AddUnit(new Cameraman());
    }
}

class Cameraman extends Unit {
    private pos: THREE.Vector3;
    // 方位角
    private azimuth: number = Math.PI;
    // 行俯角
    private altitude: number = 0;
    public Init(): void {
        this.pos = new THREE.Vector3(0, 20, 50);
    }
    public Update(): void {
        if (this.core.IsKeyDown("ArrowLeft")) {
            this.azimuth += 0.02;
        }
        if (this.core.IsKeyDown("ArrowRight")) {
            this.azimuth -= 0.02;
        }
        if (this.core.IsKeyDown("ArrowDown")) {
            this.altitude = Math.max(this.altitude - 0.02, - Math.PI / 2);
        }
        if (this.core.IsKeyDown("ArrowUp")) {
            this.altitude = Math.min(this.altitude + 0.02, Math.PI / 2);
        }
        if (this.core.IsKeyDown("w")) {
            this.pos.addScaledVector(new THREE.Vector3(
                Math.cos(this.altitude) * Math.sin(this.azimuth),
                Math.sin(this.altitude),
                Math.cos(this.altitude) * Math.cos(this.azimuth)), 1);
        }
        if (this.core.IsKeyDown("s")) {
            this.pos.addScaledVector(new THREE.Vector3(
                -Math.cos(this.altitude) * Math.sin(this.azimuth),
                -Math.sin(this.altitude),
                -Math.cos(this.altitude) * Math.cos(this.azimuth)), 1);
        }
        if (this.core.IsKeyDown("d")) {
            this.pos.addScaledVector(new THREE.Vector3(
                Math.sin(this.azimuth - Math.PI / 2),
                0,
                Math.cos(this.azimuth - Math.PI / 2)), 1);
        }
        if (this.core.IsKeyDown("a")) {
            this.pos.addScaledVector(new THREE.Vector3(
                Math.sin(this.azimuth + Math.PI / 2),
                0,
                Math.cos(this.azimuth + Math.PI / 2)), 1);
        }
        this.scene.camera.position.copy(this.pos);
        this.scene.camera.up.set(0, 1, 0);
        this.scene.camera.lookAt(
            this.pos.x + Math.cos(this.altitude) * Math.sin(this.azimuth),
            this.pos.y + Math.sin(this.altitude),
            this.pos.z + Math.cos(this.altitude) * Math.cos(this.azimuth));
    }
}

const c = Start("initScene", new LoadScene());
