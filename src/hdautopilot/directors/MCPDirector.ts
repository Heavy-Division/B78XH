import {SimVarValueUnit} from '../../hdsdk/enums/SimVarValueUnit';
import {Queue} from '../../hdsdk';

export class MCPDirector {

	private _pendingQueue = new Queue();
	private _activatedModes = new Map();
	private _armedModes = new Map();

	private _armedLateralMode: MCPLateralMode = undefined;
	private _armedVerticalMode: MCPVerticalMode = undefined;
	private _armedSpeedMode: MCPSpeedMode = undefined;
	private _armedThrustMode: MCPThrustMode = undefined;

	private _activeLateralMode: MCPLateralMode = undefined;
	private _activeVerticalMode: MCPVerticalMode = undefined;
	private _activeSpeedMode: MCPSpeedMode = undefined;
	private _activeThrustMode: MCPThrustMode = undefined;

	private headingHoldInterval: number = undefined;

	/**
	 * TODO: temporary
	 * @type {boolean}
	 */
	_forceNextAltitudeUpdate = true;

	processPending() {
		for (const value of this._armedModes.values()) {
			this._pendingQueue.enqueue(value.getPendingMode());
		}

		for (; this._pendingQueue.length > 0;) {
			const pending = this._pendingQueue.dequeue();
			if (pending.check()) {
				this._armedModes.delete(pending.mode);
				this._activatedModes.set(pending.mode, true);

				console.log('pending');
				for (const mode of this._activatedModes.keys()) {
					console.log(mode);
				}
			}
		}
	}

	/**
	 * Arms/Disarms SPEED mode
	 * engages SPEED mode if the conditions are met
	 */
	public armSpeed(): void {
		const condition = () => {
			return Simplane.getAltitudeAboveGround() > 400;
		};

		if (this._armedModes.has(MCPMode.SPEED)) {
			this.deactivateSpeed();
			this._armedModes.delete(MCPMode.SPEED);
		} else {
			SimVar.SetSimVarValue('L:AP_SPD_ACTIVE', SimVarValueUnit.Number, 1);
			this._armedModes.set(MCPMode.SPEED, new ArmedMode(MCPMode.SPEED, condition, this.activateSpeed.bind(this)));
		}
	}

	/**
	 * Activates SPEED mode
	 */
	public activateSpeed(): void {
		this.engageSpeed();
	}

	/**
	 * Engages SPEED mode
	 */
	public engageSpeed(): void {
		if (Simplane.getAutoPilotMachModeActive()) {
			let currentMach = Simplane.getAutoPilotMachHoldValue();
			Coherent.call('AP_MACH_VAR_SET', 1, currentMach);
			SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_ON', SimVarValueUnit.Number, 1);
		} else {
			let currentSpeed = Simplane.getAutoPilotAirspeedHoldValue();
			Coherent.call('AP_SPD_VAR_SET', 1, currentSpeed);
			SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_OFF', SimVarValueUnit.Number, 1);
		}

		if (!this._activatedModes.has(MCPMode.FLCH)) {
			this.activateSpeedHoldMode();
		}

		Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);

		let stayManagedSpeed = (this._armedModes.has(MCPMode.VNAV) || this._activatedModes.has(MCPMode.VNAV)) && !this._activatedModes.has(MCPMode.SPEED_INTERVENTION);
		if (!stayManagedSpeed) {
			SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		}
	}

	activateSpeedHoldMode(): void {
		if (!Simplane.getAutoPilotMachModeActive()) {
			if (!SimVar.GetSimVarValue('AUTOPILOT AIRSPEED HOLD', SimVarValueUnit.Boolean)) {
				SimVar.SetSimVarValue('K:AP_PANEL_SPEED_HOLD', SimVarValueUnit.Number, 1).catch(console.error);
			}
		} else {
			if (!SimVar.GetSimVarValue('AUTOPILOT MACH HOLD', SimVarValueUnit.Boolean)) {
				SimVar.SetSimVarValue('K:AP_PANEL_MACH_HOLD', SimVarValueUnit.Number, 1).catch(console.error);
			}
		}
	}

	public toggleSpeedIntervention() {
		if (this._activatedModes.has(MCPMode.SPEED_INTERVENTION)) {
			this.deactivateSpeedIntervention();
		} else {
			const condition = () => {
				return this._activatedModes.has(MCPMode.VNAV);
			};
			this._pendingQueue.enqueue(new PendingMode(MCPMode.SPEED_INTERVENTION, condition, this.activateSpeedIntervention.bind(this)));
		}
	}

	public activateSpeedIntervention(): void {
		if (!this._activatedModes.has(MCPMode.VNAV)) {
			return;
		}

		if (Simplane.getAutoPilotMachModeActive()) {
			let currentMach = Simplane.getAutoPilotMachHoldValue();
			Coherent.call('AP_MACH_VAR_SET', 1, currentMach);
		} else {
			let currentSpeed = Simplane.getAutoPilotAirspeedHoldValue();
			Coherent.call('AP_SPD_VAR_SET', 1, currentSpeed);
		}
		SimVar.SetSimVarValue('L:AP_SPEED_INTERVENTION_ACTIVE', SimVarValueUnit.Number, 1);
		SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		if (this._activatedModes.has(MCPMode.SPEED)) {
			return;
		}
		if (!this._armedModes.has(MCPMode.SPEED)) {
			this.armSpeed();
		}
	}

	public deactivateSpeedIntervention(): void {
		this._activatedModes.delete(MCPMode.SPEED_INTERVENTION);
		SimVar.SetSimVarValue('L:AP_SPEED_INTERVENTION_ACTIVE', SimVarValueUnit.Number, 0);
		if (this._activatedModes.has(MCPMode.VNAV)) {
			SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 2);
		}
	}

	public armLNAV(): void {
		if (this._armedModes.has(MCPMode.LNAV)) {
			this._armedModes.delete(MCPMode.LNAV);
			this.deactivateLNAV();
		} else {
			/**
			 * TODO: We should inject the FPM or do the check somewhere else,
			 * because DEBUG_INSTANCE is hidden dependency
			 */
			if (FlightPlanManager.DEBUG_INSTANCE.getWaypointsCount() === 0) {
				return;
			}
			const condition = () => {
				return Simplane.getAltitudeAboveGround() > 50;
			};

			Simplane.setAPLNAVArmed(1);
			this.deactivateHeadingHold();
			this._armedModes.set(MCPMode.LNAV, new ArmedMode(MCPMode.LNAV, condition, this.activateLNAV.bind(this)));
		}
	}

	public activateLNAV(): void {
		this.engageLNAV();
	}

	public engageLNAV(): void {
		if (SimVar.GetSimVarValue('AUTOPILOT APPROACH HOLD', SimVarValueUnit.Boolean)) {
			return;
		}
		Simplane.setAPLNAVActive(1);
		SimVar.SetSimVarValue('K:AP_NAV1_HOLD_ON', SimVarValueUnit.Number, 1);
	}

	armHeadingHold() {
		if (this._activatedModes.has(MCPMode.HEADING_HOLD)) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude < 50) {
				this.deactivateHeadingHold();
			} else {
				this._armedModes.set(MCPMode.LNAV, new ArmedMode(MCPMode.LNAV, () => {
					return true;
				}, this.activateHeadingHold.bind(this)));
			}
		} else {
			this._armedModes.set(MCPMode.LNAV, new ArmedMode(MCPMode.LNAV, () => {
				return true;
			}, this.activateHeadingHold.bind(this)));
		}
	}

	public activateHeadingHold(): void {
		this.deactivateLNAV();
		if (!SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', SimVarValueUnit.Boolean)) {
			SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', SimVarValueUnit.Number, 1);
		}
		SimVar.SetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', SimVarValueUnit.Number, 1);
		const headingHoldValue = Simplane.getHeadingMagnetic();
		SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', SimVarValueUnit.Number, 2);
		this.headingHoldInterval = window.setInterval(() => {
			Coherent.call('HEADING_BUG_SET', 2, headingHoldValue);
		}, 15);
	}

	public armHeadingSelect() {
		this.deactivateHeadingHold();
		this.deactivateLNAV();
		SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', 'number', 1);
		const condition = () => {
			return Simplane.getAltitudeAboveGround() > 400;
		};
		this._armedModes.set(MCPMode.HEADING_SELECT, new ArmedMode(MCPMode.HEADING_SELECT, condition, this.activateHeadingSelect.bind(this)));
	}

	public activateHeadingSelect(): void {
		this.engageHeadingSelect();
	}

	public engageHeadingSelect(): void {
		if (!SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'Boolean')) {
			SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'Number', 1);
		}
	}

	public armFLCH(): void {
		if (this._armedModes.has(MCPMode.FLCH)) {
			this._armedModes.delete(MCPMode.FLCH);
			this.deactivateFLCH();
		} else {
			const condition = () => {
				return Simplane.getAltitudeAboveGround() > 400;
			};
			Simplane.setAPFLCHActive(1);
			this.deactivateVNAV();
			this.deactivateAltitudeHold();
			this.deactivateVSpeed();
			this._armedModes.set(MCPMode.FLCH, new ArmedMode(MCPMode.FLCH, condition, this.activateFLCH.bind(this)));
		}
	}

	activateFLCH(): void {
		this.engageFLCH();
	}

	engageFLCH(): void {
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, displayedAltitude, this._forceNextAltitudeUpdate);
		if (!Simplane.getAutoPilotFLCActive()) {
			SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', SimVarValueUnit.Number, 1);
		}
		SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.CLIMB);
	}

	public armVNAV(): void {
		if (this._armedModes.has(MCPMode.VNAV)) {
			this._armedModes.delete(MCPMode.VNAV);
			this.deactivateVNAV();
			SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
			SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		} else {
			/**
			 * TODO: We should inject the FPM or do the check somewhere else,
			 * because DEBUG_INSTANCE is hidden dependency
			 */
			if (FlightPlanManager.DEBUG_INSTANCE.getWaypointsCount() === 0) {
				return;
			}
			const condition = () => {
				return Simplane.getAltitudeAboveGround() > 400;
			};

			Simplane.setAPVNAVArmed(1);
			this.deactivateAltitudeHold();
			this.deactivateFLCH();
			this.deactivateVSpeed();
			this._armedModes.set(MCPMode.VNAV, new ArmedMode(MCPMode.VNAV, condition, this.activateVNAV.bind(this)));
		}
	}

	public activateVNAV(): void {
		this.engageVNAV();
	}

	public engageVNAV(): void {
		Simplane.setAPVNAVActive(1);
		SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', SimVarValueUnit.Number, 1);
		/**
		 * TODO: THRREFMode should be activated here
		 */
		Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.CLIMB);
		//this.activateTHRREFMode();
		SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 2);
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', SimVarValueUnit.Number, 2);
		if (!this._activatedModes.has(MCPMode.SPEED)) {
			if (!this._armedModes.has(MCPMode.SPEED)) {
				this.armSpeed();
			}
		}

		if (this._activatedModes.has(MCPMode.SPEED)) {
			Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);
		} else {
			Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.CLIMB);
		}

		this.deactivateAltitudeHold();
		this.deactivateFLCH();
		this.deactivateVSpeed();
	}


	public deactivateVNAV(): void {
		this._armedModes.delete(MCPMode.VNAV);
		this._activatedModes.delete(MCPMode.VNAV);
		Simplane.setAPVNAVArmed(0);
		Simplane.setAPVNAVActive(0);
		this.deactivateSpeedIntervention();
	}

	public deactivateVSpeed(): void {
		this._armedModes.delete(MCPMode.VS);
		this._activatedModes.delete(MCPMode.VS);
		SimVar.SetSimVarValue('L:AP_VS_ACTIVE', 'number', 0);
	}

	public deactivateFLCH(): void {
		this._armedModes.delete(MCPMode.FLCH);
		this._activatedModes.delete(MCPMode.FLCH);
		Simplane.setAPFLCHActive(0);
		this.deactivateSpeedIntervention();
	}

	public deactivateAltitudeHold(): void {
		this._armedModes.delete(MCPMode.ALTITUDE_HOLD);
		this._activatedModes.delete(MCPMode.ALTITUDE_HOLD);
		Simplane.setAPAltHoldActive(0);
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
	}

	public deactivateLNAV(): void {
		this._armedModes.delete(MCPMode.LNAV);
		this._activatedModes.delete(MCPMode.LNAV);
		Simplane.setAPLNAVArmed(0);
		Simplane.setAPLNAVActive(0);
	}

	deactivateHeadingHold(): void {
		this._armedModes.delete(MCPMode.HEADING_HOLD);
		this._activatedModes.delete(MCPMode.HEADING_HOLD);
		clearInterval(this.headingHoldInterval);
		SimVar.SetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', 'number', 0);
	}

	/**
	 * Deactivates SPEED mode
	 */
	public deactivateSpeed(): void {
		this._armedModes.delete(MCPMode.SPEED);
		this._activatedModes.delete(MCPMode.SPEED);
		SimVar.SetSimVarValue('L:AP_SPD_ACTIVE', SimVarValueUnit.Number, 0);
	}

	public armVerticalSpeed(): void {
		if (this._activatedModes.has(MCPMode.VS)) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude < 50) {
				this.deactivateVSpeed();
				this.deactivateSpeed();
			} else {
				this._armedModes.set(MCPMode.VS, new ArmedMode(MCPMode.VS, () => {
					return true;
				}, this.activateVSpeed.bind(this)));
			}
		} else {
			this._armedModes.set(MCPMode.VS, new ArmedMode(MCPMode.VS, () => {
				return true;
			}, this.activateVSpeed.bind(this)));
		}
	}

	activateVSpeed(): void {
		this.deactivateVNAV();
		this.deactivateAltitudeHold();
		this.deactivateFLCH();
		this.armSpeed();
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, displayedAltitude, this._forceNextAltitudeUpdate);

		let currentVSpeed = Simplane.getVerticalSpeed();
		Coherent.call('AP_VS_VAR_SET_ENGLISH', 0, currentVSpeed);
		if (!SimVar.GetSimVarValue('AUTOPILOT VERTICAL HOLD', SimVarValueUnit.Boolean)) {
			SimVar.SetSimVarValue('K:AP_PANEL_VS_HOLD', SimVarValueUnit.Number, 1);
		}
		SimVar.SetSimVarValue('L:AP_VS_ACTIVE', SimVarValueUnit.Number, 1);
	}
}

export enum MCPMode {
	SPEED,
	LNAV,
	VNAV,
	FLCH,
	VS,
	SPEED_INTERVENTION,
	ALTITUDE_HOLD,
	HEADING_HOLD,
	HEADING_SELECT
}

export enum MCPLateralMode {
	LNAV,
	HOLD,
	SELECT,
	APPROACH,
	LOCALIZER
}

export enum MCPVerticalMode {
	VNAV,
	FLCH,
	VS,
	HOLD
}

export enum MCPSpeedMode {
	INTERVENTION
}

export enum MCPThrustMode {
	SPEED
}

export class PendingMode {
	public get condition(): Function {
		return this._condition;
	}

	public get mode(): MCPMode {
		return this._mode;
	}

	public get handler(): Function {
		return this._handler;
	}

	private readonly _condition: Function;
	private readonly _mode: MCPMode;
	private readonly _handler: Function;

	constructor(mode: MCPMode, condition: Function, handler: Function) {
		this._mode = mode;
		this._condition = condition;
		this._handler = handler;
	}

	public check() {
		if (this._condition()) {
			this.execute();
			return true;
		}
		return false;
	}

	private execute() {
		this._handler();
	}
}

export class ArmedMode {

	private readonly _condition: Function;
	private readonly _mode: MCPMode;
	private readonly _handler: Function;

	constructor(mode: MCPMode, condition: Function, handler: Function) {
		this._mode = mode;
		this._condition = condition;
		this._handler = handler;
	}

	getPendingMode(): PendingMode {
		return new PendingMode(this._mode, this._condition, this._handler);
	}
}