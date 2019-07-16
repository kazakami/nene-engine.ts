import { Particles } from "./../Particles";

test("Set global position", () => {
    const p = new Particles();
    p.GenerateParticles(1);
    p.SetGlobalPosition(10, 20, 30);
    expect(p.particle.position.x).toEqual(10);
    expect(p.particle.position.y).toEqual(20);
    expect(p.particle.position.z).toEqual(30);
});

test("GetParticlesNum()", () => {
    const p = new Particles();
    p.GenerateParticles(10);
    expect(p.GetParticlesNum()).toEqual(10);
});

test("Set and get position", () => {
    const p = new Particles();
    p.GenerateParticles(1);
    p.SetPosition(0, 5, 6, 7);
    const [x, y, z] = p.GetPosition(0);
    expect(x).toEqual(5);
    expect(y).toEqual(6);
    expect(z).toEqual(7);
});

test("SetPosition without update", () => {
    const p = new Particles();
    p.GenerateParticles(1);
    p.SetPosition(0, 1, 2, 3, false);
    expect((p["geo"].attributes.position as THREE.BufferAttribute).needsUpdate).toBeFalsy();
});

test("Set and get color", () => {
    const p = new Particles();
    p.GenerateParticles(1);
    p.SetColor(0, 0.5, 0.6, 0.7);
    const [r, g, b] = p.GetColor(0);
    expect(r).toBeCloseTo(0.5);
    expect(g).toBeCloseTo(0.6);
    expect(b).toBeCloseTo(0.7);
});

test("SetColor without update", () => {
    const p = new Particles();
    p.GenerateParticles(1);
    p.SetColor(0, 1, 2, 3, false);
    expect((p["geo"].attributes.color as THREE.BufferAttribute).needsUpdate).toBeFalsy();
});

test("Disable and check point", () => {
    const p = new Particles();
    p.GenerateParticles(1);
    p.SetPosition(0, 3, 4, 5);
    expect(p.IsPointDisable(0)).toBeFalsy();
    p.SetPointDisable(0);
    expect(p.IsPointDisable(0)).toBeTruthy();
});
