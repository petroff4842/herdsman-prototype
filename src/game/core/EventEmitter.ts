type Listener<T> = (data: T) => void;

export class EventEmitter<Events extends Record<string, unknown>> {
    private listeners: Partial<{
        [K in keyof Events]: Listener<Events[K]>[]
    }> = {};

    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event]!.push(listener);
    }

    emit<K extends keyof Events>(event: K, data: Events[K]): void {
        this.listeners[event]?.forEach(l => l(data));
    }
}