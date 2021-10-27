class B787_10_FMC_VNAVPage {
	private fmc: B787_10_FMC;
	private enforcedPage: any;

	constructor(fmc: B787_10_FMC) {
		this.fmc = fmc;
		this.enforcedPage = null;
	}

	showPage() {

		switch (this.enforcedPage) {
			case 1:
				this.showPage1();
				return;
			case 2:
				this.showPage2();
				return;
			case 3:
				this.showPage3();
				return;
		}


		if (this.fmc.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_CLIMB) {
			this.showPage1();
		} else if (this.fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
			this.showPage2();
		} else if (this.fmc.currentFlightPhase >= FlightPhase.FLIGHT_PHASE_DESCENT) {
			this.showPage3();
		} else {
			this.showPage1();
		}
	}

	getClimbPageTitle() {
		let cell = '';
		switch (this.fmc._speedDirector.commandedSpeedType) {
			case SpeedType.SPEED_TYPE_RESTRICTION:
				if (this.fmc._speedDirector._climbSpeedRestriction) {
					cell = cell + fastToFixed(this.fmc._speedDirector._climbSpeedRestriction.speed) + 'KT ';
				}
				break;
			case SpeedType.SPEED_TYPE_TRANSITION:
				cell = cell + fastToFixed(this.fmc.getCrzManagedSpeed(), 0) + 'KT';
				break;
			case SpeedType.SPEED_TYPE_SELECTED:
				let selectedClimbSpeed = fastToFixed(this.fmc._speedDirector._climbSpeedSelected.speed) || '';
				cell = cell + selectedClimbSpeed + 'KT';
				break;
			case SpeedType.SPEED_TYPE_ECON:
				cell = cell + 'ECON';
				break;
			default:
				cell = cell + 'ECON';
		}

		return cell;
	}

	getClimbCruiseAltitudeCell() {
		let cell = '□□□□□';

		let departureWaypoints = this.fmc.flightPlanManager.getDepartureWaypointsMap();

		let commandedAltitudeCruise = true;
		if (departureWaypoints) {
			departureWaypoints.forEach((waypoint) => {
				if (waypoint && waypoint.legAltitudeDescription === 3) {
					commandedAltitudeCruise = false;
				}
			});
		}

		if (this.fmc.cruiseFlightLevel) {
			cell = 'FL' + this.fmc.cruiseFlightLevel;
			if (commandedAltitudeCruise && this.fmc.getIsVNAVActive()) {
				cell = this.fmc.colorizeContent(cell, 'magenta');
			}
		}

		if (cell) {
			cell = this.fmc.makeSettable(cell);
		}

		return cell;
	}

	getClimbSpeedRestrictionCell() {
		let cell = '---/-----';
		let speedRestrictionSpeedValue = '';
		let speedRestrictionAltitudeValue = '';

		/**
		 * TODO better type check (remove double retyping )
		 */

		if (this.fmc._speedDirector._climbSpeedRestriction) {
			speedRestrictionSpeedValue = String(this.fmc._speedDirector._climbSpeedRestriction.speed) || '';
			speedRestrictionAltitudeValue = String(this.fmc._speedDirector._climbSpeedRestriction.altitude) || '';
		}

		if (speedRestrictionSpeedValue && isFinite(Number(speedRestrictionSpeedValue)) && speedRestrictionAltitudeValue && isFinite(Number(speedRestrictionAltitudeValue))) {
			if (this.fmc._speedDirector.commandedSpeedType === SpeedType.SPEED_TYPE_RESTRICTION && this.fmc._speedDirector.speedPhase === SpeedPhase.SPEED_PHASE_CLIMB && this.fmc.getIsVNAVActive()) {
				speedRestrictionSpeedValue = this.fmc.colorizeContent(speedRestrictionSpeedValue, 'magenta');
			}
			cell = speedRestrictionSpeedValue + '/' + speedRestrictionAltitudeValue;
		}
		cell = this.fmc.makeSettable(cell);
		return cell;
	}

	getClimbSpeedTransitionCell() {
		let cell = '';
		if (this.fmc._speedDirector._climbSpeedTransition.isDeleted || Simplane.getAltitude() > 10000) {
			return '';
		}
		let speed = this.fmc._speedDirector._climbSpeedTransition.speed;
		if (isFinite(speed)) {
			cell = fastToFixed(speed, 0);
		}

		if (this.fmc._speedDirector.commandedSpeedType === SpeedType.SPEED_TYPE_TRANSITION && this.fmc._speedDirector.speedPhase === SpeedPhase.SPEED_PHASE_CLIMB && this.fmc.getIsVNAVActive()) {
			cell = this.fmc.colorizeContent(cell, 'magenta');
		}

		cell = cell + '/10000';

		return cell;
	}

	getClimbTransitionAltitudeCell() {
		return this.fmc.makeSettable(fastToFixed(this.fmc.transitionAltitude, 0));
	}

	getSelectedClimbSpeedCell() {
		let selectedClimbSpeed = this.fmc._speedDirector._climbSpeedSelected.speed || NaN;
		let cell = '';
		if (selectedClimbSpeed && isFinite(selectedClimbSpeed)) {
			cell = selectedClimbSpeed + '';
		}

		if (this.fmc._speedDirector.commandedSpeedType === SpeedType.SPEED_TYPE_SELECTED && this.fmc._speedDirector.speedPhase === SpeedPhase.SPEED_PHASE_CLIMB && this.fmc.getIsVNAVActive()) {
			cell = this.fmc.colorizeContent(cell, 'magenta');
		}

		if (cell) {
			cell = this.fmc.makeSettable(cell);
		}
		return cell;
	}

	getEconClimbPromptCell() {
		let selectedClimbSpeed = this.fmc._speedDirector._climbSpeedSelected.speed || NaN;
		return (selectedClimbSpeed && isFinite(selectedClimbSpeed)) ? '<ECON' : '';
	}

	getEconClimbSpeedCell() {
		let cell = '';

		let speedNumber = this.fmc._speedDirector._resolveMachKias(this.fmc._speedDirector._climbSpeedEcon);
		let isMach = false;
		if (speedNumber < 1 && speedNumber > 0) {
			isMach = true;
		}

		if (isMach) {
			let mach = fastToFixed(speedNumber, 3);
			if (mach.charAt(0) === '0') {
				mach = mach.substring(1);
			}
			cell = mach;
		} else {
			cell = fastToFixed(speedNumber, 0);
		}

		if (this.fmc._speedDirector.commandedSpeedType === SpeedType.SPEED_TYPE_ECON && this.fmc._speedDirector.speedPhase === SpeedPhase.SPEED_PHASE_CLIMB && this.fmc.getIsVNAVActive()) {
			cell = this.fmc.colorizeContent(cell, 'magenta');
		}
		if (cell) {
			cell = this.fmc.makeSettable(cell);
		}
		return cell;
	}

	setupClimbPageEvents() {
		/**
		 * Left side
		 */
		this.fmc.onLeftInput[0] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();
			if (this.fmc.setCruiseFlightLevelAndTemperature(value)) {
				this.showPage1();
			}
		};

		this.fmc.onLeftInput[1] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();

			let storeToFMC = async (value, force = false) => {
				if (HeavyInput.Validators.speedRange(value) || force) {
					this.fmc._speedDirector._climbSpeedSelected.speed = value;
				}
			};

			if (value === 'DELETE') {
				this.fmc.inOut = '';
				storeToFMC(null, true).then(() => {
					this.showPage1();
				});
			}

			if (value.length > 0) {
				storeToFMC(value).then(() => {
					this.showPage1();
				});
			}

		};

		if (!this.fmc._speedDirector._climbSpeedTransition.isDeleted) {
			this.fmc.onLeftInput[2] = () => {
				let value = this.fmc.inOut;
				this.fmc.clearUserInput();
				if (value === 'DELETE') {
					this.fmc.inOut = '';
					this.fmc._speedDirector._climbSpeedTransition.isDeleted = true;
					SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
					return;
				}

				if (value.length > 0) {
					this.fmc.showErrorMessage(this.fmc.defaultInputErrorMessage);
					SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
				}
			};
		}

		this.fmc.onLeftInput[3] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();

			if (value === 'DELETE') {
				this.fmc.inOut = '';
				value = '';
				this.fmc._speedDirector._climbSpeedRestriction.speed = null;
				this.fmc._speedDirector._climbSpeedRestriction.altitude = null;
				this.showPage1();
			}

			if (value.length > 0) {
				let storeToFMC = async (value) => {
					let toSet = value.split('/');
					let speed = toSet[0];
					let altitude = toSet[1];
					let roundedAltitude = Math.round(altitude / 100) * 100;
					let valueToCheck = speed + '/' + roundedAltitude;
					if (HeavyInput.Validators.speedRestriction(valueToCheck, this.fmc.cruiseFlightLevel * 100)) {
						this.fmc._speedDirector._climbSpeedRestriction.speed = speed;
						this.fmc._speedDirector._climbSpeedRestriction.altitude = roundedAltitude;
					} else {
						this.fmc.showErrorMessage(this.fmc.defaultInputErrorMessage);
					}
				};

				storeToFMC(value).then(() => {
					this.showPage1();
				});
			}
		};

		let selectedClimbSpeed = this.fmc._speedDirector._climbSpeedSelected.speed || NaN;
		if (selectedClimbSpeed && isFinite(selectedClimbSpeed)) {
			this.fmc.onLeftInput[4] = () => {
				this.fmc._speedDirector._climbSpeedSelected.speed = null;
				this.showPage1();
			};
		}

		/**
		 * Right side
		 */

		this.fmc.onRightInput[2] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();
			let altitude = HeavyInput.Converters.inputToAltitude(value);
			if (altitude) {
				this.fmc.trySetTransAltitude(String(altitude));
			}
			this.showPage1();
		};
	}

	checkExecHandlers() {
		/*
		if (Object.keys(this.fmc._activeExecHandlers).length > 0) {
			this.fmc.onExec = () => {
				Object.keys(this.fmc._activeExecHandlers).forEach((key) => {
					this.fmc._activeExecHandlers[key]();
					delete this.fmc._activeExecHandlers[key];
				});
				this.fmc._shouldBeExecEmisssive = false;
				SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'Number', 0);
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
			};
		}

		 */
	}


	showPage1() {
		/**
		 * Page default settings
		 */
		this.fmc.clearDisplay();
		this.fmc.refreshPageCallback = () => {
			this.showPage();
		};

		/**
		 * Cells inits
		 */
		let pageTitleCell = this.getClimbPageTitle();
		let cruiseAltitudeCell = this.getClimbCruiseAltitudeCell();
		let speedRestrictionCell = this.getClimbSpeedRestrictionCell();
		let selectedClimbSpeedCell = this.getSelectedClimbSpeedCell();
		let speedTransitionCell = this.getClimbSpeedTransitionCell();
		let econClimbSpeedCell = this.getEconClimbSpeedCell();
		let econPromptCell = this.getEconClimbPromptCell();
		let transitionAltitudeCell = this.getClimbTransitionAltitudeCell();

		this.setupClimbPageEvents();
		this.checkExecHandlers();

		this.fmc.setTemplate([
			[pageTitleCell + ' CLB', '1', '3'],
			['CRZ ALT'],
			[cruiseAltitudeCell],
			[(selectedClimbSpeedCell ? 'SEL SPD' : 'ECON SPD')],
			[(selectedClimbSpeedCell ? selectedClimbSpeedCell : econClimbSpeedCell)],
			['SPD TRANS', 'TRANS ALT'],
			[speedTransitionCell, transitionAltitudeCell],
			['SPD RESTR'],
			[speedRestrictionCell],
			['__FMCSEPARATOR'],
			[econPromptCell, 'ENG OUT>'],
			[],
			[]
		]);
		this.fmc.onNextPage = () => {
			this.enforcedPage = 2;
			this.showPage2();
		};
		this.fmc.updateSideButtonActiveStatus();
	}


	getCruisePageTitle() {
		let cell = '';
		/*
		if (Object.keys(this.fmc._activeExecHandlers).length > 0) {
			cell = this.fmc.makeSettable('MOD ');
		} else {
			cell = cell + 'ACT ';
		}
		 */

		switch (this.fmc._speedDirector.commandedSpeedType) {
			case SpeedType.SPEED_TYPE_SELECTED:
				cell = cell + this.fmc._speedDirector._cruiseSpeedSelected.speed + 'KT';
				break;
			case SpeedType.SPEED_TYPE_ECON:
				cell = cell + 'ECON';
				break;
			default:
				cell = cell + 'ECON';
		}

		return cell;
	}

	getCruiseAltitudeCell() {
		let cell = '□□□□□';

		if (this.fmc.cruiseFlightLevel) {
			cell = 'FL' + this.fmc.cruiseFlightLevel;
			if (this.fmc.getIsVNAVActive()) {
				cell = this.fmc.colorizeContent(cell, 'magenta');
			}
		}

		if (cell) {
			cell = this.fmc.makeSettable(cell);
		}

		return cell;
	}

	getSelectedCruiseSpeedCell() {
		if (!this.fmc._speedDirector._cruiseSpeedSelected.isValid()) {
			return '';
		}
		let selectedCruiseSpeed = fastToFixed(this.fmc._speedDirector._cruiseSpeedSelected.speed, 0) || NaN;
		let cell = '';
		if (selectedCruiseSpeed && isFinite(Number(selectedCruiseSpeed))) {
			cell = selectedCruiseSpeed + '';
		}

		if (this.fmc._speedDirector.commandedSpeedType === SpeedType.SPEED_TYPE_SELECTED && this.fmc._speedDirector.speedPhase === SpeedPhase.SPEED_PHASE_CRUISE && this.fmc.getIsVNAVActive()) {
			cell = this.fmc.colorizeContent(cell, 'magenta');
		}

		if (cell) {
			cell = this.fmc.makeSettable(cell);
		}
		console.log(cell);
		return cell;
	}

	getEconCruisePromptCell() {
		let selectedCruiseSpeed = this.fmc._speedDirector._cruiseSpeedSelected.speed || NaN;
		return (selectedCruiseSpeed && isFinite(selectedCruiseSpeed)) ? '<ECON' : '';
	}

	getEconCruiseSpeedCell() {
		let cell = '';
		if (this.fmc._speedDirector.commandedSpeedType === SpeedType.SPEED_TYPE_ECON && this.fmc._speedDirector.speedPhase === SpeedPhase.SPEED_PHASE_CRUISE && this.fmc.getIsVNAVActive()) {
			if (Simplane.getAutoPilotMachModeActive()) {
				let mach = fastToFixed(this.fmc._speedDirector._cruiseSpeedEcon.speedMach, 3);
				if (mach.charAt(0) === '0') {
					mach = mach.substring(1);
				}
				cell = mach;
			} else {
				cell = fastToFixed(this.fmc._speedDirector._cruiseSpeedEcon.speed, 0);
			}
			cell = this.fmc.colorizeContent(cell, 'magenta');
		}

		if (cell) {
			cell = this.fmc.makeSettable(cell);
		}

		return cell;
	}

	getN1Cell() {
		let cell = '--%';
		let n1Value = this.fmc.getThrustClimbLimit();
		if (isFinite(n1Value)) {
			cell = fastToFixed(n1Value, 1) + '%';
		}
		return cell;
	}

	setupCruisePageEvents() {
		/**
		 * Left side
		 */
		this.fmc.onLeftInput[0] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();
			if (this.fmc.setCruiseFlightLevelAndTemperature(value)) {
				this.showPage2();
			}
		};

		this.fmc.onLeftInput[1] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();

			let storeToFMC = async (value, force = false) => {
				if (HeavyInput.Validators.speedRange(value) || force) {
					this.fmc._speedDirector._cruiseSpeedSelected.speed = value;
				}
			};

			if (value === 'DELETE') {
				this.fmc.inOut = '';
				storeToFMC(null, true).then(() => {
					this.showPage2();
				});
			}

			if (value.length > 0) {
				storeToFMC(value).then(() => {
					this.showPage2();
				});
			}
		};

		let selectedCruiseSpeed = this.fmc._speedDirector._cruiseSpeedSelected.speed || NaN;
		if (selectedCruiseSpeed && isFinite(selectedCruiseSpeed)) {
			this.fmc.onLeftInput[4] = () => {
				this.fmc._speedDirector._cruiseSpeedSelected.speed = null;
				this.showPage2();
			};
		}
	}

	showPage2() {
		/**
		 * Page default settings
		 */
		this.fmc.clearDisplay();
		this.fmc.refreshPageCallback = () => {
			this.showPage();
		};

		let pageTitleCell = this.getCruisePageTitle();
		let cruiseAltitudeCell = this.getCruiseAltitudeCell();
		let n1Cell = this.getN1Cell();

		let econCruiseSpeedCell = this.getEconCruiseSpeedCell();
		let selectedCruiseSpeedCell = this.getSelectedCruiseSpeedCell();
		let econPromptCell = this.getEconCruisePromptCell();

		this.setupCruisePageEvents();
		this.checkExecHandlers();

		/** Highlight speeds */

		this.fmc.setTemplate([
			[pageTitleCell + ' CRZ', '2', '3'],
			['CRZ ALT', 'STEP TO'],
			[cruiseAltitudeCell],
			[(selectedCruiseSpeedCell ? 'SEL SPD' : 'ECON SPD'), 'AT'],
			[(selectedCruiseSpeedCell ? selectedCruiseSpeedCell : econCruiseSpeedCell)],
			['N1'],
			[n1Cell],
			['STEP', 'RECMD', 'OPT', 'MAX'],
			[],
			['__FMCSEPARATOR'],
			[econPromptCell, ''],
			[''],
			['', 'LRC>']
		]);
		this.fmc.onPrevPage = () => {
			this.enforcedPage = 1;
			this.showPage1();
		};
		this.fmc.onNextPage = () => {
			this.enforcedPage = 3;
			this.showPage3();
		};
		this.fmc.updateSideButtonActiveStatus();
	}

	showPage3() {
		this.fmc.clearDisplay();
		let speedTransCell = '---';
		let speed = this.fmc.getDesManagedSpeed();
		if (isFinite(speed)) {
			speedTransCell = speed.toFixed(0);
		}
		speedTransCell += '/10000';

		let descentNowAvailable = (this.fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) && SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number');

		if (descentNowAvailable) {
			this.fmc.onRightInput[5] = () => {
				this.fmc.currentFlightPhase = FlightPhase.FLIGHT_PHASE_DESCENT;
				SimVar.SetSimVarValue('L:B78XH_DESCENT_NOW_ACTIVATED', 'Number', 1);
			};
		}

		this.fmc.setTemplate([
			['DES', '3', '3'],
			['E/D AT'],
			[],
			['ECON SPD'],
			[],
			['SPD TRANS', 'WPT/ALT'],
			[speedTransCell],
			['SPD RESTR'],
			[],
			['PAUSE @ DIST FROM DEST'],
			['OFF', 'FORECAST>'],
			[],
			['\<OFFPATH DES', descentNowAvailable && !SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_ACTIVATED', 'Number') ? 'DES NOW>' : '']
		]);
		this.fmc.onPrevPage = () => {
			this.enforcedPage = 2;
			this.showPage2();
		};
		this.fmc.updateSideButtonActiveStatus();
	}
}