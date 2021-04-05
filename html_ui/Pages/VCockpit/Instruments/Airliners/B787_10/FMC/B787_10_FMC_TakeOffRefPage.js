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
		let thrRedCell = '';
		if (isFinite(fmc.thrustReductionAltitude)) {
			thrRedCell = fmc.thrustReductionAltitude.toFixed(0);
		} else {
			thrRedCell = '---';
		}
		thrRedCell = fmc.makeSettable(thrRedCell);
		thrRedCell += 'FT';
		fmc.onLeftInput[2] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.trySetThrustReductionAccelerationAltitude(value)) {
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
			runwayCell = 'RW ' + Avionics.Utils.formatRunway(selectedRunway.designation);
		}
		fmc.setTemplate([
			['TAKEOFF REF'],
			['FLAPS', 'V1'],
			[flapsCell, v1],
			['E/O ACCEL HT', 'VR'],
			['000FT', vR],
			['THR REDUCTION', 'V2'],
			[thrRedCell, v2],
			['WIND/SLOPE', 'CG', 'TRIM'],
			['H00/U0.0'],
			['RW COND', 'SHIFT', 'POS'],
			['DRY', '', runwayCell],
			['__FMCSEPARATOR'],
			['\<INDEX', '<THRUST LIM']
		]);
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc.onRightInput[5] = () => {
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}
}

B787_10_FMC_TakeOffRefPage._timer = 0;
//# sourceMappingURL=B787_10_FMC_TakeOffRefPage.js.map