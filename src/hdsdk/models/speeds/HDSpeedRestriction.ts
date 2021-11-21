import {HDSpeed} from './HDSpeed';

export class HDSpeedRestriction extends HDSpeed {
	protected _altitude: number;

	constructor(speed: number, altitude: number) {
		super(speed);
		this._altitude = Number(altitude);
	}

	get altitude(): number {
		return this._altitude;
	}

	set altitude(altitude: number) {
		this._altitude = Number(altitude);
	}
}