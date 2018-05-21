import { Unit } from "./Unit";
import { Scene, Camera, PerspectiveCamera, Mesh, Object3D, OrthographicCamera } from "three";
import { Core } from "./Core";

class Room {
    core: Core;
    units: Unit[];
    scene: Scene;
    camera: Camera;
    scene2d: Scene;
    camera2d: Camera;
    frame: number;

    constructor() {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.scene2d = new Scene();
        this.camera2d = new OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, 0.0001, 10000);
        this.units = [];
        this.frame = 0;
    }

    Update(): void {
        this.frame++;
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

    AddUnit(u: Unit): void {
        //Initを実行してからリストに追加
        u.room = this;
        u.Init();
        this.units.push(u);
    }

    Remove(): void {
        //有効でなくなったUnitに紐づけられてるObject3Dを削除し、Fin()を呼び出す
        this.units.filter(u => !u.isAlive).forEach(u => {
            u.objects.forEach(o => {this.scene.remove(o)});
            u.Fin();
        });
        //Unitのリストから有効でなくなったものを取り除く
        this.units = this.units.filter(u => u.isAlive);
    }
}

export { Room };