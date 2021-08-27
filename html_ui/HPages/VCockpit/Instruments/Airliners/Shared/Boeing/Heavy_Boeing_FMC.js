class Heavy_Boeing_FMC extends Boeing_FMC {


	setTakeOffFlap(s) {
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
				this.clearVSpeeds();
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

	toggleSpeedIntervention() {
		if (this.getIsSpeedInterventionActive()) {
			this.deactivateSpeedIntervention();
		} else {
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

	deactivateSpeedIntervention() {
		this._isSpeedInterventionActive = false;
		SimVar.SetSimVarValue('L:AP_SPEED_INTERVENTION_ACTIVE', 'number', 0);
		if (this.getIsVNAVActive()) {
			SimVar.SetSimVarValue('K:SPEED_SLOT_INDEX_SET', 'number', 2);
		}
	}

	activateSPD() {
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


	doActivateSPD() {
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

	deactivateSPD() {
		SimVar.SetSimVarValue('L:AP_SPD_ACTIVE', 'number', 0);
		this._isSPDActive = false;
		this._pendingSPDActivation = false;
	}


	constructor() {
		super(...arguments);
		this._fpHasChanged = false;
		this._activatingDirectTo = false;

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
		this._isMainRouteActivated = false;

		/**
		 * TODO: This should be moved to custom system class for observing
		 * @type {{route: {origin: boolean, destination: boolean, completed: boolean, activated: boolean}, takeoff: {flaps: boolean, completed: boolean, v1: boolean, vR: boolean, v2: boolean}, perfInit: {cruiseAltitude: boolean, costIndex: boolean, reserves: boolean, completed: boolean}, thrust: {takeOffTemp: boolean, completed: boolean}, finished: boolean, completed: boolean}}
		 */
		this.fmcPreFlightComplete = {
			completed: false,
			finished: false,
			thrust: {
				completed: false,
				takeOffTemp: false
			},
			takeoff: {
				completed: false,
				flaps: false,
				v1: false,
				vR: false,
				v2: false
			},
			perfInit: {
				completed: false,
				cruiseAltitude: false,
				costIndex: false,
				reserves: false
			},
			route: {
				completed: false,
				origin: false,
				destination: false,
				activated: false
			}
		};

		this._alertingMessages = [];
	}

	Init() {
		super.Init();
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
	}

	activateRoute(directTo = false, callback = EmptyCallback.Void) {
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

	eraseRouteModifications() {
		this.fpHasChanged = false;
		this._activatingDirectTo = false;
		this._isRouteActivated = false;
		SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'number', 0);
	}

	activateMainRoute() {
		console.log('activate main route');
		this._isMainRouteActivated = true;
		this.activateRoute();
	}

	//function added to set departure enroute transition index
	setDepartureEnrouteTransitionIndex(departureEnrouteTransitionIndex, callback = EmptyCallback.Boolean) {
		this.ensureCurrentFlightPlanIsTemporary(() => {
			this.flightPlanManager.setDepartureEnRouteTransitionIndex(departureEnrouteTransitionIndex, () => {
				callback(true);
			});
		});
	}

	//function added to set arrival runway transition index
	setArrivalRunwayTransitionIndex(arrivalRunwayTransitionIndex, callback = EmptyCallback.Boolean) {
		this.ensureCurrentFlightPlanIsTemporary(() => {
			this.flightPlanManager.setArrivalRunwayIndex(arrivalRunwayTransitionIndex, () => {
				callback(true);
			});
		});
	}

	setArrivalAndRunwayIndex(arrivalIndex, enrouteTransitionIndex, callback = EmptyCallback.Boolean) {
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

	onEvent(_event) {
		console.log('B787_10_Heavy_Boeing_FMC onEvent ' + _event);

		if (_event.indexOf('AP_LNAV') != -1) {
			this._navModeSelector.onNavChangedEvent('NAV_PRESSED');
			return;
			//this.toggleLNAV();
		} else if (_event.indexOf('AP_HEADING_HOLD') != -1) {
			this._navModeSelector.onNavChangedEvent('HDG_HOLD_PRESSED');
			return;
			//this.toggleHeadingHold();
		} else if (_event.indexOf('AP_HEADING_SEL') != -1) {
			this._navModeSelector.onNavChangedEvent('HDG_SEL_PRESSED');
			return;
			//this.activateHeadingSel();
		} else if (_event.indexOf('AP_ALT_INTERVENTION') != -1) {
			this._navModeSelector.onNavChangedEvent(NavModeEvent.ALT_INTERVENTION_PRESSED);
			return;
			//this.activateAltitudeSel();
		}

		/**
		 * TODO: Move this to ELSE???
		 */
		super.onEvent(_event);
	}

	/**
	 * Registers a periodic page refresh with the FMC display.
	 * @param {number} interval The interval, in ms, to run the supplied action.
	 * @param {function} action An action to run at each interval. Can return a bool to indicate if the page refresh should stop.
	 * @param {boolean} runImmediately If true, the action will run as soon as registered, and then after each
	 * interval. If false, it will start after the supplied interval.
	 */
	registerPeriodicPageRefresh(action, interval, runImmediately) {
		this.unregisterPeriodicPageRefresh();

		const refreshHandler = () => {
			const isBreak = action();
			if (isBreak) {
				return;
			}
			this._pageRefreshTimer = setTimeout(refreshHandler, interval);
		};

		if (runImmediately) {
			refreshHandler();
		} else {
			this._pageRefreshTimer = setTimeout(refreshHandler, interval);
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

	setTemplate(template) {
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
	 * @returns {string}
	 */
	makeSettable(content) {
		return '[settable]' + content + '[/settable]';
	}

	/**
	 * Convert/set text to colored text
	 * @param content
	 * @param color
	 * @returns {string}
	 */
	colorizeContent(content, color) {
		console.log('colorizing');
		return '[color=' + color + ']' + content + '[/color]';
	}

	/**
	 * Convert/set text size
	 * @param content
	 * @param size
	 * @returns {string}
	 */
	resizeContent(content, size) {
		return '[size=' + size + ']' + content + '[/size]';
	}

	/**
	 * setTitle with settable/size/color support
	 * @param content
	 */
	setTitle(content) {
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
		this._titleElement.classList.remove('white', 'blue', 'yellow', 'green', 'red');
		this._titleElement.classList.add(color);
		this._titleElement.innerHTML = this._title;
	}

	/**
	 * setlabel with settable/size/color support
	 * @param content
	 */
	setLabel(label, row, col = -1) {
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
			e.classList.remove('white', 'blue', 'yellow', 'green', 'red');
			e.classList.add(color);
			label = label.split('[color]')[0];
		}
		this._labels[row][col] = label;
		this._labelElements[row][col].innerHTML = label;
	}

	/**
	 * setline with settable/size/color support
	 * @param content
	 */
	setLine(content, row, col = -1) {
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
		this._lineElements[row][col].innerHTML = this._lines[row][col];
	}

	trySetTransAltitude(s) {
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
	trySetAccelerationHeight(s) {
		let accelerationHeight = parseInt(s);
		let origin = this.flightPlanManager.getOrigin();
		if (origin) {
			if (isFinite(accelerationHeight)) {
				let elevation = Math.round(parseFloat(origin.infos.oneWayRunways[0].elevation) * 3.28);
				let roundedHeight = Math.round(accelerationHeight / 100) * 100;
				if (this.trySetAccelerationAltitude(roundedHeight + elevation)) {
					this._speedDirector._accelerationSpeedRestriction.accelerationHeight = roundedHeight;
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
	trySetAccelerationAltitude(s) {
		let accelerationHeight = parseInt(s);
		if (isFinite(accelerationHeight)) {
			this._speedDirector._accelerationSpeedRestriction.altitude = accelerationHeight;
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
	trySetThrustReductionHeight(s) {
		let thrustReductionHeight = parseInt(s);
		let origin = this.flightPlanManager.getOrigin();
		if (origin) {
			if (isFinite(thrustReductionHeight)) {
				let elevation = Math.round(parseFloat(origin.infos.oneWayRunways[0].elevation) * 3.28);
				let roundedHeight = Math.round(thrustReductionHeight / 100) * 100;
				if (this.trySetThrustReductionAltitude(roundedHeight + elevation)) {
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
	trySetThrustReductionAltitude(s) {
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
	recalculateTHRRedAccTransAlt() {
		/**
		 * TODO: HotFix!!! Need to be fixed in future... SpeedDirector is not normally accessible from here
		 */
		if (this._speedDirector === undefined) {
			this._speedDirector = new SpeedDirector(this);
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
	_recalculateThrustReductionAltitude(origin) {
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
	_recalculateAccelerationAltitude(origin) {
		if (origin) {
			if (origin.infos instanceof AirportInfo) {
				const elevation = Math.round(parseFloat(origin.infos.oneWayRunways[0].elevation) * 3.28);
				this._speedDirector._accelerationSpeedRestriction.altitude = elevation + this._speedDirector._accelerationSpeedRestriction.accelerationHeight;
				SimVar.SetSimVarValue('L:AIRLINER_ACC_ALT', 'Number', this._speedDirector._accelerationSpeedRestriction.altitude);
			}
		}
	}

	_recalculateOriginTransitionAltitude(origin) {
		if (origin) {
			if (origin.infos instanceof AirportInfo) {
				if (isFinite(origin.infos.transitionAltitude)) {
					this.transitionAltitude = origin.infos.transitionAltitude;
				}
			}
		}
	}

	_recalculateDestinationTransitionAltitude(destination) {
		if (destination) {
			if (destination.infos instanceof AirportInfo) {
				if (isFinite(destination.infos.transitionAltitude)) {
					this.perfApprTransAlt = destination.infos.transitionAltitude;
				}
			}
		}
	}

	setAPManagedSpeedMach(_mach, _aircraft) {
		if (isFinite(_mach)) {
			if (Simplane.getAutoPilotMachModeActive()) {
				Coherent.call('AP_MACH_VAR_SET', 2, _mach);
				SimVar.SetSimVarValue('K:AP_MANAGED_SPEED_IN_MACH_ON', 'number', 1);
			}
		}
	}
}