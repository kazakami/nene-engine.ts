import * as THREE from "three";
import { Random, RandomColor, Scene, Start, TiledTexturedSprite, Unit } from "../src/nene-engine";

class LoadScene extends Scene {
    public Init(): void {
        this.backgroundColor = new THREE.Color(0x887766);
        this.onLoadError = (e) => { console.log(e); };
        this.core.LoadTexture("resources/images/png_alphablend_test.png", "circle");
        this.core.LoadTexture("resources/images/star.png", "star");
        this.core.LoadTexture("resources/images/fire.png", "fire");
        this.core.LoadTexture("resources/images/fires.png", "fires");
        this.core.LoadTexture("resources/images/knight.png", "knight");
        this.core.LoadTexture("resources/images/shadow.png", "shadow");
    }
    public Update(): void {
        if (this.core.IsAllResourcesAvailable()) {
            // オブジェクトenteが読み込まれればシーン遷移
            this.core.AddAndChangeScene("game", new GameScene());
        }
    }
    public DrawText(): void {
        const [a, b] = this.core.GetAllResourcesLoadingProgress();
        this.core.DrawText("Now Loading " + a + "/" + b, 0, 0);
    }
}

class GameScene extends Scene {
    public sprt: THREE.Sprite;
    public Init(): void {
        this.backgroundColor = new THREE.Color(0x887766);
        this.sprt = this.core.MakeSpriteFromTexture("circle");
        this.sprt.scale.set(100, 100, 1);
        this.scene2d.add(this.sprt);
        this.AddUnit(new Chara(0, 0));
        this.onMouseClick = () => {
            // this.core.SaveImage("ScreenShot.png");
        };
        this.onWindowResize = () => {
            this.core.ChangeCanvasSize(window.innerWidth, window.innerHeight);
        };
    }
    public Update(): void {
        this.sprt.position.set(this.core.mouseX, this.core.mouseY, 1);
        if (this.core.IsKeyPressing("q")) {
            this.AddUnit(new Fire(this.core.mouseX, this.core.mouseY));
        }
    }
    public DrawText(): void {
        this.core.DrawText(this.core.GetAllDownKey().join(), this.core.mouseX, this.core.mouseY);
    }
}

class Chara extends Unit {
    private tts: TiledTexturedSprite;
    private shadow: THREE.Sprite;
    private jumpingHeight = 0;
    private jumpingVel = 0;
    constructor(private x, private y) { super(); }
    public Init(): void {
        this.tts = new TiledTexturedSprite(this.core.GetTexture("knight"));
        this.tts.SetTileNumber(5, 1);
        this.tts.sprite.scale.set(64, 64, 1);
        this.tts.sprite.position.set(this.x, this.y, 1);
        this.shadow = this.core.MakeSpriteFromTexture("shadow");
        this.shadow.scale.set(32, 16, 1);
        this.shadow.position.set(this.x - 12, this.y - 32, 1);
        this.AddSprite(this.tts);
        this.AddSprite(this.shadow);
    }
    public Update(): void {
        this.tts.SetTile(0, 0);
        if (this.core.IsKeyDown("w")) {
            this.y += 3;
            this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2, 0);
        }
        if (this.core.IsKeyDown("s")) {
            this.y -= 3;
            this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2, 0);
        }
        if (this.core.IsKeyDown("d")) {
            this.x += 3;
            this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2, 0);
        }
        if (this.core.IsKeyDown("a")) {
            this.x -= 3;
            this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2, 0);
        }
        if (this.core.IsKeyDown("k")) {
            this.tts.SetTile(1, 0);
            if (this.core.IsKeyDown("a") || this.core.IsKeyDown("s") ||
                this.core.IsKeyDown("d") || this.core.IsKeyDown("w")) {
                    this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2 + 1, 0);
            }
        }
        if (this.jumpingHeight !== 0) {
            this.tts.SetTile(4, 0);
            this.jumpingVel -= 0.2;
            this.jumpingHeight += this.jumpingVel;
            if (this.jumpingHeight < 0) {
                this.jumpingHeight = 0;
                this.jumpingVel = 0;
            }
        }
        if (this.core.IsKeyDown("j") && this.jumpingHeight === 0) {
            this.jumpingVel = 5;
            this.jumpingHeight += this.jumpingVel;
        }
        this.tts.sprite.position.set(this.x, this.y + this.jumpingHeight, 1);
        this.shadow.position.set(this.x - 12, this.y - 32, 1);
    }
}

class Fire extends Unit {
    private tts: TiledTexturedSprite;
    constructor(private x, private y) { super(); }
    public Init(): void {
        this.tts = new TiledTexturedSprite(this.core.GetTexture("fires"));
        this.tts.SetTileNumber(4, 1);
        this.tts.sprite.scale.set(32, 32, 1);
        this.tts.sprite.position.set(this.x, this.y, 1);
        this.AddSprite(this.tts);
    }
    public Update(): void {
        this.tts.SetTile(Math.floor(this.frame / 5), 0);
        if (this.frame > 100) {
            this.isAlive = false;
        }
    }
}

// ゲームの開始
Start("init", new LoadScene(), {
    antialias: true,
});
