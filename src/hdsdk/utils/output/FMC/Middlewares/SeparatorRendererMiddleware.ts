import {IRendererMiddleware} from '../../IRendererMiddleware';

export class SeparatorRendererMiddleware implements IRendererMiddleware {

	private readonly separator = '__FMCSEPARATOR';
	private readonly replace = '---------------------------------------------';

	public apply(value: any): any {
		return this.applyReplace(value);
	}

	private applyReplace(value: any): any {
		if (value instanceof String) {
			if (value === this.separator) {
				value = this.replace;
			}
		} else if (value instanceof SVGTSpanElement) {
			if (value.textContent === this.separator) {
				value.textContent = this.replace;
			}
		} else if (value instanceof HTMLElement) {
			if (value.innerText === this.separator) {
				value.innerHTML = this.replace;
			}
		}
		return value;
	}
}