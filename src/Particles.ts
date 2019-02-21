import * as THREE from "three";

class Particles {
    private geo: THREE.Geometry;
    private particlesNum: number;
    private mat: THREE.PointsMaterial;
    private points: THREE.Points;
    constructor(num: number) {
        this.geo = new THREE.Geometry();
        this.particlesNum = num;
        for (let i = 0; i < this.particlesNum; i++) {
            this.geo.vertices.push(new THREE.Vector3());
        }
        this.mat = new THREE.PointsMaterial({});
        this.points = new THREE.Points(this.geo, this.mat);
    }
}
