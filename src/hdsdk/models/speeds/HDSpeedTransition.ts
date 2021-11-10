import {HDSpeedRestriction} from './HDSpeedRestriction';

export class HDSpeedTransition extends HDSpeedRestriction {
	private _isDeleted: boolean;

	constructor(speed: number = 250, altitude: number = 10000, isDeleted: boolean = false) {
		super(speed, altitude);
		this._isDeleted = Boolean(isDeleted);
	}

	get isDeleted(): boolean {
		return this._isDeleted;
	}

	set isDeleted(isDeleted: boolean) {
		this._isDeleted = Boolean(isDeleted);
	}

	/**
	 * TODO implement above/bellow altitude check
	 * @param planeAltitude
	 * @returns {boolean}
	 */
	isValid(): boolean {
		const planeAltitude: number = Simplane.getAltitude();
		if (this._speed && isFinite(this._speed) && !this._isDeleted) {
			if (10000 > planeAltitude) {
				return true;
			}
		}
		return false;
	}
}