import {HDSpeedRestriction} from './HDSpeedRestriction';

export class HDAccelerationSpeedRestriction extends HDSpeedRestriction {
	private _accelerationHeight: number;

	constructor(speed: number, altitude: number, height: number) {
		super(speed, altitude);
		this._accelerationHeight = Number(height);
	}

	/**
	 * Acceleration height setter
	 * @param height
	 */
	set accelerationHeight(height: number) {
		this._accelerationHeight = Number(height);
	}

	/**
	 * Returns acceleration height
	 * @returns {number}
	 */
	get accelerationHeight(): number {
		return this._accelerationHeight;
	}

	/**
	 * TODO: logic for v2+10 - v2+25 has to be implemented
	 * @returns {boolean}
	 */
	isValid(): boolean {
		const planeAltitude: number = Simplane.getAltitude();
		const v2speed: number = SimVar.GetSimVarValue('L:AIRLINER_V2_SPEED', 'Knots');
		this.speed = Number(v2speed + 25);
		if (this._speed && isFinite(this._speed) && this._altitude && isFinite(this._altitude)) {
			if (this._altitude > planeAltitude) {
				return true;
			}
		}
		return false;
	}
}