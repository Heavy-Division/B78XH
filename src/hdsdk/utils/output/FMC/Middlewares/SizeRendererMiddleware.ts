import {IRendererMiddleware} from '../../IRendererMiddleware';

export class SizeRendererMiddleware implements IRendererMiddleware {
	private readonly regex = /\[size=([a-z-]+)\](.*?)\[\/size\]/g;

	public apply(value: any): any {
		return this.applyRegex(value);
	}

	private applyRegex(value: any): any {
		if (value instanceof String) {
			return value.replace(this.regex, '$2');
		} else if (value instanceof SVGTSpanElement) {
			if (value.textContent) {
				value.textContent = value.textContent.replace(this.regex, '$2');
				return value;
			} else {
				return value;
			}
		}
		return value;
	}

}