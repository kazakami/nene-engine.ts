import * as THREE from "three";

class TiledTexturedSprite {
    public tex: THREE.Texture;
    public mat: THREE.SpriteMaterial;
    public sprite: THREE.Sprite;
    public isTiledTexturedSprite = true;
    private horizontal: number;
    private vertical: number;
    constructor(t: THREE.Texture) {
        this.tex = t.clone();
        this.tex.needsUpdate = true;
        this.tex.wrapS = this.tex.wrapT = THREE.RepeatWrapping;
        this.mat = new THREE.SpriteMaterial({map: this.tex});
        this.sprite = new THREE.Sprite(this.mat);
    }
    public SetTileNumber(x: number, y: number) {
        this.horizontal = x;
        this.vertical = y;
        this.tex.repeat.set(1 / this.horizontal, 1 / this.vertical);
    }
    public SetTile(x: number, y: number) {
        this.tex.offset.set(x / this.horizontal, y / this.vertical);
    }
    public Dispose(): void {
        this.tex.dispose();
        this.mat.dispose();
    }
}

export { TiledTexturedSprite };
