/**
 * NaturalRendererTemplater
 *
 * Templater renders data in default (ASOBO) way
 *
 * ['left']
 * ['left', 'right']
 * ['left', 'right', 'center']
 * ['left','right', 'center left', 'center right']
 */
export class DefaultRendererTemplater implements IRendererTemplater {
	public arrange(data: string[], target: HTMLElement[]): void;
	public arrange(data: string[], target: SVGTSpanElement[]): void;
	public arrange(data: string[], target: HTMLElement[] | SVGTSpanElement[]): void {
		if (target instanceof SVGTSpanElement) {
			this.arrangeSVG(data, target);
		} else if (target instanceof HTMLElement) {
			this.arrangeHtml(data, target);
		}
	}

	private arrangeSVG(data: string[], target: SVGTSpanElement) {
		switch (data.length) {
			case 1:
				target[0].textContent = data[0];
				target[1].textContent = '';
				target[2].textContent = '';
				target[3].textContent = '';
				target[4].textContent = '';
				break;
			case 2:
				target[0].textContent = data[0];
				target[1].textContent = '';
				target[2].textContent = '';
				target[3].textContent = '';
				target[4].textContent = data[1];
				break;
			case 3:
				target[0].textContent = data[0];
				target[1].textContent = '';
				target[2].textContent = data[2];
				target[3].textContent = '';
				target[4].textContent = data[1];
				break;
			case 4:
				target[0].textContent = data[0];
				target[1].textContent = data[2];
				target[2].textContent = '';
				target[3].textContent = data[3];
				target[4].textContent = data[1];
				break;
		}
	}

	private arrangeHtml(data: string[], target: HTMLElement) {
		switch (data.length) {
			case 1:
				target[0].innerHTML = data[0];
				target[1].innerHTML = '';
				target[2].innerHTML = '';
				target[3].innerHTML = '';
				target[4].innerHTML = '';
				break;
			case 2:
				target[0].innerHTML = data[0];
				target[1].innerHTML = '';
				target[2].innerHTML = '';
				target[3].innerHTML = '';
				target[4].innerHTML = data[1];
				break;
			case 3:
				target[0].innerHTML = data[0];
				target[1].innerHTML = '';
				target[2].innerHTML = data[2];
				target[3].innerHTML = '';
				target[4].innerHTML = data[1];
				break;
			case 4:
				target[0].innerHTML = data[0];
				target[1].innerHTML = data[2];
				target[2].innerHTML = '';
				target[3].innerHTML = data[3];
				target[4].innerHTML = data[1];
				break;
		}
	}
}