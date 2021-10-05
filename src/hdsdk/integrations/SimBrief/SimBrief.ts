import {SimBriefApi} from "./SimBriefApi";
import {SimBriefCredentials} from "./SimBriefCredentials";

export class SimBrief {

	/**
	 * SimBrief credentials
	 * @type {SimBriefCredentials}
	 * @private
	 */
	private readonly credentials: SimBriefCredentials;
	/**
	 * SimBrief Api
	 * @type {SimBriefApi}
	 * @private
	 */
	private readonly api: SimBriefApi;
	/**
	 * SimBrief flight plan
	 * @type {Promise<JSON> | null}
	 * @private
	 */
	private flightPlan: Promise<JSON> | null;

	/**
	 * Constructor
	 */
	constructor() {
		this.credentials = new SimBriefCredentials();
		this.api = new SimBriefApi(this.credentials);
		this.flightPlan = null;
	}

	/**
	 * Returns SimBrief username from credentials
	 * @returns {string}
	 */
	public getUserName(): string {
		return this.credentials.userName;
	}

	/**
	 * Returns SimBrief userId from credentials
	 * @returns {number}
	 */
	public getUserId(): number {
		return this.credentials.userId;
	}

	/**
	 * Returns SimBrief flight plan
	 * @returns {Promise<JSON> | null}
	 */
	public getFlightPlan(): Promise<JSON> | null {
		if (!this.flightPlan) {
			this.fetchFlightPlan();
		}

		return this.flightPlan;
	}

	/**
	 * Fetches SimBrief flight plan from API
	 * @private
	 */
	private fetchFlightPlan(): void {
		this.flightPlan = this.api.fetchData();
	}
}