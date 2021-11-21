export class SpeedCalculator {
	private flapsFallback;
	private weightFallback;

	getClbManagedSpeed(costIndexCoefficient: number, overSpeedLimitThreshold: boolean): { speed: number, overSpeedLimitThreshold: boolean } {
		const formula = (costIndexCoefficient) => {
			return 310 * (1 - costIndexCoefficient) + 330 * costIndexCoefficient;
		};
		let speed = this.calculate(formula, costIndexCoefficient);
		if (overSpeedLimitThreshold) {
			if (Simplane.getAltitude() < 9800) {
				overSpeedLimitThreshold = false;
			}
		} else if (!overSpeedLimitThreshold) {
			if (Simplane.getAltitude() >= 10000) {
				/**
				 * TODO: Figure out where to store property isFmcCurrentPageUpdatedAboveTenThousandFeet
				 */
				//if (!this._isFmcCurrentPageUpdatedAboveTenThousandFeet) {
				//	SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
				//	this._isFmcCurrentPageUpdatedAboveTenThousandFeet = true;
				//}
				overSpeedLimitThreshold = true;
			}
		}
		return {speed: speed, overSpeedLimitThreshold: overSpeedLimitThreshold};
	}

	public getCrzManagedSpeed(costIndexCoefficient: number, overSpeedLimitThreshold: boolean, highAltitude = false): { speed: number, overSpeedLimitThreshold: boolean } {
		const formula = (costIndexCoefficient) => {
			costIndexCoefficient = costIndexCoefficient * costIndexCoefficient;
			return 310 * (1 - costIndexCoefficient) + 330 * costIndexCoefficient;
		};
		let speed = this.calculate(formula, costIndexCoefficient);
		if (!highAltitude) {
			if (overSpeedLimitThreshold) {
				if (Simplane.getAltitude() < 9800) {
					speed = Math.min(speed, 250);
					overSpeedLimitThreshold = false;
				}
			} else if (!overSpeedLimitThreshold) {
				if (Simplane.getAltitude() < 10000) {
					speed = Math.min(speed, 250);
				} else {
					overSpeedLimitThreshold = true;
				}
			}
		}
		return {speed: speed, overSpeedLimitThreshold: overSpeedLimitThreshold};
	}

	public getDesManagedSpeed(costIndexCoefficient: number, overSpeedLimitThreshold: boolean): { speed: number, overSpeedLimitThreshold: boolean } {
		const formula = (costIndexCoefficient) => {
			return 280 * (1 - costIndexCoefficient) + 300 * costIndexCoefficient;
		};
		let speed = this.calculate(formula, costIndexCoefficient);
		if (overSpeedLimitThreshold) {
			if (Simplane.getAltitude() < 10700) {
				speed = Math.min(speed, 240);
				overSpeedLimitThreshold = false;
			}
		} else if (!overSpeedLimitThreshold) {
			if (Simplane.getAltitude() < 10700) {
				speed = Math.min(speed, 240);
			} else {
				overSpeedLimitThreshold = true;
			}
		}
		return {speed: speed, overSpeedLimitThreshold: overSpeedLimitThreshold};
	}

	public cleanApproachSpeed(weight: number = undefined): number {
		let formula = (weight) => {
			let dWeight = (weight - 200) / (528 - 200);
			return 121 + 56 * dWeight;
		};
		return this.calculate(formula, this._getCheckedWeight(weight));
	}

	public getSlatApproachSpeed(weight: number = undefined): number {
		let formula = (weight) => {
			let dWeight = (weight - 200) / (528 - 200);
			return 119 + 58 * dWeight;
		};
		return this.calculate(formula, this._getCheckedWeight(weight));
	}

	public getFlapApproachSpeed(weight: number = undefined): number {
		let formula = (weight) => {
			let dWeight = (weight - 200) / (528 - 200);
			return 119 + 53 * dWeight;
		};
		return this.calculate(formula, this._getCheckedWeight(weight));
	}

	getVRef(flapsHandleIndex: number = NaN) {
		let formula = (min, max) => {
			return Math.round(((max - min) / (557 - 298.7) * (this._getCurrentWeight(true) / 1000 - 298.7)) + min);
		};
		if (isNaN(flapsHandleIndex)) {
			flapsHandleIndex = Simplane.getFlapsHandleIndex();
		}

		let min = 198;
		let max = 250;
		if (flapsHandleIndex >= 9) {
			min = 119;
			max = 171;
		} else if (flapsHandleIndex >= 8) {
			min = 119;
			max = 174;
		} else if (flapsHandleIndex >= 7) {
			min = 138;
			max = 182;
		} else if (flapsHandleIndex >= 4) {
			min = 138;
			max = 182;
		} else if (flapsHandleIndex >= 2) {
			min = 158;
			max = 210;
		} else if (flapsHandleIndex >= 1) {
			min = 173;
			max = 231;
		}

		return this.calculate(formula, min, max);
	}

	private calculate(formula: Function, ...params: any): number {
		return formula(...params);
	}

	private _getCheckedWeight(weight): number {
		if (weight === undefined) {
			return this._getCurrentWeight(true) / 1000;
		} else {
			return weight;
		}
	}

	private _getCurrentWeight(useLbs: boolean = false): number {
		return (useLbs ? Simplane.getWeight() * 2.20462262 : Simplane.getWeight());
	}
}