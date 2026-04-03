export interface ICommand {
    execute(): void;
}

export class MoveToCommand implements ICommand {
    private readonly moveTo: (x: number, y: number) => void;
    private readonly x: number;
    private readonly y: number;

    constructor(moveTo: (x: number, y: number) => void, x: number, y: number) {
        this.moveTo = moveTo;
        this.x = x;
        this.y = y;
    }

    execute(): void {
        this.moveTo(this.x, this.y);
    }
}