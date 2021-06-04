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
			v1 = 'KT' + fmc.makeSettable(fmc.v1Speed);
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
			vR = 'KT' + fmc.makeSettable(fmc.vRSpeed);
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
			v2 = 'KT' + fmc.makeSettable(fmc.v2Speed);
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


		const selectedTemp = fmc.getThrustTakeOffTemp();
		let selectedTempCell = '[settable]' + selectedTemp + '[/settable]';
		selectedTempCell = selectedTempCell + '°C';

		let thrustTOMode = fmc.getThrustTakeOffMode();
		if(thrustTOMode === 0){
			selectedTempCell += ' ' + (selectedTemp ? 'D-TO': 'TO')
		} else if (thrustTOMode === 1){
			selectedTempCell += ' ' + (selectedTemp ? 'D-TO 1': 'TO 1')
		} else if (thrustTOMode === 2){
			selectedTempCell += ' ' + (selectedTemp ? 'D-TO 2': 'TO 2')
		}

		fmc.onLeftInput[1] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.setThrustTakeOffTemp(value)) {
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			}
		};





		let flapsCell = '---';
		let flapsAngle = fmc.getTakeOffFlap();
		if (isFinite(flapsAngle) && flapsAngle >= 0) {
			flapsCell = flapsAngle.toFixed(0);
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
		const useImperial = B787_10_FMC_HeavyConfigurationPage.useImperial();
		let grWtCell = '□□□.□';
		if (isFinite(fmc.getFuelVarsUpdatedGrossWeight(useImperial))) {
			grWtCell = fmc.getFuelVarsUpdatedGrossWeight(useImperial).toFixed(1) + (useImperial ? ' lb' : ' kg');
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
			['__FMCSEPARATOR'],
			['\<INDEX', '<THRUST LIM']
		]);
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

		let thrRedCell = '';
		if (isFinite(fmc.thrustReductionAltitude)) {
			thrRedCell = fmc.thrustReductionAltitude.toFixed(0);
		} else {
			thrRedCell = '---';
		}
		thrRedCell = fmc.makeSettable(thrRedCell);
		thrRedCell = 'FT' + thrRedCell;
		fmc.onRightInput[2] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.trySetThrustReductionAccelerationAltitude(value)) {
				B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
			}
		};

		fmc.setTemplate([
			['TAKEOFF REF', 2, 2],
			['', 'EO ACCEL HT'],
			['', '1500FT'],
			['', 'ACCEL HT'],
			['', '1500FT'],
			['WIND', 'THR REDUCTION'],
			['000°/0KT', thrRedCell],
			['RWY WIND', 'LIM TOGW'],
			['0KTH 9KTR', ''],
			['SLOPE/COND', 'REF OAT'],
			['U0.0/DRY', '', ''],
			['__FMCSEPARATOR'],
			['\<INDEX', '<THRUST LIM']
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