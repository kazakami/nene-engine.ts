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
    private widthAllSegments: number;
    private depthAllSegments: number;
    private numVertices: number;
    /**
     * 地形を生成する(0, 0, 0)を中心とし、y正方向を上とする
     * 幅方向の合計頂点数はwidthSegments * widthTilesとなり、
     * 奥行方向の合計頂点数はdepthSegments * depthTilesとなる
     * @param width 横幅
     * @param depth 奥行
     * @param widthSegments 1タイルの幅の頂点数
     * @param depthSegments 1タイルの奥行きの頂点数
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
        this.widthAllSegments = this.widthTiles * (this.widthSegments - 0) + 1;
        this.depthAllSegments = this.depthTiles * (this.depthSegments - 0) + 1;
        // 全体の頂点数
        this.numVertices =
            ((this.widthSegments - 0) * this.widthTiles + 1) *
            ((this.depthSegments - 0) * this.depthTiles + 1);
        this.heights = new Array<number>(this.numVertices);
        this.normals = new Array<THREE.Vector3>(this.numVertices);
        this.tiles = new Array<[THREE.PlaneBufferGeometry, THREE.Mesh]>(this.widthTiles * this.depthTiles);
        for (let i = 0; i < this.numVertices; i++) {
            this.heights[i] = 0;
            this.normals[i] = new THREE.Vector3();
        }
        const mat = new THREE.MeshPhongMaterial({color: 0x888888});
        const mat2 = new THREE.MeshPhongMaterial({color: 0x880000});
        // タイルを生成
        for (let j = 0; j < this.depthTiles; j++) {
            for (let i = 0; i < this.widthTiles; i++) {
                const geo = new THREE.PlaneBufferGeometry(
                    this.width / this.widthTiles, this.depth / this.depthTiles,
                    this.widthSegments - 0, this.depthSegments - 0);
                // 向きを合わせる
                geo.rotateX(-Math.PI / 2);
                // 敷き詰めるように並べる
                geo.translate(
                    -this.width / 2 + this.width / (2 * this.widthTiles) + i * (this.width / this.widthTiles),
                    0,
                    -this.depth / 2 + this.depth / (2 * this.depthTiles) + j * (this.depth / this.depthTiles));
                const index = j * this.widthTiles + i;
                if (i === 0 && j === 0) {
                    const mesh = new THREE.Mesh(geo, mat2);
                    this.tiles[index] = [geo, mesh];
                } else {
                    const mesh = new THREE.Mesh(geo, mat);
                    this.tiles[index] = [geo, mesh];
                }
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
    /**
     * 指定した頂点からそれの属するタイルインデックスとタイル内の頂点インデックスのタプルの配列を返す
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     */
    public GetIndex(width: number, depth: number): Array<[number, number]> {
        // 幅方向がタイル同士の境界線上でない
        const w = width === 0 || width % (this.widthSegments - 0) !== 0 || width === this.widthAllSegments - 1;
        // 奥行方向がタイル同士の境界線上でない
        const d = depth === 0 || depth % (this.depthSegments - 0) !== 0 || depth === this.depthAllSegments - 1;
        if (w && d) {
            let tileW = Math.floor(width / this.widthSegments);
            let tileD = Math.floor(depth / this.depthSegments);
            if (width === this.widthAllSegments - 1) {
                tileW--;
            }
            if (depth === this.depthAllSegments - 1) {
                tileD--;
            }
            // 指定した頂点の属するタイルのインデックス
            const index = tileD * this.widthTiles + tileW;
            // 地形の0じゃない方の端なら特殊な処理
            const segW = (width === this.widthAllSegments - 1) ? this.widthSegments : (width % this.widthSegments);
            const segD = (depth === this.depthAllSegments - 1) ? this.depthSegments : (depth % this.depthSegments);
            // タイル内での頂点のインデックス
            const i = segD * (this.widthSegments + 1) + segW;
            return new Array<[number, number]>([index, i]);
        } else if (!w && d) {
            // 幅方向のみタイル同士の境界線上
            const tileW = width / this.widthSegments;
            let tileD = Math.floor(depth / this.depthSegments);
            if (depth === this.depthAllSegments - 1) {
                tileD--;
            }
            // 指定した頂点の属するタイルのインデックス
            // 以下の2つのタイルの境界に頂点は存在している
            const index1 = tileD * this.widthTiles + (tileW - 1);
            const index2 = tileD * this.widthTiles + tileW;
            // 幅方向の座標は片方は右端、もう片方は左端
            const segW1 = this.widthSegments;
            const segW2 = 0;
            // 奥行方向はともに同じ値
            const segD1 = (depth === this.depthAllSegments - 1) ? this.depthSegments : (depth % this.depthSegments);
            const segD2 = (depth === this.depthAllSegments - 1) ? this.depthSegments : (depth % this.depthSegments);
            // タイル内での頂点のインデックス
            const i1 = segD1 * (this.widthSegments + 1) + segW1;
            const i2 = segD2 * (this.widthSegments + 1) + segW2;
            return new Array<[number, number]>([index1, i1], [index2, i2]);
        } else if (w && !d) {
            // 奥行方向のみタイル同士の境界線上
            let tileW = Math.floor(width / this.widthSegments);
            const tileD = Math.floor(depth / this.depthSegments);
            if (width === this.widthAllSegments - 1) {
                tileW--;
            }
            // 指定した頂点の属するタイルのインデックス
            // 以下の2つのタイルの境界に頂点は存在している
            const index1 = (tileD - 1) * this.widthTiles + tileW;
            const index2 = tileD * this.widthTiles + tileW;
            // 幅方向はともに同じ値
            const segW1 = (width === this.widthAllSegments - 1) ? this.widthSegments : (width % this.widthSegments);
            const segW2 = (width === this.widthAllSegments - 1) ? this.widthSegments : (width % this.widthSegments);
            // 幅方向の座標は片方は手前端、もう片方は奥端
            const segD1 = this.depthSegments;
            const segD2 = 0;
            // タイル内での頂点のインデックス
            const i1 = segD1 * (this.widthSegments + 1) + segW1;
            const i2 = segD2 * (this.widthSegments + 1) + segW2;
            return new Array<[number, number]>([index1, i1], [index2, i2]);
        }
        return new Array<[number, number]>();
    }
    /**
     * 指定した頂点の高さを設定する
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param height 設定する高さ
     * @param computeNorm 法線を計算しなおすか。デフォルトではtrue
     */
    public SetHeight(width: number, depth: number, height: number, computeNorm: boolean = true): void {
        this.heights[depth * this.widthAllSegments + width] = height;
        const i = this.GetIndex(width, depth);
        i.forEach(([ti, si]) => {
            this.tiles[ti][0].attributes.position.setY(si, height);
        });
        if (computeNorm) {
            this.ComputeNorm();
        }
    }
    public SetNormal(width: number, depth: number, normal: THREE.Vector3): void {
        // const widthAllSegments = this.widthTiles * (this.widthSegments - 1) + 1;
        // this.normals[depth * widthAllSegments + width] = normal;
        const i = this.GetIndex(width, depth);
        i.forEach(([ti, si]) => {
            this.tiles[ti][0].attributes.normal.setXYZ(si, normal.x, normal.y, normal.z);
        });
    }
    public ComputeNorm(): void {
        // 法線を0に初期化
        for (let i = 0; i < this.numVertices; i++) {
            this.normals[i].set(0, 0, 0);
        }
        // 1セグメントの幅と奥行
        const w = this.width / this.widthAllSegments;
        const d = this.depth / this.depthAllSegments;
        // 自身の一つ右と一つ手前とのベクトルから法線を計算し、各頂点にその値を足す
        for (let i = 0; i < this.widthAllSegments - 1; i++) {
            for (let j = 0; j < this.depthAllSegments - 1; j++) {
                const h = this.GetHeight(i, j);
                const a = new THREE.Vector3(w, this.GetHeight(i + 1, j) - h, 0);
                const b = new THREE.Vector3(0, this.GetHeight(i, j + 1) - h, d);
                b.cross(a);
                this.normals[j * this.widthAllSegments + i].add(b);
                this.normals[(j + 1) * this.widthAllSegments + i].add(b);
                this.normals[j * this.widthAllSegments + (i + 1)].add(b);
            }
        }
        // 法線を正規化し、地形のジオメトリに代入
        for (let i = 0; i < this.widthAllSegments - 1; i++) {
            for (let j = 0; j < this.depthAllSegments - 1; j++) {
                const index = j * this.widthAllSegments + i;
                this.normals[index].normalize();
                this.SetNormal(i, j, this.normals[index]);
            }
        }
    }
    public GetHeight(width: number, depth: number): number {
        return this.heights[depth * this.widthAllSegments + width];
    }
}
