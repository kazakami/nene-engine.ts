import * as THREE from "three";

export function Random(range: number) {
    return Math.random() * 2 * range - range;
}

export function RandomColor(): THREE.Color {
    return new THREE.Color(Math.random(), Math.random(), Math.random());
}

export function Base64toBlob(base64: string, type: string): Blob {
    const decodedData = atob(base64);
    const buffer = new Uint8Array(decodedData.length);
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < decodedData.length; i++) {
        buffer[i] = decodedData.charCodeAt(i);
    }
    return new Blob([buffer.buffer], {
        type: type,
    });
}

const up = new THREE.Vector3(0, 1, 0);

export function OrientQuaternion(x: number, y: number, z: number): THREE.Quaternion {
    const normal = new THREE.Vector3(x, y, z).normalize();
    const dir = new THREE.Vector3();
    dir.crossVectors(up, normal).normalize();
    const dot = up.dot(normal);
    const rad = Math.acos(dot);
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(dir, rad);
    return q;
}

export function FileLoad(url: string, callback: (str: string) => void): void {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.addEventListener("load", (event) => {
        const response = this.response;
        if (status === "200") {
            callback(response);
        } else {
            console.log("error");
        }
    }, false);
    return;
}

export function UndefCoalescing<T>(input: T, defaultValue: T): T {
    if (typeof input === "undefined") {
        return defaultValue;
    } else {
        return input;
    }
}

export function NullCoalescing<T>(input: T, defaultValue: T): T {
    if (input === null) {
        return defaultValue;
    } else {
        return input;
    }
}

export function Coalescing<T>(input: T, defaultValue: T): T {
    if (typeof input === "undefined" || input === null) {
        return defaultValue;
    } else {
        return input;
    }
}

export class PhysicObjectAttribute {
    public name?: string;
    public type: "plane" | "sphere" | "box";
    public x: number;
    public y: number;
    public z: number;
    public mass: number;
    public axisx?: number;
    public axisy?: number;
    public axisz?: number;
    public angle?: number;
}

export class PhysicObjectSphereAttribute extends PhysicObjectAttribute {
    public radius: number;
}

export class PhysicObjectBoxAttribute extends PhysicObjectAttribute {
    public width: number;
    public height: number;
    public depth: number;
}

export class PhysicObjectPlaneAttribute extends PhysicObjectAttribute {
}
