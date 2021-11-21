import {IRendererMiddleware} from '../../IRendererMiddleware';

export class HtmlDecodeRendererMiddleware implements IRendererMiddleware {

	private decoder = document.createElement('textarea');

	public apply(value: any): any {
		this.decoder.innerHTML = value.innerHTML;
		value.innerHTML = this.decoder.value;
		return value;
	}
}