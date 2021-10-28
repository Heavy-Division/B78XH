import {IRendererMiddleware} from '../../IRendererMiddleware';

export class ColorRendererMiddleware implements IRendererMiddleware {
	private readonly regex = /\[color=([a-z-]+)\](.*?)\[\/color\]/g;

	public apply(value: string): any {
		return this.applyRegex(value);
	}

	private applyRegex(value: any): any {
		if (value instanceof String) {
			return value.replace(this.regex, '$2');
		} else if (value instanceof SVGTSpanElement) {
			if (value.textContent) {
				return value.textContent = value.textContent.replace(this.regex, '$2');
			} else {
				return value;
			}
		}

		return value;
	}
}