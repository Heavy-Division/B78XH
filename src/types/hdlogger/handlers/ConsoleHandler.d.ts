import { Handler } from "./Handler";
import { Level } from "../levels/level";
export declare class ConsoleHandler implements Handler {
    log(message: string, level?: Level): void;
}
