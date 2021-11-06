import {INavlogParserMiddleware} from './ParserMiddlewares/IRendererMiddleware';
import {HDFix} from './HDNavlog/HDFix';
import {HDOrigin} from './HDNavlog/HDOrigin';
import {HDDestination} from './HDNavlog/HDDestination';
import {HDNavlog} from './HDNavlog/HDNavlog';
import {HDNavlogInfo} from './HDNavlog/HDNavlogInfo';
import {SimBrief} from './SimBrief';

export class SimBriefNavlogParser {
	private _rawNavlog: JSON = undefined;
	private transformedNavlog: any = undefined;
	private navlog: HDNavlog = undefined;
	private middlewares: INavlogParserMiddleware[] = [];
	private _fixes: HDFix[] = [];
	private _origin: HDOrigin;
	private _destination: HDDestination;
	private _info: HDNavlogInfo;
	private simbrief: SimBrief;


	constructor(simbrief: SimBrief) {
		this.simbrief = simbrief;
	}

	get info(): HDNavlogInfo {
		return this._info;
	}

	get origin(): HDOrigin {
		return this._origin;
	}

	get destination(): HDDestination {
		return this._destination;
	}

	get fixes(): HDFix[] {
		return this._fixes;
	}

	async parse() {
		this._rawNavlog = await this.simbrief.getFlightPlan();
		await this.parseOrigin();
		await this.parseDestination();
		await this.parseNavlogInfo();
		await this.transformNavlog();
		await this.parseWaypoints();
	}

	async transformNavlog(): Promise<void> {
		const data = await this._rawNavlog;
		this.transformedNavlog = this.applyMiddlewares(data);
	}

	async parseWaypoints(): Promise<void> {
		const fixes = this.transformedNavlog.navlog.fix;
		for (const fix of fixes) {
			this._fixes.push(new HDFix(fix));
		}
	}

	public use(middleware: INavlogParserMiddleware) {
		this.middlewares.push(middleware);
	}

	private applyMiddleware(data: any, middleware: INavlogParserMiddleware) {
		return middleware.apply(data);
	}

	private applyMiddlewares(data: any) {
		let output = data;

		this.middlewares.forEach((middleware) => {
			output = this.applyMiddleware(output, middleware);
		});
		return output;
	}

	private async parseOrigin() {
		this._origin = new HDOrigin(this._rawNavlog);
	}

	private async parseDestination() {
		this._destination = new HDDestination(this._rawNavlog);
	}

	private async parseNavlogInfo() {
		this._info = new HDNavlogInfo(this._rawNavlog);
	}
}