import { Level } from "./levels/level";
export class HDLogger {
    static log(message, level = Level.none) {
        if (this.handlers.length > 0) {
            for (let handler of this.handlers) {
                handler.log(message, level);
            }
        }
    }
    static addHandler(handler) {
        this.handlers.push(handler);
    }
}
HDLogger.handlers = [];
