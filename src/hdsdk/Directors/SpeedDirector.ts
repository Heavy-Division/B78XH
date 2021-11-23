import {HDSpeedPhase} from '../models/speeds/HDSpeedPhase';
import {HDSpeedType} from '../models/speeds/HDSpeedType';
import {SpeedManager} from '../Managers/SpeedManager';
import {HDDescentSpeed} from '../models/speeds/HDDescentSpeed';
import {HDAccelerationSpeedRestriction} from '../models/speeds/HDAccelerationSpeedRestriction';
import {HDOverspeedProtection} from '../models/speeds/HDOverspeedProtection';
import {HDClimbSpeedRestriction} from '../models/speeds/HDClimbSpeedRestriction';
import {HDClimbSpeedTransition} from '../models/speeds/HDClimbSpeedTransition';
import {HDClimbSpeed} from '../models/speeds/HDClimbSpeed';
import {HDCruiseSpeed} from '../models/speeds/HDCruiseSpeed';
import {HDDescentSpeedRestriction} from '../models/speeds/HDDescentSpeedRestriction';
import {HDDescentSpeedTransition} from '../models/speeds/HDDescentSpeedTransition';
import {HDSpeed} from '../models/speeds/HDSpeed';

export class SpeedDirector {
	public get descentSpeedEcon(): HDDescentSpeed {
		return this._descentSpeedEcon;
	}

	public set descentSpeedEcon(value: HDDescentSpeed) {
		this._descentSpeedEcon = value;
	}

	public get descentSpeedSelected(): HDDescentSpeed {
		return this._descentSpeedSelected;
	}

	public set descentSpeedSelected(value: HDDescentSpeed) {
		this._descentSpeedSelected = value;
	}

	public get descentSpeedTransition(): HDDescentSpeedTransition {
		return this._descentSpeedTransition;
	}

	public set descentSpeedTransition(value: HDDescentSpeedTransition) {
		this._descentSpeedTransition = value;
	}

	public get descentSpeedRestriction(): HDDescentSpeedRestriction {
		return this._descentSpeedRestriction;
	}

	public set descentSpeedRestriction(value: HDDescentSpeedRestriction) {
		this._descentSpeedRestriction = value;
	}

	public get cruiseSpeedEcon(): HDCruiseSpeed {
		return this._cruiseSpeedEcon;
	}

	public set cruiseSpeedEcon(value: HDCruiseSpeed) {
		this._cruiseSpeedEcon = value;
	}

	public get cruiseSpeedSelected(): HDCruiseSpeed {
		return this._cruiseSpeedSelected;
	}

	public set cruiseSpeedSelected(value: HDCruiseSpeed) {
		this._cruiseSpeedSelected = value;
	}

	public get climbSpeedEcon(): HDClimbSpeed {
		return this._climbSpeedEcon;
	}

	public set climbSpeedEcon(value: HDClimbSpeed) {
		this._climbSpeedEcon = value;
	}

	public get climbSpeedSelected(): HDClimbSpeed {
		return this._climbSpeedSelected;
	}

	public set climbSpeedSelected(value: HDClimbSpeed) {
		this._climbSpeedSelected = value;
	}

	public get climbSpeedTransition(): HDClimbSpeedTransition {
		return this._climbSpeedTransition;
	}

	public set climbSpeedTransition(value: HDClimbSpeedTransition) {
		this._climbSpeedTransition = value;
	}

	public get climbSpeedRestriction(): HDClimbSpeedRestriction {
		return this._climbSpeedRestriction;
	}

	public set climbSpeedRestriction(value: HDClimbSpeedRestriction) {
		this._climbSpeedRestriction = value;
	}

	public get accelerationSpeedRestriction(): HDAccelerationSpeedRestriction {
		return this._accelerationSpeedRestriction;
	}

	public set accelerationSpeedRestriction(value: HDAccelerationSpeedRestriction) {
		this._accelerationSpeedRestriction = value;
	}

	private _commandedSpeedType: HDSpeedType;
	private _lastCommandedSpeedType: HDSpeedType;
	private _speedPhase: HDSpeedPhase;
	private _lastSpeedPhase: HDSpeedPhase;
	private _machMode: boolean;
	private _lastMachMode: boolean;
	private _lastSpeed: number;
	private _speedCheck: number;
	private _planeAltitude: number;
	private _accelerationSpeedRestriction: HDAccelerationSpeedRestriction;
	private _overspeedProtection: HDOverspeedProtection;
	private _climbSpeedRestriction: HDClimbSpeedRestriction;
	private _climbSpeedTransition: HDClimbSpeedTransition;
	private _climbSpeedSelected: HDClimbSpeed;
	private _climbSpeedEcon: HDClimbSpeed;
	private _cruiseSpeedSelected: HDCruiseSpeed;
	private _cruiseSpeedEcon: HDCruiseSpeed;
	private _descentSpeedRestriction: HDDescentSpeedRestriction;
	private _descentSpeedTransition: HDDescentSpeedTransition;
	private _descentSpeedSelected: HDDescentSpeed;
	private _descentSpeedEcon: HDDescentSpeed;
	private _speedManager: SpeedManager;
	private _costIndexCoefficient: number;

	constructor(speedManager: SpeedManager) {
		this._speedManager = speedManager;
		/**
		 * TODO: FMC should be removed. All speed related values should be stored directly in SpeedDirector
		 * @private
		 */
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

		this._accelerationSpeedRestriction = new HDAccelerationSpeedRestriction(this._speedManager.repository.v2Speed + 10, 1500, 1500);
		this._overspeedProtection = new HDOverspeedProtection(undefined);

		this._climbSpeedRestriction = new HDClimbSpeedRestriction(undefined, undefined);
		this._climbSpeedTransition = new HDClimbSpeedTransition();
		this._climbSpeedSelected = new HDClimbSpeed(undefined);
		this._climbSpeedEcon = new HDClimbSpeed(this._speedManager.getEconClbManagedSpeed(0));

		this._cruiseSpeedSelected = new HDCruiseSpeed(undefined, undefined);
		this._cruiseSpeedEcon = new HDCruiseSpeed(this._speedManager.getEconCrzManagedSpeed(0), 0.85);

		this._descentSpeedRestriction = new HDDescentSpeedRestriction(undefined, undefined);
		this._descentSpeedTransition = new HDDescentSpeedTransition();
		this._descentSpeedSelected = new HDDescentSpeed(undefined, undefined);
		this._descentSpeedEcon = new HDDescentSpeed(282, undefined);

//		this._waypointSpeedConstraint = new WaypointSpeed(null, null);
	}

	get machModeActive(): boolean {
		return this._machMode;
	}

	_updateMachMode(): void {
		this._machMode = Simplane.getAutoPilotMachModeActive();
		this._updateFmcIfNeeded();
	}

	_updateLastMachMode(): void {
		this._lastMachMode = this._machMode;
	}

	_updateAltitude(): void {
		this._planeAltitude = Simplane.getAltitude();
	}

	_updateManagedSpeed(): void {

	}

	_resolveMachKias(speed: HDSpeed): number {
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
			case HDSpeedPhase.SPEED_PHASE_CLIMB:
				switch (this.commandedSpeedType) {
					case HDSpeedType.SPEED_TYPE_RESTRICTION:
						return this._resolveMachKias(this._climbSpeedRestriction);
					case HDSpeedType.SPEED_TYPE_TRANSITION:
						return this._resolveMachKias(this._climbSpeedTransition);
					case HDSpeedType.SPEED_TYPE_SELECTED:
						return this._resolveMachKias(this._climbSpeedSelected);
					case HDSpeedType.SPEED_TYPE_ACCELERATION:
						return this._resolveMachKias(this._accelerationSpeedRestriction);
					case HDSpeedType.SPEED_TYPE_PROTECTED:
						return this._resolveMachKias(this._overspeedProtection);
//					case SpeedType.SPEED_TYPE_WAYPOINT:
//						return (this.machModeActive ? (this._waypointSpeedConstraint.speedMach ? this._waypointSpeedConstraint.speedMach : this._resolveMachKias(this._waypointSpeedConstraint)) : this._waypointSpeedConstraint.speed);
					case HDSpeedType.SPEED_TYPE_ECON:
						return this._resolveMachKias(this._climbSpeedEcon);
					default:
						return 133;
				}
				break;
			case HDSpeedPhase.SPEED_PHASE_CRUISE:
				switch (this.commandedSpeedType) {
					case HDSpeedType.SPEED_TYPE_RESTRICTION:
					case HDSpeedType.SPEED_TYPE_TRANSITION:
					case HDSpeedType.SPEED_TYPE_ECON:
						return (this.machModeActive ? this._cruiseSpeedEcon.speedMach : this._cruiseSpeedEcon.speed);
					case HDSpeedType.SPEED_TYPE_SELECTED:
						return (this.machModeActive ? (this._cruiseSpeedSelected.speedMach ? this._cruiseSpeedSelected.speedMach : this._resolveMachKias(this._cruiseSpeedSelected)) : this._cruiseSpeedSelected.speed);
					case HDSpeedType.SPEED_TYPE_PROTECTED:
						return this._resolveMachKias(this._overspeedProtection);
//					case SpeedType.SPEED_TYPE_WAYPOINT:
//						return (this.machModeActive ? (this._waypointSpeedConstraint.speedMach ? this._waypointSpeedConstraint.speedMach : this._resolveMachKias(this._waypointSpeedConstraint)) : this._waypointSpeedConstraint.speed);
				}
				break;
			case HDSpeedPhase.SPEED_PHASE_DESCENT:
				switch (this.commandedSpeedType) {
					case HDSpeedType.SPEED_TYPE_RESTRICTION:
						return this._resolveMachKias(this._descentSpeedRestriction);
					case HDSpeedType.SPEED_TYPE_TRANSITION:
						return this._resolveMachKias(this._descentSpeedTransition);
					case HDSpeedType.SPEED_TYPE_SELECTED:
						return (this.machModeActive ? (this._descentSpeedSelected.speedMach ? this._descentSpeedSelected.speedMach : this._resolveMachKias(this._descentSpeedSelected)) : this._descentSpeedSelected.speed);
					case HDSpeedType.SPEED_TYPE_ECON:
						return this._resolveMachKias(this._descentSpeedEcon);
					case HDSpeedType.SPEED_TYPE_PROTECTED:
						return this._resolveMachKias(this._overspeedProtection);
//					case SpeedType.SPEED_TYPE_WAYPOINT:
//						return (this.machModeActive ? (this._waypointSpeedConstraint.speedMach ? this._waypointSpeedConstraint.speedMach : this._resolveMachKias(this._waypointSpeedConstraint)) : this._waypointSpeedConstraint.speed);
				}
				break;
			case HDSpeedPhase.SPEED_PHASE_APPROACH:
				switch (this.commandedSpeedType) {
					case HDSpeedType.SPEED_TYPE_RESTRICTION:
						return this._resolveMachKias(this._descentSpeedRestriction);
					case HDSpeedType.SPEED_TYPE_TRANSITION:
						return this._resolveMachKias(this._descentSpeedTransition);
					case HDSpeedType.SPEED_TYPE_SELECTED:
						return (this.machModeActive ? (this._descentSpeedSelected.speedMach ? this._descentSpeedSelected.speedMach : this._resolveMachKias(this._descentSpeedSelected)) : this._descentSpeedSelected.speed);
					case HDSpeedType.SPEED_TYPE_ECON:
						return this._resolveMachKias(this._descentSpeedEcon);
					case HDSpeedType.SPEED_TYPE_PROTECTED:
						return this._resolveMachKias(this._overspeedProtection);
//					case SpeedType.SPEED_TYPE_WAYPOINT:
//						return (this.machModeActive ? (this._waypointSpeedConstraint.speedMach ? this._waypointSpeedConstraint.speedMach : this._resolveMachKias(this._waypointSpeedConstraint)) : this._waypointSpeedConstraint.speed);
				}
				break;
		}
	}

	get speedPhase() {
		return this._speedPhase;
	}

	get commandedSpeedType() {
		return this._commandedSpeedType;
	}

	_updateLastSpeed() {
		this._lastSpeed = (this.speed ? this.speed : undefined);
	}

	_updateCheckSpeed() {
		this._speedCheck = this.speed;
	}

	update(flightPhase: FlightPhase, costIndexCoefficient: number) {
		this._costIndexCoefficient = costIndexCoefficient;
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
				break;
			case FlightPhase.FLIGHT_PHASE_APPROACH:
				this._updateApproachSpeed();
				break;
		}
		this._updateCheckSpeed();
	}

	_updateClimbSpeed() {
		let speed = {
			[HDSpeedType.SPEED_TYPE_RESTRICTION]: (this._climbSpeedRestriction && this._climbSpeedRestriction.isValid() ? this._climbSpeedRestriction.speed : false),
			[HDSpeedType.SPEED_TYPE_TRANSITION]: (this._climbSpeedTransition && this._climbSpeedTransition.isValid() ? this._climbSpeedTransition.speed : false),
			[HDSpeedType.SPEED_TYPE_ACCELERATION]: (this._accelerationSpeedRestriction && this._accelerationSpeedRestriction.isValid() ? this._accelerationSpeedRestriction.speed : false),
			[HDSpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
			[HDSpeedType.SPEED_TYPE_SELECTED]: (this._climbSpeedSelected && this._climbSpeedSelected.isValid() ? this._climbSpeedSelected.speed : false),
			//[SpeedType.SPEED_TYPE_WAYPOINT]: (this._waypointSpeedConstraint && this._waypointSpeedConstraint.isValid() ? this._waypointSpeedConstraint.speed : false),
			[HDSpeedType.SPEED_TYPE_ECON]: (this._climbSpeedEcon && this._climbSpeedEcon.isValid() ? this._climbSpeedEcon.speed : false)
		};

		this._updateLastCommandedSpeed();
		this._updateLastMachMode();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, HDSpeedType.SPEED_TYPE_ECON);

		commandedSpeedKey = this.shouldCommandSelectedSpeed(commandedSpeedKey);

		this._updateCommandedSpeed(commandedSpeedKey, HDSpeedPhase.SPEED_PHASE_CLIMB);
		this._updateMachMode();
	}

	private shouldCommandSelectedSpeed(commandedSpeedKey: string | HDSpeedType): number {
		if (Number(commandedSpeedKey) === HDSpeedType.SPEED_TYPE_ECON) {
			return this._climbSpeedSelected.isValid() ? HDSpeedType.SPEED_TYPE_SELECTED : HDSpeedType.SPEED_TYPE_ECON;
		} else {
			return Number(commandedSpeedKey);
		}
	}

	_updateCruiseSpeed() {
		let speed = {
			[HDSpeedType.SPEED_TYPE_SELECTED]: (this._cruiseSpeedSelected && this._cruiseSpeedSelected.isValid() ? this._cruiseSpeedSelected.speed : false),
			[HDSpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
			//[SpeedType.SPEED_TYPE_WAYPOINT]: (this._waypointSpeedConstraint && this._waypointSpeedConstraint.isValid() ? this._waypointSpeedConstraint.speed : false),
			[HDSpeedType.SPEED_TYPE_ECON]: (this._cruiseSpeedEcon && this._cruiseSpeedEcon.isValid() ? this._cruiseSpeedEcon.speed : null)
		};

		this._updateLastCommandedSpeed();
		this._updateLastMachMode();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, HDSpeedType.SPEED_TYPE_ECON);

		commandedSpeedKey = this.shouldCommandSelectedSpeed(commandedSpeedKey);

		this._updateCommandedSpeed(commandedSpeedKey, HDSpeedPhase.SPEED_PHASE_CRUISE);
		this._updateMachMode();
	}

	_updateDescentSpeed() {
		let speed = {
			[HDSpeedType.SPEED_TYPE_RESTRICTION]: (this._descentSpeedRestriction && this._descentSpeedRestriction.isValid() ? this._descentSpeedRestriction.speed : false),
			[HDSpeedType.SPEED_TYPE_TRANSITION]: (this._descentSpeedTransition && this._descentSpeedTransition.isValid() ? this._descentSpeedTransition.speed : false),
			[HDSpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
			[HDSpeedType.SPEED_TYPE_SELECTED]: (this._descentSpeedSelected && this._descentSpeedSelected.isValid() ? this._descentSpeedSelected.speed : false),
			//[SpeedType.SPEED_TYPE_WAYPOINT]: (this._waypointSpeedConstraint && this._waypointSpeedConstraint.isValid() ? this._waypointSpeedConstraint.speed : false),
			[HDSpeedType.SPEED_TYPE_ECON]: (this._descentSpeedEcon && this._descentSpeedEcon.isValid() ? this._descentSpeedEcon.speed : false)
		};

		this._updateLastCommandedSpeed();
		this._updateLastMachMode();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, HDSpeedType.SPEED_TYPE_ECON);

		commandedSpeedKey = this.shouldCommandSelectedSpeed(commandedSpeedKey);

		this._updateCommandedSpeed(commandedSpeedKey, HDSpeedPhase.SPEED_PHASE_DESCENT);
		this._updateMachMode();
	}

	_updateApproachSpeed() {
		let speed = {
			[HDSpeedType.SPEED_TYPE_RESTRICTION]: (this._descentSpeedRestriction && this._descentSpeedRestriction.isValid() ? this._descentSpeedRestriction.speed : false),
			[HDSpeedType.SPEED_TYPE_TRANSITION]: (this._descentSpeedTransition && this._descentSpeedTransition.isValid() ? this._descentSpeedTransition.speed : false),
			[HDSpeedType.SPEED_TYPE_PROTECTED]: (this._overspeedProtection && this._overspeedProtection.isValid() ? this._overspeedProtection.speed : false),
			[HDSpeedType.SPEED_TYPE_SELECTED]: (this._descentSpeedSelected && this._descentSpeedSelected.isValid() ? this._descentSpeedSelected.speed : false),
			[HDSpeedType.SPEED_TYPE_ECON]: (this._descentSpeedEcon && this._descentSpeedEcon.isValid() ? this._descentSpeedEcon.speed : false)
		};

		this._updateLastCommandedSpeed();
		this._updateLastMachMode();

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, HDSpeedType.SPEED_TYPE_ECON);

		commandedSpeedKey = this.shouldCommandSelectedSpeed(commandedSpeedKey);

		this._updateCommandedSpeed(commandedSpeedKey, HDSpeedPhase.SPEED_PHASE_APPROACH);
		this._updateMachMode();
	}

	_updateLastCommandedSpeed() {
		this._lastCommandedSpeedType = this._commandedSpeedType;
		this._lastSpeedPhase = this._speedPhase;
	}

	_updateCommandedSpeed(speedType, speedPhase) {
		/**
		 * commandedSpeedType has to be retyped to NUMBER because array filter returns KEY as STRING
		 * @type {number}
		 */
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