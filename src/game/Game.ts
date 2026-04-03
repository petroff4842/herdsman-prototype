import { Application } from "pixi.js";
import { Hero } from "./entities/Hero";
import { Yard } from "./entities/Yard";
import { Animal } from "./entities/Animal";
import { GAME_CONFIG } from "./config";
import { ScoreUI } from "./ui/ScoreUI";
import { AnimalSpawner } from "./systems/AnimalSpawner";
import { EventEmitter } from "./core/EventEmitter";
import type { GameEvents } from "./types/GameEvents";
import { MoveToCommand } from "./core/Command";

export class Game {
    private app: Application;
    private hero: Hero;
    private yard: Yard;
    private animals: Animal[] = [];
    private followers: Animal[] = [];
    private scoreUI: ScoreUI;
    private animalSpawner: AnimalSpawner;
    private emitter: EventEmitter<GameEvents>;

    constructor(application: Application) {
        this.app = application;
        this.emitter = new EventEmitter<GameEvents>();
        this.hero = new Hero(this.app.renderer.width / 2, this.app.renderer.height / 2);
        this.yard = new Yard(GAME_CONFIG.yard.x, GAME_CONFIG.yard.y);
        this.scoreUI = new ScoreUI(this.emitter);
        this.animalSpawner = new AnimalSpawner(this.app.renderer.width, this.app.renderer.height);

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

            const command = new MoveToCommand((x: number, y: number) => this.hero.moveTo(x, y), x, y);
            command.execute();
        });
    }

    private setupLoop(): void {
        this.app.ticker.add(() => {

            const delta = this.app.ticker.deltaMS / 1000;

            this.hero.update(delta);
            
            const heroPosition = this.hero.getPosition();
            this.animals.forEach(animal => animal.update(delta, heroPosition, this.followers.length >= GAME_CONFIG.animal.maxFollowers));
            this.collectAnimals();
            this.updateFollowers(delta);
            this.deliverAnimals();
            this.trySpawnAnimal(delta);
        });
    }

    private trySpawnAnimal(delta: number): void {
        const animal = this.animalSpawner.update(delta, this.hero.getPosition(), this.yard, this.animals);
        if (!animal) {
            return;
        }
        this.animals.push(animal);
        this.app.stage.addChild(animal.view);
    }

    private createAnimals(): void {
        for (let i = 0; i < GAME_CONFIG.animal.count; i++) {
            const animal = this.animalSpawner.spawnNow(this.hero.getPosition(), this.yard, this.animals)
            if (!animal) {
                break;
            }
            this.animals.push(animal);
            this.app.stage.addChild(animal.view);
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

    private updateFollowers(delta: number): void {
        const heroPosition = this.hero.getPosition();
        const heroDirection = this.hero.getDirection();
        this.followers.forEach((animal, index) => {
            animal.follow(heroPosition, heroDirection, index, delta);
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
            this.emitter.emit('animal:delivered', { animal });
        })
    }
}