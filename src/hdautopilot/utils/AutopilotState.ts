import {AutopilotValueTracker} from './AutopilotValueTracker';
import {AutomaticAutopilotDirectorEvent} from '../directors/AutomaticAutopilotDirector';

export class AutopilotState {
	public get autopilot(): AutopilotValueTracker {
		return this._autopilot;
	}

	public get navigationMode(): AutopilotValueTracker {
		return this._navigationMode;
	}

	public get toga(): AutopilotValueTracker {
		return this._toga;
	}

	public get headingLocked(): AutopilotValueTracker {
		return this._headingLocked;
	}

	public get altitudeLocked(): AutopilotValueTracker {
		return this._altitudeLocked;
	}

	public get simulatorAltitudeLocked(): AutopilotValueTracker {
		return this._simulatorAltitudeLocked;
	}

	public get altitudeSlot(): AutopilotValueTracker {
		return this._altitudeSlot;
	}

	public get selectedAltitude1(): AutopilotValueTracker {
		return this._selectedAltitude1;
	}

	public get selectedAltitude2(): AutopilotValueTracker {
		return this._selectedAltitude2;
	}

	public get selectedAltitude3(): AutopilotValueTracker {
		return this._selectedAltitude3;
	}

	public get grounded(): AutopilotValueTracker {
		return this._grounded;
	}

	private readonly _autopilot: AutopilotValueTracker;
	private readonly _navigationMode: AutopilotValueTracker;
	private readonly _toga: AutopilotValueTracker;
	private readonly _headingLocked: AutopilotValueTracker;

	private readonly _altitudeLocked: AutopilotValueTracker;
	private readonly _simulatorAltitudeLocked: AutopilotValueTracker;
	private readonly _altitudeSlot: AutopilotValueTracker;
	private readonly _selectedAltitude1: AutopilotValueTracker;
	private readonly _selectedAltitude2: AutopilotValueTracker;
	private readonly _selectedAltitude3: AutopilotValueTracker;

	private readonly _grounded: AutopilotValueTracker;

	constructor() {
		(this._autopilot = new AutopilotValueTracker(() => Simplane.getAutoPilotActive())).onChange(AutomaticAutopilotDirectorEvent.AP_ON_CHANGE);
		//(this._navigationMode = new AutopilotValueTracker(() => SimVar.GetSimVarValue('L:WT_CJ4_LNAV_MODE', 'number'))).onChange(AutomaticAutopilotDirectorEvent.NAVIGATION_ON_CHANGE);
		(this._navigationMode = new AutopilotValueTracker(() => Simplane.getAPLNAVActive())).onChange(AutomaticAutopilotDirectorEvent.NAVIGATION_ON_CHANGE);
		(this._toga = new AutopilotValueTracker(() => Simplane.getAutoPilotTOGAActive())).onChange(AutomaticAutopilotDirectorEvent.TOGA_ON_CHANGE);
		(this._headingLocked = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'Boolean'))).onChange(AutomaticAutopilotDirectorEvent.HEADING_LOCK_ON_CHANGE);
		(this._altitudeLocked = new AutopilotValueTracker(() => SimVar.GetSimVarValue('L:WT_CJ4_ALT_HOLD', 'number'))).onChange(AutomaticAutopilotDirectorEvent.ALTITUDE_LOCK_ON_CHANGE);
		(this._simulatorAltitudeLocked = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Boolean'))).onChange(AutomaticAutopilotDirectorEvent.SIMULATOR_ALTITUDE_LOCK_ON_CHANGE);
		(this._altitudeSlot = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE SLOT INDEX', 'number'))).onChange(AutomaticAutopilotDirectorEvent.ALTITUDE_SLOT_ON_CHANGE);
		(this._selectedAltitude1 = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:1', 'feet'))).onChange(AutomaticAutopilotDirectorEvent.SELECTED_ALTITUDE_1_ON_CHANGE);
		(this._selectedAltitude2 = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:2', 'feet'))).onChange(AutomaticAutopilotDirectorEvent.SELECTED_ALTITUDE_2_ON_CHANGE);
		(this._selectedAltitude3 = new AutopilotValueTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:3', 'feet'))).onChange(AutomaticAutopilotDirectorEvent.SELECTED_ALTITUDE_3_ON_CHANGE);
		(this._grounded = new AutopilotValueTracker(() => Simplane.getIsGrounded())).onChange(AutomaticAutopilotDirectorEvent.GROUNDED_ON_CHANGE);
	}

	* [Symbol.iterator]() {
		let properties = Object.keys(this);
		for (let property of properties) {
			yield this[property];
		}
	}
}