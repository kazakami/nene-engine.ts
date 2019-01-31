import * as THREE from "three";
import { Clamp, Figure, Rectangle, Scene, Start, TiledTexturedSprite, Unit } from "../src/nene-engine";

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
    }
    public Update(): void {
        this.sprt.position.set(this.core.mouseX, this.core.mouseY, 1);
        if (this.core.IsKeyPressing("KeyQ")) {
            this.AddUnit(new Fire(this.core.mouseX, this.core.mouseY));
        }
    }
    public DrawText(): void {
        this.core.DrawText(this.core.GetAllDownKey().join(), this.core.mouseX, this.core.mouseY);
        this.core.DrawText(Math.round(this.core.fps).toString(),
            -this.core.windowSizeX / 2, this.core.windowSizeY / 2);
    }
}

class Chara extends Unit {
    private tts: TiledTexturedSprite;
    private shadow: THREE.Sprite;
    private jumpingHeight = 0;
    private jumpingVel = 0;
    private figure: Figure;
    constructor(private x: number, private y: number) { super(); }
    public Init(): void {
        this.tts = new TiledTexturedSprite(this.core.GetTexture("knight"));
        this.tts.SetTileNumber(5, 1);
        this.tts.sprite.scale.set(64, 64, 1);
        this.tts.sprite.position.set(this.x, this.y, 1);
        this.shadow = this.core.MakeSpriteFromTexture("shadow");
        this.shadow.scale.set(32, 16, 1);
        this.shadow.position.set(this.x - 12, this.y - 32, 1);
        this.figure = new Rectangle(this.x, this.y, 64, 64);
        this.figure.GenerateHelper();
        this.AddSprite(this.figure);
        this.AddSprite(this.tts);
        this.AddSprite(this.shadow);
    }
    public Update(): void {
        this.tts.SetTile(0, 0);
        if (this.core.IsKeyDown("KeyW")) {
            this.y += 3;
            this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2, 0);
        }
        if (this.core.IsKeyDown("KeyS")) {
            this.y -= 3;
            this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2, 0);
        }
        if (this.core.IsKeyDown("KeyD")) {
            this.x += 3;
            this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2, 0);
        }
        if (this.core.IsKeyDown("KeyA")) {
            this.x -= 3;
            this.tts.SetTile((Math.floor(this.frame / 5) % 2) * 2, 0);
        }
        if (this.core.IsKeyDown("KeyK")) {
            this.tts.SetTile(1, 0);
            if (this.core.IsKeyDown("KeyA") || this.core.IsKeyDown("KeyS") ||
                this.core.IsKeyDown("KeyD") || this.core.IsKeyDown("KeyW")) {
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
        if (this.core.IsKeyDown("KeyJ") && this.jumpingHeight === 0) {
            this.jumpingVel = 5;
            this.jumpingHeight += this.jumpingVel;
        }
        this.x = Clamp(this.x, -300, 300);
        this.y = Clamp(this.y, -200, 200);
        this.figure.x = this.x;
        this.figure.y = this.y + this.jumpingHeight;
        this.figure.SyncHelper();
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
    parent: document.getElementById("screen"),
    windowSizeX: 640,
    windowSizeY: 480,
});
