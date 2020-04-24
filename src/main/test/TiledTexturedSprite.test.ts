import * as THREE from "three";
import { TiledTexturedSprite } from "../TiledTexturedSprite";

test("TiledTexturedSprite", () => {
    const tex = new THREE.Texture();
    const tts = new TiledTexturedSprite(tex);
    tts.SetTileNumber(5, 5);
    tts.SetTile(2, 3);
    expect(tts.tex.offset).toEqual(new THREE.Vector2(2 / 5, 3 / 5));
});
