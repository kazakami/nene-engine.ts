function FileLoad(url: string, callback: (str: string) => void): void {
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

function UndefCoalescing<T>(input: T, defaultValue: T): T {
    if (typeof input === "undefined") {
        return defaultValue;
    } else {
        return input;
    }
}

class PhysicObjectAttribute {
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

class PhysicObjectSphereAttribute extends PhysicObjectAttribute {
    public radius: number;
}

class PhysicObjectBoxAttribute extends PhysicObjectAttribute {
    public width: number;
    public height: number;
    public depth: number;
}

class PhysicObjectPlaneAttribute extends PhysicObjectAttribute {
}

export { FileLoad, UndefCoalescing };
export { PhysicObjectAttribute, PhysicObjectBoxAttribute, PhysicObjectPlaneAttribute, PhysicObjectSphereAttribute };
