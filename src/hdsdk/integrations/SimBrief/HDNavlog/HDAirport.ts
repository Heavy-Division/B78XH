import {IHDAirport} from './IHDAirport';

export abstract class HDAirport implements IHDAirport {
	public readonly icao: string;
	public readonly iata: string;
	public readonly name: string;
	public readonly lat: number;
	public readonly lon: number;
	public readonly elevation: number;
	public readonly plannedRunway: string;

	protected constructor(data: any) {
		const airport = data;
		this.icao = airport.icao_code;
		this.iata = airport.iata_code;
		this.name = airport.name;
		this.lat = Number(airport.pos_lat);
		this.lon = Number(airport.pos_lon);
		this.elevation = Number(airport.elevation);
		this.plannedRunway = airport.plan_rwy;
	}

}