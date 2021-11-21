import { B787_10_FMC } from "./B787_10_FMC";
export declare class CJ4_FMC_PilotWaypoint_Manager {
    private _fmc;
    private _pilotWaypointArray;
    private _pilotWaypointCount;
    private _pilotWaypointArray1;
    private _pilotWaypointArray2;
    private _pilotWaypointArray3;
    private _pilotWaypointArray4;
    private _pilotWaypointArray5;
    constructor(fmc: B787_10_FMC);
    activate(): void;
    checkPilotDuplicates(ident: any): boolean;
    checkDatabaseDuplicates(ident: any): Promise<unknown>;
    addPilotWaypoint(ident: any, latitude: any, longitude: any): Promise<boolean>;
    addPilotWaypointWithOverwrite(ident: any, latitude: any, longitude: any): void;
    deletePilotWaypoint(ident: any): boolean;
    writePilotWaypointsToDatastore(): void;
}
