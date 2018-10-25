import * as Cannon from "cannon";
import * as THREE from "three";
import { OrientQuaternion } from "./Util";

abstract class PhysicObject {
    public viewBody: THREE.Object3D;
    public PhyBody: Cannon.Body;
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
        super();
        const geo = new THREE.SphereBufferGeometry(radius, 50, 50);
        const mat = new THREE.MeshPhongMaterial({color: 0xffffff});
        this.viewBody = new THREE.Mesh(geo, mat);
        const phyMat = new Cannon.Material("sphere");
        this.PhyBody = new Cannon.Body({mass: mass, material: phyMat});
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
        super();
        const geo = new THREE.PlaneGeometry(300, 300);
        const mat = new THREE.MeshLambertMaterial({color: 0x333333});
        this.viewBody = new THREE.Mesh(geo, mat);
        const phyMat = new Cannon.Material("plane");
        this.PhyBody = new Cannon.Body({mass: mass, material: phyMat});
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
        super();
        const geo = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshLambertMaterial({color: 0xffffff});
        this.viewBody = new THREE.Mesh(geo, mat);
        const phyMat = new Cannon.Material("box");
        this.PhyBody = new Cannon.Body({mass: mass, material: phyMat});
        this.PhyBody.addShape(new Cannon.Box(new Cannon.Vec3(width / 2, height / 2, depth / 2)));
        geo.dispose();
        mat.dispose();
    }
    public Update(): void {
        this.Sync();
    }
}

export { PhysicObject, PhysicSphere, PhysicPlane, PhysicBox };
