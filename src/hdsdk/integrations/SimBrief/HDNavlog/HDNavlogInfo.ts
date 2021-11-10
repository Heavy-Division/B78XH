export class HDNavlogInfo {
	public flightNumber: string;
	public costIndex: number;
	public initialAltitude: number;
	public cruiseMach: number;
	public cruiseTrueAirspeed: number;
	public route: string;
	public sid: string;
	public star: string;
	public enRouteTrans: string;
	public units: string;

	constructor(data: any) {
		const general = data.general;
		this.flightNumber = general.flight_number;
		this.costIndex = parseInt(general.costindex);
		this.initialAltitude = parseInt(general.initial_altitude);
		this.cruiseMach = parseFloat(general.cruise_mach);
		this.cruiseTrueAirspeed = parseInt(general.cruise_tas);
		this.route = general.route;
		this.units = data.params.units;
		const fixes = data.navlog.fix as { ident: string, is_sid_star: number, via_airway: string }[];
		const destination: string = data.destination.icao_code;
		const lastWaypointIndex = (fixes[fixes.length - 1].ident === destination ? fixes.length - 2 : fixes.length - 1);
		this.sid = fixes[0].via_airway !== 'DCT' ? fixes[0].via_airway : 'DCT';
		this.star = fixes[lastWaypointIndex].via_airway !== 'DCT' ? fixes[lastWaypointIndex].via_airway : 'DCT';
		if (this.sid !== 'DCT') {
			const transIndex = data.navlog.fix.map((waypoint) => {
				return waypoint.via_airway === this.sid;
			}).lastIndexOf(true);
			this.enRouteTrans = data.navlog.fix[transIndex].ident;
		}
	}
}