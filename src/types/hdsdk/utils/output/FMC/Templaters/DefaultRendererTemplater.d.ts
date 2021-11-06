/**
 * NaturalRendererTemplater
 *
 * Templater renders data in default (ASOBO) way
 *
 * ['left']
 * ['left', 'right']
 * ['left', 'right', 'center']
 * ['left','right', 'center left', 'center right']
 */
export declare class DefaultRendererTemplater implements IRendererTemplater {
    arrange(data: string[], target: SVGTSpanElement[]): void;
}
