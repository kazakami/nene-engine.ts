import * as Cannon from "cannon";
import * as THREE from "three";
import { Core } from "./Core";
import { PhysicBox, PhysicObject, PhysicPlane, PhysicSphere } from "./PhysicObject";
import { PhysicUnit, Unit } from "./Unit";

/**
 * Sceneの基底クラス、これを継承して用いる
 * Init()に起動時の処理を追加する
 */
abstract class Scene {
    public units: Unit[] = [];
    public core: Core = null;
    public scene: THREE.Scene;
    public backgroundColor: THREE.Color;
    public raycaster: THREE.Raycaster;
    public camera: THREE.PerspectiveCamera;
    public scene2d: THREE.Scene;
    public camera2d: THREE.OrthographicCamera;
    public physicWorld: Cannon.World;
    public frame: number = 0;
    public fov: number = 75;
    public composer: THREE.EffectComposer = null;
    public composer2d: THREE.EffectComposer = null;
    public offScreen: THREE.Sprite;
    public offScreenMat: THREE.SpriteMaterial;
    public onMouseMoveCallback: (e: MouseEvent) => void = null;
    public onMouseClickCallback: (e: Event) => void = null;
    public onWindowResizeCallback: (e: UIEvent) => void = null;
    public onLoadError: (e: ErrorEvent) => void = null;
    public onTouchStart: (e: TouchEvent) => void = null;
    public onTouchMove: (e: TouchEvent) => void = null;
    public onTouchEnd: (e: TouchEvent) => void = null;

    /**
     * 初期化処理はInit()に記述すべきでコンストラクタはパラメータの受け渡しのみに用いること
     */
    constructor() {
        this.backgroundColor = new THREE.Color(0x000000);
        this.raycaster = new THREE.Raycaster();
        this.scene = new THREE.Scene();
        this.scene2d = new THREE.Scene();
        this.physicWorld = new Cannon.World();
        this.physicWorld.gravity.set(0, -9.82, 0);
        this.physicWorld.broadphase = new Cannon.NaiveBroadphase();
        this.physicWorld.solver.iterations = 5;
    }

    /**
     * この関数は基本的にオーバーライドすべきでない
     */
    public InnerUpdate(): void {
        this.frame++;
        // 有効でなくなったUnitの削除処理を行ってからUpdate()を実行する
        this.Remove();
        this.units.forEach((u) => {
            u.InnerUpdate();
            u.Update();
        });
        this.physicWorld.step(1 / 60);
    }

    /**
     * Updateの処理を記述するにはこの関数をオーバーライドする
     */
    public Update(): void {
        return;
    }

    /**
     * 3Dオブジェクト等や3次元座標等から画面に描画した際の2次元座標を取得
     * @param input 3Dオブジェクト等や3次元座標等
     */
    public GetScreenPosition(input: THREE.Object3D |
                                    THREE.Vector3 |
                                    Cannon.Vec3 |
                                    PhysicObject |
                                    [number, number, number])
                            : [number, number] {
        const p = new THREE.Vector3();
        if (input instanceof THREE.Vector3) {
            p.copy(input);
        } else if (input instanceof THREE.Object3D) {
            p.copy(input.position);
        } else if (input instanceof Cannon.Vec3) {
            p.set(input.x, input.y, input.z);
        } else if (input instanceof PhysicObject) {
            p.set(input.position.x, input.position.y, input.position.z);
        } else {
            p.set(input[0], input[1], input[2]);
        }
        p.project(this.camera);
        return [p.x * this.core.windowSizeX / 2, p.y * this.core.windowSizeY / 2];
    }

    /**
     * レイキャストを行う
     * @param data messageはUnitに対して処理を分岐させるパラメータ、positionはレイキャストを行う画面上の座標で省略時はマウス座標
     */
    public Raycast(data: {message?: object, position?: THREE.Vec2} = {message: null, position: null}): void {
        if (data.position === null) {
            data.position = {x: this.core.mouseX / (this.core.windowSizeX / 2),
                        y: this.core.mouseY / (this.core.windowSizeY / 2)};
        }
        this.raycaster.setFromCamera(data.position, this.camera);
        this.units.filter((u) => u.raycastTarget).forEach((u) => {
            const intersects = this.raycaster.intersectObjects(u.allObject3D, true);
            if (intersects.length !== 0) {
                u.onRaycastedCallback(intersects, data.message);
            }
        });
    }

    public Render(): void {
        this.core.ctx.clearRect(0, 0, this.core.windowSizeX, this.core.windowSizeY);
        this.core.renderer.setClearColor(this.backgroundColor);
        if (this.composer === null) {
            this.core.renderer.render(this.scene, this.camera , this.core.renderTarget);
            // 3D用のシーンでcomposerを使っていなければオフスクリーンレンダリングの結果を用いる
            this.offScreenMat.map = this.core.renderTarget.texture;
        } else {
            this.composer.render();
            // 3D用のシーンでcomposerを使っていればcomposerの結果出力バッファを用いる
            this.offScreenMat.map = this.composer.readBuffer.texture;
        }
        // 3Dの描画結果を入れたspriteの大きさを画面サイズにセット
        this.offScreen.scale.set(this.core.windowSizeX, this.core.windowSizeY, 1);
        if (this.composer2d === null) {
            this.core.renderer.render(this.scene2d, this.camera2d);
        } else {
            // 最終のpassのrenderToScreenをtrueにしてrenderした後、renderToScreenを元に戻す
            const num = this.composer2d.passes.length;
            const before = this.composer2d.passes[num - 1].renderToScreen;
            this.composer2d.passes[num - 1].renderToScreen = true;
            this.composer2d.render();
            this.composer2d.passes[num - 1].renderToScreen = before;
        }
    }

    /**
     * 基本的にこの関数はオーバーライドすべきでない
     */
    public InnerDrawText(): void {
        this.units.forEach((u) => {
            u.DrawText();
        });
    }

    /**
     * 文字の描画処理を記述するにはこの関数をオーバーライドする
     */
    public DrawText(): void {
        return;
    }

    /**
     * 起動時の初期化処理を記述するためにはこの関数をオーバーライドする。
     */
    public Init(): void {
        return;
    }

    /**
     * この関数は基本的にオーバーライドすべきでない
     */
    public InnerInit(): void {
        this.units.forEach((u) => {
            u.Init();
        });
        this.camera = new THREE.PerspectiveCamera(this.fov, this.core.windowSizeX / this.core.windowSizeY, 0.1, 1000);
        this.camera2d = new THREE.OrthographicCamera(
            -this.core.windowSizeX / 2, this.core.windowSizeX / 2,
            this.core.windowSizeY / 2, -this.core.windowSizeY / 2,
            1, 10 );
        this.camera2d.position.z = 10;
        this.offScreenMat = new THREE.SpriteMaterial({
            color: 0xFFFFFF,
        });
        this.offScreen = new THREE.Sprite(this.offScreenMat);
        this.offScreen.scale.set(this.core.windowSizeX, this.core.windowSizeY, 1);
        this.offScreen.position.set(0, 0, 1);
        this.scene2d.add(this.offScreen);
    }

    /**
     * シーンにUnitを追加する
     * 追加されたUnitは毎フレームUpdateやDrawText等が呼ばれるようになる
     * UnitのisAliveがfalseになると自動で取り除かれる
     * @param u 追加するUnit
     */
    public AddUnit(u: Unit): void {
        // Initを実行してからリストに追加
        u.scene = this;
        u.core = this.core;
        u.Init();
        this.units.push(u);
    }

    public Fin(): void {
        this.DeleteUnits(this.units);
        this.units = [];
    }

    public OnCanvasResizeCallBack(): void {
        this.camera.aspect = this.core.windowSizeX / this.core.windowSizeY;
        this.camera.updateProjectionMatrix();
        this.camera2d.left = -this.core.windowSizeX / 2;
        this.camera2d.right = this.core.windowSizeX / 2;
        this.camera2d.bottom = -this.core.windowSizeY / 2;
        this.camera2d.top = this.core.windowSizeY / 2;
        this.camera2d.updateProjectionMatrix();
    }

    public LoadFromFile(filename: string): void {
        const loader = new THREE.FileLoader();
        loader.load(filename, (res) => {
            if (typeof res !== "string") {
                throw new Error("file is binary.");
            }
            const objs = JSON.parse(res);
            // 各unit
            objs.forEach((obj) => {
                const u: Unit = new PhysicUnit();
                this.AddUnit(u);
                if ("name" in obj) {
                    console.log(obj.name);
                }
                if ("phys" in obj) {
                    // 各物理オブジェクト
                    obj.phys.forEach((physic) => {
                        if ("name" in physic) {
                            console.log(physic.name);
                        }
                        switch (physic.type) {
                            case "sphere": {
                                console.log("sp");
                                const x: number = physic.x;
                                const y: number = physic.y;
                                const z: number = physic.z;
                                const mass: number = physic.mass;
                                const radius: number = physic.radius;
                                const sphere = new PhysicSphere(mass, radius);
                                sphere.phyBody.position.set(x, y, z);
                                u.AddPhysicObject(sphere);
                                break;
                            }
                            case "box": {
                                console.log("box");
                                const x: number = physic.x;
                                const y: number = physic.y;
                                const z: number = physic.z;
                                const mass: number = physic.mass;
                                const width: number = physic.width;
                                const height: number = physic.height;
                                const depth: number = physic.depth;
                                const box = new PhysicBox(mass, width, height, depth);
                                box.phyBody.position.set(x, y, z);
                                u.AddPhysicObject(box);
                                break;
                            }
                            case "plane": {
                                console.log("plane");
                                const axisx: number = physic.axisx;
                                const axisy: number = physic.axisy;
                                const axisz: number = physic.axisz;
                                const mass: number = physic.number;
                                const angle: number = physic.angle;
                                const plane = new PhysicPlane(mass);
                                plane.phyBody.quaternion.setFromAxisAngle(new Cannon.Vec3(axisx, axisy, axisz), angle);
                                u.AddPhysicObject(plane);
                                break;
                            }
                            default:
                                break;
                        }
                    });
                }
            });
        });
    }

    protected Remove(): void {
        // 有効でなくなったUnitに紐づけられてるObject3Dを削除し、PhysicObjectも削除し、Fin()を呼び出す
        this.DeleteUnits(this.units.filter((u) => !u.isAlive));
        // Unitのリストから有効でなくなったものを取り除く
        this.units = this.units.filter((u) => u.isAlive);
    }

    private DeleteUnits(units: Unit[]): void {
        units.forEach((u) => {
            u.objects.forEach((o) => { this.scene.remove(o); });
            u.sprites.forEach((s) => {
                if ("isTiledTexturedSprite" in s) {
                    this.scene2d.remove(s.sprite);
                    s.Dispose();
                } else {
                    this.scene2d.remove(s);
                }
            });
            u.physicObjects.forEach((p) => {
                this.scene.remove(p.viewBody);
                this.physicWorld.remove(p.phyBody);
            });
            u.Fin();
            u.objects = [];
            u.allObject3D = [];
            u.sprites = [];
            u.physicObjects = [];
            u.scene = null;
            u.core = null;
        });
    }
}

export { Scene };
