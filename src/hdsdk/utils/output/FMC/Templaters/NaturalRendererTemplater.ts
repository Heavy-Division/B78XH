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
export class NaturalRendererTemplater implements IRendererTemplater {
	public arrange(data: string[], target: SVGTSpanElement[]): void {
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

}