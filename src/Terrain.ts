import * as THREE from "three";

export class Terrain {
    /**
     * 地形の表示用のScene
     * これにタイルを追加したり削除したりして効率のいい表示を行う
     */
    private scene: THREE.Scene = new THREE.Scene();
    private heights: number[];
    private normals: THREE.Vector3[];
    // タイルのジオメトリとそれから生成したMeshのタプルの配列
    private tiles: Array<[THREE.PlaneBufferGeometry, THREE.Mesh]>;
    private width: number;
    private depth: number;
    private widthSegments: number;
    private depthSegments: number;
    private widthTiles: number;
    private depthTiles: number;
    /**
     * 地形を生成する(0, 0, 0)を中心とし、y正方向を上とする
     * @param width 横幅
     * @param depth 奥行
     * @param widthSegments 1タイルの幅の分割数
     * @param depthSegments 1タイルの奥行きの分割数
     * @param widthTiles タイルの幅方向の数
     * @param depthTiles タイルの奥行方向の数
     */
    public MakeGeometry(width: number, depth: number,
                        widthSegments: number, depthSegments: number,
                        widthTiles: number, depthTiles: number): void {
        this.width = width;
        this.depth = depth;
        this.widthSegments = widthSegments;
        this.depthSegments = depthSegments;
        this.widthTiles = widthTiles;
        this.depthTiles = depthTiles;
        // 全体の頂点数
        const numVertices = this.widthSegments * this.depthSegments * this.widthTiles * this.depthTiles;
        this.heights = new Array<number>(numVertices);
        this.normals = new Array<THREE.Vector3>(numVertices);
        this.tiles = new Array<[THREE.PlaneBufferGeometry, THREE.Mesh]>(this.widthTiles * this.depthTiles);
        for (let i = 0; i < numVertices; i++) {
            this.heights[i] = 0;
            this.normals[i] = new THREE.Vector3();
        }
        const mat = new THREE.MeshPhongMaterial({color: 0x888888});
        // タイルを生成
        for (let j = 0; j < this.depthTiles; j++) {
            for (let i = 0; i < this.widthTiles; i++) {
                const geo = new THREE.PlaneBufferGeometry(
                    this.width / this.widthTiles, this.depth / this.depthTiles,
                    this.widthSegments - 1, this.depthSegments - 1);
                // 向きを合わせる
                geo.rotateX(-Math.PI / 2);
                // 敷き詰めるように並べる
                geo.translate(
                    -this.width / 2 + this.width / (2 * this.widthTiles) + i * (this.width / this.widthTiles),
                    0,
                    this.depth / 2 - this.depth / (2 * this.depthTiles) - j * (this.depth / this.depthTiles));
                const mesh = new THREE.Mesh(geo, mat);
                const index = j * this.widthTiles + i;
                this.tiles[index] = [geo, mesh];
                this.scene.add(this.tiles[index][1]);
            }
        }
    }
    /**
     * 表示用のTHREE.Sceneを返す
     * このTHREE.Sceneを追加しておけば最適に表示される
     */
    public GetObject(): THREE.Object3D {
        return this.scene;
    }
    public SetHeight(x: number, y: number, height: number, computeNorm: boolean = true): void {
        // this.geo.attributes.position.setY(y * this.widthSegments + x, height);
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
            // this.geo.attributes.normal.setXYZ(i, n.x, n.y, n.z);
        }
    }
    public GetHeight(x: number, y: number): number {
        return this.heights[y * this.widthSegments + x];
    }
}
