import type { Animal } from '../entities/Animal';

export type GameEvents = {
	'animal:collected': { animal: Animal },
    'animal:scored': { animal: Animal }
}