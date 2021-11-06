import {HDFixType} from './HDFixType';
import {HDFixStage} from './HDFixStage';

export class HDFix {
	private readonly rawData: any;
	private _originalIdent: string;
	private _ident: string;
	public name: string;
	public type: HDFixType;
	public airway: string;
	public lat: number;
	public lon: number;
	public mora: number;
	public stage: HDFixStage;


	private coordinatesRegex = /([0-9]{2})([NS])([0-9])([0-9]{2})([WE])/g;
	private coordinatesShorthandOverRegex = /([0-9]{2}([NSE])([0-9]{2}))/g;
	private coordinatesShorthandUnderRegex = /([0-9]{2}([0-9]{2})([NSE]))/g;

	get ident(): string {
		return this._ident;
	}

	get originalIdent(): string {
		return this._originalIdent;
	}

	get flightPhase(): HDFixStage {
		return this.stage;
	}

	get isCoordinatesWaypoint(): boolean {
		this.coordinatesRegex.lastIndex = 0;
		this.coordinatesShorthandOverRegex.lastIndex = 0;
		this.coordinatesShorthandUnderRegex.lastIndex = 0;
		if (this.type === HDFixType.MISC || this.type === HDFixType.WAYPOINT) {
			if (this.coordinatesRegex.test(this.originalIdent) || this.coordinatesShorthandOverRegex.test(this.originalIdent) || this.coordinatesShorthandUnderRegex.test(this.originalIdent)) {
				return true;
			}
		}

		return false;
	}

	constructor(data: any) {
		this.rawData = data;
		this.parse();
	}

	private parse() {
		this._originalIdent = this.rawData.ident;
		this._ident = this.convertIdent(this.rawData.ident);
		this.name = this.rawData.name;
		this.type = this.parseType(this.rawData.type);
		this.stage = this.parseStage(this.rawData.stage);
		this.airway = this.rawData.via_airway;
		this.lat = this.rawData.pos_lat as number;
		this.lon = this.rawData.pos_long as number;
		this.mora = this.rawData.mora as number;
	}

	private convertIdent(ident: string): string {
		/**
		 * 50.30N060W -> H5060
		 *
		 *
		 * 50N160W -> 50N60
		 * 50S160E -> 50S60
		 * 50S160W -> 50W60
		 * 50N160E -> 50E60
		 *
		 *
		 * 50N060W -> 5060N
		 * 50N060E  -> 5060E
		 * 50S060E -> 5060S
		 * 50S060W -> 5060W
		 */
		/**
		 * /([0-9]{2})([NS])([0-9])([0-9]{2})([WE])/g
		 */
		if (this.coordinatesRegex.test(ident)) {
			return ident.replace(this.coordinatesRegex, (matches, lat, mid, lonStart, lonEnd, end) => {
				if (lonStart == '0') {
					if (mid === 'N' && end == 'W') {
						return lat + lonEnd + 'N';
					} else if (mid === 'N' && end == 'E') {
						return lat + lonEnd + 'E';
					} else if (mid === 'S' && end == 'W') {
						return lat + lonEnd + 'W';
					} else if (mid === 'S' && end == 'E') {
						return lat + lonEnd + 'S';
					}
				} else {
					if (mid === 'N' && end == 'W') {
						return lat + 'N' + lonEnd;
					} else if (mid === 'N' && end == 'E') {
						return lat + 'E' + lonEnd;
					} else if (mid === 'S' && end == 'W') {
						return lat + 'W' + lonEnd;
					} else if (mid === 'S' && end == 'E') {
						return lat + 'S' + lonEnd;
					}
				}
			});
		}
		return ident;
	}

	parseType(value: string): HDFixType {
		switch (value) {
			case 'wpt':
				return HDFixType.WAYPOINT;
			case 'apt':
				return HDFixType.AIRPORT;
			case 'vor':
				return HDFixType.VOR;
			default:
				return HDFixType.MISC;

		}
	}

	parseStage(value: string): HDFixStage {
		switch (value) {
			case 'CLB':
				return HDFixStage.CLB;
			case 'CRZ':
				return HDFixStage.CRZ;
			case 'DSC':
				return HDFixStage.DES;
			default:
				return undefined;
		}
	}
}