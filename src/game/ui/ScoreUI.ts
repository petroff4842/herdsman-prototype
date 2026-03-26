import { Text } from 'pixi.js';
import { GAME_CONFIG, COLORS } from '../config';

export class ScoreUI {
	public view: Text;
	private score: number = 0;

	constructor() {
		this.view = new Text({
			text: 'Score: 0',
			style: {
				fill: COLORS.text,
				fontSize: GAME_CONFIG.score.fontSize,
			},
		});

		this.view.x = GAME_CONFIG.score.x;
		this.view.y = GAME_CONFIG.score.y;
	}


	public increment(): void {
		this.score += 1;
		this.view.text = `Score: ${this.score}`;
	}
}