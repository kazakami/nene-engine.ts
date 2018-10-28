import * as Cannon from "cannon";
import * as THREE from "three";
import { PhysicBox, PhysicPlane, PhysicSphere } from "./PhysicObject";
import { PhysicUnit, Unit } from "./Unit";

class Scene {
    public units: Unit[];
    public scene: THREE.Scene;
    public camera: THREE.Camera;
    public scene2d: THREE.Scene;
    public camera2d: THREE.Camera;

    public physicWorld: Cannon.World;

    public frame: number;

    public onMouseMoveCallback: (e: MouseEvent) => void;
    public onMouseClickCallback: (e: Event) => void;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, 0.0001, 10000);
        this.units = [];
        this.frame = 0;
        this.physicWorld = new Cannon.World();
        this.physicWorld.gravity.set(0, -9.82, 0);
        this.physicWorld.broadphase = new Cannon.NaiveBroadphase();
        this.physicWorld.solver.iterations = 5;
        this.onMouseClickCallback = null;
        this.onMouseMoveCallback = null;
    }

    public Update(): void {
        this.frame++;
        // 有効でなくなったUnitの削除処理を行ってからUpdate()を実行する
        this.Remove();
        this.units.forEach((u) => {
            u.Update();
        });
        this.physicWorld.step(1 / 60);
    }

    public Draw(): void {
        this.units.forEach((u) => {
            u.Draw();
        });
    }

    public Init(): void {
        this.units.forEach((u) => {
            u.Init();
        });
    }

    public AddUnit(u: Unit): void {
        // Initを実行してからリストに追加
        u.scene = this;
        u.Init();
        this.units.push(u);
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

    public Remove(): void {
        // 有効でなくなったUnitに紐づけられてるObject3Dを削除し、PhysicObjectも削除し、Fin()を呼び出す
        this.units.filter((u) => !u.isAlive).forEach((u) => {
            u.objects.forEach((o) => { this.scene.remove(o); });
            u.physicObjects.forEach((p) => {
                this.scene.remove(p.viewBody);
                this.physicWorld.remove(p.phyBody);
            });
            u.Fin();
        });
        // Unitのリストから有効でなくなったものを取り除く
        this.units = this.units.filter((u) => u.isAlive);
    }
}

export { Scene };
