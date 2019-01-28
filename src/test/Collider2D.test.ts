import { Circle, collideTest, Point, Rectangle } from "../Collider2D";

test("point and point 1", () => {
    expect(collideTest(new Point(10, 20), new Point(10, 20))).toBeTruthy();
});
test("point and point 2", () => {
    expect(collideTest(new Point(10, 10), new Point(15, 10))).toBeFalsy();
});

test("point and circle 1", () => {
    expect(collideTest(new Point(10, 20), new Circle(12, 22, 2))).toBeFalsy();
    expect(collideTest(new Circle(12, 22, 2), new Point(10, 20))).toBeFalsy();
});
test("point and circle 2", () => {
    expect(collideTest(new Point(10, 20), new Circle(12, 22, 3))).toBeTruthy();
    expect(collideTest(new Circle(12, 22, 3), new Point(10, 20))).toBeTruthy();
});

test("point and rectangle 1", () => {
    expect(collideTest(new Point(10, 20), new Rectangle(15, 25, 3, 4))).toBeFalsy();
    expect(collideTest(new Rectangle(15, 25, 3, 4), new Point(10, 20))).toBeFalsy();
});
test("point and rectangle 2", () => {
    expect(collideTest(new Point(10, 20), new Rectangle(15, 25, 3, 10))).toBeFalsy();
    expect(collideTest(new Rectangle(15, 25, 3, 10), new Point(10, 20))).toBeFalsy();
});
test("point and rectangle 3", () => {
    expect(collideTest(new Point(10, 20), new Rectangle(15, 25, 20, 10))).toBeTruthy();
    expect(collideTest(new Rectangle(15, 25, 20, 10), new Point(10, 20))).toBeTruthy();
});

test("circle and circle 1", () => {
    expect(collideTest(new Circle(10, 20, 2), new Circle(14, 24, 2))).toBeFalsy();
});
test("circle and circle 2", () => {
    expect(collideTest(new Circle(10, 20, 2), new Circle(14, 24, 4))).toBeTruthy();
});

test("circle and rectangle 1", () => {
    expect(collideTest(new Circle(10, 20, 2), new Rectangle(14, 24, 10, 1))).toBeFalsy();
    expect(collideTest(new Rectangle(14, 24, 10, 1), new Circle(10, 20, 2))).toBeFalsy();
});
test("circle and rectangle 2", () => {
    expect(collideTest(new Circle(10, 20, 2), new Rectangle(14, 24, 2, 2))).toBeFalsy();
    expect(collideTest(new Rectangle(14, 24, 2, 2), new Circle(10, 20, 2))).toBeFalsy();
});
test("circle and rectangle 3", () => {
    expect(collideTest(new Circle(10, 20, 3), new Rectangle(14, 24, 6, 6))).toBeTruthy();
    expect(collideTest(new Rectangle(14, 24, 6, 6), new Circle(10, 20, 3))).toBeTruthy();
});

test("rectangle and rectangle 1", () => {
    expect(collideTest(new Rectangle(10, 20, 2, 4), new Rectangle(15, 25, 1, 1))).toBeFalsy();
});
test("rectangle and rectangle 2", () => {
    expect(collideTest(new Rectangle(10, 20, 1, 20), new Rectangle(15, 25, 20, 1))).toBeTruthy();
});
test("rectangle and rectangle 3", () => {
    expect(collideTest(new Rectangle(10, 20, 30, 30), new Rectangle(15, 25, 1, 1))).toBeTruthy();
});
