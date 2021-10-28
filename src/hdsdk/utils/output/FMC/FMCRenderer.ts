import {FMCLineType} from './FMCLineType';
import {IRendererMiddleware} from '../IRendererMiddleware';
import {IRenderer} from '../IRenderer';

export class FMCRenderer implements IRenderer {

	/**
	 * Holds container reference
	 * TODO: Do we need to hold the container reference???
	 * @type {HTMLElement}
	 * @private
	 */
	private container: HTMLElement;
	private middlewares: IRendererMiddleware[] = [];

	private lines: SVGTSpanElement[][] = [];
	private titles: SVGTSpanElement[][] = [];

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
	 * Renders data to FMC
	 * @param {string[][]} data
	 */
	public render(data: string[][]): void {
		for (let i = 1; i <= this.titles.length; i++) {
			this.setDataToLine(i - 1, data[i * 2 - 1], FMCLineType.TITLE);
			this.titles[i - 1] = this.titles[i - 1].map((value) => {
				return this.applyMiddlewares(value);
			});
		}
		for (let i = 0; i <= this.lines.length - 1; i++) {
			this.setDataToLine(i, data[(i * 2) + 2], FMCLineType.LINE);
			this.titles[i] = this.lines[i].map((value) => {
				return this.applyMiddlewares(value);
			});
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

		let target: SVGTSpanElement[] = [];
		if (type === FMCLineType.LINE) {
			target = this.lines[index];
		} else if (type === FMCLineType.TITLE) {
			target = this.titles[index];
		}

		this.templater.arrange(data, target);
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
				const element = this.loadLine(String('#' + FMCRenderer.linesPrefixes[j] + (i + 1)), container);
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
				const element = this.loadTitle(String('#' + FMCRenderer.titlesPrefixes[j] + (i + 1)), container);
				if (element) {
					this.titles[i][j] = element;
				}
			}
		}
	}

	/**
	 * Loads line from container and returns HTMLElement of line
	 * @param {string} id
	 * @param {HTMLElement} container
	 * @returns {HTMLElement}
	 * @private
	 */
	private loadLine(id: string, container: HTMLElement): SVGTSpanElement | undefined {
		const textElement = container.querySelector(id);
		if (textElement) {
			return textElement.getElementsByTagName('tspan')[0];
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
	private loadTitle(id: string, container: HTMLElement): SVGTSpanElement | undefined {
		const textElement = container.querySelector(id);
		if (textElement) {
			return textElement.getElementsByTagName('tspan')[0];
		}
		return undefined;
	}
}