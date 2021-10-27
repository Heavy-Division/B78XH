class B787_10_FMC_RouteDataPage {
    constructor(fmc) {
        this.fmc = fmc;
    }
    static computeEtaToWaypoint(distance, groundSpeed) {
        if (groundSpeed < 50) {
            groundSpeed = 50;
        }
        if (groundSpeed > 0.1) {
            return distance / groundSpeed * 3600;
        }
    }
    showPage(currentPage = 1) {
        this.fmc.clearDisplay();
        B787_10_FMC_RouteDataPage._updateCounter = 0;
        this.fmc.pageUpdate = () => {
            if (B787_10_FMC_RouteDataPage._updateCounter >= 50) {
                this.showPage(currentPage);
            }
            else {
                B787_10_FMC_RouteDataPage._updateCounter++;
            }
        };
        let rows = [
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            ['']
        ];
        let pageCount = 1;
        let offset = Math.floor((currentPage - 1) * 5);
        let activeWaypoint = 0;
        let speed = SimVar.GetSimVarValue('GPS GROUND SPEED', 'knots');
        let flightPlanManagerWaypoints = this.fmc.flightPlanManager.getWaypoints();
        if (flightPlanManagerWaypoints) {
            let useImperial = HeavyDivision.configuration.useImperial();
            let fuelModifier;
            if (useImperial) {
                fuelModifier = 1.0;
            }
            else {
                fuelModifier = 0.45359237;
            }
            let currentTime = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
            let currentFuel = SimVar.GetSimVarValue('FUEL TOTAL QUANTITY', 'gallons') * SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'pounds') / 1000;
            let currentFuelFlow = SimVar.GetSimVarValue('TURB ENG FUEL FLOW PPH:1', 'pound per hour') + SimVar.GetSimVarValue('TURB ENG FUEL FLOW PPH:2', 'pound per hour') + SimVar.GetSimVarValue('TURB ENG FUEL FLOW PPH:3', 'pound per hour') + SimVar.GetSimVarValue('TURB ENG FUEL FLOW PPH:4', 'pound per hour');
            currentFuelFlow = currentFuelFlow / 1000;
            let waypoints = [...flightPlanManagerWaypoints];
            if (waypoints.length > 2) {
                activeWaypoint = this.fmc.flightPlanManager.getActiveWaypointIndex();
                waypoints.pop();
                let firstApproachWaypointIndex = waypoints.length;
                let approachWaypoints = this.fmc.flightPlanManager.getApproachWaypoints();
                if (this.fmc.flightPlanManager.isActiveApproach()) {
                    activeWaypoint += waypoints.length;
                    firstApproachWaypointIndex = 0;
                }
                for (let i = 0; i < approachWaypoints.length; i++) {
                    waypoints.push(approachWaypoints[i]);
                }
                activeWaypoint = waypoints.findIndex((w) => {
                    return w.ident === this.fmc.flightPlanManager.getActiveWaypointIdent();
                });
                waypoints.splice(0, activeWaypoint);
                for (let i = 0; i < 5; i++) {
                    let etaCell = '';
                    let fuelCell = '';
                    let waypoint = waypoints[i + offset];
                    if (waypoint) {
                        let distance = 0;
                        const isActWpt = (i == 0 && currentPage == 1);
                        if (isActWpt) {
                            distance = this.fmc.flightPlanManager.getDistanceToActiveWaypoint();
                        }
                        else {
                            distance = this.fmc.flightPlanManager.getDistanceToActiveWaypoint();
                            for (let j = 0; j < i + offset; j++) {
                                distance = distance + Avionics.Utils.computeGreatCircleDistance(waypoints[j].infos.coordinates, waypoints[j + 1].infos.coordinates);
                            }
                        }
                        let eta = undefined;
                        eta = (B787_10_FMC_RouteDataPage.computeEtaToWaypoint(distance, speed) + currentTime) % 86400;
                        if (isFinite(eta)) {
                            let etaHours = Math.floor(eta / 3600);
                            let etaMinutes = Math.floor((eta - etaHours * 3600) / 60);
                            etaCell = etaHours.toFixed(0).padStart(2, '0') + etaMinutes.toFixed(0).padStart(2, '0') + '[size=small]Z[/size]';
                        }
                        let fuelLeft = this.fmc.computeFuelLeft(distance, speed, currentFuel, currentFuelFlow);
                        if (isFinite(fuelLeft)) {
                            fuelCell = (fuelLeft * fuelModifier).toFixed(1);
                        }
                        rows[2 * i] = [etaCell, '>', waypoint.ident, fuelCell];
                    }
                }
            }
            pageCount = Math.floor((waypoints.length - 1) / 5) + 1;
        }
        this.fmc.setTemplate([
            ['ACT RTE 1 DATA', currentPage.toFixed(0), pageCount.toFixed(0)],
            ['ETA', 'WIND', 'WAYPOINT', 'FUEL'],
            ...rows,
            ['-------------------------------WIND DATA'],
            ['<LEGS', 'REQUEST>']
        ]);
        this.fmc.onLeftInput[5] = () => {
            B787_10_FMC_LegsPage.ShowPage1(this.fmc);
        };
        this.fmc.onPrevPage = () => {
            if (currentPage > 1) {
                this.showPage(currentPage - 1);
            }
        };
        this.fmc.onNextPage = () => {
            if (currentPage < pageCount) {
                this.showPage(currentPage + 1);
            }
        };
        this.fmc.updateSideButtonActiveStatus();
    }
}
B787_10_FMC_RouteDataPage._updateCounter = 0;
