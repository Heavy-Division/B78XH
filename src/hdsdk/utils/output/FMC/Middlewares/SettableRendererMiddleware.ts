import {IRendererMiddleware} from '../../IRendererMiddleware';

export class SettableRendererMiddleware implements IRendererMiddleware {
	private readonly regex = /\[settable=([0-9]+|undefined)](.*)\[\/settable]/g;

	public apply(value: any): any {
		return this.applyRegex(value);
	}

	private applyRegex(value: any): any {
		this.regex.lastIndex = 0;
		if (value instanceof String) {
			return value.replace(this.regex, '$1');
		} else if (value instanceof SVGTSpanElement) {
			if (value.textContent) {
				if (this.regex.test(value.textContent)) {
					value.classList.add('settableTarget');
				} else {
					value.classList.remove('settableTarget');
				}
				value.textContent = value.textContent.replace(this.regex, '$1');
				return value;
			} else {
				value.classList.remove('settableTarget');
				return value;
			}
		} else if (value instanceof HTMLElement) {
			if (this.regex.test(value.innerHTML)) {
				this.regex.lastIndex = 0;
				const groups = this.regex.exec(value.innerHTML);
				if (groups) {
					if (groups.length === 2) {
						value.innerHTML = '<div class="settable"><span>' + groups[2] + '</span></div>';
					} else if (groups.length === 3) {
						value.innerHTML = '<div class="settable" style="width: ' + groups[1] + 'px"><span>' + groups[2] + '</span></div>';
					}
				}
				//value.innerHTML = value.innerHTML.replace(this.regex, '<div class="settable" style=\"$1\"><span>$2</span></div>');
				//value.innerHTML = value.innerHTML.replace(this.regex, '<div class=\'settable\' style=\'width: $1px\'><span>$2</span></div>');
			}
			return value;
		}

		return value;
	}
}