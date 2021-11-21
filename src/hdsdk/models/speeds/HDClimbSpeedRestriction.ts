import {HDSpeedRestriction} from './HDSpeedRestriction';

export class HDClimbSpeedRestriction extends HDSpeedRestriction {
	isValid(): boolean {
		const planeAltitude: number = Simplane.getAltitude();
		if (this._speed && isFinite(this._speed) && this._altitude && isFinite(this._altitude)) {
			if (this._altitude > planeAltitude) {
				return true;
			}
		}
		return false;
	}
}