import { Room } from "./Room";
import { WebGLRenderer } from "three";

class Core {
    rooms: { [key: string]: Room };
    activeRoom: Room;
    renderer: WebGLRenderer;

    constructor(roomName: string, room: Room) {
        this.rooms = {};
        this.rooms[roomName] = room;
        this.activeRoom = room;
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    Init(): void {
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
    let core = new Core(defaultSceneName, defaultRoom);
    core.Init();
}

export { Start };
export { Core };