import {AutopilotState} from '../utils/AutopilotState';
import {Queue} from '../../hdsdk';
import {NavModeSwitcherEvent} from '../enums/NavModeSwitcherEvent';
import {MCPDirector} from '../directors/MCPDirector';

export class NavModeSwitcher {

	private _eventQueue = new Queue();
	private _mcpDirector = new MCPDirector();
	private _handlers = [];

	private _autopilotState = new AutopilotState();

	constructor() {
		this._handlers[NavModeSwitcherEvent.AP_CHANGED] = this.handleApChanged.bind(this);
		this._handlers[NavModeSwitcherEvent.NAVIGATION_MODE_CHANGED] = this.handleNavigationModeChanged.bind(this);
		this._handlers[NavModeSwitcherEvent.TOGA_CHANGED] = this.handleTogaChanged.bind(this);
		this._handlers[NavModeSwitcherEvent.HEADING_LOCKED_CHANGED] = this.handleHeadingLockedChanged.bind(this);
		this._handlers[NavModeSwitcherEvent.ALTITUDE_LOCKED_CHANGED] = this.handleAltitudeLockedChanged.bind(this);
		this._handlers[NavModeSwitcherEvent.SIMULATOR_ALTITUDE_LOCKED_CHANGED] = this.handleSimulatorAltitudeLockedChanged.bind(this);
		this._handlers[NavModeSwitcherEvent.ALTITUDE_SLOT_CHANGED] = this.handleAltitudeSlotChanged.bind(this);
		this._handlers[NavModeSwitcherEvent.SELECTED_ALTITUDE_1_CHANGED] = this.handleSelectedAltitude1Changed.bind(this);
		this._handlers[NavModeSwitcherEvent.SELECTED_ALTITUDE_2_CHANGED] = this.handleSelectedAltitude2Changed.bind(this);
		this._handlers[NavModeSwitcherEvent.SELECTED_ALTITUDE_3_CHANGED] = this.handleSelectedAltitude3Changed.bind(this);
		this._handlers[NavModeSwitcherEvent.GROUNDED_CHANGED] = this.handleGroundedChanged.bind(this);
		this._handlers[NavModeSwitcherEvent.HDG_HOLD_PRESSED] = this.handleHeadingHoldPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.HDG_SEL_PRESSED] = this.handleHeadingSelectPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.SPD_PRESSED] = this.handleSpeedPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.SPD_INTERVENTION_PRESSED] = this.handleSpeedInterventionPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.FLC_PRESSED] = this.handleFlightLevelChangePressed.bind(this);
		this._handlers[NavModeSwitcherEvent.APPR_PRESSED] = this.handleApproachPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.VS_PRESSED] = this.handleVerticalSpeedPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.VNAV_PRESSED] = this.handleVNAVPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.LNAV_PRESSED] = this.handleLNAVPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.ALT_HOLD_PRESSED] = this.handleALTHoldPressed.bind(this);
		this._handlers[NavModeSwitcherEvent.ALT_INTERVENTION_PRESSED] = this.handleALTInterventionPressed.bind(this);
	}

	private handleApChanged(): void {

	}

	private handleNavigationModeChanged(): void {

	}

	private handleTogaChanged(): void {

	}

	private handleHeadingLockedChanged(): void {

	}

	private handleAltitudeLockedChanged(): void {

	}

	private handleSimulatorAltitudeLockedChanged(): void {

	}

	private handleHeadingHoldPressed(): void {
		this._mcpDirector.armHeadingHold();
	}

	private handleHeadingSelectPressed(): void {
		this._mcpDirector.armHeadingSelect();
	}

	private handleSpeedPressed(): void {
		this._mcpDirector.armSpeed();
	}

	private handleSpeedInterventionPressed(): void {
		this._mcpDirector.toggleSpeedIntervention();
	}

	private handleFlightLevelChangePressed(): void {
		this._mcpDirector.armFLCH();
	}

	private handleApproachPressed(): void {

	}

	private handleVerticalSpeedPressed(): void {
		this._mcpDirector.armVerticalSpeed();
	}

	private handleVNAVPressed(): void {
		this._mcpDirector.armVNAV();
	}

	private handleLNAVPressed(): void {
		this._mcpDirector.armLNAV();
	}

	private handleALTHoldPressed(): void {

	}

	private handleALTInterventionPressed(): void {

	}

	private handleAltitudeSlotChanged(): void {

	}

	private handleSelectedAltitude1Changed(): void {
	}

	private handleSelectedAltitude2Changed(): void {
	}

	private handleSelectedAltitude3Changed(): void {
	}

	private handleGroundedChanged(): void {

	}

	public update(): void {
		for (const autopilotStateElement of this._autopilotState) {
			const eventToTrigger = autopilotStateElement.update();
			if (eventToTrigger) {
				this._eventQueue.enqueue(eventToTrigger);
			}
		}
		this.processEvents();
		this._mcpDirector.processPending();
	}

	private processEvents(): void {
		for (; this._eventQueue.length > 0;) {
			const event = this._eventQueue.dequeue();
			if (this._handlers[event] !== undefined) {
				this._handlers[event]();
			}
		}
	}

	public enqueueEvent(event: NavModeSwitcherEvent) {
		this._eventQueue.enqueue(event);
	}
}

/**
 * NOTES:
 * AUTOPILOT ALTITUDE LOCK VAR:1 -> This is altitude intervention / Altitude hold
 * AUTOPILOT ALTITUDE LOCK VAR:2 -> Used as target for FLCH/VNAV
 * AUTOPILOT ALTITUDE LOCK VAR:3 -> This is MCP altitude window
 * AUTOPILOT HEADING SLOT INDEX:1 -> HDG SEL
 * AUTOPILOT HEADING SLOT INDEX:2 -> HDG HOLD
 * AUTOPILOT HEADING LOCK -> true for HDG modes / false for LNAV
 * AUTOPILOT ALTITUDE SLOT INDEX:1 -> FLCH/VS
 * AUTOPILOT ALTITUDE SLOT INDEX:2 -> VNAV
 */