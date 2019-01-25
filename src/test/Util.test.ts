import * as THREE from "three";
import {
    AllIsNotNullOrUndefined, AssociativeArrayToArray, BooleanToString, Clamp,
    Coalescing, EachMesh, NullCoalescing, RandomColor, UndefCoalescing,
} from "../Util";

test("undefine coalescing 1", () => {
    expect(UndefCoalescing(undefined, 1)).toBe(1);
});
test("undefine coalescing 2", () => {
    expect(UndefCoalescing(5, 1)).toBe(5);
});
test("null coalescing 1", () => {
    expect(NullCoalescing(null, 3)).toBe(3);
});
test("null coalescing 2", () => {
    expect(NullCoalescing(8, 3)).toBe(8);
});
test("coalescing 1", () => {
    expect(Coalescing(null, 4)).toBe(4);
});
test("coalescing 2", () => {
    expect(Coalescing(undefined, 5)).toBe(5);
});
test("coalescing 3", () => {
    expect(Coalescing(7, 6)).toBe(7);
});
test("boolean to string 1", () => {
    expect(BooleanToString(true)).toBe("true");
});
test("boolean to string 2", () => {
    expect(BooleanToString(false)).toBe("false");
});
test("RandomColor() returns THREE.Color", () => {
    expect("isColor" in RandomColor()).toBe(true);
});
test("AllIsNotNullOrUndefined 1", () => {
    const arr: { [key: string]: string } = {};
    expect(AllIsNotNullOrUndefined(arr)).toBe(true);
});
test("AllIsNotNullOrUndefined 2", () => {
    const arr: { [key: string]: string } = {};
    arr.hoge = "hoge";
    arr.fuga = "fuga";
    expect(AllIsNotNullOrUndefined(arr)).toBe(true);
});
test("AllIsNotNullOrUndefined 3", () => {
    const arr: { [key: string]: string } = {};
    arr.hoge = "hoge";
    arr.piyo = null;
    arr.fuga = "fuga";
    expect(AllIsNotNullOrUndefined(arr)).toBe(false);
});
test("AllIsNotNullOrUndefined 4", () => {
    const arr: { [key: string]: string } = {};
    arr.hoge = "hoge";
    arr.piyo = undefined;
    arr.fuga = "fuga";
    expect(AllIsNotNullOrUndefined(arr)).toBe(false);
});
test("AssociativeArrayToArray 1", () => {
    const arr: { [key: string]: string } = {};
    expect(AssociativeArrayToArray(arr)).toEqual([]);
});
test("AssociativeArrayToArray 2", () => {
    const arr: { [key: string]: string } = {};
    arr.hoge = "hoge";
    arr.fuga = "fuga";
    expect(AssociativeArrayToArray(arr)).toEqual(["hoge", "fuga"]);
});
test("EachMesh 1", () => {
    const mesh1 = new THREE.Mesh();
    mesh1.name = "hoge";
    expect(mesh1.name).toEqual("hoge");
    EachMesh(mesh1, (m) => m.name = "fuga");
    expect(mesh1.name).toEqual("fuga");
});
test("EachMesh 2", () => {
    const mesh1 = new THREE.Mesh();
    mesh1.name = "hoge";
    const mesh2 = new THREE.Mesh();
    mesh2.name = "hoge";
    expect(mesh1.name).toEqual("hoge");
    expect(mesh2.name).toEqual("hoge");
    const group1 = new THREE.Group();
    group1.name = "piyo";
    group1.add(mesh1, mesh2);
    expect(group1.name).toEqual("piyo");
    EachMesh(group1, (m) => m.name = "fuga");
    expect(mesh1.name).toEqual("fuga");
    expect(mesh2.name).toEqual("fuga");
    expect(group1.name).toEqual("piyo");
});
test("EachMesh 3", () => {
    const mesh1 = new THREE.Mesh();
    mesh1.name = "hoge";
    const mesh2 = new THREE.Mesh();
    mesh2.name = "hoge";
    const mesh3 = new THREE.Mesh();
    mesh3.name = "hoge";
    expect(mesh1.name).toEqual("hoge");
    expect(mesh2.name).toEqual("hoge");
    expect(mesh3.name).toEqual("hoge");
    const group1 = new THREE.Group();
    group1.name = "piyo";
    group1.add(mesh1, mesh2);
    const group2 = new THREE.Group();
    group2.name = "piyo";
    group2.add(group1, mesh3);
    expect(group1.name).toEqual("piyo");
    expect(group2.name).toEqual("piyo");
    EachMesh(group2, (m) => m.name = "fuga");
    expect(mesh1.name).toEqual("fuga");
    expect(mesh2.name).toEqual("fuga");
    expect(mesh3.name).toEqual("fuga");
    expect(group1.name).toEqual("piyo");
    expect(group2.name).toEqual("piyo");
});
test("Range 1", () => {
    expect(Clamp(10, 0, 100)).toBeCloseTo(10);
    expect(Clamp(150, 0, 100)).toBeCloseTo(100);
    expect(Clamp(10, 50, 100)).toBeCloseTo(50);
    expect(Clamp(2.7, 1.6, 4.5)).toBeCloseTo(2.7);
    expect(Clamp(0.7, 1.6, 4.5)).toBeCloseTo(1.6);
    expect(Clamp(8.7, 1.6, 4.5)).toBeCloseTo(4.5);
});
