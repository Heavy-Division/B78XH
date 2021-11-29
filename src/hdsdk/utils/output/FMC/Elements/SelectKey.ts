export class SelectKey implements IFMCKey {
	private readonly id: number = undefined;
	private readonly side: string = undefined;

	private _event: () => void = undefined;

	private hoverElement: HTMLElement = undefined;
	private buttonElement: HTMLElement = undefined;
	private borderElement: HTMLElement = undefined;
	private dashElement: HTMLElement = undefined;

	constructor(id: string, container: HTMLElement) {
		this.side = id.substring(0, 3);
		this.id = parseInt(id.substring(3, 4));
		this.init(container);
	}

	private init(container: HTMLElement): void {
		const id: string = this.side + this.id;
		this.buttonElement = container.querySelector('#' + id + '-BUTTON');
		this.hoverElement = container.querySelector('#' + id + '-HOVER');
		this.dashElement = container.querySelector('#' + id + '-DASH');
		this.borderElement = container.querySelector('#' + id + '-BORDER');
		this.hookupHoverEvents();
		this.deactivateHover();
	}

	set event(event: () => void) {
		this._event = event;
		this.update();
	}

	get event(): () => void {
		return this._event;
	}

	public update() {
		this.activate();
	}

	private hookupHoverEvents() {
		/**
		 * TODO: ForeignObject is rendered above SVG elements because of bug in ingame browser and the bug does not
		 * allow to trigger events bind to SVG elements (HOVER PATH)
		 *
		 * POSSIBLE WORKAROUNDS:
		 *
		 * 1) Do not use SVG Path for highlighting (not ideal workaround)
		 * 2) Bind events to SVG path and also to RSK/LSK foreign objects (not ideal [it needs to be bind to all lines and all positions LL/CL/CLL/CRL/RL])
		 * 3) Create fake invisible foreign objects above lines and bind events to SVG path and the fake foreign objects [not ideal -> fake objects]
		 * 4) Render SVG paths outside the SVG (not sure if possible) -> This is possible but z-index of hovers SVG has to be bigger then z-index of real FMC SVG
		 * 5) Render SVG path to PNG and use foreign object to pack the PNG. (not ideal. Complications with HDRemoteFMC because the remote fmc can be rendered on many
		 * devices phones/touchscreens/tables and in many resolutions)
		 * 6) Render SVG dynamically and append the hover SVGs into DOM (This is what ASOBO uses...) -> do not like this approach because it needs logic for rendering static elements
		 *
		 * Current implementation: Number 4;
		 */


		this.hoverElement.addEventListener('mouseenter', () => {
			if (this._event) {
				this.hoverElement.style.opacity = '1';
			}
		});

		this.hoverElement.addEventListener('mouseleave', () => {
			this.hoverElement.style.opacity = '0';
		});

		this.hoverElement.addEventListener('mouseup', (event) => {
			if (event.button === 0) {
				if (this._event) {
					this.event();
				}
			}
		});
	}

	private deactivate(): void {
		this.deactivateButton();
		this.deactivateDash();
		this.deactivateBorder();
	}

	private deactivateButton(): void {
		this.buttonElement.style.display = 'none';
	}

	private deactivateHover(): void {
		this.hoverElement.style.opacity = '0';
	}

	private deactivateDash(): void {
		this.dashElement.style.fill = '#4fceee';
	}

	private deactivateBorder(): void {
		this.borderElement.style.fillOpacity = '0';
		this.borderElement.style.stroke = '#4fceee';
	}

	private deactivateEvent(): void {
		this.event = undefined;
	}

	private activate(): void {
		if (this._event) {
			this.activateButton();
			this.activateDash();
			this.activateBorder();
		} else {
			this.deactivate();
		}
	}

	private activateButton(): void {
		this.buttonElement.style.display = 'block';
	}

	private activateHover(): void {
		throw new Error('NOT IMPLEMENTED');
	}

	private activateDash(): void {
		this.dashElement.style.fill = '#ffffff';
	}

	private activateBorder(): void {
		this.borderElement.style.stroke = '#000000';
		this.borderElement.style.fill = '#726d72';
		this.borderElement.style.fillOpacity = '.56471';
	}

	public trigger(): void {
		if (this.event) {
			this.event();
		}
	}

	public render(): void {
		if (this.event) {
			this.activate();
		} else {
			this.deactivate();
		}
	}
}