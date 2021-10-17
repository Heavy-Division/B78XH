import {Handler} from "./handlers/Handler";
import {Level} from "./levels/level";

export class HDLogger {

	public static handlers: Handler[] = [];

	public static log(message: string, level: Level = Level.none) {
		if (this.handlers.length > 0) {
			for (let handler of this.handlers) {
				handler.log(message, level);
			}
		}
	}

	public static addHandler(handler: Handler) {
		this.handlers.push(handler);
	}
}