import "imports-loader?THREE=three!three/examples/js/loaders/MTLLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
import * as THREE from "three";
import { Scene } from "./Scene";
import { Base64toBlob } from "./Util";

class Core {
    public mouseX: number = 0;
    public mouseY: number = 0;
    public windowSizeX: number;
    public windowSizeY: number;
    public textureLoader: THREE.TextureLoader;
    private canvas: HTMLCanvasElement;
    private link: HTMLAnchorElement;
    private renderer: THREE.WebGLRenderer;
    private objects: { [key: string]: THREE.Object3D } = {};
    private scenes: { [key: string]: Scene } = {};
    private activeScene: Scene = null;
    private loadingManager: THREE.LoadingManager;
    private objLoader: THREE.OBJLoader;
    private mtlLoader: THREE.MTLLoader;

    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
        });
        this.renderer.autoClear = false;
        this.windowSizeX = window.innerWidth;
        this.windowSizeY = window.innerHeight;
        this.renderer.setSize(this.windowSizeX, this.windowSizeY);
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.objLoader = new THREE.OBJLoader(this.loadingManager);
        this.mtlLoader = new THREE.MTLLoader(this.loadingManager);
        this.canvas = this.renderer.domElement;
        document.body.appendChild(this.canvas);
        this.canvas.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX - this.windowSizeX / 2;
            this.mouseY = this.windowSizeY / 2 - e.offsetY;
            if (this.activeScene.onMouseMoveCallback !== null) {
                this.activeScene.onMouseMoveCallback(e);
            }
        }, false);
        this.canvas.addEventListener("click", (e) => {
            if (this.activeScene.onMouseClickCallback !== null) {
                this.activeScene.onMouseClickCallback(e);
            }
        });
        window.addEventListener("resize", (e) => {
            if (this.activeScene.onWindowResizeCallback !== null) {
                this.activeScene.onWindowResizeCallback(e);
            }
        });
        this.link = document.createElement("a");
        this.link.style.display = "none";
        document.body.appendChild(this.link);
    }

    /**
     * ウィンドウのサイズ変更
     * @param x 新しい横幅
     * @param y 新しい高さ
     */
    public ChangeCanvasSize(x: number, y: number): void {
        this.windowSizeX = x;
        this.windowSizeY = y;
        this.renderer.setSize(this.windowSizeX, this.windowSizeY);
        // tslint:disable-next-line:forin
        for (const key in this.scenes) {
            this.scenes[key].OnCanvasResizeCallBack();
        }
    }

    /**
     * Obj形式のファイルを読み込む
     * @param objFilename OBJファイルのパス
     * @param mtlFilename MTLファイルのパス
     * @param name 3Dモデルを呼び出すためのキー
     */
    public LoadObjMtl(objFilename: string, mtlFilename: string, name: string): void {
        this.objects[name] = null;
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
                        this.objects[name] = grp;
                    });
            });
    }

    /**
     * キーで指定した3Dオブジェクトコピーしてくる
     * @param name キー
     */
    public GetObject(name: string): THREE.Object3D {
        if (this.objects[name] !== null) {
            return this.objects[name].clone(true);
        } else {
            throw new Error("Object " + name + " is null");
        }
    }

    /**
     * キーで指定したオブジェクトの読み込みが完了しているか調べる
     * @param name キー
     */
    public IsObjectAvailable(name: string): boolean {
        return this.objects[name] !== null;
    }

    /**
     * 全てのオブジェクトが読み込み終了してるか調べる
     */
    public IsAllObjectAvaiable(): boolean {
        for (const key in this.objects) {
            if (this.objects[key] === null) {
                return false;
            }
        }
        return true;
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

    /**
     * シーンを変更
     * @param sceneName 切り替えるシーンのキー
     */
    public ChangeScene(sceneName: string): void {
        if (this.scenes[sceneName] === null || this.scenes[sceneName] === undefined) {
            throw new Error("Scene " + sceneName + " does not exist.");
        }
        this.activeScene = this.scenes[sceneName];
    }

    /**
     * シーンを追加する
     * @param sceneName シーンを呼び出すためのキー
     * @param scene 追加するシーン
     */
    public AddScene(sceneName: string, scene: Scene): void {
        scene.core = this;
        this.scenes[sceneName] = scene;
        scene.Init();
    }

    /**
     * シーンを追加して移動する
     * @param sceneName シーンをのキー
     * @param scene 追加して移行するシーン
     */
    public AddAndChangeScene(sceneName: string, scene: Scene): void {
        this.AddScene(sceneName, scene);
        this.ChangeScene(sceneName);
    }

    /**
     * シーンの削除
     * @param sceneName キー
     */
    public RemoveScene(sceneName: string) {
        delete this.scenes[sceneName];
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

    private Update(): void {
        this.activeScene.Update();
    }

    private Draw(): void {
        this.activeScene.Draw();
        this.renderer.clear();
        this.renderer.render(this.activeScene.scene, this.activeScene.camera);
        this.renderer.render(this.activeScene.scene2d, this.activeScene.camera2d);
    }
}

/**
 * ゲームエンジンを起動する
 * コアの参照を返しておく
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
