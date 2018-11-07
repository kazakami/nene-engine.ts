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
    private textures: { [key: string]: THREE.Texture } = {};
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
     * 非同期に読み込んでいる全てのリソースが利用可能かどうか調べる
     */
    public IsAllResourcesAvaiable(): boolean {
        return this.IsAllObjectAvaiable() && this.IsAllTextureAvaiable();
    }

    /**
     * 非同期に読み込んでいるすべてのリソースの読み込み進捗を取得
     * 返り値の0番目が読み込み完了したリソースの数
     * 返り値の1番目が登録されているすべてのリソースの数
     */
    public GetAllResourcesLoadingProgress(): [number, number] {
        const objProg = this.GetObjectLoadingProgress();
        const texProg = this.GetTextureLoadingProgress();
        return [objProg[0] + texProg[0], objProg[1] + texProg[1]];
    }

    /**
     * 画像を読み込む
     * @param filename 画像ファイルのパス
     * @param name 画像を呼び出すキー
     */
    public LoadTexture(filename: string, name: string): void {
        this.textures[name] = null;
        this.textureLoader.load(filename, (tex) => {
            this.textures[name] = tex;
        });
    }

    /**
     * キーで指定した画像が読み込み終了してるか調べる
     * @param name キー
     */
    public IsTextureAvaiable(name: string): boolean {
        return this.textures[name] !== null && this.textures[name] !== undefined;
    }

    /**
     * 全ての画像が読み込み完了しているか調べる
     */
    public IsAllTextureAvaiable(): boolean {
        for (const key in this.textures) {
            if (this.textures[key] === null || this.textures[key] === undefined) {
                return false;
            }
        }
        return true;
    }

    /**
     * キーで指定した画像を呼び出す
     * @param name キー
     */
    public GetTexture(name: string): THREE.Texture {
        if (this.textures[name] !== null && this.textures[name] !== undefined) {
            return this.textures[name];
        } else {
            throw new Error("Texture " + name + " is null or undefined");
        }
    }

    /**
     * 指定したキーの画像からspriteを作る関数
     * @param name キー
     * @param color 色
     */
    public MakeSpriteFromTexture(name: string, color: string | number | THREE.Color = 0xFFFFFF): THREE.Sprite {
        const mat = new THREE.SpriteMaterial({ color: color, map: this.GetTexture(name) });
        const sprite = new THREE.Sprite(mat);
        mat.dispose();
        return sprite;
    }

    /**
     * 画像の読み込みの進捗具合を取得する
     * 返り値の0番目が読み込み完了した画像の数
     * 返り値の1番目が登録されているすべての画像の数
     */
    public GetTextureLoadingProgress(): [number, number] {
        const AllNum = Object.keys(this.textures).length;
        let LoadedNum = 0;
        for (const key in this.textures) {
            if (this.textures[key] !== null && this.textures[key] !== undefined) {
                LoadedNum++;
            }
        }
        return [LoadedNum, AllNum];
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
        if (this.objects[name] !== null && this.objects[name] !== undefined) {
            return this.objects[name].clone(true);
        } else {
            throw new Error("Object " + name + " is null or undefined");
        }
    }

    /**
     * キーで指定したオブジェクトの読み込みが完了しているか調べる
     * @param name キー
     */
    public IsObjectAvailable(name: string): boolean {
        return this.objects[name] !== null && this.objects[name] !== undefined;
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

    /**
     * オブジェクトの読み込みの進捗具合を取得する
     * 返り値の0番目が読み込み完了したオブジェクトの数
     * 返り値の1番目が登録されているすべてのオブジェクトの数
     */
    public GetObjectLoadingProgress(): [number, number] {
        const AllNum = Object.keys(this.objects).length;
        let LoadedNum = 0;
        for (const key in this.objects) {
            if (this.objects[key] !== null && this.objects[key] !== undefined) {
                LoadedNum++;
            }
        }
        return [LoadedNum, AllNum];
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
    public RemoveScene(sceneName: string): void {
        if (this.scenes[sceneName] !== null && this.scenes[sceneName] !== undefined) {
            this.scenes[sceneName].Fin();
            delete this.scenes[sceneName];
        }
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
        this.renderer.setClearColor(this.activeScene.backgroundColor);
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
