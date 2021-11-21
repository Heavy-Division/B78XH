import { Boeing_FMC } from './Boeing_FMC';
export declare class B787_10_FMC extends Boeing_FMC {
    protected _timeDivs: NodeListOf<HTMLElement>;
    protected _dateDivs: NodeListOf<HTMLElement>;
    protected onVNAV: () => void;
    protected onLegs: () => void;
    protected onRte: () => void;
    protected _pointer: HTMLElement;
    protected _execLight: HTMLElement;
    fmcManVersion: string;
    fmcBakVersion: string;
    _lnav: LNavDirector;
    protected _registered: boolean;
    protected _leftKeyElements: any[];
    protected _rightKeyElements: any[];
    selectedApproachFlap: number;
    selectedApproachSpeed: number;
    protected _takeOffN1Table: number[][];
    protected _climbN1TempRow: number[];
    protected _climbN1Table: number[][];
    protected _takeOffN1TempRow: number[];
    protected _thrustCLBMode: number;
    protected _lastUpdateAPTime: number;
    protected refreshFlightPlanCooldown: number;
    protected updateAutopilotCooldown: number;
    protected _hasSwitchedToHoldOnTakeOff: boolean;
    protected _previousApMasterStatus: boolean;
    protected _apMasterStatus: boolean;
    protected _apHasActivated: boolean;
    protected _aThrStatus: boolean;
    protected _aThrHasActivated: boolean;
    protected _hasReachedTopOfDescent: boolean;
    protected _previousAThrStatus: boolean;
    protected _apHasDeactivated: boolean;
    protected _thrustTakeOffMode: number;
    protected _apCooldown: number;
    protected _lastFMCCommandSpeedRestrictionValue: any;
    protected _lastFmcCommandClimbSpeedType: any;
    protected _lastFMCCommandSelectedClimbSpeedValue: any;
    protected _fmcCommandCruiseSpeedType: any;
    protected _fmcCommandClimbSpeedType: any;
    protected _lastFmcCommandCruiseSpeedType: any;
    onInputAircraftSpecific: (input: any) => boolean;
    static _MonthOfYear: string[];
    static _v1s: number[][];
    static _vRs: number[][];
    static _v2s: number[][];
    _pilotWaypoints: any;
    _climbSpeedTransitionDeleted: any;
    _isFmcCurrentPageUpdatedAboveTenThousandFeet: any;
    _selectedAltitude: any;
    _descentTargetAltitude: number;
    _lastDescentTargetAltitude: number;
    _lastSelectedAltitude: any;
    vfrRunwayExtension: number;
    modVfrRunway: boolean;
    deletedVfrLandingRunway: any;
    selectMode: string;
    selectedWaypoint: any;
    private _renderer;
    /**
     * SU6 ORIGIN compatibility patch.
     * TODO: Should be moved to Heavy_Boeing_FMC/Boeing_FMC
     * @param newRouteOrigin
     * @param callback
     */
    updateRouteOrigin(newRouteOrigin: any, callback?: (arg0: boolean) => void): void;
    _updateAlertingMessages(): void;
    /**
     * TODO: This should not be here. It should be moved to parent an refactored...
     * @param _event
     */
    onEvent(_event: any): void;
    /**
     * TODO: Refactor section
     */
    getNextDescentAltitude(): {
        targetAltitude: number;
        distance: number;
        waypoint: any;
        targetType: any;
    };
    getFlapProtectionMaxSpeed(handleIndex: any): 360 | 255 | 235 | 225 | 215 | 210 | 205 | 185 | 175;
    getEconClbManagedSpeed(): number;
    getEconCrzManagedSpeed(): number;
    /**
     * TODO: Refactor section end
     */
    constructor();
    _overrideDefaultAsoboValues(): void;
    _prepareDefaultValues(): void;
    get templateID(): string;
    get instrumentAlias(): string;
    get isInteractive(): boolean;
    connectedCallback(): void;
    Init(): void;
    onPowerOn(): void;
    onUpdate(_deltaTime: any): void;
    _updateTimeAndDate(): void;
    _getIndexFromTemp(temp: any): 1 | 0 | 2 | 6 | 3 | 13 | 7 | 10 | 5 | 4 | 15 | 17 | 18 | 8 | 9 | 12 | 11 | 14 | 16 | 19;
    _computeV1Speed(): void;
    _getComputedVRSpeed(): number;
    _computeVRSpeed(): void;
    _computeV2Speed(): void;
    getFlapTakeOffSpeed(): number;
    getSlatTakeOffSpeed(): number;
    getClbManagedSpeed(): number;
    getCrzManagedSpeed(highAltitude?: boolean): number;
    getDesManagedSpeed(): number;
    getVRef(flapsHandleIndex?: number): number;
    getManagedApproachSpeed(flapsHandleIndex?: number): number;
    getCleanApproachSpeed(): number;
    getSlatApproachSpeed(useCurrentWeight?: boolean): number;
    getFlapApproachSpeed(useCurrentWeight?: boolean): number;
    getVLS(): number;
    setSelectedApproachFlapSpeed(s: any): boolean;
    clearDisplay(): void;
    getClimbThrustN1(temperature: any, altitude: any): number;
    getTakeOffThrustN1(temperature: any, airportAltitude: any): number;
    getThrustTakeOffMode(): number;
    setThrustTakeOffMode(m: any): void;
    getThrustCLBMode(): number;
    setThrustCLBMode(m: any): void;
    getThrustTakeOffTemp(): number;
    setThrustTakeOffTemp(s: any): boolean;
    getThrustTakeOffLimit(): number;
    getThrustClimbLimit(): number;
    /**
     * TODO commented out. This is need only for testing
     */
    rateTester(): void;
    updateAutopilot(): void;
    calculateFpmToNextWaypoint(altitude: any, targetAltitude: any, distance: any, waypoint: any, targetType: any): number;
    executeCustomVNAVDescent(rate: any, targetAltitude: any): void;
    controlDescent(): void;
    controlDescentOld(): void;
    tryExecuteBAL(): void;
    updateSideButtonActiveStatus(): void;
    generateLineSelectionElement(parent: any, isRightSide: any): HTMLElement & SVGSVGElement;
    generateHTMLLayout(parent: any): void;
    setPageCurrent(value: any): void;
    setPageCount(value: any): void;
    getOrSelectWaypointByIdent(ident: any, callback: any): void;
}
