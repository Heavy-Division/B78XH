import {AutopilotState} from '../utils/AutopilotState';
import {Queue} from '../../hdsdk';
import {MCPDirector, MCPLateralMode, MCPVerticalMode} from './MCPDirector';
import {HDLogger} from '../../hdlogger';

/**
 * TODO: Rename to AFDSDirector
 */

export class AutomaticAutopilotDirector {
	public get autopilotState(): AutopilotState {
		return this._autopilotState;
	}

	public get handlers(): Function[] {
		return this._handlers;
	}

	private get eventQueue(): Queue {
		return this._eventQueue;
	}

	private _autopilotState: AutopilotState = new AutopilotState();
	private _handlers = [];
	private _eventQueue = new Queue();
	private _mcpDirector: MCPDirector;

	constructor(mcpDirector: MCPDirector) {
		this._mcpDirector = mcpDirector;
		this.handlers[AutomaticAutopilotDirectorEvent.AP_ON_CHANGE] = this.handleApOnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.NAVIGATION_ON_CHANGE] = this.handleNavigationModeOnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.TOGA_ON_CHANGE] = this.handleTogaOnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.HEADING_LOCK_ON_CHANGE] = this.handleHeadingLockedOnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.ALTITUDE_LOCK_ON_CHANGE] = this.handleAltitudeLockedOnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.SIMULATOR_ALTITUDE_LOCK_ON_CHANGE] = this.handleSimulatorAltitudeLockedOnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.ALTITUDE_SLOT_ON_CHANGE] = this.handleAltitudeSlotOnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.SELECTED_ALTITUDE_1_ON_CHANGE] = this.handleSelectedAltitude1OnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.SELECTED_ALTITUDE_2_ON_CHANGE] = this.handleSelectedAltitude2OnChange.bind(this);
		this.handlers[AutomaticAutopilotDirectorEvent.SELECTED_ALTITUDE_3_ON_CHANGE] = this.handleSelectedAltitude3OnChange.bind(this);
	}

	public update(): void {
		for (const autopilotStateElement of this.autopilotState) {
			const eventToTrigger = autopilotStateElement.update();
			if (eventToTrigger !== undefined) {
				this.eventQueue.enqueue(eventToTrigger);
			}
		}
		this.processEvents();
	}

	private processEvents(): void {
		for (; this.eventQueue.length > 0;) {
			const event = this.eventQueue.dequeue();
			if (this.handlers[event] !== undefined) {
				this.handlers[event]();
			}
		}
	}

	private handleApOnChange(): void {
		if (this._mcpDirector.armedVerticalMode.mode !== MCPVerticalMode.VNAV && this._mcpDirector.activatedVerticalMode !== MCPVerticalMode.VNAV) {
			this._mcpDirector.armSpeed();
			this._mcpDirector.armVerticalSpeed();
		}

		if (this._mcpDirector.armedLateralMode.mode !== MCPLateralMode.LNAV && this._mcpDirector.activatedLateralMode !== MCPLateralMode.LNAV) {
			this._mcpDirector.armHeadingHold();
		}
	}

	/**
	 * TODO: Rename to LNAV onChange
	 * @private
	 */
	private handleNavigationModeOnChange(): void {
		HDLogger.log('LNAV onChange');
	}

	private handleTogaOnChange(): void {
		HDLogger.log('TOGA onChange');
	}

	private handleHeadingLockedOnChange(): void {
		HDLogger.log('HEADING LOCK onChange');
	}

	private handleAltitudeLockedOnChange(): void {
		HDLogger.log('ALTITUDE LOCK onChange');
	}

	private handleSimulatorAltitudeLockedOnChange(): void {
		HDLogger.log('SIM ALTITUDE LOCK onChange');
	}

	private handleAltitudeSlotOnChange(): void {
		HDLogger.log('ALTITUDE SLOT onChange');
	}

	private handleSelectedAltitude1OnChange(): void {
		HDLogger.log('SEL ALTITUDE 1 onChange');
	}

	private handleSelectedAltitude2OnChange(): void {
		HDLogger.log('SEL ALTITUDE 2 onChange');
	}

	private handleSelectedAltitude3OnChange(): void {
		HDLogger.log('SEL ALTITUDE 3 onChange');
	}

	private handleGroundedChanged(): void {
		HDLogger.log('GROUNDED onChange');
	}
}

export enum AutomaticAutopilotDirectorEvent {
	AP_ON_CHANGE,
	NAVIGATION_ON_CHANGE,
	TOGA_ON_CHANGE,
	HEADING_LOCK_ON_CHANGE,
	ALTITUDE_LOCK_ON_CHANGE,
	SIMULATOR_ALTITUDE_LOCK_ON_CHANGE,
	ALTITUDE_SLOT_ON_CHANGE,
	SELECTED_ALTITUDE_1_ON_CHANGE,
	SELECTED_ALTITUDE_2_ON_CHANGE,
	SELECTED_ALTITUDE_3_ON_CHANGE,
	GROUNDED_ON_CHANGE
}