import * as CANNON from "cannon";
import * as THREE from "three";
import { CollideData, PhysicBox, PhysicObject, PhysicObjects, PhysicPlane, PhysicSphere } from "../PhysicObject";

test("CollideData constructor", () => {
    const body = new CANNON.Body();
    const target = new CANNON.Body();
    const contact = new CANNON.ContactEquation(body, target);
    const cd = new CollideData(body, contact, target);
    expect(cd.body).toBe(body);
    expect(cd.target).toBe(target);
    expect(cd.contact).toBe(contact);
});

test("collideName of CollideData", () => {
    const name = "BodyName";
    const body = new CANNON.Body({ material: new CANNON.Material(name) });
    const target = new CANNON.Body();
    const contact = new CANNON.ContactEquation(body, target);
    const cd = new CollideData(body, contact, target);
    expect(cd.collideName).toEqual(name);
});

test("PhysicObject position", () => {
    const p = new PhysicSphere(1, 1);
    expect(p.position).toBe(p.phyBody.position);
    p.position.x = 20;
    expect(p.position.x).toEqual(20);
});

test("PhysicObject velocity", () => {
    const p = new PhysicSphere(1, 1);
    expect(p.velocity).toBe(p.phyBody.velocity);
    p.velocity.y = 30;
    expect(p.velocity.y).toEqual(30);
});

test("PhysicObject quaternion", () => {
    const p = new PhysicSphere(1, 1);
    expect(p.quaternion).toBe(p.phyBody.quaternion);
    p.quaternion.w = 40;
    expect(p.quaternion.w).toEqual(40);
});

test("PhysicObject angularVelocity", () => {
    const p = new PhysicSphere(1, 1);
    expect(p.angularVelocity).toBe(p.phyBody.angularVelocity);
    p.angularVelocity.z = 50;
    expect(p.angularVelocity.z).toEqual(50);
});

test("SetCollideCallback", () => {
    const callback = (c: CollideData) => { return; };
    const p = new PhysicSphere(1, 1);
    expect(p.collideCallBack).toBeNull();
    p.SetCollideCallback(callback);
    expect(p.collideCallBack).toBe(callback);
});

test("CollideCallback", () => {
    let called = false;
    const callback = (c: CollideData) => called = true;
    const p = new PhysicSphere(1, 1);
    p.SetCollideCallback(callback);
    const p2 = new PhysicBox(1, 1, 1, 1);
    const world = new CANNON.World();
    world.addBody(p.phyBody);
    world.addBody(p2.phyBody);
    world.step(1 / 60);
    expect(called).toBeTruthy();
});

test("Update() calls Sync()", () => {
    const p = new PhysicSphere(1, 1);
    p.phyBody.position.x = 1;
    p.phyBody.position.y = 2;
    p.phyBody.position.z = 3;
    p.phyBody.quaternion.w = 4;
    p.phyBody.quaternion.x = 5;
    p.phyBody.quaternion.y = 6;
    p.phyBody.quaternion.z = 7;
    expect(p.viewBody.position.x).toEqual(0);
    expect(p.viewBody.position.y).toEqual(0);
    expect(p.viewBody.position.z).toEqual(0);
    expect(p.viewBody.quaternion.w).toEqual(1);
    expect(p.viewBody.quaternion.x).toEqual(0);
    expect(p.viewBody.quaternion.y).toEqual(0);
    expect(p.viewBody.quaternion.z).toEqual(0);
    p.Update();
    expect(p.viewBody.position.x).toEqual(1);
    expect(p.viewBody.position.y).toEqual(2);
    expect(p.viewBody.position.z).toEqual(3);
    expect(p.viewBody.quaternion.w).toEqual(4);
    expect(p.viewBody.quaternion.x).toEqual(5);
    expect(p.viewBody.quaternion.y).toEqual(6);
    expect(p.viewBody.quaternion.z).toEqual(7);
});

test("Sync() of PhysicPlane", () => {
    const p = new PhysicPlane(1);
    p.phyBody.position.x = 2;
    expect(p.viewBody.position.x).toEqual(0);
    p.Update();
    expect(p.viewBody.position.x).toEqual(2);
});

test("Sync() of PhysicBox", () => {
    const p = new PhysicBox(1, 1, 1, 1);
    p.phyBody.position.x = 3;
    expect(p.viewBody.position.x).toEqual(0);
    p.Update();
    expect(p.viewBody.position.x).toEqual(3);
});

test("Sync() of PhysicObjects", () => {
    const p = new PhysicObjects(1);
    p.phyBody.position.x = 4;
    expect(p.viewBody.position.x).toEqual(0);
    p.Update();
    expect(p.viewBody.position.x).toEqual(4);
});

test("PhysicSphere constructor", () => {
    const p = new PhysicSphere(1, 1);
    expect((p.viewBody as THREE.Mesh).geometry.type).toEqual("SphereBufferGeometry");
});

test("Custom viewBody in PhysicSphere", () => {
    const obj = new THREE.Object3D();
    const p = new PhysicSphere(1, 1, "", obj);
    expect(p.viewBody).toBe(obj);
});

test("PhysicPlane constructor", () => {
    const p = new PhysicPlane(1);
    expect((p.viewBody as THREE.Mesh).geometry.type).toEqual("PlaneGeometry");
});

test("Custom viewBody in PhysicPlane", () => {
    const obj = new THREE.Object3D();
    const p = new PhysicPlane(1, "", obj);
    expect(p.viewBody).toBe(obj);
});

test("PhysicBox constructor", () => {
    const p = new PhysicBox(1, 1, 1, 1);
    expect((p.viewBody as THREE.Mesh).geometry.type).toEqual("BoxGeometry");
});

test("Custom viewBody in PhysicBox", () => {
    const obj = new THREE.Object3D();
    const p = new PhysicBox(1, 1, 1, 1, "", obj);
    expect(p.viewBody).toBe(obj);
});

test("PhysicObjects constructor", () => {
    const p = new PhysicObjects(1);
    expect((p.viewBody as THREE.Group).isGroup).toBeTruthy();
});
