export declare class SimBriefCredentials {
    /**
     * SimBrief username
     * @type {string}
     * @private
     */
    private readonly _userName;
    /**
     * SimBrief userId
     * @type {number}
     * @private
     */
    private readonly _userId;
    /**
     * Constructor
     * @param {string} userName
     * @param {number} userId
     */
    constructor(userName?: string, userId?: number);
    /**
     * Returns SimBrief username
     * @returns {string}
     */
    get userName(): string;
    /**
     * Returns SimBrief userId
     * @returns {number}
     */
    get userId(): number;
}
