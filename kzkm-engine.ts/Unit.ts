import { Room } from "./Room";
import { Object3D } from "three";

abstract class Unit {
    isAlive: boolean;
    priority: number;
    room: Room;
    frame: number;
    objects: Object3D[];
    constructor(){
        this.isAlive = true;
        this.room = null;
        this.frame = 0;
        this.objects = [];
    }
    Update(): void{
        this.frame++;
    }
    abstract Draw(): void;
    abstract Init(): void;
    abstract Fin(): void;
    //SceneにObject3Dを追加し、Unitに紐づける
    AddObject(o: Object3D): void {
        this.objects.push(o);
        this.room.scene.add(o);
    }
}

export { Unit };