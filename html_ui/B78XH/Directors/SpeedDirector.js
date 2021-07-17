class SpeedDirector {

	constructor(fmc) {
		this._fmc = fmc;
	}

	Init(){
		this._planeAltitude = Simplane.getAltitude();
	}

	update(flightPhase) {
		switch (flightPhase) {
			case FlightPhase.FLIGHT_PHASE_PREFLIGHT:
			case FlightPhase.FLIGHT_PHASE_TAXI:
			case FlightPhase.FLIGHT_PHASE_TAKEOFF:
			case FlightPhase.FLIGHT_PHASE_CLIMB:
			case FlightPhase.FLIGHT_PHASE_GOAROUND:
				this._updateClimbSpeed()
				break;
			case FlightPhase.FLIGHT_PHASE_CRUISE:
				this._updateCruiseSpeed()
				break;
			case FlightPhase.FLIGHT_PHASE_DESCENT:
			case FlightPhase.FLIGHT_PHASE_APPROACH:
				this._updateDescentSpeed()
				break;
		}
	}

	_updateClimbSpeed() {
		let maxSpeed = Infinity;
		if (isFinite(this._fmc.v2Speed)) {
			if (this._fmc.accelerationAltitude > Simplane.getAltitude()) {
				maxSpeed =  this._fmc.v2Speed + 20;
			}
		}

		let speed = {
			[SpeedType.SPEED_TYPE_RESTRICTION]: (this._fmc.climbSpeedRestriction && this._fmc.shouldFMCCommandSpeedRestriction() ? this._fmc.climbSpeedRestriction.speed : null),
			[SpeedType.SPEED_TYPE_TRANSITION]: (!this._fmc._climbSpeedTransitionDeleted ? this._fmc.getCrzManagedSpeed() : null),
			[SpeedType.SPEED_TYPE_SELECTED]: (this._fmc.preSelectedClbSpeed ? this._fmc.preSelectedClbSpeed : null),
			[SpeedType.SPEED_TYPE_ECON]: this._fmc.getEconClbManagedSpeed()
		};

		this._lastFmcCommandClimbSpeedType = this._fmcCommandClimbSpeedType;

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, SpeedType.SPEED_TYPE_ECON);

		this._fmcCommandClimbSpeedType = commandedSpeedKey;

		if (this._lastFmcCommandClimbSpeedType !== this._fmcCommandClimbSpeedType) {
			SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'Number', 1);
		}

		let flapsHandleIndex = Simplane.getFlapsHandleIndex();

		return Math.min(speed[commandedSpeedKey], maxSpeed, this._fmc.getFlapProtectionMaxSpeed(flapsHandleIndex));
	}

	_updateCruiseSpeed() {

	}

	_updateDescentSpeed() {

	}
}

/**
 * Climb speed definition
 */
class ClimbSpeed extends Speed {

}

/**
 * Cruise speed definition
 */
class CruiseSpeed extends Speed {

}

/**
 * Descent speed definition
 */
class DescentSpeed extends Speed {

}

class Speed {
	get speed() {
		return this.speed;
	}

	set speed(speed) {
		this.speed = speed;
	}
}

class SpeedRestriction extends Speed {
	get altitude() {
		return this.altitude;
	}

	set altitude(altitude) {
		this.altitude = altitude;
	}
}

let SpeedType;
(function (SpeedType) {
	SpeedType[SpeedType["SPEED_TYPE_ECON"] = 0] = "SPEED_TYPE_ECON";
	SpeedType[SpeedType["SPEED_TYPE_SELECTED"] = 1] = "SPEED_TYPE_SELECTED";
	SpeedType[SpeedType["SPEED_TYPE_RESTRICTION"] = 2] = "SPEED_TYPE_RESTRICTION";
	SpeedType[SpeedType["SPEED_TYPE_TRANSITION"] = 3] = "SPEED_TYPE_TRANSITION";
})(SpeedType || (SpeedType = {}));