import { Graphics } from 'pixi.js';
import { GAME_CONFIG, COLORS } from '../config';
import type { Position } from '../types/Position';
import type { Vector } from '../types/Vector';
import { AnimalStateMachine, IdleState } from '../states/AnimalStateMachine';
import type { GameEvents } from '../types/GameEvents';
import { EventEmitter } from "../core/EventEmitter";

type IsInsideYard = (x: number, y: number, padding?: number) => boolean;

export class Animal {
    public view: Graphics;
    private patrolTarget: Position;
    private isInsideYardFn: IsInsideYard;
    private heroPosition: Position;
    private stateMachine: AnimalStateMachine;
    public isHeroFull: boolean = false;

    constructor(position: Position, isInsideYard: IsInsideYard, emitter: EventEmitter<GameEvents>) {
        this.view = new Graphics();
        this.heroPosition = { x: 0, y: 0 };
        this.stateMachine = new AnimalStateMachine(new IdleState(), emitter);
        this.view.circle(0, 0, GAME_CONFIG.animal.radius);
        this.view.fill(COLORS.animal);
        this.view.x = position.x;
        this.view.y = position.y;
        this.patrolTarget = position;
        this.isInsideYardFn = isInsideYard;
        this.getRandomPatrolTarget(GAME_CONFIG.size.width, GAME_CONFIG.size.height);
    }

    public follow(targetPosition: Position, direction: Vector, index: number, delta: number): void {
        if (!this.isFollowing) return;

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
        this.heroPosition = avoidHeroPosition;
        this.isHeroFull = isHeroFull;
        if (this.isFollowing) {
            return;
        }
        this.stateMachine.update(this, delta);
    }

    public getRandomPatrolTarget(width: number, height: number): void {
        const padding = GAME_CONFIG.animal.boundPadding;
        this.patrolTarget = {
            x: padding + Math.random() * (width - padding * 2),
            y: padding + Math.random() * (height - padding * 2)
        };
    }

    public patrol(delta: number): void {
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

        // yard area avoidance
        if (this.isInsideYardFn(nextX, nextY, GAME_CONFIG.animal.boundPadding)) {
            this.getRandomPatrolTarget(GAME_CONFIG.size.width, GAME_CONFIG.size.height);
            return;
        }

        // Hero avoidance
        if (!this.isHeroFull) {
            const heroDx = nextX - this.heroPosition.x;
            const heroDy = nextY - this.heroPosition.y;
            const distanceToHero = Math.sqrt(heroDx * heroDx + heroDy * heroDy);
            const minDistanceToHero = GAME_CONFIG.hero.radius + GAME_CONFIG.animal.radius + GAME_CONFIG.animal.boundPadding;

            if (distanceToHero < minDistanceToHero) {
                this.getRandomPatrolTarget(GAME_CONFIG.size.width, GAME_CONFIG.size.height);
                return;
            }
        }

        this.view.x = nextX;
        this.view.y = nextY;
    }

    getHeroPosition(): Position {
        return this.heroPosition;
    }

    get isFollowing(): boolean {
        return this.stateMachine.stateName === 'FollowingState';
    }
}