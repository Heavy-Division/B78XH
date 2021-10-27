class B787_10_FMC extends Boeing_FMC {
    /**
     * TODO: Refactor section end
     */
    constructor() {
        super();
        this.onInputAircraftSpecific = (input) => {
            console.log('B787_10_FMC.onInputAircraftSpecific input = \'' + input + '\'');
            if (input === 'LEGS') {
                if (this.onLegs) {
                    this.onLegs();
                }
                return true;
            }
            if (input === 'RTE') {
                if (this.onRte) {
                    this.onRte();
                }
                return true;
            }
            if (input === 'VNAV') {
                if (this.onVNAV) {
                    this.onVNAV();
                }
                return true;
            }
            return false;
        };
        this._registered = false;
        this._leftKeyElements = [];
        this._rightKeyElements = [];
        this.selectedApproachFlap = NaN;
        this.selectedApproachSpeed = NaN;
        this._climbN1Table = [
            [91, 91.6, 92.9, 94.1, 96.1, 97.6, 99.8, 101.2, 101.5, 100.7],
            [92.8, 93.2, 93.8, 93.1, 94.7, 96.2, 98.3, 99.7, 100.0, 99.2],
            [94.2, 95.0, 95.4, 94.8, 95.0, 94.9, 96.7, 98.2, 98.4, 97.7],
            [92.7, 95.5, 97.0, 96.4, 96.6, 96.5, 95.2, 96.6, 96.8, 96.1],
            [91.2, 93.9, 96.6, 97.9, 98.2, 98.0, 96.9, 95.5, 95.2, 94.5],
            [90.4, 93.1, 95.8, 97.3, 99.0, 98.9, 97.8, 96.5, 95.9, 95.2],
            [89.6, 92.3, 95.0, 96.5, 98.7, 99.7, 98.7, 97.6, 97.0, 96.3],
            [88.8, 91.5, 94.1, 95.6, 97.9, 99.6, 99.7, 98.6, 98.0, 97.3],
            [88.0, 90.7, 93.3, 94.8, 97.0, 98.7, 100.8, 99.6, 99.0, 98.3],
            [87.2, 89.8, 92.4, 93.9, 96.1, 97.8, 101.1, 100.8, 100.0, 99.3],
            [86.4, 89.0, 91.5, 93.0, 95.2, 96.8, 100.2, 101.4, 100.9, 100.3],
            [85.5, 88.1, 90.7, 92.1, 94.3, 95.9, 99.2, 101.0, 100.9, 100.8],
            [84.7, 87.3, 89.8, 91.2, 93.4, 95.0, 98.3, 100.0, 99.9, 99.9],
            [83.9, 86.4, 88.9, 90.3, 92.4, 94.0, 97.3, 99.0, 98.9, 98.9],
            [83.0, 85.5, 88.0, 89.4, 91.5, 93.1, 96.3, 98.0, 97.9, 97.9],
            [82.2, 84.7, 87.1, 88.5, 90.6, 92.1, 95.3, 97.0, 96.9, 96.8],
            [81.3, 83.8, 86.2, 87.5, 89.6, 91.2, 94.3, 96.0, 95.9, 95.8]
        ];
        this._climbN1TempRow = [60, 50, 40, 30, 20, 15, 10, 5, 0, -5, -10, -15, -20, -25, -30, -35, -40];
        this._takeOffN1Table = [
            [89.7, 90.1, 90.6, 90.6, 90.6, 90.5, 90.4, 90.4, 90.3, 90.3, 89.7, 89.2, 88.5],
            [92.5, 93, 93.4, 93.4, 93.4, 93.3, 93.3, 93.2, 93.2, 93.2, 92.6, 92, 91.4],
            [93.9, 94.4, 94.8, 94.8, 94.8, 94.7, 94.6, 94.6, 94.6, 94.5, 94, 93.4, 92.8],
            [95.2, 95.7, 96.2, 96.1, 96.1, 96, 96, 95.9, 95.9, 95.9, 95.3, 94.7, 94.2],
            [96.5, 97, 97.5, 97.4, 97.3, 97.3, 97.3, 97.2, 97.2, 97.2, 96.6, 96, 95.5],
            [97.5, 98.2, 98.9, 98.7, 98.5, 98.4, 98.4, 98.5, 98.4, 98.4, 97.9, 97.3, 96.7],
            [97.8, 98.9, 99.8, 99.7, 99.7, 99.5, 99.3, 99.3, 99.2, 99.3, 8.8, 98.4, 98],
            [97.2, 98.8, 100.4, 100.4, 100.4, 100.4, 100.4, 100.1, 100, 99.9, 99.5, 99.2, 98.8],
            [96.4, 98, 99.6, 100.1, 100.7, 101.1, 101.1, 101.1, 101.7, 101.3, 100.3, 99.9, 99.5],
            [95.6, 97.2, 98.8, 99.3, 99.9, 100.5, 101.1, 101.8, 102.2, 102.4, 102.1, 101.5, 100.3],
            [94.8, 96.3, 97.9, 98.4, 99, 99.6, 1012, 101, 101.7, 102.5, 102.5, 102.2, 1011],
            [93.9, 95.5, 97.1, 97.6, 981, 98.8, 99.4, 100.1, 100.8, 101.6, 101.8, 102, 102.3],
            [93.1, 94.7, 96.2, 96.7, 97.3, 97.9, 98.5, 991, 99.9, 100.7, 100.9, 101.2, 101.4],
            [92.3, 93.8, 95.3, 95.8, 96.4, 97, 97.6, 98.3, 99.1, 99.8, 100, 100.3, 100.6],
            [90.6, 92.1, 93.6, 94.1, 94.6, 95.2, 95.9, 96.6, 97.3, 98, 8.3, 98.5, 98.8],
            [88.8, 90.3, 91.8, 92.3, 92.8, 93.4, 94.1, 94.8, 95.5, 96.3, 96.5, 96.7, 97],
            [87.0, 815, 89.9, 90.4, 91, 91.6, 92.3, 93, 93.7, 94.4, 94.7, 94.9, 95.2],
            [85.2, 86.7, 88.1, 88.6, 89.1, 89.8, 90.5, 91.2, 91.9, 92.6, 92.8, 93.1, 93.4],
            [83.4, 84.8, 861, 86.7, 87.3, 87.9, 88.6, 89.3, 90, 90.7, 91, 91.2, 91.5]
        ];
        this._takeOffN1TempRow = [70, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0, -10, -20, -30, -40, -50];
        this._thrustTakeOffMode = 1;
        this._thrustCLBMode = 1;
        this._thrustTakeOffTemp = NaN;
        this._lastUpdateAPTime = NaN;
        this.refreshFlightPlanCooldown = 0;
        this.updateAutopilotCooldown = 0;
        this._hasSwitchedToHoldOnTakeOff = false;
        this._previousApMasterStatus = false;
        this._apMasterStatus = false;
        this._apHasDeactivated = false;
        this._apHasActivated = false;
        this._previousAThrStatus = false;
        this._aThrStatus = false;
        this._aThrHasActivated = false;
        this._hasReachedTopOfDescent = false;
        this._apCooldown = 500;
        this._prepareDefaultValues();
        this._overrideDefaultAsoboValues();
    }
    /**
     * SU6 ORIGIN compatibility patch.
     * TODO: Should be moved to Heavy_Boeing_FMC/Boeing_FMC
     * @param newRouteOrigin
     * @param callback
     */
    updateRouteOrigin(newRouteOrigin, callback = EmptyCallback.Boolean) {
        this.dataManager.GetAirportByIdent(newRouteOrigin).then(airport => {
            if (!airport) {
                this.showErrorMessage('NOT IN DATABASE');
                return callback(false);
            }
            this.flightPlanManager.setOrigin(airport.icao, () => {
                this.tmpOrigin = airport.ident;
                callback(true);
            });
        });
    }
    _updateAlertingMessages() {
        if (this.messageManager.numberOfMessages > 0) {
            let messageBoxTitle = document.body.querySelector('.fms-message-title');
            let messageBoxContent = document.body.querySelector('.fms-message-content');
            let messageBoxCount = document.body.querySelector('.fms-message-count');
            messageBoxTitle.innerHTML = this.messageManager.lastMessage.title;
            messageBoxContent.innerHTML = this.messageManager.lastMessage.text;
            messageBoxCount.innerHTML = this.messageManager.numberOfMessages.toFixed(0).padStart(2, '0');
            let messageBox = document.body.querySelector('.fms-message');
            messageBox.style.display = 'block';
        }
        else {
            let messageBox = document.body.querySelector('.fms-message');
            messageBox.style.display = 'none';
        }
    }
    /**
     * TODO: This should not be here. It should be moved to parent an refactored...
     * @param _event
     */
    onEvent(_event) {
        if (_event.indexOf('AP_ALT_INTERVENTION') != -1) {
            SimVar.SetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number', 1);
            let shouldOverrideCruiseAltitude = false;
            let altitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
            if (altitude >= this.cruiseFlightLevel * 100 && this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
                shouldOverrideCruiseAltitude = true;
                SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 0);
            }
            if (altitude < this.cruiseFlightLevel * 100 && this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
                shouldOverrideCruiseAltitude = true;
                SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 0);
            }
            if (altitude <= this.cruiseFlightLevel * 100 && SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number') && !SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_ACTIVATED', 'Number')) {
                this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_DESCENT;
                SimVar.SetSimVarValue('L:B78XH_DESCENT_NOW_ACTIVATED', 'Number', 1);
                SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
                return;
            }
            if (SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number') && !shouldOverrideCruiseAltitude) {
                SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 0);
                SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
                return;
            }
            if (SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number') && !shouldOverrideCruiseAltitude) {
                SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number', 0);
                SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
                return;
            }
            if (SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number') || SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number')) {
                SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
                return;
            }
            SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
        }
        super.onEvent(_event);
    }
    /**
     * TODO: Refactor section
     */
    getNextDescentAltitude() {
        let fp = this.flightPlanManager.getCurrentFlightPlan();
        let allWaypoints = fp.waypoints.slice(fp.activeWaypointIndex);
        let targetAltitude = undefined;
        let targetIndex = undefined;
        let targetType = undefined;
        for (let i = 0; i <= allWaypoints.length - 1; i++) {
            console.log(allWaypoints[i].ident);
            if (allWaypoints[i].legAltitudeDescription === 0) {
                continue;
            }
            if (allWaypoints[i].legAltitudeDescription === 1 && isFinite(allWaypoints[i].legAltitude1)) {
                targetAltitude = Math.round(allWaypoints[i].legAltitude1);
                targetIndex = i;
                targetType = 'AT';
                break;
            }
            if (allWaypoints[i].legAltitudeDescription === 2 && isFinite(allWaypoints[i].legAltitude1)) {
                targetAltitude = Math.round(allWaypoints[i].legAltitude1);
                targetIndex = i;
                targetType = 'A';
                break;
            }
            if (allWaypoints[i].legAltitudeDescription === 3 && isFinite(allWaypoints[i].legAltitude1)) {
                targetAltitude = Math.round(allWaypoints[i].legAltitude1);
                targetIndex = i;
                targetType = 'B';
                break;
            }
            if (allWaypoints[i].legAltitudeDescription === 4 && isFinite(allWaypoints[i].legAltitude1) && isFinite(allWaypoints[i].legAltitude2)) {
                if (allWaypoints[i].legAltitude1 === allWaypoints[i].legAltitude2) {
                    targetAltitude = Math.round(allWaypoints[i].legAltitude1);
                    targetIndex = i;
                    targetType = 'AT';
                    break;
                }
                if (allWaypoints[i].legAltitude1 < allWaypoints[i].legAltitude2) {
                    let middle = (allWaypoints[i].legAltitude2 - allWaypoints[i].legAltitude1) / 2;
                    targetAltitude = Math.round(allWaypoints[i].legAltitude1 + middle);
                    targetIndex = i;
                    targetType = 'AB';
                    break;
                }
                if (allWaypoints[i].legAltitude1 > allWaypoints[i].legAltitude2) {
                    let middle = (allWaypoints[i].legAltitude1 - allWaypoints[i].legAltitude2) / 2;
                    targetAltitude = Math.round(allWaypoints[i].legAltitude2 + middle);
                    targetIndex = i;
                    targetType = 'AB';
                    break;
                }
            }
        }
        const lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
        const long = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude');
        const ll = new LatLongAlt(lat, long);
        let distance = Avionics.Utils.computeGreatCircleDistance(ll, allWaypoints[0].infos.coordinates);
        if (targetIndex !== 0) {
            for (let i = 1; i < allWaypoints.length; i++) {
                distance += Avionics.Utils.computeGreatCircleDistance(allWaypoints[i - 1].infos.coordinates, allWaypoints[i].infos.coordinates);
                if (i === targetIndex) {
                    break;
                }
            }
        }
        if (targetAltitude) {
            return {
                targetAltitude: targetAltitude,
                distance: distance,
                waypoint: allWaypoints[targetIndex],
                targetType: targetType
            };
        }
        return {
            targetAltitude: NaN,
            distance: NaN,
            waypoint: allWaypoints[targetIndex],
            targetType: targetType
        };
    }
    getFlapProtectionMaxSpeed(handleIndex) {
        switch (handleIndex) {
            case 0:
                return 360;
            case 1:
                return 255;
            case 2:
                return 235;
            case 3:
                return 225;
            case 4:
                return 215;
            case 5:
                return 210;
            case 6:
                return 210;
            case 7:
                return 205;
            case 8:
                return 185;
            case 9:
                return 175;
        }
        return 360;
    }
    getEconClbManagedSpeed() {
        return this.getEconCrzManagedSpeed();
    }
    getEconCrzManagedSpeed() {
        return this.getCrzManagedSpeed(true);
    }
    _overrideDefaultAsoboValues() {
        /**
         * Flaps handling
         */
        this._takeOffFlap = -1;
        let flapAngles = [0, 1, 5, 10, 15, 17, 18, 20, 25, 30];
        let flapIndex = Simplane.getFlapsHandleIndex(true);
        if (flapIndex >= 1) {
            this._takeOffFlap = flapAngles[flapIndex];
        }
    }
    _prepareDefaultValues() {
        /**
         * TODO: All these properties should be removed after Speed director implementation
         * @type {null}
         * @private
         */
        this._lastFMCCommandSpeedRestrictionValue = null;
        this._lastFMCCommandSelectedClimbSpeedValue = null;
        this._fmcCommandClimbSpeedType = null;
        this._lastFmcCommandClimbSpeedType = null;
        this._fmcCommandCruiseSpeedType = null;
        this._lastFmcCommandCruiseSpeedType = null;
        /**
         * Heavy FMC Identification
         */
        this.fmcManVersion = 'HD-XXXX-X-A';
        this.fmcBakVersion = 'HD-XXXX-X-B';
    }
    get templateID() {
        return 'B787_10_FMC';
    }
    get instrumentAlias() {
        return 'AS01B_FMC';
    }
    get isInteractive() {
        return true;
    }
    connectedCallback() {
        super.connectedCallback();
        RegisterViewListener('JS_LISTENER_KEYEVENT', () => {
            console.log('JS_LISTENER_KEYEVENT registered.');
            RegisterViewListener('JS_LISTENER_FACILITY', () => {
                console.log('JS_LISTENER_FACILITY registered.');
                this._registered = true;
            }, true);
        });
    }
    Init() {
        super.Init();
        this.aircraftType = Aircraft.AS01B;
        Utils.loadFile('coui://html_UI/b78xh/b78xh.json', (content) => {
            const miscFile = JSON.parse(content);
            this.fmcManVersion = miscFile.fms_man_version;
            this.fmcBakVersion = miscFile.fms_bak_version;
        });
        if (this.urlConfig.index == 1) {
            /**
             * Reset TOD
             */
            SimVar.SetSimVarValue('L:WT_CJ4_TOD_REMAINING', 'number', 0);
            SimVar.SetSimVarValue('L:WT_CJ4_TOD_DISTANCE', 'number', 0);
            /**
             * Reset stepping
             */
            SimVar.SetSimVarValue('L:B78XH_MCDU_CURRENT_FPLN_WAYPOINT', 'number', -1);
            this.onInit = () => {
                B787_10_FMC_InitRefIndexPage.ShowPage1(this);
            };
            this.onLegs = () => {
                B787_10_FMC_LegsPage.ShowPage1(this);
            };
            this.onRte = () => {
                B787_10_FMC_RoutePage.ShowPage1(this);
            };
            this.onRad = () => {
                B787_10_FMC_NavRadioPage.ShowPage(this);
            };
            this.onVNAV = () => {
                new B787_10_FMC_VNAVPage(this).showPage();
            };
            this._pointer = this.getChildById('fms-pointer');
            this._pointer.style.zIndex = '5';
            this._pointer.style.position = 'fixed';
            this._pointer.style.width = '36px';
            this._pointer.style.height = '36px';
            this._pointer.style.pointerEvents = 'none';
            this._execLight = this.querySelector('.fms-exec-light');
            document.body.addEventListener('mousemove', (e) => {
                let x = e.clientX - 18;
                let y = e.clientY - 18;
                this._pointer.style.left = x + 'px';
                this._pointer.style.top = y + 'px';
            });
            document.body.style.overflow = 'hidden';
            document.body.style.clip = 'auto';
            document.body.style.position = 'absolute';
            this.getChildById('.fms-init-ref').addEventListener('mouseup', () => {
                if (Simplane.getIsGrounded()) {
                    B787_10_FMC_PerfInitPage.ShowPage1(this);
                }
                else {
                    B787_10_FMC_InitRefIndexPage.ShowPage1(this);
                }
            });
            this.getChildById('.fms-rte').addEventListener('mouseup', () => {
                B787_10_FMC_RoutePage.ShowPage1(this);
            });
            this.getChildById('.fms-dep-arr').addEventListener('mouseup', () => {
                B787_10_FMC_DepArrPage.ShowPage1(this);
            });
            this.getChildById('.fms-nav-rad').addEventListener('mouseup', () => {
                B787_10_FMC_NavRadioPage.ShowPage(this);
            });
            this.getChildById('.fms-prog').addEventListener('mouseup', () => {
                B787_10_FMC_ProgressPage.ShowPage1(this);
            });
            this.getChildById('.fms-fmc-comm').addEventListener('mouseup', () => {
                B787_10_FMC_FMCCommPage.ShowPage1(this);
            });
            this.getChildById('.fms-legs').addEventListener('mouseup', () => {
                B787_10_FMC_LegsPage.ShowPage1(this);
            });
            this.getChildById('.fms-vnav').addEventListener('mouseup', () => {
                new B787_10_FMC_VNAVPage(this).showPage();
            });
            this.getChildById('.fms-exec').addEventListener('mouseup', () => {
                if (this.onExec) {
                    this.onExec();
                }
            });
            this.getChildById('.fms-prev-page').addEventListener('mouseup', () => {
                if (this.onPrevPage) {
                    this.onPrevPage();
                }
            });
            this.getChildById('.fms-next-page').addEventListener('mouseup', () => {
                if (this.onNextPage) {
                    this.onNextPage();
                }
            });
            this.getChildById('.fms-hold').addEventListener('mouseup', () => {
                B787_10_FMC_HoldsPage.handleHoldPressed(this);
            });
            this.getChildById('.fms-clr-msg').addEventListener('mouseup', () => {
                if (this.messageManager.numberOfMessages > 0) {
                    this.messageManager.removeLastMessage();
                }
            });
            if (!B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
                this.getChildById('.fms-heavy').addEventListener('mouseup', () => {
                    B787_10_FMC_HeavyPage.ShowPage1(this);
                });
            }
            /**
             * Check NAV DATA
             */
            let y = SimVar.GetGlobalVarValue('ZULU YEAR', 'number');
            let m = SimVar.GetGlobalVarValue('ZULU MONTH OF YEAR', 'number');
            let d = SimVar.GetGlobalVarValue('ZULU DAY OF MONTH', 'number');
            let date = new Date();
            date.setUTCFullYear(y, m - 1, d);
            date.setUTCHours(23, 59, 59);
            let navDataDateRange = this.getNavDataDateRange();
            let navDataDateArray = navDataDateRange.substring(navDataDateRange.length - 8).split('/');
            let m1 = B787_10_FMC._MonthOfYear.findIndex(function (element) {
                return element === navDataDateArray[0].substring(0, 3);
            });
            let d1 = navDataDateArray[0].substring(navDataDateArray[0].length - 2);
            let y1 = '20' + navDataDateArray[1];
            let date1 = new Date();
            date1.setUTCFullYear(parseInt(y1), m1 + 1, parseInt(d1));
            date1.setUTCHours(23, 59, 59);
            if (date1.getTime() < date.getTime()) {
                this.messageManager.showMessage('NAV DATA OUT OF DATE', 'END DATE OF THE ACTIVE <br> DATA BASE HAS PASSED <br> SELECT NEW CYCLE <br> ON IDENT PAGE');
            }
        }
        /**
         * TODO: TO IMPLEMENT
         */
        //if (B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
        this.getChildById('.fms-heavy').classList.add('fms-empty');
        //}
        this._inOutElement = this.getChildById('.fms-io-buffer');
        this._titleElement = this.getChildById('.fms-screen-title');
        this._pageCurrentElement = this.getChildById('.fms-screen-page');
        this._pageCountElement = this.getChildById('.fms-screen-page');
        this._labelElements.slice(0, this._labelElements.length);
        let allLabelContainers = this.getChildrenById('.fms-screen-label-container');
        for (let i = 0; i < allLabelContainers.length; i++) {
            this._labelElements[i] = [];
            let labelContainer = allLabelContainers[i];
            if (labelContainer) {
                this._labelElements[i][0] = labelContainer.querySelector('.col-0');
                this._labelElements[i][1] = labelContainer.querySelector('.col-3');
                this._labelElements[i][2] = labelContainer.querySelector('.col-1');
                this._labelElements[i][3] = labelContainer.querySelector('.col-2');
            }
        }
        this._lineElements.slice(0, this._lineElements.length);
        let allLineContainers = this.getChildrenById('.fms-screen-line-container');
        for (let i = 0; i < allLineContainers.length; i++) {
            this._lineElements[i] = [];
            let lineContainer = allLineContainers[i];
            if (lineContainer) {
                this._lineElements[i][0] = lineContainer.querySelector('.col-0');
                this._lineElements[i][1] = lineContainer.querySelector('.col-3');
                this._lineElements[i][2] = lineContainer.querySelector('.col-1');
                this._lineElements[i][3] = lineContainer.querySelector('.col-2');
            }
        }
        let leftKeysContainer = this.getChildById('.fms-side-container.left').children;
        for (let i = 0; i < leftKeysContainer.length; i++) {
            let leftKeyElement = leftKeysContainer[i];
            if (leftKeyElement instanceof HTMLInputElement) {
                this._leftKeyElements[i] = leftKeyElement;
            }
        }
        let rightKeysContainer = this.getChildById('.fms-side-container.right').children;
        for (let i = 0; i < rightKeysContainer.length; i++) {
            let rightKeyElement = rightKeysContainer[i];
            if (rightKeyElement instanceof HTMLInputElement) {
                this._rightKeyElements[i] = rightKeyElement;
            }
        }
        this._pilotWaypoints = new CJ4_FMC_PilotWaypoint_Manager(this);
        this._pilotWaypoints.activate();
        B787_10_FMC_IdentPage.ShowPage1(this);
    }
    onPowerOn() {
        super.onPowerOn();
        this.deactivateLNAV();
        this.deactivateVNAV();
        Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.HOLD);
    }
    onUpdate(_deltaTime) {
        super.onUpdate(_deltaTime);
        if (this.urlConfig.index != 1) {
            return;
        }
        this.updateAutopilot();
        this._updateTimeAndDate();
        this._updateAlertingMessages();
    }
    _updateTimeAndDate() {
        if (!this._timeDivs) {
            this._timeDivs = document.body.querySelectorAll('.fms-time');
        }
        if (!this._dateDivs) {
            this._dateDivs = document.body.querySelectorAll('.fms-date');
        }
        if (this._timeDivs && this._dateDivs) {
            let t = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
            let hours = Math.floor(t / 3600);
            let minutes = Math.floor((t - hours * 3600) / 60);
            let seconds = t - hours * 3600 - minutes * 60;
            let timeText = fastToFixed(hours, 0).padStart(2, '0') + ':' + fastToFixed(minutes, 0).padStart(2, '0') + ':' + fastToFixed(seconds, 0).padStart(2, '0');
            let y = SimVar.GetGlobalVarValue('ZULU YEAR', 'number');
            let m = SimVar.GetGlobalVarValue('ZULU MONTH OF YEAR', 'number');
            let d = SimVar.GetGlobalVarValue('ZULU DAY OF MONTH', 'number');
            let dateText = fastToFixed(d, 0) + ' ' + B787_10_FMC._MonthOfYear[m - 1] + ' ' + fastToFixed(y, 0);
            this._timeDivs.forEach(d => {
                d.innerText = timeText;
            });
            this._dateDivs.forEach(d => {
                d.innerText = dateText;
            });
        }
    }
    _getIndexFromTemp(temp) {
        if (temp < -10) {
            return 0;
        }
        if (temp < 0) {
            return 1;
        }
        if (temp < 10) {
            return 2;
        }
        if (temp < 20) {
            return 3;
        }
        if (temp < 30) {
            return 4;
        }
        if (temp < 40) {
            return 5;
        }
        if (temp < 43) {
            return 6;
        }
        if (temp < 45) {
            return 7;
        }
        if (temp < 47) {
            return 8;
        }
        if (temp < 49) {
            return 9;
        }
        if (temp < 51) {
            return 10;
        }
        if (temp < 53) {
            return 11;
        }
        if (temp < 55) {
            return 12;
        }
        if (temp < 57) {
            return 13;
        }
        if (temp < 59) {
            return 14;
        }
        if (temp < 61) {
            return 15;
        }
        if (temp < 63) {
            return 16;
        }
        if (temp < 65) {
            return 17;
        }
        if (temp < 66) {
            return 18;
        }
        return 19;
    }
    _computeV1Speed() {
        console.log('Computing V1...');
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            if (runway) {
                console.log('Runway length = ' + runway.length);
                let f = (runway.length - 2250) / (3250 - 2250);
                runwayCoef = Utils.Clamp(f, 0, 1);
            }
            else {
                console.log('No Runway');
            }
        }
        let w = this.getWeight(true);
        console.log('Weight = ' + w);
        let dWeightCoeff = (w - 350) / (560 - 350);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 0.90 + (1.16 - 0.9) * dWeightCoeff;
        let flapsHandleIndex;
        const takeoffFlaps = this.getTakeOffFlap();
        switch (takeoffFlaps) {
            case 5:
                flapsHandleIndex = 2;
                break;
            case 10:
                flapsHandleIndex = 3;
                break;
            case 15:
                flapsHandleIndex = 4;
                break;
            case 17:
                flapsHandleIndex = 5;
                break;
            case 18:
                flapsHandleIndex = 6;
                break;
            case 20:
                flapsHandleIndex = 7;
                break;
            default:
                flapsHandleIndex = Simplane.getFlapsHandleIndex();
                break;
        }
        let temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
        let index = this._getIndexFromTemp(temp);
        console.log('Temperature = ' + temp + ' (index ' + index + ')');
        let min = B787_10_FMC._v1s[index][0];
        let max = B787_10_FMC._v1s[index][1];
        this.v1Speed = min * (1 - runwayCoef) + max * runwayCoef;
        this.v1Speed *= dWeightCoeff;
        this.v1Speed -= flapsHandleIndex * 5;
        this.v1Speed = Math.round(this.v1Speed);
        this.customV1Speed = false;
        SimVar.SetSimVarValue('L:AIRLINER_V1_SPEED', 'Knots', this.v1Speed);
        console.log('V1 = ' + this.v1Speed);
    }
    _getComputedVRSpeed() {
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            if (runway) {
                console.log('Runway length = ' + runway.length);
                let f = (runway.length - 2250) / (3250 - 2250);
                runwayCoef = Utils.Clamp(f, 0, 1);
            }
            else {
                console.log('No Runway');
            }
        }
        let w = this.getWeight(true);
        let dWeightCoeff = (w - 350) / (560 - 350);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 0.99 + (1.215 - 0.99) * dWeightCoeff;
        let flapsHandleIndex;
        const takeoffFlaps = this.getTakeOffFlap();
        switch (takeoffFlaps) {
            case 5:
                flapsHandleIndex = 2;
                break;
            case 10:
                flapsHandleIndex = 3;
                break;
            case 15:
                flapsHandleIndex = 4;
                break;
            case 17:
                flapsHandleIndex = 5;
                break;
            case 18:
                flapsHandleIndex = 6;
                break;
            case 20:
                flapsHandleIndex = 7;
                break;
            default:
                flapsHandleIndex = Simplane.getFlapsHandleIndex();
                break;
        }
        let temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
        let index = this._getIndexFromTemp(temp);
        let min = B787_10_FMC._vRs[index][0];
        let max = B787_10_FMC._vRs[index][1];
        let vRSpeed = min * (1 - runwayCoef) + max * runwayCoef;
        vRSpeed *= dWeightCoeff;
        vRSpeed -= flapsHandleIndex * 5;
        vRSpeed = Math.round(vRSpeed);
        return vRSpeed;
    }
    _computeVRSpeed() {
        this.vRSpeed = this._getComputedVRSpeed();
        this.customVRSpeed = false;
        SimVar.SetSimVarValue('L:AIRLINER_VR_SPEED', 'Knots', this.vRSpeed);
        console.log('VR = ' + this.vRSpeed);
    }
    _computeV2Speed() {
        console.log('Computing V2...');
        let runwayCoef = 1.0;
        {
            let runway = this.flightPlanManager.getDepartureRunway();
            if (!runway) {
                runway = this.flightPlanManager.getDetectedCurrentRunway();
            }
            if (runway) {
                console.log('Runway length = ' + runway.length);
                let f = (runway.length - 2250) / (3250 - 2250);
                runwayCoef = Utils.Clamp(f, 0.0, 1.0);
            }
            else {
                console.log('No Runway');
            }
        }
        let weight = this.getWeight(true);
        console.log('Weight = ' + weight);
        let dWeightCoeff = (weight - 350) / (560 - 350);
        dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
        dWeightCoeff = 1.03 + (1.23 - 1.03) * dWeightCoeff;
        let flapsHandleIndex;
        const takeoffFlaps = this.getTakeOffFlap();
        switch (takeoffFlaps) {
            case 5:
                flapsHandleIndex = 2;
                break;
            case 10:
                flapsHandleIndex = 3;
                break;
            case 15:
                flapsHandleIndex = 4;
                break;
            case 17:
                flapsHandleIndex = 5;
                break;
            case 18:
                flapsHandleIndex = 6;
                break;
            case 20:
                flapsHandleIndex = 7;
                break;
            default:
                flapsHandleIndex = Simplane.getFlapsHandleIndex();
                break;
        }
        let temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
        let index = this._getIndexFromTemp(temp);
        console.log('Temperature = ' + temp + ' (index ' + index + ')');
        let min = B787_10_FMC._v2s[index][0];
        let max = B787_10_FMC._v2s[index][1];
        this.v2Speed = min * (1 - runwayCoef) + max * runwayCoef;
        this.v2Speed *= dWeightCoeff;
        this.v2Speed -= flapsHandleIndex * 5;
        this.v2Speed = Math.round(this.v2Speed);
        this.customV2Speed = false;
        SimVar.SetSimVarValue('L:AIRLINER_V2_SPEED', 'Knots', this.v2Speed);
        console.log('VR = ' + this.v2Speed);
    }
    getFlapTakeOffSpeed() {
        let dWeight = (this.getWeight(true) - 500) / (900 - 500);
        return 134 + 40 * dWeight;
    }
    getSlatTakeOffSpeed() {
        let dWeight = (this.getWeight(true) - 500) / (900 - 500);
        return 183 + 40 * dWeight;
    }
    getClbManagedSpeed() {
        let dCI = this.getCostIndexFactor();
        let speed = 310 * (1 - dCI) + 330 * dCI;
        if (this.overSpeedLimitThreshold) {
            if (Simplane.getAltitude() < 9800) {
                if (!this._climbSpeedTransitionDeleted) {
                    speed = Math.min(speed, 250);
                }
                this.overSpeedLimitThreshold = false;
            }
        }
        else if (!this.overSpeedLimitThreshold) {
            if (Simplane.getAltitude() < 10000) {
                if (!this._climbSpeedTransitionDeleted) {
                    speed = Math.min(speed, 250);
                }
            }
            else {
                if (!this._isFmcCurrentPageUpdatedAboveTenThousandFeet) {
                    SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
                    this._isFmcCurrentPageUpdatedAboveTenThousandFeet = true;
                }
                this.overSpeedLimitThreshold = true;
            }
        }
        return speed;
    }
    getCrzManagedSpeed(highAltitude = false) {
        let dCI = this.getCostIndexFactor();
        dCI = dCI * dCI;
        let speed = 310 * (1 - dCI) + 330 * dCI;
        if (!highAltitude) {
            if (this.overSpeedLimitThreshold) {
                if (Simplane.getAltitude() < 9800) {
                    speed = Math.min(speed, 250);
                    this.overSpeedLimitThreshold = false;
                }
            }
            else if (!this.overSpeedLimitThreshold) {
                if (Simplane.getAltitude() < 10000) {
                    speed = Math.min(speed, 250);
                }
                else {
                    this.overSpeedLimitThreshold = true;
                }
            }
        }
        return speed;
    }
    getDesManagedSpeed() {
        let dCI = this.getCostIndexFactor();
        let speed = 280 * (1 - dCI) + 300 * dCI;
        if (this.overSpeedLimitThreshold) {
            if (Simplane.getAltitude() < 10700) {
                speed = Math.min(speed, 240);
                this.overSpeedLimitThreshold = false;
            }
        }
        else if (!this.overSpeedLimitThreshold) {
            if (Simplane.getAltitude() < 10700) {
                speed = Math.min(speed, 240);
            }
            else {
                this.overSpeedLimitThreshold = true;
            }
        }
        return speed;
    }
    getVRef(flapsHandleIndex = NaN) {
        if (isNaN(flapsHandleIndex)) {
            flapsHandleIndex = Simplane.getFlapsHandleIndex();
        }
        let min = 198;
        let max = 250;
        if (flapsHandleIndex >= 9) {
            min = 119;
            max = 171;
        }
        else if (flapsHandleIndex >= 8) {
            min = 119;
            max = 174;
        }
        else if (flapsHandleIndex >= 7) {
            min = 138;
            max = 182;
        }
        else if (flapsHandleIndex >= 4) {
            min = 138;
            max = 182;
        }
        else if (flapsHandleIndex >= 2) {
            min = 158;
            max = 210;
        }
        else if (flapsHandleIndex >= 1) {
            min = 173;
            max = 231;
        }
        return Math.round(((max - min) / (557 - 298.7) * (this.getWeight(true) - 298.7)) + min);
    }
    getManagedApproachSpeed(flapsHandleIndex = NaN) {
        return this.getVRef(flapsHandleIndex) - 5;
    }
    getCleanApproachSpeed() {
        let dWeight = (this.getWeight(true) - 200) / (528 - 200);
        return 121 + 56 * dWeight;
    }
    getSlatApproachSpeed(useCurrentWeight = true) {
        if (isFinite(this._overridenSlatApproachSpeed)) {
            return this._overridenSlatApproachSpeed;
        }
        let dWeight = ((useCurrentWeight ? this.getWeight(true) : this.zeroFuelWeight) - 200) / (528 - 200);
        return 119 + 58 * dWeight;
    }
    getFlapApproachSpeed(useCurrentWeight = true) {
        if (isFinite(this._overridenFlapApproachSpeed)) {
            return this._overridenFlapApproachSpeed;
        }
        let dWeight = ((useCurrentWeight ? this.getWeight(true) : this.zeroFuelWeight) - 200) / (528 - 200);
        return 119 + 53 * dWeight;
    }
    getVLS() {
        let flapsHandleIndex = Simplane.getFlapsHandleIndex();
        if (flapsHandleIndex === 4) {
            let dWeight = (this.getWeight(true) - 200) / (528 - 200);
            return 110 + 52 * dWeight;
        }
        else {
            let dWeight = (this.getWeight(true) - 200) / (528 - 200);
            return 115 + 53 * dWeight;
        }
    }
    setSelectedApproachFlapSpeed(s) {
        let flap = NaN;
        let speed = NaN;
        if (s) {
            let sSplit = s.split('/');
            flap = parseInt(sSplit[0]);
            speed = parseInt(sSplit[1]);
        }
        if (isFinite(flap) || isFinite(speed)) {
            if (isFinite(flap) && flap >= 0 && flap < 60) {
                this.selectedApproachFlap = flap;
            }
            if (isFinite(speed) && speed >= 10 && speed < 300) {
                this.selectedApproachSpeed = speed;
            }
            return true;
        }
        this.showErrorMessage(this.defaultInputErrorMessage);
        return false;
    }
    clearDisplay() {
        super.clearDisplay();
        this.onPrevPage = EmptyCallback.Void;
        this.onNextPage = EmptyCallback.Void;
        this.unregisterPeriodicPageRefresh();
    }
    getClimbThrustN1(temperature, altitude) {
        let lineIndex = 0;
        for (let i = 0; i < this._climbN1TempRow.length; i++) {
            lineIndex = i;
            if (temperature > this._climbN1TempRow[i]) {
                break;
            }
        }
        let rowIndex = Math.floor(altitude / 5000);
        rowIndex = Math.max(0, rowIndex);
        rowIndex = Math.min(rowIndex, this._climbN1Table[0].length - 1);
        return this._climbN1Table[lineIndex][rowIndex];
    }
    getTakeOffThrustN1(temperature, airportAltitude) {
        let lineIndex = 0;
        for (let i = 0; i < this._takeOffN1TempRow.length; i++) {
            lineIndex = i;
            if (temperature > this._takeOffN1TempRow[i]) {
                break;
            }
        }
        let rowIndex = Math.floor(airportAltitude / 1000) + 2;
        rowIndex = Math.max(0, rowIndex);
        rowIndex = Math.min(rowIndex, this._takeOffN1Table[0].length - 1);
        return this._takeOffN1Table[lineIndex][rowIndex];
    }
    getThrustTakeOffMode() {
        return this._thrustTakeOffMode;
    }
    setThrustTakeOffMode(m) {
        if (m >= 0 && m <= 2) {
            SimVar.SetSimVarValue('L:B78XH_THRUST_TAKEOFF_MODE', 'Number', m);
            SimVar.SetSimVarValue('H:AS01B_MFD_1_TAKEOFF_MODES_UPDATED', 'Number', 1);
            SimVar.SetSimVarValue('H:AS01B_MFD_2_TAKEOFF_MODES_UPDATED', 'Number', 1);
            this._thrustTakeOffMode = m;
        }
    }
    getThrustCLBMode() {
        return this._thrustCLBMode;
    }
    setThrustCLBMode(m) {
        if (m >= 0 && m <= 2) {
            SimVar.SetSimVarValue('L:B78XH_THRUST_CLIMB_MODE', 'Number', m);
            SimVar.SetSimVarValue('H:AS01B_MFD_1_TAKEOFF_MODES_UPDATED', 'Number', 1);
            SimVar.SetSimVarValue('H:AS01B_MFD_2_TAKEOFF_MODES_UPDATED', 'Number', 1);
            this._thrustCLBMode = m;
        }
    }
    getThrustTakeOffTemp() {
        return this._thrustTakeOffTemp;
    }
    setThrustTakeOffTemp(s) {
        let v = parseFloat(s);
        if (isFinite(v)) {
            let oat = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
            if (v >= oat && v < 80) {
                SimVar.SetSimVarValue('L:B78XH_THRUST_ASSUMED_TEMPERATURE', 'Number', v);
                SimVar.SetSimVarValue('H:AS01B_MFD_1_TAKEOFF_MODES_UPDATED', 'Number', 1);
                SimVar.SetSimVarValue('H:AS01B_MFD_2_TAKEOFF_MODES_UPDATED', 'Number', 1);
                this._thrustTakeOffTemp = v;
                return true;
            }
            this.showErrorMessage('OUT OF RANGE');
            return false;
        }
        this.showErrorMessage(this.defaultInputErrorMessage);
        return false;
    }
    getThrustTakeOffLimit() {
        let airport = this.flightPlanManager.getOrigin();
        if (airport) {
            let altitude = airport.infos.coordinates.alt;
            const assumedTemp = this.getThrustTakeOffTemp();
            let temp;
            if (assumedTemp) {
                temp = assumedTemp;
            }
            else {
                temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
            }
            return this.getTakeOffThrustN1(temp, altitude) - this.getThrustTakeOffMode() * 10;
        }
        return 100;
    }
    getThrustClimbLimit() {
        let altitude = Simplane.getAltitude();
        let temperature = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
        return this.getClimbThrustN1(temperature, altitude) - this.getThrustCLBMode() * 8.6;
    }
    /**
     * TODO commented out. This is need only for testing
     */
    rateTester() {
        /*
         if (this._lastTimeX === undefined) {
         this._startHeading = Simplane.getHeadingTrue();
         this._lastTimeX = Date.now();
         }

         this._timeX = Date.now();

         //console.log('TIME: ' + this._timeX);
         //console.log('LAST TIME: ' + this._lastTimeX);

         if (this._timeX > this._lastTimeX + 1000) {
         let heading = Simplane.getHeadingTrue();
         let rate = 0;
         if (heading > this._startHeading) {
         rate = heading - this._startHeading;
         } else {
         rate = this._startHeading - heading;
         }
         console.log('RATE PER SEC: ' + rate);

         this._timeX = undefined;
         this._lastTimeX = undefined;
         }
         */
    }
    updateAutopilot() {
        let now = performance.now();
        let dt = now - this._lastUpdateAPTime;
        this._lastUpdateAPTime = now;
        if (isFinite(dt)) {
            this.updateAutopilotCooldown -= dt;
        }
        if (SimVar.GetSimVarValue('L:AIRLINER_FMC_FORCE_NEXT_UPDATE', 'number') === 1) {
            SimVar.SetSimVarValue('L:AIRLINER_FMC_FORCE_NEXT_UPDATE', 'number', 0);
            this.updateAutopilotCooldown = -1;
        }
        if (this.updateAutopilotCooldown < 0) {
            let currentApMasterStatus = SimVar.GetSimVarValue('AUTOPILOT MASTER', 'boolean');
            if (currentApMasterStatus != this._apMasterStatus) {
                this._apMasterStatus = currentApMasterStatus;
                this._forceNextAltitudeUpdate = true;
            }
            this._apHasDeactivated = !currentApMasterStatus && this._previousApMasterStatus;
            this._apHasActivated = currentApMasterStatus && !this._previousApMasterStatus;
            this._previousApMasterStatus = currentApMasterStatus;
            let currentAThrMasterStatus = Simplane.getAutoPilotThrottleActive(1);
            if (currentAThrMasterStatus != this._aThrStatus) {
                this._aThrStatus = currentAThrMasterStatus;
            }
            this._aThrHasActivated = currentAThrMasterStatus && !this._previousAThrStatus;
            this._previousAThrStatus = currentAThrMasterStatus;
            /**
             * WT Stuff begin
             */
            if (!this._navModeSelector) {
                this._navModeSelector = new B78XHNavModeSelector(this.flightPlanManager);
            }
            //RUN LNAV ALWAYS
            if (this._lnav === undefined) {
                this._lnav = new LNavDirector(this.flightPlanManager, this._navModeSelector);
            }
            else {
                try {
                    this._lnav.update();
                }
                catch (error) {
                    console.error(error);
                }
            }
            if (this._speedDirector === undefined) {
                this._speedDirector = new SpeedDirector(this);
            }
            else {
                try {
                    /*
                     const activeWaypoint = this.flightPlanManager.getActiveWaypoint();
                     if(activeWaypoint && activeWaypoint.speedConstraint === -1){
                     this._speedDirector._waypointSpeedConstraint.speed = null;
                     this._speedDirector._waypointSpeedConstraint.speedMach = null;
                     } else if(activeWaypoint && activeWaypoint.speedConstraint !== -1){
                     this._speedDirector._waypointSpeedConstraint.speed = activeWaypoint.speedConstraint;
                     }
                     */
                    this._speedDirector.update(this.currentFlightPhase);
                }
                catch (error) {
                    console.error(error);
                }
            }
            this._navModeSelector.generateInputDataEvents();
            this._navModeSelector.processEvents();
            //TAKEOFF MODE HEADING SET (constant update to current heading when on takeoff roll)
            if (this._navModeSelector.currentLateralActiveState === LateralNavModeState.TO && Simplane.getIsGrounded()) {
                Coherent.call('HEADING_BUG_SET', 2, SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', 'Degrees'));
            }
            //CHECK FOR ALT set >45000
            if (SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR:1', 'feet') > 45000) {
                Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, 45000, true);
            }
            /**
             * WT Stuff end
             */
            SimVar.SetSimVarValue('SIMVAR_AUTOPILOT_AIRSPEED_MIN_CALCULATED', 'knots', Simplane.getStallProtectionMinSpeed());
            SimVar.SetSimVarValue('SIMVAR_AUTOPILOT_AIRSPEED_MAX_CALCULATED', 'knots', Simplane.getMaxSpeed(Aircraft.AS01B));
            if (this.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
                let n1 = this.getThrustTakeOffLimit() / 100;
                SimVar.SetSimVarValue('AUTOPILOT THROTTLE MAX THRUST', 'number', n1);
            }
            if (this.currentFlightPhase >= FlightPhase.FLIGHT_PHASE_CLIMB) {
                let n1 = this.getThrustClimbLimit() / 100;
                SimVar.SetSimVarValue('AUTOPILOT THROTTLE MAX THRUST', 'number', n1);
            }
            if (this._apHasActivated) {
                if (!this.getIsVNAVArmed() && !this.getIsVNAVActive()) {
                    this.activateSPD();
                    this.activateVSpeed();
                }
                else {
                    this.activateVNAV();
                }
                if (this._navModeSelector.currentLateralArmedState !== LateralNavModeState.LNAV && this._navModeSelector.currentLateralActiveState !== LateralNavModeState.LNAV) {
                    /**
                     * Enable HDG HOLD
                     */
                    const headingHoldValue = Simplane.getHeadingMagnetic();
                    SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', 'number', 2);
                    Coherent.call('HEADING_BUG_SET', 2, headingHoldValue);
                    SimVar.SetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', 'number', 1);
                }
            }
            if (this._aThrHasActivated) {
                if (this.getIsSPDActive()) {
                    this.activateSPD();
                }
            }
            /**
             * TODO: Check if we really need this
             */
            if (!this.getIsAltitudeHoldActive()) {
                Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
            }
            let vRef = 0;
            if (this.currentFlightPhase >= FlightPhase.FLIGHT_PHASE_DESCENT) {
                vRef = 1.3 * Simplane.getStallSpeed();
            }
            SimVar.SetSimVarValue('L:AIRLINER_VREF_SPEED', 'knots', vRef);
            if (this._pendingVNAVActivation) {
                let altitude = Simplane.getAltitudeAboveGround();
                if (altitude > 400) {
                    this._pendingVNAVActivation = false;
                    this.doActivateVNAV();
                }
            }
            if (SimVar.GetSimVarValue('L:AP_VNAV_ACTIVE', 'number') === 1) {
                let targetAltitude = Simplane.getAutoPilotAltitudeLockValue();
                let altitude = Simplane.getAltitude();
                let deltaAltitude = Math.abs(targetAltitude - altitude);
                if (deltaAltitude > 1000) {
                    if (!Simplane.getAutoPilotFLCActive()) {
                        SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', 'Number', 1);
                    }
                }
            }
            if (this.getIsFLCHActive()) {
                let targetAltitude = Simplane.getAutoPilotAltitudeLockValue();
                let altitude = Simplane.getAltitude();
                let deltaAltitude = Math.abs(targetAltitude - altitude);
                if (deltaAltitude < 150) {
                    this.activateAltitudeHold(true);
                }
            }
            if (this.getIsVSpeedActive()) {
                let targetAltitude = Simplane.getAutoPilotAltitudeLockValue();
                let altitude = Simplane.getAltitude();
                let deltaAltitude = Math.abs(targetAltitude - altitude);
                if (deltaAltitude < 150) {
                    this.activateAltitudeHold(true);
                }
            }
            if (this._pendingSPDActivation) {
                let altitude = Simplane.getAltitudeAboveGround();
                if (altitude > 400) {
                    this._pendingSPDActivation = false;
                    this.doActivateSPD();
                }
            }
            if (Simplane.getAutoPilotGlideslopeActive()) {
                if (this.getIsVNAVActive()) {
                    this.deactivateVNAV();
                }
                if (this.getIsVSpeedActive()) {
                    this.deactivateVSpeed();
                }
                if (this.getIsAltitudeHoldActive()) {
                    this.deactivateAltitudeHold();
                }
                this.activateSPD();
                if (SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Boolean')) {
                    SimVar.SetSimVarValue('K:AP_PANEL_ALTITUDE_HOLD', 'Number', 1);
                }
            }
            if (!this.getIsVNAVActive()) {
                SimVar.SetSimVarValue('L:B78XH_CUSTOM_VNAV_DESCENT_ENABLED', 'Number', 0);
            }
            if (this.getIsVNAVActive()) {
                let nextWaypoint = this.flightPlanManager.getActiveWaypoint();
                if (nextWaypoint && (nextWaypoint.legAltitudeDescription === 3 || nextWaypoint.legAltitudeDescription === 4)) {
                    let selectedAltitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
                    if (!this.flightPlanManager.getIsDirectTo() &&
                        isFinite(nextWaypoint.legAltitude1) &&
                        nextWaypoint.legAltitude1 < 20000 &&
                        nextWaypoint.legAltitude1 > selectedAltitude &&
                        Simplane.getAltitude() > nextWaypoint.legAltitude1 - 200) {
                        Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, nextWaypoint.legAltitude1, this._forceNextAltitudeUpdate);
                        this._forceNextAltitudeUpdate = false;
                        SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 1);
                    }
                    else {
                        let altitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
                        if (isFinite(altitude)) {
                            Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, this.cruiseFlightLevel * 100, this._forceNextAltitudeUpdate);
                            this._forceNextAltitudeUpdate = false;
                            SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
                        }
                    }
                }
                else {
                    let altitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
                    if (isFinite(altitude)) {
                        /**
                         * TODO: Temporary level off during climb
                         */
                        let isLevelOffActive = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number');
                        if ((altitude < this.cruiseFlightLevel * 100 || isLevelOffActive) && this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
                            if (Simplane.getAutoPilotAltitudeLockActive()) {
                                SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 1);
                            }
                            if (!isLevelOffActive) {
                                Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, altitude, this._forceNextAltitudeUpdate);
                                this._forceNextAltitudeUpdate = false;
                                SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
                            }
                        }
                        else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT || this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
                            /**
                             * Descent new implementation
                             */
                            let nextAltitudeObject = this.getNextDescentAltitude();
                            let nextAltitude = nextAltitudeObject.targetAltitude;
                            let selectedAltitude = altitude;
                            this._selectedAltitude = altitude;
                            let shouldEnableLevelOff = null;
                            let needUpdateAltitude = false;
                            let targetAltitude = NaN;
                            if (nextAltitude >= selectedAltitude) {
                                shouldEnableLevelOff = false;
                                targetAltitude = nextAltitude;
                            }
                            else if (nextAltitude < selectedAltitude) {
                                shouldEnableLevelOff = true;
                                targetAltitude = selectedAltitude;
                            }
                            this._descentTargetAltitude = targetAltitude;
                            if (this._lastDescentTargetAltitude !== this._descentTargetAltitude) {
                                this._lastDescentTargetAltitude = this._descentTargetAltitude;
                                needUpdateAltitude = true;
                            }
                            if (this._lastSelectedAltitude !== this._selectedAltitude) {
                                this._lastSelectedAltitude = this._selectedAltitude;
                                needUpdateAltitude = true;
                            }
                            let altitudeInterventionPushed = SimVar.GetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number');
                            if (altitudeInterventionPushed) {
                                needUpdateAltitude = true;
                                SimVar.SetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number', 0);
                            }
                            if (Simplane.getAutoPilotAltitudeLockActive()) {
                                if (shouldEnableLevelOff) {
                                    SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number', 1);
                                }
                            }
                            let isLevelOffActive = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number');
                            if (!isLevelOffActive || altitudeInterventionPushed) {
                                if (isFinite(targetAltitude) && needUpdateAltitude) {
                                    Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, targetAltitude, this._forceNextAltitudeUpdate);
                                    this._forceNextAltitudeUpdate = false;
                                    SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
                                }
                            }
                        }
                        else {
                            Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, this.cruiseFlightLevel * 100, this._forceNextAltitudeUpdate);
                            this._forceNextAltitudeUpdate = false;
                            SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
                        }
                    }
                }
            }
            else if (!this.getIsFLCHActive() && this.getIsSPDActive()) {
                this.setAPSpeedHoldMode();
            }
            if (this.getIsVNAVArmed() && !this.getIsVNAVActive()) {
                if (Simplane.getAutoPilotThrottleArmed()) {
                    if (!this._hasSwitchedToHoldOnTakeOff) {
                        let speed = Simplane.getIndicatedSpeed();
                        if (speed > 80) {
                            Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.HOLD);
                            this._hasSwitchedToHoldOnTakeOff = true;
                        }
                    }
                }
            }
            if (this._isHeadingHoldActive) {
                Coherent.call('HEADING_BUG_SET', 2, this._headingHoldValue);
            }
            if (this.currentFlightPhase > FlightPhase.FLIGHT_PHASE_CLIMB) {
                let altitude = Simplane.getAltitudeAboveGround();
                if (altitude < 20) {
                    this.deactivateSPD();
                }
            }
            if (this.currentFlightPhase > FlightPhase.FLIGHT_PHASE_CLIMB) {
                let altitude = Simplane.getAltitudeAboveGround();
                if (altitude < 20) {
                    this.deactivateSPD();
                }
            }
            if (this.getIsVNAVActive() && this.currentFlightPhase >= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
                if (this._speedDirector.machModeActive) {
                    this.setAPManagedSpeedMach(this._speedDirector.speed, Aircraft.AS01B);
                }
                else {
                    this.setAPManagedSpeed(this._speedDirector.speed, Aircraft.AS01B);
                }
            }
            if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_TAKEOFF) {
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
            }
            else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
                if (Simplane.getAutoPilotThrottleActive()) {
                    let altitude = Simplane.getAltitudeAboveGround();
                    if (altitude < 50) {
                        if (Simplane.getEngineThrottleMode(0) != ThrottleMode.IDLE) {
                            Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.IDLE);
                        }
                    }
                }
                //this.tryExecuteBAL();
            }
            this._execLight.style.backgroundColor = this.getIsRouteActivated() ? '#00ff00' : 'black';
            this.updateAutopilotCooldown = this._apCooldown;
        }
    }
    calculateFpmToNextWaypoint(altitude, targetAltitude, distance, waypoint, targetType) {
        let groundSpeed = Simplane.getGroundSpeed();
        if (targetAltitude === 'B') {
            targetAltitude = targetAltitude - 300;
        }
        else if (targetType === 'A') {
            targetAltitude = targetAltitude + 300;
        }
        if (waypoint.isRunway) {
            targetAltitude += 100;
        }
        let altitudeDelta = Math.abs(altitude - targetAltitude);
        let knotsToMilesCoef = 0.0191796575;
        let milesPerMinute = groundSpeed * knotsToMilesCoef;
        let minutesToWaypoint = distance / milesPerMinute;
        let rate = altitudeDelta / minutesToWaypoint;
        return rate;
    }
    executeCustomVNAVDescent(rate, targetAltitude) {
        SimVar.SetSimVarValue('L:B78XH_CUSTOM_VNAV_DESCENT_ENABLED', 'Number', 1);
        /**
         * Disable FLCH mode
         */
        SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', 'Number', 0);
        /**
         * Enable AIRSPEED mode
         */
        SimVar.SetSimVarValue('K:AP_AIRSPEED_ON', 'Number', 1);
        /**
         * Round (ceil) vertical speed
         */
        const shouldCeil = !(rate < 30);
        if (shouldCeil) {
            rate = -1 * Math.ceil(Math.abs(rate) / 50) * 50;
        }
        /**
         * Do not descent during descent
         */
        if (rate > -5) {
            rate = 0;
        }
        /**
         * Set vertical speed and add 150 feet per minute (better be on altitude sooner)
         */
        SimVar.SetSimVarValue('K:AP_VS_VAR_SET_ENGLISH', 'Feet per minute', rate);
        /**
         * Set next target altitude
         */
        Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, targetAltitude, this._forceNextAltitudeUpdate);
        SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 1);
        /**
         * Enable AP vertical speed hold
         * NOTE: K:AP_VS_ON can be used instead of K:AP_VS_HOLD
         */
        SimVar.SetSimVarValue('K:AP_VS_HOLD', 'Number', 1);
    }
    controlDescent() {
        /**
         * Descent new implementation
         */
        let altitude = Simplane.getAltitude();
        let targetAltitudeAndDistance = this.getNextDescentAltitude();
        this.executeCustomVNAVDescent(this.calculateFpmToNextWaypoint(altitude, targetAltitudeAndDistance.targetAltitude, targetAltitudeAndDistance.distance, targetAltitudeAndDistance.waypoint, targetAltitudeAndDistance.targetType), targetAltitudeAndDistance.targetAltitude);
        /*
         let selectedAltitude = altitude;
         this._selectedAltitude = altitude;
         let shouldEnableLevelOff = null;
         let needUpdateAltitude = false;
         let targetAltitude = NaN;

         if (nextAltitude >= selectedAltitude) {
         shouldEnableLevelOff = false;
         targetAltitude = nextAltitude;
         } else if (nextAltitude < selectedAltitude) {
         shouldEnableLevelOff = true;
         targetAltitude = selectedAltitude;
         }

         this._descentTargetAltitude = targetAltitude;

         if (this._lastDescentTargetAltitude !== this._descentTargetAltitude) {
         this._lastDescentTargetAltitude = this._descentTargetAltitude;
         needUpdateAltitude = true;
         }

         if (this._lastSelectedAltitude !== this._selectedAltitude) {
         this._lastSelectedAltitude = this._selectedAltitude;
         needUpdateAltitude = true;
         }

         let altitudeInterventionPushed = SimVar.GetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number');

         if (altitudeInterventionPushed) {
         needUpdateAltitude = true;
         SimVar.SetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number', 0);
         }


         if (Simplane.getAutoPilotAltitudeLockActive()) {
         if (shouldEnableLevelOff) {
         SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number', 1);
         }
         }

         let isLevelOffActive = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number');

         if (!isLevelOffActive || altitudeInterventionPushed) {
         if (isFinite(targetAltitude) && needUpdateAltitude) {
         Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, targetAltitude, this._forceNextAltitudeUpdate);
         this._forceNextAltitudeUpdate = false;
         SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
         }
         }
         */
    }
    controlDescentOld() {
        /*

         let nextAltitude = this.getNextDescentAltitude();
         let selectedAltitude = altitude;
         this._selectedAltitude = altitude;
         let shouldEnableLevelOff = null;
         let needUpdateAltitude = false;
         let targetAltitude = NaN;

         if (nextAltitude >= selectedAltitude) {
         shouldEnableLevelOff = false;
         targetAltitude = nextAltitude;
         } else if (nextAltitude < selectedAltitude) {
         shouldEnableLevelOff = true;
         targetAltitude = selectedAltitude;
         }

         this._descentTargetAltitude = targetAltitude;

         if (this._lastDescentTargetAltitude !== this._descentTargetAltitude) {
         this._lastDescentTargetAltitude = this._descentTargetAltitude;
         needUpdateAltitude = true;
         }

         if (this._lastSelectedAltitude !== this._selectedAltitude) {
         this._lastSelectedAltitude = this._selectedAltitude;
         needUpdateAltitude = true;
         }

         let altitudeInterventionPushed = SimVar.GetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number');

         if (altitudeInterventionPushed) {
         needUpdateAltitude = true;
         SimVar.SetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number', 0);
         }


         if (Simplane.getAutoPilotAltitudeLockActive()) {
         if (shouldEnableLevelOff) {
         SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number', 1);
         }
         }

         let isLevelOffActive = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.DESCENT_LEVEL_OFF_ACTIVE, 'Number');

         if (!isLevelOffActive || altitudeInterventionPushed) {
         if (isFinite(targetAltitude) && needUpdateAltitude) {
         Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, targetAltitude, this._forceNextAltitudeUpdate);
         this._forceNextAltitudeUpdate = false;
         SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
         }
         }
         */
    }
    tryExecuteBAL() {
        /*
         if (Simplane.getAutoPilotThrottleActive()) {
         let altitude = Simplane.getAltitudeAboveGround();
         if (altitude < 50) {
         if (!this._pitch) {
         this._pitch = SimVar.GetSimVarValue('PLANE PITCH DEGREES', 'Radians')
         }
         if(!this._pitchInterval50 && !this._stopPitchInterval50){
         this._pitchInterval50 = setInterval(() => {
         let fpm = Simplane.getVerticalSpeed();
         if(fpm > -400){
         this._pitch += 0.0002;
         } else if (fpm < -800) {
         this._pitch -= 0.0001;
         }
         SimVar.SetSimVarValue('PLANE PITCH DEGREES', 'Radians', this._pitch);
         }, 5)
         }
         if (Simplane.getEngineThrottleMode(0) != ThrottleMode.IDLE) {
         console.log('Setting thrust to idle');
         Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.IDLE);
         SimVar.SetSimVarValue("A:GENERAL ENG THROTTLE LEVER POSITION:1", "Percent", 0);
         SimVar.SetSimVarValue("A:GENERAL ENG THROTTLE LEVER POSITION:2", "Percent", 0);
         }
         }

         if (altitude < 20) {
         this._stopPitchInterval50 = true;
         if(this._pitchInterval50){
         clearInterval(this._pitchInterval50);
         }
         if(!this._pitchInterval11 && !this._stopPitchInterval11){
         this._pitchInterval11 = setInterval(() => {
         let fpm = Simplane.getVerticalSpeed();
         if(fpm > -80){
         this._pitch += 0.0002;
         } else if (fpm < -150) {
         this._pitch -= 0.0005;
         }
         //this._pitch -= 0.00065;
         //this._pitch -= 0.00075;
         SimVar.SetSimVarValue('PLANE PITCH DEGREES', 'Radians', this._pitch);
         }, 2)
         }
         this._stopHoldPitch = true;
         }

         if(altitude < 5){
         this._stopPitchInterval11 = true;
         if(this._pitchInterval11){
         clearInterval(this._pitchInterval11);
         }
         if(!this._pitchInterval5 && !this._stopPitchInterval5){
         this._pitchInterval5 = setInterval(() => {
         this._pitch += 0.00003;
         if(this._pitch < 0){
         SimVar.SetSimVarValue('PLANE PITCH DEGREES', 'Radians', this._pitch);
         }
         }, 5)
         }
         }

         if(Simplane.getAutoPilotActive() != 1){
         this._stopPitchInterval5 = true;
         if(this._pitchInterval5){
         clearInterval(this._pitchInterval5);
         }
         }
         }
         */
    }
    updateSideButtonActiveStatus() {
        for (let i = 0; i < this._leftKeyElements.length; i++) {
            if (this.onLeftInput[i]) {
                this._leftKeyElements[i].classList.add('active');
            }
            else {
                this._leftKeyElements[i].classList.remove('active');
            }
        }
        for (let i = 0; i < this._rightKeyElements.length; i++) {
            if (this.onRightInput[i]) {
                this._rightKeyElements[i].classList.add('active');
            }
            else {
                this._rightKeyElements[i].classList.remove('active');
            }
        }
    }
    generateLineSelectionElement(parent, isRightSide) {
        let btnH = 0.8;
        let btnW = 0.13;
        let zoneH = 0.5;
        let zoneW = 0.77;
        let h = 60;
        let w = 300;
        let btnHPx = Math.floor(btnH * h);
        let btnWPx = Math.floor(btnW * w);
        let zoneHPx = Math.floor(zoneH * h);
        let zoneWPx = Math.floor(zoneW * w);
        let dH = Math.floor((btnHPx - zoneHPx) * 0.5);
        let x0 = Math.floor((w - btnWPx - zoneWPx) * 0.5);
        let y0 = Math.floor((h - btnHPx) * 0.5);
        let container = document.createElementNS(Avionics.SVG.NS, 'svg');
        parent.appendChild(container);
        diffAndSetAttribute(container, 'width', fastToFixed(w, 0));
        diffAndSetAttribute(container, 'height', fastToFixed(h, 0));
        diffAndSetAttribute(container, 'viewbox', '0 0 ' + w + ' ' + h);
        let path = document.createElementNS(Avionics.SVG.NS, 'path');
        container.appendChild(path);
        let d = 'M ' + x0 + ' ' + y0 + ' ';
        d += 'l ' + btnWPx + ' 0 ';
        d += 'l 0 ' + dH + ' ';
        d += 'l ' + (zoneWPx + 8) + ' 0 ';
        d += 'l 0 ' + zoneHPx + ' ';
        d += 'l -' + (zoneWPx + 8) + ' 0 ';
        d += 'l 0 ' + dH + ' ';
        d += 'l -' + btnWPx + ' 0 Z';
        diffAndSetAttribute(path, 'd', d);
        diffAndSetAttribute(path, 'fill', 'none');
        diffAndSetAttribute(path, 'stroke-width', '3');
        diffAndSetAttribute(path, 'stroke', 'magenta');
        if (isRightSide) {
            diffAndSetAttribute(path, 'transform', 'translate(' + w + ', 0) scale(-1, 1)');
        }
        if (container instanceof SVGSVGElement) {
            container.style.position = 'fixed';
            container.style.zIndex = '1';
            return container;
        }
    }
    generateHTMLLayout(parent) {
        let x = parseInt(this.style.left);
        let y = parseInt(this.style.top);
        for (let i = 0; i < 6; i++) {
            let lineSelection = this.generateLineSelectionElement(parent, false);
            lineSelection.style.top = (y + Math.floor(91 + i * 54)) + 'px';
            lineSelection.style.left = (x + 4) + 'px';
            lineSelection.style.opacity = '0';
            let ii = i;
            lineSelection.addEventListener('mouseenter', () => {
                if (this.onLeftInput[ii]) {
                    lineSelection.style.opacity = '1';
                }
            });
            lineSelection.addEventListener('mouseleave', () => {
                lineSelection.style.opacity = '0';
            });
            lineSelection.addEventListener('mouseup', () => {
                if (this.onLeftInput[ii]) {
                    this.onLeftInput[ii]();
                }
            });
        }
        for (let i = 0; i < 6; i++) {
            let lineSelection = this.generateLineSelectionElement(parent, true);
            lineSelection.style.top = (y + Math.floor(91 + i * 54)) + 'px';
            lineSelection.style.left = (x + 340) + 'px';
            lineSelection.style.opacity = '0';
            let ii = i;
            lineSelection.addEventListener('mouseenter', () => {
                if (this.onRightInput[ii]) {
                    lineSelection.style.opacity = '1';
                }
            });
            lineSelection.addEventListener('mouseleave', () => {
                lineSelection.style.opacity = '0';
            });
            lineSelection.addEventListener('mouseup', () => {
                if (this.onRightInput[ii]) {
                    this.onRightInput[ii]();
                }
            });
        }
        let fmsPrevPageElement = this.getChildById('.fms-prev-page');
        fmsPrevPageElement.addEventListener('mouseenter', () => {
            fmsPrevPageElement.style.border = '2px solid magenta';
        });
        fmsPrevPageElement.addEventListener('mouseleave', () => {
            fmsPrevPageElement.style.border = '';
        });
        let fmsNextPageElement = this.getChildById('.fms-next-page');
        fmsNextPageElement.addEventListener('mouseenter', () => {
            fmsNextPageElement.style.border = '2px solid magenta';
        });
        fmsNextPageElement.addEventListener('mouseleave', () => {
            fmsNextPageElement.style.border = '';
        });
        return;
    }
    setPageCurrent(value) {
        if (typeof (value) === 'number') {
            this._pageCurrent = value;
        }
        else if (typeof (value) === 'string') {
            this._pageCurrent = parseInt(value);
        }
        let content = '';
        if (isFinite(this._pageCurrent) && isFinite(this._pageCount)) {
            if (this._pageCurrent > 0) {
                if (this._pageCount > 0) {
                    content = this._pageCurrent + '/' + this._pageCount;
                }
            }
        }
        diffAndSetText(this._pageCurrentElement, content);
    }
    setPageCount(value) {
        if (typeof (value) === 'number') {
            this._pageCount = value;
        }
        else if (typeof (value) === 'string') {
            this._pageCount = parseInt(value);
        }
        let content = '';
        if (isFinite(this._pageCurrent) && isFinite(this._pageCount)) {
            if (this._pageCurrent > 0) {
                if (this._pageCount > 0) {
                    content = this._pageCurrent + '/' + this._pageCount;
                }
            }
        }
        diffAndSetText(this._pageCurrentElement, content);
    }
    getOrSelectWaypointByIdent(ident, callback) {
        this.dataManager.GetWaypointsByIdent(ident).then((waypoints) => {
            if (!waypoints || waypoints.length === 0) {
                return callback(undefined);
            }
            if (waypoints.length === 1) {
                return callback(waypoints[0]);
            }
            B787_10_FMC_SelectWptPage.ShowPage(this, waypoints, callback);
        });
    }
}
B787_10_FMC._MonthOfYear = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
B787_10_FMC._v1s = [
    [130, 156],
    [128, 154],
    [127, 151],
    [125, 149],
    [123, 147],
    [122, 145],
    [121, 143],
    [120, 143],
    [120, 143],
    [120, 142],
    [119, 142],
    [119, 142],
    [119, 142],
    [119, 141],
    [118, 141],
    [118, 141],
    [118, 140],
    [118, 140],
    [117, 140],
    [117, 140]
];
B787_10_FMC._vRs = [
    [130, 158],
    [128, 156],
    [127, 154],
    [125, 152],
    [123, 150],
    [122, 148],
    [121, 147],
    [120, 146],
    [120, 146],
    [120, 145],
    [119, 145],
    [119, 144],
    [119, 144],
    [119, 143],
    [118, 143],
    [118, 142],
    [118, 142],
    [118, 141],
    [117, 141],
    [117, 140]
];
B787_10_FMC._v2s = [
    [135, 163],
    [133, 160],
    [132, 158],
    [130, 157],
    [129, 155],
    [127, 153],
    [127, 151],
    [126, 150],
    [125, 150],
    [125, 149],
    [124, 149],
    [124, 148],
    [124, 148],
    [123, 147],
    [123, 146],
    [123, 146],
    [123, 145],
    [122, 145],
    [122, 144],
    [121, 144]
];
registerInstrument('b787-10-fmc', B787_10_FMC);
//# sourceMappingURL=B787_10_FMC.js.map
