import {NavModeSwitcherEvent} from '../enums/NavModeSwitcherEvent';
import {AutomaticAutopilotDirectorEvent} from '../directors/AutomaticAutopilotDirector';

export class AutopilotValueTracker {
	protected _onChange: NavModeSwitcherEvent | AutomaticAutopilotDirectorEvent = undefined;

	constructor(getter: Function) {
		this.getter = getter;
	}

	protected _value: any = undefined;

	public get value(): any {
		return this._value;
	}

	public set value(value: any) {
		this._value = value;
	}

	protected _getter: Function = undefined;

	private set getter(getter: Function) {
		this._getter = getter;
		this.value = this._getter();
	}

	public get() {
		return this.value;
	}

	update(): NavModeSwitcherEvent | AutomaticAutopilotDirectorEvent {
		const value = this._getter();
		const isChanged = value != this.value;
		this.value = value;
		if (isChanged) {
			return this._onChange;
		}
	}

	onChange(event: NavModeSwitcherEvent | AutomaticAutopilotDirectorEvent) {
		this._onChange = event;
	}
}
