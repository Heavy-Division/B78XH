import {INavlogParserMiddleware} from './IRendererMiddleware';

export class RemoveTodParserMiddleware implements INavlogParserMiddleware {
	public apply(data: any): any {
		const fixes = data.navlog.fix as { ident: string, name: string }[];
		data.navlog.fix = fixes.filter((fix) => fix.ident !== 'TOD' && fix.name !== 'TOP OF DESCENT');
		return data;
	}
}