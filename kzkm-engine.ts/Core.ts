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
        
        this.Init();
        let animate = () => {
            requestAnimationFrame(animate);
            this.Update();
            this.Draw();
        };
        animate();
    }

    Init(): void {
        this.activeRoom.Init();
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

export { Core };