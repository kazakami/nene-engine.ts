import * as THREE from "three";
import { PhysicObjects, PhysicSphere, Random, RandomColor, Scene, Start, Unit } from "../src/nene-engine";

class LoadScene extends Scene {
    public async Init(): Promise<void> {
        this.backgroundColor = new THREE.Color(0x887766);
        this.onLoadError = (e) => console.log(e);
        await Promise.all([
            this.core.LoadObjMtl("resources/models/ente progress_export.obj",
                                "resources/models/ente progress_export.mtl", "ente"),
            this.core.LoadObjMtl("resources/models/ball.obj", "resources/models/ball.mtl", "ball"),
            this.core.LoadTexture("resources/images/png_alphablend_test.png", "circle"),
            this.core.LoadTexture("resources/images/star.png", "star"),
            this.core.LoadTexture("resources/images/floor.png", "floor"),
            this.core.LoadTexture("resources/images/wall.png", "wall"),
            this.core.LoadTexture("resources/images/tile.png", "tile"),
            this.core.LoadFile("resources/shaders/sample1.vert", "sample1.vert"),
            this.core.LoadFile("resources/shaders/sample1.frag", "sample1.frag"),
            this.core.LoadFile("resources/shaders/pass1.vert", "pass1.vert"),
            this.core.LoadFile("resources/shaders/pass1.frag", "pass1.frag"),
            this.core.LoadFile("resources/jsons/FloorPhysic.json", "board"),
            this.core.LoadGLTF("resources/models/octagon.gltf", "oct"),
        ]);
        console.log("loaded");
        // 全てのリソースが読み込まれればシーン遷移
        this.core.AddAndChangeScene("game", new GameScene());
    }
    public DrawText(): void {
        const [a, b] = this.core.GetAllResourcesLoadingProgress();
        this.core.DrawText("Now Loading " + a + "/" + b, 0, 0);
    }
}

class GameScene extends Scene {
    public sprt: THREE.Sprite;
    public casted: string[];
    public Init(): void {
        this.backgroundColor = new THREE.Color(0x887766);
        this.core.renderer.shadowMap.enabled = true;
        this.physicStep = 1 / 30;
        this.AddUnit(new Board());
        this.AddUnit(new Ball(0, 10, 0));
        this.AddUnit(new Ball(5, 5, 0, true));
        this.AddUnit(new Ball(0, 3, 4));
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
        const light = new THREE.DirectionalLight("white", 1);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.position.set(0, 100, 0);
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.right = 50;
        light.shadow.camera.left = -50;
        light.shadow.camera.top = -50;
        light.shadow.camera.bottom = 50;
        light.shadow.camera.near = 50;
        light.shadow.camera.far = 300;
        const lightShadowHelper = new THREE.CameraHelper(light.shadow.camera);
        this.scene.add(lightShadowHelper);
        const lightHelper = new THREE.DirectionalLightHelper(light);
        this.scene.add(lightHelper);
        this.scene.add(light);
        this.sprt = this.core.MakeSpriteFromTexture("circle");
        this.sprt.scale.set(100, 100, 1);
        this.scene2d.add(this.sprt);
        this.onMouseClick = async () => {
            await this.core.SaveImage("ScreenShot.png");
            console.log("Image Saved");
        };
        this.onWindowResize = () => {
            this.core.ChangeCanvasSize(window.innerWidth, window.innerHeight);
        };
        this.core.PixelRatio = 1 / 1;
        const floor = new THREE.PlaneBufferGeometry(500, 500);
        floor.rotateX(-Math.PI / 2);
        floor.translate(0, -30, 0);
        // const floor2 = new THREE.BoxBufferGeometry
        const floorTex = this.core.GetTexture("floor");
        floorTex.repeat.set(10, 10);
        floorTex.wrapS = THREE.RepeatWrapping;
        floorTex.wrapT = THREE.RepeatWrapping;
        const floorMat = new THREE.MeshPhongMaterial({map: floorTex});
        const floorMesh = new THREE.Mesh(floor, floorMat);
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        const wall = new THREE.PlaneBufferGeometry(500, 500);
        wall.translate(0, 0, -250);
        const wallTex = this.core.GetTexture("wall");
        wallTex.repeat.set(10, 10);
        wallTex.wrapS = THREE.RepeatWrapping;
        wallTex.wrapT = THREE.RepeatWrapping;
        const wallMat = new THREE.MeshPhongMaterial({map: wallTex});
        const wallMesh = new THREE.Mesh(wall, wallMat);
        wallMesh.receiveShadow = true;
        this.scene.add(wallMesh);

        this.composer = this.core.MakeEffectComposer();
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        const pass = new THREE.ShaderPass({
            fragmentShader: this.core.GetText("pass1.frag"),
            uniforms: {
                tDiffuse: {value: null},
            },
            vertexShader: this.core.GetText("pass1.vert"),
        });
        this.composer.addPass(pass);
        this.composer = null;

        this.composer2d = this.core.MakeEffectComposer();
        this.composer2d.addPass(new THREE.RenderPass(this.scene2d, this.camera2d));
        const pass2d = new THREE.FilmPass(0.5, 0.5, 480, false);
        this.composer2d.addPass(pass2d);
        this.composer2d = null;
    }
    public Update(): void {
        this.casted = [];
        this.Raycast();
        this.sprt.position.set(this.core.mouseX, this.core.mouseY, 1);
    }
    public DrawText(): void {
        this.core.SetTextColor(new THREE.Color().setRGB(200, 200, 200));
        this.core.DrawText("fps: " + Math.round(this.core.fps).toString(),
            - this.core.windowSizeX / 2,
            this.core.windowSizeY / 2);
        this.core.DrawText(this.casted.join(), this.core.mouseX, this.core.mouseY);
    }
}

class Particle extends Unit {
    private sprite: THREE.Object3D;
    constructor(private x: number, private y: number, private z: number,
                private vx: number, private vy: number, private vz: number) {
        super();
    }
    public Init(): void {
        this.sprite = new THREE.Object3D();
        this.sprite.add(this.core.MakeSpriteFromTexture("star", RandomColor()));
        this.sprite.position.set(this.x, this.y, this.z);
        this.AddObject(this.sprite);
    }
    public Update(): void {
        this.vy -= 9.8 / 60 / 60;
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        this.sprite.position.set(this.x, this.y, this.z);
        if (this.frame > 100) {
            this.isAlive = false;
        }
    }
}

class Ball extends Unit {
    public ball: PhysicSphere;
    constructor(private x = 0, private y = 0, private z = 0, private shaded = false) {
        super();
    }
    public Init(): void {
        this.raycastTarget = true;
        if (this.shaded) {
            const geo = new THREE.SphereBufferGeometry(1, 10, 10);
            const mat = new THREE.ShaderMaterial({
                fragmentShader: this.core.GetText("sample1.frag"),
                uniforms: {
                    // hoge: {value: 0.5},
                },
                vertexShader: this.core.GetText("sample1.vert"),
            });
            mat.uniforms.hoge = {value: 0.0};
            const mesh = new THREE.Mesh(geo, mat);
            this.ball = new PhysicSphere(1, 1, "ball", mesh);
        } else {
            this.ball = new PhysicSphere(1, 1, "ball", this.core.GetObject("ball"));
        }
        this.ball.viewBody.castShadow = true;
        this.ball.position.set(this.x, this.y, this.z);
        this.AddPhysicObject(this.ball);
        this.ball.SetCollideCallback((c) => {
            const p = c.collidePosition;
            for (let i = 0; i < 10; i++) {
                this.scene.AddUnit(new Particle(
                    p.x, p.y, p.z,
                    Random(0.1), Random(0.1), Random(0.1)));
            }
        });
        this.onRaycastedCallback = (ints, message) => {
            (this.scene as GameScene).casted.push("Ball");
        };
    }
    public Update(): void {
        if (this.ball.position.y < -30) {
            this.ball.position.set(this.x, this.y, this.z);
            this.ball.velocity.set(0, 0, 0);
            this.ball.quaternion.set(0, 0, 0, 1);
            this.ball.angularVelocity.set(0, 0, 0);
        }
    }
    public DrawText(): void {
        if (this.shaded) {
            const [x, y] = this.scene.GetScreenPosition(this.ball);
            this.core.DrawText("custom shadered", x, y);
        }
    }
}

class Board extends Unit {
    public floor: PhysicObjects;
    public Init(): void {
        this.raycastTarget = true;
        this.floor = new PhysicObjects(0, "floor");
        // console.log(this.floor.viewBody.children);
        this.floor.position.set(0, -10, 0);
        this.floor.AddShapeFromJSON(
            this.core.GetText("board"),
            new THREE.MeshPhongMaterial({map: this.core.GetTexture("tile")}));
        // console.log(this.floor.viewBody.children.length);
        // console.log(this.floor.viewBody.children);
        // console.log(this.floor.viewBody.children[0]);
        const hoge = new THREE.Group();
        console.log(hoge.children);
        hoge.add(new THREE.Mesh());
        console.log(hoge.children);
        this.floor.viewBody.children.forEach((o) => {
            o.receiveShadow = true;
            o.castShadow = true;
            console.log("h");
        });
        // for (const mesh of (this.floor.viewBody as THREE.Group).children) {
        //     console.log("h");
        //     mesh.receiveShadow = true;
        //     mesh.castShadow = true;
        // }
        this.AddPhysicObject(this.floor);
        this.onRaycastedCallback = (ints, message) => {
            (this.scene as GameScene).casted.push("Board");
        };
    }
    public Update(): void {
        this.floor.OrientAndRotate(
            this.core.mouseX,
            100,
            -this.core.mouseY);
    }
}

// ゲームの開始
Start("init", new LoadScene(), {halfFPS: true});
// const hoge = new THREE.Group();
// console.log(hoge.children);
// hoge.add(new THREE.Mesh());
// console.log(hoge.children);
/*
const renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 600);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(this.fov, 800 / 600, 0.1, 5000);
camera.position.set(0, 15, 15);
camera.lookAt(0, 0, 0);
const light = new THREE.DirectionalLight("white", 1);
light.castShadow = true;
light.position.set(0, 100, 0);
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.right = 100;
light.shadow.camera.left = -100;
light.shadow.camera.top = -100;
light.shadow.camera.bottom = 100;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 1000;
light.castShadow = true;
const floorGeo = new THREE.PlaneBufferGeometry(500, 500);
floorGeo.rotateX(-Math.PI / 2);
floorGeo.translate(0, -50, 0);
const frame = () => {
    requestAnimationFrame(frame);
    renderer.render(scene, camera);
};
frame();
// */
