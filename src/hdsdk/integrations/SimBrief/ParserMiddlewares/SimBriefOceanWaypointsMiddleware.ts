import {INavlogParserMiddleware} from './IRendererMiddleware';

export class SimBriefOceanWaypointsMiddleware implements INavlogParserMiddleware {
	private readonly regex: RegExp = /([0-9]{2})N([0-9])([0-9]{2})W/;

	public apply(data: any): any {
		const fixes = data.navlog.fix as { ident: string }[];
		data.navlog.fix = fixes.map((fix) => {
			this.regex.lastIndex = 0;
			fix.ident = (this.regex.test(fix.ident) ? fix.ident.replace(this.regex, '$1$3N') : fix.ident);
			return fix;
		});
		return data;
	}
}