import type { Animal } from '../entities/Animal';

export type GameEvents = {
    'animal:delivered': { animal: Animal };
}