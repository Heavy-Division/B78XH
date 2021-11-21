import { Handler } from "./handlers/Handler";
import { Level } from "./levels/level";
export declare class HDLogger {
    static handlers: Handler[];
    static log(message: string, level?: Level): void;
    static addHandler(handler: Handler): void;
}
