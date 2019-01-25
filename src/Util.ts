import * as THREE from "three";

/**
 * 入力された値inputを[min, max]の範囲に丸める
 * @param input 丸める入力
 * @param min 最小値
 * @param max 最大値
 */
export function Clamp(input: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, input));
}

/**
 * 与えられたObject3Dが子孫として持つ全てのMeshに対して処理を行う
 * @param obj Object3D
 * @param func Meshに対して行う処理
 */
export function EachMesh(obj: THREE.Object3D, func: (mesh: THREE.Mesh) => void): void {
    if ((obj as THREE.Mesh).isMesh) {
        return func(obj as THREE.Mesh);
    } else {
        return obj.children.forEach((o) => EachMesh(o, func));
    }
}

/**
 * 連想配列の全ての要素がNullでもUndefinedでもなければtrueを返す
 * @param arr 調べる連想配列
 */
export function AllIsNotNullOrUndefined<T>(arr: {[key: string]: T}): boolean {
    for (const key in arr) {
        if (arr[key] === null || arr[key] === undefined) {
            return false;
        }
    }
    return true;
}

/**
 * 連想配列を配列にする
 * @param arr 連想配列
 */
export function AssociativeArrayToArray<T>(arr: {[key: string]: T}): T[] {
    const a: T[] = [];
    for (const key in arr ) {
        a.push(arr[key]);
    }
    return a;
}

/**
 * [-range, range]の間の一様分布乱数
 * @param range 範囲
 */
export function Random(range: number): number {
    return Math.random() * 2 * range - range;
}

/**
 * ランダムな色を返す
 */
export function RandomColor(): THREE.Color {
    return new THREE.Color(Math.random(), Math.random(), Math.random());
}

/**
 * Base64形式のデータからBlobを生成する
 * @param base64 Base64形式のデータ
 * @param type ファイル形式
 */
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

/**
 * (0, 1, 0)向いていたものを指定した方向へ向けるための四元数を返す
 * @param x 指定する方向のx座標
 * @param y 指定する方向のy座標
 * @param z 指定する方向のz座標
 */
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

/**
 * Undefined合体関数
 * @param input 入力
 * @param defaultValue Undefinedの場合に返すデフォルト値
 */
export function UndefCoalescing<T>(input: T, defaultValue: T): T {
    if (typeof input === "undefined") {
        return defaultValue;
    } else {
        return input;
    }
}

/**
 * Null合体関数
 * @param input 入力
 * @param defaultValue Nullの場合に返すデフォルト値
 */
export function NullCoalescing<T>(input: T, defaultValue: T): T {
    if (input === null) {
        return defaultValue;
    } else {
        return input;
    }
}

/**
 * NullもしくはUndefined合体関数
 * @param input 入力
 * @param defaultValue NullもしくはUndefinedの場合に返すデフォルト値
 */
export function Coalescing<T>(input: T, defaultValue: T): T {
    if (typeof input === "undefined" || input === null) {
        return defaultValue;
    } else {
        return input;
    }
}

/**
 * 真偽値を文字列に変換する
 * @param b 文字列に変換する真偽値
 */
export function BooleanToString(b: boolean): string {
    return b ? "true" : "false";
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
