import {INavlogParserMiddleware} from './IRendererMiddleware';

export class RemoveDestinationParserMiddleware implements INavlogParserMiddleware {
	public apply(data: any): any {
		const fixes = data.navlog.fix as { ident: string, name: string }[];
		const destination: string = data.destination.icao_code;
		data.navlog.fix = fixes.filter((fix) => fix.ident !== destination);
		return data;
	}
}