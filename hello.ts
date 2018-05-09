import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
import { BoxGeometry, MeshBasicMaterial, Mesh, OBJLoader, LoadingManager, Scene } from "three";
import { Room } from "./kzkm-engine.ts/Room";
import { Unit } from "./kzkm-engine.ts/Unit";
import { Start } from "./kzkm-engine.ts/Core";


class InitScene extends Room {
    constructor() {
        super();
    }
    Init(): void
    {
        super.Init();
        this.AddUnit(new Chara(this));
        this.AddUnit(new ObjTest(this));
        this.camera.position.z = 10;
    }
}

class ObjTest extends Unit {
    Init(): void {
        let manager = new LoadingManager();
        let loader = new OBJLoader(manager);
        let material = new MeshBasicMaterial({color: 0x99aaff});
        loader.load("resources/ente progress_export.obj",
            grp => {
                grp.traverse(obj => {
                    if (obj instanceof Mesh) {
                        obj.material = material;
                    }
                });
                this.room.AddObject(this, grp);
            },
            pe => {
                console.log(pe.loaded + "/" + pe.total);
            },
            ee => {
                console.log("error: " + ee.filename);
            }
        );
    }
    Update(): void {
        super.Update();
        if (this.frame == 100) this.isAlive = false;
    }
    Draw(): void {

    }
    Fin(): void {

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
        if (this.frame == 50) {
            console.log("add");
            this.room.AddUnit(new Chara(this.room));
        }
        if (this.frame == 200) this.isAlive = false;
    }
    Draw(): void {
        //console.log("uuuuu");
    }
    Init(): void {
        console.log("init!!");
        this.geometry = new BoxGeometry(1, 1, 1);
        this.material = new MeshBasicMaterial({color: 0xffffff});
        this.cube = new Mesh(this.geometry, this.material);
        this.cube.position.x = Math.random() * 8 - 4;
        this.cube.position.y = Math.random() * 8 - 4;
        this.cube.position.z = Math.random() * 8 - 4;
        this.room.AddObject(this, this.cube);
    }
    Fin(): void {
        console.log("Fin!!");
        this.geometry.dispose();
        this.material.dispose();
    }
}



Start("init", new InitScene());
