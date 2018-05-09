import { Room } from "./Room";
import { Object3D } from "three";

abstract class Unit {
    isAlive: boolean;
    priority: number;
    room: Room;
    frame: number;
    objects: Object3D[];
    constructor(room){
        this.isAlive = true;
        this.room = room;
        this.frame = 0;
        this.objects = [];
    }
    Update(): void{
        this.frame++;
    }
    abstract Draw(): void;
    abstract Init(): void;
    abstract Fin(): void;
}

export { Unit };