import {IRendererMiddleware} from '../../IRendererMiddleware';

/**
 * Encode HTML special characters into HTML entities
 *
 * NOTE: This middleware should not be used alone and without reason. FMCRenderer encodes all values automatically.
 * So there is not reason to use the middleware alone. If you need to manipulate with HTML with another middleware
 * you should use HtmlDecodeRendererMiddleware first then use your special middleware and then encode values
 * by this middleware.
 *
 * Typical usage
 *
 * const renderer = new FMCRenderer(this, new NaturalRendererTemplater());
 * renderer.use(new SeparatorRendererMiddleware()); // This middleware do not manipulate with HTML
 * renderer.use(new HtmlDecodeRendererMiddleware()); // Decode HTML entities in values
 * renderer.use(new HtmlManipulatingRendererMiddleware()); // Your renderer what manipulate with HTML
 * renderer.use(new HtmlEncodeRendererMiddleware()); // Encode HTML special chars back to entities
 */
export class HtmlEncodeRendererMiddleware implements IRendererMiddleware {
	public apply(value: any): any {
		if (value instanceof HTMLElement) {
			value.textContent = value.innerText = value.innerHTML;
			return value;
		}
	}
}