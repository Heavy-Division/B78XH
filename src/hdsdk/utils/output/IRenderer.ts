import {IRendererMiddleware} from './IRendererMiddleware';

export interface IRenderer {
	render(data: string[][]): void;

	use(middleware: IRendererMiddleware): void;
}