import {SimVarValueUnit} from '../../hdsdk/enums/SimVarValueUnit';
import {Queue} from '../../hdsdk';

export class MCPDirector {
	private _pendingQueue = new Queue();

	public get pendingQueue(): Queue {
		return this._pendingQueue;
	}

	public set pendingQueue(value: Queue) {
		this._pendingQueue = value;
	}

	private _armedLateralMode: ArmedMode = new ArmedMode(MCPDummyMode.DUMMY, MCPModeType.DUMMY, undefined, undefined);

	public get armedLateralMode(): ArmedMode {
		return this._armedLateralMode;
	}

	public set armedLateralMode(value: ArmedMode) {
		this._armedLateralMode = (value ? value : new ArmedMode(MCPDummyMode.DUMMY, MCPModeType.DUMMY, undefined, undefined));
	}

	private _armedVerticalMode: ArmedMode = new ArmedMode(MCPDummyMode.DUMMY, MCPModeType.DUMMY, undefined, undefined);

	public get armedVerticalMode(): ArmedMode {
		return this._armedVerticalMode;
	}

	public set armedVerticalMode(value: ArmedMode) {
		this._armedVerticalMode = (value ? value : new ArmedMode(MCPDummyMode.DUMMY, MCPModeType.DUMMY, undefined, undefined));
	}

	private _armedSpeedMode: ArmedMode = new ArmedMode(MCPDummyMode.DUMMY, MCPModeType.DUMMY, undefined, undefined);

	public get armedSpeedMode(): ArmedMode {
		return this._armedSpeedMode;
	}

	public set armedSpeedMode(value: ArmedMode) {
		this._armedSpeedMode = (value ? value : new ArmedMode(MCPDummyMode.DUMMY, MCPModeType.DUMMY, undefined, undefined));
	}

	private _armedThrustMode: ArmedMode = new ArmedMode(MCPDummyMode.DUMMY, MCPModeType.DUMMY, undefined, undefined);

	public get armedThrustMode(): ArmedMode {
		return this._armedThrustMode;
	}

	public set armedThrustMode(value: ArmedMode) {
		this._armedThrustMode = (value ? value : new ArmedMode(MCPDummyMode.DUMMY, MCPModeType.DUMMY, undefined, undefined));
	}

	private _activatedLateralMode: MCPLateralMode = undefined;

	public get activatedLateralMode(): MCPLateralMode {
		return this._activatedLateralMode;
	}

	public set activatedLateralMode(value: MCPLateralMode) {
		this._activatedLateralMode = value;
	}

	private _activatedVerticalMode: MCPVerticalMode = undefined;

	public get activatedVerticalMode(): MCPVerticalMode {
		return this._activatedVerticalMode;
	}

	public set activatedVerticalMode(value: MCPVerticalMode) {
		this._activatedVerticalMode = value;
	}

	private _activatedSpeedMode: MCPSpeedMode = undefined;

	public get activatedSpeedMode(): MCPSpeedMode {
		return this._activatedSpeedMode;
	}

	public set activatedSpeedMode(value: MCPSpeedMode) {
		this._activatedSpeedMode = value;
	}

	/**
	 * Idea: Use MAP for ThrustMode because theoretically it is possible to have more then one ThrustMode enabled.
	 * @type {MCPThrustMode}
	 * @private
	 */
	private _activatedThrustMode: MCPThrustMode = undefined;

	public get activatedThrustMode(): MCPThrustMode {
		return this._activatedThrustMode;
	}

	public set activatedThrustMode(value: MCPThrustMode) {
		this._activatedThrustMode = value;
	}

	private _headingHoldInterval: number = undefined;

	public get headingHoldInterval(): number {
		return this._headingHoldInterval;
	}

	public set headingHoldInterval(value: number) {
		this._headingHoldInterval = value;
	}

	/**
	 * TODO: temporary
	 * @type {boolean}
	 */
	private _forceNextAltitudeUpdate = true;

	public get forceNextAltitudeUpdate(): boolean {
		return this._forceNextAltitudeUpdate;
	}

	public set forceNextAltitudeUpdate(value: boolean) {
		this._forceNextAltitudeUpdate = value;
	}

	public processPending(): void {
		for (const mode of [this.armedLateralMode, this.armedVerticalMode, this.armedSpeedMode, this.armedThrustMode]) {
			/**
			 * TODO: Be aware of MCPDummyMode.DUMMY check. MCPDummyMode.DUMMY has to checked together with modeType MCPModeType.DUMMY
			 * (better to check only mode.mode !== undefined)
			 */
			if (mode.mode !== undefined) {
				this.pendingQueue.enqueue(mode.getPendingMode());
			}
		}

		for (; this.pendingQueue.length > 0;) {
			const pending = this.pendingQueue.dequeue();
			if (pending.check()) {
				switch (pending.modeType) {
					case MCPModeType.LATERAL:

						this.armedLateralMode = undefined;
						this.activatedLateralMode = pending.mode;
						break;
					case MCPModeType.VERTICAL:
						this.armedVerticalMode = undefined;
						this.activatedVerticalMode = pending.mode;
						break;
					case MCPModeType.SPEED:
						this.armedSpeedMode = undefined;
						this.activatedSpeedMode = pending.mode;
						break;
					case MCPModeType.THRUST:
						this.armedThrustMode = undefined;
						this.activatedThrustMode = pending.mode;
						break;
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

		if (this.armedThrustMode.mode === MCPThrustMode.SPEED) {
			this.deactivateSpeed();
			this.armedThrustMode = undefined;
		} else {
			SimVar.SetSimVarValue('L:AP_SPD_ACTIVE', SimVarValueUnit.Number, 1);
			this.armedThrustMode = new ArmedMode(MCPThrustMode.SPEED, MCPModeType.THRUST, condition, this.activateSpeed.bind(this));
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

		if (this.activatedVerticalMode !== MCPVerticalMode.FLCH) {
			this.activateSpeedHoldMode();
		}

		Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);

		let stayManagedSpeed = (this.armedVerticalMode.mode !== MCPVerticalMode.VNAV || this.activatedVerticalMode !== MCPVerticalMode.VNAV) && this.activatedSpeedMode !== MCPSpeedMode.INTERVENTION;
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
		if (this.activatedSpeedMode === MCPSpeedMode.INTERVENTION) {
			this.deactivateSpeedIntervention();
		} else {
			const condition = () => {
				return this.activatedVerticalMode === MCPVerticalMode.VNAV;
			};
			this.pendingQueue.enqueue(new PendingMode(MCPSpeedMode.INTERVENTION, MCPModeType.SPEED, condition, this.activateSpeedIntervention.bind(this)));
		}
	}

	public activateSpeedIntervention(): void {
		if (this.activatedVerticalMode !== MCPVerticalMode.VNAV) {
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
		if (this.activatedThrustMode === MCPThrustMode.SPEED) {
			return;
		}
		if (this.armedThrustMode.mode !== MCPThrustMode.SPEED) {
			this.armSpeed();
		}
	}

	public deactivateSpeedIntervention(): void {
		this.activatedSpeedMode = undefined;
		SimVar.SetSimVarValue('L:AP_SPEED_INTERVENTION_ACTIVE', SimVarValueUnit.Number, 0);
		if (this.activatedVerticalMode === MCPVerticalMode.VNAV) {
			SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 2);
		}
	}

	public armLNAV(): void {
		if (this.armedLateralMode.mode === MCPLateralMode.LNAV) {
			this.armedLateralMode = undefined;
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
			console.log('ARMING LNAV');
			this.armedLateralMode = new ArmedMode(MCPLateralMode.LNAV, MCPModeType.LATERAL, condition, this.activateLNAV.bind(this));
		}
	}

	public activateLNAV(): void {
		this.engageLNAV();
	}

	public engageLNAV(): void {

		console.log('ENGAGE LNAV');
		if (SimVar.GetSimVarValue('AUTOPILOT APPROACH HOLD', SimVarValueUnit.Boolean)) {
			return;
		}
		Simplane.setAPLNAVActive(1);
		SimVar.SetSimVarValue('K:AP_NAV1_HOLD_ON', SimVarValueUnit.Number, 1);
	}


	/**
	 * TODO: Probably wrong condition ( return true )
	 */
	public armHeadingHold() {
		if (this.activatedLateralMode === MCPLateralMode.HOLD) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude < 50) {
				this.deactivateHeadingHold();
			} else {
				this.armedLateralMode = new ArmedMode(MCPLateralMode.HOLD, MCPModeType.LATERAL, () => {
					return true;
				}, this.activateHeadingHold.bind(this));
			}
		} else {
			this.armedLateralMode = new ArmedMode(MCPLateralMode.HOLD, MCPModeType.LATERAL, () => {
				return true;
			}, this.activateHeadingHold.bind(this));
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
			console.log('update heading hold');
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
		this.armedLateralMode = new ArmedMode(MCPLateralMode.SELECT, MCPModeType.LATERAL, condition, this.activateHeadingSelect.bind(this));
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
		if (this.armedVerticalMode.mode === MCPVerticalMode.FLCH) {
			this.armedVerticalMode = undefined;
			this.deactivateFLCH();
		} else {
			const condition = () => {
				return Simplane.getAltitudeAboveGround() > 400;
			};
			Simplane.setAPFLCHActive(1);
			this.deactivateVNAV();
			this.deactivateAltitudeHold();
			this.deactivateVSpeed();
			this.armedVerticalMode = new ArmedMode(MCPVerticalMode.FLCH, MCPModeType.VERTICAL, condition, this.activateFLCH.bind(this));
		}
	}

	activateFLCH(): void {
		this.engageFLCH();
	}

	engageFLCH(): void {
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, displayedAltitude, this.forceNextAltitudeUpdate);
		if (!Simplane.getAutoPilotFLCActive()) {
			SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', SimVarValueUnit.Number, 1);
		}
		SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.CLIMB);
	}

	public armVNAV(): void {
		if (this.armedVerticalMode.mode === MCPVerticalMode.VNAV) {
			this.armedVerticalMode = undefined;
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
			this.armedVerticalMode = new ArmedMode(MCPVerticalMode.VNAV, MCPModeType.VERTICAL, condition, this.activateVNAV.bind(this));
		}
	}

	public activateVNAV(): void {
		this.engageVNAV();
	}

	public engageVNAV(): void {
		Simplane.setAPVNAVActive(1);
		SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', SimVarValueUnit.Number, 1);
		/**
		 * TODO: THRREFMode should be activated here (CLIMB used instead right now)
		 */
		Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.CLIMB);
		//this.activateTHRREFMode();
		SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', SimVarValueUnit.Number, 2);
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', SimVarValueUnit.Number, 2);
		if (this.activatedThrustMode !== MCPThrustMode.SPEED) {
			if (this.armedThrustMode.mode !== MCPThrustMode.SPEED) {
				this.armSpeed();
			}
		}

		if (this.activatedThrustMode === MCPThrustMode.SPEED) {
			Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);
		} else {
			Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.CLIMB);
		}

		this.deactivateAltitudeHold();
		this.deactivateFLCH();
		this.deactivateVSpeed();
	}


	public deactivateVNAV(): void {
		this.activatedVerticalMode = undefined;
		Simplane.setAPVNAVArmed(0);
		Simplane.setAPVNAVActive(0);
		this.deactivateSpeedIntervention();
	}

	public deactivateVSpeed(): void {
		this.activatedVerticalMode = undefined;
		SimVar.SetSimVarValue('L:AP_VS_ACTIVE', 'number', 0);
	}

	public deactivateFLCH(): void {
		this.activatedVerticalMode = undefined;
		Simplane.setAPFLCHActive(0);
		this.deactivateSpeedIntervention();
	}

	public deactivateAltitudeHold(): void {
		this.activatedVerticalMode = undefined;
		Simplane.setAPAltHoldActive(0);
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this.forceNextAltitudeUpdate);
	}

	public deactivateLNAV(): void {
		this.activatedLateralMode = undefined;
		Simplane.setAPLNAVArmed(0);
		Simplane.setAPLNAVActive(0);
	}

	deactivateHeadingHold(): void {
		this.activatedLateralMode = undefined;
		clearInterval(this.headingHoldInterval);
		SimVar.SetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', 'number', 0);
	}

	/**
	 * Deactivates SPEED mode
	 */
	public deactivateSpeed(): void {
		this.activatedThrustMode = undefined;
		SimVar.SetSimVarValue('L:AP_SPD_ACTIVE', SimVarValueUnit.Number, 0);
	}

	public armVerticalSpeed(): void {
		if (this.activatedVerticalMode === MCPVerticalMode.VS) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude < 50) {
				this.deactivateVSpeed();
				this.deactivateSpeed();
			} else {
				this.armedVerticalMode = new ArmedMode(MCPVerticalMode.VS, MCPModeType.VERTICAL, () => {
					return true;
				}, this.activateVSpeed.bind(this));
			}
		} else {
			this.armedVerticalMode = new ArmedMode(MCPVerticalMode.VS, MCPModeType.VERTICAL, () => {
				return true;
			}, this.activateVSpeed.bind(this));
		}
	}

	activateVSpeed(): void {
		this.deactivateVNAV();
		this.deactivateAltitudeHold();
		this.deactivateFLCH();
		this.armSpeed();
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', SimVarValueUnit.Number, 1);
		let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, displayedAltitude, this.forceNextAltitudeUpdate);

		let currentVSpeed = Simplane.getVerticalSpeed();
		Coherent.call('AP_VS_VAR_SET_ENGLISH', 0, currentVSpeed);
		if (!SimVar.GetSimVarValue('AUTOPILOT VERTICAL HOLD', SimVarValueUnit.Boolean)) {
			SimVar.SetSimVarValue('K:AP_PANEL_VS_HOLD', SimVarValueUnit.Number, 1);
		}
		SimVar.SetSimVarValue('L:AP_VS_ACTIVE', SimVarValueUnit.Number, 1);
	}
}

export enum MCPModeType {
	LATERAL,
	VERTICAL,
	SPEED,
	THRUST,
	DUMMY
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

/**
 * Be aware:
 * This is not good way to make dummy armed mode because ModeType has to be also checked (Temporary fix implemented in ArmedMode class)
 */
export enum MCPDummyMode {
	DUMMY
}

export class PendingMode {
	private readonly _condition: Function;
	private readonly _mode: MCPLateralMode | MCPVerticalMode | MCPSpeedMode | MCPThrustMode | MCPDummyMode;
	private readonly _modeType: MCPModeType;
	private readonly _handler: Function;

	/**
	 * TODO: Make better type check for MODE param
	 * @param {MCPLateralMode | MCPVerticalMode | MCPSpeedMode | MCPThrustMode} mode
	 * @param {MCPModeType} modeType
	 * @param {Function} condition
	 * @param {Function} handler
	 */
	constructor(mode: MCPLateralMode | MCPVerticalMode | MCPSpeedMode | MCPThrustMode | MCPDummyMode, modeType: MCPModeType, condition: Function, handler: Function) {
		this._mode = mode;
		this._modeType = modeType;
		this._condition = condition;
		this._handler = handler;
	}

	public get condition(): Function {
		return this._condition;
	}

	public get mode(): MCPLateralMode | MCPVerticalMode | MCPSpeedMode | MCPThrustMode | MCPDummyMode {
		return this._mode;
	}

	public get modeType(): MCPModeType {
		return this._modeType;
	}

	public get handler(): Function {
		return this._handler;
	}

	public check() {
		if (this.condition) {
			if (this.condition()) {
				this.execute();
				return true;
			}
		}
		return false;
	}

	private execute() {
		this.handler();
	}
}

export class ArmedMode {
	private readonly _condition: Function;
	private readonly _mode: MCPLateralMode | MCPVerticalMode | MCPSpeedMode | MCPThrustMode | MCPDummyMode;
	private readonly _modeType: MCPModeType;
	private readonly _handler: Function;

	/**
	 * TODO: Make better type check for MODE param
	 * @param {MCPLateralMode | MCPVerticalMode | MCPSpeedMode | MCPThrustMode} mode
	 * @param {MCPModeType} modeType
	 * @param {Function} condition
	 * @param {Function} handler
	 */
	constructor(mode: MCPLateralMode | MCPVerticalMode | MCPSpeedMode | MCPThrustMode | MCPDummyMode, modeType: MCPModeType, condition: Function, handler: Function) {
		this._mode = (mode === MCPDummyMode.DUMMY && modeType === MCPModeType.DUMMY ? undefined : mode);
		this._modeType = modeType;
		this._condition = condition;
		this._handler = handler;
	}

	public get mode(): MCPLateralMode | MCPVerticalMode | MCPSpeedMode | MCPThrustMode | MCPDummyMode {
		return this._mode;
	}

	public get modeType(): MCPModeType {
		return this._modeType;
	}

	private get condition(): Function {
		return this._condition;
	}

	private get handler(): Function {
		return this._handler;
	}

	getPendingMode(): PendingMode {
		return new PendingMode(this.mode, this.modeType, this.condition, this.handler);
	}
}