import {NavModeSwitcherEvent} from '../enums/NavModeSwitcherEvent';

export class AutopilotValueTracker {
	private _value: any = undefined;
	private _getter: Function = undefined;

	private _onChange: NavModeSwitcherEvent = undefined;

	constructor(getter: Function) {
		this.getter = getter;
	}

	private set getter(getter: Function) {
		this._getter = getter;
		this.value = this._getter();
	}

	private set value(value: any) {
		this._value = value;
	}

	get value() {
		return this._value;
	}

	public get() {
		return this.value;
	}

	update(): NavModeSwitcherEvent {
		const value = this._getter();
		const isChanged = value != this.value;
		this.value = value;
		if (isChanged) {
			return this._onChange;
		}
	}

	onChange(event: NavModeSwitcherEvent) {
		this._onChange = event;
	}
}