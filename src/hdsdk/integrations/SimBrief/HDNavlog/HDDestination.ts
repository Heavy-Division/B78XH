import {HDAirport} from './HDAirport';

export class HDDestination extends HDAirport {
	constructor(data: any) {
		super(data.destination);
	}
}