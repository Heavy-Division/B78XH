import {B787_10_FMC_PerfInitPage} from '../../../../../hdfmc/fmc/B787_10_FMC_PerfInitPage';
import {B787_10_FMC_InitRefIndexPage} from '../../../../../hdfmc/fmc/B787_10_FMC_InitRefIndexPage';

export class MainKey {
	private _event: () => void = undefined;
	private readonly id: number = undefined;
	private borderElement: HTMLElement = undefined;

	constructor(id: string, container: HTMLElement) {
		this.id = parseInt(id.substring(2));
		this.init(container);
	}

	/**
	 * TODO: Revise border element html ID
	 * @param {HTMLElement} container
	 * @private
	 */
	private init(container: HTMLElement): void {
		this.borderElement = container.querySelector('#MK' + this.id + '-BUTTON');
		this.hookupKeyEvent();
	}

	set event(event: () => void) {
		this._event = event;
	}

	get event(): () => void {
		return this._event;
	}

	private hookupKeyEvent() {
		this.borderElement.addEventListener('mouseup', (event) => {
			if (event.button === 0) {
				if (this.event) {
					this.event();
				}
			}
		});
	}

	public trigger(): void {
		if (this.event) {
			this.event();
		}
	}

	public render(): void {
	}
}