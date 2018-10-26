import { FileLoader } from "three";

const loader = new FileLoader();
loader.load("hoge.txt", (str) => { console.log(str); });
