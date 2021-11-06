import { B787_10_FMC } from "./B787_10_FMC";
export declare class B787_10_FMC_RouteRequestPage {
    private readonly fmc;
    private eventProtector;
    private readonly progress;
    private flightPlan;
    private waypoints;
    constructor(fmc: B787_10_FMC);
    showPage(): void;
    parseAirways(navlog: any): any[];
    setupInputHandlers(): void;
    updateProgress(iterator: any): void;
    insertWaypointsAlongAirway(lastWaypointIdent: any, index: any, airwayName: any, callback?: (arg0: boolean) => void): Promise<void>;
    insertWaypointsAlongAirway2(lastWaypointIdent: any, index: any, airwayName: any, callback?: (arg0: boolean) => void): Promise<void>;
    insertWaypoint(newWaypointTo: any, index: any, iterator: any, callback?: (arg0: boolean) => void): void;
    getOrSelectWaypointByIdent(ident: any, iterator: any, callback: any): void;
}
