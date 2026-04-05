import type { Animal } from "../entities/Animal";
import { GAME_CONFIG } from "../config";
import type { GameEvents } from "../types/GameEvents";
import { EventEmitter } from "../core/EventEmitter";

export interface IAnimalState {
	enter(animal: Animal): void;
	update(animal: Animal, delta: number): IAnimalState | null;
}

export class IdleState implements IAnimalState {
	enter(animal: Animal): void {
		animal.getRandomPatrolTarget(GAME_CONFIG.size.width, GAME_CONFIG.size.height);
	}

	update(animal: Animal, delta: number): IAnimalState | null {
		const dx = animal.getHeroPosition().x - animal.view.x;
		const dy = animal.getHeroPosition().y - animal.view.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const pickupDistance = GAME_CONFIG.hero.radius + GAME_CONFIG.animal.radius + GAME_CONFIG.animal.pickupPadding;
		if (distance < pickupDistance && !animal.isHeroFull) {
			return new FollowingState();
		}
		animal.patrol(delta);
		return null;
	}
}

export class FollowingState implements IAnimalState {
	enter(_animal: Animal): void { }

	update(_animal: Animal, _delta: number): IAnimalState | null {
		return null;
	}
}

export class AnimalStateMachine {
	private current: IAnimalState;
	private emitter: EventEmitter<GameEvents>;

	constructor(initial: IAnimalState, emitter: EventEmitter<GameEvents>) {
		this.current = initial;
		this.emitter = emitter;
	}

	get stateName(): string {
		return this.current.constructor.name;
	}

	update(animal: Animal, delta: number): void {
		const next = this.current.update(animal, delta);
		if (next) {
			this.current = next;
			this.current.enter(animal);

			if (next instanceof FollowingState) {
				this.emitter.emit('animal:collected', { animal });
			}
		}
	}
}