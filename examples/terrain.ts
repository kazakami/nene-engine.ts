import * as THREE from "three";
import { Scene, Start, Terrain } from "../src/nene-engine";

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
        this.t.MakeGeometry(50, 50, 100, 100);
        this.scene.add(this.t.GetObject());
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                this.t.SetHeight(i, j, Math.random() * 10, false);
            }
        }
        this.t.ComputeNorm();
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        this.camera.position.set(50, 50, 50);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(0, 0, 0);
    }
}

const c = Start("initScene", new LoadScene());
