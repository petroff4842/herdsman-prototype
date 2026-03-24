import { Application } from "pixi.js";
import { GAME_CONFIG, COLORS } from "./game/config";
import { Game } from "./game/Game";

async function main() {
    const app = new Application();

    await app.init({
        width: GAME_CONFIG.size.width,
        height: GAME_CONFIG.size.height,
        background: COLORS.background,
    });

    document.body.appendChild(app.canvas);
    
    new Game(app);
}

main();