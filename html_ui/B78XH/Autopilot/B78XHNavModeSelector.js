/**
 * A class that handles state transitions to the different autopilot modes of
 * the B78X.
 */
class B78XHNavModeSelector {

	/**
	 * Creates a new instance of the B78XHNavModeSelector.
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

		/** The current LNav mode state. */
		this.lNavModeState = LNavModeState.FMS;

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
			[`${NavModeEvent.LNAV_PRESSED}`]: this.handleLNAVPressed.bind(this),
			[`${NavModeEvent.LNAV_ACTIVE}`]: this.handleLNAVActive.bind(this),
			[`${NavModeEvent.HDG_HOLD_PRESSED}`]: this.handleHDGHoldPressed.bind(this),
			[`${NavModeEvent.HDG_HOLD_ACTIVE}`]: this.handleHDGHoldActive.bind(this),
			[`${NavModeEvent.HDG_SEL_PRESSED}`]: this.handleHDGSelPressed.bind(this),
			[`${NavModeEvent.HDG_SEL_ACTIVE}`]: this.handleHDGSelActive.bind(this)
		};

		this.initialize();
	}

	handleLNAVPressed() {
		/**
		 * Is possible to ARM LNAV
		 */
		if (this.flightPlanManager.getWaypointsCount() === 0) {
			return;
		}

		/**
		 * Disarm LNAV if possible
		 */
		if(this.currentLateralArmedState === LateralNavModeState.LNAV && this.currentLateralActiveState !== LateralNavModeState.LNAV){
			SimVar.SetSimVarValue('L:AP_LNAV_ARMED', 'number', 0);
			this.currentLateralArmedState = LateralNavModeState.NONE;
			return;
		}

		/**
		 * ARM LNAV
		 */
		SimVar.SetSimVarValue('L:AP_LNAV_ARMED', 'number', 1);
		this.currentLateralArmedState = LateralNavModeState.LNAV;

		/**
		 * Try activate LNAV
		 */
		this.queueEvent(NavModeEvent.LNAV_ACTIVE);
	}

	handleLNAVActive() {
		/**
		 * Is LNAV armed?
		 */
		if (this.currentLateralArmedState === LateralNavModeState.LNAV) {
			/**
			 * Is possible to engage LNAV?
			 * @type {number}
			 */
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude > 50) {
				/**
				 * Handle LNAV activation
				 */
				switch (this.currentLateralActiveState) {
					case LateralNavModeState.NONE:
						this.changeToCorrectLNavForMode(true, false);
						break;
					case LateralNavModeState.HDGHOLD:
						this.changeToCorrectLNavForMode(false, false);
						break;
					case LateralNavModeState.HDGSEL:
						this.changeToCorrectLNavForMode(false, false);
						break;
					case LateralNavModeState.TO:
					case LateralNavModeState.GA:
						this.changeToCorrectLNavForMode(false, false);
						break;
				}
			}
		}
	}

	handleHDGHoldPressed(){
		/**
		 * JUST BYPASS for now
		 */
		if (this.currentLateralActiveState !== LateralNavModeState.HDGHOLD) {
			this.currentLateralArmedState = LateralNavModeState.HDGHOLD;
			this.queueEvent(NavModeEvent.HDG_HOLD_ACTIVE);
		}
	}

	handleHDGHoldActive(){
		/**
		 * Deactive LNAV
		 */
		SimVar.SetSimVarValue("L:AP_LNAV_ARMED", "number", 0);
		SimVar.SetSimVarValue("L:AP_LNAV_ACTIVE", "number", 0);

		/**
		 * Active HDH HOLD
		 */
		if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
			SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
		}
		SimVar.SetSimVarValue("L:AP_HEADING_HOLD_ACTIVE", "number", 1);
		SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 2);
		const heading = Simplane.getHeadingMagnetic();
		Coherent.call("HEADING_BUG_SET", 2, heading);

		this.currentLateralArmedState = LateralNavModeState.NONE
		this.currentLateralActiveState = LateralNavModeState.HDGHOLD
	}

	handleHDGSelPressed(){
		/**
		 * JUST BYPASS for now
		 */
		if (this.currentLateralActiveState !== LateralNavModeState.HDGSEL) {
			this.currentLateralArmedState = LateralNavModeState.HDGSEL;
			this.queueEvent(NavModeEvent.HDG_SEL_ACTIVE);
		}
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
		this.currentLateralActiveState = LateralNavModeState.HDGSEL
	}

	changeToCorrectLNavForMode(activateHeadingHold, arm) {
		if (this.lNavModeState === LNavModeState.FMS) {
			if (!arm) {
				SimVar.SetSimVarValue("L:AP_HEADING_HOLD_ACTIVE", "number", 0);
				if (SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "boolean")) {
					console.log("LNAV APPROACH HOLD: TRUE")
					return;
				}
				console.log("LNAV ACTIVATE: TRUE")
				SimVar.SetSimVarValue("L:AP_LNAV_ACTIVE", "number", 1);
				SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 2);
				SimVar.SetSimVarValue("K:AP_NAV1_HOLD_ON", "number", 1);
				SimVar.SetSimVarValue("L:AP_HEADING_HOLD_ACTIVE", "number", 0);

				if (activateHeadingHold) {
					console.log("LNAV ACTIVATE HEADING HOLD: TRUE")
					SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'number', 1);
				}

				this.currentLateralActiveState = LateralNavModeState.LNAV;
				this.currentLateralArmedState = LateralNavModeState.NONE;
			} else {
				console.log("LNAV ARM: TRUE")
				this.currentLateralArmedState = LateralNavModeState.LNAV;
			}
		} else {
			console.log("LNAV MODE IS NOT FMS");
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
LateralNavModeState.HDGHOLD = 'HDG_HOLD';
LateralNavModeState.HDGSEL = 'HDG_SEL';
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
NavModeEvent.HDG_HOLD_ACTIVE = 'HDG_HOLD_ACTIVE';
NavModeEvent.HDG_SEL_PRESSED = 'HDG_SEL_PRESSED';
NavModeEvent.HDG_SEL_ACTIVE = 'HDG_SEL_ACTIVE';
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
