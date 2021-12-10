import {AutopilotState} from '../utils/AutopilotState';
import {Queue} from '../../hdsdk';

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

	private _autopilotState: AutopilotState;
	private _handlers = [];
	private _eventQueue = new Queue();

	constructor() {
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
			if (eventToTrigger) {
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

	}

	private handleNavigationModeOnChange(): void {

	}

	private handleTogaOnChange(): void {

	}

	private handleHeadingLockedOnChange(): void {

	}

	private handleAltitudeLockedOnChange(): void {

	}

	private handleSimulatorAltitudeLockedOnChange(): void {

	}

	private handleAltitudeSlotOnChange(): void {

	}

	private handleSelectedAltitude1OnChange(): void {
	}

	private handleSelectedAltitude2OnChange(): void {
	}

	private handleSelectedAltitude3OnChange(): void {
	}

	private handleGroundedChanged(): void {

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