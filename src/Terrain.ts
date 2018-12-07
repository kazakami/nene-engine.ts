import * as THREE from "three";

export class Terrain {
    private geo: THREE.PlaneBufferGeometry;
    private scene: THREE.Scene = new THREE.Scene();
    private heights: number[];
    private normals: THREE.Vector3[];
    private width: number;
    private depth: number;
    private widthSegments: number;
    private depthSegments: number;
    public MakeGeometry(w: number, d: number, widthSegments: number, depthSegments: number): void {
        this.width = w;
        this.depth = d;
        this.widthSegments = widthSegments;
        this.depthSegments = depthSegments;
        this.heights = new Array<number>(this.widthSegments * this.depthSegments);
        this.normals = new Array<THREE.Vector3>(this.widthSegments * this.depthSegments);
        for (let i = 0; i < this.widthSegments * this.depthSegments; i++) {
            this.heights[i] = 0;
            this.normals[i] = new THREE.Vector3();
        }
        this.geo = new THREE.PlaneBufferGeometry(w, d, widthSegments - 1, depthSegments - 1);
        this.geo.rotateX(- Math.PI / 2);
        const mat = new THREE.MeshPhongMaterial({color: 0x888888});
        const terrain = new THREE.Mesh(this.geo, mat);
        this.scene.add(terrain);
    }
    public GetObject(): THREE.Object3D {
        return this.scene;
    }
    public SetHeight(x: number, y: number, height: number, computeNorm: boolean = true): void {
        this.geo.attributes.position.setY(y * this.widthSegments + x, height);
        this.heights[y * this.widthSegments + x] = height;
        if (computeNorm) {
            this.ComputeNorm();
        }
    }
    public ComputeNorm(): void {
        // 法線を0に初期化
        for (let i = 0; i < this.widthSegments * this.depthSegments; i++) {
            this.normals[i].set(0, 0, 0);
        }
        // 1セグメントの幅と奥行
        const w = this.width / this.widthSegments;
        const d = this.depth / this.depthSegments;
        // 自身の一つ右と一つ手前とのベクトルから法線を計算し、各頂点にその値を足す
        for (let i = 0; i < this.widthSegments - 1; i++) {
            for (let j = 0; j < this.depthSegments - 1; j++) {
                const h = this.GetHeight(i, j);
                const a = new THREE.Vector3(w, this.GetHeight(i + 1, j) - h, 0);
                const b = new THREE.Vector3(0, this.GetHeight(i, j + 1) - h, d);
                b.cross(a);
                this.normals[j * this.widthSegments + i].add(b);
                this.normals[(j + 1) * this.widthSegments + i].add(b);
                this.normals[j * this.widthSegments + (i + 1)].add(b);
            }
        }
        // 法線を正規化し、地形のジオメトリに代入
        for (let i = 0; i < this.widthSegments * this.depthSegments; i++) {
            this.normals[i].normalize();
            const n = this.normals[i];
            this.geo.attributes.normal.setXYZ(i, n.x, n.y, n.z);
        }
    }
    public GetHeight(x: number, y: number): number {
        return this.heights[y * this.widthSegments + x];
    }
}
