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
				value.textContent = value.textContent.replace(this.regex, '$2');
				return value;
			} else {
				return value;
			}
		} else if (value instanceof HTMLElement) {
			if (this.regex.test(value.innerHTML)) {
				value.innerHTML = value.innerHTML.replace(this.regex, '<tspan class="$1">$2</tspan>');
			}
			return value;
		}

		return value;
	}
}