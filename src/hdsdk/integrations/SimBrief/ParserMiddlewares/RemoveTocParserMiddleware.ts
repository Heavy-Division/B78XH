import {INavlogParserMiddleware} from './IRendererMiddleware';

export class RemoveTocParserMiddleware implements INavlogParserMiddleware {
	public apply(data: any): any {
		const fixes = data.navlog.fix as { ident: string, name: string }[];
		data.navlog.fix = fixes.filter((fix) => fix.ident !== 'TOC' && fix.name !== 'TOP OF CLIMB');
		return data;
	}
}