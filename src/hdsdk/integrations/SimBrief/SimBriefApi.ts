import {SimBriefCredentials} from "./SimBriefCredentials";

export class SimBriefApi {

	/**
	 * SimBrief credentials
	 * @type {SimBriefCredentials}
	 * @private
	 */
	private readonly credentials: SimBriefCredentials;
	/**
	 * SimBrief API base url
	 * @type {string}
	 * @private
	 */
	private apiBase: string = 'https://www.simbrief.com'
	/**
	 * SimBrief API path
	 * @type {string}
	 * @private
	 */
	private apiPath = 'api/xml.fetcher.php'

	/**
	 * Constructor
	 * @param {SimBriefCredentials} credentials
	 */
	constructor(credentials: SimBriefCredentials) {
		this.credentials = credentials;
	}

	/**
	 * Fetches SimBrief flight plan from API
	 * @param {boolean} json
	 * @returns {Promise<JSON>}
	 */
	public fetchData(json: boolean = true): Promise<JSON> {
		let url = this.constructApiUrl(json);
		return fetch(url.href)
		.then((response) => {
			if (!response.ok) {
				throw (response);
			}

			return response.json();
		});
	}

	/**
	 * Constructs SimBrief API url
	 * @param {boolean} json
	 * @returns {URL}
	 * @private
	 */
	private constructApiUrl(json: boolean = true): URL {
		let url = new URL(this.apiPath, this.apiBase);
		if (json) {
			url.searchParams.append('json', '1');
		}

		if (this.credentials && this.credentials.userId) {
			url.searchParams.append('userid', String(this.credentials.userId));
		}

		if (this.credentials && this.credentials.userName) {
			url.searchParams.append('username', this.credentials.userName);
		}

		return url;
	}
}