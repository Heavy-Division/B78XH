import { SimBriefCredentials } from "./SimBriefCredentials";
export declare class SimBriefApi {
    /**
     * SimBrief credentials
     * @type {SimBriefCredentials}
     * @private
     */
    private readonly credentials;
    /**
     * SimBrief API base url
     * @type {string}
     * @private
     */
    private apiBase;
    /**
     * SimBrief API path
     * @type {string}
     * @private
     */
    private apiPath;
    /**
     * Constructor
     * @param {SimBriefCredentials} credentials
     */
    constructor(credentials: SimBriefCredentials);
    /**
     * Fetches SimBrief flight plan from API
     * @param {boolean} json
     * @returns {Promise<JSON>}
     */
    fetchData(json?: boolean): Promise<JSON>;
    /**
     * Constructs SimBrief API url
     * @param {boolean} json
     * @returns {URL}
     * @private
     */
    private constructApiUrl;
}
