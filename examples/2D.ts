import * as THREE from "three";
import { Random, RandomColor, Scene, Start, Unit } from "../src/main";
import { TiledTexturedSprite } from "../src/TiledTexturedSprite";

class LoadScene extends Scene {
    public Init(): void {
        super.Init();
        this.core.LoadTexture("resources/images/png_alphablend_test.png", "circle");
        this.core.LoadTexture("resources/images/star.png", "star");
        this.core.LoadTexture("resources/images/fire.png", "fire");
        this.core.LoadTexture("resources/images/fires.png", "fires");
        this.core.LoadTexture("resources/images/knight.png", "knight");
        this.core.LoadTexture("resources/images/shadow.png", "shadow");
    }
    public Update(): void {
        super.Update();
        console.log(this.core.GetAllResourcesLoadingProgress());
        if (this.core.IsAllResourcesAvaiable()) {
            console.log("change");
            // オブジェクトenteが読み込まれればシーン遷移
            this.core.AddAndChangeScene("game", new GameScene());
        } else {
            console.log("now loading resources");
        }
    }
}

class GameScene extends Scene {
    public sprt: THREE.Sprite;
    public Init(): void {
        super.Init();
        this.backgroundColor = new THREE.Color(0x887766);
        this.sprt = this.core.MakeSpriteFromTexture("circle");
        this.sprt.scale.set(100, 100, 1);
        this.scene2d.add(this.sprt);
        this.AddUnit(new Chara(0, 0));
        this.onMouseClickCallback = () => {
            // this.core.SaveImage("ScreenShot.png");
        };
        this.onWindowResizeCallback = () => {
            this.core.ChangeCanvasSize(window.innerWidth, window.innerHeight);
        };
    }
    public Update(): void {
        super.Update();
        this.sprt.position.set(this.core.mouseX, this.core.mouseY, 1);
        if (this.core.IsKeyPressing("q")) {
            this.AddUnit(new Fire(this.core.mouseX, this.core.mouseY));
        }
    }
    public Draw(): void {
        super.Draw();
        this.core.DrawText(this.core.GetAllDownKey().join(), this.core.mouseX, this.core.mouseY);
    }
}

class Chara extends Unit {
    private sprite: THREE.Sprite;
    private mat: THREE.SpriteMaterial;
    private tex: THREE.Texture;
    private shadow: THREE.Sprite;
    private jumpingHeight = 0;
    private jumpingVel = 0;
    constructor(private x, private y) { super(); }
    public Init(): void {
        this.shadow = this.core.MakeSpriteFromTexture("shadow");
        this.shadow.scale.set(32, 16, 1);
        this.tex = this.core.GetTexture("knight").clone();
        this.tex.needsUpdate = true;
        this.tex.wrapS = this.tex.wrapT = THREE.RepeatWrapping;
        this.tex.repeat.set(1 / 5, 1);
        this.mat = new THREE.SpriteMaterial({map: this.tex});
        this.sprite = new THREE.Sprite(this.mat);
        this.sprite.scale.set(64, 64, 1);
        this.sprite.position.set(this.x, this.y, 1);
        this.shadow.position.set(this.x - 12, this.y - 32, 1);
        this.AddSprite(this.sprite);
        this.AddSprite(this.shadow);
    }
    public Update(): void {
        super.Update();
        this.tex.offset.x = 0;
        if (this.core.IsKeyDown("w")) {
            this.y += 3;
            this.tex.offset.x = (Math.floor(this.frame / 5) % 2) * 2 / 5;
        }
        if (this.core.IsKeyDown("s")) {
            this.y -= 3;
            this.tex.offset.x = (Math.floor(this.frame / 5) % 2) * 2 / 5;
        }
        if (this.core.IsKeyDown("d")) {
            this.x += 3;
            this.tex.offset.x = (Math.floor(this.frame / 5) % 2) * 2 / 5;
        }
        if (this.core.IsKeyDown("a")) {
            this.x -= 3;
            this.tex.offset.x = (Math.floor(this.frame / 5) % 2) * 2 / 5;
        }
        if (this.core.IsKeyDown("k")) {
            this.tex.offset.x += 1 / 5;
        }
        if (this.jumpingHeight !== 0) {
            this.tex.offset.x = 4 / 5;
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
        this.sprite.position.set(this.x, this.y + this.jumpingHeight, 1);
        this.shadow.position.set(this.x - 12, this.y - 32, 1);
    }
    public Fin(): void {
        this.tex.dispose();
        this.mat.dispose();
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
        super.Update();
        this.tts.SetTile(Math.floor(this.frame / 5), 0);
        if (this.frame > 100) {
            this.isAlive = false;
        }
    }
}

// ゲームの開始
Start("init", new LoadScene());
