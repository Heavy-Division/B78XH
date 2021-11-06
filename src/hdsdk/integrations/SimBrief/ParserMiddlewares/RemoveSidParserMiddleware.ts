import {INavlogParserMiddleware} from './IRendererMiddleware';

/**
 * TODO:
 *
 * Transition has is_sid_star = 0 and via_airway set to SID
 *
 * Should we remove the trans??
 * Is possible to set TRANS by IDENT in MSFS??
 * Is possible to iterate over trans for airport. (easy)
 *
 * REMOVING TRANS NOW
 */
export class RemoveSidParserMiddleware implements INavlogParserMiddleware {
	public apply(data: any): any {
		const fixes = data.navlog.fix as { ident: string, is_sid_star: number, via_airway: string }[];
		const sid: string = fixes[0].via_airway !== 'DCT' ? fixes[0].via_airway : 'DCT';
		if (sid === 'DCT') {
			return data;
		}
		data.navlog.fix = fixes.filter((fix) => fix.via_airway !== sid && fix.is_sid_star !== 1);
		return data;
	}
}