import * as THREE from "three";
import { Scene, Start, Unit } from "../src/nene-engine";

class LoadScene extends Scene {

}

class Player extends Unit {
    private plane: THREE.Object3D;
}

const c = Start("initScene", new LoadScene());
