export class HDFuel {
	private _taxi: number;
	private _enrouteBurn: number;
	private _alternateBurn: number;
	private _contingency: number;
	private _reserve: number;
	private _extra: number;
	private _minTakeoff: number;
	private _plannedTakeoff: number;
	private _plannedRamp: number;
	private _plannedLanding: number;
	private _maxTanks: number;
	private _averageFlow: number;
	private _etops: number;

	public get taxi(): number {
		return this._taxi;
	}

	public set taxi(value: number) {
		this._taxi = value;
	}

	public get enrouteBurn(): number {
		return this._enrouteBurn;
	}

	public set enrouteBurn(value: number) {
		this._enrouteBurn = value;
	}

	public get alternateBurn(): number {
		return this._alternateBurn;
	}

	public set alternateBurn(value: number) {
		this._alternateBurn = value;
	}

	public get contingency(): number {
		return this._contingency;
	}

	public set contingency(value: number) {
		this._contingency = value;
	}

	public get reserve(): number {
		return this._reserve;
	}

	public set reserve(value: number) {
		this._reserve = value;
	}

	public get extra(): number {
		return this._extra;
	}

	public set extra(value: number) {
		this._extra = value;
	}

	public get minTakeoff(): number {
		return this._minTakeoff;
	}

	public set minTakeoff(value: number) {
		this._minTakeoff = value;
	}

	public get plannedTakeoff(): number {
		return this._plannedTakeoff;
	}

	public set plannedTakeoff(value: number) {
		this._plannedTakeoff = value;
	}

	public get plannedRamp(): number {
		return this._plannedRamp;
	}

	public set plannedRamp(value: number) {
		this._plannedRamp = value;
	}

	public get plannedLanding(): number {
		return this._plannedLanding;
	}

	public set plannedLanding(value: number) {
		this._plannedLanding = value;
	}

	public get maxTanks(): number {
		return this._maxTanks;
	}

	public set maxTanks(value: number) {
		this._maxTanks = value;
	}

	public get averageFlow(): number {
		return this._averageFlow;
	}

	public set averageFlow(value: number) {
		this._averageFlow = value;
	}

	public get etops(): number {
		return this._etops;
	}

	public set etops(value: number) {
		this._etops = value;
	}

	constructor(data: any) {
		const fuel = data.fuel;
		this._taxi = fuel.taxi;
		this._enrouteBurn = fuel.enroute_burn;
		this._contingency = fuel.contingency;
		this._alternateBurn = fuel.alternate_burn;
		this._reserve = fuel.reserve;
		this._etops = fuel.etops;
		this._extra = fuel.extra;
		this._minTakeoff = fuel.min_takeoff;
		this._plannedTakeoff = fuel.plan_takeoff;
		this._plannedRamp = fuel.plan_ramp;
		this._plannedLanding = fuel.plan_landing;
		this._averageFlow = fuel.avg_fuel_flow;
		this._maxTanks = fuel.max_tanks;
	}
}