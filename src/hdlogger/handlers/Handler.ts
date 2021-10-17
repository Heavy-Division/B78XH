import {Level} from "../levels/level";

export interface Handler {
	log(message: string, level: Level): void;
}