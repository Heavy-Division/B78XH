import {BaseFMC} from './BaseFMC';
import * as HDSDK from './../../hdsdk/index';
import {HDLogger} from '../../hdlogger';
import {Level} from '../../hdlogger/levels/level';

export class Boeing_FMC extends BaseFMC {

	public _forceNextAltitudeUpdate: boolean = false;
	protected _lastTargetAirspeed: number = 200;
	protected _isLNAVActive: boolean = false;
	protected _pendingLNAVActivation: boolean = false;
	protected _isVNAVActive: boolean = false;
	protected _pendingVNAVActivation: boolean = false;
	protected _isFLCHActive: boolean = false;
	protected _pendingFLCHActivation: boolean = false;
	protected _isSPDActive: boolean = false;
	protected _pendingSPDActivation: boolean = false;
	protected _isSpeedInterventionActive: boolean = false;
	protected _isHeadingHoldActive: boolean = false;
	protected _headingHoldValue: number = 0;
	protected _pendingHeadingSelActivation: boolean = false;
	protected _isVSpeedActive: boolean = false;
	protected _isAltitudeHoldActive: boolean = false;
	protected _altitudeHoldValue: number = 0;
	protected _onAltitudeHoldDeactivate: Function = EmptyCallback.Void;
	public _isRouteActivated: boolean = false;

	protected _fpHasChanged: boolean = false;
	public _activatingDirectTo: boolean = false;

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
	public _isMainRouteActivated: boolean = false;

	public dataHolder = new FMCDataHolder();

	public messageManager = new FMCMessagesManager();
	protected onExec: () => void = undefined;
	public onExecPage: () => void = undefined;
	public onExecDefault: () => void = undefined;
	private _pageRefreshTimer: number;
	protected _navModeSelector: B78XHNavModeSelector = undefined;
	public _speedDirector: HDSDK.SpeedDirector;
	public _thrustTakeOffTemp: number;
	public thrustReductionHeight: number;
	protected isThrustReductionAltitudeCustomValue: boolean;
	_activatingDirectToExisting: boolean;
	vfrLandingRunway: any;

	setTakeOffFlap(s: string): boolean {
		let value = Number.parseInt(s);
		if (isFinite(value)) {
			/**
			 * Only flaps 5, 10, 15, 17, 18, 20 can be set for takeoff
			 */
			if ([5, 10, 15, 17, 18, 20].indexOf(value) !== -1) {
				this._takeOffFlap = value;
				/**
				 * Automatically clear all vSpeeds after flaps change
				 */
				this.speedManager.clearVSpeeds();
				return true;
			}
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}

	// Property for EXEC handling
	get fpHasChanged() {
		return this._fpHasChanged;
	}

	set fpHasChanged(value) {
		this._fpHasChanged = value;
	}

	/**
	 * Speed Intervention FIX
	 */

	getIsSpeedInterventionActive(): boolean {
		return this._isSpeedInterventionActive;
	}

	toggleSpeedIntervention(): void {
		if (this.getIsSpeedInterventionActive()) {
			this.deactivateSpeedIntervention();
		} else {
			this.activateSpeedIntervention();
		}
	}

	activateSpeedIntervention(): void {
		if (!this.getIsVNAVActive()) {
			return;
		}
		this._isSpeedInterventionActive = true;
		if (Simplane.getAutoPilotMachModeActive()) {
			let currentMach = Simplane.getAutoPilotMachHoldValue();
			Coherent.call('AP_MACH_VAR_SET', 1, currentMach);
		} else {
			let currentSpeed = Simplane.getAutoPilotAirspeedHoldValue();
			Coherent.call('AP_SPD_VAR_SET', 1, currentSpeed);
		}
		SimVar.SetSimVarValue('L:AP_SPEED_INTERVENTION_ACTIVE', 'number', 1);
		SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', 'number', 1);
		if (this.aircraftType == Aircraft.AS01B) {
			this.activateSPD();
		}
	}

	deactivateSpeedIntervention(): void {
		this._isSpeedInterventionActive = false;
		SimVar.SetSimVarValue('L:AP_SPEED_INTERVENTION_ACTIVE', 'number', 0);
		if (this.getIsVNAVActive()) {
			SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', 'number', 2);
		}
	}

	activateSPD(): void {
		if (this.getIsVNAVActive() && this.aircraftType != Aircraft.AS01B) {
			return;
		}
		let altitude = Simplane.getAltitudeAboveGround();
		if (altitude < 400) {
			this._pendingSPDActivation = true;
		} else {
			this.doActivateSPD();
		}
		SimVar.SetSimVarValue('L:AP_SPD_ACTIVE', 'number', 1);
		this._isSPDActive = true;
	}

	doActivateSPD(): void {
		this._pendingSPDActivation = false;
		if (Simplane.getAutoPilotMachModeActive()) {
			let currentMach = Simplane.getAutoPilotMachHoldValue();
			Coherent.call('AP_MACH_VAR_SET', 1, currentMach);
			SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_ON', 'number', 1);
		} else {
			let currentSpeed = Simplane.getAutoPilotAirspeedHoldValue();
			Coherent.call('AP_SPD_VAR_SET', 1, currentSpeed);
			SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_OFF', 'number', 1);
		}
		if (!this._isFLCHActive) {
			this.setAPSpeedHoldMode();
		}
		this.setThrottleMode(ThrottleMode.AUTO);
		let stayManagedSpeed = (this._pendingVNAVActivation || this._isVNAVActive) && !this._isSpeedInterventionActive;
		if (!stayManagedSpeed) {
			SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', 'number', 1);
		}
	}

	deactivateSPD(): void {
		SimVar.SetSimVarValue('L:AP_SPD_ACTIVE', 'number', 0);
		this._isSPDActive = false;
		this._pendingSPDActivation = false;
	}

	constructor() {
		super();
	}

	Init(): void {
		super.Init();
		this.maxCruiseFL = 450;
		this.onDel = () => {
			if (this.inOut.length === 0) {
				this.inOut = 'DELETE';
			}
		};
		this.onClr = () => {
			if (this.isDisplayingErrorMessage) {
				this.inOut = this.lastUserInput;
				this.isDisplayingErrorMessage = false;
			} else if (this.inOut.length > 0) {
				if (this.inOut === 'DELETE') {
					this.inOut = '';
				} else {
					this.inOut = this.inOut.substr(0, this.inOut.length - 1);
				}
			}
		};

		this.onExec = () => {
			if (this.onExecPage) {
				console.log('if this.onExecPage');
				this.onExecPage();
			} else {
				console.log('else this.onExecPage');
				this._isRouteActivated = false;
				this.fpHasChanged = false;
				this._activatingDirectTo = false;
			}
		};
		this.onExecPage = undefined;
		this.onExecDefault = () => {
			if (this.getIsRouteActivated() && !this._activatingDirectTo) {
				this.insertTemporaryFlightPlan(() => {
					this.copyAirwaySelections();
					this._isRouteActivated = false;
					this._activatingDirectToExisting = false;
					this.fpHasChanged = false;
					SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'number', 0);
					if (this.refreshPageCallback) {
						this.refreshPageCallback();
					}
				});
			} else if (this.getIsRouteActivated() && this._activatingDirectTo) {
				const activeIndex = this.flightPlanManager.getActiveWaypointIndex();
				this.insertTemporaryFlightPlan(() => {
					this.flightPlanManager.activateDirectToByIndex(activeIndex, () => {
						this.copyAirwaySelections();
						this._isRouteActivated = false;
						this._activatingDirectToExisting = false;
						this._activatingDirectTo = false;
						this.fpHasChanged = false;
						SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'number', 0);
						if (this.refreshPageCallback) {
							this.refreshPageCallback();
						}
					});
				});
			} else {
				this.fpHasChanged = false;
				this._isRouteActivated = false;
				SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'number', 0);
				if (this.refreshPageCallback) {
					this._activatingDirectTo = false;
					this.fpHasChanged = false;
					this.refreshPageCallback();
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
	 * TODO: Better to use synchronizeTemporaryAndActiveFlightPlanWaypoints in future
	 * (implementation can be found in source code prior 0.1.10 version)
	 */

	// Copy airway selections from temporary to active flightplan
	copyAirwaySelections() {
		const temporaryFPWaypoints = this.flightPlanManager.getWaypoints(1);
		const activeFPWaypoints = this.flightPlanManager.getWaypoints(0);
		for (let i = 0; i < activeFPWaypoints.length; i++) {
			if (activeFPWaypoints[i].infos && temporaryFPWaypoints[i] && activeFPWaypoints[i].icao === temporaryFPWaypoints[i].icao && temporaryFPWaypoints[i].infos) {
				activeFPWaypoints[i].infos.airwayIn = temporaryFPWaypoints[i].infos.airwayIn;
				activeFPWaypoints[i].infos.airwayOut = temporaryFPWaypoints[i].infos.airwayOut;
			}
		}
	}

	onFMCFlightPlanLoaded() {
		let runway = this.flightPlanManager.getDepartureRunway();
		if (!runway) {
			runway = this.flightPlanManager.getDetectedCurrentRunway();
		}
		const weight = this.getWeight(true);
		const flaps = this.getTakeOffFlap();
		let vRSpeed = this.speedManager.getComputedVRSpeed(runway, weight, flaps);
		SimVar.SetSimVarValue('FLY ASSISTANT TAKEOFF SPEED ESTIMATED', 'Knots', vRSpeed);
	}

	activateRoute(directTo: boolean = false, callback = EmptyCallback.Void): void {
		if (directTo) {
			this._activatingDirectTo = true;
		}
		this.fpHasChanged = true;
		if (this._isMainRouteActivated) {
			this._isRouteActivated = true;
			SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'number', 1);
		}
		callback();
	}

	eraseRouteModifications(): void {
		this.fpHasChanged = false;
		this._activatingDirectTo = false;
		this._isRouteActivated = false;
		SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'number', 0);
	}

	activateMainRoute(callback = EmptyCallback.Void): void {
		this._isMainRouteActivated = true;
		this.activateRoute(false, callback);
	}

	//function added to set departure enroute transition index
	setDepartureEnrouteTransitionIndex(departureEnrouteTransitionIndex: number, callback = EmptyCallback.Boolean): void {
		this.ensureCurrentFlightPlanIsTemporary(() => {
			this.flightPlanManager.setDepartureEnRouteTransitionIndex(departureEnrouteTransitionIndex, () => {
				callback(true);
			});
		});
	}

	//function added to set arrival runway transition index
	setArrivalRunwayTransitionIndex(arrivalRunwayTransitionIndex: number, callback = EmptyCallback.Boolean): void {
		this.ensureCurrentFlightPlanIsTemporary(() => {
			this.flightPlanManager.setArrivalRunwayIndex(arrivalRunwayTransitionIndex, () => {
				callback(true);
			});
		});
	}

	setArrivalAndRunwayIndex(arrivalIndex: number, enrouteTransitionIndex: number, callback = EmptyCallback.Boolean): any {
		this.ensureCurrentFlightPlanIsTemporary(() => {
			let landingRunway = this.vfrLandingRunway;
			if (landingRunway === undefined) {
				landingRunway = this.flightPlanManager.getApproachRunway();
			}
			this.flightPlanManager.setArrivalProcIndex(arrivalIndex, () => {
				this.flightPlanManager.setArrivalEnRouteTransitionIndex(enrouteTransitionIndex, () => {
					if (landingRunway) {
						const arrival = this.flightPlanManager.getArrival();
						const arrivalRunwayIndex = arrival.runwayTransitions.findIndex(t => {
							return t.name.indexOf(landingRunway.designation) != -1;
						});
						if (arrivalRunwayIndex >= -1) {
							return this.flightPlanManager.setArrivalRunwayIndex(arrivalRunwayIndex, () => {
								return callback(true);
							});
						}
					}
					return callback(true);
				});
			});
		});
	}

	toggleLNAV() {
	}

	toggleHeadingHold() {
	}

	activateAltitudeSel() {
	}

	onEvent(_event): void {
		super.onEvent(_event);
		HDLogger.log('B787_10_BaseFMC onEvent ' + _event, Level.debug);
		if (_event.indexOf('AP_LNAV') != -1) {
			if (this._isMainRouteActivated) {
				this._navModeSelector.onNavChangedEvent('NAV_PRESSED');
			} else {
				this.messageManager.showMessage('NO ACTIVE ROUTE', 'ACTIVATE ROUTE TO <br> ENGAGE LNAV');
			}
		} else if (_event.indexOf('AP_VNAV') != -1) {
			this.toggleVNAV();
		} else if (_event.indexOf('AP_FLCH') != -1) {
			this.toggleFLCH();
		} else if (_event.indexOf('AP_HEADING_HOLD') != -1) {
			this._navModeSelector.onNavChangedEvent('HDG_HOLD_PRESSED');
		} else if (_event.indexOf('AP_HEADING_SEL') != -1) {
			this._navModeSelector.onNavChangedEvent('HDG_SEL_PRESSED');
		} else if (_event.indexOf('AP_SPD') != -1) {
			if (this.aircraftType === Aircraft.AS01B) {
				if (SimVar.GetSimVarValue('AUTOPILOT THROTTLE ARM', 'Bool')) {
					this.activateSPD();
				} else {
					this.deactivateSPD();
				}
			} else {
				if ((this.getIsAltitudeHoldActive() || this.getIsVSpeedActive()) && this.getIsTHRActive()) {
					this.toggleSPD();
				}
			}
		} else if (_event.indexOf('AP_SPEED_INTERVENTION') != -1) {
			this.toggleSpeedIntervention();
		} else if (_event.indexOf('AP_VSPEED') != -1) {
			this.toggleVSpeed();
		} else if (_event.indexOf('AP_ALT_INTERVENTION') != -1) {
			this.activateAltitudeSel();
		} else if (_event.indexOf('AP_ALT_HOLD') != -1) {
			this.toggleAltitudeHold();
		} else if (_event.indexOf('THROTTLE_TO_GA') != -1) {
			this.setAPSpeedHoldMode();
			if (this.aircraftType == Aircraft.AS01B) {
				this.deactivateSPD();
			}
			this.setThrottleMode(ThrottleMode.TOGA);
			if (Simplane.getIndicatedSpeed() > 80) {
				this.deactivateLNAV();
				this.deactivateVNAV();
			}
		} else if (_event.indexOf('EXEC') != -1) {
			this.onExec();
		}
	}

	getIsLNAVArmed(): boolean {
		return this._pendingLNAVActivation;
	}

	getIsLNAVActive(): boolean {
		return this._isLNAVActive;
	}

	activateLNAV(): void {
		if (this.flightPlanManager.getWaypointsCount() === 0) {
			return;
		}
		Simplane.setAPLNAVArmed(1);
		let altitude = Simplane.getAltitudeAboveGround();
		if (altitude < 50) {
			this._pendingLNAVActivation = true;
		} else {
			this.doActivateLNAV();
		}
		this.deactivateHeadingHold();
	}

	doActivateLNAV(): void {
		this._isLNAVActive = true;
		this._pendingLNAVActivation = false;
		if (SimVar.GetSimVarValue('AUTOPILOT APPROACH HOLD', 'boolean')) {
			return;
		}
		Simplane.setAPLNAVActive(1);
		SimVar.SetSimVarValue('K:AP_NAV1_HOLD_ON', 'number', 1);
	}

	deactivateLNAV(): void {
		this._pendingLNAVActivation = false;
		this._isLNAVActive = false;
		Simplane.setAPLNAVArmed(0);
		Simplane.setAPLNAVActive(0);
	}

	getIsVNAVArmed(): boolean {
		return this._pendingVNAVActivation;
	}

	getIsVNAVActive(): boolean {
		return this._isVNAVActive;
	}

	toggleVNAV(): void {
		if (this.getIsVNAVArmed()) {
			this.deactivateVNAV();
			SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', 'number', 1);
			SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', 'number', 1);
		} else {
			this.activateVNAV();
		}
	}

	activateVNAV(): void {
		if (this.flightPlanManager.getWaypointsCount() === 0) {
			return;
		}
		Simplane.setAPVNAVArmed(1);
		let altitude = Simplane.getAltitudeAboveGround();
		if (altitude < 400) {
			this._pendingVNAVActivation = true;
		} else {
			this.doActivateVNAV();
		}
		this.deactivateAltitudeHold();
		this.deactivateFLCH();
		this.deactivateVSpeed();
		if (this.aircraftType != Aircraft.AS01B) {
			this.deactivateSPD();
		}
	}

	doActivateVNAV(): void {
		this._isVNAVActive = true;
		Simplane.setAPVNAVActive(1);
		SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', 'Number', 1);
		this._pendingVNAVActivation = false;
		this.activateTHRREFMode();
		SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', 'number', 2);
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', 'number', 2);
		if (this.aircraftType == Aircraft.AS01B) {
			this.activateSPD();
		}
		this.setThrottleMode(ThrottleMode.CLIMB);
	}

	setThrottleMode(_mode: ThrottleMode): void {
		if (this.getIsSPDActive() && this.aircraftType == Aircraft.AS01B) {
			Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);
		} else {
			Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', _mode);
		}
	}

	deactivateVNAV(): void {
		this._pendingVNAVActivation = false;
		this._isVNAVActive = false;
		this._pendingVNAVActivation = false;
		Simplane.setAPVNAVArmed(0);
		Simplane.setAPVNAVActive(0);
		this.deactivateSpeedIntervention();
	}

	getIsFLCHArmed(): boolean {
		return this._pendingFLCHActivation;
	}

	getIsFLCHActive(): boolean {
		return this._isFLCHActive;
	}

	toggleFLCH(): void {
		if (this.getIsFLCHArmed()) {
			this.deactivateFLCH();
		} else {
			this.activateFLCH();
		}
	}

	activateFLCH(): void {
		this._isFLCHActive = true;
		Simplane.setAPFLCHActive(1);
		this.deactivateVNAV();
		this.deactivateAltitudeHold();
		this.deactivateVSpeed();
		let altitude = Simplane.getAltitudeAboveGround();
		if (altitude < 400) {
			this._pendingFLCHActivation = true;
		} else {
			this.doActivateFLCH();
		}
	}

	doActivateFLCH(): void {
		this._pendingFLCHActivation = false;
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', 'number', 1);
		let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, displayedAltitude, this._forceNextAltitudeUpdate);
		if (!Simplane.getAutoPilotFLCActive()) {
			SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', 'Number', 1);
		}
		SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', 'number', 1);
		this.setThrottleMode(ThrottleMode.CLIMB);
		if (this.aircraftType != Aircraft.AS01B) {
			this.activateSPD();
		}
	}

	deactivateFLCH(): void {
		this._isFLCHActive = false;
		this._pendingFLCHActivation = false;
		Simplane.setAPFLCHActive(0);
		this.deactivateSpeedIntervention();
	}

	getIsSPDArmed(): boolean {
		return this._pendingSPDActivation;
	}

	getIsSPDActive(): boolean {
		return this._isSPDActive;
	}

	toggleSPD(): void {
		if (this.getIsSPDArmed()) {
			this.deactivateSPD();
		} else {
			this.activateSPD();
		}
	}

	activateTHRREFMode(): void {
		let altitude = Simplane.getAltitudeAboveGround();
		this.setThrottleMode(ThrottleMode.CLIMB);
		let n1 = 100;
		if (altitude < this.thrustReductionAltitude) {
			n1 = this.getThrustTakeOffLimit();
		} else {
			n1 = this.getThrustClimbLimit();
		}
		SimVar.SetSimVarValue('AUTOPILOT THROTTLE MAX THRUST', 'number', n1);
	}

	getIsHeadingHoldActive(): boolean {
		return this._isHeadingHoldActive;
	}

	activateHeadingHold(): void {
		this.deactivateLNAV();
		this._isHeadingHoldActive = true;
		if (!SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'Boolean')) {
			SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'Number', 1);
		}
		SimVar.SetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', 'number', 1);
		this._headingHoldValue = Simplane.getHeadingMagnetic();
		SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', 'number', 2);
		Coherent.call('HEADING_BUG_SET', 2, this._headingHoldValue);
	}

	deactivateHeadingHold(): void {
		this._isHeadingHoldActive = false;
		SimVar.SetSimVarValue('L:AP_HEADING_HOLD_ACTIVE', 'number', 0);
	}

	activateHeadingSel(): void {
		this.deactivateHeadingHold();
		this.deactivateLNAV();
		SimVar.SetSimVarValue('K:HEADING_SLOT_INDEX_SET', 'number', 1);
		let altitude = Simplane.getAltitudeAboveGround();
		if (altitude < 400) {
			this._pendingHeadingSelActivation = true;
		} else {
			this.doActivateHeadingSel();
		}
	}

	doActivateHeadingSel(): void {
		this._pendingHeadingSelActivation = false;
		if (!SimVar.GetSimVarValue('AUTOPILOT HEADING LOCK', 'Boolean')) {
			SimVar.SetSimVarValue('K:AP_PANEL_HEADING_HOLD', 'Number', 1);
		}
	}

	getIsTHRActive(): boolean {
		return false;
	}

	getIsVSpeedActive(): boolean {
		return this._isVSpeedActive;
	}

	toggleVSpeed(): void {
		if (this.getIsVSpeedActive()) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude < 50) {
				this.deactivateVSpeed();
				this.deactivateSPD();
			} else {
				this.activateVSpeed();
			}
		} else {
			this.activateVSpeed();
		}
	}

	activateVSpeed(): void {
		this._isVSpeedActive = true;
		this.deactivateVNAV();
		this.deactivateAltitudeHold();
		this.deactivateFLCH();
		this.activateSPD();
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', 'number', 1);
		let displayedAltitude = Simplane.getAutoPilotDisplayedAltitudeLockValue();
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, displayedAltitude, this._forceNextAltitudeUpdate);
		this.requestCall(() => {
			let currentVSpeed = Simplane.getVerticalSpeed();
			Coherent.call('AP_VS_VAR_SET_ENGLISH', 0, currentVSpeed);
			if (!SimVar.GetSimVarValue('AUTOPILOT VERTICAL HOLD', 'Boolean')) {
				SimVar.SetSimVarValue('K:AP_PANEL_VS_HOLD', 'Number', 1);
			}
		}, 200);
		SimVar.SetSimVarValue('L:AP_VS_ACTIVE', 'number', 1);
	}

	deactivateVSpeed(): void {
		this._isVSpeedActive = false;
		SimVar.SetSimVarValue('L:AP_VS_ACTIVE', 'number', 0);
	}

	toggleAltitudeHold(): void {
		if (this.getIsAltitudeHoldActive()) {
			let altitude = Simplane.getAltitudeAboveGround();
			if (altitude < 50) {
				this.deactivateAltitudeHold();
				this.deactivateSPD();
			}
		} else {
			this.activateAltitudeHold();
		}
	}

	getIsAltitudeHoldActive() {
		return this._isAltitudeHoldActive;
	}

	activateAltitudeHold(useCurrentAutopilotTarget: boolean = false): void {
		this.deactivateVNAV();
		this.deactivateFLCH();
		this.deactivateVSpeed();
		this.activateSPD();
		this._isAltitudeHoldActive = true;
		Simplane.setAPAltHoldActive(1);
		if (useCurrentAutopilotTarget) {
			this._altitudeHoldValue = Simplane.getAutoPilotAltitudeLockValue('feet');
		} else {
			this._altitudeHoldValue = Simplane.getAltitude();
			this._altitudeHoldValue = Math.round(this._altitudeHoldValue / 100) * 100;
		}
		SimVar.SetSimVarValue('K:ALTITUDE_SLOT_INDEX_SET', 'number', 1);
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, this._altitudeHoldValue, this._forceNextAltitudeUpdate);
		if (!SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Boolean')) {
			SimVar.SetSimVarValue('K:AP_PANEL_ALTITUDE_HOLD', 'Number', 1);
		}
	}

	deactivateAltitudeHold(): void {
		this._isAltitudeHoldActive = false;
		Simplane.setAPAltHoldActive(0);
		Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
		if (this._onAltitudeHoldDeactivate) {
			let cb = this._onAltitudeHoldDeactivate;
			this._onAltitudeHoldDeactivate = undefined;
			cb();
		}
	}

	getThrustTakeOffLimit(): number {
		return 100;
	}

	getThrustClimbLimit(): number {
		return 100;
	}

	getVRef(flapsHandleIndex: number = NaN, useCurrentWeight: boolean = true): number {
		return 200;
	}

	getTakeOffManagedSpeed(): number {
		let altitude = Simplane.getAltitudeAboveGround();
		if (altitude < 35) {
			return this.speedManager.repository.v2Speed + 15;
		}
		return 250;
	}

	getIsRouteActivated(): boolean {
		return this._isRouteActivated;
	}

	setBoeingDirectTo(directToWaypointIdent, directToWaypointIndex, callback = EmptyCallback.Boolean): void {
		let waypoints = this.flightPlanManager.getWaypoints();
		let waypointIndex = waypoints.findIndex(w => {
			return w.ident === directToWaypointIdent;
		});
		if (waypointIndex === -1) {
			waypoints = this.flightPlanManager.getApproachWaypoints();
			if (waypoints) {
				let waypoint = waypoints.find(w => {
					return w.ident === directToWaypointIdent;
				});
				if (waypoint) {
					return this.flightPlanManager.activateDirectTo(waypoint.icao, () => {
						return callback(true);
					});
				}
			}
		}
		if (waypointIndex > -1) {
			this.ensureCurrentFlightPlanIsTemporary(() => {
				this.flightPlanManager.removeWaypointFromTo(directToWaypointIndex, waypointIndex, true, () => {
					callback(true);
				});
			});
		} else {
			callback(false);
		}
	}

	updateHUDAirspeedColors(): void {
		let crossSpeed = Simplane.getCrossoverSpeed();
		let cruiseMach = Simplane.getCruiseMach();
		let crossSpeedFactor = Simplane.getCrossoverSpeedFactor(crossSpeed, cruiseMach);
		let stallSpeed = Simplane.getStallSpeed();
		SimVar.SetSimVarValue('L:HUD_AIRSPEED_WHITE_START', 'number', Simplane.getDesignSpeeds().VS0 * crossSpeedFactor);
		SimVar.SetSimVarValue('L:HUD_AIRSPEED_WHITE_END', 'number', Simplane.getMaxSpeed(this.aircraftType) * crossSpeedFactor);
		SimVar.SetSimVarValue('L:HUD_AIRSPEED_GREEN_START', 'number', stallSpeed * crossSpeedFactor);
		SimVar.SetSimVarValue('L:HUD_AIRSPEED_GREEN_END', 'number', stallSpeed * Math.sqrt(1.3) * crossSpeedFactor);
		SimVar.SetSimVarValue('L:HUD_AIRSPEED_YELLOW_START', 'number', stallSpeed * Math.sqrt(1.3) * crossSpeedFactor);
		SimVar.SetSimVarValue('L:HUD_AIRSPEED_YELLOW_END', 'number', Simplane.getMaxSpeed(this.aircraftType) * crossSpeedFactor);
		SimVar.SetSimVarValue('L:HUD_AIRSPEED_RED_START', 'number', Simplane.getMaxSpeed(this.aircraftType) * crossSpeedFactor);
		SimVar.SetSimVarValue('L:HUD_AIRSPEED_RED_END', 'number', (Simplane.getDesignSpeeds().VMax + 100) * crossSpeedFactor);
	}


	/**
	 * Registers a periodic page refresh with the FMC display.
	 * @param {number} interval The interval, in ms, to run the supplied action.
	 * @param {function} action An action to run at each interval. Can return a bool to indicate if the page refresh should stop.
	 * @param {boolean} runImmediately If true, the action will run as soon as registered, and then after each
	 * interval. If false, it will start after the supplied interval.
	 */
	registerPeriodicPageRefresh(action, interval, runImmediately): void {
		this.unregisterPeriodicPageRefresh();

		const refreshHandler = () => {
			const isBreak = action();
			if (isBreak) {
				return;
			}
			this._pageRefreshTimer = window.setTimeout(refreshHandler, interval);
		};

		if (runImmediately) {
			refreshHandler();
		} else {
			this._pageRefreshTimer = window.setTimeout(refreshHandler, interval);
		}
	}

	/**
	 * Unregisters a periodic page refresh with the FMC display.
	 */
	unregisterPeriodicPageRefresh() {
		if (this._pageRefreshTimer) {
			clearInterval(this._pageRefreshTimer);
		}
	}

	clearDisplay() {
		super.clearDisplay();
		this.unregisterPeriodicPageRefresh();
	}

	/**
	 * FMC Renderer extensions
	 * TODO: Standalone rendered should be created.
	 */

	setTemplate(template: string[][]): void {
		return;
		if (template[0]) {
			this.setTitle(template[0][0]);
			this.setPageCurrent(template[0][1]);
			this.setPageCount(template[0][2]);
		}
		for (let i = 0; i < 6; i++) {
			let tIndex = 2 * i + 1;
			if (template[tIndex]) {
				if (template[tIndex][1] !== undefined) {
					this.setLabel(template[tIndex][0], i, 0);
					this.setLabel(template[tIndex][1], i, 1);
					this.setLabel(template[tIndex][2], i, 2);
					this.setLabel(template[tIndex][3], i, 3);
				} else {
					this.setLabel(template[tIndex][0], i, -1);
				}
			}
			tIndex = 2 * i + 2;
			if (template[tIndex]) {
				if (template[tIndex][1] !== undefined) {
					this.setLine(template[tIndex][0], i, 0);
					this.setLine(template[tIndex][1], i, 1);
					this.setLine(template[tIndex][2], i, 2);
					this.setLine(template[tIndex][3], i, 3);
				} else {
					this.setLine(template[tIndex][0], i, -1);
				}
			}
		}
		if (template[13]) {
			this.setInOut(template[13][0]);
		}
	}

	/**
	 * Convert text to settable FMC design
	 * @param content
	 * @param width
	 * @returns {string}
	 */
	makeSettable(content: string, width: number = undefined): string {
		return '[settable=' + String(width) + ']' + content + '[/settable]';
		//return '[settable]' + content + '[/settable]';
	}

	/**
	 * Convert/set text to colored text
	 * @param content
	 * @param color
	 * @returns {string}
	 */
	colorizeContent(content: string, color: string): string {
		return '[color=' + color + ']' + content + '[/color]';
	}

	/**
	 * Convert/set text size
	 * @param content
	 * @param size
	 * @returns {string}
	 */
	resizeContent(content: string, size: string): string {
		return '[size=' + size + ']' + content + '[/size]';
	}

	/**
	 * setTitle with settable/size/color support
	 * @param content
	 */
	setTitle(content: string): void {
		if (content !== '') {
			let re3 = /\[settable\](.*?)\[\/settable\]/g;
			content = content.replace(re3, '<div class="settable"><span>$1</span></div>');

			let re2 = /\[size=([a-z-]+)\](.*?)\[\/size\]/g;
			content = content.replace(re2, '<tspan class="$1">$2</tspan>');

			let re = /\[color=([a-z-]+)\](.*?)\[\/color\]/g;
			content = content.replace(re, '<tspan class="$1">$2</tspan>');
			let color = content.split('[color]')[1];
		}
		let color = content.split('[color]')[1];
		if (!color) {
			color = 'white';
		}
		this._title = content.split('[color]')[0];
		this._titleElement.classList.remove('white', 'blue', 'yellow', 'orange', 'green', 'red');
		this._titleElement.classList.add(color);
		this._titleElement.innerHTML = this._title;
	}

	/**
	 * setlabel with settable/size/color support
	 * @param content
	 */
	setLabel(label: string, row: number, col: number = -1): void {
		if (col >= this._labelElements[row].length) {
			return;
		}
		if (!this._labels[row]) {
			this._labels[row] = [];
		}
		if (!label) {
			label = '';
		}
		if (col === -1) {
			for (let i = 0; i < this._labelElements[row].length; i++) {
				this._labels[row][i] = '';
				this._labelElements[row][i].textContent = '';
			}
			col = 0;
		}
		if (label === '__FMCSEPARATOR') {
			label = '---------------------------------------';
		}
		if (label !== '') {
			label = label.replace('\<', '&lt');
			let re3 = /\[settable\](.*?)\[\/settable\]/g;
			//content = content.replace(re3, '<div style="padding-top: 4px"><span class="settable">$1</span></div>')
			label = label.replace(re3, '<div class="settable"><span>$1</span></div>');

			let re2 = /\[size=([a-z-]+)\](.*?)\[\/size\]/g;
			label = label.replace(re2, '<tspan class="$1">$2</tspan>');

			let re = /\[color=([a-z-]+)\](.*?)\[\/color\]/g;
			label = label.replace(re, '<tspan class="$1">$2</tspan>');

			let color = label.split('[color]')[1];
			if (!color) {
				color = 'white';
			}
			let e = this._labelElements[row][col];
			e.classList.remove('white', 'blue', 'yellow', 'orange', 'green', 'red');
			e.classList.add(color);
			label = label.split('[color]')[0];
		}
		this._labels[row][col] = label;
		this._labelElements[row][col].innerHTML = '<bdi>' + label + '</bdi>';
	}

	/**
	 * setline with settable/size/color support
	 * @param content
	 */
	setLine(content: string, row: number, col: number = -1): void {
		if (col >= this._lineElements[row].length) {
			return;
		}
		if (!content) {
			content = '';
		}
		if (!this._lines[row]) {
			this._lines[row] = [];
		}
		if (col === -1) {
			for (let i = 0; i < this._lineElements[row].length; i++) {
				this._lines[row][i] = '';
				this._lineElements[row][i].textContent = '';
			}
			col = 0;
		}
		if (content === '__FMCSEPARATOR') {
			content = '---------------------------------------';
		}
		if (content !== '') {
			content = content.replace('\<', '&lt');
			if (content.indexOf('[s-text]') !== -1) {
				content = content.replace('[s-text]', '');
				this._lineElements[row][col].classList.add('s-text');
			} else {
				this._lineElements[row][col].classList.remove('s-text');
			}

			let re3 = /\[settable\](.*?)\[\/settable\]/g;
			//content = content.replace(re3, '<div style="padding-top: 4px"><span class="settable">$1</span></div>')
			content = content.replace(re3, '<div class="settable"><span>$1</span></div>');

			let re2 = /\[size=([a-z-]+)\](.*?)\[\/size\]/g;
			content = content.replace(re2, '<tspan class="$1">$2</tspan>');

			let re = /\[color=([a-z-]+)\](.*?)\[\/color\]/g;
			content = content.replace(re, '<tspan class="$1">$2</tspan>');
			let color = content.split('[color]')[1];
			if (!color) {
				color = 'white';
			}
			let e = this._lineElements[row][col];
			e.classList.remove('white', 'blue', 'yellow', 'green', 'red', 'magenta');
			e.classList.add(color);
			content = content.split('[color]')[0];
		}
		this._lines[row][col] = content;
		this._lineElements[row][col].innerHTML = '<bdi>' + this._lines[row][col] + '</bdi>';
	}

	trySetTransAltitude(s: string): boolean {
		if (!/^\d+$/.test(s)) {
			this.showErrorMessage('FORMAT ERROR');
			return false;
		}
		let v = parseInt(s);
		if (isFinite(v) && v > 0) {
			this.transitionAltitude = v;
			SimVar.SetSimVarValue('L:AIRLINER_TRANS_ALT', 'Number', this.transitionAltitude);
			return true;
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}

	/**
	 * TODO: Should be moved to SpeedDirector class
	 * @param s
	 * @returns {boolean}
	 */
	trySetAccelerationHeight(s: string): boolean {
		let accelerationHeight = parseInt(s);
		let origin = this.flightPlanManager.getOrigin();
		if (origin) {
			if (isFinite(accelerationHeight)) {
				let elevation = Math.round(parseFloat(origin.infos.oneWayRunways[0].elevation) * 3.28);
				let roundedHeight = Math.round(accelerationHeight / 100) * 100;
				if (this.trySetAccelerationAltitude(String(roundedHeight + elevation))) {
					this._speedDirector.accelerationSpeedRestriction.accelerationHeight = roundedHeight;
					return true;
				}
			}
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}

	/**
	 * TODO: Should be moved to SpeedDirector class
	 * @param s
	 * @returns {boolean}
	 */
	trySetAccelerationAltitude(s: string): boolean {
		let accelerationHeight = parseInt(s);
		if (isFinite(accelerationHeight)) {
			this._speedDirector.accelerationSpeedRestriction.altitude = accelerationHeight;
			SimVar.SetSimVarValue('L:AIRLINER_ACC_ALT', 'Number', accelerationHeight);
			return true;
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}

	/**
	 * TODO: Should be moved to SpeedDirector/ThrustDirector
	 * TODO: Probably should be better to make ThrustDirector because thr reduction is not speed thing
	 * @param s
	 * @returns {boolean}
	 */
	trySetThrustReductionHeight(s: string): boolean {
		let thrustReductionHeight = parseInt(s);
		let origin = this.flightPlanManager.getOrigin();
		if (origin) {
			if (isFinite(thrustReductionHeight)) {
				let elevation = Math.round(parseFloat(origin.infos.oneWayRunways[0].elevation) * 3.28);
				let roundedHeight = Math.round(thrustReductionHeight / 100) * 100;
				if (this.trySetThrustReductionAltitude(String(roundedHeight + elevation))) {
					this.thrustReductionHeight = roundedHeight;
					this.isThrustReductionAltitudeCustomValue = true;
					return true;
				}
			}
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}

	/**
	 * TODO: Should be moved to SpeedDirector class
	 * @param s
	 * @returns {boolean}
	 */
	trySetThrustReductionAltitude(s: string): boolean {
		let thrustReductionHeight = parseInt(s);
		if (isFinite(thrustReductionHeight)) {
			this.thrustReductionAltitude = thrustReductionHeight;
			SimVar.SetSimVarValue('L:AIRLINER_THR_RED_ALT', 'Number', this.thrustReductionAltitude);
			return true;
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}

	/**
	 * TODO: Should be moved to SpeedDirector class or the function should be only bypass for new function in SpeedDirector
	 */
	recalculateTHRRedAccTransAlt(): void {
		/**
		 * TODO: HotFix!!! Need to be fixed in future... SpeedDirector is not normally accessible from here
		 */
		if (this._speedDirector === undefined) {
			this._speedDirector = new HDSDK.SpeedDirector(this.speedManager);
		}

		let origin = this.flightPlanManager.getOrigin();
		if (origin) {
			this._recalculateOriginTransitionAltitude(origin);
			this._recalculateThrustReductionAltitude(origin);
			this._recalculateAccelerationAltitude(origin);
		}
		let destination = this.flightPlanManager.getDestination();
		if (destination) {
			this._recalculateDestinationTransitionAltitude(destination);
		}
	}

	/**
	 * TODO: Should be moved into SpeedDirector/ThrustDirector??
	 * @param origin
	 * @private
	 */
	_recalculateThrustReductionAltitude(origin: any): void {
		if (origin) {
			if (origin.infos instanceof AirportInfo) {
				if (!this.isThrustReductionAltitudeCustomValue) {
					const elevation = Math.round(parseFloat(origin.infos.oneWayRunways[0].elevation) * 3.28);
					this.thrustReductionAltitude = elevation + 1500;
					this.thrustReductionHeight = 1500;
					SimVar.SetSimVarValue('L:AIRLINER_THR_RED_ALT', 'Number', this.thrustReductionAltitude);
				}
			}
		}
	}

	/**
	 * TODO: Should be moved into SpeedDirector
	 * @param origin
	 * @private
	 */
	_recalculateAccelerationAltitude(origin: any): void {
		if (origin) {
			if (origin.infos instanceof AirportInfo) {
				const elevation = Math.round(parseFloat(origin.infos.oneWayRunways[0].elevation) * 3.28);
				this._speedDirector.accelerationSpeedRestriction.altitude = elevation + this._speedDirector.accelerationSpeedRestriction.accelerationHeight;
				SimVar.SetSimVarValue('L:AIRLINER_ACC_ALT', 'Number', this._speedDirector.accelerationSpeedRestriction.altitude);
			}
		}
	}

	_recalculateOriginTransitionAltitude(origin: any): void {
		if (origin) {
			if (origin.infos instanceof AirportInfo) {
				if (isFinite(origin.infos.transitionAltitude)) {
					this.transitionAltitude = origin.infos.transitionAltitude;
				}
			}
		}
	}

	_recalculateDestinationTransitionAltitude(destination: any): void {
		if (destination) {
			if (destination.infos instanceof AirportInfo) {
				if (isFinite(destination.infos.transitionAltitude)) {
					this.perfApprTransAlt = destination.infos.transitionAltitude;
				}
			}
		}
	}

	setAPManagedSpeedMach(_mach: number, _aircraft): void {
		if (isFinite(_mach)) {
			if (Simplane.getAutoPilotMachModeActive()) {
				Coherent.call('AP_MACH_VAR_SET', 2, _mach);
				SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_ON', 'number', 1);
			}
		}
	}

	getThrustTakeOffTemp() {
		return this._thrustTakeOffTemp;
	}

	checkFmcPreFlight(): void {
		if (!this.dataHolder.preFlightDataHolder.finished) {
			this.dataHolder.preFlightDataHolder.thrustLim.assumedTemperature = (!!this.getThrustTakeOffTemp());
			this.dataHolder.preFlightDataHolder.thrustLim.completed = (this.dataHolder.preFlightDataHolder.thrustLim.assumedTemperature);

			this.dataHolder.preFlightDataHolder.takeOff.flaps = (!!this.getTakeOffFlap());
			this.dataHolder.preFlightDataHolder.takeOff.v1 = (!!this.speedManager.repository.v1Speed);
			this.dataHolder.preFlightDataHolder.takeOff.vR = (!!this.speedManager.repository.vRSpeed);
			this.dataHolder.preFlightDataHolder.takeOff.v2 = (!!this.speedManager.repository.v2Speed);
			this.dataHolder.preFlightDataHolder.takeOff.completed = (this.dataHolder.preFlightDataHolder.takeOff.v1 && this.dataHolder.preFlightDataHolder.takeOff.vR && this.dataHolder.preFlightDataHolder.takeOff.v2 && this.dataHolder.preFlightDataHolder.takeOff.flaps);

			this.dataHolder.preFlightDataHolder.perfInit.cruiseAltitude = (!!this.cruiseFlightLevel);
			this.dataHolder.preFlightDataHolder.perfInit.costIndex = (!!this.costIndex);
			this.dataHolder.preFlightDataHolder.perfInit.reserves = (!!this.getFuelReserves());
			this.dataHolder.preFlightDataHolder.perfInit.completed = (this.dataHolder.preFlightDataHolder.perfInit.cruiseAltitude && this.dataHolder.preFlightDataHolder.perfInit.costIndex && this.dataHolder.preFlightDataHolder.perfInit.reserves);

			this.dataHolder.preFlightDataHolder.route.origin = (!!this.flightPlanManager.getOrigin());
			this.dataHolder.preFlightDataHolder.route.destination = (!!this.flightPlanManager.getDestination());
			this.dataHolder.preFlightDataHolder.route.activated = true;
			this.dataHolder.preFlightDataHolder.route.completed = (this.dataHolder.preFlightDataHolder.route.activated && this.dataHolder.preFlightDataHolder.route.destination && this.dataHolder.preFlightDataHolder.route.origin);

			this.dataHolder.preFlightDataHolder.completed = (this.dataHolder.preFlightDataHolder.thrustLim.completed && this.dataHolder.preFlightDataHolder.takeOff.completed && this.dataHolder.preFlightDataHolder.perfInit.completed && this.dataHolder.preFlightDataHolder.route.completed);
		}
	}

	showFMCPreFlightComplete(airspeed: number): void {
		if (this.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF && airspeed < 80) {
			this.checkFmcPreFlight();
		} else {
			this.dataHolder.preFlightDataHolder.finished = true;
		}
	}

	/**
	 * TODO: This should be in FlightPhaseManager
	 */
	checkUpdateFlightPhase(): void {
		let airSpeed = Simplane.getTrueSpeed();
		this.showFMCPreFlightComplete(airSpeed);
		if (airSpeed > 10) {
			if (this.currentFlightPhase === 0) {
				this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_TAKEOFF;
			}
			if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_TAKEOFF) {
				let enterClimbPhase = false;
				let agl = Simplane.getAltitude();
				let altValue = isFinite(this.thrustReductionAltitude) ? this.thrustReductionAltitude : 1500;
				if (agl > altValue) {
					this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_CLIMB;
					enterClimbPhase = true;
				}
				if (enterClimbPhase) {
					let origin = this.flightPlanManager.getOrigin();
					if (origin) {
						origin.altitudeWasReached = Simplane.getAltitude();
						origin.timeWasReached = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
						origin.fuelWasReached = SimVar.GetSimVarValue('FUEL TOTAL QUANTITY', 'gallons') * SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms') / 1000;
					}
				}
			}
			if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
				let altitude = SimVar.GetSimVarValue('PLANE ALTITUDE', 'feet');
				let cruiseFlightLevel = this.cruiseFlightLevel * 100;
				if (isFinite(cruiseFlightLevel)) {
					if (altitude >= 0.96 * cruiseFlightLevel) {
						this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_CRUISE;
						Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);
					}
				}
			}
			if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {

				SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_CLIMB', 'number', 0);

				//console.log('TO TD: ' + SimVar.GetSimVarValue('L:WT_CJ4_TOD_REMAINING', 'number'));
				//console.log('DIS TD: ' + SimVar.GetSimVarValue('L:WT_CJ4_TOD_DISTANCE', 'number'));
				/**
				 * Basic TOD to destination
				 */
				let cruiseAltitude = SimVar.GetSimVarValue('L:AIRLINER_CRUISE_ALTITUDE', 'number');
				let showTopOfDescent = false;
				if (isFinite(cruiseAltitude)) {
					let destination = this.flightPlanManager.getDestination();
					if (destination) {
						let firstTODWaypoint = this.getWaypointForTODCalculation();
						if (firstTODWaypoint) {
							let totalDistance = 0;

							const destinationElevation = firstTODWaypoint.targetAltitude;
							const descentAltitudeDelta = Math.abs(destinationElevation - cruiseAltitude) / 100;
							const todDistance = descentAltitudeDelta / 3.3;
							const indicatedSpeed = Simplane.getIndicatedSpeed();
							let speedToLose = 0;
							if (indicatedSpeed > 220) {
								speedToLose = indicatedSpeed - 220;
							}

							const distanceForSpeedReducing = speedToLose / 10;

							totalDistance = todDistance + distanceForSpeedReducing + firstTODWaypoint.distanceFromDestinationToWaypoint;

							let todCoordinates = this.flightPlanManager.getCoordinatesAtNMFromDestinationAlongFlightPlan(totalDistance, true);
							let todLatLongAltCoordinates = new LatLongAlt(todCoordinates.lat, todCoordinates.long);
							let planeCoordinates = new LatLongAlt(SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'), SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude'));
							let distanceToTOD = Avionics.Utils.computeGreatCircleDistance(planeCoordinates, todLatLongAltCoordinates);


							SimVar.SetSimVarValue('L:WT_CJ4_TOD_REMAINING', 'number', distanceToTOD);
							SimVar.SetSimVarValue('L:WT_CJ4_TOD_DISTANCE', 'number', totalDistance);

							if (distanceToTOD < 50) {
								if (!SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number')) {
									SimVar.SetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number', 1);
									SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
								}
							}

							if (distanceToTOD > 1) {
								showTopOfDescent = true;
							} else {
								showTopOfDescent = false;
								let lastFlightPhase = this.currentFlightPhase;
								this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_DESCENT;
								Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.AUTO);
								if (lastFlightPhase !== FlightPhase.FLIGHT_PHASE_DESCENT) {
									SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
								}
							}

							if (showTopOfDescent) {
								SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_DSCNT', 'number', 1);
							} else {
								SimVar.SetSimVarValue('L:AIRLINER_FMS_SHOW_TOP_DSCNT', 'number', 0);
							}
						}
					}
				}
			}
			if (this.currentFlightPhase !== FlightPhase.FLIGHT_PHASE_APPROACH) {
				if (this.flightPlanManager.decelWaypoint) {
					let lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
					let long = Simplane.getCurrentLon();
					let planeLla = new LatLongAlt(lat, long);
					let dist = Avionics.Utils.computeGreatCircleDistance(this.flightPlanManager.decelWaypoint.infos.coordinates, planeLla);
					if (dist < 3) {
						this.tryGoInApproachPhase();
					}
				}
			}
			if (this.currentFlightPhase !== FlightPhase.FLIGHT_PHASE_APPROACH) {
				let destination = this.flightPlanManager.getDestination();
				if (destination) {
					let lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude');
					let long = Simplane.getCurrentLon();
					let planeLla = new LatLongAlt(lat, long);
					let dist = Avionics.Utils.computeGreatCircleDistance(destination.infos.coordinates, planeLla);
					if (dist < 20) {
						this.tryGoInApproachPhase();
					}
				}
			}
		}
		if (Simplane.getCurrentFlightPhase() != this.currentFlightPhase) {
			Simplane.setCurrentFlightPhase(this.currentFlightPhase);
			this.onFlightPhaseChanged();
		}
	}

	getWaypointForTODCalculation(): any {
		let getWaypoint = (allWaypoints) => {
			let onlyNonStrict = true;
			/**
			 * 0 - NO
			 * 1 - AT
			 * 2 - A
			 * 3 - B
			 * 4 - AB
			 */

			for (let i = 0; i <= allWaypoints.length - 1; i++) {
				if (allWaypoints[i].legAltitudeDescription === 0) {
					continue;
				}
				if (allWaypoints[i].legAltitudeDescription === 1 && isFinite(allWaypoints[i].legAltitude1)) {
					return {fix: allWaypoints[i], targetAltitude: Math.round(allWaypoints[i].legAltitude1)};
				}

				if (allWaypoints[i].legAltitudeDescription === 2 && isFinite(allWaypoints[i].legAltitude1)) {
					//continue;
					return {fix: allWaypoints[i], targetAltitude: Math.round(allWaypoints[i].legAltitude1)};
				}

				if (allWaypoints[i].legAltitudeDescription === 3 && isFinite(allWaypoints[i].legAltitude1)) {
					return {fix: allWaypoints[i], targetAltitude: Math.round(allWaypoints[i].legAltitude1)};
				}

				if (allWaypoints[i].legAltitudeDescription === 4 && isFinite(allWaypoints[i].legAltitude1) && isFinite(allWaypoints[i].legAltitude2)) {
					if (allWaypoints[i].legAltitude1 === allWaypoints[i].legAltitude2) {
						return {fix: allWaypoints[i], targetAltitude: Math.round(allWaypoints[i].legAltitude1)};
					}

					if (allWaypoints[i].legAltitude1 < allWaypoints[i].legAltitude2) {
						let middle = (allWaypoints[i].legAltitude2 - allWaypoints[i].legAltitude1) / 2;
						return {
							fix: allWaypoints[i],
							targetAltitude: Math.round(allWaypoints[i].legAltitude1 + middle)
						};
					}

					if (allWaypoints[i].legAltitude1 > allWaypoints[i].legAltitude2) {
						let middle = (allWaypoints[i].legAltitude1 - allWaypoints[i].legAltitude2) / 2;
						return {
							fix: allWaypoints[i],
							targetAltitude: Math.round(allWaypoints[i].legAltitude2 + middle)
						};
					}
				}
			}
			return undefined;
		};
		let waypoint = undefined;

		let destination = this.flightPlanManager.getDestination();
		if (destination) {
			let arrivalSegment = this.flightPlanManager.getCurrentFlightPlan().arrival;
			let approachSegment = this.flightPlanManager.getCurrentFlightPlan().approach;

			waypoint = getWaypoint(arrivalSegment.waypoints);

			if (!waypoint) {
				waypoint = getWaypoint(approachSegment.waypoints);
			}

			if (!waypoint) {
				waypoint = {
					fix: destination,
					targetAltitude: Math.round(parseFloat(destination.infos.oneWayRunways[0].elevation) * 3.28)
				};
			}

			if (waypoint) {
				if (approachSegment.waypoints.length > 0) {
					const cumulativeToApproach = approachSegment.waypoints[approachSegment.waypoints.length - 1].cumulativeDistanceInFP;
					waypoint.distanceFromDestinationToWaypoint = cumulativeToApproach - waypoint.fix.cumulativeDistanceInFP;
				} else {
					waypoint.distanceFromDestinationToWaypoint = destination.cumulativeDistanceInFP - waypoint.fix.cumulativeDistanceInFP;
				}
			}
		}

		return waypoint;
	}
}

BaseFMC.clrValue = 'DELETE';