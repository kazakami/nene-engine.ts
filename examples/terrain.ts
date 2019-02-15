import * as THREE from "three";
import { Scene, Start, Terrain, Unit } from "../src/nene-engine";

class LoadScene extends Scene {
    public Init() {
        this.onTouchMove = (e) => { e.preventDefault(); };
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
        this.FillText("Now Loading " + a + "/" + b, 0, 0);
    }
}

class GameScene extends Scene {
    private g: Ground;
    private c: Cameraman;
    public Init() {
        this.onWindowResize = () => {
            this.core.ChangeCanvasSize(window.innerWidth, window.innerHeight);
        };
        this.onTouchMove = (e) => { e.preventDefault(); };
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
    public DrawText() {
        this.SetTextSize(20);
        this.FillText(
            "Press mouse left button to raise the terrain.",
            -this.core.windowSizeX / 2, this.core.windowSizeY / 2);
        this.FillText(
            "Press \"q\" and press mouse left button to lower the terrain.",
            -this.core.windowSizeX / 2, this.core.windowSizeY / 2 - 20);
    }
}

class Ground extends Unit {
    private t: Terrain;
    public Init() {
        this.raycastTarget = true;
        this.t = new Terrain();
        this.t.MakeGeometry(50, 50, 10, 10, 5, 5, new THREE.MeshPhongMaterial({color: 0x448866}));
        this.t.SetFar(100);
        this.AddObject(this.t.GetObject());
        for (let i = 0; i < this.t.GetWidthAllSegments(); i++) {
            for (let j = 0; j < this.t.GetDepthAllSegments(); j++) {
                this.t.SetHeight(i, j, Math.random() * 2, false);
            }
        }
        this.t.ComputeNormal(0, 0, this.t.GetWidthAllSegments(), this.t.GetDepthAllSegments());
    }
    public Update() {
        this.t.SetPos(this.scene.camera.position);
        if (this.core.IsMouseLeftButtonDown()) {
            const intersects = this.scene.GetIntersects();
            if (intersects.length !== 0) {
                const w = this.t.GetWidth();
                const d = this.t.GetDepth();
                const w2 = intersects[0].point.x + w / 2;
                const d2 = intersects[0].point.z + d / 2;
                const i = Math.round(w2 / this.t.GetSegmentWidth());
                const j = Math.round(d2 / this.t.GetSegmentDepth());
                // 地形を上げるか下げるかの符号
                const s = (this.core.IsKeyDown("KeyQ")) ? -1 : 1;
                const min = -5;
                const max = 5;
                this.t.LimitedRaise(i, j, 0.5 * s, min, max, false);
                this.t.SafeLimitedRaise(i - 1, j, 0.2 * s, min, max, false);
                this.t.SafeLimitedRaise(i + 1, j, 0.2 * s, min, max, false);
                this.t.SafeLimitedRaise(i, j - 1, 0.2 * s, min, max, false);
                this.t.SafeLimitedRaise(i, j + 1, 0.2 * s, min, max, false);
                this.t.SafeLimitedRaise(i - 1, j - 1, 0.1 * s, min, max, false);
                this.t.SafeLimitedRaise(i - 1, j + 1, 0.1 * s, min, max, false);
                this.t.SafeLimitedRaise(i + 1, j - 1, 0.1 * s, min, max, false);
                this.t.SafeLimitedRaise(i + 1, j + 1, 0.1 * s, min, max, false);
                this.t.SafeComputeNormal(i - 3, j - 3, i + 3, j + 3);
            }
        }
    }
}

class Cameraman extends Unit {
    private pos: THREE.Vector3;
    // 方位角
    private azimuth: number = Math.PI;
    // 仰俯角
    private altitude: number = 0;
    private mouseRightIsDown = false;
    // マウスの右ボタンが押し下げられた時のマウス座標
    private mouseRightDownScreenPos: THREE.Vector2 = null;
    // マウスの右ボタンが押し下げられた時のレイキャスト座標 レイキャストしなかった場合はnull
    private mouseRightDownWorldPos: THREE.Vector3 = null;
    // マウスの右ボタンが押し下げられた時の方位角
    private mouseRightDownAzimuth: number;
    // マウスの右ボタンが押し下げられた時の仰俯角
    private mouseRightDownAltitude: number;
    // マウスの右ボタンが押し下げられた時のカーソルの指した点からカメラ位置への方位角
    private mouseRightDownCameraAzimuth: number;
    // マウスの右ボタンが押し下げられた時のカーソルの指した点からカメラ位置へ仰俯角
    private mouseRightDownCameraAltitude: number;
    // マウスの右ボタンが押し下げられた時のカーソルの指した点からカメラ位置へ距離
    private mouseRightDownCameraDistance: number;
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
            this.mouseRightDownAzimuth = this.azimuth;
            this.mouseRightDownAltitude = this.altitude;
            const intersects = this.scene.GetIntersects();
            if (intersects.length !== 0) {
                this.mouseRightDownWorldPos = intersects[0].point.clone();
                const cx = this.pos.x - this.mouseRightDownWorldPos.x;
                const cy = this.pos.y - this.mouseRightDownWorldPos.y;
                const cz = this.pos.z - this.mouseRightDownWorldPos.z;
                this.mouseRightDownCameraAzimuth = Math.atan2(cx, cz);
                this.mouseRightDownCameraAltitude = Math.atan2(cy, Math.sqrt(cx * cx + cz * cz));
                this.mouseRightDownCameraDistance = intersects[0].distance;
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
        if (this.mouseRightIsDown) {
            const mouseDeltaX = this.core.mouseX - this.mouseRightDownScreenPos.x;
            const mouseDeltaY = this.core.mouseY - this.mouseRightDownScreenPos.y;
            if (this.mouseRightDownWorldPos === null) {
                this.azimuth = this.mouseRightDownAzimuth - mouseDeltaX / 100;
                this.altitude
                    = Math.max(Math.min(this.mouseRightDownAltitude + mouseDeltaY / 100, Math.PI / 2), -Math.PI / 2);
            } else {
                const cAltitude
                    = Math.max(
                        Math.min(this.mouseRightDownCameraAltitude - mouseDeltaY / 100, Math.PI / 2),
                        -Math.PI / 2);
                const cAzimuth = this.mouseRightDownCameraAzimuth - mouseDeltaX / 100;
                const v = new THREE.Vector3(
                    Math.cos(cAltitude) * Math.sin(cAzimuth),
                    Math.sin(cAltitude),
                    Math.cos(cAltitude) * Math.cos(cAzimuth));
                this.pos.copy(this.mouseRightDownWorldPos);
                this.pos.addScaledVector(v, this.mouseRightDownCameraDistance);
                this.azimuth = this.mouseRightDownAzimuth - mouseDeltaX / 100;
                this.altitude
                    = Math.max(Math.min(this.mouseRightDownAltitude + mouseDeltaY / 100, Math.PI / 2), -Math.PI / 2);
            }
        }
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
        if (this.core.IsKeyDown("KeyW")) {
            this.pos.addScaledVector(new THREE.Vector3(
                Math.cos(this.altitude) * Math.sin(this.azimuth),
                Math.sin(this.altitude),
                Math.cos(this.altitude) * Math.cos(this.azimuth)), 1);
        }
        if (this.core.IsKeyDown("KeyS")) {
            this.pos.addScaledVector(new THREE.Vector3(
                -Math.cos(this.altitude) * Math.sin(this.azimuth),
                -Math.sin(this.altitude),
                -Math.cos(this.altitude) * Math.cos(this.azimuth)), 1);
        }
        if (this.core.IsKeyDown("KeyD")) {
            this.pos.addScaledVector(new THREE.Vector3(
                Math.sin(this.azimuth - Math.PI / 2),
                0,
                Math.cos(this.azimuth - Math.PI / 2)), 1);
        }
        if (this.core.IsKeyDown("KeyA")) {
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
