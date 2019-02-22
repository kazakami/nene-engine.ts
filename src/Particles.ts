import * as THREE from "three";

export class Particles {
    private geo: THREE.Geometry;
    private particlesNum: number;
    private mat: THREE.PointsMaterial;
    private points: THREE.Points;
    private updateFunc: (x: number, y: number, z: number) => [number, number, number];
    constructor(pos: THREE.Vector3, num: number) {
        this.geo = new THREE.Geometry();
        this.particlesNum = num;
        for (let i = 0; i < this.particlesNum; i++) {
            this.geo.vertices.push(pos.clone());
        }
        this.mat = new THREE.PointsMaterial({});
        this.points = new THREE.Points(this.geo, this.mat);
    }

    public get particle(): THREE.Points {
        return this.points;
    }
    public Update(): void {
        for (const vec of this.geo.vertices) {
            const [x, y, z] = this.updateFunc(vec.x, vec.y, vec.z);
            vec.set(x, y, z);
        }
    }
}
