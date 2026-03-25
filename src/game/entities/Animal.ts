import { Graphics } from 'pixi.js';
import { GAME_CONFIG, COLORS } from '../config';

export class Animal {
    public view: Graphics;

    constructor(x: number, y: number) {
        this.view = new Graphics();
        this.view.circle(0, 0, GAME_CONFIG.animal.radius);
        this.view.fill(COLORS.animal);
        this.view.x = x;
        this.view.y = y;
    }
}