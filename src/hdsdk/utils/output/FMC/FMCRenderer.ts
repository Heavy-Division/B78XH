import {FMCLineType} from './FMCLineType';
import {IRendererMiddleware} from '../IRendererMiddleware';
import {IRenderer} from '../IRenderer';
import {SelectKey} from './Elements/SelectKey';
import {MainKey} from './Elements/MainKey';

class FMCRenderer implements IRenderer {

	/**
	 * Holds container reference
	 * TODO: Do we need to hold the container reference???
	 * @type {HTMLElement}
	 * @private
	 */
	private container: HTMLElement;
	private middlewares: IRendererMiddleware[] = [];

	private title: HTMLElement;
	private pages: HTMLElement;

	/**
	 * TODO: Consider switch to ForeignObject DIV/SPAN because of line wrap and partial coloring/settable
	 * @type {SVGTSpanElement[][]}
	 * @private
	 */
	private lines: HTMLElement[][] = [];
	private titles: HTMLElement[][] = [];

	private selectKeys: SelectKey[] = [];
	private mainKeys: MainKey[] = [];

	private exec: SVGRectElement;

	private static linesPrefixes: string[] = ['LL', 'CLL', 'CL', 'CRL', 'RL'];
	private static titlesPrefixes: string[] = ['LT', 'CLT', 'CT', 'CRT', 'RT'];

	private static numberOfLines: number = 6;
	private static numberOfTitles: number = 6;
	private templater: IRendererTemplater;

	/**
	 * FMC Renderer
	 * @param {HTMLElement} container
	 * @param {IRendererTemplater} templater
	 */
	constructor(container: HTMLElement, templater: IRendererTemplater) {
		this.container = container;
		this.templater = templater;
		this.loadElements(container);
	}

	/**
	 * Renders page title
	 * @param {string} title
	 */
	public renderTitle(title: string): void {
		if (this.title) {
			this.title.innerHTML = title;
		}
	}

	/**
	 * Renders pages
	 * @param {number} current
	 * @param {number} total
	 */
	public renderPages(current: number, total: number): void {
		if (this.pages) {
			this.pages.innerHTML = String(current) + '/' + String(total);
		}
	}

	/**
	 * Clears display
	 */
	public clearDisplay(): void {
		if (this.pages) {
			this.pages.textContent = '';
			this.pages.innerHTML = '';
		}

		if (this.title) {
			this.title.textContent = '';
			this.title.innerHTML = '';
		}

		for (let i = 0; i <= this.titles.length - 1; i++) {
			this.titles[i].forEach((title) => {
				title.textContent = '';
				title.innerHTML = '';
			});
		}
		for (let i = 0; i <= this.lines.length - 1; i++) {
			this.lines[i].forEach((line) => {
				line.textContent = '';
				line.innerHTML = '';
			});
		}
	}

	/**
	 * Returns main key
	 * @param {number} id
	 * @returns {MainKey | undefined}
	 */
	public mk(id: number): MainKey | undefined {
		const mkID = id - 1;
		if (mkID < 0 || mkID > 16) {
			return undefined;
		}
		return this.mainKeys[mkID];
	}

	/**
	 * Sets all events to UNDEFINED
	 */
	public cleanUpSelectKeyEvents(): void {
		this.selectKeys.forEach((key) => {
			key.event = undefined;
		});
	}

	/**
	 * Returns Left Select Key (LSK) Object
	 * @param {number} id
	 * @returns {SelectKey | undefined}
	 */
	lsk(id: number): SelectKey | undefined {
		const lskID = id - 1;
		if (lskID < 0 || lskID > 5) {
			return undefined;
		}
		return this.selectKeys[lskID];
	}


	/**
	 * Sets event for LSK
	 * @param {number} id
	 * @param {() => void} event
	 */
	setLskEvent(id: number, event: () => void): void {
		const lskID = id - 1;
		if (lskID < 0 || lskID > 5) {
			return;
		}
		this.selectKeys[lskID].event = event;
	}

	/**
	 * Returns Right Select Key (RSK) Object
	 * @param {number} id
	 * @returns {SelectKey | undefined}
	 */
	rsk(id: number): SelectKey | undefined {
		const rskID = id + 5;
		if (rskID < 6 || rskID > 12) {
			return undefined;
		}
		return this.selectKeys[rskID];
	}

	/**
	 * Sets event for RSK
	 * @param {number} id
	 * @param {() => void} event
	 */
	setRskEvent(id: number, event: () => void): void {
		const rskID = id + 5;
		if (rskID < 6 || rskID > 12) {
			return;
		}
		this.selectKeys[rskID].event = event;
	}

	/**
	 * Renders data to FMC
	 * @param {string[][]} data
	 */
	public render(data: string[][]): void {
		for (let i = 0; i <= this.titles.length - 1; i++) {
			this.setDataToLine(i, data[i * 2], FMCLineType.TITLE);
			this.titles[i] = this.titles[i].map((value) => {
				return this.applyMiddlewares(value);
			});
		}
		for (let i = 0; i <= this.lines.length - 1; i++) {
			this.setDataToLine(i, data[(i * 2) + 1], FMCLineType.LINE);
			this.lines[i] = this.lines[i].map((value) => {
				return this.applyMiddlewares(value);
			});
		}
	}

	/**
	 * Renders exec state
	 * @param {boolean} state
	 */
	public renderExec(state: boolean): void {
		if (this.exec) {
			if (state === true) {
				this.exec.style.fill = '#65ff3a';
			} else {
				this.exec.style.fill = '#354b4f';
			}
		}
	}

	/**
	 * Sets data to lines
	 * @param {number} index
	 * @param {string[]} data
	 * @param {FMCLineType} type
	 * @private
	 */
	private setDataToLine(index: number, data: string[], type: FMCLineType) {
		let target: HTMLElement[] = [];
		if (type === FMCLineType.LINE) {
			target = this.lines[index];
		} else if (type === FMCLineType.TITLE) {
			target = this.titles[index];
		}

		if (data && target) {
			this.templater.arrange(data, target);
		}
	}

	/**
	 * Adds middleware
	 * @param {IRendererMiddleware} middleware
	 */
	public use(middleware: IRendererMiddleware): void {
		this.middlewares.push(middleware);
	}

	/**
	 * Apply middleware to value
	 * @param value
	 * @param {IRendererMiddleware} middleware
	 * @returns {any}
	 * @private
	 */
	private applyMiddleware(value: any, middleware: IRendererMiddleware): any {
		return middleware.apply(value);
	}

	/**
	 * Applies all middlewares
	 * @param value
	 * @returns {any}
	 * @private
	 */
	private applyMiddlewares(value: any): any {
		let output = value;

		this.middlewares.forEach((middleware) => {
			output = this.applyMiddleware(output, middleware);
		});
		return output;
	}

	/**
	 * Loads all elements and store references
	 * @param {HTMLElement} container
	 * @private
	 */
	private loadElements(container: HTMLElement) {
		this.loadTitles(container);
		this.loadLines(container);
		this.loadExec(container);
		this.loadPageTitle(container);
		this.loadPages(container);
		this.loadSelectKeys(container);
		this.loadMainKeys(container);
	}

	/**
	 * Loads all lines and store references
	 * @param {HTMLElement} container
	 * @private
	 */
	private loadLines(container: HTMLElement): void {
		for (let i = 0; i <= FMCRenderer.numberOfLines - 1; i++) {
			this.lines[i] = [];
			for (let j = 0; j <= FMCRenderer.linesPrefixes.length - 1; j++) {
				const element = this.loadLine(String('#' + FMCRenderer.linesPrefixes[j] + (i + 1) + '-FOREIGN'), container);
				if (element) {
					this.lines[i][j] = element;
				}
			}
		}
	}

	/**
	 * Loads all titles and store references
	 * @param {HTMLElement} container
	 * @private
	 */
	private loadTitles(container: HTMLElement): void {
		for (let i = 0; i <= FMCRenderer.numberOfTitles - 1; i++) {
			this.titles[i] = [];
			for (let j = 0; j <= FMCRenderer.titlesPrefixes.length - 1; j++) {
				const element = this.loadTitle(String('#' + FMCRenderer.titlesPrefixes[j] + (i + 1) + '-FOREIGN'), container);
				if (element) {
					this.titles[i][j] = element;
				}
			}
		}
	}

	/**
	 * Loads title page element
	 * @param {HTMLElement} container
	 * @private
	 */
	private loadPageTitle(container: HTMLElement): void {
		const textElement = container.querySelector('#TITLE-FOREIGN');
		if (textElement) {
			this.title = textElement as HTMLElement;
		}
	}

	/**
	 * Loads pages text element
	 * @param {HTMLElement} container
	 * @private
	 */
	private loadPages(container: HTMLElement): void {
		const textElement = container.querySelector('#PAGES-FOREIGN');
		if (textElement) {
			this.pages = textElement as HTMLElement;
		}
	}

	/**
	 * Loads exec light
	 * @param {HTMLElement} container
	 * @private
	 */
	private loadExec(container: HTMLElement): void {
		const execRect = container.querySelector('#exec-emit') as SVGRectElement;
		if (execRect) {
			this.exec = execRect;
		}
	}

	/**
	 * Loads line from container and returns HTMLElement of line
	 * @param {string} id
	 * @param {HTMLElement} container
	 * @returns {HTMLElement}
	 * @private
	 */
	private loadLine(id: string, container: HTMLElement): HTMLElement | undefined {
		const textElement = container.querySelector(id);
		if (textElement) {
			return textElement as HTMLElement;
			//return textElement.getElementsByTagName('tspan')[0];
		}
		return undefined;
	}

	/**
	 * Loads title from container and returns HTMLElement of title
	 * @param {string} id
	 * @param {HTMLElement} container
	 * @returns {HTMLElement}
	 * @private
	 */
	private loadTitle(id: string, container: HTMLElement): HTMLElement | undefined {
		const textElement = container.querySelector(id);
		if (textElement) {
			return textElement as HTMLElement;
			//return textElement.getElementsByTagName('tspan')[0];
		}
		return undefined;
	}

	private loadSelectKeys(container: HTMLElement) {
		const leftKeys = container.querySelectorAll('.lsk-btn');
		const rightKeys = container.querySelectorAll('.rsk-btn');
		leftKeys.forEach((element) => {
			this.selectKeys.push(new SelectKey(element.id, container));
		});

		rightKeys.forEach((element) => {
			this.selectKeys.push(new SelectKey(element.id, container));
		});
	}

	private loadMainKeys(container: HTMLElement) {
		const mainKeys = container.querySelectorAll('.mk-btn');
		mainKeys.forEach((element) => {
			this.mainKeys.push(new MainKey(element.id, container));
		});
	}
}

export {
	FMCRenderer
};

exports = {
	FMCRenderer
};