import * as THREE from "three";
import { Rectangle } from "../Collider2D";
import { PhysicSphere } from "../PhysicObject";
import { Scene } from "../Scene";
import { TiledTexturedSprite } from "../TiledTexturedSprite";
import { Unit } from "../Unit";

class TestUnit extends Unit {}
class TestScene extends Scene {}

test("constructor", () => {
    const unit = new TestUnit();
    expect(unit.core).toBe(null);
});

test("this.frame increase by call of InnerUpdate()", () => {
    const unit = new TestUnit();
    unit.InnerUpdate();
    unit.InnerUpdate();
    unit.InnerUpdate();
    expect(unit.frame).toBe(3);
});

test("Add and remove THREE.object3D in objects", () => {
    const unit = new TestUnit();
    const scene = new TestScene();
    unit.scene = scene;
    const o = new THREE.Object3D();
    unit.AddObject(o);
    expect(unit.objects.indexOf(o)).not.toBe(-1);
    unit.RemoveObject(o);
    expect(unit.objects.indexOf(o)).toBe(-1);
});

test("Add and remove THREE.object3D in sprites", () => {
    const unit = new TestUnit();
    const scene = new TestScene();
    unit.scene = scene;
    const o = new THREE.Object3D();
    unit.AddSprite(o);
    expect(unit.sprites.indexOf(o)).not.toBe(-1);
    unit.RemoveSprite(o);
    expect(unit.sprites.indexOf(o)).toBe(-1);
});

test("Add and remove TiledTextureSprite in sprites", () => {
    const unit = new TestUnit();
    const scene = new TestScene();
    unit.scene = scene;
    const tex = new THREE.Texture();
    const tts = new TiledTexturedSprite(tex);
    unit.AddSprite(tts);
    expect(unit.sprites.indexOf(tts)).not.toBe(-1);
    unit.RemoveSprite(tts);
    expect(unit.sprites.indexOf(tts)).toBe(-1);
});

test("Add and remove PhysicObject in physicObjects", () => {
    const unit = new TestUnit();
    const scene = new TestScene();
    unit.scene = scene;
    const p = new PhysicSphere(1, 1);
    unit.AddPhysicObject(p);
    expect(unit.physicObjects.indexOf(p)).not.toBe(-1);
    unit.RemovePhysicObject(p);
    expect(unit.physicObjects.indexOf(p)).toBe(-1);
});

test("Add nad remove Figure in sprites 1", () => {
    const unit = new TestUnit();
    const scene = new TestScene();
    unit.scene = scene;
    const fig = new Rectangle(1, 2, 3, 4);
    unit.AddSprite(fig);
    expect(unit.sprites.indexOf(fig)).not.toBe(-1);
    expect(scene.scene2d.children).toEqual([fig.helper]);
    unit.RemoveSprite(fig);
    expect(unit.sprites.indexOf(fig)).toBe(-1);
    expect(scene.scene2d.children).toEqual([]);
});

test("Add nad remove Figure in sprites 2", () => {
    const unit = new TestUnit();
    const scene = new TestScene();
    unit.scene = scene;
    const fig = new Rectangle(1, 2, 3, 4);
    fig.GenerateHelper();
    unit.AddSprite(fig);
    expect(unit.sprites.indexOf(fig)).not.toBe(-1);
    expect(scene.scene2d.children).toEqual([fig.helper]);
    unit.RemoveSprite(fig);
    expect(unit.sprites.indexOf(fig)).toBe(-1);
    expect(scene.scene2d.children).toEqual([]);
});
