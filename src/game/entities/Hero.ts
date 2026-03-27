import { Graphics } from "pixi.js";
import { GAME_CONFIG, COLORS } from "../config";
import type { Position } from "../types/Position";
import type { Vector } from "../types/Vector";

export class Hero {
    public view: Graphics;
    private targetX: number;
    private targetY: number;
    private direction: Vector = { x: 0, y: 0 };

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

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < GAME_CONFIG.hero.reachTargetThreshold) {
            this.view.x = this.targetX;
            this.view.y = this.targetY;
            return;
        }

        this.direction = {
            x: dx / distance,
            y: dy / distance,
        };

        this.view.x += dx * GAME_CONFIG.hero.speed;
        this.view.y += dy * GAME_CONFIG.hero.speed;
    }

    public getPosition(): Position {
        return {
            x: this.view.x,
            y: this.view.y,
        };
    }

    public getDirection(): Vector {
        return this.direction;
    }
}