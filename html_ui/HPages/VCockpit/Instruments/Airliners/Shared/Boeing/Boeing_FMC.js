class Boeing_FMC extends Heavy_FMCMainDisplay {
    constructor() {
        super(...arguments);
        this._forceNextAltitudeUpdate = false;
        this._lastTargetAirspeed = 200;
        this._isLNAVActive = false;
        this._pendingLNAVActivation = false;
        this._isVNAVActive = false;
        this._pendingVNAVActivation = false;
        this._isFLCHActive = false;
        this._pendingFLCHActivation = false;
        this._isSPDActive = false;
        this._pendingSPDActivation = false;
        this._isSpeedInterventionActive = false;
        this._isHeadingHoldActive = false;
        this._headingHoldValue = 0;
        this._pendingHeadingSelActivation = false;
        this._isVSpeedActive = false;
        this._isAltitudeHoldActive = false;
        this._altitudeHoldValue = 0;
        this._onAltitudeHoldDeactivate = EmptyCallback.Void;
        this._isRouteActivated = false;
    }
    Init() {
        super.Init();
        this.maxCruiseFL = 450;
        this.onExec = () => {
            if (this.getIsRouteActivated()) {
                this.insertTemporaryFlightPlan();
                this._isRouteActivated = false;
                SimVar.SetSimVarValue("L:FMC_EXEC_ACTIVE", "number", 0);
                if (this.refreshPageCallback) {
                    this.refreshPageCallback();
                }
            }
        };
        this.onDel = () => {
            if (this.inOut.length === 0) {
                this.inOut = FMCMainDisplay.clrValue;
            }
        };
        this.onClr = () => {
            if (this.isDisplayingErrorMessage) {
                this.inOut = this.lastUserInput;
                this.isDisplayingErrorMessage = false;
            }
            else if (this.inOut.length > 0) {
                if (this.inOut === FMCMainDisplay.clrValue) {
                    this.inOut = "";
                }
                else {
                    this.inOut = this.inOut.substr(0, this.inOut.length - 1);
                }
            }
        };
        let flapAngles = [0, 1, 5, 10, 15, 17, 18, 20, 25, 30];
        let flapIndex = Simplane.getFlapsHandleIndex(true);
        if (flapIndex >= 1) {
            this._takeOffFlap = flapAngles[flapIndex];
        }
    }

    /**
     *  Events
	 	NavModeEvent.ALT_LOCK_CHANGED = 'alt_lock_changed';
		NavModeEvent.ALT_CAPTURED = 'alt_captured';
		NavModeEvent.NAV_PRESSED = 'NAV_PRESSED';
		NavModeEvent.NAV_MODE_CHANGED = 'nav_mode_changed_to_nav';
		NavModeEvent.NAV_MODE_CHANGED_TO_FMS = 'nav_mode_changed_to_fms';
		NavModeEvent.HDG_PRESSED = 'HDG_PRESSED';
		NavModeEvent.APPR_PRESSED = 'APPR_PRESSED';
		NavModeEvent.FLC_PRESSED = 'FLC_PRESSED';
		NavModeEvent.VS_PRESSED = 'VS_PRESSED';
		NavModeEvent.BC_PRESSED = 'BC_PRESSED';
		NavModeEvent.VNAV_PRESSED = 'VNAV_PRESSED';
		NavModeEvent.ALT_SLOT_CHANGED = 'alt_slot_changed';
		NavModeEvent.SELECTED_ALT1_CHANGED = 'selected_alt1_changed';
		NavModeEvent.SELECTED_ALT2_CHANGED = 'selected_alt2_changed';
		NavModeEvent.APPROACH_CHANGED = 'approach_changed';
		NavModeEvent.VNAV_REQUEST_SLOT_1 = 'vnav_request_slot_1';
		NavModeEvent.VNAV_REQUEST_SLOT_2 = 'vnav_request_slot_2';
		NavModeEvent.HDG_LOCK_CHANGED = 'hdg_lock_changed';
		NavModeEvent.TOGA_CHANGED = 'toga_changed';
		NavModeEvent.GROUNDED = 'grounded';
		NavModeEvent.PATH_NONE = 'path_none';
		NavModeEvent.PATH_ARM = 'path_arm';
		NavModeEvent.PATH_ACTIVE = 'path_active';
		NavModeEvent.GP_NONE = 'gp_none';
		NavModeEvent.GP_ARM = 'gp_arm';
		NavModeEvent.GP_ACTIVE = 'gp_active';
		NavModeEvent.GS_NONE = 'gs_none';
		NavModeEvent.GS_ARM = 'gs_arm';
		NavModeEvent.GS_ACTIVE = 'gs_active';
		NavModeEvent.AP_CHANGED = 'ap_changed';
		NavModeEvent.LOC_ACTIVE = 'loc_active';
		NavModeEvent.LNAV_ACTIVE = 'lnav_active';
		NavModeEvent.FD_TOGGLE = 'FD_TOGGLE';
		NavModeEvent.ALT_PRESSED = 'ALT_PRESSED';
     */

    onEvent(_event) {
        super.onEvent(_event);
        console.log("B747_8_FMC_MainDisplay onEvent " + _event);
        if (_event.indexOf("AP_LNAV") != -1) {
            //this.toggleLNAV();
            this._navModeSelector.onNavChangedEvent('LNAV_PRESSED');
        }
        else if (_event.indexOf("AP_VNAV") != -1) {
            //this._navModeSelector.onNavChangedEvent('VNAV_PRESSED');
            this.toggleVNAV();
        }
        else if (_event.indexOf("AP_FLCH") != -1) {
            //this._navModeSelector.onNavChangedEvent('FLC_PRESSED');
            this.toggleFLCH();
        }
        else if (_event.indexOf("AP_HEADING_HOLD") != -1) {
            //this.toggleHeadingHold();
            this._navModeSelector.onNavChangedEvent('HDG_HOLD_PRESSED');
        }
        else if (_event.indexOf("AP_HEADING_SEL") != -1) {
            this._navModeSelector.onNavChangedEvent('HDG_SEL_PRESSED');
            //this.activateHeadingSel();
        }
        else if (_event.indexOf("AP_SPD") != -1) {
            if (SimVar.GetSimVarValue("AUTOPILOT THROTTLE ARM", "Bool")) {
                this.activateSPD();
            } else {
                this.deactivateSPD();
            }
        }
        else if (_event.indexOf("AP_SPEED_INTERVENTION") != -1) {
            this.toggleSpeedIntervention();
        }
        else if (_event.indexOf("AP_VSPEED") != -1) {
            //this._navModeSelector.onNavChangedEvent('VS_PRESSED');
            this.toggleVSpeed();
        }
        else if (_event.indexOf("AP_ALT_INTERVENTION") != -1) {
            this.activateAltitudeSel();
        }
        else if (_event.indexOf("AP_ALT_HOLD") != -1) {
            this.toggleAltitudeHold();
        }
        else if (_event.indexOf("THROTTLE_TO_GA") != -1) {
            this.setAPSpeedHoldMode();
            if (this.aircraftType == Aircraft.AS01B)
                this.deactivateSPD();
            this.setThrottleMode(ThrottleMode.TOGA);
            if (Simplane.getIndicatedSpeed() > 80) {
                this.deactivateLNAV();
                this.deactivateVNAV();
            }
        }
        else if (_event.indexOf("EXEC") != -1) {
            this.onExec();
        }
    }
    activateLNAV() {
        if (this.flightPlanManager.getWaypointsCount() === 0) {
            return;
        }
        SimVar.SetSimVarValue("L:AP_LNAV_ARMED", "number", 1);
        let altitude = Simplane.getAltitudeAboveGround();
        if (altitude < 50) {
            this._pendingLNAVActivation = true;
        }
        else {
            this.doActivateLNAV();
        }
        this.deactivateHeadingHold();
    }
    doActivateLNAV() {
        this._isLNAVActive = true;
        this._pendingLNAVActivation = false;
        if (SimVar.GetSimVarValue("AUTOPILOT APPROACH HOLD", "boolean")) {
            return;
        }
        SimVar.SetSimVarValue("L:AP_LNAV_ACTIVE", "number", 1);
        SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 2);
        SimVar.SetSimVarValue("K:AP_NAV1_HOLD_ON", "number", 1);
    }
    deactivateLNAV() {
        this._pendingLNAVActivation = false;
        this._isLNAVActive = false;
        SimVar.SetSimVarValue("L:AP_LNAV_ARMED", "number", 0);
        SimVar.SetSimVarValue("L:AP_LNAV_ACTIVE", "number", 0);
    }
    getIsVNAVArmed() {
        return this._pendingVNAVActivation;
    }
    getIsVNAVActive() {
        return this._isVNAVActive;
    }
    toggleVNAV() {
        if (this.getIsVNAVArmed()) {
            this.deactivateVNAV();
            SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 1);
            SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 1);
        }
        else {
            this.activateVNAV();
        }
    }
    activateVNAV() {
        if (this.flightPlanManager.getWaypointsCount() === 0) {
            return;
        }
        SimVar.SetSimVarValue("L:AP_VNAV_ARMED", "number", 1);
        let altitude = Simplane.getAltitudeAboveGround();
        if (altitude < 400) {
            this._pendingVNAVActivation = true;
        }
        else {
            this.doActivateVNAV();
        }
        this.deactivateAltitudeHold();
        this.deactivateFLCH();
        this.deactivateVSpeed();
        if (this.aircraftType != Aircraft.AS01B)
            this.deactivateSPD();
    }
    doActivateVNAV() {
        this._isVNAVActive = true;
        SimVar.SetSimVarValue("L:AP_VNAV_ACTIVE", "number", 1);
        SimVar.SetSimVarValue("K:FLIGHT_LEVEL_CHANGE_ON", "Number", 1);
        this._pendingVNAVActivation = false;
        this.activateTHRREFMode();
        SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 2);
        SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 2);
        if (this.aircraftType == Aircraft.AS01B)
            this.activateSPD();
        this.setThrottleMode(ThrottleMode.CLIMB);
    }
    setThrottleMode(_mode) {
        if (this.getIsSPDActive() && this.aircraftType == Aircraft.AS01B)
            Coherent.call("GENERAL_ENG_THROTTLE_MANAGED_MODE_SET", ThrottleMode.AUTO);
        else
            Coherent.call("GENERAL_ENG_THROTTLE_MANAGED_MODE_SET", _mode);
    }
    deactivateVNAV() {
        this._pendingVNAVActivation = false;
        this._isVNAVActive = false;
        this._pendingVNAVActivation = false;
        SimVar.SetSimVarValue("L:AP_VNAV_ARMED", "number", 0);
        SimVar.SetSimVarValue("L:AP_VNAV_ACTIVE", "number", 0);
        this.deactivateSpeedIntervention();
    }
    getIsFLCHArmed() {
        return this._pendingFLCHActivation;
    }
    getIsFLCHActive() {
        return this._isFLCHActive;
    }
    toggleFLCH() {
        if (this.getIsFLCHArmed()) {
            this.deactivateFLCH();
        }
        else {
            this.activateFLCH();
        }
    }
    activateFLCH() {
        this._isFLCHActive = true;
        SimVar.SetSimVarValue("L:AP_FLCH_ACTIVE", "number", 1);
        this.deactivateVNAV();
        this.deactivateAltitudeHold();
        this.deactivateVSpeed();
        let altitude = Simplane.getAltitudeAboveGround();
        if (altitude < 400) {
            this._pendingFLCHActivation = true;
        }
        else {
            this.doActivateFLCH();
        }
    }
    doActivateFLCH() {
        this._pendingFLCHActivation = false;
        SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 1);
        let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, displayedAltitude, this._forceNextAltitudeUpdate);
        if (!Simplane.getAutoPilotFLCActive()) {
            SimVar.SetSimVarValue("K:FLIGHT_LEVEL_CHANGE_ON", "Number", 1);
        }
        SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 1);
        this.setThrottleMode(ThrottleMode.CLIMB);
        if (this.aircraftType != Aircraft.AS01B) {
            this.activateSPD();
        }
    }
    deactivateFLCH() {
        this._isFLCHActive = false;
        this._pendingFLCHActivation = false;
        SimVar.SetSimVarValue("L:AP_FLCH_ACTIVE", "number", 0);
        this.deactivateSpeedIntervention();
    }
    getIsSPDArmed() {
        return this._pendingSPDActivation;
    }
    getIsSPDActive() {
        return this._isSPDActive;
    }
    toggleSPD() {
        if (this.getIsSPDArmed()) {
            this.deactivateSPD();
        }
        else {
            this.activateSPD();
        }
    }
    activateSPD() {
        if (this.getIsVNAVActive() && this.aircraftType != Aircraft.AS01B) {
            return;
        }
        let altitude = Simplane.getAltitudeAboveGround();
        if (altitude < 400) {
            this._pendingSPDActivation = true;
        }
        else {
            this.doActivateSPD();
        }
        SimVar.SetSimVarValue("L:AP_SPD_ACTIVE", "number", 1);
        this._isSPDActive = true;
    }
    doActivateSPD() {
        this._pendingSPDActivation = false;
        if (Simplane.getAutoPilotMachModeActive()) {
            let currentMach = Simplane.getAutoPilotMachHoldValue();
            Coherent.call("AP_MACH_VAR_SET", 1, currentMach);
            SimVar.SetSimVarValue("K:AP_MANAGED_SPEED_IN_MACH_ON", "number", 1);
        }
        else {
            let currentSpeed = Simplane.getAutoPilotAirspeedHoldValue();
            Coherent.call("AP_SPD_VAR_SET", 1, currentSpeed);
            SimVar.SetSimVarValue("K:AP_MANAGED_SPEED_IN_MACH_OFF", "number", 1);
        }
        if (!this._isFLCHActive) {
            this.setAPSpeedHoldMode();
        }
        this.setThrottleMode(ThrottleMode.AUTO);
        let stayManagedSpeed = (this._pendingVNAVActivation || this._isVNAVActive) && !this._isSpeedInterventionActive;
        if (!stayManagedSpeed) {
            SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 1);
        }
    }
    deactivateSPD() {
        SimVar.SetSimVarValue("L:AP_SPD_ACTIVE", "number", 0);
        this._isSPDActive = false;
        this._pendingSPDActivation = false;
    }
    getIsSpeedInterventionActive() {
        return this._isSpeedInterventionActive;
    }
    toggleSpeedIntervention() {
        if (this.getIsSpeedInterventionActive()) {
            this.deactivateSpeedIntervention();
        }
        else {
            this.activateSpeedIntervention();
        }
    }
    activateSpeedIntervention() {
        if (!this.getIsVNAVActive()) {
            return;
        }
        this._isSpeedInterventionActive = true;
        if (Simplane.getAutoPilotMachModeActive()) {
            let currentMach = Simplane.getAutoPilotMachHoldValue();
            Coherent.call("AP_MACH_VAR_SET", 1, currentMach);
        }
        else {
            let currentSpeed = Simplane.getAutoPilotAirspeedHoldValue();
            Coherent.call("AP_SPD_VAR_SET", 1, currentSpeed);
        }
        SimVar.SetSimVarValue("L:AP_SPEED_INTERVENTION_ACTIVE", "number", 1);
        SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 1);
        if (this.aircraftType == Aircraft.AS01B)
            this.activateSPD();
    }
    deactivateSpeedIntervention() {
        this._isSpeedInterventionActive = false;
        SimVar.SetSimVarValue("L:AP_SPEED_INTERVENTION_ACTIVE", "number", 0);
        if (this.getIsVNAVActive()) {
            SimVar.SetSimVarValue("K:SPEED_SLOT_INDEX_SET", "number", 2);
        }
    }
    activateTHRREFMode() {
        let altitude = Simplane.getAltitudeAboveGround();
        this.setThrottleMode(ThrottleMode.CLIMB);
        let n1 = 100;
        if (altitude < this.thrustReductionAltitude) {
            n1 = this.getThrustTakeOffLimit();
        }
        else {
            n1 = this.getThrustClimbLimit();
        }
        SimVar.SetSimVarValue("AUTOPILOT THROTTLE MAX THRUST", "number", n1);
    }
    getIsHeadingHoldActive() {
        return this._isHeadingHoldActive;
    }
    toggleHeadingHold() {
        if (this.getIsHeadingHoldActive()) {
            let altitude = Simplane.getAltitudeAboveGround();
            if (altitude < 50) {
                this.deactivateHeadingHold();
            }
            else {
                this.activateHeadingHold();
            }
        }
        else {
            this.activateHeadingHold();
        }
    }
    activateHeadingHold() {
        this.deactivateLNAV();
        this._isHeadingHoldActive = true;
        if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
            SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
        }
        SimVar.SetSimVarValue("L:AP_HEADING_HOLD_ACTIVE", "number", 1);
        this._headingHoldValue = Simplane.getHeadingMagnetic();
        SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 2);
        Coherent.call("HEADING_BUG_SET", 2, this._headingHoldValue);
    }
    deactivateHeadingHold() {
        this._isHeadingHoldActive = false;
        SimVar.SetSimVarValue("L:AP_HEADING_HOLD_ACTIVE", "number", 0);
    }
    activateHeadingSel() {
        this.deactivateHeadingHold();
        this.deactivateLNAV();
        SimVar.SetSimVarValue("K:HEADING_SLOT_INDEX_SET", "number", 1);
        let altitude = Simplane.getAltitudeAboveGround();
        if (altitude < 400) {
            this._pendingHeadingSelActivation = true;
        }
        else {
            this.doActivateHeadingSel();
        }
    }
    doActivateHeadingSel() {
        this._pendingHeadingSelActivation = false;
        if (!SimVar.GetSimVarValue("AUTOPILOT HEADING LOCK", "Boolean")) {
            SimVar.SetSimVarValue("K:AP_PANEL_HEADING_HOLD", "Number", 1);
        }
    }
    getIsTHRActive() {
        return false;
    }
    getIsVSpeedActive() {
        return this._isVSpeedActive;
    }
    toggleVSpeed() {
        if (this.getIsVSpeedActive()) {
            let altitude = Simplane.getAltitudeAboveGround();
            if (altitude < 50) {
                this.deactivateVSpeed();
                this.deactivateSPD();
            }
            else {
                this.activateVSpeed();
            }
        }
        else {
            this.activateVSpeed();
        }
    }
    activateVSpeed() {
        this._isVSpeedActive = true;
        this.deactivateVNAV();
        this.deactivateAltitudeHold();
        this.deactivateFLCH();
        this.activateSPD();
        SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 1);
        let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, displayedAltitude, this._forceNextAltitudeUpdate);
        setTimeout(() => {
            let currentVSpeed = Simplane.getVerticalSpeed();
            Coherent.call("AP_VS_VAR_SET_ENGLISH", 0, currentVSpeed);
            if (!SimVar.GetSimVarValue("AUTOPILOT VERTICAL HOLD", "Boolean")) {
                SimVar.SetSimVarValue("K:AP_PANEL_VS_HOLD", "Number", 1);
            }
        }, 200);
        SimVar.SetSimVarValue("L:AP_VS_ACTIVE", "number", 1);
    }
    deactivateVSpeed() {
        this._isVSpeedActive = false;
        SimVar.SetSimVarValue("L:AP_VS_ACTIVE", "number", 0);
    }
    activateAltitudeSel() {
        if (this.getIsVNAVActive()) {
            let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
            this.cruiseFlightLevel = Math.floor(displayedAltitude / 100);
        }
        else {
            Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), true);
        }
    }
    toggleAltitudeHold() {
        if (this.getIsAltitudeHoldActive()) {
            let altitude = Simplane.getAltitudeAboveGround();
            if (altitude < 50) {
                this.deactivateAltitudeHold();
                this.deactivateSPD();
            }
        }
        else {
            this.activateAltitudeHold();
        }
    }
    getIsAltitudeHoldActive() {
        return this._isAltitudeHoldActive;
    }
    activateAltitudeHold(useCurrentAutopilotTarget = false) {
        this.deactivateVNAV();
        this.deactivateFLCH();
        this.deactivateVSpeed();
        this.activateSPD();
        this._isAltitudeHoldActive = true;
        SimVar.SetSimVarValue("L:AP_ALT_HOLD_ACTIVE", "number", 1);
        if (useCurrentAutopilotTarget) {
            this._altitudeHoldValue = Simplane.getAutoPilotAltitudeLockValue("feet");
        }
        else {
            this._altitudeHoldValue = Simplane.getAltitude();
            this._altitudeHoldValue = Math.round(this._altitudeHoldValue / 100) * 100;
        }
        SimVar.SetSimVarValue("K:ALTITUDE_SLOT_INDEX_SET", "number", 1);
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, this._altitudeHoldValue, this._forceNextAltitudeUpdate);
        if (!SimVar.GetSimVarValue("AUTOPILOT ALTITUDE LOCK", "Boolean")) {
            SimVar.SetSimVarValue("K:AP_PANEL_ALTITUDE_HOLD", "Number", 1);
        }
    }
    deactivateAltitudeHold() {
        this._isAltitudeHoldActive = false;
        SimVar.SetSimVarValue("L:AP_ALT_HOLD_ACTIVE", "number", 0);
        Coherent.call("AP_ALT_VAR_SET_ENGLISH", 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
        if (this._onAltitudeHoldDeactivate) {
            let cb = this._onAltitudeHoldDeactivate;
            this._onAltitudeHoldDeactivate = undefined;
            cb();
        }
    }
    getThrustTakeOffLimit() {
        return 100;
    }
    getThrustClimbLimit() {
        return 100;
    }
    getVRef(flapsHandleIndex = NaN, useCurrentWeight = true) {
        return 200;
    }
    getTakeOffManagedSpeed() {
        let altitude = Simplane.getAltitudeAboveGround();
        if (altitude < 35) {
            return this.v2Speed + 15;
        }
        return 250;
    }
    getIsRouteActivated() {
        return this._isRouteActivated;
    }
    activateRoute() {
        this._isRouteActivated = true;
        SimVar.SetSimVarValue("L:FMC_EXEC_ACTIVE", "number", 1);
    }
    setBoeingDirectTo(directToWaypointIdent, directToWaypointIndex, callback = EmptyCallback.Boolean) {
        let waypoints = this.flightPlanManager.getWaypoints();
        let waypointIndex = waypoints.findIndex(w => { return w.ident === directToWaypointIdent; });
        if (waypointIndex === -1) {
            waypoints = this.flightPlanManager.getApproachWaypoints();
            if (waypoints) {
                let waypoint = waypoints.find(w => { return w.ident === directToWaypointIdent; });
                if (waypoint) {
                    return this.flightPlanManager.activateDirectTo(waypoint.icao, () => {
                        return callback(true);
                    });
                }
            }
        }
        if (waypointIndex > -1) {
            this.setDepartureIndex(-1, () => {
                let i = directToWaypointIndex;
                let removeWaypointMethod = () => {
                    if (i < waypointIndex) {
                        console.log("Remove Waypoint " + this.flightPlanManager.getWaypoints()[directToWaypointIndex].ident);
                        this.flightPlanManager.removeWaypoint(directToWaypointIndex, false, () => {
                            i++;
                            removeWaypointMethod();
                        });
                    }
                    else {
                        callback(true);
                    }
                };
                removeWaypointMethod();
            });
        }
        else {
            callback(false);
        }
    }
}

FMCMainDisplay.clrValue = "DELETE";
//# sourceMappingURL=Boeing_FMC.js.map