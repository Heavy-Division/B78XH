class PreFlightDataHolder {
	/**
	 * ThrustLim page pre flight check/holder
	 * @returns {ThrustLimPagePreFlightCheck}
	 */
	get thrustLim() {
		return this._thrustLim;
	}

	/**
	 * TakeOff page pre flight check/holder
	 * @returns {TakeOffPagePreFlightCheck}
	 */
	get takeOff() {
		return this._takeOff;
	}

	/**
	 * PerfInit page pre flight check/holder
	 * @returns {PerfInitPagePreFlightCheck}
	 */
	get perfInit() {
		return this._perfInit;
	}

	/**
	 * Route page pre flight check/holder
	 * @returns {RoutePagePreFlightCheck}
	 */
	get route() {
		return this._route;
	}

	/**
	 * Is preflight completed?
	 * @returns {boolean}
	 */
	get completed() {
		return this._completed;
	}

	/**
	 * @param {boolean} value
	 */
	set completed(value) {
		this._completed = value;
	}

	/**
	 * Is preflight finished?
	 * @returns {boolean}
	 */
	get finished() {
		return this._finished;
	}

	/**
	 * @param {boolean} value
	 */
	set finished(value) {
		this._finished = value;
	}

	constructor() {
		this._completed = false;
		this._finished = false;
		this._thrustLim = new ThrustLimPagePreFlightCheck();
		this._takeOff = new TakeOffPagePreFlightCheck();
		this._perfInit = new PerfInitPagePreFlightCheck();
		this._route = new RoutePagePreFlightCheck();
	}
}

class ThrustLimPagePreFlightCheck {
	/**
	 * Is thrust page preflight completed?
	 * @returns {boolean}
	 */
	get completed() {
		return this._completed;
	}

	/**
	 * @param {boolean} value
	 */
	set completed(value) {
		this._completed = value;
	}

	/**
	 * Is assumed temperature filled?
	 * TODO: Assumed temperature is not required for preflight (should be removed)
	 * @returns {boolean}
	 */
	get assumedTemperature() {
		return this._assumedTemperature;
	}

	/**
	 * @param {boolean} value
	 */
	set assumedTemperature(value) {
		this._assumedTemperature = value;
	}

	constructor() {
		this._completed = false;
		this._assumedTemperature = false;
	}
}

class TakeOffPagePreFlightCheck {
	/**
	 * Is takeoff page preflight completed?
	 * @returns {boolean}
	 */
	get completed() {
		return this._completed;
	}

	/**
	 * @param {boolean} value
	 */
	set completed(value) {
		this._completed = value;
	}

	/**
	 * Are flaps filled?
	 * @returns {boolean}
	 */
	get flaps() {
		return this._flaps;
	}

	/**
	 * @param {boolean} value
	 */
	set flaps(value) {
		this._flaps = value;
	}

	/**
	 * Is v filled?
	 * @returns {boolean}
	 */
	get v1() {
		return this._v1;
	}

	/**
	 * @param {boolean} value
	 */
	set v1(value) {
		this._v1 = value;
	}

	/**
	 * Is vR filled?
	 * @returns {boolean}
	 */
	get vR() {
		return this._vR;
	}

	/**
	 * @param {boolean} value
	 */
	set vR(value) {
		this._vR = value;
	}

	/**
	 * Is v2 filled?
	 * @returns {boolean}
	 */
	get v2() {
		return this._v2;
	}

	/**
	 * @param {boolean} value
	 */
	set v2(value) {
		this._v2 = value;
	}

	constructor() {
		this._completed = false;
		this._flaps = false;
		this._v1 = false;
		this._vR = false;
		this._v2 = false;
	}
}

class PerfInitPagePreFlightCheck {
	/**
	 * Is PerfInit page preflight completed?
	 * @returns {boolean}
	 */
	get completed() {
		return this._completed;
	}

	/**
	 * @param {boolean} value
	 */
	set completed(value) {
		this._completed = value;
	}

	/**
	 * Is cruise altitude filled?
	 * @returns {boolean}
	 */
	get cruiseAltitude() {
		return this._cruiseAltitude;
	}

	/**
	 * @param {boolean} value
	 */
	set cruiseAltitude(value) {
		this._cruiseAltitude = value;
	}

	/**
	 * Is cost index filled?
	 * @returns {boolean}
	 */
	get costIndex() {
		return this._costIndex;
	}

	/**
	 * @param {boolean} value
	 */
	set costIndex(value) {
		this._costIndex = value;
	}

	/**
	 * Are reserves filled?
	 * @returns {boolean}
	 */
	get reserves() {
		return this._reserves;
	}

	/**
	 * @param {boolean} value
	 */
	set reserves(value) {
		this._reserves = value;
	}

	constructor() {
		this._completed = false;
		this._cruiseAltitude = false;
		this._costIndex = false;
		this._reserves = false;
	}
}

class RoutePagePreFlightCheck {
	/**
	 * Is PerfInit page preflight completed?
	 * @returns {boolean}
	 */
	get completed() {
		return this._completed;
	}

	/**
	 * @param {boolean} value
	 */
	set completed(value) {
		this._completed = value;
	}

	/**
	 * Is origin filled?
	 * @returns {boolean}
	 */
	get origin() {
		return this._origin;
	}

	/**
	 * @param {boolean} value
	 */
	set origin(value) {
		this._origin = value;
	}

	/**
	 * Is destination filled?
	 * @returns {boolean}
	 */
	get destination() {
		return this._destination;
	}

	/**
	 * @param {boolean} value
	 */
	set destination(value) {
		this._destination = value;
	}

	/**
	 * Is route activated?
	 * @returns {boolean}
	 */
	get activated() {
		return this._activated;
	}

	/**
	 * @param {boolean} value
	 */
	set activated(value) {
		this._activated = value;
	}

	constructor() {
		this._completed = false;
		this._origin = false;
		this._destination = false;
		this._activated = false;
	}
}