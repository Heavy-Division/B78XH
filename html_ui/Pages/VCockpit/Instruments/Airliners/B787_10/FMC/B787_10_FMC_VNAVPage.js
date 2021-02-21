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
		let speedRestrictionSpeedValue = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.SPEED_RESTRICTION.SPEED, 'Number') || false;
		let speedRestrictionAltitudeValue = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.SPEED_RESTRICTION.ALTITUDE, 'Number') || false;


		if (speedRestrictionSpeedValue && isFinite(speedRestrictionSpeedValue) && speedRestrictionAltitudeValue && isFinite(speedRestrictionAltitudeValue)) {
			speedRestrictionCell = speedRestrictionSpeedValue + '/' + speedRestrictionAltitudeValue;
		}

		fmc.onLeftInput[3] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			let storeToLocalVariables = async (value) => {
				if (HeavyInputChecks.speedRangeWithAltitude(value)) {
					let toSet = value.split('/');
					let speed = toSet[0];
					let altitude = toSet[1];
					await SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.SPEED_RESTRICTION.SPEED, 'String', speed);
					await SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.SPEED_RESTRICTION.ALTITUDE, 'String', altitude);
				}
			};

			storeToLocalVariables(value).then(() => {
				B787_10_FMC_VNAVPage.ShowPage1(fmc);
			});
		};

		let planeAltitude = Simplane.getAltitude();
		let speedRestrictionFMCCommandSpeed = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.SPEED_RESTRICTION.FMC_COMMAND_SPEED, 'Number') || false;

		if (speedRestrictionAltitudeValue > planeAltitude && speedRestrictionFMCCommandSpeed) {
			speedRestrictionCell = speedRestrictionCell + '[color]magenta';
		}

		let transitionAltitudeCell = fmc.transitionAltitude.toFixed();

		//let selectedClimbSpeed = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.SELECTED_CLIMB_SPEED.SPEED, 'Number') || false;
		let selectedClimbSpeed = fmc.preSelectedClbSpeed || NaN
		let selectedClimbSpeedFMCCommandSpeed = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.SELECTED_CLIMB_SPEED.FMC_COMMAND_SPEED, 'Number') || false;

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

		if (selectedClimbSpeedFMCCommandSpeed) {
			selectedClimbSpeedCell = selectedClimbSpeedCell + '[color]magenta';
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