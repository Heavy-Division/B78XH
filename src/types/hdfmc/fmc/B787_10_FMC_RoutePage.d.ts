import { B787_10_FMC } from "./B787_10_FMC";
export declare class B787_10_FMC_RoutePage {
    private _fmc;
    private _isDirty;
    private _currentPage;
    private _pageCount;
    private _offset;
    private _fplnVersion;
    private _activeWptIndex;
    private _lsk6Field;
    private _activateCell;
    private _modStr;
    private _originCell;
    private _destinationCell;
    private _distanceCell;
    private _flightNoCell;
    private _coRouteCell;
    private _airwayInput;
    private _airwayIndex;
    private _rows;
    private _depRwyCell;
    constructor(fmc: B787_10_FMC);
    set currentPage(value: any);
    gotoNextPage(): void;
    gotoPrevPage(): void;
    update(forceUpdate?: boolean): void;
    invalidate(): void;
    prerender(): void;
    render(): void;
    renderMainPage(): void;
    renderRoutePage(): void;
    bindEvents(): void;
    /**
     * Bind the LSK events to a plan row.
     * @param {Number} lskIdx
     */
    bindRowEvents(lskIdx: any): void;
    setDestination(icao: any): void;
    setOrigin(icao: any): void;
    static ShowPage1(fmc: any): void;
    static insertWaypointsAlongAirway(fmc: any, lastWaypointIdent: any, index: any, airwayName: any, callback?: (arg0: boolean) => void): Promise<void>;
    static _GetAllRows(fmc: any): any[];
}
