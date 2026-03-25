import { Graphics } from "pixi.js";
import { GAME_CONFIG, COLORS } from "../config";

export class Hero {
    public view: Graphics;
    private targetX: number;
    private targetY: number;

    constructor(x: number, y: number) {
        this.view = new Graphics();
        this.view.circle(0, 0, GAME_CONFIG.hero.radius);
        this.view.fill(COLORS.hero);
        this.view.x = x;
        this.view.y = y;
        this.targetX = x;
        this.targetY = y;
    }

    public moveTo(x: number, y: number): void {
        this.targetX = x;
        this.targetY = y;
    }

    public update(): void {
        const dx = this.targetX - this.view.x;
        const dy = this.targetY - this.view.y;
        this.view.x += dx * GAME_CONFIG.hero.speed;
        this.view.y += dy * GAME_CONFIG.hero.speed;
    }

    public getDirection(): { x: number; y: number } {
        const dx = this.targetX - this.view.x;
        const dy = this.targetY - this.view.y;

        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) {
            return { x: 0, y: 0 };
        }

        return {
            x: dx / length,
            y: dy / length,
        };
    }
}