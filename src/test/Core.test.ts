import * as THREE from "three";
import { Core, CoreOption } from "../Core";
import { Scene } from "../Scene";

class TestScene extends Scene {
    public IsRendered = false;
    public IsDrawedText = false;
    public Render() { this.IsRendered = true; }
    public DrawText() { this.IsDrawedText = true; }
}

test("new Core()", () => {
    const c = new Core({
        antialias: false,
    });
    expect(c.GetOption().antialias).toBe(false);
});

test("AddScene() and ChangeScene()", () => {
    const c = new Core({});
    const s = new TestScene();
    c.AddScene("TestScene", s);
    expect(c["activeScene"]).toBe(null);
    c["Update"]();
    expect(c["activeScene"]).toBe(null);
    c["ChangeScene"]("TestScene");
    expect(c["activeScene"]).toBe(null);
    c["Update"]();
    expect(c["activeScene"]).toBe(s);
});

test("AddAndChangeScene()", () => {
    const c = new Core({});
    const s = new TestScene();
    c.AddAndChangeScene("TestScene", s);
    expect(c["activeScene"]).toBe(null);
    c["Update"]();
    expect(c["activeScene"]).toBe(s);
});

test("ChangeScene() Exception", () => {
    const c = new Core({});
    expect(() => { c.ChangeScene("NotExistScene"); }).toThrow();
});

test("exception if nextSceneName is invalid when Update()", () => {
    const c = new Core({});
    c["nextSceneName"] = "NotExistScene";
    expect(() => { c["Update"](); }).toThrow();
});

test("RemoveScene()", () => {
    const c = new Core({});
    const s = new TestScene();
    c.AddScene("TestScene", s);
    expect(c["scenes"]["TestScene"]).toBe(s);
    c.RemoveScene("TestScene");
    expect(c["scenes"]["TestScene"]).toBeUndefined();
});

describe("about text", () => {
    test("IsTextAvailable()", () => {
        const c = new Core({});
        c["texts"]["a"] = null;
        c["texts"]["b"] = "tb";
        expect(c.IsTextAvailable("a")).toBeFalsy();
        expect(c.IsTextAvailable("b")).toBeTruthy();
        expect(c.IsTextAvailable("c")).toBeFalsy();
    });

    test("IsAllTextAvailable()", () => {
        const c = new Core({});
        c["texts"]["a"] = null;
        c["texts"]["b"] = "tb";
        expect(c.IsAllTextAvailable()).toBeFalsy();
        c["texts"]["a"] = "ta";
        expect(c.IsAllTextAvailable()).toBeTruthy();
    });

    test("GetTextLoadingProgress()", () => {
        const c = new Core({});
        c["texts"]["a"] = null;
        c["texts"]["b"] = "tb";
        expect(c.GetTextLoadingProgress()).toEqual([1, 2]);
        c["texts"]["a"] = "ta";
        expect(c.GetTextLoadingProgress()).toEqual([2, 2]);
    });

    test("GetText()", () => {
        const c = new Core({});
        c["texts"]["a"] = null;
        c["texts"]["b"] = "tb";
        expect(() => { c.GetText("a"); }).toThrow();
        expect(c.GetText("b")).toEqual("tb");
        c["texts"]["a"] = "ta";
        expect(c.GetText("a")).toEqual("ta");
    });
});

describe("about texture", () => {
    test("IsTextureAvailable()", () => {
        const c = new Core({});
        c["textures"]["a"] = null;
        c["textures"]["b"] = new THREE.Texture();
        expect(c.IsTextureAvailable("a")).toBeFalsy();
        expect(c.IsTextureAvailable("b")).toBeTruthy();
        expect(c.IsTextureAvailable("c")).toBeFalsy();
    });

    test("IsAllTextureAvailable()", () => {
        const c = new Core({});
        c["textures"]["a"] = null;
        c["textures"]["b"] = new THREE.Texture();
        expect(c.IsAllTextureAvailable()).toBeFalsy();
        c["textures"]["a"] = new THREE.Texture();
        expect(c.IsAllTextureAvailable()).toBeTruthy();
    });

    test("GetTextureLoadingProgress()", () => {
        const c = new Core({});
        c["textures"]["a"] = null;
        c["textures"]["b"] = new THREE.Texture();
        expect(c.GetTextureLoadingProgress()).toEqual([1, 2]);
        c["textures"]["a"] = new THREE.Texture();
        expect(c.GetTextureLoadingProgress()).toEqual([2, 2]);
    });

    test("GetTexture()", () => {
        const c = new Core({});
        const ta = new THREE.Texture();
        const tb = new THREE.Texture();
        c["textures"]["a"] = null;
        c["textures"]["b"] = tb;
        expect(() => { c.GetTexture("a"); }).toThrow();
        expect(c.GetTexture("b")).toBe(tb);
        c["textures"]["a"] = ta;
        expect(c.GetTexture("a")).toBe(ta);
    });
});

describe("about object", () => {
    test("IsObjectAvailable()", () => {
        const c = new Core({});
        c["objects"]["a"] = null;
        c["objects"]["b"] = new THREE.Object3D();
        expect(c.IsObjectAvailable("a")).toBeFalsy();
        expect(c.IsObjectAvailable("b")).toBeTruthy();
        expect(c.IsObjectAvailable("c")).toBeFalsy();
    });

    test("IsAllObjectAvailable()", () => {
        const c = new Core({});
        c["objects"]["a"] = null;
        c["objects"]["b"] = new THREE.Object3D();
        expect(c.IsAllObjectAvailable()).toBeFalsy();
        c["objects"]["a"] = new THREE.Object3D();
        expect(c.IsAllObjectAvailable()).toBeTruthy();
    });

    test("GetObjectLoadingProgress()", () => {
        const c = new Core({});
        c["objects"]["a"] = null;
        c["objects"]["b"] = new THREE.Object3D();
        expect(c.GetObjectLoadingProgress()).toEqual([1, 2]);
        c["objects"]["a"] = new THREE.Object3D();
        expect(c.GetObjectLoadingProgress()).toEqual([2, 2]);
    });

    test("GetObject()", () => {
        const c = new Core({});
        // GetObjectはclone()しているので別種類のオブジェクトを渡して対応するものが返ってくるか調べる
        const ta = new THREE.Sprite();
        const tb = new THREE.Mesh();
        c["objects"]["a"] = null;
        c["objects"]["b"] = tb;
        expect(() => { c.GetObject("a"); }).toThrow();
        expect((c.GetObject("b") as THREE.Mesh).isMesh).toBeTruthy();
        c["objects"]["a"] = ta;
        expect((c.GetObject("a") as THREE.Sprite).isSprite).toBeTruthy();
    });
});

test("GetAllResourcesLoadingProgress()", () => {
    const c = new Core({});
    expect(c.GetAllResourcesLoadingProgress()).toEqual([0, 0]);
    c["objects"]["a"] = null;
    c["objects"]["b"] = new THREE.Object3D();
    expect(c.GetAllResourcesLoadingProgress()).toEqual([1, 2]);
    c["textures"]["a"] = null;
    c["textures"]["b"] = new THREE.Texture();
    expect(c.GetAllResourcesLoadingProgress()).toEqual([2, 4]);
    c["texts"]["a"] = null;
    c["texts"]["b"] = "tb";
    expect(c.GetAllResourcesLoadingProgress()).toEqual([3, 6]);
    c["objects"]["a"] = new THREE.Object3D();
    expect(c.GetAllResourcesLoadingProgress()).toEqual([4, 6]);
    c["textures"]["a"] = new THREE.Texture();
    expect(c.GetAllResourcesLoadingProgress()).toEqual([5, 6]);
    c["texts"]["a"] = "ta";
    expect(c.GetAllResourcesLoadingProgress()).toEqual([6, 6]);
});

test("GetAllResourcesAvailable()", () => {
    const c = new Core({});
    expect(c.IsAllResourcesAvailable()).toBeTruthy();
    c["objects"]["a"] = null;
    c["objects"]["b"] = new THREE.Object3D();
    expect(c.IsAllResourcesAvailable()).toBeFalsy();
    c["textures"]["a"] = null;
    c["textures"]["b"] = new THREE.Texture();
    expect(c.IsAllResourcesAvailable()).toBeFalsy();
    c["texts"]["a"] = null;
    c["texts"]["b"] = "tb";
    expect(c.IsAllResourcesAvailable()).toBeFalsy();
    c["objects"]["a"] = new THREE.Object3D();
    expect(c.IsAllResourcesAvailable()).toBeFalsy();
    c["textures"]["a"] = new THREE.Texture();
    expect(c.IsAllResourcesAvailable()).toBeFalsy();
    c["texts"]["a"] = "ta";
    expect(c.IsAllResourcesAvailable()).toBeTruthy();
});

test("IsKeyDown()", () => {
    const c = new Core({});
    expect(c.IsKeyDown("a")).toBeFalsy();
    c["keyState"]["a"] = false;
    expect(c.IsKeyDown("a")).toBeFalsy();
    c["keyState"]["a"] = true;
    expect(c.IsKeyDown("a")).toBeTruthy();
});

test("IsKeyPressing()", () => {
    const c = new Core({});
    expect(c.IsKeyPressing("a")).toBeFalsy();
    c["keyState"]["a"] = false;
    expect(c.IsKeyPressing("a")).toBeFalsy();
    c["keyState"]["a"] = true;
    expect(c.IsKeyPressing("a")).toBeTruthy();
    c["keyState"]["a"] = false;
    c["previousKeyState"]["a"] = true;
    expect(c.IsKeyPressing("a")).toBeFalsy();
    c["previousKeyState"]["a"] = false;
    expect(c.IsKeyPressing("a")).toBeFalsy();
    c["keyState"]["a"] = true;
    c["previousKeyState"]["a"] = false;
    expect(c.IsKeyPressing("a")).toBeTruthy();
});

test("GetAllDownKey()", () => {
    const c = new Core({});
    c["keyState"]["c"] = true;
    c["keyState"]["d"] = false;
    c["keyState"]["a"] = true;
    c["keyState"]["b"] = false;
    expect(c.GetAllDownKey()).toEqual(["a", "c"]);
});

test("keyState copy to previousKeyState when Update() called", () => {
    const c = new Core({});
    c["keyState"]["a"] = true;
    c["keyState"]["b"] = false;
    c["keyState"]["c"] = true;
    expect(c["previousKeyState"]).toEqual({});
    c["Update"]();
    expect(c["previousKeyState"]["a"]).toBeTruthy();
    expect(c["previousKeyState"]["b"]).toBeFalsy();
    expect(c["previousKeyState"]["c"]).toBeTruthy();
});

test("Draw() calls activeScene.Render() and activeScene.DrawText()", () => {
    const c = new Core({});
    const s = new TestScene();
    c["activeScene"] = s;
    expect(s.IsDrawedText).toBeFalsy();
    expect(s.IsRendered).toBeFalsy();
    c["Draw"]();
    expect(s.IsDrawedText).toBeTruthy();
    expect(s.IsRendered).toBeTruthy();
});

test("intervals", () => {
    const c = new Core({});
    for (let i = 0; i < 100; i++) {
        c["CalcFPS"]();
    }
    expect(c["intervals"].length).toBeLessThanOrEqual(60);
});

test("fps", () => {
    const c = new Core({});
    expect(c["intervals"]).toEqual([]);
    expect(c.fps).toEqual(0);
    c["intervals"] = [20, 30, 60];
    expect(c.fps).toBeCloseTo(1000 / ((20 + 30 + 60) / 3));
});

test("core option", () => {
    const op = new CoreOption({});
    expect(op.antialias).toBeTruthy();
    expect(op.parent).toEqual(document.body);
    expect(op.windowSizeX).toEqual(window.innerWidth);
    expect(op.windowSizeY).toEqual(window.innerHeight);
    const op2 = new CoreOption({
        windowSizeX: 100,
        windowSizeY: 200,
    });
    expect(op2.antialias).toBeTruthy();
    expect(op2.parent).toEqual(document.body);
    expect(op2.windowSizeX).toEqual(100);
    expect(op2.windowSizeY).toEqual(200);
});

test("MakeSpriteFromTexture", () => {
    const c = new Core({});
    expect(() => { c.MakeSpriteFromTexture("NotExistTexture"); }).toThrow();
});
