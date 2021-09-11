class B787_10_FMC_TakeOffRefPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		B787_10_FMC_TakeOffRefPage._timer = 0;
		fmc.pageUpdate = () => {
			B787_10_FMC_TakeOffRefPage._timer++;
			if (B787_10_FMC_TakeOffRefPage._timer >= 15) {
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			}
		};
		let v1 = '□□□';
		if (fmc.v1Speed) {
			v1 = fmc.makeSettable(fmc.v1Speed) + 'KT';
		} else {
			v1 = fmc.makeSettable(v1);
		}
		fmc.onRightInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (value === FMCMainDisplay.clrValue) {
				fmc.trySetV1Speed(undefined);
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else if (value === '') {
				fmc._computeV1Speed();
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else {
				if (fmc.trySetV1Speed(value)) {
					B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
				}
			}
		};
		let vR = '□□□';
		if (fmc.vRSpeed) {
			vR = fmc.makeSettable(fmc.vRSpeed) + 'KT';
		} else {
			vR = fmc.makeSettable(vR);
		}
		fmc.onRightInput[1] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (value === FMCMainDisplay.clrValue) {
				fmc.trySetVRSpeed(undefined);
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else if (value === '') {
				fmc._computeVRSpeed();
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else {
				if (fmc.trySetVRSpeed(value)) {
					B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
				}
			}
		};
		let v2 = '□□□';
		if (fmc.v2Speed) {
			v2 = fmc.makeSettable(fmc.v2Speed) + 'KT';
		} else {
			v2 = fmc.makeSettable(v2);
		}
		fmc.onRightInput[2] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (value === FMCMainDisplay.clrValue) {
				fmc.trySetV2Speed(undefined);
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else if (value === '') {
				fmc._computeV2Speed();
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else {
				if (fmc.trySetV2Speed(value)) {
					B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
				}
			}
		};

		let selectedTempCell;
		let selectedTemp = fmc.getThrustTakeOffTemp();
		if (selectedTemp) {
			selectedTempCell = '[settable]' + selectedTemp + '[/settable]';
		} else {
			selectedTempCell = '[settable]--[/settable]';
		}
		selectedTempCell = selectedTempCell + '°';

		let thrustTOMode = fmc.getThrustTakeOffMode();
		if (thrustTOMode === 0) {
			selectedTempCell += ' ' + (selectedTemp ? 'D-TO' : 'TO');
		} else if (thrustTOMode === 1) {
			selectedTempCell += ' ' + (selectedTemp ? 'D-TO 1' : 'TO 1');
		} else if (thrustTOMode === 2) {
			selectedTempCell += ' ' + (selectedTemp ? 'D-TO 2' : 'TO 2');
		}

		fmc.onLeftInput[1] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (value === 'DELETE') {
				SimVar.SetSimVarValue('L:B78XH_THRUST_ASSUMED_TEMPERATURE', 'Number', -1000);
				SimVar.SetSimVarValue('H:AS01B_MFD_1_TAKEOFF_MODES_UPDATED', 'Number', 1);
				SimVar.SetSimVarValue('H:AS01B_MFD_2_TAKEOFF_MODES_UPDATED', 'Number', 1);
				fmc._thrustTakeOffTemp = NaN;
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
				return;
			}
			if (fmc.setThrustTakeOffTemp(value)) {
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			}
		};


		let flapsCell = '---';
		let flapsAngle = fmc.getTakeOffFlap();
		if (isFinite(flapsAngle) && flapsAngle >= 0) {
			flapsCell = fastToFixed(flapsAngle, 0);
		} else {
			flapsCell = '□□';
		}

		flapsCell = fmc.makeSettable(flapsCell);

		flapsCell = flapsCell + '°';
		fmc.onLeftInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.setTakeOffFlap(value)) {
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			}
		};

		let runwayCell = '---';
		let selectedRunway = fmc.flightPlanManager.getDepartureRunway();
		if (selectedRunway) {
			runwayCell = 'RW' + Avionics.Utils.formatRunway(selectedRunway.designation);
		}
		runwayCell = fmc.makeSettable(runwayCell);

		if (fmc.flightPlanManager.getOrigin()) {
			fmc.onLeftInput[3] = () => {
				let value = fmc.inOut;
				fmc.clearUserInput();
				fmc.setOriginRunway(value, (result) => {
					if (result) {
						B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
					}
				});
			};
		}
		const useImperial = HeavyDivision.configuration.useImperial();
		let grWtCell = '□□□.□';
		if (isFinite(fmc.getFuelVarsUpdatedGrossWeight(useImperial))) {
			grWtCell = fmc.getFuelVarsUpdatedGrossWeight(useImperial).toFixed(1) + (useImperial ? ' lb' : ' kg');
		}

		let separator = '__FMCSEPARATOR';
		if (!fmc.dataHolder.preFlightDataHolder.completed && !fmc.dataHolder.preFlightDataHolder.finished && !fmc.dataHolder.preFlightDataHolder.takeOff.completed) {
			separator = '--------------------------------PRE-FLT';
		}


		fmc.setTemplate([
			['TAKEOFF REF', 1, 2],
			['FLAPS', 'V1'],
			[flapsCell, v1],
			['THRUST', 'VR'],
			[selectedTempCell, vR],
			['CG TRIM', 'V2'],
			['', v2],
			['RUNWAY POS', 'TOGW', '', 'GR WT'],
			[runwayCell + '/----', '', '', grWtCell],
			['TAKEOFF DATA', ''],
			['<REQUEST', '', ''],
			[separator],
			['\<INDEX', 'THRUST LIM>']
		]);

		if (fmc.dataHolder.preFlightDataHolder.completed && !fmc.dataHolder.preFlightDataHolder.finished) {
			let fmsPreFlightElement = document.createElement('div');
			fmsPreFlightElement.classList.add('fms-preflight');
			fmsPreFlightElement.setAttribute('style', 'display: block; position: absolute; background-color: #1daa05; height: 22px; width: 255px; font-size: 15px; text-align: center; border-radius: 11px; top: -5px; left: 107px; padding-top: 4px;');
			fmsPreFlightElement.innerText = 'FMC PREFLIGHT COMPLETE';
			document.body.querySelector('.separator-label').appendChild(fmsPreFlightElement);
		}

		fmc.onLeftInput[5] = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc.onRightInput[5] = () => {
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};

		fmc.onPrevPage = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}

	static ShowPage2(fmc) {
		fmc.clearDisplay();
		B787_10_FMC_TakeOffRefPage._timer = 0;
		fmc.pageUpdate = () => {
			B787_10_FMC_TakeOffRefPage._timer++;
			if (B787_10_FMC_TakeOffRefPage._timer >= 15) {
				B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
			}
		};

		let accelHtCell = '';
		if (isFinite(fmc._speedDirector._accelerationSpeedRestriction.accelerationHeight)) {
			accelHtCell = fastToFixed(fmc._speedDirector._accelerationSpeedRestriction.accelerationHeight);
		} else {
			accelHtCell = '---';
		}
		accelHtCell = fmc.makeSettable(accelHtCell);
		accelHtCell = accelHtCell + 'FT';
		fmc.onRightInput[1] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.trySetAccelerationHeight(value)) {
				B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
			}
		};

		let thrRedCell = '';
		if (isFinite(fmc.thrustReductionHeight)) {
			thrRedCell = fmc.thrustReductionHeight.toFixed(0);
		} else {
			thrRedCell = '---';
		}
		thrRedCell = fmc.makeSettable(thrRedCell);
		thrRedCell = thrRedCell + 'FT';
		fmc.onRightInput[2] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.trySetThrustReductionHeight(value)) {
				B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
			}
		};

		fmc.setTemplate([
			['TAKEOFF REF', 2, 2],
			['', 'EO ACCEL HT'],
			['', '1500FT'],
			['', 'ACCEL HT'],
			['', accelHtCell],
			['WIND', 'THR REDUCTION'],
			['000°/0KT', thrRedCell],
			['RWY WIND', 'LIM TOGW'],
			['0KTH 9KTR', ''],
			['SLOPE/COND', 'REF OAT'],
			['U0.0/DRY', '', ''],
			['__FMCSEPARATOR'],
			['\<INDEX', 'THRUST LIM>']
		]);

		fmc.onLeftInput[5] = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc.onRightInput[5] = () => {
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};

		fmc.onPrevPage = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}
}

B787_10_FMC_TakeOffRefPage._timer = 0;
//# sourceMappingURL=B787_10_FMC_TakeOffRefPage.js.map