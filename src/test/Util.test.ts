import {
    AllIsNotNullOrUndefined, AssociativeArrayToArray, BooleanToString, Coalescing,
    NullCoalescing, RandomColor, UndefCoalescing,
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
