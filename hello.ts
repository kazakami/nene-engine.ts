import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/MTLLoader.js";
import { BoxGeometry, MeshBasicMaterial, Mesh, OBJLoader, LoadingManager, Scene, MTLLoader, PointLight, AmbientLight, Color, TextureLoader, Colors, Group, DirectionalLight } from "three";
import { Room } from "./kzkm-engine.ts/Room";
import { Unit } from "./kzkm-engine.ts/Unit";
import { Start } from "./kzkm-engine.ts/Core";


class LoadScene extends Room {
    Init(): void {
        super.Init();
        this.core.LoadObjMtl("resources/ente progress_export.obj", "resources/ente progress_export.mtl", "ente");
    }
    Update(): void {
        if (this.core.IsObjectAvailable("ente")) {
            this.core.AddRoom("game", new GameRoom());
            this.core.ChangeRoom("game");
        } else {
            console.log("loading model");
        }
    }
}

class GameRoom extends Room {
    Init(): void {
        super.Init();
        this.AddUnit(new Chara(this));
        this.AddUnit(new ObjTest(this));
        this.camera.position.z = 10;
        let light = new DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
    }
    Update(): void {
        super.Update();
    }
}

class ObjTest extends Unit {
    group: Group;
    group2: Group;
    Init(): void {
        this.group = this.room.core.GetObject("ente");
        this.group2 = this.room.core.GetObject("ente");
        this.room.AddObject(this, this.group);
        this.room.AddObject(this, this.group2);
    }
    Update(): void {
        super.Update();
        this.group.rotation.y += 0.02;
        this.group.position.y = -5;
        this.group2.rotation.y -= 0.02;
        this.group2.position.y = -8;
        //if (this.frame == 100) this.isAlive = false;
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
            //console.log("add");
            this.room.AddUnit(new Chara(this.room));
        }
        if (this.frame == 200) this.isAlive = false;
    }
    Draw(): void {
        //console.log("uuuuu");
    }
    Init(): void {
        //console.log("init!!");
        this.geometry = new BoxGeometry(1, 1, 1);
        this.material = new MeshBasicMaterial({color: 0xffffff});
        this.cube = new Mesh(this.geometry, this.material);
        this.cube.position.x = Math.random() * 8 - 4;
        this.cube.position.y = Math.random() * 8 - 4;
        this.cube.position.z = Math.random() * 8 - 4;
        this.room.AddObject(this, this.cube);
    }
    Fin(): void {
        //console.log("Fin!!");
        this.geometry.dispose();
        this.material.dispose();
    }
}



Start("init", new LoadScene());
