export const GAME_CONFIG = {
    size: {
        width: 1000,
        height: 700,
    },
    hero: {
        radius: 20,
        speed: 0.1
    },
    yard: {
        width: 140,
        height: 100
    },
    animal: {
        radius: 10,
		count: 10,
		boundPadding: 30,
		maxFollowers: 5,
		pickupPadding: 20,
		followSpacing: 40,
		speed: 0.1,
		maxCountOnField: 50
    },
	score: {
		x: 20,
		y: 20,
		fontSize: 24
	},
	spawner: {
        minInterval: 1,
        maxInterval: 4,
        maxSpawnAttempts: 50,
	}
};

export const COLORS = {
    background: "0x4caf50",
    hero: "0xff0000",
    yard: "0xffff00",
    animal: '0xffffff',
	text: '0x000000'
};