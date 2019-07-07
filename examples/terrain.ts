import * as THREE from "three";
import { Mesh } from "three";
import { ImprovedNoise, Random, RandomColor, Scene, Start, Terrain, Unit } from "../src/nene-engine";

const MapWidth = 100;
const MapDepth = 100;

class LoadScene extends Scene {
    public Init() {
        this.canvasSizeX = this.core.screenSizeX;
        this.canvasSizeY = this.core.screenSizeY;
        this.onTouchMove = (e) => { e.preventDefault(); };
        this.onWindowResize = () => {
            this.core.ChangeScreenSize(window.innerWidth, window.innerHeight);
            this.ResizeCanvas(this.core.screenSizeX, this.core.screenSizeY);
        };
        this.core.LoadTexture("resources/images/grass2.png", "grass");
        this.core.LoadTexture("resources/images/snow.png", "snow");
        this.core.LoadTexture("resources/images/kusa2.png", "kusa");
        this.core.LoadFile("resources/shaders/ground.vert", "ground.vert");
        this.core.LoadFile("resources/shaders/ground.frag", "ground.frag");
        this.core.LoadFile("resources/shaders/ground_kusa.vert", "ground_kusa.vert");
        this.core.LoadFile("resources/shaders/ground_kusa.frag", "ground_kusa.frag");
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
        this.canvasSizeX = this.core.screenSizeX;
        this.canvasSizeY = this.core.screenSizeY;
        this.onWindowResize = () => {
            this.core.ChangeScreenSize(window.innerWidth, window.innerHeight);
            this.ResizeCanvas(this.core.screenSizeX, this.core.screenSizeY);
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
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2);
        this.FillText(
            "Press \"q\" and press mouse left button to lower the terrain.",
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2 - 20);
        this.FillText(
            "\"w\", \"a\", \"s\", \"d\" to move camera.",
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2 - 40);
        this.FillText(
            "\"r\" to reset camera position.",
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2 - 60);
        this.FillText(
            "\"g\" to on/off rendering of grasses.",
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2 - 80);
        this.FillText(
            "\"e\" to on/off hydraulic eroding.",
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2 - 100);
        this.FillText("FPS: " + Math.round(this.core.fps).toString(),
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2 - 120);
    }
}

class Ground extends Unit {
    private t: Terrain;
    private mat: THREE.ShaderMaterial;
    private rain = false;
    private kusa: THREE.Group = new THREE.Group();
    private kusaIsOn = true;
    public Init() {
        const widthSeg = 16;
        const depthSeg = 16;
        const widthTile = 8;
        const depthTile = 8;
        this.raycastTarget = true;
        this.t = new Terrain();
        this.mat = new THREE.ShaderMaterial({
            fragmentShader: this.core.GetText("ground.frag"),
            uniforms: {
                grass: { value: this.core.GetTexture("grass") },
                snow: { value: this.core.GetTexture("snow") },
            },
            vertexShader: this.core.GetText("ground.vert"),
        });
        this.t.MakeGeometry(
            MapWidth, MapDepth,
            widthSeg, depthSeg,
            widthTile, depthTile,
            this.mat);
        this.t.SetFar(200);
        this.AddObject(this.t.GetObject());
        const noise = new ImprovedNoise();
        console.log("start");
        let q = 1;
        for (let iter = 0; iter < 4; iter++) {
            for (let i = 0; i < this.t.GetWidthAllSegments(); i++) {
                for (let j = 0; j < this.t.GetDepthAllSegments(); j++) {
                    this.t.Raise(i, j, noise.Noise(i / q, j / q, 7) * q * 0.5, false);
                }
            }
            q *= 5;
        }
        console.log("end");
        this.t.ComputeNormal(0, 0, this.t.GetWidthAllSegments(), this.t.GetDepthAllSegments());
        for (let i = 0; i < 20; i++) {
            const copiedTerrain = new THREE.Group();
            const copiedTerrainMat = new THREE.ShaderMaterial({
                fragmentShader: this.core.GetText("ground_kusa.frag"),
                uniforms: {
                    grass: { value: this.core.GetTexture("grass") },
                    kusa: { value: this.core.GetTexture("kusa") },
                    raise: { value: i },
                    snow: { value: this.core.GetTexture("snow") },
                    time: { value: 0 },
                },
                vertexShader: this.core.GetText("ground_kusa.vert"),
            });
            this.t.GetGeometries().forEach((g) => {
                copiedTerrain.add(new Mesh(g, copiedTerrainMat));
            });
            this.kusa.add(copiedTerrain);
        }
        this.AddObject(this.kusa);
    }
    public Update() {
        this.kusa.children.forEach((k: THREE.Group) => k.children.forEach((m: THREE.Mesh) => {
            (m.material as THREE.ShaderMaterial).uniforms.time = { value: this.frame };
        }));
        this.t.SetCameraPos(this.scene.camera.position);
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
                const min = -20;
                const max = 20;
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
        if (this.core.IsKeyPressing("KeyE")) {
            this.rain = !this.rain;
        }
        if (this.core.IsKeyPressing("KeyG")) {
            if (this.kusaIsOn) {
                this.RemoveObject(this.kusa);
            } else {
                this.AddObject(this.kusa);
            }
            this.kusaIsOn = !this.kusaIsOn;
        }
        if (this.rain) {
            this.scene.AddUnit(new Droplet(this.t));
        }
    }
}

class Droplet extends Unit {
    private x: number;
    private z: number;
    private t: Terrain;
    private vx: number;
    private vz: number;
    private soil: number = 0;
    private color = RandomColor();
    constructor(t: Terrain) {
        super();
        this.t = t;
    }
    public Init() {
        this.x = Random(MapWidth / 2);
        this.z = Random(MapDepth / 2);
        this.vx = 0;
        this.vz = 0;
        const [width, depth] = this.t.PositionToIndex(this.x, this.z);
        const height = this.t.GetInterpolatedHeight(width, depth);
        const geo = new THREE.SphereGeometry(1);
        const mat = new THREE.MeshPhongMaterial({ color: this.color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(this.x, height, this.z);
        this.AddObject(mesh);
        geo.dispose();
        mat.dispose();
    }
    public Update() {
        if (Math.abs(this.x) < MapWidth / 2 && Math.abs(this.z) < MapDepth / 2) {
            const [width, depth] = this.t.PositionToIndex(this.x, this.z);
            const normal = this.t.GetInterpolatedNormal(width, depth);
            if (this.frame % 10 === 0) {
                const height = this.t.GetInterpolatedHeight(width, depth);
                const geo = new THREE.BoxGeometry(this.soil, this.soil, this.soil);
                const mat = new THREE.MeshPhongMaterial({ color: this.color });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(this.x, height, this.z);
                this.AddObject(mesh);
                geo.dispose();
                mat.dispose();
            }
            const baseWidth = Math.floor(width);
            const baseDepth = Math.floor(depth);
            const difWidth = width - baseWidth;
            const difDepth = depth - baseDepth;
            const vel = Math.sqrt(this.vx ** 2 + this.vz ** 2);
            const delta = vel * 3 - this.soil * 0.5; // 水滴がこの反復で削り取る量。負の場合は沈殿する量
            this.soil += delta;
            this.Deposit(baseWidth, baseDepth, difWidth, difDepth, -delta);
            this.vx *= 0.08;
            this.vz *= 0.08;
            this.vx += normal.x * 0.4;
            this.vz += normal.z * 0.4;
            if (vel < 0.05 && this.frame > 10) {
                this.Deposit(baseWidth, baseDepth, difWidth, difDepth, this.soil);
                this.isAlive = false;
                return;
            }
        } else {
            this.isAlive = false;
        }
        if (this.frame >= 600) { this.isAlive = false; }
        this.x += this.vx;
        this.z += this.vz;
    }
    private Deposit(baseWidth: number, baseDepth: number, difWidth: number, difDepth: number, delta: number): void {
        // 周囲で最も高い点の高さを求める
        const highest = [
            this.t.GetHeight(baseWidth, baseDepth),
            this.t.GetHeight(baseWidth, baseDepth + 1),
            this.t.GetHeight(baseWidth + 1, baseDepth),
            this.t.GetHeight(baseWidth + 1, baseDepth + 1),

            this.t.GetHeight(baseWidth + 1, baseDepth + 2),
            this.t.GetHeight(baseWidth + 2, baseDepth + 1),
            this.t.GetHeight(baseWidth + 2, baseDepth + 2),

            this.t.GetHeight(baseWidth, baseDepth - 1),
            this.t.GetHeight(baseWidth - 1, baseDepth),
            this.t.GetHeight(baseWidth - 1, baseDepth - 1),

            this.t.GetHeight(baseWidth - 1, baseDepth + 1),
            this.t.GetHeight(baseWidth - 1, baseDepth + 2),
            this.t.GetHeight(baseWidth, baseDepth + 2),

            this.t.GetHeight(baseWidth + 1, baseDepth - 1),
            this.t.GetHeight(baseWidth + 2, baseDepth - 1),
            this.t.GetHeight(baseWidth + 2, baseDepth),
        ].filter((h) => h !== undefined).reduce((i, j) => Math.max(i, j), -Infinity);
        // 周囲4頂点
        this.t.SafeLimitedRaise(baseWidth, baseDepth, (1 - difWidth) * (1 - difDepth) * delta * 0.5,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth, baseDepth + 1, (1 - difWidth) * difDepth * delta * 0.5,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth + 1, baseDepth, difWidth * (1 - difDepth) * delta * 0.5,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth + 1, baseDepth + 1, difWidth * difDepth * delta * 0.5,
            -Infinity, highest, false);
        // それの8近傍での合計12頂点
        this.t.SafeLimitedRaise(baseWidth, baseDepth - 1, (1 - difWidth) * (1 - difDepth) * delta * 0.5 / 3,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth - 1, baseDepth, (1 - difWidth) * (1 - difDepth) * delta * 0.5 / 3,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth - 1, baseDepth - 1, (1 - difWidth) * (1 - difDepth) * delta * 0.5 / 3,
            -Infinity, highest, false);

        this.t.SafeLimitedRaise(baseWidth - 1, baseDepth + 1, (1 - difWidth) * difDepth * delta * 0.5 / 3,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth - 1, baseDepth + 2, (1 - difWidth) * difDepth * delta * 0.5 / 3,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth, baseDepth + 2, (1 - difWidth) * difDepth * delta * 0.5 / 3,
            -Infinity, highest, false);

        this.t.SafeLimitedRaise(baseWidth + 1, baseDepth - 1, difWidth * (1 - difDepth) * delta * 0.5 / 3,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth + 2, baseDepth - 1, difWidth * (1 - difDepth) * delta * 0.5 / 3,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth + 2, baseDepth, difWidth * (1 - difDepth) * delta * 0.5 / 3,
            -Infinity, highest, false);

        this.t.SafeLimitedRaise(baseWidth + 2, baseDepth + 1, difWidth * difDepth * delta * 0.5 / 3,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth + 1, baseDepth + 2, difWidth * difDepth * delta * 0.5 / 3,
            -Infinity, highest, false);
        this.t.SafeLimitedRaise(baseWidth + 2, baseDepth + 2, difWidth * difDepth * delta * 0.5 / 3,
            -Infinity, highest, false);

        this.t.SafeComputeNormal(baseWidth - 2, baseDepth - 2, baseWidth + 3, baseDepth + 3);
    }
}

class Cameraman extends Unit {
    private pos: THREE.Vector3;
    // 方位角
    private azimuth: number;
    // 仰俯角
    private altitude: number;
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
        this.InitPosition();
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
        if (this.core.IsKeyPressing("KeyR")) {
            this.InitPosition();
        }
        this.scene.camera.position.copy(this.pos);
        this.scene.camera.up.set(0, 1, 0);
        this.scene.camera.lookAt(
            this.pos.x + Math.cos(this.altitude) * Math.sin(this.azimuth),
            this.pos.y + Math.sin(this.altitude),
            this.pos.z + Math.cos(this.altitude) * Math.cos(this.azimuth));
    }
    private InitPosition(): void {
        this.azimuth = Math.PI;
        this.altitude = -1.2;
        this.pos = new THREE.Vector3(0, 50, 20);
    }
}

const c = Start("initScene", new LoadScene());
