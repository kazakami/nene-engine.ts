import * as Cannon from "cannon";
import * as THREE from "three";
import { OrientQuaternion, UndefCoalescing } from "./Util";

class CollideData {
    public position: Cannon.Vec3;
    public constructor(p: Cannon.Vec3) {
        this.position = p;
    }
}

abstract class PhysicObject {
    public viewBody: THREE.Object3D;
    public PhyBody: Cannon.Body;
    public collideCallBack: (data: CollideData) => void;
    public constructor(name: string, mass: number) {
        this.collideCallBack = null;
        const phyMat = new Cannon.Material(name);
        this.PhyBody = new Cannon.Body({mass: mass, material: phyMat});
        this.PhyBody.addEventListener("collide", (e) => {
            if (this.collideCallBack !== null) {
                const v: Cannon.Vec3 = e.contact.ri;
                const p = this.PhyBody.position;
                const c = new CollideData(new Cannon.Vec3(v.x + p.x, v.y + p.y, v.z + p.z));
                this.collideCallBack(c);
            }
        });
    }
    public SetCollideCallback(callback: (CollideData) => void) {
        this.collideCallBack = callback;
    }
    public abstract Update(): void;
    public LookAt(eyes: THREE.Vector3, target: THREE.Vector3): void {
        const orientMatrix = new THREE.Matrix4();
        orientMatrix.lookAt(eyes, target, new THREE.Vector3(0, 1, 0));
        const q = new THREE.Quaternion();
        q.setFromRotationMatrix(orientMatrix);
        this.PhyBody.quaternion.set(q.x, q.y, q.z, q.w);
    }
    public LookAtByNumer(x: number, y: number, z: number): void {
        this.LookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z));
    }
    public Orient(x: number, y: number, z: number): void {
        const q = OrientQuaternion(x, y, z);
        this.PhyBody.quaternion.set(q.x, q.y, q.z, q.w);
    }
    public OrientAndRotate(x: number, y: number, z: number, angle: number): void {
        const q1 = OrientQuaternion(x, y, z);
        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(x, y, z).normalize(), angle);
        const q3 = new THREE.Quaternion().multiplyQuaternions(q2, q1);
        this.PhyBody.quaternion.set(q3.x, q3.y, q3.z, q3.w);
        return;
    }
    protected Sync(): void {
        this.viewBody.position.x = this.PhyBody.position.x;
        this.viewBody.position.y = this.PhyBody.position.y;
        this.viewBody.position.z = this.PhyBody.position.z;

        this.viewBody.quaternion.w = this.PhyBody.quaternion.w;
        this.viewBody.quaternion.x = this.PhyBody.quaternion.x;
        this.viewBody.quaternion.y = this.PhyBody.quaternion.y;
        this.viewBody.quaternion.z = this.PhyBody.quaternion.z;
    }
}

class PhysicSphere extends PhysicObject {
    constructor(mass: number, radius: number) {
        super("sphere", mass);
        const geo = new THREE.SphereBufferGeometry(radius, 50, 50);
        const mat = new THREE.MeshPhongMaterial({color: 0xffffff});
        this.viewBody = new THREE.Mesh(geo, mat);
        this.PhyBody.addShape(new Cannon.Sphere(radius));
        geo.dispose();
        mat.dispose();
    }
    public Update(): void {
        this.Sync();
    }
}

class PhysicPlane extends PhysicObject {
    constructor(mass: number) {
        super("plane", mass);
        const geo = new THREE.PlaneGeometry(300, 300);
        const mat = new THREE.MeshLambertMaterial({color: 0x333333});
        this.viewBody = new THREE.Mesh(geo, mat);
        this.PhyBody.addShape(new Cannon.Plane());
        geo.dispose();
        mat.dispose();
    }
    public Update(): void {
        this.Sync();
    }
}

class PhysicBox extends PhysicObject {
    constructor(mass: number, width: number, height: number, depth: number) {
        super("box", mass);
        const geo = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshLambertMaterial({color: 0xffffff});
        this.viewBody = new THREE.Mesh(geo, mat);
        this.PhyBody.addShape(new Cannon.Box(new Cannon.Vec3(width / 2, height / 2, depth / 2)));
        geo.dispose();
        mat.dispose();
    }
    public Update(): void {
        this.Sync();
    }
}

class PhysicObjects extends PhysicObject {
    constructor(mass: number, name: string = "") {
        super(name, mass);
        this.viewBody = new THREE.Group();
    }
    public Update(): void {
        this.Sync();
    }
    public AddBox(width: number, height: number, depth: number,
                  x: number, y: number, z: number,
                  addMesh: boolean = false): void {
        if (addMesh) {
            const geo = new THREE.BoxGeometry(width, height, depth);
            const mat = new THREE.MeshLambertMaterial({color: 0xffffff});
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            this.viewBody.add(mesh);
            geo.dispose();
            mat.dispose();
        }
        this.PhyBody.addShape(new Cannon.Box(new Cannon.Vec3(width / 2, height / 2, depth / 2))
        , new Cannon.Vec3(x, y, z));
        return;
    }
    public AddShapeFromJSON(filename: string): void {
        const loader = new THREE.FileLoader();
        loader.load(filename, (res) => {
            if (typeof res !== "string") {
                throw new Error("file is binary.");
            }
            const objs = JSON.parse(res);
            objs.forEach((obj) => {
                if ("type" in obj) {
                    switch (obj.type) {
                        case "box": {
                            const addMesh = UndefCoalescing<boolean>(obj.addMesh, false);
                            const width = UndefCoalescing<number>(obj.width, 1);
                            const height = UndefCoalescing<number>(obj.height, 1);
                            const depth = UndefCoalescing<number>(obj.depth, 1);
                            const x = UndefCoalescing<number>(obj.x, 0);
                            const y = UndefCoalescing<number>(obj.y, 0);
                            const z = UndefCoalescing<number>(obj.z, 0);
                            this.AddBox(width, height, depth, x, y, z, addMesh);
                            break;
                        }
                        default: {
                            throw new Error(obj.type + " is unknown");
                        }
                    }
                } else {
                    throw new Error("type is needed");
                }
            });
        });
        return;
    }
}

export { PhysicObject, PhysicSphere, PhysicPlane, PhysicBox, PhysicObjects };
