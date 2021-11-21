import { BaseFMC } from './BaseFMC';
export declare class Boeing_FMC extends BaseFMC {
    protected _forceNextAltitudeUpdate: boolean;
    protected _lastTargetAirspeed: number;
    protected _isLNAVActive: boolean;
    protected _pendingLNAVActivation: boolean;
    protected _isVNAVActive: boolean;
    protected _pendingVNAVActivation: boolean;
    protected _isFLCHActive: boolean;
    protected _pendingFLCHActivation: boolean;
    protected _isSPDActive: boolean;
    protected _pendingSPDActivation: boolean;
    protected _isSpeedInterventionActive: boolean;
    protected _isHeadingHoldActive: boolean;
    protected _headingHoldValue: number;
    protected _pendingHeadingSelActivation: boolean;
    protected _isVSpeedActive: boolean;
    protected _isAltitudeHoldActive: boolean;
    protected _altitudeHoldValue: number;
    protected _onAltitudeHoldDeactivate: Function;
    _isRouteActivated: boolean;
    protected _fpHasChanged: boolean;
    _activatingDirectTo: boolean;
    /**
     * Reason of this property is wrong activeRoute function and wrong using of _isRouteActivated property.
     * Normal behavior is that once route is activated by ACTIVATE prompt and EXEC all others modifications of route
     * automatically activate EXEC for direct executing and storing the changes in FMC.
     * When route is not activated by ACTIVATE prompt any changes do not activate EXEC and only way to activate
     * the EXEC is use ACTIVATE prompt
     *
     * ASOBO behavior:
     * _isRouteActivated is used as flag for awaiting changes for execution in a route and as EXEC illumination FLAG.
     *
     * STATES OF ROUTE:
     *
     * NOT ACTIVATED -> Route is not activated -> ACTIVATE prompt not pushed and EXECUTED, changes in route do not illuminate EXEC
     * ACTIVATED -> Route is activated -> ACTIVATE prompt pushed and EXECUTED, changes in route illuminate EXEC
     * MODIFIED -> Route is modified -> ACTIVATED and changes awaiting for execution (EXEC illuminating)
     *
     * This property holds ACTIVATED / NOT ACTIVATED state because of the misuse of _isRouteActivated in default Asobo implementation
     * @type {boolean}
     * @private
     */
    _isMainRouteActivated: boolean;
    dataHolder: FMCDataHolder;
    messageManager: FMCMessagesManager;
    protected onExec: () => void;
    onExecPage: () => void;
    onExecDefault: () => void;
    private _pageRefreshTimer;
    protected _navModeSelector: B78XHNavModeSelector;
    _speedDirector: SpeedDirector;
    _thrustTakeOffTemp: number;
    thrustReductionHeight: number;
    protected isThrustReductionAltitudeCustomValue: boolean;
    _activatingDirectToExisting: boolean;
    vfrLandingRunway: any;
    setTakeOffFlap(s: string): boolean;
    get fpHasChanged(): boolean;
    set fpHasChanged(value: boolean);
    /**
     * Speed Intervention FIX
     */
    getIsSpeedInterventionActive(): boolean;
    toggleSpeedIntervention(): void;
    activateSpeedIntervention(): void;
    deactivateSpeedIntervention(): void;
    activateSPD(): void;
    doActivateSPD(): void;
    deactivateSPD(): void;
    constructor();
    Init(): void;
    /**
     * TODO: Better to use synchronizeTemporaryAndActiveFlightPlanWaypoints in future
     * (implementation can be found in source code prior 0.1.10 version)
     */
    copyAirwaySelections(): void;
    onFMCFlightPlanLoaded(): void;
    activateRoute(directTo?: boolean, callback?: () => void): void;
    eraseRouteModifications(): void;
    activateMainRoute(callback?: () => void): void;
    setDepartureEnrouteTransitionIndex(departureEnrouteTransitionIndex: number, callback?: (arg0: boolean) => void): void;
    setArrivalRunwayTransitionIndex(arrivalRunwayTransitionIndex: number, callback?: (arg0: boolean) => void): void;
    setArrivalAndRunwayIndex(arrivalIndex: number, enrouteTransitionIndex: number, callback?: (arg0: boolean) => void): any;
    toggleLNAV(): void;
    toggleHeadingHold(): void;
    activateAltitudeSel(): void;
    onEvent(_event: any): void;
    getIsLNAVArmed(): boolean;
    getIsLNAVActive(): boolean;
    activateLNAV(): void;
    doActivateLNAV(): void;
    deactivateLNAV(): void;
    getIsVNAVArmed(): boolean;
    getIsVNAVActive(): boolean;
    toggleVNAV(): void;
    activateVNAV(): void;
    doActivateVNAV(): void;
    setThrottleMode(_mode: ThrottleMode): void;
    deactivateVNAV(): void;
    getIsFLCHArmed(): boolean;
    getIsFLCHActive(): boolean;
    toggleFLCH(): void;
    activateFLCH(): void;
    doActivateFLCH(): void;
    deactivateFLCH(): void;
    getIsSPDArmed(): boolean;
    getIsSPDActive(): boolean;
    toggleSPD(): void;
    activateTHRREFMode(): void;
    getIsHeadingHoldActive(): boolean;
    activateHeadingHold(): void;
    deactivateHeadingHold(): void;
    activateHeadingSel(): void;
    doActivateHeadingSel(): void;
    getIsTHRActive(): boolean;
    getIsVSpeedActive(): boolean;
    toggleVSpeed(): void;
    activateVSpeed(): void;
    deactivateVSpeed(): void;
    toggleAltitudeHold(): void;
    getIsAltitudeHoldActive(): boolean;
    activateAltitudeHold(useCurrentAutopilotTarget?: boolean): void;
    deactivateAltitudeHold(): void;
    getThrustTakeOffLimit(): number;
    getThrustClimbLimit(): number;
    _getComputedVRSpeed(): number;
    getVRef(flapsHandleIndex?: number, useCurrentWeight?: boolean): number;
    getTakeOffManagedSpeed(): number;
    getIsRouteActivated(): boolean;
    setBoeingDirectTo(directToWaypointIdent: any, directToWaypointIndex: any, callback?: (arg0: boolean) => void): void;
    updateHUDAirspeedColors(): void;
    /**
     * Registers a periodic page refresh with the FMC display.
     * @param {number} interval The interval, in ms, to run the supplied action.
     * @param {function} action An action to run at each interval. Can return a bool to indicate if the page refresh should stop.
     * @param {boolean} runImmediately If true, the action will run as soon as registered, and then after each
     * interval. If false, it will start after the supplied interval.
     */
    registerPeriodicPageRefresh(action: any, interval: any, runImmediately: any): void;
    /**
     * Unregisters a periodic page refresh with the FMC display.
     */
    unregisterPeriodicPageRefresh(): void;
    clearDisplay(): void;
    /**
     * FMC Renderer extensions
     * TODO: Standalone rendered should be created.
     */
    setTemplate(template: string[][]): void;
    /**
     * Convert text to settable FMC design
     * @param content
     * @returns {string}
     */
    makeSettable(content: string): string;
    /**
     * Convert/set text to colored text
     * @param content
     * @param color
     * @returns {string}
     */
    colorizeContent(content: string, color: string): string;
    /**
     * Convert/set text size
     * @param content
     * @param size
     * @returns {string}
     */
    resizeContent(content: string, size: string): string;
    /**
     * setTitle with settable/size/color support
     * @param content
     */
    setTitle(content: string): void;
    /**
     * setlabel with settable/size/color support
     * @param content
     */
    setLabel(label: string, row: number, col?: number): void;
    /**
     * setline with settable/size/color support
     * @param content
     */
    setLine(content: string, row: number, col?: number): void;
    trySetTransAltitude(s: string): boolean;
    /**
     * TODO: Should be moved to SpeedDirector class
     * @param s
     * @returns {boolean}
     */
    trySetAccelerationHeight(s: string): boolean;
    /**
     * TODO: Should be moved to SpeedDirector class
     * @param s
     * @returns {boolean}
     */
    trySetAccelerationAltitude(s: string): boolean;
    /**
     * TODO: Should be moved to SpeedDirector/ThrustDirector
     * TODO: Probably should be better to make ThrustDirector because thr reduction is not speed thing
     * @param s
     * @returns {boolean}
     */
    trySetThrustReductionHeight(s: string): boolean;
    /**
     * TODO: Should be moved to SpeedDirector class
     * @param s
     * @returns {boolean}
     */
    trySetThrustReductionAltitude(s: string): boolean;
    /**
     * TODO: Should be moved to SpeedDirector class or the function should be only bypass for new function in SpeedDirector
     */
    recalculateTHRRedAccTransAlt(): void;
    /**
     * TODO: Should be moved into SpeedDirector/ThrustDirector??
     * @param origin
     * @private
     */
    _recalculateThrustReductionAltitude(origin: any): void;
    /**
     * TODO: Should be moved into SpeedDirector
     * @param origin
     * @private
     */
    _recalculateAccelerationAltitude(origin: any): void;
    _recalculateOriginTransitionAltitude(origin: any): void;
    _recalculateDestinationTransitionAltitude(destination: any): void;
    setAPManagedSpeedMach(_mach: number, _aircraft: any): void;
    getThrustTakeOffTemp(): number;
    checkFmcPreFlight(): void;
    showFMCPreFlightComplete(airspeed: number): void;
    /**
     * TODO: This should be in FlightPhaseManager
     */
    checkUpdateFlightPhase(): void;
    getWaypointForTODCalculation(): any;
}
