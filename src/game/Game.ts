import { Application } from "pixi.js";
import { Hero } from "./entities/Hero";

export class Game {
    private app: Application;
    private hero: Hero;


    constructor(application: Application) {
        this.app = application;
        this.hero = new Hero(this.app.renderer.width / 2, this.app.renderer.height / 2);
        this.app.stage.addChild(this.hero.view);
    }
}