import * as THREE from "three";

const worldDiv = document.getElementById("world");
const localDiv = document.getElementById("local");

const worldRenderer = new THREE.WebGLRenderer({ antialias: true });
const localRenderer = new THREE.WebGLRenderer({ antialias: true });

const worldScene = new THREE.Scene();
const localScene = new THREE.Scene();

const worldCamera = new THREE.OrthographicCamera(-250, 250, 200, -200, 0.1, 1000);
const localCamera = new THREE.OrthographicCamera(-150, 150, 100, -100, 0.1, 1000);

Init();

const animate = () => {
    requestAnimationFrame(animate);
    worldRenderer.render(worldScene, worldCamera);
    localRenderer.render(localScene, localCamera);
};
animate();

document.getElementById("addBox").onclick = () => {
    worldScene.add(new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), new THREE.MeshPhongMaterial()));
};
document.getElementById("addSphere").onclick = () => {
    worldScene.add(new THREE.Mesh(new THREE.SphereGeometry(50), new THREE.MeshPhongMaterial()));
};

function Init() {
    worldRenderer.setSize(500, 400);
    worldRenderer.setClearColor(new THREE.Color(0xaabbcc));
    localRenderer.setSize(300, 200);
    worldDiv.appendChild(worldRenderer.domElement);
    localDiv.appendChild(localRenderer.domElement);
    worldScene.add(new THREE.AxesHelper(100));
    worldScene.add(new THREE.GridHelper(100, 10, 0x0000ff, 0x808080));
    localScene.add(new THREE.AxesHelper(100));
    worldCamera.position.set(500, 500, 500);
    worldCamera.lookAt(0, 0, 0);
    localCamera.position.set(100, 100, 100);
    localCamera.lookAt(0, 0, 0);
}
