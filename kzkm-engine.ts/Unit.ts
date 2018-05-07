import { Room } from "./Room";
import { Mesh } from "three";

abstract class Unit {
    isAlive: boolean;
    priority: number;
    room: Room;
    frame: number;
    meshes: Mesh[];
    constructor(room){
        this.isAlive = true;
        this.room = room;
        this.frame = 0;
        this.meshes = [];
    }
    Update(): void{
        this.frame++;
    }
    abstract Draw(): void;
    abstract Init(): void;
    abstract Fin(): void;
}

export { Unit };