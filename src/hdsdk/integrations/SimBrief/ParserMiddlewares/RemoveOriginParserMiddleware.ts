import {INavlogParserMiddleware} from './IRendererMiddleware';

export class RemoveOriginParserMiddleware implements INavlogParserMiddleware {
	public apply(data: any): any {
		const fixes = data.navlog.fix as { ident: string, name: string }[];
		const origin: string = data.destination.icao_code;
		data.navlog.fix = fixes.filter((fix) => fix.ident !== origin);
		return data;
	}
}