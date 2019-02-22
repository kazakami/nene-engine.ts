import * as THREE from "three";
import { EachMesh, PhysicObjects, PhysicSphere, Random, RandomColor, Scene, Start, Unit } from "../src/nene-engine";

class LoadScene extends Scene {
    public async Init(): Promise<void> {
        this.canvasSizeX = this.core.screenSizeX;
        this.canvasSizeY = this.core.screenSizeY;
        this.backgroundColor = new THREE.Color(0x887766);
        this.onLoadError = (e) => console.log(e);
        this.onTouchMove = (e) => { e.preventDefault(); };
        this.onWindowResize = () => {
            this.core.ChangeScreenSize(window.innerWidth, window.innerHeight);
            this.ResizeCanvas(this.core.screenSizeX, this.core.screenSizeY);
        };
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
        this.FillText("Now Loading " + a + "/" + b, 0, 0);
    }
}

class GameScene extends Scene {
    public sprt: THREE.Sprite;
    public casted: string[];
    private pause: PauseScene;
    public Init(): void {
        this.canvasSizeX = this.core.screenSizeX;
        this.canvasSizeY = this.core.screenSizeY;
        // this.canvasSizeX = 640;
        // this.canvasSizeY = 480;
        this.pause = new PauseScene(this);
        this.core.AddScene("pause", this.pause);
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
        this.scene.add(light);
        this.sprt = this.core.MakeSpriteFromTexture("circle");
        this.sprt.scale.set(100, 100, 1);
        this.scene2d.add(this.sprt);
        this.onWindowResize = () => {
            this.core.ChangeScreenSize(window.innerWidth, window.innerHeight);
            // this.ResizeCanvas(this.core.screenSizeX, this.core.screenSizeY);
            // this.ResizeCanvas(640, 480);
        };
        this.onTouchMove = (e) => { e.preventDefault(); };
        this.core.PixelRatio = 1 / 1;
        // 床
        const floorGeo = new THREE.PlaneBufferGeometry(500, 500);
        floorGeo.rotateX(-Math.PI / 2);
        floorGeo.translate(0, -30, 0);
        const floorTex = this.core.GetTexture("floor");
        floorTex.repeat.set(10, 10);
        floorTex.wrapS = THREE.RepeatWrapping;
        floorTex.wrapT = THREE.RepeatWrapping;
        const floorMat = new THREE.MeshPhongMaterial({ map: floorTex });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);
        // 奥の壁
        const wallGeo1 = new THREE.PlaneBufferGeometry(500, 500);
        wallGeo1.translate(0, 0, -150);
        const wallTex = this.core.GetTexture("wall");
        wallTex.repeat.set(10, 10);
        wallTex.wrapS = THREE.RepeatWrapping;
        wallTex.wrapT = THREE.RepeatWrapping;
        const wallMat = new THREE.MeshBasicMaterial({ map: wallTex });
        const wallMesh1 = new THREE.Mesh(wallGeo1, wallMat);
        this.scene.add(wallMesh1);
        // 右の壁
        const wallGeo2 = new THREE.PlaneBufferGeometry(500, 500);
        wallGeo2.rotateY(-Math.PI / 2);
        wallGeo2.translate(150, 0, 0);
        const wallMesh2 = new THREE.Mesh(wallGeo2, wallMat);
        this.scene.add(wallMesh2);
        // 左の壁
        const wallGeo3 = new THREE.PlaneBufferGeometry(500, 500);
        wallGeo3.rotateY(Math.PI / 2);
        wallGeo3.translate(-150, 0, 0);
        const wallMesh3 = new THREE.Mesh(wallGeo3, wallMat);
        this.scene.add(wallMesh3);

        this.composer = this.core.MakeEffectComposer();
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        const pass = new THREE.ShaderPass({
            fragmentShader: this.core.GetText("pass1.frag"),
            uniforms: {
                tDiffuse: { value: null },
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
        if (this.core.IsKeyPressing("KeyP")) {
            (async () => {
                await this.core.SaveImage();
                console.log("save screenshot");
            })();
        }
        if (this.core.IsKeyPressing("Escape")) {
            this.core.ChangeScene("pause");
        }
    }
    public DrawText(): void {
        this.SetTextColor(new THREE.Color().setRGB(200, 200, 200));
        this.FillText("FPS: " + Math.round(this.core.fps).toString(),
            -this.canvasSizeX / 2,
            this.canvasSizeY / 2);
        this.FillText("Press p to save screenshot.",
            -this.canvasSizeX / 2,
            this.canvasSizeY / 2 - 50);
        this.FillText(this.casted.join(), this.core.mouseX, this.core.mouseY);
    }
}

class PauseScene extends Scene {
    private gameScene: GameScene;
    private sprite: THREE.Sprite;
    private spriteMat: THREE.SpriteMaterial;
    constructor(gameScene: GameScene) {
        super();
        this.gameScene = gameScene;
    }
    public Init() {
        this.canvasSizeX = this.core.screenSizeX;
        this.canvasSizeY = this.core.screenSizeY;
        this.spriteMat = new THREE.SpriteMaterial({ color: 0x888888 });
        this.sprite = new THREE.Sprite(this.spriteMat);
        this.sprite.scale.set(this.core.screenSizeX, this.core.screenSizeY, 1);
        this.sprite.position.set(0, 0, 1);
        this.scene2d.add(this.sprite);
        this.onWindowResize = () => {
            this.core.ChangeScreenSize(window.innerWidth, window.innerHeight);
            this.ResizeCanvas(this.core.screenSizeX, this.core.screenSizeY);
            this.sprite.scale.set(this.core.screenSizeX, this.core.screenSizeY, 1);
        };
        this.onTouchMove = (e) => { e.preventDefault(); };
    }
    public Update() {
        // このコメントを解除すれば裏でgameSceneが動く
        // this.gameScene.InnerUpdate();
        // this.gameScene.Update();
        this.gameScene.Render();
        this.spriteMat.map = this.gameScene.RenderedTexture();
        if (this.core.IsKeyPressing("Escape")) {
            this.core.ChangeScene("game");
        }
    }
    public DrawText() {
        this.FillText("Pause", 0, 0);
    }
}

class Particle extends Unit {
    private geo: THREE.BufferGeometry;
    private mat: THREE.PointsMaterial;
    private points: THREE.Points;
    constructor(private x: number, private y: number, private z: number) {
        super();
    }
    public Init(): void {
        this.geo = new THREE.BufferGeometry();
        const points: number[] = [];
        const colors: number[] = [];
        for (let i = 0; i < 1; i++) {
            points.push(0, 0, 0);
            const col = RandomColor();
            colors.push(col.r, col.g, col.b);
        }
        this.geo.addAttribute("position", new THREE.Float32BufferAttribute(points, 3));
        this.geo.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        this.geo.computeBoundingSphere();
        this.mat = new THREE.PointsMaterial({
            blending: THREE.AdditiveBlending, map: this.core.GetTexture("star"), size: 1, transparent: true,
            vertexColors: THREE.VertexColors,
        });
        this.points = new THREE.Points(this.geo, this.mat);
        this.points.position.set(this.x, this.y, this.z);
        this.AddObject(this.points);
    }
    public Update(): void {
        this.geo.attributes.position.setY(0, NaN);
        (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        this.geo.computeBoundingSphere();
        if (this.frame > 100) {
            this.isAlive = false;
        }
    }
}

class Ball extends Unit {
    public ball: PhysicSphere;
    private shaderMat: THREE.ShaderMaterial;
    constructor(private x = 0, private y = 0, private z = 0, private shaded = false) {
        super();
    }
    public Init(): void {
        this.raycastTarget = true;
        if (this.shaded) {
            const geo = new THREE.SphereBufferGeometry(1, 10, 10);
            this.shaderMat = new THREE.ShaderMaterial({
                fragmentShader: this.core.GetText("sample1.frag"),
                uniforms: {
                    // hoge: {value: 0.5},
                },
                vertexShader: this.core.GetText("sample1.vert"),
            });
            this.shaderMat.uniforms.hoge = { value: 0.0 };
            const mesh = new THREE.Mesh(geo, this.shaderMat);
            this.ball = new PhysicSphere(1, 1, "ball", mesh);
        } else {
            this.ball = new PhysicSphere(1, 1, "ball", this.core.GetObject("ball"));
        }
        EachMesh(this.ball.viewBody, (m) => {
            m.castShadow = true;
            m.receiveShadow = true;
        });
        this.ball.position.set(this.x, this.y, this.z);
        this.AddPhysicObject(this.ball);
        this.ball.SetCollideCallback((c) => {
            const p = c.collidePosition;
            this.scene.AddUnit(new Particle(p.x, p.y, p.z));
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
        if (this.shaded) {
            this.shaderMat.uniforms.time = { value: this.frame };
        }
    }
    public DrawText(): void {
        if (this.shaded) {
            const [x, y] = this.scene.GetScreenPosition(this.ball);
            this.scene.FillText("custom shadered", x, y);
        }
    }
}

class Board extends Unit {
    public floor: PhysicObjects;
    public Init(): void {
        this.raycastTarget = true;
        this.floor = new PhysicObjects(0, "floor");
        this.floor.position.set(0, -10, 0);
        this.floor.AddShapeFromJSON(
            this.core.GetText("board"),
            new THREE.MeshPhongMaterial({ map: this.core.GetTexture("tile") }));
        EachMesh(this.floor.viewBody, (m) => {
            m.castShadow = true;
            m.receiveShadow = true;
        });
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
Start("init", new LoadScene(), { halfFPS: true });
