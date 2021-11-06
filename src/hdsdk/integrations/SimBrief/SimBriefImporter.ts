import {SimBriefNavlogParser} from './SimBriefNavlogParser';
import {HDFix} from './HDNavlog/HDFix';
import {INavlogImporter} from './INavlogImporter';
import {HDDestination} from './HDNavlog/HDDestination';
import {HDNavlogInfo} from './HDNavlog/HDNavlogInfo';
import {HDOrigin} from './HDNavlog/HDOrigin';

export class SimBriefImporter implements INavlogImporter {

	private readonly parser: SimBriefNavlogParser;

	constructor(parser: SimBriefNavlogParser) {
		this.parser = parser;
	}

	getInfo(): HDNavlogInfo {
		return this.parser.info;
	}

	getFixes(): HDFix[] {
		return this.parser.fixes;
	}

	getOrigin(): HDOrigin {
		return this.parser.origin;
	}

	getDestination(): HDDestination {
		return this.parser.destination;
	}

	public async execute(): Promise<void> {
		return new Promise<void>(async (resolve) => {
			await this.parser.parse();
			resolve();
		});
	}
}