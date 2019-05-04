import * as THREE from "three";

export class Terrain {
    /**
     * 地形の表示用のGroup
     * これにタイルを追加したり削除したりして効率のいい表示を行う
     */
    private grp: THREE.Group = new THREE.Group();
    private mat: THREE.Material;
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
    // オブジェクトを描画する距離
    private far: number = 100;
    // カメラ座標
    private pos: THREE.Vector3 = new THREE.Vector3();
    /**
     * オブジェクトを描画する距離を設定する
     * @param d 距離
     */
    public SetFar(d: number): void {
        this.far = d;
        this.UpdateVisible();
    }
    /**
     * カメラ位置を設定する
     * @param p カメラ座標
     */
    public SetCameraPos(p: THREE.Vector3): void {
        this.pos.copy(p);
        this.UpdateVisible();
    }
    /**
     * 地形全体の幅を取得する
     */
    public GetWidth(): number {
        return this.width;
    }
    /**
     * 地形全体の奥行を取得する
     */
    public GetDepth(): number {
        return this.depth;
    }
    /**
     * 1セグメントの幅を取得する
     */
    public GetSegmentWidth(): number {
        return this.width / (this.widthAllSegments - 1);
    }
    /**
     * 1セグメントの奥行を取得する
     */
    public GetSegmentDepth(): number {
        return this.depth / (this.depthAllSegments - 1);
    }
    /**
     * 幅方向のセグメントの数を取得する
     */
    public GetWidthAllSegments(): number {
        return this.widthAllSegments;
    }
    /**
     * 奥行方向のセグメントの数を取得する
     */
    public GetDepthAllSegments(): number {
        return this.depthAllSegments;
    }
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
     * @param material マテリアル
     */
    public MakeGeometry(
        width: number, depth: number,
        widthSegments: number, depthSegments: number,
        widthTiles: number, depthTiles: number, material: THREE.Material = null): void {
        this.width = width;
        this.depth = depth;
        this.widthSegments = widthSegments;
        this.depthSegments = depthSegments;
        this.widthTiles = widthTiles;
        this.depthTiles = depthTiles;
        this.widthAllSegments = this.widthTiles * (this.widthSegments - 0) + 1;
        this.depthAllSegments = this.depthTiles * (this.depthSegments - 0) + 1;
        if (material === null || material === undefined) {
            this.mat = new THREE.MeshPhongMaterial({ color: 0x888888 });
        } else {
            this.mat = material;
        }
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
        this.MakeMesh();
    }
    public MakeMesh(): void {
        this.grp = new THREE.Group();
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
                const mesh = new THREE.Mesh(geo, this.mat);
                this.tiles[index] = [geo, mesh];
                this.grp.add(this.tiles[index][1]);
            }
        }
    }
    /**
     * 表示用のTHREE.Groupを返す
     * このTHREE.Groupを追加しておけば最適に表示される
     */
    public GetObject(): THREE.Object3D {
        return this.grp;
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
            const tileD = depth / this.depthSegments;
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
        } else if (!w && !d) {
            // 幅・奥行方向ともにタイル同士の境界線上
            const tileW = width / this.widthSegments;
            const tileD = depth / this.depthSegments;
            // 指定した頂点の属するタイルのインデックス
            // 以下の4つのタイルの境界に頂点は存在している
            const index1 = (tileD - 1) * this.widthTiles + (tileW - 1);
            const index2 = tileD * this.widthTiles + (tileW - 1);
            const index3 = (tileD - 1) * this.widthTiles + tileW;
            const index4 = tileD * this.widthTiles + tileW;
            const segW1 = this.widthSegments;
            const segW2 = this.widthSegments;
            const segW3 = 0;
            const segW4 = 0;
            const segD1 = this.depthSegments;
            const segD2 = 0;
            const segD3 = this.depthSegments;
            const segD4 = 0;
            // タイル内での頂点のインデックス
            const i1 = segD1 * (this.widthSegments + 1) + segW1;
            const i2 = segD2 * (this.widthSegments + 1) + segW2;
            const i3 = segD3 * (this.widthSegments + 1) + segW3;
            const i4 = segD4 * (this.widthSegments + 1) + segW4;
            return new Array<[number, number]>([index1, i1], [index2, i2], [index3, i3], [index4, i4]);
        }
    }
    /**
     * 指定した頂点の高さを設定する
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param height 設定する高さ
     * @param computeNorm 法線を計算しなおすか。デフォルトではtrue
     */
    public SetHeight(width: number, depth: number, height: number, computeNormal: boolean = true): void {
        this.heights[depth * this.widthAllSegments + width] = height;
        const i = this.GetIndex(width, depth);
        i.forEach(([ti, si]) => {
            this.tiles[ti][0].attributes.position.setY(si, height);
            (this.tiles[ti][0].attributes.position as THREE.BufferAttribute).needsUpdate = true;
            this.tiles[ti][0].computeBoundingSphere();
        });
        if (computeNormal) {
            this.ComputeAllNormals();
        }
    }
    /**
     * 範囲内かのチェックを行たうえで指定した頂点の高さを設定する
     * 範囲内なら返り値はtrue、そうでなければfalse
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param height 設定する高さ
     * @param ComputeNormal 法線を計算しなおすか。デフォルトではtrue
     */
    public SafeSetHeight(width: number, depth: number, height: number, ComputeNormal: boolean = true): boolean {
        if (width >= 0 && width < this.widthAllSegments && depth >= 0 && depth < this.depthAllSegments) {
            this.SetHeight(width, depth, height, ComputeNormal);
            return true;
        } else {
            return false;
        }
    }
    /**
     * 指定した頂点の高さを指定した値だけ上げる
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param delta 上げるする高さ
     * @param ComputeNormal 法線を計算しなおすか。デフォルトではtrue
     */
    public Raise(width: number, depth: number, delta: number, ComputeNormal: boolean = true): void {
        const nowHeight = this.GetHeight(width, depth);
        this.SetHeight(width, depth, nowHeight + delta, ComputeNormal);
    }
    /**
     * 範囲内かのチェックを行たうえで指定した頂点の高さを指定した値だけ上げる
     * 範囲内なら返り値はtrue、そうでなければfalse
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param delta 上げるする高さ
     * @param ComputeNormal 法線を計算しなおすか。デフォルトではtrue
     */
    public SafeRaise(width: number, depth: number, delta: number, ComputeNormal: boolean = true): boolean {
        if (width >= 0 && width < this.widthAllSegments && depth >= 0 && depth < this.depthAllSegments) {
            this.Raise(width, depth, delta, ComputeNormal);
            return true;
        } else {
            return false;
        }
    }
    /**
     * 指定した頂点の高さを指定された制限の中で指定した値だけ上げる
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param delta 上げるする高さ
     * @param min 高さの最低値
     * @param max 高さの最高値
     * @param ComputeNormal 法線を計算しなおすか。デフォルトではtrue
     */
    public LimitedRaise(
        width: number, depth: number, delta: number,
        min: number, max: number, ComputeNormal: boolean = true): void {
        const nowHeight = this.GetHeight(width, depth);
        const h = Math.min(Math.max(nowHeight + delta, min), max);
        this.SetHeight(width, depth, h, ComputeNormal);
    }
    /**
     * 範囲内かのチェックを行たうえで指定した頂点の高さを指定された制限の中で指定した値だけ上げる
     * 範囲内なら返り値はtrue、そうでなければfalse
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param delta 上げるする高さ
     * @param min 高さの最低値
     * @param max 高さの最高値
     * @param ComputeNormal 法線を計算しなおすか。デフォルトではtrue
     */
    public SafeLimitedRaise(
        width: number, depth: number, delta: number,
        min: number, max: number, ComputeNormal: boolean = true): boolean {
        if (width >= 0 && width < this.widthAllSegments && depth >= 0 && depth < this.depthAllSegments) {
            this.LimitedRaise(width, depth, delta, min, max, ComputeNormal);
            return true;
        } else {
            return false;
        }
    }
    /**
     * 指定した頂点の法線ベクトルを設定する
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param normal 設定する法線ベクトル。単位化されている必要がある
     */
    public SetNormal(width: number, depth: number, normal: THREE.Vector3): void {
        const i = this.GetIndex(width, depth);
        i.forEach(([ti, si]) => {
            this.tiles[ti][0].attributes.normal.setXYZ(si, normal.x, normal.y, normal.z);
            (this.tiles[ti][0].attributes.normal as THREE.BufferAttribute).needsUpdate = true;
        });
    }
    /**
     * 範囲内かのチェックを行たうえで指定した頂点の法線ベクトルを設定する
     * 範囲内なら返り値はtrue、そうでなければfalse
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     * @param normal 設定する法線ベクトル。単位化されている必要がある
     */
    public SafeSetNormal(width: number, depth: number, normal: THREE.Vector3): boolean {
        if (width >= 0 && width < this.widthAllSegments && depth >= 0 && depth < this.depthAllSegments) {
            this.SetNormal(width, depth, normal);
            return true;
        } else {
            return false;
        }
    }
    /**
     * 指定された範囲内の頂点の法線を計算する
     * @param w1 小さい側の幅方向の座標
     * @param d1 小さい側の奥行方向の座標
     * @param w2 大きい側の幅方向の座標
     * @param d2 大きい側の奥行方向の座標
     */
    public ComputeNormal(w1: number, d1: number, w2: number, d2: number): void {
        if (w1 > w2 || d1 > d2) {
            return;
        }
        const n = new Array<THREE.Vector3>(this.numVertices);
        // 指定された範囲内の頂点の法線を0に初期化
        for (let i = w1; i < w2; i++) {
            for (let j = d1; j < d2; j++) {
                n[j * this.widthAllSegments + i] = new THREE.Vector3(0, 0, 0);
            }
        }
        // 1セグメントの幅と奥行
        const w = this.width / (this.widthAllSegments - 1);
        const d = this.depth / (this.depthAllSegments - 1);
        for (let i = Math.max(w1 - 1, 0); i < Math.min(w2 + 1, this.widthAllSegments - 1); i++) {
            for (let j = Math.max(d1 - 1, 0); j < Math.min(d2 + 1, this.depthAllSegments - 1); j++) {
                const h = this.GetHeight(i, j);
                const a = new THREE.Vector3(w, this.GetHeight(i + 1, j) - h, 0);
                const b = new THREE.Vector3(0, this.GetHeight(i, j + 1) - h, d);
                b.cross(a);
                if (i >= w1 && i < w2 && j >= d1 && j < d2) {
                    n[j * this.widthAllSegments + i].add(b);
                }
                if (i >= w1 && i < w2 && j + 1 >= d1 && j + 1 < d2) {
                    n[(j + 1) * this.widthAllSegments + i].add(b);
                }
                if (i + 1 >= w1 && i + 1 < w2 && j >= d1 && j < d2) {
                    n[j * this.widthAllSegments + (i + 1)].add(b);
                }
            }
        }
        // 法線を正規化し、地形のジオメトリに代入
        for (let i = w1; i < w2; i++) {
            for (let j = d1; j < d2; j++) {
                const index = j * this.widthAllSegments + i;
                n[index].normalize();
                this.normals[index].set(n[index].x, n[index].y, n[index].z);
                this.SetNormal(i, j, this.normals[index]);
            }
        }
    }
    /**
     * 入力された範囲の内、実在する頂点のみ法線を計算する
     * @param w1 小さい側の幅方向の座標
     * @param d1 小さい側の奥行方向の座標
     * @param w2 大きい側の幅方向の座標
     * @param d2 大きい側の奥行方向の座標
     */
    public SafeComputeNormal(w1: number, d1: number, w2: number, d2: number): void {
        w1 = Math.max(w1, 0);
        d1 = Math.max(d1, 0);
        w2 = Math.min(w2, this.GetWidthAllSegments());
        d2 = Math.min(d2, this.GetDepthAllSegments());
        this.ComputeNormal(w1, d1, w2, d2);
    }
    /**
     * 全頂点の法線を計算する
     */
    public ComputeAllNormals(): void {
        // 法線を0に初期化
        for (let i = 0; i < this.numVertices; i++) {
            this.normals[i].set(0, 0, 0);
        }
        // 1セグメントの幅と奥行
        const w = this.width / (this.widthAllSegments - 1);
        const d = this.depth / (this.depthAllSegments - 1);
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
        for (let i = 0; i < this.widthAllSegments; i++) {
            for (let j = 0; j < this.depthAllSegments; j++) {
                const index = j * this.widthAllSegments + i;
                this.normals[index].normalize();
                this.SetNormal(i, j, this.normals[index]);
            }
        }
    }
    /**
     * 指定された頂点の高さを取得する
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     */
    public GetHeight(width: number, depth: number): number {
        return this.heights[depth * this.widthAllSegments + width];
    }
    /**
     * 指定された頂点の法線ベクトルを取得する
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     */
    public GetNormal(width: number, depth: number): THREE.Vector3 {
        return this.normals[depth * this.widthAllSegments + width].clone();
    }
    /**
     * 指定された頂点の線形補間された法線ベクトルを取得する
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     */
    public GetInterpolatedNormal(width: number, depth: number): THREE.Vector3 {
        const baseWidth = Math.floor(width);
        const baseDepth = Math.floor(depth);
        const difWidth = width - baseWidth;
        const difDepth = depth - baseDepth;
        const normalD = this.GetNormal(baseWidth, baseDepth + 1);
        const normalW = this.GetNormal(baseWidth + 1, baseDepth);
        if (difWidth + difDepth <= 1) {
            const normal = this.GetNormal(baseWidth, baseDepth);
            const difD = new THREE.Vector3().subVectors(normalD, normal);
            const difW = new THREE.Vector3().subVectors(normalW, normal);
            difD.multiplyScalar(difDepth);
            difW.multiplyScalar(difWidth);
            normal.add(difD);
            normal.add(difW);
            return normal;
        } else {
            const normal = this.GetNormal(baseWidth, baseDepth);
            const difD = new THREE.Vector3().subVectors(normalD, normal);
            const difW = new THREE.Vector3().subVectors(normalW, normal);
            difD.multiplyScalar(1 - difDepth);
            difW.multiplyScalar(1 - difWidth);
            normal.add(difD);
            normal.add(difW);
            return normal;
        }
    }
    /**
     * 指定された頂点の線形補間された高さを取得する
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     */
    public GetInterpolatedHeight(width: number, depth: number): number {
        const baseWidth = Math.floor(width);
        const baseDepth = Math.floor(depth);
        const difWidth = width - baseWidth;
        const difDepth = depth - baseDepth;
        const heightD = this.GetHeight(baseWidth, baseDepth + 1);
        const heightW = this.GetHeight(baseWidth + 1, baseDepth);
        console.log(baseWidth, baseDepth, heightW, heightD);
        if (difWidth + difDepth <= 1) {
            const height = this.GetHeight(baseWidth, baseDepth);
            const difD = heightD - height;
            const difW = heightW - height;
            return height + difD * difDepth + difW * difWidth;
        } else {
            console.log("yaba");
            const height = this.GetHeight(baseWidth + 1, baseDepth + 1);
            const difD = heightD - height;
            const difW = heightW - height;
            return height + difD * (1 - difDepth) + difW * (1 - difWidth);
        }
    }
    /**
     * 指定した頂点番号の座標を返す。
     * 整数以外も入力可。
     * 返り値は[x座標, z座標]
     * @param width 幅方向の座標
     * @param depth 奥行方向の座標
     */
    public GetPosition(width: number, depth: number): [number, number] {
        return [this.GetSegmentWidth() * width - this.GetWidth() / 2,
             this.GetSegmentDepth() * depth - this.GetDepth() / 2];
    }
    /**
     * カメラ位置描画範囲に応じてタイルを描画非描画の設定を切り替える
     */
    private UpdateVisible(): void {
        for (let j = 0; j < this.depthTiles; j++) {
            for (let i = 0; i < this.widthTiles; i++) {
                const index = j * this.widthTiles + i;
                // タイルの中心座標
                const w = -this.width / 2 + this.width / (2 * this.widthTiles) + i * (this.width / this.widthTiles);
                const d = -this.depth / 2 + this.depth / (2 * this.depthTiles) + j * (this.depth / this.depthTiles);
                // タイル中心とカメラの距離の2乗　ただし高さは無視
                const distance2 = Math.pow(this.pos.x - w, 2) + Math.pow(this.pos.z - d, 2);
                if (distance2 < this.far * this.far) {
                    if (this.grp.children.indexOf(this.tiles[index][1]) === -1) {
                        // 視界内でgrpに入っていなければ追加
                        this.grp.add(this.tiles[index][1]);
                    }
                } else {
                    if (this.grp.children.indexOf(this.tiles[index][1]) !== -1) {
                        // 視界外でgrpに入っていれば除去
                        this.grp.remove(this.tiles[index][1]);
                    }
                }
            }
        }
    }
}
