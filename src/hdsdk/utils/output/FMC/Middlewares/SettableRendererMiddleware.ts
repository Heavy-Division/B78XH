import {IRendererMiddleware} from '../../IRendererMiddleware';

export class SettableRendererMiddleware implements IRendererMiddleware {
	private readonly regex = /\[settable\](.*?)\[\/settable\]/g;

	public apply(value: any): any {
		return this.applyRegex(value);
	}

	private applyRegex(value: any): any {
		if (value instanceof String) {
			return value.replace(this.regex, '$1');
		} else if (value instanceof SVGTSpanElement) {
			if (value.textContent) {
				if (this.regex.test(value.textContent)) {
					value.classList.add('settableTarget');
				} else {
					value.classList.remove('settableTarget');
				}
				return value.textContent = value.textContent.replace(this.regex, '$1');
			} else {
				return value;
			}
		}

		return value;
	}
}