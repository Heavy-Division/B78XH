import {HDSpeed} from './HDSpeed';

export class HDOverspeedProtection extends HDSpeed {
	/**
	 * Speed getter
	 * @returns {number}
	 */
	get speed(): number {
		return Number(this.getFlapProtectionMaxSpeed(Simplane.getFlapsHandleIndex()));
	}

	/**
	 * Overspeed protection should be always valid
	 * @returns {boolean}
	 */
	isValid(): boolean {
		return true;
	}

	/**
	 * Flap protection speeds table
	 * @param handleIndex
	 * @returns {number}
	 */
	getFlapProtectionMaxSpeed(handleIndex): number {
		switch (handleIndex) {
			case 0:
				return 360;
			case 1:
				return 255;
			case 2:
				return 235;
			case 3:
				return 225;
			case 4:
				return 215;
			case 5:
				return 210;
			case 6:
				return 210;
			case 7:
				return 205;
			case 8:
				return 185;
			case 9:
				return 175;
		}
		return 360;
	}
}