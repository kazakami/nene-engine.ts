import * as THREE from "three";
import { collideTest, Point, Rectangle, Scene, Start } from "../src/nene-engine";

class LoaddScene extends Scene {
    public async Init() {
        this.canvasSizeX = this.core.screenSizeX;
        this.canvasSizeY = this.core.screenSizeY;
        this.backgroundColor = new THREE.Color(0x887766);
        this.onLoadError = (e) => console.log(e);
        this.onTouchMove = (e) => { e.preventDefault(); };
        this.onWindowResize = () => {
            this.core.ChangeScreenSize(window.innerWidth, window.innerHeight);
            this.ResizeCanvas(this.core.screenSizeX, this.core.screenSizeY);
        };
        this.core.AddAndChangeScene("main", new MainScene());
    }
    public DrawText(): void {
        const [a, b] = this.core.GetAllResourcesLoadingProgress();
        this.FillText("Now Loading " + a + "/" + b, 0, 0);
    }
}

class MainScene extends Scene {
    private mesh: THREE.Mesh;
    private miniWindow: MiniWindowScene;
    private spriteMat: THREE.SpriteMaterial;
    private sprite: THREE.Sprite;
    private miniWindowX: number;
    private miniWindowY: number;
    private previousMouseX: number;
    private previousMouseY: number;
    private miniWindowDragging: boolean = false;
    public Init() {
        this.miniWindowX = 400;
        this.miniWindowY = 100;
        this.canvasSizeX = this.core.screenSizeX;
        this.canvasSizeY = this.core.screenSizeY;
        this.backgroundColor = new THREE.Color(0xaaaaaa);
        this.onLoadError = (e) => console.log(e);
        this.onTouchMove = (e) => { e.preventDefault(); };
        this.onWindowResize = () => {
            this.core.ChangeScreenSize(window.innerWidth, window.innerHeight);
            this.ResizeCanvas(this.core.screenSizeX, this.core.screenSizeY);
        };
        this.miniWindow = this.CreateScene(new MiniWindowScene());
        this.spriteMat = new THREE.SpriteMaterial({ color: 0xffffff, map: this.miniWindow.RenderedTexture() });
        this.sprite = new THREE.Sprite(this.spriteMat);
        this.sprite.scale.set(320, 240, 1);
        this.sprite.position.set(this.miniWindowX, this.miniWindowY, 1);
        this.scene2d.add(this.sprite);
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(0, 100, 0);
        this.scene.add(light);
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
        const mat = new THREE.MeshPhongMaterial({ color: 0x225599 });
        const geo = new THREE.TorusBufferGeometry(5, 2);
        this.mesh = new THREE.Mesh(geo, mat);
        this.scene.add(this.mesh);
    }
    public Update() {
        this.miniWindow.InnerUpdate();
        this.miniWindow.Update();
        this.miniWindow.Render();
        this.mesh.rotateY(0.1);
        this.sprite.position.set(this.miniWindowX, this.miniWindowY, 1);
        if (this.core.IsMouseLeftButtonPressing() &&
            collideTest(new Point(this.core.mouseX, this.core.mouseY),
                new Rectangle(this.miniWindowX, this.miniWindowY, 320, 240))) {
            this.previousMouseX = this.core.mouseX;
            this.previousMouseY = this.core.mouseY;
            this.miniWindowDragging = true;
        }
        if (this.miniWindowDragging) {
            if (this.core.IsMouseLeftButtonDown()) {
                this.miniWindowX += this.core.mouseX - this.previousMouseX;
                this.miniWindowY += this.core.mouseY - this.previousMouseY;
                this.previousMouseX = this.core.mouseX;
                this.previousMouseY = this.core.mouseY;
            } else {
                this.miniWindowDragging = false;
            }
        }
    }
    public DrawText() {
        this.FillText("FPS: " + Math.round(this.core.fps).toString(),
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2);
    }
}

class MiniWindowScene extends Scene {
    private mesh: THREE.Mesh;
    public Init() {
        this.canvasSizeX = 320;
        this.canvasSizeY = 240;
        this.backgroundColor = new THREE.Color(0x887766);
        this.onLoadError = (e) => console.log(e);
        this.onTouchMove = (e) => { e.preventDefault(); };
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(0, 100, 0);
        this.scene.add(light);
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
        const mat = new THREE.MeshPhongMaterial({ color: 0xeeff33 });
        const geo = new THREE.BoxBufferGeometry(10, 10, 10);
        this.mesh = new THREE.Mesh(geo, mat);
        this.scene.add(this.mesh);
    }
    public Update() {
        this.mesh.rotateOnAxis(new THREE.Vector3(1, 1, 1).normalize(), 0.1);
    }
    public DrawText() {
        this.FillText("😎😎😎This is mini window!!😎😎😎", -400, -100);
    }
}

Start("init", new LoaddScene());
