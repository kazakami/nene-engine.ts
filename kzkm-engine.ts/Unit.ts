import * as THREE from "three";
import { PhysicObject } from "./PhysicObject";
import { Room } from "./Room";

abstract class Unit {
    public isAlive: boolean;
    public priority: number;
    public room: Room;
    public frame: number;
    public objects: THREE.Object3D[];
    public physicObjects: PhysicObject[];
    constructor() {
        this.isAlive = true;
        this.room = null;
        this.frame = 0;
        this.objects = [];
    }
    public Update(): void {
        this.frame++;
        this.physicObjects.forEach((p) => { p.Update(); });
    }
    public abstract Draw(): void;
    public abstract Init(): void;
    public abstract Fin(): void;
    // sceneにObject3Dを追加し、Unitに紐づける
    public AddObject(o: THREE.Object3D): void {
        this.objects.push(o);
        this.room.scene.add(o);
    }
    // sceneにviewBodyを追加し、physicWorldにphysicBodyを追加し、オブジェクトをUnitに紐付ける
    public AddPhysicObject(p: PhysicObject): void {
        this.physicObjects.push(p);
        this.room.physicWorld.addBody(p.PhyBody);
        this.room.scene.add(p.viewBody);
    }
}

export { Unit };
