import {INavlogParserMiddleware} from './IRendererMiddleware';

/**
 * TODO:
 *
 * Transition has is_sid_star = 0 and via_airway set to last enroute airway or DCT
 *
 * There is no possibility to find out if the waypoint is TRANS or normal enroute waypoint
 *
 * Should we remove the trans??
 * Is possible to set TRANS by IDENT in MSFS??
 * Is possible to iterate over trans for the star. (easy)
 *
 * REMOVING TRANS NOW
 */
export class RemoveStarParserMiddleware implements INavlogParserMiddleware {
	public apply(data: any): any {
		const fixes = data.navlog.fix as { ident: string, is_sid_star: number, via_airway: string }[];
		if(fixes.length === 0){
			return data;
		}
		const destination: string = data.destination.icao_code;
		const lastWaypointIndex = (fixes[fixes.length - 1] && fixes[fixes.length - 1].ident === destination ? fixes.length - 2 : fixes.length - 1);
		const isLastWaypointInStar = parseInt(String(fixes[lastWaypointIndex].is_sid_star));
		const star: string = fixes[lastWaypointIndex].via_airway !== 'DCT' ? (isLastWaypointInStar !== 0 ? fixes[lastWaypointIndex].via_airway : 'DCT') : 'DCT';
		if (star === 'DCT') {
			return data;
		}
		data.navlog.fix = fixes.filter((fix) => fix.via_airway !== star && fix.is_sid_star != 1);

		return data;
	}
}