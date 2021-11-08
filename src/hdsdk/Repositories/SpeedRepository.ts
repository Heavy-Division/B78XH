export class SpeedRepository {
	private _v1Speed: number;
	private _vRSpeed: number;
	private _v2Speed: number;
	private _isV1SpeedCustom: boolean = false;
	private _isVRSpeedCustom: boolean = false;
	private _isV2SpeedCustom: boolean = false;

	public get v1Speed(): number {
		return this._v1Speed;
	}

	public set v1Speed(speed: number) {
		this._v1Speed = speed;
	}

	public get vRSpeed(): number {
		return this._vRSpeed;
	}

	public set vRSpeed(speed: number) {
		this._vRSpeed = speed;
	}

	public get v2Speed(): number {
		return this._v2Speed;
	}

	public set v2Speed(speed: number) {
		this._v2Speed = speed;
	}

	public get isV2SpeedCustom(): boolean {
		return this._isV2SpeedCustom;
	}

	public set isV2SpeedCustom(value: boolean) {
		this._isV2SpeedCustom = value;
	}

	public get isVRSpeedCustom(): boolean {
		return this._isVRSpeedCustom;
	}

	public set isVRSpeedCustom(value: boolean) {
		this._isVRSpeedCustom = value;
	}

	public get isV1SpeedCustom(): boolean {
		return this._isV1SpeedCustom;
	}

	public set isV1SpeedCustom(value: boolean) {
		this._isV1SpeedCustom = value;
	}
}