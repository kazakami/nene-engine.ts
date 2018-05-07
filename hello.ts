import { BoxGeometry, MeshBasicMaterial, Mesh } from "three";
import { Room } from "./kzkm-engine.ts/Room";
import { Unit } from "./kzkm-engine.ts/Unit";
import { Core } from "./kzkm-engine.ts/Core";

class InitScene extends Room {
    constructor() {
        super();
        this.AddUnit(new Chara(this));
    }
}

class Chara extends Unit {
    geometry: BoxGeometry;
    material: MeshBasicMaterial;
    cube: Mesh;
    Update(): void {
        super.Update();
        this.cube.rotation.x += 0.1;
        this.cube.rotation.y += 0.1;
        //console.log(this.frame);
    }
    Draw(): void {
        //console.log("uuuuu");
    }
    Init(): void {
        console.log("init!!");
        this.geometry = new BoxGeometry(1, 1, 1);
        this.material = new MeshBasicMaterial({color: 0xffffff});
        this.cube = new Mesh(this.geometry, this.material);
        this.room.scene.add(this.cube);
        this.room.camera.position.z = 5;
    }
    Fin(): void {

    }
}

let s = new Core("init", new InitScene());
