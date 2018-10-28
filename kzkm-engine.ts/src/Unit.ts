import * as THREE from "three";
import { PhysicObject } from "./PhysicObject";
import { Scene } from "./Scene";

abstract class Unit {
    public isAlive: boolean;
    public priority: number;
    public scene: Scene;
    public frame: number;
    public objects: THREE.Object3D[];
    public physicObjects: PhysicObject[];
    constructor() {
        this.isAlive = true;
        this.scene = null;
        this.frame = 0;
        this.objects = [];
        this.physicObjects = [];
    }
    public Update(): void {
        this.frame++;
        this.physicObjects.forEach((p) => { p.Update(); });
    }
    public Draw(): void { return; }
    public abstract Init(): void;
    public abstract Fin(): void;
    // sceneにObject3Dを追加し、Unitに紐づける
    public AddObject(o: THREE.Object3D): void {
        this.objects.push(o);
        this.scene.scene.add(o);
    }
    // sceneにviewBodyを追加し、physicWorldにphysicBodyを追加し、オブジェクトをUnitに紐付ける
    public AddPhysicObject(p: PhysicObject): void {
        this.physicObjects.push(p);
        this.scene.physicWorld.addBody(p.phyBody);
        this.scene.scene.add(p.viewBody);
    }
}

class PhysicUnit extends Unit {
    public Init() {
        return;
    }
    public Update() {
        super.Update();
    }
    public Fin() {
        return;
    }
}

export { Unit, PhysicUnit };
