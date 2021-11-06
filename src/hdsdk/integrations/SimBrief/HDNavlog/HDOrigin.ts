import {HDAirport} from './HDAirport';

export class HDOrigin extends HDAirport {
	constructor(data: any) {
		super(data.origin);
	}
}