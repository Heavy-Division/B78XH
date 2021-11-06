import { IRendererMiddleware } from '../IRendererMiddleware';
import { IRenderer } from '../IRenderer';
declare class FMCRenderer implements IRenderer {
    /**
     * Holds container reference
     * TODO: Do we need to hold the container reference???
     * @type {HTMLElement}
     * @private
     */
    private container;
    private middlewares;
    private lines;
    private titles;
    private static linesPrefixes;
    private static titlesPrefixes;
    private static numberOfLines;
    private static numberOfTitles;
    private templater;
    /**
     * FMC Renderer
     * @param {HTMLElement} container
     * @param {IRendererTemplater} templater
     */
    constructor(container: HTMLElement, templater: IRendererTemplater);
    /**
     * Renders data to FMC
     * @param {string[][]} data
     */
    render(data: string[][]): void;
    /**
     * Sets data to lines
     * @param {number} index
     * @param {string[]} data
     * @param {FMCLineType} type
     * @private
     */
    private setDataToLine;
    /**
     * Adds middleware
     * @param {IRendererMiddleware} middleware
     */
    use(middleware: IRendererMiddleware): void;
    /**
     * Apply middleware to value
     * @param value
     * @param {IRendererMiddleware} middleware
     * @returns {any}
     * @private
     */
    private applyMiddleware;
    /**
     * Applies all middlewares
     * @param value
     * @returns {any}
     * @private
     */
    private applyMiddlewares;
    /**
     * Loads all elements and store references
     * @param {HTMLElement} container
     * @private
     */
    private loadElements;
    /**
     * Loads all lines and store references
     * @param {HTMLElement} container
     * @private
     */
    private loadLines;
    /**
     * Loads all titles and store references
     * @param {HTMLElement} container
     * @private
     */
    private loadTitles;
    /**
     * Loads line from container and returns HTMLElement of line
     * @param {string} id
     * @param {HTMLElement} container
     * @returns {HTMLElement}
     * @private
     */
    private loadLine;
    /**
     * Loads title from container and returns HTMLElement of title
     * @param {string} id
     * @param {HTMLElement} container
     * @returns {HTMLElement}
     * @private
     */
    private loadTitle;
}
export { FMCRenderer };
