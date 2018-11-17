import { Core } from "../Core";
import { Scene } from "../Scene";

class TestScene extends Scene {}

test("constructor", () => {
    const scene = new TestScene();
    expect(scene.core).toBe(null);
});

test("this.frame increase by call of InnerUpdate()", () => {
    const scene = new TestScene();
    scene.InnerUpdate();
    scene.InnerUpdate();
    scene.InnerUpdate();
    expect(scene.frame).toBe(3);
});

test("InnerInit() generate cameras", () => {
    const c = new Core({});
    c.windowSizeX = 640;
    c.windowSizeY = 480;
    const scene = new TestScene();
    scene.core = c;
    scene.InnerInit();
    expect(scene.camera).not.toBe(null);
    expect(scene.camera2d).not.toBe(null);
});
