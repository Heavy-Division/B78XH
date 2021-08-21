class Heavy_Boeing_FMC extends Boeing_FMC {
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
		super.onEvent(_event);
		console.log('B787_10_Heavy_Boeing_FMC onEvent ' + _event);
		if (_event.indexOf('AP_LNAV') != -1) {
			this._navModeSelector.onNavChangedEvent('NAV_PRESSED');
			//this.toggleLNAV();
		} else if (_event.indexOf('AP_VNAV') != -1) {
			//this._navModeSelector.onNavChangedEvent('VNAV_PRESSED');
			this.toggleVNAV();
		} else if (_event.indexOf('AP_FLCH') != -1) {
			//this._navModeSelector.onNavChangedEvent('FLC_PRESSED');
			this.toggleFLCH();
		} else if (_event.indexOf('AP_HEADING_HOLD') != -1) {
			this._navModeSelector.onNavChangedEvent('HDG_HOLD_PRESSED');
			//this.toggleHeadingHold();
		} else if (_event.indexOf('AP_HEADING_SEL') != -1) {
			this._navModeSelector.onNavChangedEvent('HDG_SEL_PRESSED');
			//this.activateHeadingSel();
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
			//this._navModeSelector.onNavChangedEvent('VS_PRESSED');
			this.toggleVSpeed();
		} else if (_event.indexOf('AP_ALT_INTERVENTION') != -1) {
			this._navModeSelector.onNavChangedEvent(NavModeEvent.ALT_INTERVENTION_PRESSED);
			//this.activateAltitudeSel();
		} else if (_event.indexOf('AP_ALT_HOLD') != -1) {
			this.toggleAltitudeHold();
		} else if (_event.indexOf('THROTTLE_TO_GA') != -1) {
			this.setAPSpeedHoldMode();
			if (this.aircraftType == Aircraft.AS01B)
				this.deactivateSPD();
			this.setThrottleMode(ThrottleMode.TOGA);
			if (Simplane.getIndicatedSpeed() > 80) {
				this.deactivateLNAV();
				this.deactivateVNAV();
			}
		} else if (_event.indexOf('EXEC') != -1) {
			this.onExec();
		}
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
}