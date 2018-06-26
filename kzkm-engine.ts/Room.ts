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
        //有効でなくなったUnitの削除処理を行ってからUpdate()を実行する
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
        //Sceneにメッシュを追加し、Unitに紐づける
        this.scene.add(m);
        u.meshes.push(m);
    }

    AddUnit(u: Unit): void {
        //Initを実行してからリストに追加
        u.Init();
        this.units.push(u);
    }

    Remove(): void {
        //有効でなくなったUnitに紐づけられてるメッシュを削除し、Fin()を呼び出す
        this.units.filter(u => !u.isAlive).forEach(u => {
            u.meshes.forEach(m => {this.scene.remove(m)});
            u.Fin();
        });
        //Unitのリストから有効でなくなったものを取り除く
        this.units = this.units.filter(u => u.isAlive);
    }
}

export { Room };