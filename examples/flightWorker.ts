import * as THREE from "three";

onmessage = (event: MessageEvent) => {
    const segX = 1024;
    const segY = 1024;
    const heights = (() => {
        const data = new Uint8Array(segX * segY);
        for (let i = 0; i < segX * segY; i++) {
            data[i] = Math.random() * 20;
        }
        return data;
    })();
    postMessage({
        heights: heights,
    }, [
        // (groundGeo.attributes.normal.array as Float32Array),
        // (groundGeo.attributes.position.array as Float32Array),
        // (groundGeo.attributes.uv.array as Float32Array),
    ]);
};
