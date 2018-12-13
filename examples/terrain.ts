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
    private g: Ground;
    private c: Cameraman;
    public Init() {
        this.onWindowResize = () => {
            this.core.ChangeCanvasSize(window.innerWidth, window.innerHeight);
        };
        this.backgroundColor = new THREE.Color(0.6, 0.8, 0.9);
        this.scene.fog = new THREE.Fog(new THREE.Color(0.6, 0.8, 0.9).getHex(), 1, 3000);
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        this.c = new Cameraman();
        this.AddUnit(this.c);
        this.g = new Ground();
        this.AddUnit(this.g);
        this.onMouseDown = (e) => {
            this.c.MouseDown(e);
        };
        this.onMouseUp = (e) => {
            this.c.MouseUp(e);
        };
        this.onWheel = (e) => {
            this.c.Wheel(e);
        };
        this.onContextmenu = (e) => { e.preventDefault(); };
    }
    public Update() {
        return;
    }
}

class Ground extends Unit {
    private t: Terrain;
    public Init() {
        this.raycastTarget = true;
        this.t = new Terrain();
        this.t.MakeGeometry(50, 50, 10, 10, 5, 5);
        this.AddObject(this.t.GetObject());
        for (let i = 0; i < this.t.GetWidthAllSegments(); i++) {
            for (let j = 0; j < this.t.GetDepthAllSegments(); j++) {
                this.t.SetHeight(i, j, Math.random() * 2, false);
            }
        }
        this.t.ComputeNormal(0, 0, this.t.GetWidthAllSegments(), this.t.GetDepthAllSegments());
    }
    public Update() {
        this.t.SetHeight(20, 20, 10 * Math.sin(this.frame / 10), false);
        this.t.ComputeNormal(19, 19, 21, 21);
    }
}

class Cameraman extends Unit {
    private pos: THREE.Vector3;
    // 方位角
    private azimuth: number = Math.PI;
    // 行俯角
    private altitude: number = 0;
    private mouseRightIsDown = false;
    // マウスの右ボタンが押し下げられた時のマウス座標
    private mouseRightDownScreenPos: THREE.Vector2 = null;
    // マウスの右ボタンが押し下げられた時のレイキャスト座標 レイキャストしなかった場合はnull
    private mouseRightDownWorldPos: THREE.Vector3 = null;
    public Init(): void {
        this.pos = new THREE.Vector3(0, 20, 50);
    }
    public Wheel(e: WheelEvent): void {
        e.preventDefault();
        const intersects = this.scene.GetIntersects();
        if (intersects.length !== 0) {
            const p = intersects[0].point;
            const d = Math.max(intersects[0].distance - 0.5, 0);
            const dir = new THREE.Vector3().subVectors(p, this.pos).normalize();
            const step = Math.min(d * 0.9, 10);
            if (e.deltaY < 0) {
                this.pos.addScaledVector(dir, step);
            } else if (e.deltaY > 0) {
                this.pos.addScaledVector(dir, -step - 0.1);
            }
        } else {
            if (e.deltaY < 0) {
                this.pos.addScaledVector(new THREE.Vector3(
                    Math.cos(this.altitude) * Math.sin(this.azimuth),
                    Math.sin(this.altitude),
                    Math.cos(this.altitude) * Math.cos(this.azimuth)), 10);
            } else if (e.deltaY > 0) {
                this.pos.addScaledVector(new THREE.Vector3(
                    -Math.cos(this.altitude) * Math.sin(this.azimuth),
                    -Math.sin(this.altitude),
                    -Math.cos(this.altitude) * Math.cos(this.azimuth)), 10);
            }
        }
    }
    public MouseDown(e: MouseEvent): void {
        e.preventDefault();
        if (e.button === 2) {
            this.mouseRightIsDown = true;
            this.mouseRightDownScreenPos = new THREE.Vector2(this.core.mouseX, this.core.mouseY);
            const intersects = this.scene.GetIntersects();
            if (intersects.length !== 0) {
                this.mouseRightDownWorldPos = intersects[0].point.clone();
            } else {
                this.mouseRightDownWorldPos = null;
            }
        }
    }
    public MouseUp(e: MouseEvent): void {
        if (e.button === 2) {
            this.mouseRightIsDown = false;
        }
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
