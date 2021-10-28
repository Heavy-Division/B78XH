import {IRendererMiddleware} from '../../IRendererMiddleware';

export class SettableHighlighterRendererMiddleware implements IRendererMiddleware {
	public apply(value: any): any {
		const textElement = document.getElementById('LT1');
		if (textElement) {
			let t2 = textElement.getElementsByTagName('tspan')[0];

			const rects = t2.getComputedTextLength();

			const box = t2.getBBox();
			console.log(box.height);
			const settableDiv = document.createElement('div');
			settableDiv.classList.add('settable');
			settableDiv.style.position = 'absolute';
			settableDiv.style.top = box.y + 'px';
			settableDiv.style.left = box.x + 'px';
			settableDiv.style.width = (rects + 12) + 'px';
			settableDiv.style.height = box.height + 'px';
			settableDiv.style.opacity = '0.5';
			settableDiv.style.backgroundColor = 'red';
			settableDiv.style.zIndex = '0';
			window.document.body.appendChild(settableDiv);
			return value;
		}

		/*
				const textElement = value as SVGTSpanElement;
				if (textElement) {
					//return textElement.getElementsByTagName('tspan')[0];
					const rects = textElement.getComputedTextLength();

					const box = textElement.getBBox();
					console.log(box.height);
					const settableDiv = document.createElement('div');
					settableDiv.classList.add('settable');
					settableDiv.style.position = 'absolute';
					settableDiv.style.top = box.y + 'px';
					settableDiv.style.left = box.x + 'px';
					settableDiv.style.width = (rects + 12) + 'px';
					settableDiv.style.height = box.height + 'px';
					settableDiv.style.opacity = '0.5';
					settableDiv.style.backgroundColor = 'red';
					settableDiv.style.zIndex = '0';
					window.document.body.appendChild(settableDiv);
					return value;
				}
		*/
		/*
		console.log(typeof value);
		console.log(value);
		if (value instanceof SVGTSpanElement) {
			const rects = value.getClientRects();
			for (let i = 0; i <= rects.length; i++) {
				console.log(rects);
			}

			const settableDiv = document.createElement('div');
			settableDiv.classList.add('settable');
			settableDiv.style.position = 'absolute';
			settableDiv.style.top = (rects[0].top - 6) + 'px';
			settableDiv.style.left = (rects[0].left - 6) + 'px';
			settableDiv.style.width = (rects[0].width - 3) + 'px';
			settableDiv.style.height = rects[0].height + 'px';
			settableDiv.style.opacity = '0.5';
			settableDiv.style.backgroundColor = 'red';
			window.document.body.appendChild(settableDiv);
			return value;
		}*/

		return value;
	}
}