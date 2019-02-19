import * as THREE from "three";
import { Circle, Clamp, Figure, Point, Rectangle, Scene, Start, TiledTexturedSprite, Unit } from "../src/nene-engine";

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
        this.onKeyKeyDown = (e) => { e.preventDefault(); };
        this.onTouchMove = (e) => { e.preventDefault(); };
    }
    public Update(): void {
        if (this.core.IsAllResourcesAvailable()) {
            // オブジェクトenteが読み込まれればシーン遷移
            this.core.AddAndChangeScene("title", new TitleScene());
        }
    }
    public DrawText(): void {
        const [a, b] = this.core.GetAllResourcesLoadingProgress();
        this.FillText("Now Loading " + a + "/" + b, 0, 0);
    }
}

class TitleScene extends Scene {
    private selected: number = 0;
    public Init(): void {
        this.backgroundColor = new THREE.Color(0x667788);
        this.onKeyKeyDown = (e) => { e.preventDefault(); };
        this.onTouchMove = (e) => { e.preventDefault(); };
    }
    public Update(): void {
        if (this.core.IsKeyPressing("KeyH")) {
            this.core.AddAndChangeScene("game", new GameScene());
        }
    }
    public DrawText(): void {
        this.FillText("Press H key to start", -240, 0);
    }
}

class PauseScene extends Scene {
    private gameScene: GameScene;
    private sprite: THREE.Sprite;
    private spriteMat: THREE.SpriteMaterial;
    private selected: number = 0;
    constructor(gameScene: GameScene) {
        super();
        this.gameScene = gameScene;
    }
    public Init() {
        this.spriteMat = new THREE.SpriteMaterial({color: 0x888888});
        this.sprite = new THREE.Sprite(this.spriteMat);
        this.sprite.scale.set(this.core.screenSizeX, this.core.screenSizeY, 1);
        this.sprite.position.set(0, 0, 1);
        this.scene2d.add(this.sprite);
        this.onKeyKeyDown = (e) => { e.preventDefault(); };
        this.onTouchMove = (e) => { e.preventDefault(); };
    }
    public Update() {
        // このコメントを解除すれば裏でgameSceneが動く
        // this.gameScene.InnerUpdate();
        // this.gameScene.Update();
        this.gameScene.Render();
        this.spriteMat.map = this.gameScene.RenderedTexture();
        if (this.core.IsKeyPressing("Escape")) {
            this.core.ChangeScene("game");
        }
        if (this.core.IsKeyPressing("KeyW")) {
            this.selected--;
        }
        if (this.core.IsKeyPressing("KeyS")) {
            this.selected++;
        }
        this.selected = (this.selected + 2) % 2;
        if (this.core.IsKeyPressing("KeyH")) {
            switch (this.selected) {
                case 0:
                    this.core.ChangeScene("game");
                    break;
                case 1:
                    this.core.ChangeScene("title");
                    break;
            }
        }
    }
    public DrawText() {
        this.SetTextColor(new THREE.Color(0xffffff));
        this.FillText("Resume", 0, 0);
        this.FillText("Back to title", 0, -50);
        this.FillText("👉", -50, -50 * this.selected);
    }
}

class GameScene extends Scene {
    public sprt: THREE.Sprite;
    public Init(): void {
        this.core.AddScene("pause", new PauseScene(this));
        this.backgroundColor = new THREE.Color(0x887766);
        this.sprt = this.core.MakeSpriteFromTexture("circle");
        this.sprt.scale.set(100, 100, 1);
        this.scene2d.add(this.sprt);
        this.AddUnit(new Chara(0, 0));
        this.onMouseClick = () => {
            // this.core.SaveImage("ScreenShot.png");
        };
        this.onKeyKeyDown = (e) => { e.preventDefault(); };
        this.onTouchMove = (e) => { e.preventDefault(); };
    }
    public Update(): void {
        this.sprt.position.set(this.core.mouseX, this.core.mouseY, 1);
        if (this.core.IsKeyPressing("KeyQ")) {
            this.AddUnit(new Fire(this.core.mouseX, this.core.mouseY));
        }
        if (this.core.IsKeyPressing("Escape")) {
            this.core.ChangeScene("pause");
        }
    }
    public DrawText(): void {
        this.FillText(this.core.GetAllDownKey().join(), this.core.mouseX, this.core.mouseY);
        this.FillText("FPS: " + Math.round(this.core.fps).toString(),
            -this.core.screenSizeX / 2, this.core.screenSizeY / 2);
    }
}

class Chara extends Unit {
    private tts: TiledTexturedSprite;
    private shadow: THREE.Sprite;
    private jumpingHeight = 0;
    private jumpingVel = 0;
    private collide: Figure;
    constructor(private x: number, private y: number) { super(); }
    public Init(): void {
        this.tts = new TiledTexturedSprite(this.core.GetTexture("knight"));
        this.tts.SetTileNumber(5, 1);
        this.tts.sprite.scale.set(64, 64, 1);
        this.tts.sprite.position.set(this.x, this.y, 1);
        this.shadow = this.core.MakeSpriteFromTexture("shadow");
        this.shadow.scale.set(32, 16, 1);
        this.shadow.position.set(this.x - 12, this.y - 32, 1);
        this.collide = new Rectangle(this.x, this.y, 64, 64);
        this.collide.onCollideCallback = (f) => console.log(f.name);
        this.AddCollider(this.collide);
        this.AddSprite(this.collide);
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
        this.collide.x = this.x;
        this.collide.y = this.y + this.jumpingHeight;
        this.collide.SyncHelper();
        this.tts.sprite.position.set(this.x, this.y + this.jumpingHeight, 1);
        this.shadow.position.set(this.x - 12, this.y - 32, 1);
    }
}

class Fire extends Unit {
    public collide: Figure;
    private tts: TiledTexturedSprite;
    constructor(private x: number, private y: number) { super(); }
    public Init(): void {
        this.tts = new TiledTexturedSprite(this.core.GetTexture("fires"));
        this.tts.SetTileNumber(4, 1);
        this.tts.sprite.scale.set(32, 32, 1);
        this.tts.sprite.position.set(this.x, this.y, 1);
        // this.collide = new Rectangle(this.x, this.y, 32, 32);
        this.collide = new Circle(this.x, this.y, 16);
        // this.collide = new Point(this.x, this.y);
        this.collide.name = "fire";
        this.AddCollider(this.collide);
        this.AddSprite(this.collide);
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
const core = Start("init", new LoadScene(), {
    parent: document.getElementById("screen"),
    screenSizeX: 640,
    screenSizeY: 480,
});

const pause = document.getElementById("pause");
pause.onclick = () => {
    if (core.GetActiveSceneName() === "game") {
        if (core.GetScene("pause")) {
            core.ChangeScene("pause");
        }
    }
};

const title = document.getElementById("title");
title.onclick = () => {
    if (core.GetActiveSceneName() === "pause" || core.GetActiveSceneName() ===  "game") {
        if (core.GetScene("title")) {
            core.ChangeScene("title");
        }
    }
};
