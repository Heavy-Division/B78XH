import {SpeedRepository} from '../Repositories/SpeedRepository';
import {VSpeedType} from './VSpeedType';
import {SpeedCalculator} from './SpeedCalculator';

export class SpeedManager {
	private readonly _speedRepository: SpeedRepository;
	private readonly _speedCalculator: SpeedCalculator;
	/**
	 * TODO: Should be this here???
	 * @type {boolean}
	 * @private
	 */
	private overSpeedLimitThreshold: boolean = false;
	/**
	 * TODO: Move to some kind of state class??
	 * @type {boolean}
	 * @private
	 */
	private _climbSpeedTransitionDeleted: boolean = false;

	constructor(repository: SpeedRepository, calculator: SpeedCalculator) {
		this._speedRepository = repository;
		this._speedCalculator = calculator;
	}

	get calculator(): SpeedCalculator {
		return this._speedCalculator;
	}

	get repository(): SpeedRepository {
		return this._speedRepository;
	}

	public clearVSpeeds(): void {
		this.setV1Speed(0, true);
		this.setVRSpeed(0, true);
		this.setV2Speed(0, true);
	}

	public setV1Speed(speed: number, computed: boolean = false): void {
		this._speedRepository.v1Speed = speed;
		this._speedRepository.isV1SpeedCustom = !computed;
		SimVar.SetSimVarValue('L:AIRLINER_V1_SPEED', 'Knots', speed).catch(console.error);
	}

	public setVRSpeed(speed: number, computed: boolean = false): void {
		this._speedRepository.vRSpeed = speed;
		this._speedRepository.isVRSpeedCustom = !computed;
		SimVar.SetSimVarValue('L:AIRLINER_VR_SPEED', 'Knots', speed).catch(console.error);
	}

	public setV2Speed(speed: number, computed: boolean = false): void {
		this._speedRepository.v2Speed = speed;
		this._speedRepository.isV2SpeedCustom = !computed;
		SimVar.SetSimVarValue('L:AIRLINER_V2_SPEED', 'Knots', speed).catch(console.error);
	}

	public getComputedV1Speed(runway: any, weight: number, flaps: number): number {
		return SpeedManager.getComputedVSpeed(runway, weight, flaps, VSpeedType.v1);
	}

	public getComputedVRSpeed(runway: any, weight: number, flaps: number): number {
		return SpeedManager.getComputedVSpeed(runway, weight, flaps, VSpeedType.vR);
	}

	public getComputedV2Speed(runway: any, weight: number, flaps: number): number {
		return SpeedManager.getComputedVSpeed(runway, weight, flaps, VSpeedType.v2);
	}

	private static getComputedVSpeed(runway: any, weight: number, flaps: number, type: VSpeedType): number {
		let runwayCoefficient = SpeedManager._getRunwayCoefficient(runway);
		let dWeightCoefficient = SpeedManager._getWeightCoefficient(weight, type);
		const flapsCoefficient = SpeedManager._getFlapsCoefficient(flaps);
		let temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		let index = SpeedManager._getIndexFromTemp(temp);
		let min: number;
		let max: number;
		switch (type) {
			case VSpeedType.v1:
				min = SpeedManager._v1s[index][0];
				max = SpeedManager._v1s[index][1];
				break;
			case VSpeedType.vR:
				min = SpeedManager._vRs[index][0];
				max = SpeedManager._vRs[index][1];
				break;
			case VSpeedType.v2:
				min = SpeedManager._v2s[index][0];
				max = SpeedManager._v2s[index][1];
				break;
		}
		let speed = min * (1 - runwayCoefficient) + max * runwayCoefficient;
		speed *= dWeightCoefficient;
		speed -= flapsCoefficient;
		speed = Math.round(speed);
		return speed;
	}

	public getVLS(weight: number): number {
		let flapsHandleIndex = Simplane.getFlapsHandleIndex();
		if (flapsHandleIndex === 4) {
			let dWeight = (weight - 61.4) / (82.5 - 61.4);
			return 141 + 20 * dWeight;
		} else {
			let dWeight = (weight - 61.4) / (82.5 - 61.4);
			return 146 + 21 * dWeight;
		}
	}

	public getCleanApproachSpeed(weight: number = undefined): number {
		return this._speedCalculator.cleanApproachSpeed(weight);
	}

	public getSlatApproachSpeed(weight: number = undefined): number {
		if (this.repository.overridenSlatApproachSpeed) {
			return this.repository.overridenSlatApproachSpeed;
		}
		return this.calculator.getSlatApproachSpeed(weight);
	}

	public getFlapApproachSpeed(weight: number = undefined): number {
		if (this.repository.overridenFlapApproachSpeed) {
			return this.repository.overridenFlapApproachSpeed;
		}
		return this.calculator.getFlapApproachSpeed(weight);
	}

	public getManagedApproachSpeed(flapsHandleIndex = NaN): number {
		return this.getVRef(flapsHandleIndex) - 5;
	}

	public getVRef(flapsHandleIndex: number = NaN): number {
		return this.calculator.getVRef(flapsHandleIndex);
	}

	public getClbManagedSpeed(costIndexCoefficient: number): number {
		const result = this.calculator.getClbManagedSpeed(costIndexCoefficient, this.overSpeedLimitThreshold);
		this.overSpeedLimitThreshold = result.overSpeedLimitThreshold;
		if (!this._climbSpeedTransitionDeleted) {
			result.speed = Math.min(result.speed, 250);
		}
		return result.speed;
	}

	public getEconClbManagedSpeed(costIndexCoefficient: number) {
		return this.getEconCrzManagedSpeed(costIndexCoefficient);
	}

	public getEconCrzManagedSpeed(costIndexCoefficient: number) {
		return this.getCrzManagedSpeed(costIndexCoefficient, true);
	}

	public getCrzManagedSpeed(costIndexCoefficient: number, highAltitude = false): number {
		const result = this.calculator.getCrzManagedSpeed(costIndexCoefficient, this.overSpeedLimitThreshold, highAltitude);
		this.overSpeedLimitThreshold = result.overSpeedLimitThreshold;
		return result.speed;
	}

	public getDesManagedSpeed(costIndexCoefficient: number): number {
		const result = this.calculator.getDesManagedSpeed(costIndexCoefficient, this.overSpeedLimitThreshold);
		this.overSpeedLimitThreshold = result.overSpeedLimitThreshold;
		return result.speed;
	}

	private static _getRunwayCoefficient(runway: any): number {
		if (runway) {
			let f = (runway.length - 2250) / (3250 - 2250);
			return Utils.Clamp(f, 0.0, 1.0);
		} else {
			return 1.0;
		}
	}

	private static _getWeightCoefficient(weight: number, type: VSpeedType): number {
		let dWeightCoeff = (weight - 350) / (560 - 350);
		dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);

		switch (type) {
			case VSpeedType.v1:
				return 0.90 + (1.16 - 0.9) * dWeightCoeff;
			case VSpeedType.vR:
				return 0.99 + (1.215 - 0.99) * dWeightCoeff;
			case VSpeedType.v2:
				return 1.03 + (1.23 - 1.03) * dWeightCoeff;
		}
	}

	private static _getFlapsCoefficient(flaps: number): number {
		switch (flaps) {
			case 5:
				return 2 * 5;
			case 10:
				return 3 * 5;
			case 15:
				return 4 * 5;
			case 17:
				return 5 * 5;
			case 18:
				return 6 * 5;
			case 20:
				return 7 * 5;
			default:
				return Simplane.getFlapsHandleIndex() * 5;
		}
	}

	private static _getIndexFromTemp(temp): number {
		if (temp < -10) {
			return 0;
		}
		if (temp < 0) {
			return 1;
		}
		if (temp < 10) {
			return 2;
		}
		if (temp < 20) {
			return 3;
		}
		if (temp < 30) {
			return 4;
		}
		if (temp < 40) {
			return 5;
		}
		if (temp < 43) {
			return 6;
		}
		if (temp < 45) {
			return 7;
		}
		if (temp < 47) {
			return 8;
		}
		if (temp < 49) {
			return 9;
		}
		if (temp < 51) {
			return 10;
		}
		if (temp < 53) {
			return 11;
		}
		if (temp < 55) {
			return 12;
		}
		if (temp < 57) {
			return 13;
		}
		if (temp < 59) {
			return 14;
		}
		if (temp < 61) {
			return 15;
		}
		if (temp < 63) {
			return 16;
		}
		if (temp < 65) {
			return 17;
		}
		if (temp < 66) {
			return 18;
		}
		return 19;
	}

	static _v1s: number[][] = [
		[130, 156],
		[128, 154],
		[127, 151],
		[125, 149],
		[123, 147],
		[122, 145],
		[121, 143],
		[120, 143],
		[120, 143],
		[120, 142],
		[119, 142],
		[119, 142],
		[119, 142],
		[119, 141],
		[118, 141],
		[118, 141],
		[118, 140],
		[118, 140],
		[117, 140],
		[117, 140]
	];
	static _vRs: number[][] = [
		[130, 158],
		[128, 156],
		[127, 154],
		[125, 152],
		[123, 150],
		[122, 148],
		[121, 147],
		[120, 146],
		[120, 146],
		[120, 145],
		[119, 145],
		[119, 144],
		[119, 144],
		[119, 143],
		[118, 143],
		[118, 142],
		[118, 142],
		[118, 141],
		[117, 141],
		[117, 140]
	];

	static _v2s: number[][] = [
		[135, 163],
		[133, 160],
		[132, 158],
		[130, 157],
		[129, 155],
		[127, 153],
		[127, 151],
		[126, 150],
		[125, 150],
		[125, 149],
		[124, 149],
		[124, 148],
		[124, 148],
		[123, 147],
		[123, 146],
		[123, 146],
		[123, 145],
		[122, 145],
		[122, 144],
		[121, 144]
	];
}