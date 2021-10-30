import { IRendererMiddleware } from '../../IRendererMiddleware';
export declare class SettableHighlighterRendererMiddleware implements IRendererMiddleware {
    private readonly settableIdPrefix;
    apply(value: any): any;
}
