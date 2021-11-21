import { IRendererMiddleware } from '../../IRendererMiddleware';
export declare class SettableRendererMiddleware implements IRendererMiddleware {
    private readonly regex;
    apply(value: any): any;
    private applyRegex;
}
