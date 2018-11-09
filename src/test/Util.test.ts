import { BooleanToString, Coalescing, NullCoalescing, UndefCoalescing } from "../Util";

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
