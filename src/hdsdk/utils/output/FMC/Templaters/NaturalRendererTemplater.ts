/**
 * NaturalRendererTemplater
 *
 * Templater renders data in natural way
 *
 * ['left']
 * ['left', 'right']
 * ['left', 'center', 'right']
 * ['left', 'center left', 'center right','right']
 */
import {type} from 'os';

export class NaturalRendererTemplater implements IRendererTemplater {
	public arrange(data: string[], target: HTMLElement[]): void;
	public arrange(data: string[], target: SVGTSpanElement[]): void;
	public arrange(data: string[], target: HTMLElement[] | SVGTSpanElement[]): void {
		this.execute(data, target);
	}

	/**
	 * Executes arrange
	 * @param {string[]} data
	 * @param {HTMLElement[] | SVGTSpanElement[]} target
	 * @private
	 */
	private execute(data: string[], target: HTMLElement[] | SVGTSpanElement[]) {
		/**
		 * TODO: This is only basic check. It should unpack target array and handle every target independently
		 * Templater will fail if the targets are not same. (It should not be a problem because does not make sense to have different targets in one line)
		 */
		if (target[0] instanceof SVGTSpanElement) {
			this.arrangeSVG(data, target as SVGTSpanElement[]);
		} else if (target[0] instanceof HTMLElement) {
			this.arrangeHtml(data, target as HTMLElement[]);
		}
	}

	private arrangeSVG(data: string[], target: SVGTSpanElement[]) {
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
				target[2].textContent = data[1];
				target[3].textContent = '';
				target[4].textContent = data[2];
				break;
			case 4:
				target[0].textContent = data[0];
				target[1].textContent = data[1];
				target[2].textContent = '';
				target[3].textContent = data[2];
				target[4].textContent = data[3];
				break;
		}
	}

	private arrangeHtml(data: string[], target: HTMLElement[]) {
		switch (data.length) {
			case 1:
				target[0].textContent = target[0].innerText = data[0];
				target[1].textContent = target[1].innerText = '';
				target[2].textContent = target[2].innerText = '';
				target[3].textContent = target[3].innerText = '';
				target[4].textContent = target[4].innerText = '';
				break;
			case 2:
				target[0].textContent = target[0].innerText = data[0];
				target[1].textContent = target[1].innerText = '';
				target[2].textContent = target[2].innerText = '';
				target[3].textContent = target[3].innerText = '';
				target[4].textContent = target[4].innerText = data[1];
				break;
			case 3:
				target[0].textContent = target[0].innerText = data[0];
				target[1].textContent = target[1].innerText = '';
				target[2].textContent = target[2].innerText = data[1];
				target[3].textContent = target[3].innerText = '';
				target[4].textContent = target[4].innerText = data[2];
				break;
			case 4:
				target[0].textContent = target[0].innerText = data[0];
				target[1].textContent = target[1].innerText = data[1];
				target[2].textContent = target[2].innerText = '';
				target[3].textContent = target[3].innerText = data[2];
				target[4].textContent = target[4].innerText = data[3];
				break;
		}

	}

}