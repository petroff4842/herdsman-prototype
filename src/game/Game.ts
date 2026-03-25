import { Application } from "pixi.js";
import { Hero } from "./entities/Hero";
import { Yard } from "./entities/Yard";

export class Game {
    private app: Application;
    private hero: Hero;
    private yard: Yard

    constructor(application: Application) {
        this.app = application;
        this.hero = new Hero(this.app.renderer.width / 2, this.app.renderer.height / 2);
        this.yard = new Yard(0, 0);

        this.setupScene();
        this.setupInput();
        this.setupLoop();
    }

    private setupScene(): void {
        this.app.stage.addChild(this.yard.view);
        this.app.stage.addChild(this.hero.view);
    }

    private setupInput(): void {
        this.app.canvas.addEventListener("click", (event) => {
            const rect = this.app.canvas.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            this.hero.moveTo(x, y);
        });
    }

    private setupLoop(): void {
        this.app.ticker.add(() => {
            this.hero.update();
        });
    }
}