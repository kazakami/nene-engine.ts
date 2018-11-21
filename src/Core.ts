import "imports-loader?THREE=three!three/examples/js/loaders/GLTFLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/MTLLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
import "imports-loader?THREE=three!three/examples/js/postprocessing/EffectComposer.js";
import "imports-loader?THREE=three!three/examples/js/postprocessing/FilmPass.js";
import "imports-loader?THREE=three!three/examples/js/postprocessing/RenderPass.js";
import "imports-loader?THREE=three!three/examples/js/postprocessing/ShaderPass.js";
import "imports-loader?THREE=three!three/examples/js/shaders/CopyShader.js";
import "imports-loader?THREE=three!three/examples/js/shaders/FilmShader.js";
import * as THREE from "three";
import { Scene } from "./Scene";
import { Base64toBlob, Coalescing } from "./Util";

class CoreOption {
    public antialias?: boolean;
    public parent?: HTMLElement;
    public windowSizeX?: number;
    public windowSizeY?: number;
    constructor(option: CoreOption) {
        this.antialias = Coalescing(option.antialias, true);
        this.parent = Coalescing(option.parent, document.body);
        this.windowSizeX = Coalescing(option.windowSizeX, window.innerWidth);
        this.windowSizeY = Coalescing(option.windowSizeY, window.innerHeight);
    }
}

class Core {
    public mouseX: number = 0;
    public mouseY: number = 0;
    public windowSizeX: number;
    public windowSizeY: number;
    public renderer: THREE.WebGLRenderer;
    public ctx: CanvasRenderingContext2D;
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
    private nextSceneName: string = null;
    private loadingManager: THREE.LoadingManager;
    private objLoader: THREE.OBJLoader;
    private mtlLoader: THREE.MTLLoader;
    private fileLoader: THREE.FileLoader;
    private gltfLoader: THREE.GLTFLoader;
    private intervals: number[] = [];
    private previousTime: number = null;
    private keyState: { [key: string]: boolean } = {};
    private previousKeyState: { [key: string]: boolean } = {};

    constructor(private option: CoreOption) {
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
    public ChangeCanvasSize(x: number, y: number): void {
        this.windowSizeX = x;
        this.windowSizeY = y;
        this.renderer.setSize(this.windowSizeX, this.windowSizeY);
        this.textCanvas.width = this.windowSizeX;
        this.textCanvas.height = this.windowSizeY;
        this.ctx = this.textCanvas.getContext("2d");
        this.ctx.font = "50px serif";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        for (const key in this.scenes) {
            this.scenes[key].OnCanvasResizeCallBack();
            if (this.scenes[key].composer !== null) {
                this.scenes[key].composer.setSize(this.windowSizeX, this.windowSizeY);
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
        const allProg =  [objProg, texProg, textProg].reduce(([a0, a1], [b0, b1]) => [a0 + b0, a1 + b1]);
        return allProg;
    }

    /**
     * テキストファイルを読み込む
     * @param filename テキストファイルのパス
     * @param name テキストファイルを呼び出すキー
     */
    public LoadFile(filename: string, name: string): void {
        this.texts[name] = null;
        this.fileLoader.load(filename,
            (file) => {
                if (typeof file === "string") {
                    this.texts[name] = file;
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
    public LoadTexture(filename: string, name: string): void {
        this.textures[name] = null;
        this.textureLoader.load(filename,
            (tex) => {
                this.textures[name] = tex;
            },
            null,
            (e) => {
                if (this.activeScene.onLoadError !== null) {
                    this.activeScene.onLoadError(e);
                } else {
                    throw e;
                }
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
    public LoadGLTF(filename: string, name: string): void {
        this.objects[name] = null;
        this.gltfLoader.load(filename,
            (gltf) => {
                this.objects[name] = gltf.scene;
            },
            null,
            (e) => {
                if (this.activeScene.onLoadError !== null) {
                    this.activeScene.onLoadError(e);
                } else {
                    throw e;
                }
            });
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
                this.objLoader.setMaterials(mtl);
                this.objLoader.load(objFilename,
                    (grp) => {
                        this.objects[name] = grp;
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
        this.renderer.setPixelRatio(1);
        this.renderer.autoClear = false;
        this.windowSizeX = this.option.windowSizeX;
        this.windowSizeY = this.option.windowSizeY;
        this.renderer.setSize(this.windowSizeX, this.windowSizeY);
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.objLoader = new THREE.OBJLoader(this.loadingManager);
        this.mtlLoader = new THREE.MTLLoader(this.loadingManager);
        this.fileLoader = new THREE.FileLoader(this.loadingManager);
        this.gltfLoader = new THREE.GLTFLoader(this.loadingManager);
        this.div = document.createElement("div");
        this.div.setAttribute("position", "relative");
        this.canvas = this.renderer.domElement;
        this.canvas.setAttribute("style", "position: absolute;");
        this.div.appendChild(this.canvas);
        // 2D文字列描画のためのcanvasの作成
        this.textCanvas = document.createElement("canvas");
        this.textCanvas.setAttribute("width", this.windowSizeX.toString());
        this.textCanvas.setAttribute("height", this.windowSizeY.toString());
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
            this.mouseX = e.offsetX - this.windowSizeX / 2;
            this.mouseY = this.windowSizeY / 2 - e.offsetY;
            if (this.activeScene.onMouseMoveCallback !== null) {
                this.activeScene.onMouseMoveCallback(e);
            }
        }, false);
        this.textCanvas.addEventListener("click", (e) => {
            if (this.activeScene.onMouseClickCallback !== null) {
                this.activeScene.onMouseClickCallback(e);
            }
        });
        window.addEventListener("resize", (e) => {
            this.renderer.setPixelRatio(1);
            if (this.activeScene.onWindowResizeCallback !== null) {
                this.activeScene.onWindowResizeCallback(e);
            }
        });
        this.textCanvas.addEventListener("touchstart", (e) => {
            if (this.activeScene.onTouchStart !== null) {
                this.activeScene.onTouchStart(e);
            }
        });
        this.textCanvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            const t = e.targetTouches[0];
            this.mouseX = t.pageX - this.windowSizeX / 2;
            this.mouseY = this.windowSizeY / 2 - t.pageY;
            if (this.activeScene.onTouchMove !== null) {
                this.activeScene.onTouchMove(e);
            }
        });
        this.textCanvas.addEventListener("touchend", (e) => {
            if (this.activeScene.onTouchEnd !== null) {
                this.activeScene.onTouchEnd(e);
            }
        });
        document.addEventListener("keypress", (e) => {
            if (!e.repeat) {
                this.keyState[e.key] = true;
            }
        });
        document.addEventListener("keyup", (e) => {
            this.keyState[e.key] = false;
        });
        window.addEventListener("blur", (e) => {
            for (const key in this.keyState) {
                this.keyState[key] = false;
            }
        });
        scene.core = this;
        this.scenes[sceneName] = scene;
        this.activeScene = scene;
        this.activeScene.InnerInit();
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
    public AddScene(sceneName: string, scene: Scene): void {
        scene.core = this;
        this.scenes[sceneName] = scene;
        scene.InnerInit();
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
        const glImage = new Image();
        const textsImage = new Image();
        let glImageLoaded = false;
        let textsImageLoaded = false;
        const drawAndSave = () => {
            const tmpCanvas = document.createElement("canvas");
            tmpCanvas.setAttribute("width", this.windowSizeX.toString());
            tmpCanvas.setAttribute("height", this.windowSizeY.toString());
            const context = tmpCanvas.getContext("2d");
            context.drawImage(glImage, 0, 0);
            context.drawImage(textsImage, 0, 0);
            const base64Image = tmpCanvas.toDataURL("image/png");
            const blob = Base64toBlob(base64Image.split(",")[1], "image/png");
            this.link.href = URL.createObjectURL(blob);
            this.link.download = filename;
            this.link.click();
        };
        glImage.onload = () => {
            glImageLoaded = true;
            if (glImageLoaded && textsImageLoaded) {
                drawAndSave();
            }
        };
        textsImage.onload = () => {
            textsImageLoaded = true;
            if (glImageLoaded && textsImageLoaded) {
                drawAndSave();
            }
        };
        textsImage.src = this.textCanvas.toDataURL("image/png");
        glImage.src = this.canvas.toDataURL("image/png");
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
            this.ctx.fillText(str, this.windowSizeX / 2 + x, this.windowSizeY / 2 - y);
        } else {
            this.ctx.fillText(str, this.windowSizeX / 2 + x, this.windowSizeY / 2 - y, maxWidth);
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
            this.activeScene = this.scenes[this.nextSceneName];
            this.nextSceneName = null;
        }
        this.activeScene.InnerUpdate();
        this.activeScene.Update();
        this.CalcFPS();
        for (const key in this.keyState) {
            this.previousKeyState[key] = this.keyState[key];
        }
    }

    private Draw(): void {
        this.activeScene.Render();
        this.activeScene.DrawText();
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
function Start(defaultSceneName: string, defaultScene: Scene, option?: CoreOption): Core {
    const modifiedOption = new CoreOption(Coalescing(option, {}));
    const core = new Core(modifiedOption);
    core.Init(defaultSceneName, defaultScene);
    return core;
}

export { Start };
export { Core };
