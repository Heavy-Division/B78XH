Include.addScript('/B78XH/Enums/B78XH_LocalVariables.js');
Include.addScript('/Heavy/Utils/HeavyInputChecks.js');
Include.addScript('/Heavy/Utils/HeavyInputUtils.js');

class B787_10_FMC_VNAVPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		let crzAltCell = '□□□□□';

		fmc.refreshPageCallback = () => {
			B787_10_FMC_VNAVPage.ShowPage1(fmc);
		};

		if (fmc.cruiseFlightLevel) {
			crzAltCell = fmc.cruiseFlightLevel + 'FL';
		}
		fmc.onLeftInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.setCruiseFlightLevelAndTemperature(value)) {
				B787_10_FMC_VNAVPage.ShowPage1(fmc);
			}
		};
		let speedTransCell = '---';
		let speed = fmc.getCrzManagedSpeed();
		if (isFinite(speed)) {
			speedTransCell = speed.toFixed(0);
		}
		speedTransCell += '/';
		if (isFinite(fmc.transitionAltitude)) {
			speedTransCell += fmc.transitionAltitude.toFixed(0);
		} else {
			speedTransCell += '-----';
		}

		let speedRestrictionCell = '---/-----';
		let speedRestrictionSpeedValue = '';
		let speedRestrictionAltitudeValue = '';

		if(fmc._climbSpeedRestrictionExecHandler){
			if(fmc._climbSpeedRestriction){
				speedRestrictionSpeedValue = fmc._climbSpeedRestriction.speed || '';
				speedRestrictionAltitudeValue = fmc._climbSpeedRestriction.altitude || '';
			}
		} else {
			if(fmc.climbSpeedRestriction){
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
			let storeToFMC = async (value) => {
				if (HeavyInputChecks.speedRangeWithAltitude(value)) {
					let toSet = value.split('/');
					let speed = toSet[0];
					let altitude = toSet[1];
					if (fmc.trySetClimbSpeedRestriction(speed, altitude)) {
						fmc.activateExec()
					}
				}
			};

			storeToFMC(value).then(() => {
				B787_10_FMC_VNAVPage.ShowPage1(fmc);
			});
		};

		let transitionAltitudeCell = fmc.transitionAltitude.toFixed();
		let selectedClimbSpeed = fmc.preSelectedClbSpeed || NaN

		fmc.onLeftInput[1] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();

			let storeToLocalVariable = async (value, force = false) => {
				if (HeavyInputChecks.speedRange(value) || force) {
					fmc.trySetPreSelectedClimbSpeed(value)
					await SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.SELECTED_CLIMB_SPEED.SPEED, 'String', value);
				}
			};

			let storeToFMC = async (value, force = false) => {
				if (HeavyInputChecks.speedRange(value) || force) {
					fmc.trySetPreSelectedClimbSpeed(value)
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

		let selectedClimbSpeedCell = '';

		if (selectedClimbSpeed && isFinite(selectedClimbSpeed)) {
			selectedClimbSpeedCell = selectedClimbSpeed + '';
		}


		switch (fmc._fmcCommandSpeedType){
			case 'RESTRICTION':
				if(!fmc._climbSpeedRestriction){
					speedRestrictionCell = speedRestrictionCell + '[color]magenta';
				}
				break
			case 'SELECTED':
				selectedClimbSpeedCell = selectedClimbSpeedCell + '[color]magenta';
				break;
			case 'MANAGED':
			default:
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

		if(fmc._climbSpeedRestrictionExecHandler){
			fmc.onExec = () => {
				if(fmc._climbSpeedRestrictionExecHandler){
					fmc._climbSpeedRestrictionExecHandler();
				}
			}
		}


		fmc.setTemplate([
			['CLB', '1', '3'],
			['CRZ ALT'],
			[crzAltCell],
			[(selectedClimbSpeedCell ? 'SEL SPD' : 'ECON SPD')],
			[(selectedClimbSpeedCell ? selectedClimbSpeedCell : '')],
			['SPD TRANS', 'TRANS ALT'],
			[speedTransCell, transitionAltitudeCell],
			['SPD RESTR'],
			[speedRestrictionCell],
			[],
			['', '<ENG OUT'],
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
		fmc.setTemplate([
			['CRZ', '2', '3'],
			['CRZ ALT', 'STEP TO'],
			[crzAltCell],
			['ECON SPD', 'AT'],
			[],
			['N1'],
			[n1Cell],
			['STEP', 'RECMD', 'OPT', 'MAX'],
			[],
			['', '1X @ TOD'],
			['', 'OFF'],
			['PAUSE @ TOD'],
			['OFF', '<LRC']
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
			['\<OFFPATH DES']
		]);
		fmc.onPrevPage = () => {
			B787_10_FMC_VNAVPage.ShowPage2(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}
}

//# sourceMappingURL=B787_10_FMC_VNAVPage.js.map