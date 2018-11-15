import { Unit } from "../Unit";

class TestUnit extends Unit {}

test("constructor", () => {
    const unit = new TestUnit();
    expect(unit.core).toBe(null);
});
