/**
 * A class that handles state transitions to the different autopilot modes of
 * the CJ4.
 */
class B78XHNavModeSelector {

	/**
	 * Creates a new instance of the CJ4NavModeSelector.
	 * @param {FlightPlanManager} flightPlanManager The flight plan manager to use with this instance.
	 */
	constructor(flightPlanManager, fmc) {

		this._fmc = fmc;

		/** The current flight plan manager. */
		this.flightPlanManager = flightPlanManager;

		/** The current flight plan version. */
		this.currentPlanVersion = 0;

		/** The current loaded approach index. */
		this.currentApproachIndex = undefined;

		/** The current loaded destination runway index. */
		this.currentDestinationRunwayIndex = undefined;

		/** The current active lateral nav mode. */
		this.currentLateralActiveState = LateralNavModeState.NONE;

		/** The current armed lateral nav mode. */
		this.currentLateralArmedState = LateralNavModeState.NONE;

		/** The current active vertical nav mode. */
		this.currentVerticalActiveState = VerticalNavModeState.PTCH;

		/** The current armed altitude mode. */
		this.currentArmedAltitudeState = VerticalNavModeState.NONE;

		/** The current armed vnav mode. */
		this.currentArmedVnavState = VerticalNavModeState.NONE;

		/** The current armed approach mode. */
		this.currentArmedApproachVerticalState = VerticalNavModeState.NONE;

		/** Whether or not VNAV is on. */
		this.isVNAVOn = false;

		/** The current VPath state. */
		this.vPathState = VnavPathStatus.NONE;

		/** The current RNAV Glidepath state. */
		this.glidepathState = GlidepathStatus.NONE;

		/** The current ILS Glideslope state. */
		this.glideslopeState = GlideslopeStatus.NONE;

		/** The current LNav mode state. */
		this.lNavModeState = LNavModeState.FMS;

		/** The current altitude slot index. */
		this.currentAltSlotIndex = 0;

		/** Whether or not altitude lock is currently active. */
		this.isAltitudeLocked = false;

		/** The selected altitude in altitude lock slot 1. */
		this.selectedAlt1 = 0;

		/** The selected altitude in altitude lock slot 2. */
		this.selectedAlt2 = 0;

		/** The currently selected approach type. */
		this.approachMode = WT_ApproachType.NONE;

		/** The vnav requested slot. */
		this.vnavRequestedSlot = undefined;

		/** The vnav managed altitude target. */
		this.managedAltitudeTarget = undefined;

		/** The current AP target altitude type. */
		this.currentAltitudeTracking = AltitudeState.SELECTED;

		/** The pressure/locked altitude value for WT Vertical AP. */
		this.pressureAltitudeTarget = undefined;

		/**
		 * The queue of state change events to process.
		 * @type {string[]}
		 */
		this._eventQueue = [];

		/** The current states of the input data. */
		this._inputDataStates = {
			//altLocked: new ValueStateTracker(() => SimVar.GetSimVarValue('L:WT_CJ4_ALT_HOLD', 'number') == 1, () => NavModeEvent.ALT_LOCK_CHANGED),
			//simAltLocked: new ValueStateTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Boolean'), () => NavModeEvent.SIM_ALT_LOCK_CHANGED),
			//altSlot: new ValueStateTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE SLOT INDEX', 'number'), () => NavModeEvent.ALT_SLOT_CHANGED),
			//selectedAlt1: new ValueStateTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:1', 'feet'), () => NavModeEvent.SELECTED_ALT1_CHANGED),
			//selectedAlt2: new ValueStateTracker(() => SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:2', 'feet'), () => NavModeEvent.SELECTED_ALT2_CHANGED),
			//navmode: new ValueStateTracker(() => SimVar.GetSimVarValue('L:WT_CJ4_LNAV_MODE', 'number'), () => NavModeEvent.NAV_MODE_CHANGED),
			//hdg_lock: new ValueStateTracker(() => SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'Boolean'), () => NavModeEvent.HDG_LOCK_CHANGED),
			//toga: new ValueStateTracker(() => Simplane.getAutoPilotTOGAActive(), () => NavModeEvent.TOGA_CHANGED),
			//grounded: new ValueStateTracker(() => Simplane.getIsGrounded(), () => NavModeEvent.GROUNDED),
			//autopilot: new ValueStateTracker(() => Simplane.getAutoPilotActive(), () => NavModeEvent.AP_CHANGED)
		};

		/** The event handlers for each event type. */
		this._handlers = {
			[`${NavModeEvent.VS_PRESSED}`]: this.handleVSPressed.bind(this),
			[`${NavModeEvent.LNAV_PRESSED}`]: this.handleLNAVPressed.bind(this),
			[`${NavModeEvent.LNAV_ACTIVE}`]: this.handleLNAVActive.bind(this),
			[`${NavModeEvent.HDG_HOLD_PRESSED}`]: this.handleHDGHoldActive.bind(this),
			[`${NavModeEvent.HDG_SEL_PRESSED}`]: this.handleHDGSelActive.bind(this)
		};

		this.initialize();
	}



	handleVSPressed() {

		switch (this.currentVerticalActiveState) {
			case VerticalNavModeState.TO:
			case VerticalNavModeState.GA:
				SimVar.SetSimVarValue("K:AUTO_THROTTLE_TO_GA", "number", 0);
			case VerticalNavModeState.PTCH:
			case VerticalNavModeState.FLC:
			case VerticalNavModeState.ALTCAP:
			case VerticalNavModeState.ALTVCAP:
			case VerticalNavModeState.ALTSCAP:
			case VerticalNavModeState.ALTV:
			case VerticalNavModeState.ALTS:
			case VerticalNavModeState.ALT:
			case VerticalNavModeState.GS:
			case VerticalNavModeState.PATH:
			case VerticalNavModeState.GP:
				this.currentVerticalActiveState = VerticalNavModeState.VS;
				this.engageVerticalSpeed();
				break;
			case VerticalNavModeState.VS:
				this.currentVerticalActiveState = VerticalNavModeState.PTCH;
				this.engagePitch();
				break;
		}

		this.setProperAltitudeArmedState();
	}

	handleLNAVPressed() {
		if (this.currentLateralActiveState !== LateralNavModeState.LNAV) {
			SimVar.SetSimVarValue('L:AP_LNAV_ARMED', 'number', 1);
			this.currentLateralArmedState = LateralNavModeState.LNAV;
		}
	}

	handleLNAVActive() {
		if (this.currentLateralArmedState === LateralNavModeState.LNAV) {
			switch (this.currentLateralActiveState) {
				case LateralNavModeState.NONE:
					this.changeToCorrectLNavForMode(false, false);
					break;
				case LateralNavModeState.HDG:
					this.changeToCorrectLNavForMode(false, false);
					break;
				case LateralNavModeState.TO:
				case LateralNavModeState.GA:
					//SimVar.SetSimVarValue('L:WT_CJ4_NAV_ON', 'number', 1);
					//SimVar.SetSimVarValue('L:WT_CJ4_HDG_ON', 'number', 0);
					this.changeToCorrectLNavForMode(false, false);
					break;
			}

			this.currentLateralArmedState = LateralNavModeState.NONE;
		}

		if (this.currentLateralArmedState === LateralNavModeState.APPR) {
			SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', 'number', 2);
			if (SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'number') == 0) {
				SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'number', 1);
			}

			this.currentLateralArmedState = LateralNavModeState.NONE;
			this.currentLateralActiveState = LateralNavModeState.APPR;
		}
	}

	handleHDGHoldActive(){
		SimVar.SetSimVarValue("L:AP_LNAV_ARMED", "number", 0);
		SimVar.SetSimVarValue("L:AP_LNAV_ACTIVE", "number", 0);
		if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
//			SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
		}
		SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
		SimVar.SetSimVarValue("L:AP_HEADING_HOLD_ACTIVE", "number", 1);
		const headingHoldValue = Simplane.getHeadingMagnetic();
		SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 2);
		Coherent.call("HEADING_BUG_SET", 2, headingHoldValue);
		this.currentLateralArmedState = LateralNavModeState.NONE
		this.currentLateralActiveState = LateralNavModeState.HDG
	}

	handleHDGSelActive(){
		SimVar.SetSimVarValue("L:AP_HEADING_HOLD_ACTIVE", "number", 0);
		SimVar.SetSimVarValue("L:AP_LNAV_ARMED", "number", 0);
		SimVar.SetSimVarValue("L:AP_LNAV_ACTIVE", "number", 0);
		SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 1);
		if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
			SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
		}
		this.currentLateralArmedState = LateralNavModeState.NONE
		this.currentLateralActiveState = LateralNavModeState.HDG
	}

	changeToCorrectLNavForMode(activateHeadingHold, arm) {
		console.log(this.lNavModeState);
		if (this.lNavModeState === LNavModeState.FMS) {
			if (!arm) {
				if (SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "boolean")) {
					console.log("approach hold")
					return;
				}
				console.log("lnav ok")
				SimVar.SetSimVarValue("L:AP_LNAV_ACTIVE", "number", 1);
				SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 2);
				SimVar.SetSimVarValue("K:AP_NAV1_HOLD_ON", "number", 1);
				SimVar.SetSimVarValue("L:AP_HEADING_HOLD_ACTIVE", "number", 0);
				SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'number', 0);
				if (activateHeadingHold) {
					SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'number', 1);
				}

				this.currentLateralActiveState = LateralNavModeState.LNAV;
			} else {
				this.currentLateralArmedState = LateralNavModeState.LNAV;
			}
		} else {
			SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', 'number', 1);
			if (this.lNavModeState === LNavModeState.NAV1) {
				SimVar.SetSimVarValue('K:AP_NAV_SELECT_SET', 'number', 1);
			} else {
				SimVar.SetSimVarValue('K:AP_NAV_SELECT_SET', 'number', 2);
			}

			if (this.currentLateralActiveState !== LateralNavModeState.NAV) {
				const apOnGPS = SimVar.GetSimVarValue('GPS DRIVES NAV1', 'Bool');
				if (apOnGPS) {
					SimVar.SetSimVarValue('K:TOGGLE_GPS_DRIVES_NAV1', 'number', 0);
				}

				SimVar.SetSimVarValue('K:AP_NAV1_HOLD', 'number', 1);
			}

			this.currentLateralActiveState = LateralNavModeState.NAV;
		}
	}

	handleLocActive() {
		if (this.currentLateralArmedState === LateralNavModeState.APPR) {
			this.currentLateralArmedState = LateralNavModeState.NONE;
			this.currentLateralActiveState = LateralNavModeState.APPR;

			if (SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'number') != 1) {
				SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'number', 1);
			}

			SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', 'number', 2);
		}
	}

	setSimAltSlot(slot) {
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', 'number', slot);
	}

	setSimAltitude(slot, altitude) {
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', slot, altitude, true);
	}

	/**
	 * Initializes the nav mode selector and resets all autopilot modes to default.
	 */
	initialize() {
		if (SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'number') == 1) {
			SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'number', 1);
		}

		if (SimVar.GetSimVarValue('AUTOPILOT NAV1 LOCK', 'number') == 1) {
			SimVar.SetSimVarValue('K:AP_NAV1_HOLD', 'number', 0);
		}

		if (SimVar.GetSimVarValue('AUTOPILOT VERTICAL HOLD', 'number') == 1) {
			SimVar.SetSimVarValue('K:AP_PANEL_VS_HOLD', 'number', 0);
		}

		if (SimVar.GetSimVarValue('AUTOPILOT FLIGHT LEVEL CHANGE', 'number') == 1) {
			SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE', 'number', 0);
		}

		if (SimVar.GetSimVarValue('AUTOPILOT APPROACH HOLD', 'number') == 1 || SimVar.GetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'number') == 1) {
			SimVar.SetSimVarValue('K:AP_APR_HOLD', 'number', 0);
		}

		if (SimVar.GetSimVarValue('AUTOPILOT BACKCOURSE HOLD', 'number') == 1) {
			SimVar.SetSimVarValue('K:AP_BC_HOLD', 'number', 0);
		}

	}

	/**
	 * Called when a AP button is pressed.
	 * @param {string} evt
	 */
	onNavChangedEvent(evt) {
		this.queueEvent(evt);
		this.processEvents();
	}

	/**
	 * Geneates events from the changing of input data from various sources.
	 */
	generateInputDataEvents() {
		for (var key in this._inputDataStates) {
			const event = this._inputDataStates[key].updateState();

			if (event !== undefined) {
				this.queueEvent(event);
			}
		}

		if (this.currentVerticalActiveState === VerticalNavModeState.ALTCAP ||
			this.currentVerticalActiveState === VerticalNavModeState.ALTSCAP || this.currentVerticalActiveState === VerticalNavModeState.ALTVCAP) {
			const currentAltitude = SimVar.GetSimVarValue('INDICATED ALTITUDE', 'feet');
			const targetAltitude = SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:3', 'feet');

			if (Math.abs(currentAltitude - targetAltitude) < 50) {
				this.queueEvent(NavModeEvent.ALT_CAPTURED);
			}
		}

		const planVersion = SimVar.GetSimVarValue('L:WT.FlightPlan.Version', 'number');
		if (planVersion != this.currentPlanVersion) {
			this.currentPlanVersion = planVersion;

			const flightPlan = this.flightPlanManager.getFlightPlan(0);
			const approachIndex = flightPlan.procedureDetails.approachIndex;
			const destinationRunwayIndex = flightPlan.procedureDetails.destinationRunwayIndex;

			if (approachIndex !== this.currentApproachIndex) {
				this.currentApproachIndex = approachIndex;
				this.queueEvent(NavModeEvent.APPROACH_CHANGED);
			} else if (approachIndex === -1 && this.currentDestinationRunwayIndex !== destinationRunwayIndex) {
				this.currentDestinationRunwayIndex = destinationRunwayIndex;
				this.queueEvent(NavModeEvent.APPROACH_CHANGED);
			}
		}
	}

	/**
	 * Processes queued state changes.
	 */
	processEvents() {
		while (this._eventQueue.length > 0) {
			const event = this._eventQueue.shift();
			if (this._handlers[event]) {
				this._handlers[event]();
			}
		}
	}

	/**
	 * Queues an event with the mode selector state machine.
	 * @param {string} event The event type to queue.
	 */
	queueEvent(event) {
		this._eventQueue.push(event);
	}
}

class LateralNavModeState {
}

LateralNavModeState.NONE = 'NONE';
LateralNavModeState.LNAV = 'LNV1';
LateralNavModeState.NAV = 'NAV';
LateralNavModeState.HDG = 'HDG';
LateralNavModeState.APPR = 'APPR';
LateralNavModeState.TO = 'TO';
LateralNavModeState.GA = 'GA';

class VerticalNavModeState {
}

VerticalNavModeState.NONE = 'NONE';
VerticalNavModeState.PTCH = 'PTCH';
VerticalNavModeState.FLC = 'FLC';
VerticalNavModeState.VS = 'VS';
VerticalNavModeState.GS = 'GS';
VerticalNavModeState.GP = 'GP';
VerticalNavModeState.ALT = 'ALT';
VerticalNavModeState.ALTCAP = 'ALT CAP';
VerticalNavModeState.ALTS = 'ALTS';
VerticalNavModeState.ALTSCAP = 'ALTS CAP';
VerticalNavModeState.ALTV = 'ALTV';
VerticalNavModeState.ALTVCAP = 'ALTV CAP';
VerticalNavModeState.PATH = 'PATH';
VerticalNavModeState.NOPATH = 'NOPATH';
VerticalNavModeState.TO = 'TO';
VerticalNavModeState.GA = 'GA';

class LNavModeState {
}

LNavModeState.FMS = 'fms';
LNavModeState.NAV1 = 'nav1';
LNavModeState.NAV2 = 'nav2';

class NavModeEvent {
}

NavModeEvent.ALT_LOCK_CHANGED = 'alt_lock_changed';
NavModeEvent.SIM_ALT_LOCK_CHANGED = 'sim_alt_lock_changed';
NavModeEvent.ALT_CAPTURED = 'alt_captured';
NavModeEvent.NAV_PRESSED = 'NAV_PRESSED';
NavModeEvent.NAV_MODE_CHANGED = 'nav_mode_changed_to_nav';
NavModeEvent.NAV_MODE_CHANGED_TO_FMS = 'nav_mode_changed_to_fms';
NavModeEvent.HDG_HOLD_PRESSED = 'HDG_HOLD_PRESSED';
NavModeEvent.HDG_SEL_PRESSED = 'HDG_SEL_PRESSED';
NavModeEvent.LNAV_PRESSED = 'LNAV_PRESSED';
NavModeEvent.APPR_PRESSED = 'APPR_PRESSED';
NavModeEvent.FLC_PRESSED = 'FLC_PRESSED';
NavModeEvent.VS_PRESSED = 'VS_PRESSED';
NavModeEvent.BC_PRESSED = 'BC_PRESSED';
NavModeEvent.VNAV_PRESSED = 'VNAV_PRESSED';
NavModeEvent.ALT_SLOT_CHANGED = 'alt_slot_changed';
NavModeEvent.SELECTED_ALT1_CHANGED = 'selected_alt1_changed';
NavModeEvent.SELECTED_ALT2_CHANGED = 'selected_alt2_changed';
NavModeEvent.APPROACH_CHANGED = 'approach_changed';
NavModeEvent.VNAV_REQUEST_SLOT_1 = 'vnav_request_slot_1';
NavModeEvent.VNAV_REQUEST_SLOT_2 = 'vnav_request_slot_2';
NavModeEvent.HDG_LOCK_CHANGED = 'hdg_lock_changed';
NavModeEvent.TOGA_CHANGED = 'toga_changed';
NavModeEvent.GROUNDED = 'grounded';
NavModeEvent.PATH_NONE = 'path_none';
NavModeEvent.PATH_ARM = 'path_arm';
NavModeEvent.PATH_ACTIVE = 'path_active';
NavModeEvent.GP_NONE = 'gp_none';
NavModeEvent.GP_ARM = 'gp_arm';
NavModeEvent.GP_ACTIVE = 'gp_active';
NavModeEvent.GS_NONE = 'gs_none';
NavModeEvent.GS_ARM = 'gs_arm';
NavModeEvent.GS_ACTIVE = 'gs_active';
NavModeEvent.AP_CHANGED = 'ap_changed';
NavModeEvent.LOC_ACTIVE = 'loc_active';
NavModeEvent.LNAV_ACTIVE = 'lnav_active';
NavModeEvent.FD_TOGGLE = 'FD_TOGGLE';
NavModeEvent.ALT_PRESSED = 'ALT_PRESSED';

class WT_ApproachType {
}

WT_ApproachType.NONE = 'none';
WT_ApproachType.ILS = 'ils';
WT_ApproachType.RNAV = 'rnav';
WT_ApproachType.VISUAL = 'visual';

class AltitudeState {
}

AltitudeState.SELECTED = 'SELECTED';
AltitudeState.MANAGED = 'MANAGED';
AltitudeState.PRESSURE = 'PRESSURE';
AltitudeState.LOCKED = 'LOCKED';
AltitudeState.NONE = 'NONE';

class ValueStateTracker {
	constructor(valueGetter, handler) {
		this._valueGetter = valueGetter;
		this._currentState = 0;
		this._handler = handler;
	}

	/** @type {any} */
	get state() {
		return this._currentState;
	}

	updateState() {
		const value = this._valueGetter();
		const isChanged = value !== this._currentState;

		this._currentState = value;
		if (isChanged) {
			return this._handler(value);
		}
	}
}
