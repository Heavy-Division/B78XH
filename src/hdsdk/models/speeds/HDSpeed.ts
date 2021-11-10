export class HDSpeed {

	protected _speed: number;

	constructor(speed: number) {
		this._speed = Number(speed);
	}

	/**
	 * Speed getter
	 * @returns {number}
	 */
	get speed(): number {
		return this._speed;
	}

	/**
	 * Speed setter
	 * @param speed
	 */
	set speed(speed: number) {
		this._speed = Number(speed);
	}

	isValid() {
		return this._speed && isFinite(this._speed);
	}
}