import {Handler} from "./Handler";
import {Level} from "../levels/level";

export class ConsoleHandler implements Handler {
	public log(message: string, level: Level = Level.none): void {
		switch (level) {
			case Level.none:
				console.log(message);
				break;
			case Level.debug:
				console.info(Level[level] + ': ' + message);
				break;
			case Level.info:
				console.info(Level[level] + ': ' + message);
				break;
			case Level.warning:
				console.warn(Level[level] + ': ' + message);
				break;
			case Level.error:
				console.warn(Level[level] + ': ' + message);
				break;
			case Level.fatal:
				console.warn(Level[level] + ': ' + message)
				break;

		}
	}
}