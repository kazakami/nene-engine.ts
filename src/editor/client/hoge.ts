import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

const worldDiv = document.getElementById("world");
const localDiv = document.getElementById("local");

const worldRenderer = new THREE.WebGLRenderer({ antialias: true });
const localRenderer = new THREE.WebGLRenderer({ antialias: true });

const worldScene = new THREE.Scene();
const localScene = new THREE.Scene();

const worldCamera = new THREE.OrthographicCamera(-250, 250, 200, -200, 0.1, 100000);
const localCamera = new THREE.OrthographicCamera(-150, 150, 100, -100, 0.1, 100000);

const composer = new EffectComposer(worldRenderer);
composer.setSize(500, 400);
composer.addPass(new RenderPass(worldScene, worldCamera));
const outlinePass = new OutlinePass(new THREE.Vector2(500, 400), worldScene, worldCamera);
outlinePass.setSize(500, 400);
outlinePass.edgeStrength = 1.5;
outlinePass.edgeGlow = 0;
outlinePass.edgeThickness = 1;
composer.addPass(outlinePass);
const raycaster = new THREE.Raycaster();

Init();

const animate = () => {
    requestAnimationFrame(animate);
    // worldRenderer.render(worldScene, worldCamera);
    composer.render();
    localRenderer.render(localScene, localCamera);
};
animate();

document.getElementById("addBox").onclick = () => {
    worldScene.add(new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), new THREE.MeshPhongMaterial()));
};
document.getElementById("addSphere").onclick = () => {
    worldScene.add(new THREE.Mesh(new THREE.SphereGeometry(50), new THREE.MeshPhongMaterial()));
};

let draggingObject: THREE.Object3D | null = null;
let dragStartMouseCoord: [number, number] | null = null;
let dragStartObjectCoord: THREE.Vector3 = null;

worldDiv.addEventListener("mousemove", (e) => {
    const intersects = GetIntersect(e);
    if (draggingObject) {
        const mouseX = e.offsetX - 500 / 2;
        const mouseY = 400 / 2 - e.offsetY;
        const mouseDeltaX = mouseX - dragStartMouseCoord[0];
        const mouseDeltaY = mouseY - dragStartMouseCoord[1];
        // console.log(mouseDeltaX, mouseDeltaY);
        // console.log(dragStartObjectCoord.x);
        const cameraOrient = worldCamera.position.clone().multiplyScalar(-1);
        const cameraUp = worldCamera.up.clone();
        const right = new THREE.Vector3();
        right.crossVectors(cameraOrient, cameraUp);
        right.normalize();
        // console.log(right);
        const up = new THREE.Vector3();
        up.crossVectors(right, cameraOrient);
        up.normalize();
        // console.log(up);
        const moveDelta = new THREE.Vector3();
        moveDelta.addScaledVector(right, mouseDeltaX);
        moveDelta.addScaledVector(up, mouseDeltaY);
        draggingObject.position.addVectors(dragStartObjectCoord, moveDelta);
    } else {
        if (intersects.length !== 0) {
            outlinePass.selectedObjects = [intersects[0].object];
        } else {
            outlinePass.selectedObjects = [];
        }
    }
});

worldDiv.addEventListener("mouseup", (e) => {
    draggingObject = null;
});

worldDiv.addEventListener("mousedown", (e) => {
    const intersects = GetIntersect(e);
    if (intersects.length !== 0) {
        draggingObject = intersects[0].object;
        const mouseX = e.offsetX - 500 / 2;
        const mouseY = 400 / 2 - e.offsetY;
        dragStartMouseCoord = [mouseX, mouseY];
        dragStartObjectCoord = draggingObject.position.clone();
    }
});

worldDiv.addEventListener("click", (e) => {
    const intersects = GetIntersect(e);
    if (intersects.length !== 0) {
        // localシーンを空にする
        localScene.children.filter((o) => o.name !== "helper").forEach((o) => localScene.remove(o));
        // クリックしたオブジェクトの複製を生成
        const obj = intersects[0].object.clone(true) as THREE.Mesh;
        // 位置と回転を初期化
        obj.position.set(0, 0, 0);
        obj.quaternion.set(0, 0, 0, 1);
        localScene.add(obj);
        // console.log(obj);
        const type = obj.geometry.type;
        document.getElementById("type").innerHTML = type;
        switch (type) {
            case "BoxGeometry":
                document.getElementById("size").innerHTML = "わからん";
                break;
            case "SphereGeometry":
                document.getElementById("size").innerHTML = "しらん";
                break;
        }
    }
});

function GetIntersect(event: MouseEvent): THREE.Intersection[] {
    const mouseX = event.offsetX - 500 / 2;
    const mouseY = 400 / 2 - event.offsetY;
    const position = {
        x: mouseX / (500 / 2),
        y: mouseY / (400 / 2),
    };
    raycaster.setFromCamera(position, worldCamera);
    return raycaster.intersectObjects(worldScene.children.filter((o) => o.name !== "helper"), true);
}

function Init() {
    worldRenderer.setSize(500, 400);
    worldRenderer.setClearColor(new THREE.Color(0xaabbcc));
    localRenderer.setSize(300, 200);
    localRenderer.setClearColor(new THREE.Color(0xccbbaa));
    worldDiv.appendChild(worldRenderer.domElement);
    localDiv.appendChild(localRenderer.domElement);
    // ヘルパ追加
    const worldAxesHelper = new THREE.AxesHelper(100);
    worldAxesHelper.name = "helper";
    worldScene.add(worldAxesHelper);
    const worldGridHelper = new THREE.GridHelper(100, 10, 0x0000ff, 0x808080);
    worldGridHelper.name = "helper";
    worldScene.add(worldGridHelper);
    const loaclAxesHelper = new THREE.AxesHelper(100);
    loaclAxesHelper.name = "helper";
    localScene.add(loaclAxesHelper);
    // カメラ調整
    worldCamera.position.set(500, 500, 500);
    worldCamera.lookAt(0, 0, 0);
    localCamera.position.set(100, 100, 100);
    localCamera.lookAt(0, 0, 0);
}
