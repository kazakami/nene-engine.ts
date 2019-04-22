// import "imports-loader?THREE=three!three/examples/js/loaders/GLTFLoader.js";
// import "imports-loader?THREE=three!three/examples/js/loaders/MTLLoader.js";
// import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
// import "imports-loader?THREE=three!three/examples/js/postprocessing/EffectComposer.js";
// import "imports-loader?THREE=three!three/examples/js/postprocessing/FilmPass.js";
// import "imports-loader?THREE=three!three/examples/js/postprocessing/RenderPass.js";
// import "imports-loader?THREE=three!three/examples/js/postprocessing/ShaderPass.js";
// import "imports-loader?THREE=three!three/examples/js/shaders/CopyShader.js";
// import "imports-loader?THREE=three!three/examples/js/shaders/FilmShader.js";
import * as THREE from "three";
// import { EffectComposer } from "three/examples/js/postprocessing/EffectComposer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Scene } from "./Scene";
import { AssociativeArrayToArray, Base64toBlob, Coalescing } from "./Util";

/**
 * ゲームエンジンのコアに渡すオプション
 */
export class CoreOption {
    /**
     * アンチエイリアスを有効にするか
     * 省略時はtrue
     */
    public antialias?: boolean;
    /**
     * キャンパスの親要素
     * 省略時はdocument.body
     */
    public parent?: HTMLElement;
    /**
     * 画面幅
     * 省略時はwindow.innerWidth
     */
    public screenSizeX?: number;
    /**
     * 画面高さ
     * 省略時はwindow.innerHeight
     */
    public screenSizeY?: number;
    /**
     * fpsを半分の30とするか
     * 省略時はfalse
     */
    public halfFPS?: boolean;
    constructor(option: CoreOption) {
        this.antialias = Coalescing(option.antialias, true);
        this.parent = Coalescing(option.parent, document.body);
        this.screenSizeX = Coalescing(option.screenSizeX, window.innerWidth);
        this.screenSizeY = Coalescing(option.screenSizeY, window.innerHeight);
        this.halfFPS = Coalescing(option.halfFPS, false);
    }
}

/**
 * ゲームエンジンのコア
 */
export class Core {
    /**
     * マウスのx座標
     */
    public mouseX: number = 0;
    /**
     * マウスのy座標
     */
    public mouseY: number = 0;
    /**
     * 画面幅
     */
    public screenSizeX: number;
    /**
     * 画面高さ
     */
    public screenSizeY: number;
    public renderer: THREE.WebGLRenderer;
    public ctx: CanvasRenderingContext2D;
    public halfFPS: boolean;
    public offScreenSprite: THREE.Sprite;
    public offScreenMat: THREE.SpriteMaterial;
    public offScreenScene: THREE.Scene;
    public offScreenCamera: THREE.OrthographicCamera;
    private frame: number = 0;
    private textureLoader: THREE.TextureLoader;
    private textCanvas: HTMLCanvasElement;
    private canvas: HTMLCanvasElement;
    private link: HTMLAnchorElement;
    private div: HTMLDivElement;
    private objects: { [key: string]: THREE.Object3D } = {};
    private textures: { [key: string]: THREE.Texture } = {};
    private texts: { [key: string]: string } = {};
    private scenes: { [key: string]: Scene } = {};
    private activeScene: Scene = null;
    private activeSceneName: string = null;
    private nextSceneName: string = null;
    private loadingManager: THREE.LoadingManager;
    private objLoader: OBJLoader;
    private mtlLoader: MTLLoader;
    private fileLoader: THREE.FileLoader;
    private gltfLoader: GLTFLoader;
    private intervals: number[] = [];
    private previousTime: number = null;
    private keyState: { [key: string]: boolean } = {};
    private previousKeyState: { [key: string]: boolean } = {};
    private mouseLeftState: boolean = false;
    private previousMouseLeftState: boolean = false;
    private ratio: number = 1;

    constructor(private option: CoreOption) {
    }

    /**
     * 登録されているsceneインスタンスのうち指定した条件を満たすものの配列を返す
     * @param filter フィルター関数
     */
    public SceneSelector(filter: (s: Scene) => boolean): Scene[] {
        return AssociativeArrayToArray(this.scenes).filter(filter);
    }

    get PixelRatio(): number {
        return this.ratio;
    }

    set PixelRatio(r: number) {
        this.ratio = r;
        this.ChangeScreenSize(this.screenSizeX, this.screenSizeY);
    }

    /**
     * ゲームエンジンで使用しているTHREE.WebGLRendererを使うTHREE.EffectComposerを生成する
     */
    // public MakeEffectComposer(): EffectComposer {
    //     const c = new EffectComposer(this.renderer);
    //     c.setSize(this.screenSizeX * this.ratio, this.screenSizeY * this.ratio);
    //     return c;
    // }

    /**
     * マウス左ボタンが押し下げられているか
     */
    public IsMouseLeftButtonDown(): boolean {
        return this.mouseLeftState;
    }

    /**
     * マウス左ボタンがこのフレームに押し下げられたか
     */
    public IsMouseLeftButtonPressing(): boolean {
        return (!this.previousMouseLeftState) && this.mouseLeftState;
    }

    /**
     * Coreに与えられてるオプションを取得する
     */
    public GetOption(): CoreOption {
        return this.option;
    }

    /**
     * 指定したキーがこのフレームに押し下げられたか判定する
     * @param key キー
     */
    public IsKeyPressing(key: string): boolean {
        return Coalescing(this.keyState[key], false) && !Coalescing(this.previousKeyState[key], false);
    }

    /**
     * 指定したキーだ押し下げられているが返す
     * @param key キー
     */
    public IsKeyDown(key: string): boolean {
        return Coalescing(this.keyState[key], false);
    }

    /**
     * 押し下げられているすべてのキーを配列として返す
     * 返り値はソートされている
     */
    public GetAllDownKey(): string[] {
        const keys: string[] = [];
        for (const key in this.keyState) {
            if (this.keyState[key]) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    /**
     * ウィンドウのサイズ変更
     * @param x 新しい横幅
     * @param y 新しい高さ
     */
    public ChangeScreenSize(x: number, y: number): void {
        this.screenSizeX = x;
        this.screenSizeY = y;
        this.div.setAttribute("style",
            "width: " + this.screenSizeX.toString() + "px; height: " + this.screenSizeY.toString() + "px;");
        this.renderer.setPixelRatio(this.ratio);
        this.renderer.setSize(this.screenSizeX, this.screenSizeY);
        this.offScreenCamera.left = -this.screenSizeX / 2;
        this.offScreenCamera.right = this.screenSizeX / 2;
        this.offScreenCamera.bottom = -this.screenSizeY / 2;
        this.offScreenCamera.top = this.screenSizeY / 2;
        this.offScreenCamera.updateProjectionMatrix();
        this.textCanvas.width = this.screenSizeX;
        this.textCanvas.height = this.screenSizeY;
        this.ctx = this.textCanvas.getContext("2d");
        this.ctx.font = "50px serif";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        for (const key in this.scenes) {
            if (this.scenes[key].onScreenResize) {
                this.scenes[key].onScreenResize();
            }
        }
    }

    /**
     * 非同期に読み込んでいる全てのリソースが利用可能かどうか調べる
     */
    public IsAllResourcesAvailable(): boolean {
        return this.IsAllObjectAvailable() && this.IsAllTextureAvailable() && this.IsAllTextAvailable();
    }

    /**
     * 非同期に読み込んでいるすべてのリソースの読み込み進捗を取得
     * 返り値の0番目が読み込み完了したリソースの数
     * 返り値の1番目が登録されているすべてのリソースの数
     */
    public GetAllResourcesLoadingProgress(): [number, number] {
        const objProg = this.GetObjectLoadingProgress();
        const texProg = this.GetTextureLoadingProgress();
        const textProg = this.GetTextLoadingProgress();
        const allProg = [objProg, texProg, textProg].reduce(([a0, a1], [b0, b1]) => [a0 + b0, a1 + b1]);
        return allProg;
    }

    /**
     * テキストファイルを読み込む
     * @param filename テキストファイルのパス
     * @param name テキストファイルを呼び出すキー
     */
    public LoadFile(filename: string, name: string): Promise<void> {
        return new Promise((resolve) => {
            this.texts[name] = null;
            this.fileLoader.load(filename,
                (file) => {
                    if (typeof file === "string") {
                        this.texts[name] = file;
                        resolve();
                    }
                },
                null,
                (e) => {
                    if (this.activeScene.onLoadError !== null) {
                        this.activeScene.onLoadError(e);
                    } else {
                        throw e;
                    }
                });
        });
    }

    /**
     * キーで指定したテキストファイルが読み込み終了しているか調べる
     * @param name キー
     */
    public IsTextAvailable(name: string): boolean {
        return this.texts[name] !== null && this.texts[name] !== undefined;
    }

    /**
     * 全てのテキストファイルが読み込み完了しているか調べる
     */
    public IsAllTextAvailable(): boolean {
        for (const key in this.texts) {
            if (this.texts[key] === null || this.texts[key] === undefined) {
                return false;
            }
        }
        return true;
    }

    /**
     * テキストファイルの読み込みの進捗具合を取得する
     * 返り値の0番目が読み込み完了したテキストファイルの数
     * 返り値の1番目が登録されているすべてのテキストファイルの数
     */
    public GetTextLoadingProgress(): [number, number] {
        const AllNum = Object.keys(this.texts).length;
        let LoadedNum = 0;
        for (const key in this.texts) {
            if (this.texts[key] !== null && this.texts[key] !== undefined) {
                LoadedNum++;
            }
        }
        return [LoadedNum, AllNum];
    }

    /**
     * キーで指定したテキストファイルを呼び出す
     * @param name キー
     */
    public GetText(name: string): string {
        if (this.texts[name] !== null && this.texts[name] !== undefined) {
            return this.texts[name];
        } else {
            throw new Error("Text File  " + name + " is null or undefined");
        }
    }

    /**
     * 画像を読み込む
     * @param filename 画像ファイルのパス
     * @param name 画像を呼び出すキー
     */
    public LoadTexture(filename: string, name: string): Promise<void> {
        return new Promise((resolve) => {
            this.textures[name] = null;
            this.textureLoader.load(filename,
                (tex) => {
                    this.textures[name] = tex;
                    resolve();
                },
                null,
                (e) => {
                    if (this.activeScene.onLoadError !== null) {
                        this.activeScene.onLoadError(e);
                    } else {
                        throw e;
                    }
                });
        });
    }

    /**
     * キーで指定した画像が読み込み終了してるか調べる
     * @param name キー
     */
    public IsTextureAvailable(name: string): boolean {
        return this.textures[name] !== null && this.textures[name] !== undefined;
    }

    /**
     * 全ての画像が読み込み完了しているか調べる
     */
    public IsAllTextureAvailable(): boolean {
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
     * spriteの大きさの初期値が(1, 1)である事に注意
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
     * GLTF形式のファイルを読み込む
     * @param filename GLTFファイルのパス
     * @param name 3Dモデルを呼び出すためのキー
     */
    public LoadGLTF(filename: string, name: string): Promise<void> {
        return new Promise((resolve) => {
            this.objects[name] = null;
            this.gltfLoader.load(filename,
                (gltf) => {
                    this.objects[name] = gltf.scene;
                    resolve();
                },
                null,
                (e) => {
                    if (this.activeScene.onLoadError !== null) {
                        this.activeScene.onLoadError(e);
                    } else {
                        throw e;
                    }
                });
        });
    }

    /**
     * Obj形式のファイルを読み込む
     * @param objFilename OBJファイルのパス
     * @param mtlFilename MTLファイルのパス
     * @param name 3Dモデルを呼び出すためのキー
     */
    public LoadObjMtl(objFilename: string, mtlFilename: string, name: string): Promise<void> {
        return new Promise((resolve) => {
            this.objects[name] = null;
            // ディレクトリ内を指していたらディレクトリパスとファイル名に分ける
            if (mtlFilename.indexOf("/") !== -1) {
                this.mtlLoader.setPath(mtlFilename.substr(0, mtlFilename.lastIndexOf("/")) + "/");
                mtlFilename = mtlFilename.slice(mtlFilename.lastIndexOf("/") + 1);
            }
            this.mtlLoader.load(mtlFilename,
                (mtl) => {
                    mtl.preload();
                    // 上と同様にディレクトリ内を指していたらディレクトリパスとファイル名に分ける
                    if (objFilename.indexOf("/") !== -1) {
                        this.objLoader.setPath(objFilename.substr(0, objFilename.lastIndexOf("/")) + "/");
                        objFilename = objFilename.slice(objFilename.lastIndexOf("/") + 1);
                    }
                    this.objLoader.setMaterials(mtl as any);
                    this.objLoader.load(objFilename,
                        (grp) => {
                            this.objects[name] = grp;
                            resolve();
                        },
                        null,
                        (e) => {
                            if (this.activeScene.onLoadError !== null) {
                                this.activeScene.onLoadError(e);
                            } else {
                                throw e;
                            }
                        });
                },
                null,
                (e) => {
                    if (this.activeScene.onLoadError !== null) {
                        this.activeScene.onLoadError(e);
                    } else {
                        throw e;
                    }
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
    public IsAllObjectAvailable(): boolean {
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
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.option.antialias,
            preserveDrawingBuffer: true,
        });
        this.renderer.setSize(this.screenSizeX, this.screenSizeY);
        this.halfFPS = this.option.halfFPS;
        this.screenSizeX = this.option.screenSizeX;
        this.screenSizeY = this.option.screenSizeY;
        this.offScreenCamera = new THREE.OrthographicCamera(
            -this.screenSizeX / 2, this.screenSizeX / 2,
            this.screenSizeY / 2, -this.screenSizeY / 2,
            1, 10);
        this.offScreenCamera.position.z = 10;
        this.offScreenMat = new THREE.SpriteMaterial({ color: 0xFFFFFF });
        this.offScreenSprite = new THREE.Sprite(this.offScreenMat);
        this.offScreenSprite.scale.set(this.screenSizeX, this.screenSizeY, 1);
        this.offScreenSprite.position.set(0, 0, 5);
        this.offScreenScene = new THREE.Scene();
        this.offScreenScene.add(this.offScreenSprite);
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.objLoader = new OBJLoader(this.loadingManager);
        this.mtlLoader = new MTLLoader(this.loadingManager);
        this.fileLoader = new THREE.FileLoader(this.loadingManager);
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.div = document.createElement("div");
        this.div.setAttribute("position", "relative");
        this.div.setAttribute("style",
            "width: " + this.screenSizeX.toString() + "px; height: " + this.screenSizeY.toString() + "px;");
        this.canvas = this.renderer.domElement;
        this.canvas.setAttribute("style", "position: absolute;");
        this.renderer.setPixelRatio(this.ratio);
        this.renderer.setSize(this.screenSizeX, this.screenSizeY);
        this.div.appendChild(this.canvas);
        // 2D文字列描画のためのcanvasの作成
        this.textCanvas = document.createElement("canvas");
        this.textCanvas.setAttribute("width", this.screenSizeX.toString());
        this.textCanvas.setAttribute("height", this.screenSizeY.toString());
        this.textCanvas.setAttribute("z-index", "100");
        this.textCanvas.setAttribute("style", "position: absolute;");
        this.div.appendChild(this.textCanvas);
        this.ctx = this.textCanvas.getContext("2d");
        this.ctx.font = "50px serif";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        this.option.parent.appendChild(this.div);
        // blobの内容をダウンロードさせるためのダミーリンクの作成
        this.link = document.createElement("a");
        this.link.style.display = "none";
        this.option.parent.appendChild(this.link);
        // イベントの登録
        this.textCanvas.addEventListener("mousemove", (e) => {
            this.mouseX = e.offsetX - this.screenSizeX / 2;
            this.mouseY = this.screenSizeY / 2 - e.offsetY;
            if (this.activeScene.onMouseMove !== null) {
                this.activeScene.onMouseMove(e);
            }
        }, false);
        this.textCanvas.addEventListener("click", (e) => {
            if (this.activeScene.onMouseClick !== null) {
                this.activeScene.onMouseClick(e);
            }
        });
        this.textCanvas.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                this.mouseLeftState = true;
            }
            if (this.activeScene.onMouseDown !== null) {
                this.activeScene.onMouseDown(e);
            }
        });
        this.textCanvas.addEventListener("mouseup", (e) => {
            if (e.button === 0) {
                this.mouseLeftState = false;
            }
            if (this.activeScene.onMouseUp !== null) {
                this.activeScene.onMouseUp(e);
            }
        });
        window.addEventListener("resize", (e) => {
            this.renderer.setPixelRatio(this.ratio);
            for (const key in this.scenes) {
                if (this.scenes[key].onWindowResize !== null) {
                    this.scenes[key].onWindowResize(e);
                }
            }
        });
        this.textCanvas.addEventListener("touchstart", (e) => {
            if (this.activeScene.onTouchStart !== null) {
                this.activeScene.onTouchStart(e);
            }
        });
        this.textCanvas.addEventListener("touchmove", (e) => {
            const t = e.targetTouches[0];
            this.mouseX = t.pageX - this.screenSizeX / 2;
            this.mouseY = this.screenSizeY / 2 - t.pageY;
            if (this.activeScene.onTouchMove !== null) {
                this.activeScene.onTouchMove(e);
            }
        });
        this.textCanvas.addEventListener("touchend", (e) => {
            if (this.activeScene.onTouchEnd !== null) {
                this.activeScene.onTouchEnd(e);
            }
        });
        this.textCanvas.addEventListener("wheel", (e) => {
            if (this.activeScene.onWheel !== null) {
                this.activeScene.onWheel(e);
            }
        });
        this.textCanvas.addEventListener("contextmenu", (e) => {
            if (this.activeScene.onContextmenu !== null) {
                this.activeScene.onContextmenu(e);
            }
        });
        document.addEventListener("keydown", (e) => {
            if (this.activeScene.onKeyKeyDown !== null) {
                this.activeScene.onKeyKeyDown(e);
            }
            if (!e.repeat) {
                if (e.code === undefined) {
                    let key: string;
                    if (e.keyCode >= 65 && e.keyCode <= 90) {
                        key = "Key" + String.fromCharCode(e.keyCode);
                    } else if (e.keyCode === 37) {
                        key = "ArrowLeft";
                    } else if (e.keyCode === 38) {
                        key = "ArrowUp";
                    } else if (e.keyCode === 39) {
                        key = "ArrowRight";
                    } else if (e.keyCode === 40) {
                        key = "ArrowDown";
                    } else {
                        key = e.keyCode + "";
                    }
                    console.log("KeyDown: " + key);
                    this.keyState[key] = true;
                } else {
                    this.keyState[e.code] = true;
                }
            }
        });
        document.addEventListener("keyup", (e) => {
            if (this.activeScene.onKeyKeyUp !== null) {
                this.activeScene.onKeyKeyUp(e);
            }
            if (e.code === undefined) {
                let key: string;
                if (e.keyCode >= 65 && e.keyCode <= 90) {
                    key = "Key" + String.fromCharCode(e.keyCode);
                } else if (e.keyCode === 37) {
                    key = "ArrowLeft";
                } else if (e.keyCode === 38) {
                    key = "ArrowUp";
                } else if (e.keyCode === 39) {
                    key = "ArrowRight";
                } else if (e.keyCode === 40) {
                    key = "ArrowDown";
                } else {
                    key = e.keyCode + "";
                }
                console.log("KeyUp: " + key);
                this.keyState[key] = false;
            } else {
                this.keyState[e.code] = false;
            }
        });
        window.addEventListener("blur", (e) => {
            if (this.activeScene.onBlur !== null) {
                this.activeScene.onBlur(e);
            }
            for (const key in this.keyState) {
                this.keyState[key] = false;
            }
        });
        scene.core = this;
        this.activeSceneName = sceneName;
        this.scenes[sceneName] = scene;
        this.activeScene = scene;
        this.activeScene.InnerInit();
        this.activeScene.Init();
        this.activeScene.ResizeCanvas(this.activeScene.canvasSizeX, this.activeScene.canvasSizeY);
        const animate = () => {
            requestAnimationFrame(animate);
            this.frame++;
            if (!this.halfFPS || this.frame % 2 === 0) {
                this.Update();
                this.Draw();
            }
        };
        animate();
    }

    /**
     * シーンを変更
     * 次のフレームから指定したシーンに切り替わる
     * @param sceneName 切り替えるシーンのキー
     */
    public ChangeScene(sceneName: string): void {
        if (this.scenes[sceneName] === null || this.scenes[sceneName] === undefined) {
            throw new Error("Scene " + sceneName + " does not exist.");
        }
        this.nextSceneName = sceneName;
    }

    /**
     * シーンを追加する
     * @param sceneName シーンを呼び出すためのキー
     * @param scene 追加するシーン
     */
    public async AddScene(sceneName: string, scene: Scene): Promise<void> {
        scene.core = this;
        this.scenes[sceneName] = scene;
        scene.InnerInit();
        await scene.Init();
        scene.ResizeCanvas(scene.canvasSizeX, scene.canvasSizeY);
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
            this.scenes[sceneName].InnerFin();
            this.scenes[sceneName].Fin();
            delete this.scenes[sceneName];
        }
    }

    /**
     * シーンを取得する
     * @param sceneName キー
     */
    public GetScene(sceneName: string): Scene {
        return this.scenes[sceneName];
    }

    /**
     * active sceneを取得する
     */
    public GetActiveScene(): Scene {
        return this.activeScene;
    }

    /**
     * active sceneのキーを取得する
     */
    public GetActiveSceneName(): string {
        return this.activeSceneName;
    }

    /**
     * 現在描画されてる画像をファイルとして保存する
     * @param filename 保存時のファイル名。デフォルトはscreenshot.png
     */
    public async SaveImage(filename: string = "screenshot.png"): Promise<void> {
        const glImage = new Image();
        const textsImage = new Image();
        const glImagePromise = new Promise((resolve) => {
            glImage.onload = () => resolve();
        });
        const textsImagePromise = new Promise((resolve) => {
            textsImage.onload = () => resolve();
        });
        textsImage.src = this.textCanvas.toDataURL("image/png");
        glImage.src = this.canvas.toDataURL("image/png");
        return Promise.all([glImagePromise, textsImagePromise]).then(() => {
            const tmpCanvas = document.createElement("canvas");
            tmpCanvas.setAttribute("width", this.screenSizeX.toString());
            tmpCanvas.setAttribute("height", this.screenSizeY.toString());
            const context = tmpCanvas.getContext("2d");
            context.drawImage(glImage, 0, 0);
            context.drawImage(textsImage, 0, 0);
            const base64Image = tmpCanvas.toDataURL("image/png");
            const blob = Base64toBlob(base64Image.split(",")[1], "image/png");
            this.link.href = URL.createObjectURL(blob);
            this.link.download = filename;
            this.link.click();
        });
    }

    /**
     * テキストのサイズを指定する
     * @param size ピクセル単位のサイズ
     */
    public SetTextSize(size: number): void {
        this.ctx.font = size.toString() + "px serif";
    }

    /**
     * テキストの色を指定する
     * @param color 指定する色
     */
    public SetTextColor(color: THREE.Color): void {
        this.ctx.fillStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
    }

    /**
     * 指定した座標に文字列を描画する
     * @param str 描画する文字列
     * @param x X座標
     * @param y Y座標
     * @param maxWidth 最大横幅
     */
    public DrawText(str: string, x: number, y: number, maxWidth: number = null): void {
        if (maxWidth === null) {
            this.ctx.fillText(str, this.screenSizeX / 2 + x, this.screenSizeY / 2 - y);
        } else {
            this.ctx.fillText(str, this.screenSizeX / 2 + x, this.screenSizeY / 2 - y, maxWidth);
        }
    }

    get fps(): number {
        if (this.intervals.length === 0) {
            return 0;
        } else {
            return 1000 / (this.intervals.reduce((p, c) => p + c) / this.intervals.length);
        }
    }

    private Update(): void {
        // シーン変更の必要があれば切り替える
        if (this.nextSceneName !== null) {
            if (this.scenes[this.nextSceneName] === null || this.scenes[this.nextSceneName] === undefined) {
                throw new Error("Scene " + this.nextSceneName + " does not exist.");
            }
            this.activeSceneName = this.nextSceneName;
            this.activeScene = this.scenes[this.nextSceneName];
            this.nextSceneName = null;
        }
        if (this.activeScene !== null) {
            this.activeScene.InnerUpdate();
            this.activeScene.Update();
        }
        this.CalcFPS();
        for (const key in this.keyState) {
            this.previousKeyState[key] = this.keyState[key];
        }
        this.previousMouseLeftState = this.mouseLeftState;
    }

    private Draw(): void {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.screenSizeX, this.screenSizeY);
        }
        this.activeScene.Render();
        if (this.offScreenMat) {
            this.offScreenMat.map = this.activeScene.RenderedTexture();
        }
        if (this.renderer) {
            this.offScreenSprite.scale.set(this.activeScene.canvasSizeX, this.activeScene.canvasSizeY, 1);
            this.renderer.setRenderTarget(null);
            this.renderer.render(this.offScreenScene, this.offScreenCamera);
        }
    }

    private CalcFPS(): void {
        if (this.previousTime === null) {
            this.previousTime = Date.now();
            return;
        } else {
            const now = Date.now();
            const interval = now - this.previousTime;
            this.previousTime = now;
            this.intervals.push(interval);
            if (this.intervals.length > 60) {
                this.intervals.shift();
            }
        }
    }
}

/**
 * ゲームエンジンを起動する
 * コアの参照を返しておく
 * @param defaultSceneName 初期シーンの名前
 * @param defaultScene 初期シーン
 */
export function Start(defaultSceneName: string, defaultScene: Scene, option?: CoreOption): Core {
    const modifiedOption = new CoreOption(Coalescing(option, {}));
    const core = new Core(modifiedOption);
    core.Init(defaultSceneName, defaultScene);
    return core;
}
