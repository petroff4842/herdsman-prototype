import { Graphics } from "pixi.js";
import { GAME_CONFIG, COLORS } from "../config";

export class Hero {
    public view: Graphics;

    constructor(x: number, y: number) {
        this.view = new Graphics();
        this.view.circle(0, 0, GAME_CONFIG.hero.radius);
        this.view.fill(COLORS.hero);
        this.view.x = x;
        this.view.y = y;
    }
}