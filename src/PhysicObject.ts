import * as Cannon from "cannon";
import * as THREE from "three";
import { OrientQuaternion, UndefCoalescing } from "./Util";

export class CollideData {
    // 多分これが衝突相手
    public body: Cannon.Body;
    // 衝突に関する情報
    public contact: Cannon.ContactEquation;
    // 多分これが自分
    public target: Cannon.Body;
    public constructor(b: Cannon.Body, c: Cannon.ContactEquation, t: Cannon.Body) {
        this.body = b;
        this.contact = c;
        this.target = t;
    }
    get collidePosition(): Cannon.Vec3 {
        const v = this.contact.ri;
        const p = this.target.position;
        return new Cannon.Vec3(v.x + p.x, v.y + p.y, v.z + p.z);
    }
    get collideName(): string {
        return this.body.material.name;
    }
}

export abstract class PhysicObject {
    public viewBody: THREE.Object3D;
    public phyBody: Cannon.Body;
    public collideCallBack: (data: CollideData) => void;
    public constructor(name: string, mass: number) {
        this.collideCallBack = null;
        const phyMat = new Cannon.Material(name);
        this.phyBody = new Cannon.Body({ mass: mass, material: phyMat });
        this.phyBody.addEventListener("collide", (e) => {
            if (this.collideCallBack !== null) {
                const b: Cannon.Body = e.body;
                const c: Cannon.ContactEquation = e.contact;
                const t: Cannon.Body = e.target;
                this.collideCallBack(new CollideData(b, c, t));
            }
        });
    }
    get position(): Cannon.Vec3 {
        return this.phyBody.position;
    }
    get velocity(): Cannon.Vec3 {
        return this.phyBody.velocity;
    }
    get quaternion(): Cannon.Quaternion {
        return this.phyBody.quaternion;
    }
    get angularVelocity(): Cannon.Vec3 {
        return this.phyBody.angularVelocity;
    }
    public SetCollideCallback(callback: (collideData: CollideData) => void) {
        this.collideCallBack = callback;
    }
    public abstract Update(): void;
    public LookAt(eyes: THREE.Vector3, target: THREE.Vector3): void {
        const orientMatrix = new THREE.Matrix4();
        orientMatrix.lookAt(eyes, target, new THREE.Vector3(0, 1, 0));
        const q = new THREE.Quaternion();
        q.setFromRotationMatrix(orientMatrix);
        this.phyBody.quaternion.set(q.x, q.y, q.z, q.w);
    }
    public LookAtByNumer(x: number, y: number, z: number): void {
        this.LookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z));
    }
    public Orient(x: number, y: number, z: number): void {
        const q = OrientQuaternion(x, y, z);
        this.phyBody.quaternion.set(q.x, q.y, q.z, q.w);
    }
    public OrientAndRotate(x: number, y: number, z: number, angle: number = 0): void {
        const q1 = OrientQuaternion(x, y, z);
        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(x, y, z).normalize(), angle);
        const q3 = new THREE.Quaternion().multiplyQuaternions(q2, q1);
        this.phyBody.quaternion.set(q3.x, q3.y, q3.z, q3.w);
        return;
    }
    protected Sync(): void {
        this.viewBody.position.x = this.phyBody.position.x;
        this.viewBody.position.y = this.phyBody.position.y;
        this.viewBody.position.z = this.phyBody.position.z;

        this.viewBody.quaternion.w = this.phyBody.quaternion.w;
        this.viewBody.quaternion.x = this.phyBody.quaternion.x;
        this.viewBody.quaternion.y = this.phyBody.quaternion.y;
        this.viewBody.quaternion.z = this.phyBody.quaternion.z;
    }
}

export class PhysicSphere extends PhysicObject {
    constructor(mass: number, radius: number, name: string = "sphere", obj: THREE.Object3D = null) {
        super(name, mass);
        if (obj === null) {
            const geo = new THREE.SphereBufferGeometry(radius, 50, 50);
            const mat = new THREE.MeshPhongMaterial({ color: 0xffffff });
            this.viewBody = new THREE.Mesh(geo, mat);
            geo.dispose();
            mat.dispose();
        } else {
            this.viewBody = obj;
        }
        this.phyBody.addShape(new Cannon.Sphere(radius));
    }
    public Update(): void {
        this.Sync();
    }
}

export class PhysicPlane extends PhysicObject {
    constructor(mass: number, name: string = "plane", obj: THREE.Object3D = null) {
        super(name, mass);
        if (obj === null) {
            const geo = new THREE.PlaneGeometry(300, 300);
            const mat = new THREE.MeshLambertMaterial({ color: 0x333333 });
            this.viewBody = new THREE.Mesh(geo, mat);
            geo.dispose();
            mat.dispose();
        } else {
            this.viewBody = obj;
        }
        this.phyBody.addShape(new Cannon.Plane());
    }
    public Update(): void {
        this.Sync();
    }
}

export class PhysicBox extends PhysicObject {
    constructor(mass: number, width: number, height: number, depth: number,
        name: string = "box", obj: THREE.Object3D = null) {
        super(name, mass);
        if (obj === null) {
            const geo = new THREE.BoxGeometry(width, height, depth);
            const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            this.viewBody = new THREE.Mesh(geo, mat);
            geo.dispose();
            mat.dispose();
        } else {
            this.viewBody = obj;
        }
        this.phyBody.addShape(new Cannon.Box(new Cannon.Vec3(width / 2, height / 2, depth / 2)));
    }
    public Update(): void {
        this.Sync();
    }
}

export class PhysicObjects extends PhysicObject {
    constructor(mass: number, name: string = "") {
        super(name, mass);
        this.viewBody = new THREE.Group();
    }
    public Update(): void {
        this.Sync();
    }
    public AddBox(width: number, height: number, depth: number,
        x: number, y: number, z: number,
        addMesh: boolean = false,
        material: THREE.Material = null): void {
        if (addMesh) {
            if (material === null) {
                const geo = new THREE.BoxBufferGeometry(width, height, depth);
                const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(x, y, z);
                this.viewBody.add(mesh);
                geo.dispose();
                mat.dispose();
            } else {
                const geo = new THREE.BoxBufferGeometry(width, height, depth);
                const mesh = new THREE.Mesh(geo, material);
                mesh.position.set(x, y, z);
                this.viewBody.add(mesh);
                geo.dispose();
            }
        }
        this.phyBody.addShape(new Cannon.Box(new Cannon.Vec3(width / 2, height / 2, depth / 2))
            , new Cannon.Vec3(x, y, z));
        return;
    }
    public AddShapeFromJSON(data: string, mat: THREE.Material = null): void {
        const objs = JSON.parse(data);
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
                        this.AddBox(width, height, depth, x, y, z, addMesh, mat);
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
    }
}
