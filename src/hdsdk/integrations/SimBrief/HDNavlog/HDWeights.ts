export class HDWeights {
	public get payload(): number {
		return this._payload;
	}

	public get paxWeight(): number {
		return this._paxWeight;
	}

	public get paxCount(): number {
		return this._paxCount;
	}

	public get cargo(): number {
		return this._cargo;
	}

	public get estimatedRamp(): number {
		return this._estimatedRamp;
	}

	public get estimatedLanding(): number {
		return this._estimatedLanding;
	}

	public get estimatedZeroFuel(): number {
		return this._estimatedZeroFuel;
	}

	public get estimatedTakeoff(): number {
		return this._estimatedTakeoff;
	}

	public get maxLanding(): number {
		return this._maxLanding;
	}

	public get maxZeroFuel(): number {
		return this._maxZeroFuel;
	}

	public get maxTakeoffStruct(): number {
		return this._maxTakeoffStruct;
	}

	public get maxTakeoff(): number {
		return this._maxTakeoff;
	}

	public get operatingEmpty(): number {
		return this._operatingEmpty;
	}

	private readonly _operatingEmpty: number;
	private readonly _maxTakeoff: number;
	private readonly _maxTakeoffStruct: number;
	private readonly _maxZeroFuel: number;
	private readonly _maxLanding: number;
	private readonly _estimatedTakeoff: number;
	private readonly _estimatedZeroFuel: number;
	private readonly _estimatedLanding: number;
	private readonly _estimatedRamp: number;
	private readonly _cargo: number;
	private readonly _paxCount: number;
	private readonly _paxWeight: number;
	private readonly _payload: number;

	constructor(data: any) {
		const weights = data.weights;
		this._operatingEmpty = Number(weights.oew);
		this._maxTakeoff = Number(weights.max_tow);
		this._maxTakeoffStruct = Number(weights.max_tow_struct);
		this._maxZeroFuel = Number(weights.max_zfw);
		this._maxLanding = Number(weights.max_ldw);
		this._estimatedTakeoff = Number(weights.est_tow);
		this._estimatedZeroFuel = Number(weights.est_zfw);
		this._estimatedLanding = Number(weights.est_ldw);
		this._estimatedRamp = Number(weights.est_ramp);
		this._cargo = Number(weights.cargo);
		this._paxCount = Number(weights.pax_count);
		this._paxWeight = Number(weights.pax_weight);
		this._payload = Number(weights.payload);
	}
}