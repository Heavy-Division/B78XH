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

	get speed() {
		switch (this.speedPhase) {
			case SpeedPhase.SPEED_PHASE_CLIMB:
				switch (this.commandedSpeedType) {
					case SpeedType.SPEED_TYPE_RESTRICTION:
						return this._climbSpeedRestriction.speed;
					case SpeedType.SPEED_TYPE_TRANSITION:
						return this._climbSpeedTransition.speed;
					case SpeedType.SPEED_TYPE_SELECTED:
						return this._climbSpeedSelected.speed;
					case SpeedType.SPEED_TYPE_ECON:
						return this._climbSpeedEcon.speed;
				}
				break;
			case SpeedPhase.SPEED_PHASE_CRUISE:
				switch (this.commandedSpeedType) {
					case SpeedType.SPEED_TYPE_RESTRICTION:
					case SpeedType.SPEED_TYPE_TRANSITION:
					case SpeedType.SPEED_TYPE_ECON:
						return this._cruiseSpeedEcon.speed;
					case SpeedType.SPEED_TYPE_SELECTED:
						return this._cruiseSpeedSelected.speed;
				}
				break;
			case SpeedPhase.SPEED_PHASE_DESCENT:
				switch (this.commandedSpeedType) {
					case SpeedType.SPEED_TYPE_RESTRICTION:
						return this._descentSpeedRestriction.speed;
					case SpeedType.SPEED_TYPE_TRANSITION:
						return this._descentSpeedTransition.speed;
					case SpeedType.SPEED_TYPE_SELECTED:
						return this._descentSpeedSelected.speed;
					case SpeedType.SPEED_TYPE_ECON:
						return this._descentSpeedEcon.speed;
				}
				break;
			case SpeedPhase.SPEED_PHASE_APPROACH:
				switch (this.commandedSpeedType) {
					case SpeedType.SPEED_TYPE_RESTRICTION:
						return this._descentSpeedRestriction.speed;
					case SpeedType.SPEED_TYPE_TRANSITION:
						return this._descentSpeedTransition.speed;
					case SpeedType.SPEED_TYPE_SELECTED:
						return this._descentSpeedSelected.speed;
					case SpeedType.SPEED_TYPE_ECON:
						return this._descentSpeedEcon.speed;
				}
				break;
		}
	}

	get speedPhase() {
		return Number(this._speedPhase);
	}

	get commandedSpeedType() {
		return Number(this._commandedSpeedType);
	}

	update(flightPhase) {
		this._updateAltitude();
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
				this._updateDescentSpeed();
			case FlightPhase.FLIGHT_PHASE_APPROACH:
				this._updateApproachSpeed();
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
			[SpeedType.SPEED_TYPE_RESTRICTION]: (this._climbSpeedRestriction && this._climbSpeedRestriction.isValid(this._planeAltitude) ? this._climbSpeedRestriction.speed : false),
			[SpeedType.SPEED_TYPE_TRANSITION]: (this._climbSpeedTransition && this._climbSpeedTransition.isValid(this._planeAltitude) ? this._climbSpeedTransition.speed : false),
			[SpeedType.SPEED_TYPE_SELECTED]: (this._climbSpeedSelected && this._climbSpeedSelected.isValid() ? this._climbSpeedSelected.speed : false),
			[SpeedType.SPEED_TYPE_ECON]: (this._climbSpeedEcon && this._climbSpeedEcon.isValid() ? this._climbSpeedEcon.speed : false)
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
		let speed = {
			[SpeedType.SPEED_TYPE_SELECTED]: (this._cruiseSpeedSelected && this._cruiseSpeedSelected.isValid() ? this._cruiseSpeedSelected.speed : null),
			[SpeedType.SPEED_TYPE_ECON]: (this._cruiseSpeedEcon && this._cruiseSpeedEcon.isValid() ? this._cruiseSpeedEcon.speed : null)
		};

		this._updateLastCommandedSpeed();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, SpeedType.SPEED_TYPE_ECON);

		this._updateCommandedSpeed(commandedSpeedKey, SpeedPhase.SPEED_PHASE_CRUISE);
	}

	_updateDescentSpeed() {

	}

	_updateApproachSpeed() {

	}

	_updateLastCommandedSpeed() {
		this._lastCommandedSpeedType = this._commandedSpeedType;
		this._lastSpeedPhase = this._speedPhase;
	}

	_updateCommandedSpeed(speedType, speedPhase) {
		this._commandedSpeedType = Number(speedType);
		this._speedPhase = Number(speedPhase);
		this._updateFmcIfNeeded();
	}

	_updateFmcIfNeeded() {
		if (this._lastCommandedSpeedType !== this._commandedSpeedType || this._lastSpeedPhase !== this._speedPhase) {
			SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'Number', 1);
		}
	}
}

class Speed {

	constructor(speed) {
		this._speed = Number(speed);
	}

	/**
	 * Speed getter
	 * @returns {number}
	 */
	get speed() {
		return Number(this._speed);
	}

	/**
	 * Speed setter
	 * @param speed
	 */
	set speed(speed) {
		this._speed = Number(speed);
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

	constructor(speed, altitude) {
		super(speed);
		this._altitude = altitude;
	}

	get altitude() {
		return this._altitude;
	}

	set altitude(altitude) {
		this._altitude = altitude;
	}
}


class ClimbSpeedRestriction extends SpeedRestriction {
	isValid(planeAltitude) {
		if (this._speed && isFinite(this._speed) && this._altitude && isFinite(this._altitude)) {
			if (this._altitude > planeAltitude) {
				console.log('this._altitude: ' + this._altitude);
				console.log('planeAltitude: ' + planeAltitude);
				console.log('restruction valid');
				return true;
			}
		}
		console.log('restriction not valid');
		return false;
	}
}

class DescentSpeedRestriction extends SpeedRestriction {
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
		super(speed);
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
	SpeedType[SpeedType['SPEED_TYPE_PROTECTED'] = 4] = 'SPEED_TYPE_PROTECTED';
})(SpeedType || (SpeedType = {}));

let SpeedPhase;
(function (SpeedPhase) {
	SpeedPhase[SpeedPhase['SPEED_PHASE_CLIMB'] = 0] = 'SPEED_PHASE_CLIMB';
	SpeedPhase[SpeedPhase['SPEED_PHASE_CRUISE'] = 1] = 'SPEED_PHASE_CRUISE';
	SpeedPhase[SpeedPhase['SPEED_PHASE_DESCENT'] = 2] = 'SPEED_PHASE_DESCENT';
	SpeedPhase[SpeedPhase['SPEED_PHASE_APPROACH'] = 3] = 'SPEED_PHASE_APPROACH';
})(SpeedPhase || (SpeedPhase = {}));