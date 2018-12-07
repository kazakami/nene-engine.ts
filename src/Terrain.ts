import * as THREE from "three";

export class Terrain {
    private geo: THREE.PlaneBufferGeometry;
    private scene: THREE.Scene = new THREE.Scene();
    private heights: number[][];
    private segX: number;
    private segY: number;
    public MakeGeometry(x: number, y: number, segX: number, segY: number): void {
        this.segX = segX;
        this.segY = segY;
        this.geo = new THREE.PlaneBufferGeometry(x, y, segX - 1, segY - 1);
        this.geo.rotateX(- Math.PI / 2);
        const mat = new THREE.MeshPhongMaterial({color: 0x888888});
        const terrain = new THREE.Mesh(this.geo, mat);
        this.scene.add(terrain);
    }
    public GetObject(): THREE.Object3D {
        return this.scene;
    }
    public SetHeight(x: number, y: number, height: number, computeNorm: boolean = true): void {
        this.geo.attributes.position.setY(y * this.segX + x, height);
        if (computeNorm) {
            this.geo.computeVertexNormals();
        }
        return;
    }
    public ComputeNorm(): void {
        this.geo.computeVertexNormals();
    }
    public GetHeight(x: number, y: number): number {
        return 0;
    }
}
