import { Text } from 'pixi.js';
import { GAME_CONFIG, COLORS } from '../config';
import { EventEmitter } from '../core/EventEmitter';
import type { GameEvents } from '../types/GameEvents';

export class ScoreUI {
	public view: Text;
	private score: number = 0;

	constructor(emitter: EventEmitter<GameEvents>) {
		this.view = new Text({
			text: 'Score: 0',
			style: {
				fill: COLORS.text,
				fontSize: GAME_CONFIG.score.fontSize,
			},
		});

		this.view.x = GAME_CONFIG.score.x;
		this.view.y = GAME_CONFIG.score.y;

		emitter.on('animal:delivered', () => this.increment());
	}


	private increment(): void {
		this.score += 1;
		this.view.text = `Score: ${this.score}`;
	}
}