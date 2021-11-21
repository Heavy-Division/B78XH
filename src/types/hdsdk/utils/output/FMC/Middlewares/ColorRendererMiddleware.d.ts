import { IRendererMiddleware } from '../../IRendererMiddleware';
export declare class ColorRendererMiddleware implements IRendererMiddleware {
    private readonly regex;
    apply(value: string): any;
    private applyRegex;
}
