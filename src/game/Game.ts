import { Application } from "pixi.js";
import { Hero } from "./entities/Hero";
import { Yard } from "./entities/Yard";
import { Animal } from "./entities/Animal";
import { GAME_CONFIG } from "./config";
import { ScoreUI } from "./ui/ScoreUI";

export class Game {
    private app: Application;
    private hero: Hero;
    private yard: Yard;
    private animals: Animal[] = [];
    private followers: Animal[] = [];
    private scoreUI: ScoreUI;

    constructor(application: Application) {
        this.app = application;
        this.hero = new Hero(this.app.renderer.width / 2, this.app.renderer.height / 2);
        this.yard = new Yard(0, 0);
        this.scoreUI = new ScoreUI();

        this.setupScene();
        this.setupInput();
        this.setupLoop();
        this.createAnimals();
    }

    private setupScene(): void {
        this.app.stage.addChild(this.yard.view);
        this.app.stage.addChild(this.hero.view);
        this.app.stage.addChild(this.scoreUI.view);
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
            this.collectAnimals();
            this.updateFollowers();
            this.deliverAnimals();
        });
    }

    private createAnimals(): void {
        for (let i = 0; i < GAME_CONFIG.animal.count; i++) {
            const animalPosition = this.getRandomAnimalPosition();
            const animal = new Animal(animalPosition.x, animalPosition.y);
            this.animals.push(animal);
            this.app.stage.addChild(animal.view);
        }
    }

    private getRandomAnimalPosition(): { x: number; y: number } {
        const padding = GAME_CONFIG.animal.boundPadding;

        while (true) {
            // indents from field's borders
            const x = padding + Math.random() * (this.app.renderer.width - padding * 2);
            const y = padding + Math.random() * (this.app.renderer.height - padding * 2);

            // check if animal is inside the yard including padding
            const isInsideYard = this.yard.contains(x, y, padding);

            // check if animal is to close to Hero including padding
            const dx = x - this.hero.view.x;
            const dy = y - this.hero.view.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const minDistance = GAME_CONFIG.hero.radius + padding;
            const isTooCloseToHero = distance < minDistance;

            // check if animals are too close to each other
            const isTooCloseToOtherAnimals = this.animals.some((animal) => {
                const dx = x - animal.view.x;
                const dy = y - animal.view.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const minDistance = GAME_CONFIG.animal.radius + padding;

                return distance < minDistance;
            });

            if (!isInsideYard && !isTooCloseToHero && !isTooCloseToOtherAnimals) {
                return { x, y };
            }
        }
    }

    private collectAnimals(): void {
        const heroPosition = this.hero.getPosition();
        for (const animal of this.animals) {
            const startedFollowing = animal.tryStartFollowing(heroPosition, this.followers.length);

            if (startedFollowing) {
                this.followers.push(animal);
            }
        }
    }

    private updateFollowers(): void {
        const heroPosition = this.hero.getPosition();
        const heroDirection = this.hero.getDirection();
        this.followers.forEach((animal, index) => {
            animal.follow(heroPosition, heroDirection, index);
        });
    }

    private deliverAnimals(): void {
        const delivered = new Set(this.followers.filter(animal => {
            return this.yard.contains(animal.view.x, animal.view.y);
        }))

        if (delivered.size === 0) {
            return;
        }

        this.followers = this.followers.filter(animal => !delivered.has(animal));
        this.animals = this.animals.filter(animal => !delivered.has(animal));

        delivered.forEach(animal => {
            this.app.stage.removeChild(animal.view);
            this.scoreUI.increment();
        })
    }
}