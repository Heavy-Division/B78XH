export class Queue {
	private _items = [];

	constructor(...items) {
		this.enqueue(...items);
	}

	enqueue(...items): void {
		for (const item of items.reverse()) {
			this._items.push(item);
		}
	}

	dequeue(): any {
		const item = this._items.splice(0, 1);
		return item.length > 0 ? item[0] : undefined;
	}

	peak(): any {
		return this.isEmpty() ? undefined : this._items[0];
	}

	isEmpty(): boolean {
		return this.length === 0;
	}

	get length(): number {
		return this._items.length;
	}
}