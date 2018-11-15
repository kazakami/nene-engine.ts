import { Scene } from "../Scene";

class TestScene extends Scene {}

test("constructor", () => {
    const scene = new TestScene();
    expect(scene.core).toBe(null);
});
