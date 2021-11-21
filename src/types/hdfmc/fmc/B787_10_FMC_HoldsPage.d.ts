/**
 * The ACT/MOD holds and holds list pages for the FMC.
 */
import { B787_10_FMC } from "./B787_10_FMC";
export declare class B787_10_FMC_HoldsPage {
    static Instance: any;
    static FPLN_HOLD: string;
    static HOLD_LIST: string;
    static NONE: string;
    static ADD: string;
    static CHANGE_EXISTING: string;
    private readonly _fmc;
    private _state;
    /**
     * Creates an instance of the holds page controller.
     * @param {B787_10_FMC} fmc The instance of the FMC to use with this instance.
     */
    constructor(fmc: B787_10_FMC);
    /**
     * Initializes the holds page instance.
     */
    prepare(): void;
    /**
     * Updates the holds page.
     * @param {boolean} forceUpdate Whether or not to force the page update.
     */
    update(forceUpdate?: boolean): void;
    /**
     * Binds LSK behavior for the FPLN HOLD page.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold that is being displayed.
     * @param {number} numHolds The total number of holds currently in the plan.
     */
    bindFplnHoldInputs(currentHold: any, numHolds: any): void;
    /**
     * Binds LSK behavior for the HOLD LIST page.
     * @param {{waypoint: WayPoint, index: number}[]} currentHolds The current holds that are being displayed.
     */
    bindHoldListInputs(currentHolds: any): void;
    /**
     * Changes the hold's inbound course.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold to change the course for.
     */
    changeHoldCourse(currentHold: any): void;
    /**
     * Changes the hold's leg time.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold to change the leg time for.
     */
    changeHoldTime(currentHold: any): void;
    /**
     * Changes the hold's leg time.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold to change the leg time for.
     */
    changeHoldDistance(currentHold: any): void;
    /**
     * Toggles the hold's max speed type.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold to change the max speed type for.
     */
    toggleSpeedType(currentHold: any): void;
    /**
     * Updates the EFC time for the current hold.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold to change the EFC time for.
     */
    changeEFCTime(currentHold: any): void;
    /**
     * Renders the FPLN HOLD page.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold.
     * @param {Date} eta The ETA to arrive at the hold fix.
     * @param {number} numPages The total number of pages.
     */
    renderFplnHold(currentHold: any, eta: any, numPages: any): void;
    /**
     * Renders the HOLD LIST page.
     * @param {{waypoint: WayPoint, index: number}[]} currentHolds The current holds.
     */
    renderHoldList(currentHolds: any): void;
    /**
     * Handles when CANCEL MOD is pressed.
     */
    handleCancelMod(): void;
    /**
     * Handles when EXEC is pressed.
     */
    handleExec(): void;
    /**
     * Handles when EXIT HOLD is pressed.
     */
    handleExitHold(): void;
    /**
     * Handles when CANCEL EXIT is pressed.
     */
    handleCancelExit(): void;
    /**
     * Whether or not the current hold is active.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold.
     * @returns {boolean} True if active, false otherwise.
     */
    isHoldActive(currentHold: any): boolean;
    /**
     * Whether or not the current hold is exiting.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold.
     * @returns {boolean} True if exiting, false otherwise.
     */
    isHoldExiting(currentHold: any): boolean;
    /**
     * Gets the maximum KIAS for the hold given the hold speed regulation selection.
     * @param {HoldDetails} holdDetails The details about the given hold.
     * @returns {number} The maximum hold speed in KIAS.
     */
    getMaxKIAS(holdDetails: any): 280 | 240 | 200 | 230 | 265;
    /**
     * Calculates the estimated time of arrival at the specified hold.
     * @param {{waypoint: WayPoint, index: number}} currentHold The current hold to change the course for.
     * @returns {Date} The ETA to the hold fix.
     */
    calculateETA(currentHold: any): Date;
    /**
     * Gets the current plane position
     * @returns {LatLongAlt} The current plane position.
     */
    static getPlanePosition(): LatLongAlt;
    /**
     * Gets the holds defined in the flight plan.
     * @param {B787_10_FMC} fmc The FMC to use to look up the holds.
     * @returns {{waypoint: WayPoint, index: number}[]} A collection of waypoints that have holds defined.
     */
    static getFlightplanHolds(fmc: any): any;
    /**
     * Gets a string for the given entry type.
     * @param {HoldEntry} entryType The entry type.
     * @returns {string} The string for the entry type.
     */
    static getEntryTypeString(entryType: any): "DIRECT" | "PARALL" | "TEARDP";
    /**
     * Shows the FPLN HOLD page optionally for the specified ident.
     * @param {B787_10_FMC} fmc The instance of the FMC to use.
     * @param {string} ident The ident to show.
     */
    static showHoldPage(fmc: any, ident: any): void;
    /**
     * Shows the HOLD LIST page.
     * @param {B787_10_FMC} fmc The instance of the FMC to use.
     */
    static showHoldList(fmc: any): void;
    /**
     * Handles when HOLD is pressed from the IDX page.
     * @param {B787_10_FMC} fmc The instance of the FMC to use.
     */
    static handleHoldPressed(fmc: any): void;
}
