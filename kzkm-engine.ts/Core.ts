import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/MTLLoader.js";
import { Room } from "./Room";
import { WebGLRenderer, OBJLoader, MTLLoader, Object3D, LoadingManager } from "three";

class Core {
    rooms: { [key: string]: Room };
    activeRoom: Room;
    renderer: WebGLRenderer;
    objects: { [key: string]: [boolean,Object3D] };
    loadingManager: LoadingManager;
    objLoader: OBJLoader;
    mtlLoader: MTLLoader;

    constructor() {
        this.rooms = {};
        this.activeRoom = null;
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.objects = {};
        this.loadingManager = new LoadingManager();
        this.objLoader = new OBJLoader(this.loadingManager);
        this.mtlLoader = new MTLLoader(this.loadingManager);
        document.body.appendChild(this.renderer.domElement);
    }

    LoadObjMtl(obj_filename: string, mtl_filename: string, name: string): void {
        //ディレクトリ内を指していたらディレクトリパスとファイル名に分ける
        if (mtl_filename.indexOf("/") !== -1)
        {
            this.mtlLoader.setPath(mtl_filename.substr(0, mtl_filename.lastIndexOf("/")) + "/");
            mtl_filename = mtl_filename.slice(mtl_filename.indexOf("/") + 1);
        }
        this.mtlLoader.load(mtl_filename,
            mtl => {
                mtl.preload();
                //上と同様にディレクトリ内を指していたらディレクトリパスとファイル名に分ける
                if (obj_filename.indexOf("/") !== -1) {
                    this.objLoader.setPath(obj_filename.substr(0, obj_filename.lastIndexOf("/")) + "/");
                    obj_filename = obj_filename.slice(obj_filename.indexOf("/") + 1);
                }
                this.objLoader.setMaterials(mtl);
                this.objLoader.load(obj_filename,
                    grp => {
                        this.objects[name] = [true, grp];
                    }
                );
            }
        );
    }

    GetObject(name: string): Object3D {
        console.log("get");
        return this.objects[name][1].clone(true);
    }

    IsObjectAvailable(name: string): boolean {
        console.log("is alive");
        if (this.objects[name]) {
            console.log("exit");
            return false;
        } else {
            console.log("not exit");
            return this.objects[name][0];
        }
    }

    Init(roomName: string, room: Room): void {
        this.rooms[roomName] = room;
        this.activeRoom = room;
        this.activeRoom.Init();
        let animate = () => {
            requestAnimationFrame(animate);
            this.Update();
            this.Draw();
        };
        animate();
    }

    Update(): void {
        this.activeRoom.Update();
    }

    Draw(): void {
        //console.log("hhhh");
        this.activeRoom.Draw();
        this.renderer.render(this.activeRoom.scene, this.activeRoom.camera);
    }

    ChangeScene(roomName: string): void {
        this.activeRoom = this.rooms[roomName];
    }
}

function Start(defaultSceneName: string, defaultRoom: Room): void{
    let core = new Core();
    defaultRoom.core = core;
    core.Init(defaultSceneName, defaultRoom);
}

export { Start };
export { Core };