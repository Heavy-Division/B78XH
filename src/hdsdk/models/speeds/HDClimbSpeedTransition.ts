import {HDSpeedTransition} from './HDSpeedTransition';

export class HDClimbSpeedTransition extends HDSpeedTransition {
	constructor(speed: number = 250, altitude: number = 10000, isDeleted: boolean = false) {
		super(speed, altitude, isDeleted);
	}
}