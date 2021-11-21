import { B787_10_FMC } from "./B787_10_FMC";
export declare class B787_10_FMC_LegsPage {
    static SELECT_MODE: {
        NONE: string;
        EXISTING: string;
        NEW: string;
        DELETE: string;
    };
    static DEBUG_SHOW_WAYPOINT_PHASE: boolean;
    private _fmc;
    private _rows;
    private _isDirty;
    private _isAddingHold;
    private _currentPage;
    private _pageCount;
    private _distanceToActiveWpt;
    private _activeWptIndex;
    private _wayPointsToRender;
    private _lsk6Field;
    private _isMapModePlan;
    private _step;
    private _rsk6Field;
    private _approachWaypoints;
    constructor(fmc: B787_10_FMC, isAddingHold: boolean);
    prepare(): void;
    update(forceUpdate?: boolean): void;
    updateLegs(): void;
    render(): void;
    buildLegs(waypoints: any, activeWaypointIndex: any): any[];
    bindInputs(): void;
    resetAfterOp(): void;
    bindEvents(): void;
    /**
     * Build steps array
     * @returns {*[]}
     */
    buildSteps(): {
        index: number;
        page: number;
        position: number;
        icao: string;
    }[];
    addHold(): void;
    invalidate(): void;
    getAltSpeedRestriction(waypoint: any, isActive?: boolean): string;
    parseConstraintInput(value: any, waypoint: any): void;
    static ShowPage1(fmc: any, isAddingHold?: boolean): void;
}
