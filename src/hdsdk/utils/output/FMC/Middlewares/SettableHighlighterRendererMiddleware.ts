import {IRendererMiddleware} from '../../IRendererMiddleware';

export class SettableHighlighterRendererMiddleware implements IRendererMiddleware {

	private readonly settableIdPrefix: string = 'S';

	/**
	 * TODO: Known issue: highlighter highlights whole TSPAN
	 * Need to figure out a way to highlight only part of content
	 * Example: Assumed temperature
	 * @param value
	 * @returns {any}
	 */
	public apply(value: any): any {
		if (value instanceof SVGTSpanElement) {
			const settableBoxId = value.id.replace('TS', this.settableIdPrefix);
			const settableBoxElement = document.getElementById(settableBoxId);
			if (settableBoxElement !== null) {
				if (value.classList.contains('settableTarget')) {
					const mode = settableBoxElement.dataset.mode;
					const length = value.getComputedTextLength();
					if (mode === 'normal') {
						settableBoxElement.style.display = 'block';
						settableBoxElement.setAttribute('width', length + 9 + 'px');
					} else {
						settableBoxElement.style.display = 'block';
						const right = value.getClientRects()[0].right;
						settableBoxElement.setAttribute('x', right - length - 4 + 'px');
						settableBoxElement.setAttribute('width', length + 12 + 'px');
					}
				} else {
					settableBoxElement.style.display = 'none';
				}
			}
		}

		return value;
	}
}