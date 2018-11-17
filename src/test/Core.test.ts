import { Core } from "../Core";

test("new Core()", () => {
    const c = new Core({
        antialias: false,
    });
    expect(c.GetOption().antialias).toBe(false);
});
