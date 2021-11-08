import {IRendererMiddleware} from '../../IRendererMiddleware';

export class SettableRendererMiddleware implements IRendererMiddleware {
	private readonly regexUndefined = /\[settable=undefined](.*)\[\/settable]/g;
	private readonly regexFixedWidth = /\[settable=([0-9]+)](.*)\[\/settable]/g;

	public apply(value: any): any {
		return this.applyRegex(value);
	}

	private applyRegex(value: any): any {
		this.regexUndefined.lastIndex = 0;
		this.regexFixedWidth.lastIndex = 0;
		if (value instanceof String) {
			value = value.replace(this.regexUndefined, '<div class="settable"><span>$1</span></div>');
			value = value.replace(this.regexFixedWidth, '<div class=\'settable\' style=\'width: $1px\'><span>$2</span></div>');
			return value;
		} else if (value instanceof SVGTSpanElement) {
			if (value.textContent) {
				if (this.regexUndefined.test(value.textContent) || this.regexFixedWidth.test(value.textContent)) {
					value.classList.add('settableTarget');
				} else {
					value.classList.remove('settableTarget');
				}
				value.textContent = value.textContent.replace(this.regexUndefined, '<div class="settable"><span>$1</span></div>');
				value.textContent = value.textContent.replace(this.regexFixedWidth, '<div class=\'settable\' style=\'width: $1px\'><span>$2</span></div>');
				return value;
			} else {
				value.classList.remove('settableTarget');
				return value;
			}
		} else if (value instanceof HTMLElement) {
			value.innerHTML = value.innerHTML.replace(this.regexUndefined, '<div class="settable"><span>$1</span></div>');
			value.innerHTML = value.innerHTML.replace(this.regexFixedWidth, '<div class=\'settable\' style=\'width: $1px\'><span>$2</span></div>');
			return value;
		}

		return value;
	}
}