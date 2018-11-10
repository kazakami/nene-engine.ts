import * as THREE from "three";
import { Core } from "./Core";
import { PhysicObject } from "./PhysicObject";
import { Scene } from "./Scene";

/**
 * Unitの基底クラス、これを継承して用いる
 * 基本的にコンストラクタ値の受け渡しにのみ用い、Init()に起動時の処理を追加する
 * Update()関数をオーバーライドした際はsuper.Updateを実行しないとframeおよび物理オブジェクトの更新が行われない
 */
abstract class Unit {
    public isAlive: boolean = true;
    public priority: number = 0;
    public core: Core = null;
    public scene: Scene = null;
    public frame: number = 0;
    public objects: THREE.Object3D[] = [];
    public sprites: THREE.Sprite[] = [];
    public physicObjects: PhysicObject[] = [];
    constructor() {
        return;
    }
    public Update(): void {
        this.frame++;
        this.physicObjects.forEach((p) => { p.Update(); });
    }
    public Draw(): void { return; }
    public Init(): void { return; }
    public Fin(): void { return; }
    /**
     * sceneにObject3Dを追加し、Unitに紐づける
     * 追加されたObject3DはこのUnitの削除時に自動でシーンから除外される
     * @param o 追加するObject3D
     */
    public AddObject(o: THREE.Object3D): void {
        this.objects.push(o);
        this.scene.scene.add(o);
    }
    /**
     * scene2dにSpriteを追加し、Unitに紐づける
     * 追加されたSpriteはこのUnitの削除時に自動でシーンから除外される
     * @param s 追加するSprite
     */
    public AddSprite(s: THREE.Sprite): void {
        this.sprites.push(s);
        this.scene.scene2d.add(s);
    }
    /**
     * sceneにviewBodyを追加し、physicWorldにphysicBodyを追加し、オブジェクトをUnitに紐付ける
     * 追加された物理オブジェクトはこのUnitの削除時に自動でシーンから除外される
     * @param p 追加する物理オブジェクト
     */
    public AddPhysicObject(p: PhysicObject): void {
        this.physicObjects.push(p);
        this.scene.physicWorld.addBody(p.phyBody);
        this.scene.scene.add(p.viewBody);
    }
    /**
     * 指定したObject3Dを削除
     * @param o 削除するObject3D
     */
    public RemoveObject(o: THREE.Object3D): void {
        this.objects = this.objects.filter((obj) => o !== obj);
        this.scene.scene.remove(o);
    }
    /**
     * 指定したSpriteを削除
     * @param s 削除するSprite
     */
    public RemoveSprite(s: THREE.Sprite): void {
        this.sprites = this.sprites.filter((spr) => s !== spr);
        this.scene.scene2d.remove(s);
    }
    /**
     * 指定した物理オブジェクトを削除する
     * @param p 削除する物理オブジェクト
     */
    public RemovePhysicOnject(p: PhysicObject): void {
        this.physicObjects = this.physicObjects.filter((pobj) => p !== pobj);
        this.scene.physicWorld.remove(p.phyBody);
        this.scene.scene.remove(p.viewBody);
    }
}

class PhysicUnit extends Unit {
    public Init() {
        return;
    }
    public Update() {
        super.Update();
    }
    public Fin() {
        return;
    }
}

export { Unit, PhysicUnit };
