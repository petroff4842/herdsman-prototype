import { GAME_CONFIG } from "../config";
import { Animal } from "../entities/Animal";
import { Yard } from "../entities/Yard";
import type { Position } from "../types/Position";

export class AnimalSpawner {
	private spawnTimer: number = 0;
	private nextSpawnTime = this.getRandomSpawnInterval();
	private fieldWidth: number;
	private fieldHeight: number;

	constructor(viewWidth: number, viewHeight: number) {
		this.fieldWidth = viewWidth;
		this.fieldHeight = viewHeight;
	}

	private getRandomSpawnInterval(): number {
		const { minInterval, maxInterval } = GAME_CONFIG.spawner;
		return minInterval + Math.random() * (maxInterval - minInterval);
	}

	public update(delta: number, heroPosition: Position, yard: Yard, animals: Animal[]): Animal | null {
		if (animals.length >= GAME_CONFIG.animal.maxCountOnField) {
			return null;
		}
		this.spawnTimer += delta;
		if (this.spawnTimer < this.nextSpawnTime) {
			return null;
		}
		this.spawnTimer = 0;
		this.nextSpawnTime = this.getRandomSpawnInterval();
		return this.spawnNow(heroPosition, yard, animals);
	}

	public spawnNow(heroPosition: Position, yard: Yard, animals: Animal[]): Animal | null {
		if (animals.length >= GAME_CONFIG.animal.maxCountOnField) {
			return null;
		}

		const position = this.getRandomAnimalPosition(heroPosition, animals, yard);

		if (!position) {
			return null;
		}

		return new Animal(position);
	}

	private getRandomAnimalPosition(heroPosition: Position, animals: Animal[], yard: Yard): Position | null {
		const padding = GAME_CONFIG.animal.boundPadding;

		for (let attempt = 0; attempt < GAME_CONFIG.spawner.maxSpawnAttempts; attempt++) {
			// indents from field's borders
			const x = padding + Math.random() * (this.fieldWidth - padding * 2);
			const y = padding + Math.random() * (this.fieldHeight - padding * 2);

			// check if animal is inside the yard including padding
			const isInsideYard = yard.contains(x, y, padding);

			// check if animal is to close to Hero including padding
			const dx = x - heroPosition.x;
			const dy = y - heroPosition.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const minDistance = GAME_CONFIG.hero.radius + GAME_CONFIG.animal.radius + padding ;
			const isTooCloseToHero = distance < minDistance;

			// check if animals are too close to each other
			const isTooCloseToOtherAnimals = animals.some((animal) => {
				const dx = x - animal.view.x;
				const dy = y - animal.view.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				const minDistance = GAME_CONFIG.animal.radius * 2 + padding;

				return distance < minDistance;
			});

			if (!isInsideYard && !isTooCloseToHero && !isTooCloseToOtherAnimals) {
				return { x, y };
			}
		}
		return null;
	}
}