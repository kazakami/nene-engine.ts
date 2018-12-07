import * as THREE from "three";

export class Terrain {
    private geo: THREE.PlaneBufferGeometry;
    private scene: THREE.Scene = new THREE.Scene();
    private heights: number[][];
    public MakeGeometry(x: number, y: number, segX: number, segY: number): void {
        this.geo = new THREE.PlaneBufferGeometry(x, y, segX, segY);
        this.geo.rotateX(- Math.PI / 2);
        const mat = new THREE.MeshPhongMaterial({color: 0x000000});
        const terrain = new THREE.Mesh(this.geo, mat);
        this.scene.add(terrain);
    }
    public GetObject(): THREE.Object3D {
        return this.scene;
    }
    public SetHeight(x: number, y: number, height: number): void {
        return;
    }
    public GetHeight(x: number, y: number): number {
        return 0;
    }
}
