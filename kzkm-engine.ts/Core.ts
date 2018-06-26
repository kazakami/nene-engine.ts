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
    canvas: HTMLCanvasElement;
    mouseX: number;
    mouseY: number;

    constructor() {
        this.rooms = {};
        this.activeRoom = null;
        this.renderer = new WebGLRenderer();
        this.renderer.autoClear = false;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.objects = {};
        this.loadingManager = new LoadingManager();
        this.objLoader = new OBJLoader(this.loadingManager);
        this.mtlLoader = new MTLLoader(this.loadingManager);
        this.canvas = this.renderer.domElement
        document.body.appendChild(this.canvas);
        this.canvas.addEventListener("mousemove", this.OnCanvasMouseMove, false);
        this.canvas.addEventListener("click", this.OnCanvasClick);
        this.mouseX = 0;
        this.mouseY = 0;
    }

    OnCanvasMouseMove(e: MouseEvent): void {
        core.mouseX = e.offsetX;
        core.mouseY = e.offsetY;
    }

    OnCanvasClick(e: Event): void {
        console.log("(" + core.mouseX + ", " + core.mouseY + ")");
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
        return this.objects[name][1].clone(true);
    }

    IsObjectAvailable(name: string): boolean {
        if (this.objects[name]) {
            return this.objects[name][0];
        } else {
            return false;
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
        this.activeRoom.Draw();
        this.renderer.clear();
        this.renderer.render(this.activeRoom.scene, this.activeRoom.camera);
        this.renderer.render(this.activeRoom.scene2d, this.activeRoom.camera2d);
    }

    ChangeRoom(roomName: string): void {
        this.activeRoom = this.rooms[roomName];
    }

    AddRoom(roomName: string, room: Room): void {
        this.rooms[roomName] = room;
        room.Init();
    }
}

let core: Core = null;

function Start(defaultRoomName: string, defaultRoom: Room): void {
    core = new Core();
    core.Init(defaultRoomName, defaultRoom);
}

export { core }
export { Start };
export { Core };