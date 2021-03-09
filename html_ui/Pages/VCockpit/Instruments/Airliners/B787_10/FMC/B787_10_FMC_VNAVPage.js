Include.addScript('/B78XH/Enums/B78XH_LocalVariables.js');
Include.addScript('/Heavy/Utils/HeavyInputChecks.js');
Include.addScript('/Heavy/Utils/HeavyInputUtils.js');

class B787_10_FMC_VNAVPage {

	constructor(fmc) {
		this.fmc = fmc;
	}

	showPage() {
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

	getPageTitle() {
		let cell = '';
		if (Object.keys(this.fmc._activeExecHandlers).length > 0) {
			cell = cell + 'MOD ';
		} else {
			cell = cell + 'ACT ';
		}

		switch (this.fmc._fmcCommandClimbSpeedType) {
			case 'SPEED_RESTRICTION':
				if(this.fmc.climbSpeedRestriction){
					cell = cell + this.fmc.climbSpeedRestriction.speed + 'KT ';
				}
				break;
			case 'SPEED_TRANSITION':
				cell = cell + this.fmc.getCrzManagedSpeed() + 'KT';
				break;
			case 'SPEED_SELECTED':
				let selectedClimbSpeed = this.fmc.preSelectedClbSpeed || '';
				cell = cell + selectedClimbSpeed + 'KT';
				break;
			case 'SPEED_ECON':
				cell = cell + 'ECON';
				break;
			default:
				cell = cell + 'ECON';
		}

		return cell;
	}

	getCrzAltCell() {
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
			cell = this.fmc.cruiseFlightLevel + 'FL' + (commandedAltitudeCruise && this.fmc.getIsVNAVActive() ? '[color]magenta' : '');
		}
		return cell;
	}

	getSpeedRestrictionCell() {
		let cell = '---/-----';
		let speedRestrictionSpeedValue = '';
		let speedRestrictionAltitudeValue = '';
		if (this.fmc._activeExecHandlers['CLIMB_SPEED_RESTRICTION_HANDLER']) {
			if (this.fmc._climbSpeedRestriction) {
				speedRestrictionSpeedValue = this.fmc._climbSpeedRestriction.speed || '';
				speedRestrictionAltitudeValue = this.fmc._climbSpeedRestriction.altitude || '';
			}
		} else {
			if (this.fmc.climbSpeedRestriction) {
				speedRestrictionSpeedValue = this.fmc.climbSpeedRestriction.speed || '';
				speedRestrictionAltitudeValue = this.fmc.climbSpeedRestriction.altitude || '';
			}
		}


		if (speedRestrictionSpeedValue && isFinite(speedRestrictionSpeedValue) && speedRestrictionAltitudeValue && isFinite(speedRestrictionAltitudeValue)) {
			cell = speedRestrictionSpeedValue + '/' + speedRestrictionAltitudeValue;
		}
		if (this.fmc._fmcCommandClimbSpeedType === 'SPEED_RESTRICTION') {
			if (!this.fmc._climbSpeedRestriction) {
				cell = cell + '[color]magenta';
			}
		}
		return cell;
	}

	getSpeedTransitionCell() {
		let cell = '';
		let speed = this.fmc.getCrzManagedSpeed();
		if (isFinite(speed)) {
			cell = speed.toFixed(0) + '/10000';
		}

		if (this.fmc._climbSpeedTransitionDeleted || Simplane.getAltitude() > 10000) {
			cell = '';
		}

		if (this.fmc._fmcCommandClimbSpeedType === 'SPEED_TRANSITION') {
			cell = cell + '[color]magenta';
		}

		return cell;
	}

	getTransitionAltitudeCell() {
		return this.fmc.transitionAltitude.toFixed();
	}

	getSelectedClimbSpeedCell() {
		let selectedClimbSpeed = this.fmc.preSelectedClbSpeed || NaN;
		let cell = '';
		if (selectedClimbSpeed && isFinite(selectedClimbSpeed)) {
			cell = selectedClimbSpeed + '';
		}

		if (this.fmc._fmcCommandClimbSpeedType === 'SPEED_SELECTED') {
			cell = cell + '[color]magenta';
		}

		return cell;
	}

	getEconPromptCell() {
		let selectedClimbSpeed = this.fmc.preSelectedClbSpeed || NaN;
		return (selectedClimbSpeed && isFinite(selectedClimbSpeed)) ? '<ECON' : '';
	}

	getEconClimbSpeedCell() {
		let cell = this.fmc.getEconClbManagedSpeed().toFixed(0);
		if (this.fmc._fmcCommandClimbSpeedType === 'SPEED_ECON') {
			cell = cell + '[color]magenta';
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
				if (HeavyInputChecks.speedRange(value) || force) {
					this.fmc.trySetPreSelectedClimbSpeed(value);
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

		if (!this.fmc._climbSpeedTransitionDeleted) {
			this.fmc.onLeftInput[2] = () => {
				let value = this.fmc.inOut;
				this.fmc.clearUserInput();
				if (value === 'DELETE') {
					this.fmc.inOut = '';
					this.fmc._climbSpeedTransitionDeleted = true;
					SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
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
				this.fmc.climbSpeedRestriction = null;
				this.fmc._climbSpeedRestriction = null;
				delete this.fmc._activeExecHandlers['CLIMB_SPEED_RESTRICTION_HANDLER'];
				this.showPage1();
			}

			if (value.length > 0) {
				let storeToFMC = async (value) => {
					let toSet = value.split('/');
					let speed = toSet[0];
					let altitude = toSet[1];
					let roundedAltitude = Math.round(altitude / 100) * 100;
					let valueToCheck = speed + '/' + roundedAltitude;
					if (HeavyInputChecks.speedRestriction(valueToCheck, this.fmc.cruiseFlightLevel * 100)) {
						if (this.fmc.trySetClimbSpeedRestriction(speed, roundedAltitude)) {
							this.fmc.activateExec();
						}
					} else {
						this.fmc.showErrorMessage(this.fmc.defaultInputErrorMessage);
					}
				};

				storeToFMC(value).then(() => {
					this.showPage1();
				});
			}
		};

		let selectedClimbSpeed = this.fmc.preSelectedClbSpeed || NaN;
		if (selectedClimbSpeed && isFinite(selectedClimbSpeed)) {
			this.fmc.onLeftInput[4] = () => {
				let handler = () => {
					delete this.fmc.preSelectedClbSpeed;
				};
				this.fmc._activeExecHandlers['CLIMB_SELECTED_SPEED_REMOVE_HANDLER'] = handler;
				this.fmc.activateExecEmissive();
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
			};
		}

		/**
		 * Right side
		 */

		this.fmc.onRightInput[2] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();
			let altitude = HeavyInputUtils.inputToAltitude(value);
			if (altitude) {
				this.fmc.trySetTransAltitude(altitude);
			}
			this.showPage1();
		};
	}

	checkExecHandlers() {
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
		let pageTitleCell = this.getPageTitle();
		let crzAltCell = this.getCrzAltCell();
		let speedRestrictionCell = this.getSpeedRestrictionCell();
		let selectedClimbSpeedCell = this.getSelectedClimbSpeedCell();
		let speedTransitionCell = this.getSpeedTransitionCell();
		let econClimbSpeedCell = this.getEconClimbSpeedCell();
		let econPromptCell = this.getEconPromptCell();
		let transitionAltitudeCell = this.getTransitionAltitudeCell();

		this.setupClimbPageEvents();
		this.checkExecHandlers();

		this.fmc.setTemplate([
			[pageTitleCell + ' CLB', '1', '3'],
			['CRZ ALT'],
			[crzAltCell],
			[(selectedClimbSpeedCell ? 'SEL SPD' : 'ECON SPD')],
			[(selectedClimbSpeedCell ? selectedClimbSpeedCell : econClimbSpeedCell)],
			['SPD TRANS', 'TRANS ALT'],
			[speedTransitionCell, transitionAltitudeCell],
			['SPD RESTR'],
			[speedRestrictionCell],
			[],
			[econPromptCell, '<ENG OUT'],
			[],
			[]
		]);
		this.fmc.onNextPage = () => {
			this.showPage2();
		};
		this.fmc.updateSideButtonActiveStatus();
	}

	showPage2() {
		/**
		 * Page default settings
		 */
		this.fmc.clearDisplay();
		this.fmc.refreshPageCallback = () => {
			this.showPage();
		};


		let titleCell = '';
		if (Object.keys(this.fmc._activeExecHandlers).length > 0) {
			titleCell = titleCell + 'MOD ';
		} else {
			titleCell = titleCell + 'ACT ';
		}

		let crzAltCell = '□□□□□';
		if (this.fmc.cruiseFlightLevel) {
			crzAltCell = this.fmc.cruiseFlightLevel + 'FL';
		}
		this.fmc.onRightInput[0] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();
			if (this.fmc.setCruiseFlightLevelAndTemperature(value)) {
				this.showPage2();
			}
		};
		let n1Cell = '--%';
		let n1Value = this.fmc.getThrustClimbLimit();
		if (isFinite(n1Value)) {
			n1Cell = n1Value.toFixed(1) + '%';
		}

		let econCruiseSpeed = this.fmc.getEconClbManagedSpeed().toFixed(0);
		let selectedCruiseSpeedCell = '';
		let econCell = '';
		let selectedCruiseSpeed = this.fmc.preSelectedCrzSpeed || NaN;

		this.fmc.onLeftInput[1] = () => {
			let value = this.fmc.inOut;
			this.fmc.clearUserInput();

			let storeToFMC = async (value, force = false) => {
				if (HeavyInputChecks.speedRange(value) || force) {
					this.fmc.trySetPreSelectedCruiseSpeed(value);
				}
			};

			if (value.length > 0) {
				storeToFMC(value).then(() => {
					this.showPage2();
				});
			}

		};

		if (selectedCruiseSpeed && isFinite(selectedCruiseSpeed)) {
			selectedCruiseSpeedCell = selectedCruiseSpeed + '';
			econCell = '<ECON';
			this.fmc.onLeftInput[4] = () => {
				let handler = () => {
					delete this.fmc.preSelectedCrzSpeed;
				};
				this.fmc._activeExecHandlers['CRUISE_SELECTED_SPEED_REMOVE_HANDLER'] = handler;
				this.fmc.activateExecEmissive();
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
			};
		}

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

		/** Highlight speeds */

		switch (this.fmc._fmcCommandCruiseSpeedType) {
			case 'SPEED_SELECTED':
				selectedCruiseSpeedCell = selectedCruiseSpeedCell + '[color]magenta';
				titleCell = titleCell + selectedCruiseSpeed + 'KT';
				break;
			case 'SPEED_ECON':
				econCruiseSpeed = econCruiseSpeed + '[color]magenta';
				titleCell = titleCell + 'ECON';
				break;
			default:
				titleCell = titleCell + 'ECON';
		}

		this.fmc.setTemplate([
			[titleCell + ' CRZ', '2', '3'],
			['CRZ ALT', 'STEP TO'],
			[crzAltCell],
			[(selectedCruiseSpeedCell ? 'SEL SPD' : 'ECON SPD'), 'AT'],
			[(selectedCruiseSpeedCell ? selectedCruiseSpeedCell : econCruiseSpeed)],
			['N1'],
			[n1Cell],
			['STEP', 'RECMD', 'OPT', 'MAX'],
			[],
			['', ''],
			[econCell, ''],
			[''],
			['', '<LRC']
		]);
		this.fmc.onPrevPage = () => {
			this.showPage1();
		};
		this.fmc.onNextPage = () => {
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
			['OFF', '<FORECAST'],
			[],
			['\<OFFPATH DES', descentNowAvailable && !SimVar.SetSimVarValue('L:B78XH_DESCENT_NOW_ACTIVATED', 'Number') ? '<DES NOW' : '']
		]);
		this.fmc.onPrevPage = () => {
			this.showPage2();
		};
		this.fmc.updateSideButtonActiveStatus();
	}
}

//# sourceMappingURL=B787_10_FMC_VNAVPage.js.map