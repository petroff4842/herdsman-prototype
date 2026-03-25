import { Graphics } from 'pixi.js';
import { GAME_CONFIG, COLORS } from '../config';
import { Hero } from './Hero';

export type AnimalState = 'idle' | 'following';
export class Animal {
    public view: Graphics;
    public state: AnimalState = 'idle';

    constructor(x: number, y: number) {
        this.view = new Graphics();
        this.view.circle(0, 0, GAME_CONFIG.animal.radius);
        this.view.fill(COLORS.animal);
        this.view.x = x;
        this.view.y = y;
    }

    public tryStartFollowing(hero: Hero, followersCount: number): boolean {
        if (this.state !== 'idle' ||
            followersCount >= GAME_CONFIG.animal.maxFollowers) {
                return false;
        }

        const dx = hero.view.x - this.view.x;
        const dy = hero.view.y - this.view.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const pickupDistance = GAME_CONFIG.hero.radius + GAME_CONFIG.animal.radius + GAME_CONFIG.animal.pickupPadding;

        if (distance <= pickupDistance) {
            this.state = 'following';
            return true;
        }

        return false;
    }

    public follow(hero: Hero, index: number): void {
        if (this.state !== 'following') return;

        const dir = hero.getDirection();
        const spacing = GAME_CONFIG.animal.followSpacing;

        const targetX = hero.view.x - dir.x * (index + 1) * spacing;
        const targetY = hero.view.y - dir.y * (index + 1) * spacing;

        const dx = targetX - this.view.x;
        const dy = targetY - this.view.y;

        this.view.x += dx * GAME_CONFIG.animal.speed;
        this.view.y += dy * GAME_CONFIG.animal.speed;
    }
}