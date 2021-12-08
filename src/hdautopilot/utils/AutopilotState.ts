import {AutopilotValueTracker} from './AutopilotValueTracker';
import {NavModeSwitcherEvent} from '../enums/NavModeSwitcherEvent';

export class AutopilotState {
	private readonly autopilot: AutopilotValueTracker;
	private readonly navigationMode: AutopilotValueTracker;
	private readonly toga: AutopilotValueTracker;
	private readonly headingLocked: AutopilotValueTracker;

	private readonly altitudeLocked: AutopilotValueTracker;
	private readonly simulatorAltitudeLocked: AutopilotValueTracker;
	private readonly altitudeSlot: AutopilotValueTracker;
	private readonly selectedAltitude1: AutopilotValueTracker;
	private readonly selectedAltitude2: AutopilotValueTracker;
	private readonly selectedAltitude3: AutopilotValueTracker;

	private readonly grounded: AutopilotValueTracker;

	constructor() {
		(this.autopilot = new AutopilotValueTracker(() => SimVar.GetSimVarValue('L:WT_CJ4_ALT_HOLD', 'number'))).onChange(NavModeSwitcherEvent.AP_CHANGED);
		(this.navigationMode = new AutopilotValueTracker(() => SimVar.GetSimVarValue('L:WT_CJ4_LNAV_MODE', 'number'))).onChange(NavModeSwitcherEvent.NAVIGATION_MODE_CHANGED);
		(this.toga = new AutopilotValueTracker(() => Simplane.getAutoPilotTOGAActive())).onChange(NavModeSwitcherEvent.TOGA_CHANGED);
		(this.headingLocked = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'Boolean'))).onChange(NavModeSwitcherEvent.HEADING_LOCKED_CHANGED);
		(this.altitudeLocked = new AutopilotValueTracker(() => SimVar.GetSimVarValue('L:WT_CJ4_ALT_HOLD', 'number'))).onChange(NavModeSwitcherEvent.ALTITUDE_LOCKED_CHANGED);
		(this.simulatorAltitudeLocked = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Boolean'))).onChange(NavModeSwitcherEvent.SIMULATOR_ALTITUDE_LOCKED_CHANGED);
		(this.altitudeSlot = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE SLOT INDEX', 'number'))).onChange(NavModeSwitcherEvent.ALTITUDE_SLOT_CHANGED);
		(this.selectedAltitude1 = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:1', 'feet'))).onChange(NavModeSwitcherEvent.SELECTED_ALTITUDE_1_CHANGED);
		(this.selectedAltitude2 = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:2', 'feet'))).onChange(NavModeSwitcherEvent.SELECTED_ALTITUDE_2_CHANGED);
		(this.selectedAltitude3 = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:3', 'feet'))).onChange(NavModeSwitcherEvent.SELECTED_ALTITUDE_3_CHANGED);
		(this.grounded = new AutopilotValueTracker(() => Simplane.getIsGrounded())).onChange(NavModeSwitcherEvent.GROUNDED_CHANGED);
	}

	* [Symbol.iterator]() {
		let properties = Object.keys(this);
		for (let property of properties) {
			yield this[property];
		}
	}
}