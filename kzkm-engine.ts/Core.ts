import "imports-loader?THREE=three!three/examples/js/loaders/MTLLoader.js";
import "imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js";
import { Room } from "./Room";

import { LoadingManager, MTLLoader, Object3D, OBJLoader, WebGLRenderer } from "three";

class Core {
    public rooms: { [key: string]: Room };
    public activeRoom: Room;
    public renderer: WebGLRenderer;
    public objects: { [key: string]: [boolean, Object3D] };
    public loadingManager: LoadingManager;
    public objLoader: OBJLoader;
    public mtlLoader: MTLLoader;
    public canvas: HTMLCanvasElement;
    public mouseX: number;
    public mouseY: number;

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
        this.canvas = this.renderer.domElement;
        document.body.appendChild(this.canvas);
        this.canvas.addEventListener("mousemove", this.OnCanvasMouseMove, false);
        this.canvas.addEventListener("click", this.OnCanvasClick);
        this.mouseX = 0;
        this.mouseY = 0;
    }

    public OnCanvasMouseMove(e: MouseEvent): void {
        core.mouseX = e.offsetX;
        core.mouseY = e.offsetY;
    }

    public OnCanvasClick(e: Event): void {
        // console.log("(" + core.mouseX + ", " + core.mouseY + ")");
    }

    public LoadObjMtl(objFilename: string, mtlFilename: string, name: string): void {
        // ディレクトリ内を指していたらディレクトリパスとファイル名に分ける
        if (mtlFilename.indexOf("/") !== -1) {
            this.mtlLoader.setPath(mtlFilename.substr(0, mtlFilename.lastIndexOf("/")) + "/");
            mtlFilename = mtlFilename.slice(mtlFilename.indexOf("/") + 1);
        }
        this.mtlLoader.load(mtlFilename,
            (mtl) => {
                mtl.preload();
                // 上と同様にディレクトリ内を指していたらディレクトリパスとファイル名に分ける
                if (objFilename.indexOf("/") !== -1) {
                    this.objLoader.setPath(objFilename.substr(0, objFilename.lastIndexOf("/")) + "/");
                    objFilename = objFilename.slice(objFilename.indexOf("/") + 1);
                }
                this.objLoader.setMaterials(mtl);
                this.objLoader.load(objFilename,
                    (grp) => {
                        this.objects[name] = [true, grp];
                    });
            });
    }

    public GetObject(name: string): Object3D {
        return this.objects[name][1].clone(true);
    }

    public IsObjectAvailable(name: string): boolean {
        if (this.objects[name]) {
            return this.objects[name][0];
        } else {
            return false;
        }
    }

    public Init(roomName: string, room: Room): void {
        this.rooms[roomName] = room;
        this.activeRoom = room;
        this.activeRoom.Init();
        const animate = () => {
            requestAnimationFrame(animate);
            this.Update();
            this.Draw();
        };
        animate();
    }

    public Update(): void {
        this.activeRoom.Update();
    }

    public Draw(): void {
        this.activeRoom.Draw();
        this.renderer.clear();
        this.renderer.render(this.activeRoom.scene, this.activeRoom.camera);
        this.renderer.render(this.activeRoom.scene2d, this.activeRoom.camera2d);
    }

    public ChangeRoom(roomName: string): void {
        this.activeRoom = this.rooms[roomName];
    }

    public AddRoom(roomName: string, room: Room): void {
        this.rooms[roomName] = room;
        room.Init();
    }
}

let core: Core = null;

function Start(defaultRoomName: string, defaultRoom: Room): void {
    core = new Core();
    core.Init(defaultRoomName, defaultRoom);
}

export { core };
export { Start };
export { Core };
