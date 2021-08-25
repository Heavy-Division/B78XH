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
		this._machMode = undefined;
		this._lastMachMode = undefined;
		this._lastSpeed = undefined;
		this._speedCheck = undefined;
		this.Init();
	}

	Init() {
		this._updateAltitude();
		this._updateLastSpeed();
		this._updateMachMode();
		this._updateManagedSpeed();
		this._initSpeeds();
	}

	_initSpeeds() {

		this._accelerationSpeedRestriction = new AccelerationSpeedRestriction(this._fmc.v2Speed + 10, 1500, 1500);
		this._overspeedProtection = new OverspeedProtection(null);

		this._climbSpeedRestriction = new ClimbSpeedRestriction(null, null);
		this._climbSpeedTransition = new ClimbSpeedTransition();
		this._climbSpeedSelected = new ClimbSpeed(null);
		this._climbSpeedEcon = new ClimbSpeed(this._fmc.getEconClbManagedSpeed());

		this._cruiseSpeedSelected = new CruiseSpeed(null, null);
		this._cruiseSpeedEcon = new CruiseSpeed(this._fmc.getEconCrzManagedSpeed(), 0.85);

		this._descentSpeedRestriction = new DescentSpeedRestriction(null, null);
		this._descentSpeedTransition = new DescentSpeedTransition();
		this._descentSpeedSelected = new DescentSpeed(null);
		this._descentSpeedEcon = new DescentSpeed(282);
	}

	get machModeActive() {
		return this._machMode;
	}

	_updateMachMode() {
		this._machMode = Simplane.getAutoPilotMachModeActive();
		this._updateFmcIfNeeded();
	}

	_updateLastMachMode() {
		this._lastMachMode = this._machMode;
	}

	_updateAltitude() {
		this._planeAltitude = Simplane.getAltitude();
	}

	_updateManagedSpeed() {

	}

	_resolveMachKias(speed) {
		if (this.machModeActive) {
			const maxMachSpeed = 0.850;
			const requestedSpeed = SimVar.GetGameVarValue('FROM KIAS TO MACH', 'number', speed.speed);
			return Math.min(maxMachSpeed, requestedSpeed);
		} else {
			return speed.speed;
		}
	}

	get speed() {
		switch (this.speedPhase) {
			case SpeedPhase.SPEED_PHASE_CLIMB:
				switch (this.commandedSpeedType) {
					case SpeedType.SPEED_TYPE_RESTRICTION:
						return this._resolveMachKias(this._climbSpeedRestriction);
					case SpeedType.SPEED_TYPE_TRANSITION:
						return this._resolveMachKias(this._climbSpeedTransition);
					case SpeedType.SPEED_TYPE_SELECTED:
						return this._resolveMachKias(this._climbSpeedSelected);
					case SpeedType.SPEED_TYPE_ACCELERATION:
						return this._resolveMachKias(this._accelerationSpeedRestriction);
					case SpeedType.SPEED_TYPE_PROTECTED:
						return this._resolveMachKias(this._overspeedProtection);
					case SpeedType.SPEED_TYPE_ECON:
						return this._resolveMachKias(this._climbSpeedEcon);
				}
				break;
			case SpeedPhase.SPEED_PHASE_CRUISE:
				switch (this.commandedSpeedType) {
					case SpeedType.SPEED_TYPE_RESTRICTION:
					case SpeedType.SPEED_TYPE_TRANSITION:
					case SpeedType.SPEED_TYPE_ECON:
						return (this.machModeActive ? this._cruiseSpeedEcon.speedMach : this._cruiseSpeedEcon.speed);
					case SpeedType.SPEED_TYPE_SELECTED:
						return (this.machModeActive ? (this._cruiseSpeedSelected.speedMach ? this._cruiseSpeedSelected.speedMach : this._resolveMachKias(this._cruiseSpeedSelected)) : this._cruiseSpeedSelected.speed);
					case SpeedType.SPEED_TYPE_PROTECTED:
						return this._resolveMachKias(this._overspeedProtection);
				}
				break;
			case SpeedPhase.SPEED_PHASE_DESCENT:
				switch (this.commandedSpeedType) {
					case SpeedType.SPEED_TYPE_RESTRICTION:
						return this._resolveMachKias(this._descentSpeedRestriction);
					case SpeedType.SPEED_TYPE_TRANSITION:
						return this._resolveMachKias(this._descentSpeedTransition);
					case SpeedType.SPEED_TYPE_SELECTED:
						return (this.machModeActive ? (this._descentSpeedSelected.speedMach ? this._descentSpeedSelected.speedMach : this._resolveMachKias(this._descentSpeedSelected)) : this._descentSpeedSelected.speed);
					case SpeedType.SPEED_TYPE_ECON:
						return this._resolveMachKias(this._descentSpeedEcon);
					case SpeedType.SPEED_TYPE_PROTECTED:
						return this._resolveMachKias(this._overspeedProtection);
				}
				break;
			case SpeedPhase.SPEED_PHASE_APPROACH:
				switch (this.commandedSpeedType) {
					case SpeedType.SPEED_TYPE_RESTRICTION:
						return this._resolveMachKias(this._descentSpeedRestriction);
					case SpeedType.SPEED_TYPE_TRANSITION:
						return this._resolveMachKias(this._descentSpeedTransition);
					case SpeedType.SPEED_TYPE_SELECTED:
						return (this.machModeActive ? (this._descentSpeedSelected.speedMach ? this._descentSpeedSelected.speedMach : this._resolveMachKias(this._descentSpeedSelected)) : this._descentSpeedSelected.speed);
					case SpeedType.SPEED_TYPE_ECON:
						return this._resolveMachKias(this._descentSpeedEcon);
					case SpeedType.SPEED_TYPE_PROTECTED:
						return this._resolveMachKias(this._overspeedProtection);
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

	_updateLastSpeed(speed) {
		this._lastSpeed = Number(speed);
	}

	_updateCheckSpeed() {
		this._speedCheck = this.speed;
	}

	update(flightPhase) {
		this._updateAltitude();
		this._updateLastSpeed();
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
		this._updateCheckSpeed();
	}

	_updateClimbSpeed() {
		let speed = {
			[SpeedType.SPEED_TYPE_RESTRICTION]: (this._climbSpeedRestriction && this._climbSpeedRestriction.isValid(this._planeAltitude) ? this._climbSpeedRestriction.speed : false),
			[SpeedType.SPEED_TYPE_TRANSITION]: (this._climbSpeedTransition && this._climbSpeedTransition.isValid(this._planeAltitude) ? this._climbSpeedTransition.speed : false),
			[SpeedType.SPEED_TYPE_ACCELERATION]: (this._accelerationSpeedRestriction && this._accelerationSpeedRestriction.isValid(this._planeAltitude) ? this._accelerationSpeedRestriction.speed : false),
			[SpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
			[SpeedType.SPEED_TYPE_SELECTED]: (this._climbSpeedSelected && this._climbSpeedSelected.isValid() ? this._climbSpeedSelected.speed : false),
			[SpeedType.SPEED_TYPE_ECON]: (this._climbSpeedEcon && this._climbSpeedEcon.isValid() ? this._climbSpeedEcon.speed : false)
		};

		this._updateLastCommandedSpeed();
		this._updateLastMachMode();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, SpeedType.SPEED_TYPE_ECON);

		this._updateCommandedSpeed(commandedSpeedKey, SpeedPhase.SPEED_PHASE_CLIMB);
		this._updateMachMode();
	}

	_updateCruiseSpeed() {
		let speed = {
			[SpeedType.SPEED_TYPE_SELECTED]: (this._cruiseSpeedSelected && this._cruiseSpeedSelected.isValid() ? this._cruiseSpeedSelected.speed : null),
			[SpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
			[SpeedType.SPEED_TYPE_ECON]: (this._cruiseSpeedEcon && this._cruiseSpeedEcon.isValid() ? this._cruiseSpeedEcon.speed : null)
		};

		this._updateLastCommandedSpeed();
		this._updateLastMachMode();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, SpeedType.SPEED_TYPE_ECON);

		this._updateCommandedSpeed(commandedSpeedKey, SpeedPhase.SPEED_PHASE_CRUISE);
		this._updateMachMode();
	}

	_updateDescentSpeed() {
		let speed = {
			[SpeedType.SPEED_TYPE_RESTRICTION]: (this._descentSpeedRestriction && this._descentSpeedRestriction.isValid(this._planeAltitude) ? this._descentSpeedRestriction.speed : false),
			[SpeedType.SPEED_TYPE_TRANSITION]: (this._descentSpeedTransition && this._descentSpeedTransition.isValid(this._planeAltitude) ? this._descentSpeedTransition.speed : false),
			[SpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
			[SpeedType.SPEED_TYPE_SELECTED]: (this._descentSpeedSelected && this._descentSpeedSelected.isValid() ? this._descentSpeedSelected.speed : false),
			[SpeedType.SPEED_TYPE_ECON]: (this._descentSpeedEcon && this._descentSpeedEcon.isValid() ? this._descentSpeedEcon.speed : false)
		};

		this._updateLastCommandedSpeed();
		this._updateLastMachMode();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, SpeedType.SPEED_TYPE_ECON);

		this._updateCommandedSpeed(commandedSpeedKey, SpeedPhase.SPEED_PHASE_DESCENT);
		this._updateMachMode();
	}

	_updateApproachSpeed() {
		let speed = {
			[SpeedType.SPEED_TYPE_RESTRICTION]: (this._descentSpeedRestriction && this._descentSpeedRestriction.isValid(this._planeAltitude) ? this._descentSpeedRestriction.speed : false),
			[SpeedType.SPEED_TYPE_TRANSITION]: (this._descentSpeedTransition && this._descentSpeedTransition.isValid(this._planeAltitude) ? this._descentSpeedTransition.speed : false),
			[SpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
			[SpeedType.SPEED_TYPE_SELECTED]: (this._descentSpeedSelected && this._descentSpeedSelected.isValid() ? this._descentSpeedSelected.speed : false),
			[SpeedType.SPEED_TYPE_ECON]: (this._descentSpeedEcon && this._descentSpeedEcon.isValid() ? this._descentSpeedEcon.speed : false)
		};

		this._updateLastCommandedSpeed();
		this._updateLastMachMode();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, SpeedType.SPEED_TYPE_ECON);

		this._updateCommandedSpeed(commandedSpeedKey, SpeedPhase.SPEED_PHASE_APPROACH);
		this._updateMachMode();
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
		if (this._lastCommandedSpeedType !== this._commandedSpeedType || this._lastSpeedPhase !== this._speedPhase || this._lastMachMode !== this._machMode || this._lastSpeed !== this._speedCheck) {
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
	constructor(speed, speedMach) {
		super(speed);
		this._speedMach = speedMach;
	}

	get speedMach() {
		return Number(this._speedMach);
	}

	set speedMach(speedMach) {
		this._speedMach = Number(speedMach);
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

class OverspeedProtection extends Speed {
	/**
	 * Speed getter
	 * @returns {number}
	 */
	get speed() {
		return Number(this.getFlapProtectionMaxSpeed(Simplane.getFlapsHandleIndex()));
	}

	/**
	 * Overspeed protection should be always valid
	 * @returns {boolean}
	 */
	isValid() {
		return true;
	}

	/**
	 * Flap protection speeds table
	 * @param handleIndex
	 * @returns {number}
	 */
	getFlapProtectionMaxSpeed(handleIndex) {
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

class AccelerationSpeedRestriction extends SpeedRestriction {

	constructor(speed, altitude, height) {
		super(speed, altitude);
		this._accelerationHeight = Number(height);
	}

	/**
	 * Acceleration height setter
	 * Suggestion: Should be renamed to "height"??
	 * @param height
	 */
	set accelerationHeight(height) {
		this._accelerationHeight = Number(height);
	}

	/**
	 * Returns acceleration height
	 * Suggestion: Should be renamed to "height"??
	 * @returns {number}
	 */
	get accelerationHeight() {
		return Number(this._accelerationHeight);
	}

	/**
	 * TODO: logic for v2+10 - v2+25 has to be implemented
	 * @returns {boolean}
	 */
	isValid(planeAltitude) {
		const v2speed = SimVar.GetSimVarValue('L:AIRLINER_V2_SPEED', 'Knots');
		this.speed = Number(v2speed + 25);
		if (this._speed && isFinite(this._speed) && this._altitude && isFinite(this._altitude)) {
			if (this._altitude > planeAltitude) {
				return true;
			}
		}
		return false;
	}
}

class ClimbSpeedRestriction extends SpeedRestriction {
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
	/**
	 * TODO: Not implemented
	 * @param planeAltitude
	 * @returns {boolean}
	 */
	isValid(planeAltitude) {
		return false;
	}
}


class SpeedTransition extends SpeedRestriction {
	constructor(speed = 250, altitude = 10000, isDeleted = false) {
		super(speed, altitude);
		this._isDeleted = isDeleted;
	}

	get isDeleted() {
		return this._isDeleted;
	}

	set isDeleted(isDeleted) {
		this._isDeleted = isDeleted;
	}

	/**
	 * TODO implement above/bellow altitude check
	 * @param planeAltitude
	 * @returns {boolean}
	 */
	isValid(planeAltitude) {
		if (this._speed && isFinite(this._speed) && !this._isDeleted) {
			if (10000 > planeAltitude) {
				return true;
			}
		}
		return false;
	}
}

class DescentSpeedTransition extends SpeedTransition {
	constructor(speed = 240, altitude = 10000, isDeleted = false) {
		super(speed, altitude, isDeleted);
	}
}

class ClimbSpeedTransition extends SpeedTransition {
	constructor(speed = 250, altitude = 10000, isDeleted = false) {
		super(speed, altitude, isDeleted);
	}
}

let SpeedType;
(function (SpeedType) {
	SpeedType[SpeedType['SPEED_TYPE_ECON'] = 0] = 'SPEED_TYPE_ECON';
	SpeedType[SpeedType['SPEED_TYPE_SELECTED'] = 1] = 'SPEED_TYPE_SELECTED';
	SpeedType[SpeedType['SPEED_TYPE_RESTRICTION'] = 2] = 'SPEED_TYPE_RESTRICTION';
	SpeedType[SpeedType['SPEED_TYPE_TRANSITION'] = 3] = 'SPEED_TYPE_TRANSITION';
	SpeedType[SpeedType['SPEED_TYPE_ACCELERATION'] = 4] = 'SPEED_TYPE_ACCELERATION';
	SpeedType[SpeedType['SPEED_TYPE_PROTECTED'] = 5] = 'SPEED_TYPE_PROTECTED';
})(SpeedType || (SpeedType = {}));

let SpeedPhase;
(function (SpeedPhase) {
	SpeedPhase[SpeedPhase['SPEED_PHASE_CLIMB'] = 0] = 'SPEED_PHASE_CLIMB';
	SpeedPhase[SpeedPhase['SPEED_PHASE_CRUISE'] = 1] = 'SPEED_PHASE_CRUISE';
	SpeedPhase[SpeedPhase['SPEED_PHASE_DESCENT'] = 2] = 'SPEED_PHASE_DESCENT';
	SpeedPhase[SpeedPhase['SPEED_PHASE_APPROACH'] = 3] = 'SPEED_PHASE_APPROACH';
})(SpeedPhase || (SpeedPhase = {}));