class SpeedDirector {

	constructor(fmc) {
		/**
		 * TODO: FMC should be removed. All speed related values should be stored directly in SpeedDirector
		 * @private
		 */
		this._fmc = fmc;
		this._commandedSpeedType = undefined;
		this._lastCommandedSpeedType = undefined;
		this._speedPhase = undefined;
		this._lastSpeedPhase = undefined;
		this.Init();
	}

	Init() {
		this._updateAltitude();
		this._updateManagedSpeed();
		this._initSpeeds();
	}

	_initSpeeds() {
		this._climbSpeedRestriction = new ClimbSpeedRestriction(null, null);
		this._climbSpeedTransition = new SpeedTransition();
		this._climbSpeedSelected = new ClimbSpeed(null);
		this._climbSpeedEcon = new ClimbSpeed(this._fmc.getEconClbManagedSpeed());

		this._cruiseSpeedSelected = new CruiseSpeed(null);
		this._cruiseSpeedEcon = new CruiseSpeed(this._fmc.getEconCrzManagedSpeed());

		this._descentSpeedRestriction = new DescentSpeedRestriction(null, null);
		this._descentSpeedTransition = new SpeedTransition(240);
		this._descentSpeedSelected = new DescentSpeed(null);
		this._descentSpeedEcon = new DescentSpeed(282);
	}

	_updateAltitude() {
		this._planeAltitude = Simplane.getAltitude();
	}

	_updateManagedSpeed() {

	}

	get commandedSpeedType() {
		return this._commandedSpeedType;
	}

	update(flightPhase) {
		switch (flightPhase) {
			case FlightPhase.FLIGHT_PHASE_PREFLIGHT:
			case FlightPhase.FLIGHT_PHASE_TAXI:
			case FlightPhase.FLIGHT_PHASE_TAKEOFF:
			case FlightPhase.FLIGHT_PHASE_CLIMB:
			case FlightPhase.FLIGHT_PHASE_GOAROUND:
				this._updateClimbSpeed();
				break;
			case FlightPhase.FLIGHT_PHASE_CRUISE:
				this._updateCruiseSpeed();
				break;
			case FlightPhase.FLIGHT_PHASE_DESCENT:
			case FlightPhase.FLIGHT_PHASE_APPROACH:
				this._updateDescentSpeed();
				break;
		}
	}

	_updateClimbSpeed() {
		let maxSpeed = Infinity;
		if (isFinite(this._fmc.v2Speed)) {
			if (this._fmc.accelerationAltitude > Simplane.getAltitude()) {
				maxSpeed = this._fmc.v2Speed + 20;
			}
		}

		let speed = {
			[SpeedType.SPEED_TYPE_RESTRICTION]: (this._climbSpeedRestriction && this._climbSpeedRestriction.isValid(this._planeAltitude) ? this._climbSpeedRestriction.speed : null),
			[SpeedType.SPEED_TYPE_TRANSITION]: (this._climbSpeedTransition && this._climbSpeedTransition.isValid(this._planeAltitude) ? this._climbSpeedTransition.speed : null),
			[SpeedType.SPEED_TYPE_SELECTED]: (this._climbSpeedSelected && this._climbSpeedSelected.isValid() ? this._climbSpeedSelected.speed : null),
			[SpeedType.SPEED_TYPE_ECON]: (this._climbSpeedEcon && this._climbSpeedEcon.isValid() ? this._climbSpeedEcon.speed : null)
		};

		this._updateLastCommandedSpeed();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, SpeedType.SPEED_TYPE_ECON);

		this._updateCommandedSpeed(commandedSpeedKey, SpeedPhase.SPEED_PHASE_CLIMB);

		let flapsHandleIndex = Simplane.getFlapsHandleIndex();

		return Math.min(speed[commandedSpeedKey], maxSpeed, this._fmc.getFlapProtectionMaxSpeed(flapsHandleIndex));
	}

	_updateCruiseSpeed() {

	}

	_updateDescentSpeed() {

	}

	_updateLastCommandedSpeed() {
		this._lastCommandedSpeedType = this._commandedSpeedType;
		this._lastSpeedPhase = this._lastSpeedPhase;
	}

	_updateCommandedSpeed(speedType, speedPhase) {
		this._commandedSpeedType = speedType;
		this._speedPhase = speedPhase;
		this._updateFmcIfNeeded();
	}

	_updateFmcIfNeeded() {
		if (this._lastCommandedSpeedType !== this._commandedSpeedType || this._lastSpeedPhase !== this._speedPhase) {
			SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'Number', 1);
		}
	}

	isClimbSpeedRestrictionValid() {
		if (this._climbSpeedRestriction.speed && isFinite(this._climbSpeedRestriction.speed) && this._climbSpeedRestriction.altitude && isFinite(this._climbSpeedRestriction.altitude)) {
			if (this._climbSpeedRestriction.altitude > this._planeAltitude) {
				return true;
			}
		}
		return false;
	}
}

class Speed {

	constructor(speed) {
		this._speed = speed;
	}

	get speed() {
		return this._speed;
	}

	set speed(speed) {
		this._speed = speed;
	}

	isValid() {
		if (this._speed && isFinite(this._speed)) {
			return true;
		}
		return false;
	}
}

/**
 * Climb speed definition
 */
class ClimbSpeed extends Speed {
	constructor(speed) {
		super(speed);
	}
}

/**
 * Cruise speed definition
 */
class CruiseSpeed extends Speed {
	constructor(speed) {
		super(speed);
	}
}

/**
 * Descent speed definition
 */
class DescentSpeed extends Speed {
	constructor(speed) {
		super(speed);
	}
}

class SpeedRestriction extends Speed {
	get altitude() {
		return this._altitude;
	}

	set altitude(altitude) {
		this._altitude = altitude;
	}
}


class ClimbSpeedRestriction extends SpeedRestriction {
	constructor(speed, altitude) {
		super(speed);
		this._speed = speed;
		this._altitude = altitude;
	}

	isValid(planeAltitude) {
		if (this._speed && isFinite(this._speed) && this._altitude && isFinite(this._altitude)) {
			if (this._altitude > planeAltitude) {
				return true;
			}
		}
		return false;
	}
}

class DescentSpeedRestriction extends SpeedRestriction {
	constructor(speed, altitude) {
		super(speed);
		this._speed = speed;
		this._altitude = altitude;
	}

	/**
	 * TODO: Not implemented
	 * @param planeAltitude
	 * @returns {boolean}
	 */
	isValid(planeAltitude) {
		return false;
	}
}


class SpeedTransition extends Speed {
	constructor(speed = 250, isDeleted = false) {
		super();
		this._speed = speed;
		this._isDeleted = isDeleted;
	}

	get isDeleted() {
		return this._isDeleted;
	}

	set isDeleted(isDeleted) {
		this._isDeleted = isDeleted;
	}

	isValid(planeAltitude) {
		if (this._speed && isFinite(this._speed) && !this._isDeleted) {
			if (10000 > planeAltitude) {
				return true;
			}
		}
		return false;
	}
}

let SpeedType;
(function (SpeedType) {
	SpeedType[SpeedType['SPEED_TYPE_ECON'] = 0] = 'SPEED_TYPE_ECON';
	SpeedType[SpeedType['SPEED_TYPE_SELECTED'] = 1] = 'SPEED_TYPE_SELECTED';
	SpeedType[SpeedType['SPEED_TYPE_RESTRICTION'] = 2] = 'SPEED_TYPE_RESTRICTION';
	SpeedType[SpeedType['SPEED_TYPE_TRANSITION'] = 3] = 'SPEED_TYPE_TRANSITION';
})(SpeedType || (SpeedType = {}));

let SpeedPhase;
(function (SpeedPhase) {
	SpeedPhase[SpeedPhase['SPEED_PHASE_CLIMB'] = 0] = 'SPEED_PHASE_CLIMB';
	SpeedPhase[SpeedPhase['SPEED_PHASE_CRUISE'] = 1] = 'SPEED_PHASE_CRUISE';
	SpeedPhase[SpeedPhase['SPEED_PHASE_DESCENT'] = 2] = 'SPEED_PHASE_DESCENT';
})(SpeedPhase || (SpeedPhase = {}));