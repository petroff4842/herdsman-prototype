import { Graphics } from 'pixi.js';
import { GAME_CONFIG, COLORS } from '../config';
import type { Position } from '../types/Position';
import type { Vector } from '../types/Vector';

type IsInsideYard = (x: number, y: number, padding?: number) => boolean;

export type AnimalState = 'idle' | 'following';

export class Animal {
    public view: Graphics;
    public state: AnimalState = 'idle';
    private patrolTarget: Position;
    private isInsideYardFn: IsInsideYard;

    constructor(position: Position, isInsideYard: IsInsideYard) {
        this.view = new Graphics();
        this.view.circle(0, 0, GAME_CONFIG.animal.radius);
        this.view.fill(COLORS.animal);
        this.view.x = position.x;
        this.view.y = position.y;
        this.patrolTarget = position;
        this.isInsideYardFn = isInsideYard;
        this.getRandomPatrolTarget(GAME_CONFIG.size.width, GAME_CONFIG.size.height);
    }

    public tryStartFollowing(heroPosition: Position, followersCount: number): boolean {
        if (this.state !== 'idle' ||
            followersCount >= GAME_CONFIG.animal.maxFollowers) {
            return false;
        }

        const dx = heroPosition.x - this.view.x;
        const dy = heroPosition.y - this.view.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const pickupDistance = GAME_CONFIG.hero.radius + GAME_CONFIG.animal.radius + GAME_CONFIG.animal.pickupPadding;

        if (distance <= pickupDistance) {
            this.state = 'following';
            return true;
        }

        return false;
    }

    public follow(targetPosition: Position, direction: Vector, index: number, delta: number): void {
        if (this.state !== 'following') return;

        const spacing = GAME_CONFIG.animal.followSpacing;

        const targetX = targetPosition.x - direction.x * (index + 1) * spacing;
        const targetY = targetPosition.y - direction.y * (index + 1) * spacing;

        const dx = targetX - this.view.x;
        const dy = targetY - this.view.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < GAME_CONFIG.animal.reachTargetThreshold) {
            this.view.x = targetX;
            this.view.y = targetY;
            return;
        }

        const dirX = dx / distance;
        const dirY = dy / distance;

        const step = Math.min(GAME_CONFIG.animal.speed * delta, distance);

        this.view.x += dirX * step;
        this.view.y += dirY * step;
    }

    public update(delta: number, avoidHeroPosition: Position, isHeroFull: boolean): void {
        if (this.state !== 'idle') {
            return;
        }

        const dx = this.patrolTarget.x - this.view.x;
        const dy = this.patrolTarget.y - this.view.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < GAME_CONFIG.animal.reachTargetThreshold) {
            this.getRandomPatrolTarget(GAME_CONFIG.size.width, GAME_CONFIG.size.height);
            return;
        }

        const dirX = dx / distance;
        const dirY = dy / distance;

        const step = Math.min(GAME_CONFIG.animal.patrolSpeed * delta, distance);

        const nextX = this.view.x + dirX * step;
        const nextY = this.view.y + dirY * step;

        // avoidance of the yard area        
        if (this.isInsideYardFn(nextX, nextY, GAME_CONFIG.animal.boundPadding)) {
            this.getRandomPatrolTarget(GAME_CONFIG.size.width, GAME_CONFIG.size.height);
            return;
        }

        //avoidance Hero
        const heroDx = nextX - avoidHeroPosition.x;
        const heroDy = nextY - avoidHeroPosition.y;
        const distanceToHero = Math.sqrt(heroDx * heroDx + heroDy * heroDy);
        const minDistanceToHero = GAME_CONFIG.hero.radius + GAME_CONFIG.animal.radius + GAME_CONFIG.animal.boundPadding
        if (distanceToHero < minDistanceToHero && !isHeroFull) {
            this.getRandomPatrolTarget(GAME_CONFIG.size.width, GAME_CONFIG.size.height);
            return;
        }

        this.view.x = nextX;
        this.view.y = nextY;
    }

    private getRandomPatrolTarget(width: number, height: number): void {
        const padding = GAME_CONFIG.animal.boundPadding;
        this.patrolTarget = {
            x: padding + Math.random() * (width - padding * 2),
            y: padding + Math.random() * (height - padding * 2)
        };
    }
}