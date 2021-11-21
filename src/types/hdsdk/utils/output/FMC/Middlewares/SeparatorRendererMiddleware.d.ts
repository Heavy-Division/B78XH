import { IRendererMiddleware } from '../../IRendererMiddleware';
export declare class SeparatorRendererMiddleware implements IRendererMiddleware {
    private readonly separator;
    private readonly replace;
    apply(value: any): any;
    private applyReplace;
}
