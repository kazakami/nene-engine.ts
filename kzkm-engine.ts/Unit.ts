import { Room } from "./Room";

import { Object3D } from "three";

abstract class Unit {
    public isAlive: boolean;
    public priority: number;
    public room: Room;
    public frame: number;
    public objects: Object3D[];
    constructor() {
        this.isAlive = true;
        this.room = null;
        this.frame = 0;
        this.objects = [];
    }
    public Update(): void {
        this.frame++;
    }
    public abstract Draw(): void;
    public abstract Init(): void;
    public abstract Fin(): void;
    // SceneにObject3Dを追加し、Unitに紐づける
    public AddObject(o: Object3D): void {
        this.objects.push(o);
        this.room.scene.add(o);
    }
}

export { Unit };
