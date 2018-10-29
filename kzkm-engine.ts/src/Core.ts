import "imports-loader?THREE=three!three/examples/js/loaders/MTLLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
import * as THREE from "three";
import { Scene } from "./Scene";
import { Base64toBlob } from "./Util";

class Core {
    public scenes: { [key: string]: Scene } = {};
    public activeScene: Scene = null;
    public renderer: THREE.WebGLRenderer;
    public objects: { [key: string]: [boolean, THREE.Object3D] } = {};
    public loadingManager: THREE.LoadingManager;
    public objLoader: THREE.OBJLoader;
    public mtlLoader: THREE.MTLLoader;
    public canvas: HTMLCanvasElement;
    public mouseX: number = 0;
    public mouseY: number = 0;
    public windowSizeX: number;
    public windowSizeY: number;
    public link: HTMLAnchorElement;

    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
        });
        this.renderer.autoClear = false;
        this.windowSizeX = window.innerWidth;
        this.windowSizeY = window.innerHeight;
        this.renderer.setSize(this.windowSizeX, this.windowSizeY);
        this.loadingManager = new THREE.LoadingManager();
        this.objLoader = new THREE.OBJLoader(this.loadingManager);
        this.mtlLoader = new THREE.MTLLoader(this.loadingManager);
        this.canvas = this.renderer.domElement;
        document.body.appendChild(this.canvas);
        this.canvas.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
            if (this.activeScene.onMouseMoveCallback !== null) {
                this.activeScene.onMouseMoveCallback(e);
            }
        }, false);
        this.canvas.addEventListener("click", (e) => {
            if (this.activeScene.onMouseClickCallback !== null) {
                this.activeScene.onMouseClickCallback(e);
            }
        });
        this.link = document.createElement("a");
        this.link.style.display = "none";
        document.body.appendChild(this.link);
    }

    public LoadObjMtl(objFilename: string, mtlFilename: string, name: string): void {
        // ディレクトリ内を指していたらディレクトリパスとファイル名に分ける
        if (mtlFilename.indexOf("/") !== -1) {
            this.mtlLoader.setPath(mtlFilename.substr(0, mtlFilename.lastIndexOf("/")) + "/");
            mtlFilename = mtlFilename.slice(mtlFilename.indexOf("/") + 1);
        }
        this.mtlLoader.load(mtlFilename,
            (mtl) => {
                mtl.preload();
                // 上と同様にディレクトリ内を指していたらディレクトリパスとファイル名に分ける
                if (objFilename.indexOf("/") !== -1) {
                    this.objLoader.setPath(objFilename.substr(0, objFilename.lastIndexOf("/")) + "/");
                    objFilename = objFilename.slice(objFilename.indexOf("/") + 1);
                }
                this.objLoader.setMaterials(mtl);
                this.objLoader.load(objFilename,
                    (grp) => {
                        this.objects[name] = [true, grp];
                    });
            });
    }

    public GetObject(name: string): THREE.Object3D {
        return this.objects[name][1].clone(true);
    }

    public IsObjectAvailable(name: string): boolean {
        if (this.objects[name]) {
            return this.objects[name][0];
        } else {
            return false;
        }
    }

    public Init(sceneName: string, scene: Scene): void {
        scene.core = this;
        this.scenes[sceneName] = scene;
        this.activeScene = scene;
        this.activeScene.Init();
        const animate = () => {
            requestAnimationFrame(animate);
            this.Update();
            this.Draw();
        };
        animate();
    }

    public Update(): void {
        this.activeScene.Update();
    }

    public Draw(): void {
        this.activeScene.Draw();
        this.renderer.clear();
        this.renderer.render(this.activeScene.scene, this.activeScene.camera);
        this.renderer.render(this.activeScene.scene2d, this.activeScene.camera2d);
    }

    public ChangeScene(sceneName: string): void {
        this.activeScene = this.scenes[sceneName];
    }

    public AddScene(sceneName: string, scene: Scene): void {
        scene.core = this;
        this.scenes[sceneName] = scene;
        scene.Init();
    }

    /**
     * 現在描画されてる画像をファイルとして保存する
     * @param filename 保存時のファイル名。デフォルトはscreenshot.png
     */
    public SaveImage(filename: string = "screenshot.png"): void {
        const base64Image = this.canvas.toDataURL("image/png");
        // console.log(base64Image.split(",")[1]);
        const blob = Base64toBlob(base64Image.split(",")[1], "image/png");
        this.link.href = URL.createObjectURL(blob);
        this.link.download = filename;
        this.link.click();
    }
}

/**
 * ゲームエンジンを起動する
 * @param defaultSceneName 初期シーンの名前
 * @param defaultScene 初期シーン
 */
function Start(defaultSceneName: string, defaultScene: Scene): Core {
    const core = new Core();
    core.Init(defaultSceneName, defaultScene);
    return core;
}

export { Start };
export { Core };
