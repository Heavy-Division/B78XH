import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_InitRefIndexPage} from './B787_10_FMC_InitRefIndexPage';
import {B787_10_FMC_ThrustLimPage} from './B787_10_FMC_ThrustLimPage';
import {BaseFMC} from './BaseFMC';
import * as HDSDK from './../../hdsdk/index';

export class B787_10_FMC_TakeOffRefPage {
	static _timer = 0;

	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		B787_10_FMC_TakeOffRefPage._timer = 0;
		fmc.pageUpdate = () => {
			B787_10_FMC_TakeOffRefPage._timer++;
			if (B787_10_FMC_TakeOffRefPage._timer >= 15) {
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			}
		};
		let v1 = '□□□';
		if (fmc.speedManager.repository.v1Speed) {
			v1 = fmc.makeSettable(String(fmc.speedManager.repository.v1Speed)) + 'KT';
		} else {
			v1 = fmc.makeSettable(v1);
		}
		fmc._renderer.rsk(1).event = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (value === BaseFMC.clrValue) {
				fmc.trySetV1Speed(undefined);
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else if (value === '') {
				const [runway, weight, flaps] = this.takeOffSetting(fmc);
				const computedSpeed = fmc.speedManager.getComputedV1Speed(runway, weight, flaps);
				fmc.speedManager.setV1Speed(computedSpeed, true);
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else {
				if (fmc.trySetV1Speed(value)) {
					B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
				}
			}
		};
		let vR = '□□□';
		if (fmc.speedManager.repository.vRSpeed) {
			vR = fmc.makeSettable(String(fmc.speedManager.repository.vRSpeed)) + 'KT';
		} else {
			vR = fmc.makeSettable(vR);
		}
		fmc._renderer.rsk(2).event = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (value === BaseFMC.clrValue) {
				fmc.trySetVRSpeed(undefined);
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else if (value === '') {
				const [runway, weight, flaps] = this.takeOffSetting(fmc);
				const computedSpeed = fmc.speedManager.getComputedVRSpeed(runway, weight, flaps);
				fmc.speedManager.setVRSpeed(computedSpeed, true);
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else {
				if (fmc.trySetVRSpeed(value)) {
					B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
				}
			}
		};
		let v2 = '□□□';
		if (fmc.speedManager.repository.v2Speed) {
			v2 = fmc.makeSettable(String(fmc.speedManager.repository.v2Speed)) + 'KT';
		} else {
			v2 = fmc.makeSettable(v2);
		}
		fmc._renderer.rsk(3).event = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (value === BaseFMC.clrValue) {
				fmc.trySetV2Speed(undefined);
				B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
			} else if (value === '') {
				const [runway, weight, flaps] = this.takeOffSetting(fmc);
				const computedSpeed = fmc.speedManager.getComputedV2Speed(runway, weight, flaps);
				fmc.speedManager.setV2Speed(computedSpeed, true);
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
			selectedTempCell = fmc.makeSettable(String(selectedTemp));
		} else {
			selectedTempCell = fmc.makeSettable('--');
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

		fmc._renderer.lsk(2).event = () => {
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
		fmc._renderer.lsk(1).event = () => {
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
			fmc._renderer.lsk(4).event = () => {
				let value = fmc.inOut;
				fmc.clearUserInput();
				fmc.setOriginRunway(value, (result) => {
					if (result) {
						B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
					}
				});
			};
		}
		const useImperial = HDSDK.HeavyDivision.Configuration.useImperial();
		let grWtCell = '□□□.□';
		if (isFinite(fmc.getFuelVarsUpdatedGrossWeight(useImperial))) {
			grWtCell = fmc.getFuelVarsUpdatedGrossWeight(useImperial).toFixed(1) + (useImperial ? ' lb' : ' kg');
		}

		let separator = '__FMCSEPARATOR';
		if (!fmc.dataHolder.preFlightDataHolder.completed && !fmc.dataHolder.preFlightDataHolder.finished && !fmc.dataHolder.preFlightDataHolder.takeOff.completed) {
			separator = '--------------------------------------PRE-FLT';
		}


		fmc._renderer.renderTitle('TAKEOFF REF');
		fmc._renderer.renderPages(1, 2);
		fmc._renderer.render([
			['FLAPS', 'V1'],
			[flapsCell, v1],
			['THRUST', 'VR'],
			[selectedTempCell, vR],
			['CG TRIM', 'V2'],
			['', v2],
			['RUNWAY POS', '', 'GR WT', 'TOGW'],
			[runwayCell + '/----', '', grWtCell, ''],
			['TAKEOFF DATA', ''],
			['<REQUEST', '', ''],
			['', separator, ''],
			['<INDEX', 'THRUST LIM>']
		]);

		if (fmc.dataHolder.preFlightDataHolder.completed && !fmc.dataHolder.preFlightDataHolder.finished) {
			let fmsPreFlightElementGroup = document.querySelector('#fms-preflight');
			fmsPreFlightElementGroup.setAttribute('visibility', 'visible');
		}

		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc._renderer.rsk(6).event = () => {
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};

		fmc.onPrevPage = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
		};
	}

	static ShowPage2(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		B787_10_FMC_TakeOffRefPage._timer = 0;
		fmc.pageUpdate = () => {
			B787_10_FMC_TakeOffRefPage._timer++;
			if (B787_10_FMC_TakeOffRefPage._timer >= 15) {
				B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
			}
		};

		let accelHtCell = '';
		if (isFinite(fmc._speedDirector.accelerationSpeedRestriction.accelerationHeight)) {
			accelHtCell = fastToFixed(fmc._speedDirector.accelerationSpeedRestriction.accelerationHeight);
		} else {
			accelHtCell = '---';
		}
		accelHtCell = fmc.makeSettable(accelHtCell);
		accelHtCell = accelHtCell + 'FT';
		fmc._renderer.rsk(2).event = () => {
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
		fmc._renderer.rsk(3).event = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.trySetThrustReductionHeight(value)) {
				B787_10_FMC_TakeOffRefPage.ShowPage2(fmc);
			}
		};

		fmc._renderer.renderTitle('TAKEOFF REF');
		fmc._renderer.renderPages(2, 2);

		fmc._renderer.render([
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
			['<INDEX', 'THRUST LIM>']
		]);

		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc._renderer.rsk(6).event = () => {
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};

		fmc.onPrevPage = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
		};
	}

	private static takeOffSetting(fmc): any[] {
		let runway = fmc.flightPlanManager.getDepartureRunway();
		if (!runway) {
			runway = fmc.flightPlanManager.getDetectedCurrentRunway();
		}
		const flaps = fmc.getTakeOffFlap();
		const weight = fmc.getWeight(true);
		return [runway, weight, flaps];
	}
}
