import {HDSpeed} from './HDSpeed';

export class HDWaypointSpeed extends HDSpeed {
	private _speedMach: number;

	constructor(speed: number, speedMach: number) {
		super(speed);
		this._speedMach = Number(speedMach);
	}

	get speedMach(): number {
		return this._speedMach;
	}

	set speedMach(speedMach: number) {
		this._speedMach = Number(speedMach);
	}
}