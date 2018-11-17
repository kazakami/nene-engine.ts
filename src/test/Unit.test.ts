import * as THREE from "three";
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
    unit.RemovePhysicOnject(p);
    expect(unit.physicObjects.indexOf(p)).toBe(-1);
});
