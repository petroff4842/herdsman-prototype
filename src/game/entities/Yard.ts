import { Graphics } from "pixi.js";
import { GAME_CONFIG, COLORS } from "../config";

export class Yard {
    public view: Graphics;

    constructor(x: number, y: number) {
        this.view = new Graphics();
        this.view.rect(x, y, GAME_CONFIG.yard.width, GAME_CONFIG.yard.height);
        this.view.fill(COLORS.yard);
        this.view.x = x;
        this.view.y = y;
    }
}