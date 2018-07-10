import * as Cannon from "cannon";
import * as THREE from "three";
import { core, Start } from "./kzkm-engine.ts/Core";
import { PhysicObject, PhysicPlane, PhysicSphere } from "./kzkm-engine.ts/PhysicObject";
import { Room } from "./kzkm-engine.ts/Room";
import { Unit } from "./kzkm-engine.ts/Unit";

class LoadRoom extends Room {
    public Init(): void {
        super.Init();
        core.LoadObjMtl("resources/ente progress_export.obj", "resources/ente progress_export.mtl", "ente");
    }
    public Update(): void {
        super.Update();
        if (core.IsObjectAvailable("ente")) {
            // オブジェクトenteが読み込まれればルーム遷移
            core.AddRoom("game", new GameRoom());
            core.ChangeRoom("game");
        } else {
            // console.log("now loading model");
        }
    }
}

// tslint:disable-next-line:max-classes-per-file
class GameRoom extends Room {
    public sprt: THREE.Sprite;
    public Init(): void {
        super.Init();
        this.AddUnit(new Chara());
        this.AddUnit(new ObjTest());
        this.AddUnit(new Physic());
        this.camera.position.z = 10;
        this.camera.position.y = 10;
        this.camera.lookAt(0, 0, 0);
        const light = new THREE.DirectionalLight("white", 1);
        light.position.set(50, 100, 50);
        this.scene.add(light);
        const mat = new THREE.SpriteMaterial({ color: 0xFF0000 });
        this.sprt = new THREE.Sprite(mat);
        this.sprt.scale.set(100, 100, 1);
        // this.sprt.position.set(500, 500, -1);
        this.scene2d.add(this.sprt);
    }
    public Update(): void {
        super.Update();
        this.sprt.position.set(core.mouseX, core.mouseY, -1);
        // if (this.frame % 100 == 0) console.log(this.core);
        // console.log(this.core.mouseX + ", " + this.core.mouseY);
    }
}

// tslint:disable-next-line:max-classes-per-file
class ObjTest extends Unit {
    public group: THREE.Group;
    public group2: THREE.Group;
    public Init(): void {
        this.group = core.GetObject("ente");
        this.group2 = core.GetObject("ente");
        this.AddObject(this.group);
        this.AddObject(this.group2);
    }
    public Update(): void {
        super.Update();
        this.group.rotation.y += 0.02;
        this.group.position.y = -5;
        this.group2.rotation.y -= 0.02;
        this.group2.position.y = -8;
        // if (this.frame == 100) this.isAlive = false;
    }
    public Draw(): void {
        return;
    }
    public Fin(): void {
        return;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Chara extends Unit {
    public geometry: THREE.BoxGeometry;
    public material: THREE.MeshBasicMaterial;
    public cube: THREE.Mesh;
    public Update(): void {
        super.Update();
        this.cube.rotation.x += 0.1;
        this.cube.rotation.y += 0.1;
        if (this.frame === 50) {
            this.room.AddUnit(new Chara());
        }
        if (this.frame === 200) {
            this.isAlive = false;
        }
    }
    public Draw(): void {
        return;
    }
    public Init(): void {
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.position.x = Math.random() * 8 - 4;
        this.cube.position.y = Math.random() * 8 - 4;
        this.cube.position.z = Math.random() * 8 - 4;
        this.AddObject(this.cube);
    }
    public Fin(): void {
        this.geometry.dispose();
        this.material.dispose();
    }
}

class Physic extends Unit {
    public Draw(): void {
        return;
    }
    public Init(): void {
        const plane = new PhysicPlane(0);
        const sphere = new PhysicSphere(1, 1);
        plane.PhyBody.quaternion.setFromAxisAngle(new Cannon.Vec3(1, 0, 0), -Math.PI / 2);
        sphere.PhyBody.position.set(0, 10, 0);
        this.AddPhysicObject(plane);
        this.AddPhysicObject(sphere);
    }
    public Fin(): void {
        return;
    }
}

// ゲームの開始
Start("init", new LoadRoom());
