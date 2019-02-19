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
    const groundGeo = new THREE.PlaneBufferGeometry(30000, 30000, segX - 1, segY - 1);
    const vertices = groundGeo.attributes.position.array;
    const num = vertices.length;
    for (let i = 0; i < num; i++) {
        groundGeo.attributes.position.setZ(i, heights[i]);
    }
    groundGeo.computeVertexNormals();
    postMessage({
        normal: groundGeo.attributes.normal.array,
        normalCount: groundGeo.attributes.normal.count,
        position: groundGeo.attributes.position.array,
        positionCount: groundGeo.attributes.position.count,
        uv: groundGeo.attributes.uv.array,
        uvCount: groundGeo.attributes.uv.count,
    }, [
            // (groundGeo.attributes.normal.array as Float32Array),
            // (groundGeo.attributes.position.array as Float32Array),
            // (groundGeo.attributes.uv.array as Float32Array),
        ]);
};
