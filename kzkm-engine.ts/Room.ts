import { Unit } from "./Unit";
import { Scene, Camera, PerspectiveCamera, Mesh } from "three";

class Room {
    units: Unit[];
    scene: Scene;
    camera: Camera;

    constructor() {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.units = [];
    }

    Update(): void {
        this.Remove();
        this.units.forEach(u => {
            u.Update();
        });
    }

    Draw(): void {
        this.units.forEach(u => {
            u.Draw();
        });
    }

    Init(): void {
        this.units.forEach(u => {
            u.Init();
        });
    }

    AddMesh(u: Unit, m: Mesh): void {
        this.scene.add(m);
        u.meshes.push(m);
    }

    AddUnit(u: Unit): void {
        this.units.push(u);
    }

    Remove(): void {
        this.units.filter(u => !u.isAlive).forEach(u => {
            u.meshes.forEach(m => {this.scene.remove(m)});
            u.Fin();
        });
        this.units = this.units.filter(u => u.isAlive);
    }
}

export { Room };