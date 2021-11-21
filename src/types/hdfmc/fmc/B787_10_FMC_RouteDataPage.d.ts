import { B787_10_FMC } from "./B787_10_FMC";
export declare class B787_10_FMC_RouteDataPage {
    static _updateCounter: number;
    private readonly fmc;
    constructor(fmc: B787_10_FMC);
    static computeEtaToWaypoint(distance: any, groundSpeed: any): number;
    showPage(currentPage?: number): void;
}
