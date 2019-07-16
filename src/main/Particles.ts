import * as THREE from "three";

export class Particles {
    private geo: THREE.BufferGeometry;
    private particlesNum: number;
    private mat: THREE.PointsMaterial;
    private points: THREE.Points;
    constructor() { return; }

    public GenerateParticles(num: number): void {
        this.geo = new THREE.BufferGeometry();
        this.particlesNum = num;
        const points = new Array<number>(this.particlesNum * 3);
        const colors = new Array<number>(this.particlesNum * 3);
        this.geo.addAttribute("position", new THREE.Float32BufferAttribute(points, 3));
        this.geo.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        // this.geo.computeBoundingSphere();
        this.mat = new THREE.PointsMaterial({
            depthWrite: false,
            transparent: true,
            vertexColors: THREE.VertexColors,
        });
        this.points = new THREE.Points(this.geo, this.mat);
    }

    public GetParticlesNum(): number {
        return this.particlesNum;
    }

    public GetPosition(index: number): [number, number, number] {
        return [
            this.geo.attributes.position.getX(index),
            this.geo.attributes.position.getY(index),
            this.geo.attributes.position.getZ(index),
        ];
    }

    public GetColor(index: number): [number, number, number] {
        return [
            this.geo.attributes.color.getX(index),
            this.geo.attributes.color.getY(index),
            this.geo.attributes.color.getZ(index),
        ];
    }

    public SetGlobalPosition(x: number, y: number, z: number): void {
        this.points.position.set(x, y, z);
    }

    public SetPosition(index: number, x: number, y: number, z: number, update: boolean = true): void {
        this.geo.attributes.position.setXYZ(index, x, y, z);
        if (update) {
            (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
            // this.geo.computeBoundingSphere();
        }
    }

    public SetColor(index: number, x: number, y: number, z: number, update: boolean = true): void {
        this.geo.attributes.color.setXYZ(index, x, y, z);
        if (update) {
            (this.geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
        }
    }

    public SetPointDisable(index: number): void {
        this.geo.attributes.position.setX(index, NaN);
    }

    public IsPointDisable(index: number): boolean {
        return isNaN(this.geo.attributes.position.getX(index));
    }

    public GeometryUpdate(): void {
        (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (this.geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
        // this.geo.computeBoundingSphere();
    }

    public get particle(): THREE.Points {
        return this.points;
    }

    public get material(): THREE.PointsMaterial {
        return this.mat;
    }

    public Update(): void {
        return;
    }

    public Fin(): void {
        this.geo.dispose();
        this.mat.dispose();
    }
}
