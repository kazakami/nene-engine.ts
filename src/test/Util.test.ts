import { UndefCoalescing } from "../Util";

test("undefine coalescing 1", () => {
    expect(UndefCoalescing(undefined, 1)).toBe(1);
});
test("undefine coalescing 2", () => {
    expect(UndefCoalescing(5, 1)).toBe(5);
});
