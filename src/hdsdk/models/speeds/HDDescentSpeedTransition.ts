import {HDSpeedTransition} from './HDSpeedTransition';

export class HDDescentSpeedTransition extends HDSpeedTransition {
	constructor(speed: number = 240, altitude: number = 10500, isDeleted: boolean = false) {
		super(speed, altitude, isDeleted);
	}
}