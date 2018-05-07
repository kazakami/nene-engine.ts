import { Room } from "./Room";

abstract class Unit {
    isAlive: boolean;
    priority: number;
    room: Room;
    frame: number;
    constructor(room){
        this.isAlive = true;
        this.room = room;
        this.frame = 0;
    }
    Update(): void{
        this.frame++;
    }
    abstract Draw(): void;
    abstract Init(): void;
    abstract Fin(): void;
}

export { Unit };