export declare class SimBrief {
    /**
     * SimBrief credentials
     * @type {SimBriefCredentials}
     * @private
     */
    private readonly credentials;
    /**
     * SimBrief Api
     * @type {SimBriefApi}
     * @private
     */
    private readonly api;
    /**
     * SimBrief flight plan
     * @type {Promise<JSON> | null}
     * @private
     */
    private flightPlan;
    /**
     * Constructor
     */
    constructor();
    /**
     * Returns SimBrief username from credentials
     * @returns {string}
     */
    getUserName(): string;
    /**
     * Returns SimBrief userId from credentials
     * @returns {number}
     */
    getUserId(): number;
    /**
     * Returns SimBrief flight plan
     * @returns {Promise<JSON> | null}
     */
    getFlightPlan(): Promise<JSON> | null;
    /**
     * Fetches SimBrief flight plan from API
     * @private
     */
    private fetchFlightPlan;
}
