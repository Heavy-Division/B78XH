Include.addScript('/Heavy/Utils/HeavyDataStorage.js');
Include.addScript('/B78XH/Enums/B78XH_LocalVariables.js');

class B787_10_FMC_SimRateManagerPage {

	constructor(fmc) {
		this.fmc = fmc;
		this.isSimRateManagerActive = false;
		this.autoRateMode = ['OFF', 'LINEAR', 'NORMAL', 'AGGRESSIVE'];
		this.activeAutoRateMode = 2;
		this.isEditActivatedForAutoRateMode = false;
		this.linearModeRate = 4;
	}

	static get managedIntervalId() {
		return this._managedIntervalId || NaN;
	}

	static set managedIntervalId(id) {
		this._managedIntervalId = id;
	}

	static get slowDownIntervalId() {
		return this._slowDownIntervalId || NaN;
	}

	static set slowDownIntervalId(id) {
		this._slowDownIntervalId = id;
	}

	static get emergencyShutdown() {
		return this._emergencyShutdown || false;
	}

	static set emergencyShutdown(state) {
		this._emergencyShutdown = state;
	}

	static get emergencyShutdownTime() {
		return this._emergencyShutdownTime || null;
	}

	static set emergencyShutdownTime(time) {
		this._emergencyShutdownTime = time;
	}

	static get emergencyIntervalId() {
		return this._emergencyIntervalId || NaN;
	}

	static set emergencyIntervalId(id) {
		this._emergencyIntervalId = id;
	}

	static get MODE() {
		return {'SLOW_DOWN': 'SLOW_DOWN', 'PAUSE': 'PAUSE'};
	}

	showPageModeEditing() {
		this.fmc.clearDisplay();
		let mode = HeavyDataStorage.get('SIM_RATE_MODE', B787_10_FMC_SimRateManagerPage.MODE.SLOW_DOWN);
		let modeString;
		switch (mode) {
			case B787_10_FMC_SimRateManagerPage.MODE.SLOW_DOWN:
				modeString = 'SLOW DOWN';
				break;
			case B787_10_FMC_SimRateManagerPage.MODE.PAUSE:
				modeString = 'PAUSE';
				break;
		}

		let rows = [['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', '']];
		rows[1][0] = 'MODE';
		rows[2][0] = modeString;
		rows[4][0] = '<SLOW DOWN[s-text]';
		rows[6][0] = '<PAUSE[s-text]';
		rows[12][0] = '<BACK';

		this.fmc.onLeftInput[1] = () => {
			HeavyDataStorage.set('SIM_RATE_MODE', B787_10_FMC_SimRateManagerPage.MODE.SLOW_DOWN)
			this.showPage();
		};

		this.fmc.onLeftInput[2] = () => {
			HeavyDataStorage.set('SIM_RATE_MODE', B787_10_FMC_SimRateManagerPage.MODE.PAUSE)
			this.showPage();
		};

		this.fmc.onLeftInput[5] = () => {
			this.showPage();
		};

		this.fmc.setTemplate(rows);
		this.fmc.updateSideButtonActiveStatus();
	}

	/**
	 * Default page
	 */
	showPage() {
		this.fmc.clearDisplay();
		if (!isFinite(B787_10_FMC_SimRateManagerPage.emergencyIntervalId) && B787_10_FMC_SimRateManagerPage.emergencyShutdownTime) {
			this.activateEmergencyShutdown();
		}

		let mode = HeavyDataStorage.get('SIM_RATE_MODE', B787_10_FMC_SimRateManagerPage.MODE.SLOW_DOWN);
		let modeString;
		switch (mode) {
			case B787_10_FMC_SimRateManagerPage.MODE.SLOW_DOWN:
				modeString = 'SLOW DOWN';
				break;
			case B787_10_FMC_SimRateManagerPage.MODE.PAUSE:
				modeString = 'PAUSE';
				break;
		}

		let rows = [['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', '']]
		rows[0][0] = 'SIM RATE MANAGER';
		rows[1][0] = 'MODE';
		rows[2][0] = modeString;
		rows[1][1] = 'AUTO RATE';
		rows[2][1] = this.autoRateMode[this.activeAutoRateMode];
		rows[2][3] = (this.isSimRateManagerActive ? '<ACT>' : '<SEL>');
		rows[8][0] = '<UNPAUSE';
		rows[10][0] = '<EMERGENCY SHUTDOWN';
		rows[12][0] = '<BACK';
		rows[12][1] = (isFinite(B787_10_FMC_SimRateManagerPage.managedIntervalId) ? '<DEACTIVATE' : '<ACTIVATE');

		this.prepareEventsForDefaultPage();
		this.fmc.setTemplate(rows);
		this.fmc.updateSideButtonActiveStatus();
	}

	/**
	 * Default page events
	 */
	prepareEventsForDefaultPage() {
		this.fmc.onLeftInput[0] = () => {
			this.showPageModeEditing();
		};
		this.fmc.onRightInput[0] = () => {
			this.isEditActivatedForAutoRateMode = true;
			this.showPageRateModeEditing();
		};
		this.fmc.onLeftInput[3] = () => {
			SimVar.SetSimVarValue('K:PAUSE_SET', 'Boolean', 0);
			this.showPage();
		};

		this.fmc.onLeftInput[4] = () => {
			B787_10_FMC_SimRateManagerPage.managedIntervalId = NaN;
			B787_10_FMC_SimRateManagerPage.slowDownIntervalId = NaN;
			B787_10_FMC_SimRateManagerPage.emergencyShutdownTime = performance.now();
			B787_10_FMC_SimRateManagerPage.emergencyShutdown = true;
			this.showPageEmergencyShutdown();
		};

		this.fmc.onLeftInput[5] = () => {
			B787_10_FMC_HeavyPage.ShowPage1(this.fmc);
		};

		this.fmc.onRightInput[5] = () => {
			if (isFinite(B787_10_FMC_SimRateManagerPage.managedIntervalId)) {
				this.deactivateAutoRate(false);
			} else {
				this.activateAutoRate();
			}
		};
	}

	/**
	 * Rate editing page
	 */
	showPageRateModeEditing() {
		let rows = [['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', '']]
		rows[0][0] = 'SIM RATE MANAGER';
		rows[1][1] = 'AUTO RATE';
		rows[2][1] = this.autoRateMode[this.activeAutoRateMode];
		rows[2][3] = (this.isSimRateManagerActive ? '<ACT>' : '<SEL>');
		rows[12][0] = '<BACK';

		let rowIndex = 2;

		for (let i = 0; i < this.autoRateMode.length; i++) {
			rows[rowIndex * 2] = ['', '<' + this.autoRateMode[i] + '[s-text]'];
			this.prepareEventsForRateModeEditingPage(rowIndex - 1, i);
			rowIndex++;
		}

		this.fmc.setTemplate(rows);
		this.fmc.updateSideButtonActiveStatus();
	}

	/**
	 * Rate editing page events
	 */
	prepareEventsForRateModeEditingPage(rowIndex, modeIndex) {
		this.fmc.onRightInput[rowIndex] = () => {
			this.activeAutoRateMode = modeIndex;
			this.isEditActivatedForAutoRateMode = false;
			this.showPage();
		};

		this.fmc.onRightInput[0] = () => {
			this.isEditActivatedForAutoRateMode = false;
			this.showPage();
		};
	}

	/**
	 * Emergency shutdown page
	 */
	showPageEmergencyShutdown() {
		if (!isFinite(B787_10_FMC_SimRateManagerPage.emergencyIntervalId) && B787_10_FMC_SimRateManagerPage.emergencyShutdownTime) {
			this.activateEmergencyShutdown();
		}
		let seconds = (((B787_10_FMC_SimRateManagerPage.emergencyShutdownTime && B787_10_FMC_SimRateManagerPage.emergencyShutdownTime + 5000) - performance.now()) / 1000).toFixed(2);
		seconds = (seconds > 0 ? seconds : '');

		let rows = [['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', ''], ['', '']]
		rows[0][0] = 'SIM RATE MANAGER';
		rows[6][2] = 'EMERGENCY SHUTDOWN ACTIVE[color]red';
		rows[7][2] = seconds + '[color]red';
		rows[12][0] = '<BACK';
		rows[12][1] = (B787_10_FMC_SimRateManagerPage.emergencyShutdownTime && B787_10_FMC_SimRateManagerPage.emergencyShutdownTime + 5000 > performance.now() ? '' : '<DEACTIVATE');

		this.prepareEventsForEmergencyShutdownPage();

		this.fmc.setTemplate(rows);
		this.fmc.updateSideButtonActiveStatus();
	}

	/**
	 * Emergency shutdown page events
	 */
	prepareEventsForEmergencyShutdownPage() {
		this.fmc.onLeftInput[5] = () => {
			B787_10_FMC_HeavyPage.ShowPage1(this.fmc);
		};
		if (!(B787_10_FMC_SimRateManagerPage.emergencyShutdownTime && B787_10_FMC_SimRateManagerPage.emergencyShutdownTime + 5000 > performance.now())) {
			this.fmc.onRightInput[5] = () => {
				B787_10_FMC_SimRateManagerPage.emergencyShutdownTime = null;
				B787_10_FMC_SimRateManagerPage.emergencyShutdown = false;
				this.showPage();
			};
		}
	}

	/**
	 * Activate emergency shutdown
	 *
	 * This function will start interval of emergency shutdown ("protect" FMC from inputs for 6 seconds)
	 * The interval switch back to emergency shutdown page every 100 milliseconds when user try to leave emergency shutdown page.
	 * User is able to deactivate emergency shutdown after 6 seconds or leave page without deactivating emergency shutdown.
	 */
	activateEmergencyShutdown() {
		let interval = {};
		interval.id = setInterval(this.emergencyInterval.bind(this, interval), 100);
		B787_10_FMC_SimRateManagerPage.emergencyIntervalId = interval.id;
	}

	/**
	 * Emergency shutdown loop logic
	 *
	 * Protect FMC from user inputs (leaving emergency shutdown page). Interval is self-destroyed after 6 seconds.
	 * Need to be here and not in anonymous function because of binding interval ids for self-destroying.
	 */
	emergencyInterval(interval) {
		let thisIntervalId = interval.id;
		if (!(B787_10_FMC_SimRateManagerPage.emergencyShutdownTime && B787_10_FMC_SimRateManagerPage.emergencyShutdownTime + 6000 > performance.now())) {
			clearInterval(thisIntervalId);
			B787_10_FMC_SimRateManagerPage.emergencyShutdownTime = null;
			B787_10_FMC_SimRateManagerPage.emergencyIntervalId = NaN;
		} else {
			this.showPageEmergencyShutdown();
		}
	}

	/**
	 * Activate Auto Rate
	 *
	 * This function will start interval of auto rate
	 */
	activateAutoRate() {
		SimVar.SetSimVarValue(B78XH_LocalVariables.SIM_RATE_MANAGER.ACTIVATED, 'Boolean', 1).then(() => {
				let interval = {};
				interval.id = setInterval(this.autoRateInterval.bind(this, interval), 4000);
				B787_10_FMC_SimRateManagerPage.managedIntervalId = interval.id;
				this.showPage();
			}
		);
	}

	/**
	 * Auto Rate loop logic (activation)
	 *
	 * Manage sim rate during flight and deactivate auto rate when TOD or DECEL is reached.
	 * Need to be here and not in anonymous function because of binding interval ids for self-destroying.
	 * Interval will self-destruct after emergency shutdown activation.
	 */
	autoRateInterval(interval) {
		let thisIntervalId = interval.id;
		if (B787_10_FMC_SimRateManagerPage.emergencyShutdown === true) {
			clearInterval(thisIntervalId);
			return;
		}

		let activated = SimVar.GetSimVarValue(B78XH_LocalVariables.SIM_RATE_MANAGER.ACTIVATED, 'Boolean');
		if (activated) {

			if (this.shouldDeactivateBecauseOfTOD() || this.shouldDeactivateBecauseOfDecel()) {
				this.deactivateAutoRate();
			}

			let actualSimRate = SimVar.GetGlobalVarValue('SIMULATION RATE', 'Number');
			switch (this.activeAutoRateMode) {
				case 0:
					break;
				case 1:
					this.executeLinearMode(actualSimRate);
					break;
				case 2:
					this.executeNormalMode(actualSimRate);
					break;
				case 3:
					this.executeAggressiveMode(actualSimRate);
					break;
				default:
					break;
			}
		} else {
			clearInterval(B787_10_FMC_SimRateManagerPage.managedIntervalId);
			B787_10_FMC_SimRateManagerPage.managedIntervalId = NaN;
		}
	}

	/**
	 * Return true if DECEL waypoint is reached
	 */
	shouldDeactivateBecauseOfDecel() {
		if (SimVar.GetSimVarValue('L:FLIGHTPLAN_USE_DECEL_WAYPOINT', 'number') === 1) {
			if (this.fmc.flightPlanManager.decelWaypoint) {
				let planeCoordinates = new LatLong(SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'), SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude'));
				let dist = Avionics.Utils.computeGreatCircleDistance(this.fmc.flightPlanManager.decelWaypoint.infos.coordinates, planeCoordinates);
				if (dist < 15) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Return true if TOD is reached
	 */
	shouldDeactivateBecauseOfTOD() {
		let currentAltitude = Simplane.getAltitude();
		let nextWaypoint = this.fmc.flightPlanManager.getActiveWaypoint();
		if (nextWaypoint && (nextWaypoint.legAltitudeDescription === 3 || nextWaypoint.legAltitudeDescription === 4)) {
			let targetAltitude = nextWaypoint.legAltitude1;
			if (nextWaypoint.legAltitudeDescription === 4) {
				targetAltitude = Math.max(nextWaypoint.legAltitude1, nextWaypoint.legAltitude2);
			}
			if (currentAltitude > targetAltitude + 40) {
				return true;
			}
		}
		return false;
	}

	executeLinearMode(actualSimRate) {
		if (actualSimRate < this.linearModeRate) {
			SimVar.SetSimVarValue('K:SIM_RATE_INCR', 'number', 1);
		}
		if (actualSimRate > this.linearModeRate) {
			SimVar.SetSimVarValue('K:SIM_RATE_DECR', 'number', 1);
		}
	}

	executeNormalMode(actualSimRate) {
		let planeCoordinates = new LatLong(SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'), SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude'));
		let previousWaypoint = this.fmc.flightPlanManager.getPreviousActiveWaypoint();
		let nextWaypoint = this.fmc.flightPlanManager.getActiveWaypoint();
		let previousDistance = Avionics.Utils.computeGreatCircleDistance(previousWaypoint.infos.coordinates, planeCoordinates);
		let nextDistance = Avionics.Utils.computeGreatCircleDistance(nextWaypoint.infos.coordinates, planeCoordinates);
		if (actualSimRate > 4) {
			let newActualSimRate = SimVar.GetGlobalVarValue('SIMULATION RATE', 'Number');
			while (newActualSimRate > 4) {
				SimVar.SetSimVarValue('K:SIM_RATE_DECR', 'number', 1);
			}
		}
		if (nextDistance < 5 || previousDistance < 3) {
			if (actualSimRate > 2) {
				SimVar.SetSimVarValue('K:SIM_RATE_DECR', 'number', 1);
			}
		} else {
			if (actualSimRate < 4) {
				SimVar.SetSimVarValue('K:SIM_RATE_INCR', 'number', 1);
			}
		}
	}

	executeAggressiveMode(actualSimRate) {
		let planeCoordinates = new LatLong(SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'), SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude'));
		let previousWaypoint = this.fmc.flightPlanManager.getPreviousActiveWaypoint();
		let nextWaypoint = this.fmc.flightPlanManager.getActiveWaypoint();
		let previousDistance = Avionics.Utils.computeGreatCircleDistance(previousWaypoint.infos.coordinates, planeCoordinates);
		let nextDistance = Avionics.Utils.computeGreatCircleDistance(nextWaypoint.infos.coordinates, planeCoordinates);

		if (nextDistance < 9 || previousDistance < 3) {
			if (actualSimRate > 4) {
				SimVar.SetSimVarValue('K:SIM_RATE_DECR', 'number', 1);
			}
		} else {
			if (actualSimRate < 8) {
				SimVar.SetSimVarValue('K:SIM_RATE_INCR', 'number', 1);
			}
		}
	}

	/**
	 * Activate Auto Rate
	 *
	 * This function will start interval of auto rate deactivation
	 */
	deactivateAutoRate(autoDeactivation = true) {
		SimVar.SetSimVarValue(B78XH_LocalVariables.SIM_RATE_MANAGER.ACTIVATED, 'Boolean', 0).then(() => {
			let interval = {};
			interval.id = setInterval(this.autoRateIntervalDeactivation.bind(this, interval, autoDeactivation), 1000);
			B787_10_FMC_SimRateManagerPage.slowDownIntervalId = interval.id;
			clearInterval(B787_10_FMC_SimRateManagerPage.managedIntervalId);
			B787_10_FMC_SimRateManagerPage.managedIntervalId = NaN;
			this.showPage();
		});
	}

	/**
	 * Auto Rate loop logic (deactivation)
	 *
	 * Change sim rate to value 1. Interval will self-destruct when sim rate reach 1.
	 * Need to be here and not in anonymous function because of binding interval ids for self-destroying.
	 * Interval will self-destruct after emergency shutdown activation.
	 */
	autoRateIntervalDeactivation(interval, autoDeactivation = false) {
		let thisIntervalId = interval.id;
		if (B787_10_FMC_SimRateManagerPage.emergencyShutdown === true) {
			clearInterval(thisIntervalId);
			return;
		}

		let actualSimRate = SimVar.GetGlobalVarValue('SIMULATION RATE', 'Number');
		if (actualSimRate > 1) {
			SimVar.SetSimVarValue('K:SIM_RATE_DECR', 'number', 1);
		} else {
			clearInterval(thisIntervalId);
			B787_10_FMC_SimRateManagerPage.slowDownIntervalId = NaN;
			if (HeavyDataStorage.get('SIM_RATE_MODE', B787_10_FMC_SimRateManagerPage.MODE.SLOW_DOWN) === B787_10_FMC_SimRateManagerPage.MODE.PAUSE) {
				SimVar.SetSimVarValue('K:PAUSE_SET', 'Boolean', 1);
			}
		}
	}
}