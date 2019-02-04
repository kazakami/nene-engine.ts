import * as THREE from "three";

onmessage = (event: MessageEvent) => {
    const segX = 1024;
    const segY = 1024;
    const heights = (() => {
        const data = new Uint8Array(segX * segY);
        for (let h = 0; h < 200; h ++) {
            for (let i = 0; i < segX * segY; i++) {
                data[i] = Math.random() * 20;
            }
        }
        return data;
    })();
    postMessage(heights);
    // const g = new THREE.PlaneBufferGeometry();
    // postMessage(g.attributes.position, [(g.attributes.position.array as Float32Array)]);
};
