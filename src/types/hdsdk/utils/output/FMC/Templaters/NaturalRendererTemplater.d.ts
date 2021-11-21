/**
 * NaturalRendererTemplater
 *
 * Templater renders data in natural way
 *
 * ['left']
 * ['left', 'right']
 * ['left', 'center', 'right']
 * ['left', 'center left', 'center right','right']
 */
export declare class NaturalRendererTemplater implements IRendererTemplater {
    arrange(data: string[], target: SVGTSpanElement[]): void;
}
