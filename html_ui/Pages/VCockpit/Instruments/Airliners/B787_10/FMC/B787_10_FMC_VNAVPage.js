Include.addScript('/B78XH/Enums/B78XH_LocalVariables.js');
Include.addScript('/Heavy/Utils/HeavyInputChecks.js');
Include.addScript('/Heavy/Utils/HeavyInputUtils.js');

class B787_10_FMC_VNAVPage {

	static showPage(fmc) {
		if (fmc.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_CLIMB) {
			B787_10_FMC_VNAVPage.ShowPage1(fmc);
		} else if (fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
			B787_10_FMC_VNAVPage.ShowPage2(fmc);
		} else if (fmc.currentFlightPhase >= FlightPhase.FLIGHT_PHASE_DESCENT) {
			B787_10_FMC_VNAVPage.ShowPage3(fmc);
		} else {
			B787_10_FMC_VNAVPage.ShowPage1(fmc);
		}
	}

	static ShowPage1(fmc) {
		fmc.clearDisplay();
		let isVNAVActive = fmc.getIsVNAVActive();
		let crzAltCell = '□□□□□';

		fmc.refreshPageCallback = () => {
			B787_10_FMC_VNAVPage.showPage(fmc);
		};

		let titleCell = '';
		if (Object.keys(fmc._activeExecHandlers).length > 0) {
			titleCell = titleCell + 'MOD ';
		} else {
			titleCell = titleCell + 'ACT ';
		}

		let departureWaypoints = fmc.flightPlanManager.getDepartureWaypointsMap();

		let commandedAltitudeCruise = true;
		if (departureWaypoints) {
			departureWaypoints.forEach((waypoint) => {
				if (waypoint && waypoint.legAltitudeDescription === 3) {
					commandedAltitudeCruise = false;
				}
			});
		}

		if (fmc.cruiseFlightLevel) {
			crzAltCell = fmc.cruiseFlightLevel + 'FL' + (commandedAltitudeCruise && isVNAVActive ? '[color]magenta' : '');
		}
		fmc.onLeftInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.setCruiseFlightLevelAndTemperature(value)) {
				B787_10_FMC_VNAVPage.ShowPage1(fmc);
			}
		};

		let speedRestrictionCell = '---/-----';
		let speedRestrictionSpeedValue = '';
		let speedRestrictionAltitudeValue = '';

		if (fmc._activeExecHandlers['CLIMB_SPEED_RESTRICTION_HANDLER']) {
			if (fmc._climbSpeedRestriction) {
				speedRestrictionSpeedValue = fmc._climbSpeedRestriction.speed || '';
				speedRestrictionAltitudeValue = fmc._climbSpeedRestriction.altitude || '';
			}
		} else {
			if (fmc.climbSpeedRestriction) {
				speedRestrictionSpeedValue = fmc.climbSpeedRestriction.speed || '';
				speedRestrictionAltitudeValue = fmc.climbSpeedRestriction.altitude || '';
			}
		}


		if (speedRestrictionSpeedValue && isFinite(speedRestrictionSpeedValue) && speedRestrictionAltitudeValue && isFinite(speedRestrictionAltitudeValue)) {
			speedRestrictionCell = speedRestrictionSpeedValue + '/' + speedRestrictionAltitudeValue;
		}

		fmc.onLeftInput[3] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();

			if (value === 'DELETE') {
				fmc.inOut = '';
				value = '';
				fmc.climbSpeedRestriction = null;
				fmc._climbSpeedRestriction = null;
				delete fmc._activeExecHandlers['CLIMB_SPEED_RESTRICTION_HANDLER'];
				B787_10_FMC_VNAVPage.ShowPage1(fmc);
			}

			if (value.length > 0) {
				let storeToFMC = async (value) => {
					let toSet = value.split('/');
					let speed = toSet[0];
					let altitude = toSet[1];
					let roundedAltitude = Math.round(altitude / 100) * 100;
					let valueToCheck = speed + '/' + roundedAltitude;
					if (HeavyInputChecks.speedRestriction(valueToCheck, fmc.cruiseFlightLevel * 100)) {
						if (fmc.trySetClimbSpeedRestriction(speed, roundedAltitude)) {
							fmc.activateExec();
						}
					} else {
						fmc.showErrorMessage(fmc.defaultInputErrorMessage);
					}
				};

				storeToFMC(value).then(() => {
					B787_10_FMC_VNAVPage.ShowPage1(fmc);
				});
			}

		};

		let transitionAltitudeCell = fmc.transitionAltitude.toFixed();
		let selectedClimbSpeed = fmc.preSelectedClbSpeed || NaN;

		fmc.onLeftInput[1] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();

			let storeToLocalVariable = async (value, force = false) => {
				if (HeavyInputChecks.speedRange(value) || force) {
					fmc.trySetPreSelectedClimbSpeed(value);
				}
			};

			let storeToFMC = async (value, force = false) => {
				if (HeavyInputChecks.speedRange(value) || force) {
					fmc.trySetPreSelectedClimbSpeed(value);
				}
			};

			if (value === 'DELETE') {
				fmc.inOut = '';
				storeToFMC(null, true).then(() => {
					B787_10_FMC_VNAVPage.ShowPage1(fmc);
				});
			}

			if (value.length > 0) {
				storeToFMC(value).then(() => {
					B787_10_FMC_VNAVPage.ShowPage1(fmc);
				});
			}

		};


		let econClimbSpeed = fmc.getEconClbManagedSpeed().toFixed(0);
		let selectedClimbSpeedCell = '';
		let econCell = '';

		if (selectedClimbSpeed && isFinite(selectedClimbSpeed)) {
			selectedClimbSpeedCell = selectedClimbSpeed + '';
			econCell = '<ECON';
			fmc.onLeftInput[4] = () => {
				let handler = () => {
					delete fmc.preSelectedClbSpeed;
				};
				fmc._activeExecHandlers['CLIMB_SELECTED_SPEED_REMOVE_HANDLER'] = handler;
				fmc.activateExecEmissive();
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
			};
		}

		let speedTransCell = '---';
		let speed = fmc.getCrzManagedSpeed();
		if (isFinite(speed)) {
			speedTransCell = speed.toFixed(0);
		}

		switch (fmc._fmcCommandClimbSpeedType) {
			case 'SPEED_RESTRICTION':
				if (!fmc._climbSpeedRestriction) {
					speedRestrictionCell = speedRestrictionCell + '[color]magenta';
				}
				titleCell = titleCell + fmc.climbSpeedRestriction.speed + 'KT ';
				break;
			case 'SPEED_TRANSITION':
				speedTransCell = speedTransCell + '/10000' + '[color]magenta';
				speedTransCell = speedTransCell + '[color]magenta';
				titleCell = titleCell + '250KT';
				break;
			case 'SPEED_SELECTED':
				selectedClimbSpeedCell = selectedClimbSpeedCell + '[color]magenta';
				titleCell = titleCell + selectedClimbSpeed + 'KT';
				break;
			case 'SPEED_ECON':
				econClimbSpeed = econClimbSpeed + '[color]magenta';
				break;
			default:
				titleCell = titleCell + 'ECON';
		}

		speedTransCell += '/10000';

		if (fmc._climbSpeedTransitionDeleted || Simplane.getAltitude() > 10000) {
			speedTransCell = '';
		}


		fmc.onRightInput[2] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			let altitude = HeavyInputUtils.inputToAltitude(value);
			if (altitude) {
				fmc.trySetTransAltitude(altitude);
			}
			B787_10_FMC_VNAVPage.ShowPage1(fmc);
		};

		if (!fmc._climbSpeedTransitionDeleted) {
			fmc.onLeftInput[2] = () => {
				let value = fmc.inOut;
				fmc.clearUserInput();
				if (value === 'DELETE') {
					fmc.inOut = '';
					fmc._climbSpeedTransitionDeleted = true;
					SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
				}

				if (value.length > 0) {
					fmc.showErrorMessage(fmc.defaultInputErrorMessage);
					SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
				}
			};
		}


		if (Object.keys(fmc._activeExecHandlers).length > 0) {
			fmc.onExec = () => {
				Object.keys(fmc._activeExecHandlers).forEach((key) => {
					fmc._activeExecHandlers[key]();
					delete fmc._activeExecHandlers[key];
				});
				fmc._shouldBeExecEmisssive = false;
				SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'Number', 0);
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
			};
		}


		fmc.setTemplate([
			[titleCell + ' CLB', '1', '3'],
			['CRZ ALT'],
			[crzAltCell],
			[(selectedClimbSpeedCell ? 'SEL SPD' : 'ECON SPD')],
			[(selectedClimbSpeedCell ? selectedClimbSpeedCell : econClimbSpeed)],
			['SPD TRANS', 'TRANS ALT'],
			[speedTransCell, transitionAltitudeCell],
			['SPD RESTR'],
			[speedRestrictionCell],
			[],
			[econCell, '<ENG OUT'],
			[],
			[]
		]);
		fmc.onNextPage = () => {
			B787_10_FMC_VNAVPage.ShowPage2(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}

	static ShowPage2(fmc) {
		fmc.clearDisplay();

		fmc.refreshPageCallback = () => {
			B787_10_FMC_VNAVPage.showPage(fmc);
		};

		let titleCell = '';
		if (Object.keys(fmc._activeExecHandlers).length > 0) {
			titleCell = titleCell + 'MOD ';
		} else {
			titleCell = titleCell + 'ACT ';
		}

		let crzAltCell = '□□□□□';
		if (fmc.cruiseFlightLevel) {
			crzAltCell = fmc.cruiseFlightLevel + 'FL';
		}
		fmc.onRightInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.setCruiseFlightLevelAndTemperature(value)) {
				B787_10_FMC_VNAVPage.ShowPage2(fmc);
			}
		};
		let n1Cell = '--%';
		let n1Value = fmc.getThrustClimbLimit();
		if (isFinite(n1Value)) {
			n1Cell = n1Value.toFixed(1) + '%';
		}

		let econCruiseSpeed = fmc.getEconClbManagedSpeed().toFixed(0);
		let selectedCruiseSpeedCell = '';
		let econCell = '';
		let selectedCruiseSpeed = fmc.preSelectedCrzSpeed || NaN;

		fmc.onLeftInput[1] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();

			let storeToFMC = async (value, force = false) => {
				if (HeavyInputChecks.speedRange(value) || force) {
					fmc.trySetPreSelectedCruiseSpeed(value);
				}
			};

			if (value.length > 0) {
				storeToFMC(value).then(() => {
					B787_10_FMC_VNAVPage.ShowPage2(fmc);
				});
			}

		};

		if (selectedCruiseSpeed && isFinite(selectedCruiseSpeed)) {
			selectedCruiseSpeedCell = selectedCruiseSpeed + '';
			econCell = '<ECON';
			fmc.onLeftInput[4] = () => {
				let handler = () => {
					delete fmc.preSelectedCrzSpeed;
				};
				fmc._activeExecHandlers['CRUISE_SELECTED_SPEED_REMOVE_HANDLER'] = handler;
				fmc.activateExecEmissive();
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
			};
		}

		if (Object.keys(fmc._activeExecHandlers).length > 0) {
			fmc.onExec = () => {
				Object.keys(fmc._activeExecHandlers).forEach((key) => {
					fmc._activeExecHandlers[key]();
					delete fmc._activeExecHandlers[key];
				});
				fmc._shouldBeExecEmisssive = false;
				SimVar.SetSimVarValue('L:FMC_EXEC_ACTIVE', 'Number', 0);
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
			};
		}

		/** Highlight speeds */

		switch (fmc._fmcCommandCruiseSpeedType) {
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

		fmc.setTemplate([
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
		fmc.onPrevPage = () => {
			B787_10_FMC_VNAVPage.ShowPage1(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_VNAVPage.ShowPage3(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}

	static ShowPage3(fmc) {
		fmc.clearDisplay();
		let speedTransCell = '---';
		let speed = fmc.getDesManagedSpeed();
		if (isFinite(speed)) {
			speedTransCell = speed.toFixed(0);
		}
		speedTransCell += '/10000';

		let descentNowAvailable = (fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) && SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number');

		if (descentNowAvailable) {
			fmc.onRightInput[5] = () => {
				fmc.currentFlightPhase = FlightPhase.FLIGHT_PHASE_DESCENT;
				SimVar.SetSimVarValue('L:B78XH_DESCENT_NOW_ACTIVATED', 'Number', 1);
			};
		}

		fmc.setTemplate([
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
		fmc.onPrevPage = () => {
			B787_10_FMC_VNAVPage.ShowPage2(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}
}

//# sourceMappingURL=B787_10_FMC_VNAVPage.js.map