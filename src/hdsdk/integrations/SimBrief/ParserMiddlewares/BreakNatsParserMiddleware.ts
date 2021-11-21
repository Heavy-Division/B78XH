import {INavlogParserMiddleware} from './IRendererMiddleware';

export class BreakNatsParserMiddleware implements INavlogParserMiddleware {
	private readonly nats = ['NATA', 'NATB', 'NATC', 'NATD', 'NATE', 'NATF', 'NATG', 'NATH', 'NATJ', 'NATK', 'NATL', 'NATM', 'NATN', 'NATP', 'NATQ', 'NATR', 'NATS', 'NATT', 'NATU', 'NATV', 'NATW', 'NATX', 'NATY', 'NATZ'];

	public apply(data: any): any {
		const fixes = data.navlog.fix as { via_airway: string }[];
		data.navlog.fix = fixes.map((fix) => {
			fix.via_airway = (this.nats.includes(fix.via_airway) ? 'DCT' : fix.via_airway);
			return fix;
		});

		return data;
	}
}