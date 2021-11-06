import { IRendererMiddleware } from '../../IRendererMiddleware';
export declare class SizeRendererMiddleware implements IRendererMiddleware {
    private readonly regex;
    apply(value: any): any;
    private applyRegex;
}
