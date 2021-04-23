Include.addScript('/B78XH/Enums/B78XH_LocalVariables.js');

class B787_10_FMC extends Heavy_Boeing_FMC {
	constructor() {
		super(...arguments);
		this._registered = false;
		this._leftKeyElements = [];
		this._rightKeyElements = [];
		this.selectedApproachFlap = NaN;
		this.selectedApproachSpeed = NaN;
		this._climbN1Table = [
			[91, 91.6, 92.9, 94.1, 96.1, 97.6, 99.8, 101.2, 101.5, 100.7],
			[92.8, 93.2, 93.8, 93.1, 94.7, 96.2, 98.3, 99.7, 100.0, 99.2],
			[94.2, 95.0, 95.4, 94.8, 95.0, 94.9, 96.7, 98.2, 98.4, 97.7],
			[92.7, 95.5, 97.0, 96.4, 96.6, 96.5, 95.2, 96.6, 96.8, 96.1],
			[91.2, 93.9, 96.6, 97.9, 98.2, 98.0, 96.9, 95.5, 95.2, 94.5],
			[90.4, 93.1, 95.8, 97.3, 99.0, 98.9, 97.8, 96.5, 95.9, 95.2],
			[89.6, 92.3, 95.0, 96.5, 98.7, 99.7, 98.7, 97.6, 97.0, 96.3],
			[88.8, 91.5, 94.1, 95.6, 97.9, 99.6, 99.7, 98.6, 98.0, 97.3],
			[88.0, 90.7, 93.3, 94.8, 97.0, 98.7, 100.8, 99.6, 99.0, 98.3],
			[87.2, 89.8, 92.4, 93.9, 96.1, 97.8, 101.1, 100.8, 100.0, 99.3],
			[86.4, 89.0, 91.5, 93.0, 95.2, 96.8, 100.2, 101.4, 100.9, 100.3],
			[85.5, 88.1, 90.7, 92.1, 94.3, 95.9, 99.2, 101.0, 100.9, 100.8],
			[84.7, 87.3, 89.8, 91.2, 93.4, 95.0, 98.3, 100.0, 99.9, 99.9],
			[83.9, 86.4, 88.9, 90.3, 92.4, 94.0, 97.3, 99.0, 98.9, 98.9],
			[83.0, 85.5, 88.0, 89.4, 91.5, 93.1, 96.3, 98.0, 97.9, 97.9],
			[82.2, 84.7, 87.1, 88.5, 90.6, 92.1, 95.3, 97.0, 96.9, 96.8],
			[81.3, 83.8, 86.2, 87.5, 89.6, 91.2, 94.3, 96.0, 95.9, 95.8]
		];
		this._climbN1TempRow = [60, 50, 40, 30, 20, 15, 10, 5, 0, -5, -10, -15, -20, -25, -30, -35, -40];
		this._takeOffN1Table = [
			[89.7, 90.1, 90.6, 90.6, 90.6, 90.5, 90.4, 90.4, 90.3, 90.3, 89.7, 89.2, 88.5],
			[92.5, 93, 93.4, 93.4, 93.4, 93.3, 93.3, 93.2, 93.2, 93.2, 92.6, 92, 91.4],
			[93.9, 94.4, 94.8, 94.8, 94.8, 94.7, 94.6, 94.6, 94.6, 94.5, 94, 93.4, 92.8],
			[95.2, 95.7, 96.2, 96.1, 96.1, 96, 96, 95.9, 95.9, 95.9, 95.3, 94.7, 94.2],
			[96.5, 97, 97.5, 97.4, 97.3, 97.3, 97.3, 97.2, 97.2, 97.2, 96.6, 96, 95.5],
			[97.5, 98.2, 98.9, 98.7, 98.5, 98.4, 98.4, 98.5, 98.4, 98.4, 97.9, 97.3, 96.7],
			[97.8, 98.9, 99.8, 99.7, 99.7, 99.5, 99.3, 99.3, 99.2, 99.3, 8.8, 98.4, 98],
			[97.2, 98.8, 100.4, 100.4, 100.4, 100.4, 100.4, 100.1, 100, 99.9, 99.5, 99.2, 98.8],
			[96.4, 98, 99.6, 100.1, 100.7, 101.1, 101.1, 101.1, 101.7, 101.3, 100.3, 99.9, 99.5],
			[95.6, 97.2, 98.8, 99.3, 99.9, 100.5, 101.1, 101.8, 102.2, 102.4, 102.1, 101.5, 100.3],
			[94.8, 96.3, 97.9, 98.4, 99, 99.6, 1012, 101, 101.7, 102.5, 102.5, 102.2, 1011],
			[93.9, 95.5, 97.1, 97.6, 981, 98.8, 99.4, 100.1, 100.8, 101.6, 101.8, 102, 102.3],
			[93.1, 94.7, 96.2, 96.7, 97.3, 97.9, 98.5, 991, 99.9, 100.7, 100.9, 101.2, 101.4],
			[92.3, 93.8, 95.3, 95.8, 96.4, 97, 97.6, 98.3, 99.1, 99.8, 100, 100.3, 100.6],
			[90.6, 92.1, 93.6, 94.1, 94.6, 95.2, 95.9, 96.6, 97.3, 98, 8.3, 98.5, 98.8],
			[88.8, 90.3, 91.8, 92.3, 92.8, 93.4, 94.1, 94.8, 95.5, 96.3, 96.5, 96.7, 97],
			[87.0, 815, 89.9, 90.4, 91, 91.6, 92.3, 93, 93.7, 94.4, 94.7, 94.9, 95.2],
			[85.2, 86.7, 88.1, 88.6, 89.1, 89.8, 90.5, 91.2, 91.9, 92.6, 92.8, 93.1, 93.4],
			[83.4, 84.8, 861, 86.7, 87.3, 87.9, 88.6, 89.3, 90, 90.7, 91, 91.2, 91.5]
		];
		this._takeOffN1TempRow = [70, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0, -10, -20, -30, -40, -50];
		this._thrustTakeOffMode = 1;
		this._thrustCLBMode = 1;
		this._thrustTakeOffTemp = 20;
		this._lastUpdateAPTime = NaN;
		this.refreshFlightPlanCooldown = 0;
		this.updateAutopilotCooldown = 0;
		this._hasSwitchedToHoldOnTakeOff = false;
		this._previousApMasterStatus = false;
		this._apMasterStatus = false;
		this._apHasDeactivated = false;
		this._apHasActivated = false;
		this._previousAThrStatus = false;
		this._aThrStatus = false;
		this._aThrHasActivated = false;
		this._hasReachedTopOfDescent = false;
		this._apCooldown = 500;

		this._lastFMCCommandSpeedRestrictionValue = null;
		this._lastFMCCommandSelectedClimbSpeedValue = null;
		this._fmcCommandClimbSpeedType = null;
		this._lastFmcCommandClimbSpeedType = null;
		this._fmcCommandCruiseSpeedType = null;
		this._lastFmcCommandCruiseSpeedType = null;
	}

	get templateID() {
		return 'B787_10_FMC';
	}

	get instrumentAlias() {
		return 'AS01B_FMC';
	}

	get isInteractive() {
		return true;
	}

	connectedCallback() {
		super.connectedCallback();
		RegisterViewListener('JS_LISTENER_KEYEVENT', () => {
			console.log('JS_LISTENER_KEYEVENT registered.');
			RegisterViewListener('JS_LISTENER_FACILITY', () => {
				console.log('JS_LISTENER_FACILITY registered.');
				this._registered = true;
			});
		});
	}

	Init() {
		super.Init();
		this.aircraftType = Aircraft.AS01B;
		if (this.urlConfig.index == 1) {
			let oat = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
			this._thrustTakeOffTemp = Math.ceil(oat / 10) * 10;
			this.onInit = () => {
				B787_10_FMC_InitRefIndexPage.ShowPage1(this);
			};
			this.onLegs = () => {
				B787_10_FMC_LegsPage.ShowPage1(this);
			};
			this.onRte = () => {
				B787_10_FMC_RoutePage.ShowPage1(this);
			};
			this.onRad = () => {
				B787_10_FMC_NavRadioPage.ShowPage(this);
			};
			this.onVNAV = () => {
				new B787_10_FMC_VNAVPage(this).showPage();
			};
			this._pointer = this.getChildById('fms-pointer');
			this._pointer.style.zIndex = '5';
			this._pointer.style.position = 'fixed';
			this._pointer.style.width = '36px';
			this._pointer.style.height = '36px';
			this._pointer.style.pointerEvents = 'none';
			this._execLight = this.querySelector('.fms-exec-light');
			document.body.addEventListener('mousemove', (e) => {
				let x = e.clientX - 18;
				let y = e.clientY - 18;
				this._pointer.style.left = x + 'px';
				this._pointer.style.top = y + 'px';
			});
			document.body.style.overflow = 'hidden';
			document.body.style.clip = 'auto';
			document.body.style.position = 'absolute';
			this.getChildById('.fms-init-ref').addEventListener('mouseup', () => {
				B787_10_FMC_InitRefIndexPage.ShowPage1(this);
			});
			this.getChildById('.fms-rte').addEventListener('mouseup', () => {
				B787_10_FMC_RoutePage.ShowPage1(this);
			});
			this.getChildById('.fms-dep-arr').addEventListener('mouseup', () => {
				B787_10_FMC_DepArrPage.ShowPage1(this);
			});
			this.getChildById('.fms-nav-rad').addEventListener('mouseup', () => {
				B787_10_FMC_NavRadioPage.ShowPage(this);
			});
			this.getChildById('.fms-prog').addEventListener('mouseup', () => {
				B787_10_FMC_ProgressPage.ShowPage1(this);
			});
			this.getChildById('.fms-fmc-comm').addEventListener('mouseup', () => {
				B787_10_FMC_FMCCommPage.ShowPage1(this);
			});
			this.getChildById('.fms-legs').addEventListener('mouseup', () => {
				B787_10_FMC_LegsPage.ShowPage1(this);
			});
			this.getChildById('.fms-vnav').addEventListener('mouseup', () => {
				new B787_10_FMC_VNAVPage(this).showPage();
			});
			this.getChildById('.fms-exec').addEventListener('mouseup', () => {
				if (this.onExec) {
					this.onExec();
				}
			});
			this.getChildById('.fms-prev-page').addEventListener('mouseup', () => {
				if (this.onPrevPage) {
					this.onPrevPage();
				}
			});
			this.getChildById('.fms-next-page').addEventListener('mouseup', () => {
				if (this.onNextPage) {
					this.onNextPage();
				}
			});
			if (!B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
				this.getChildById('.fms-heavy').addEventListener('mouseup', () => {
					B787_10_FMC_HeavyPage.ShowPage1(this);
				});
			}
		}

		if (B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
			this.getChildById('.fms-heavy').classList.add('fms-empty');
		}

		this._inOutElement = this.getChildById('.fms-io-buffer');
		this._titleElement = this.getChildById('.fms-screen-title');
		this._pageCurrentElement = this.getChildById('.fms-screen-page');
		this._pageCountElement = this.getChildById('.fms-screen-page');
		this._labelElements = [];
		let allLabelContainers = this.getChildrenById('.fms-screen-label-container');
		for (let i = 0; i < allLabelContainers.length; i++) {
			this._labelElements[i] = [];
			let labelContainer = allLabelContainers[i];
			if (labelContainer) {
				this._labelElements[i][0] = labelContainer.querySelector('.col-0');
				this._labelElements[i][1] = labelContainer.querySelector('.col-3');
				this._labelElements[i][2] = labelContainer.querySelector('.col-1');
				this._labelElements[i][3] = labelContainer.querySelector('.col-2');
			}
		}
		this._lineElements = [];
		let allLineContainers = this.getChildrenById('.fms-screen-line-container');
		for (let i = 0; i < allLineContainers.length; i++) {
			this._lineElements[i] = [];
			let lineContainer = allLineContainers[i];
			if (lineContainer) {
				this._lineElements[i][0] = lineContainer.querySelector('.col-0');
				this._lineElements[i][1] = lineContainer.querySelector('.col-3');
				this._lineElements[i][2] = lineContainer.querySelector('.col-1');
				this._lineElements[i][3] = lineContainer.querySelector('.col-2');
			}
		}
		let leftKeysContainer = this.getChildById('.fms-side-container.left').children;
		for (let i = 0; i < leftKeysContainer.length; i++) {
			let leftKeyElement = leftKeysContainer[i];
			if (leftKeyElement instanceof HTMLInputElement) {
				this._leftKeyElements[i] = leftKeyElement;
			}
		}
		let rightKeysContainer = this.getChildById('.fms-side-container.right').children;
		for (let i = 0; i < rightKeysContainer.length; i++) {
			let rightKeyElement = rightKeysContainer[i];
			if (rightKeyElement instanceof HTMLInputElement) {
				this._rightKeyElements[i] = rightKeyElement;
			}
		}
		B787_10_FMC_IdentPage.ShowPage1(this);
	}

	onPowerOn() {
		super.onPowerOn();
		this.deactivateLNAV();
		this.deactivateVNAV();
		Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.HOLD);
	}

	onUpdate(_deltaTime) {
		super.onUpdate(_deltaTime);
		if (this.urlConfig.index != 1) {
			return;
		}
		this.updateAutopilot();
		this._updateTimeAndDate();
	}

	_updateTimeAndDate() {
		if (!this._timeDivs) {
			this._timeDivs = document.body.querySelectorAll('.fms-time');
		}
		if (!this._dateDivs) {
			this._dateDivs = document.body.querySelectorAll('.fms-date');
		}
		if (this._timeDivs && this._dateDivs) {
			let t = SimVar.GetGlobalVarValue('ZULU TIME', 'seconds');
			let hours = Math.floor(t / 3600);
			let minutes = Math.floor((t - hours * 3600) / 60);
			let seconds = t - hours * 3600 - minutes * 60;
			let timeText = hours.toFixed(0).padStart(2, '0') + ':' + minutes.toFixed(0).padStart(2, '0') + ':' + seconds.toFixed(0).padStart(2, '0');
			let y = SimVar.GetGlobalVarValue('ZULU YEAR', 'number');
			let m = SimVar.GetGlobalVarValue('ZULU MONTH OF YEAR', 'number');
			let d = SimVar.GetGlobalVarValue('ZULU DAY OF MONTH', 'number');
			let dateText = d.toFixed(0) + ' ' + B787_10_FMC._MonthOfYear[m - 1] + ' ' + y.toFixed(0);
			this._timeDivs.forEach(d => {
				d.innerText = timeText;
			});
			this._dateDivs.forEach(d => {
				d.innerText = dateText;
			});
		}
	}

	onInputAircraftSpecific(input) {
		console.log('B787_10_FMC.onInputAircraftSpecific input = \'' + input + '\'');
		if (input === 'LEGS') {
			if (this.onLegs) {
				this.onLegs();
			}
			return true;
		}
		if (input === 'RTE') {
			if (this.onRte) {
				this.onRte();
			}
			return true;
		}
		if (input === 'VNAV') {
			if (this.onVNAV) {
				this.onVNAV();
			}
			return true;
		}
		return false;
	}

	_getIndexFromTemp(temp) {
		if (temp < -10)
			return 0;
		if (temp < 0)
			return 1;
		if (temp < 10)
			return 2;
		if (temp < 20)
			return 3;
		if (temp < 30)
			return 4;
		if (temp < 40)
			return 5;
		if (temp < 43)
			return 6;
		if (temp < 45)
			return 7;
		if (temp < 47)
			return 8;
		if (temp < 49)
			return 9;
		if (temp < 51)
			return 10;
		if (temp < 53)
			return 11;
		if (temp < 55)
			return 12;
		if (temp < 57)
			return 13;
		if (temp < 59)
			return 14;
		if (temp < 61)
			return 15;
		if (temp < 63)
			return 16;
		if (temp < 65)
			return 17;
		if (temp < 66)
			return 18;
		return 19;
	}

	_computeV1Speed() {
		console.log('Computing V1...');
		let runwayCoef = 1.0;
		{
			let runway = this.flightPlanManager.getDepartureRunway();
			if (!runway) {
				runway = this.flightPlanManager.getDetectedCurrentRunway();
			}
			if (runway) {
				console.log('Runway length = ' + runway.length);
				let f = (runway.length - 2250) / (3250 - 2250);
				runwayCoef = Utils.Clamp(f, 0, 1);
			} else {
				console.log('No Runway');
			}
		}
		let w = this.getWeight(true);
		console.log('Weight = ' + w);
		let dWeightCoeff = (w - 350) / (560 - 350);
		dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
		dWeightCoeff = 0.90 + (1.16 - 0.9) * dWeightCoeff;
		let flapsHandleIndex = Simplane.getFlapsHandleIndex();
		let temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		let index = this._getIndexFromTemp(temp);
		console.log('Temperature = ' + temp + ' (index ' + index + ')');
		let min = B787_10_FMC._v1s[index][0];
		let max = B787_10_FMC._v1s[index][1];
		this.v1Speed = min * (1 - runwayCoef) + max * runwayCoef;
		this.v1Speed *= dWeightCoeff;
		this.v1Speed -= flapsHandleIndex * 5;
		this.v1Speed = Math.round(this.v1Speed);
		this.customV1Speed = false;
		SimVar.SetSimVarValue('L:AIRLINER_V1_SPEED', 'Knots', this.v1Speed);
		console.log('V1 = ' + this.v1Speed);
	}

	_computeVRSpeed() {
		console.log('Computing VR...');
		let runwayCoef = 1.0;
		{
			let runway = this.flightPlanManager.getDepartureRunway();
			if (!runway) {
				runway = this.flightPlanManager.getDetectedCurrentRunway();
			}
			if (runway) {
				console.log('Runway length = ' + runway.length);
				let f = (runway.length - 2250) / (3250 - 2250);
				runwayCoef = Utils.Clamp(f, 0, 1);
			} else {
				console.log('No Runway');
			}
		}
		let w = this.getWeight(true);
		console.log('Weight = ' + w);
		let dWeightCoeff = (w - 350) / (560 - 350);
		dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
		dWeightCoeff = 0.99 + (1.215 - 0.99) * dWeightCoeff;
		let flapsHandleIndex = Simplane.getFlapsHandleIndex();
		let temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		let index = this._getIndexFromTemp(temp);
		console.log('Temperature = ' + temp + ' (index ' + index + ')');
		let min = B787_10_FMC._vRs[index][0];
		let max = B787_10_FMC._vRs[index][1];
		this.vRSpeed = min * (1 - runwayCoef) + max * runwayCoef;
		this.vRSpeed *= dWeightCoeff;
		this.vRSpeed -= flapsHandleIndex * 5;
		this.vRSpeed = Math.round(this.vRSpeed);
		this.customVRSpeed = false;
		SimVar.SetSimVarValue('L:AIRLINER_VR_SPEED', 'Knots', this.vRSpeed);
		console.log('VR = ' + this.vRSpeed);
	}

	_computeV2Speed() {
		console.log('Computing V2...');
		let runwayCoef = 1.0;
		{
			let runway = this.flightPlanManager.getDepartureRunway();
			if (!runway) {
				runway = this.flightPlanManager.getDetectedCurrentRunway();
			}
			if (runway) {
				console.log('Runway length = ' + runway.length);
				let f = (runway.length - 2250) / (3250 - 2250);
				runwayCoef = Utils.Clamp(f, 0.0, 1.0);
			} else {
				console.log('No Runway');
			}
		}
		let weight = this.getWeight(true);
		console.log('Weight = ' + weight);
		let dWeightCoeff = (weight - 350) / (560 - 350);
		dWeightCoeff = Utils.Clamp(dWeightCoeff, 0, 1);
		dWeightCoeff = 1.03 + (1.23 - 1.03) * dWeightCoeff;
		let flapsHandleIndex = Simplane.getFlapsHandleIndex();
		let temp = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		let index = this._getIndexFromTemp(temp);
		console.log('Temperature = ' + temp + ' (index ' + index + ')');
		let min = B787_10_FMC._v2s[index][0];
		let max = B787_10_FMC._v2s[index][1];
		this.v2Speed = min * (1 - runwayCoef) + max * runwayCoef;
		this.v2Speed *= dWeightCoeff;
		this.v2Speed -= flapsHandleIndex * 5;
		this.v2Speed = Math.round(this.v2Speed);
		this.customV2Speed = false;
		SimVar.SetSimVarValue('L:AIRLINER_V2_SPEED', 'Knots', this.v2Speed);
		console.log('VR = ' + this.v2Speed);
	}

	getFlapTakeOffSpeed() {
		let dWeight = (this.getWeight(true) - 500) / (900 - 500);
		return 134 + 40 * dWeight;
	}

	getSlatTakeOffSpeed() {
		let dWeight = (this.getWeight(true) - 500) / (900 - 500);
		return 183 + 40 * dWeight;
	}

	getCleanTakeOffSpeed() {
		let dWeight = (this.getWeight(true) - 500) / (900 - 500);
		return 204 + 40 * dWeight;
	}

	getClbManagedSpeed() {
		let dCI = this.getCostIndexFactor();
		let speed = 310 * (1 - dCI) + 330 * dCI;
		if (this.overSpeedLimitThreshold) {
			if (Simplane.getAltitude() < 9800) {
				if (!this._climbSpeedTransitionDeleted) {
					speed = Math.min(speed, 250);
				}
				this.overSpeedLimitThreshold = false;
			}
		} else if (!this.overSpeedLimitThreshold) {
			if (Simplane.getAltitude() < 10000) {
				if (!this._climbSpeedTransitionDeleted) {
					speed = Math.min(speed, 250);
				}
			} else {
				if (!this._isFmcCurrentPageUpdatedAboveTenThousandFeet) {
					SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
					this._isFmcCurrentPageUpdatedAboveTenThousandFeet = true;
				}
				this.overSpeedLimitThreshold = true;
			}
		}
		return speed;
	}

	getEconClbManagedSpeed() {
		return this.getEconCrzManagedSpeed();
	}

	getEconCrzManagedSpeed() {
		return this.getCrzManagedSpeed(true);
	}

	getCrzManagedSpeed(highAltitude = false) {
		let dCI = this.getCostIndexFactor();
		dCI = dCI * dCI;
		let speed = 310 * (1 - dCI) + 330 * dCI;
		if (!highAltitude) {
			if (this.overSpeedLimitThreshold) {
				if (Simplane.getAltitude() < 9800) {
					speed = Math.min(speed, 250);
					this.overSpeedLimitThreshold = false;
				}
			} else if (!this.overSpeedLimitThreshold) {
				if (Simplane.getAltitude() < 10000) {
					speed = Math.min(speed, 250);
				} else {
					this.overSpeedLimitThreshold = true;
				}
			}
		}
		return speed;
	}

	getDesManagedSpeed() {
		let dCI = this.getCostIndexFactor();
		let speed = 280 * (1 - dCI) + 300 * dCI;
		if (this.overSpeedLimitThreshold) {
			if (Simplane.getAltitude() < 9800) {
				speed = Math.min(speed, 250);
				this.overSpeedLimitThreshold = false;
			}
		} else if (!this.overSpeedLimitThreshold) {
			if (Simplane.getAltitude() < 10000) {
				speed = Math.min(speed, 250);
			} else {
				this.overSpeedLimitThreshold = true;
			}
		}
		return speed;
	}

	getVRef(flapsHandleIndex = NaN) {
		if (isNaN(flapsHandleIndex)) {
			flapsHandleIndex = Simplane.getFlapsHandleIndex();
		}
		let dWeight = (this.getWeight(true) - 200) / (528 - 200);
		let min = 198;
		let max = 250;
		if (flapsHandleIndex >= 9) {
			min = 119;
			max = 171;
		} else if (flapsHandleIndex >= 8) {
			min = 119;
			max = 174;
		} else if (flapsHandleIndex >= 7) {
			min = 138;
			max = 182;
		} else if (flapsHandleIndex >= 4) {
			min = 138;
			max = 182;
		} else if (flapsHandleIndex >= 2) {
			min = 158;
			max = 210;
		} else if (flapsHandleIndex >= 1) {
			min = 173;
			max = 231;
		}
		return min + (max - min) * dWeight;
	}

	getManagedApproachSpeed(flapsHandleIndex = NaN) {
		return this.getVRef(flapsHandleIndex) - 5;
	}

	getCleanApproachSpeed() {
		let dWeight = (this.getWeight(true) - 200) / (528 - 200);
		return 121 + 56 * dWeight;
	}

	getSlatApproachSpeed(useCurrentWeight = true) {
		if (isFinite(this._overridenSlatApproachSpeed)) {
			return this._overridenSlatApproachSpeed;
		}
		let dWeight = ((useCurrentWeight ? this.getWeight(true) : this.zeroFuelWeight) - 200) / (528 - 200);
		return 119 + 58 * dWeight;
	}

	getFlapApproachSpeed(useCurrentWeight = true) {
		if (isFinite(this._overridenFlapApproachSpeed)) {
			return this._overridenFlapApproachSpeed;
		}
		let dWeight = ((useCurrentWeight ? this.getWeight(true) : this.zeroFuelWeight) - 200) / (528 - 200);
		return 119 + 53 * dWeight;
	}

	getVLS() {
		let flapsHandleIndex = Simplane.getFlapsHandleIndex();
		if (flapsHandleIndex === 4) {
			let dWeight = (this.getWeight(true) - 200) / (528 - 200);
			return 110 + 52 * dWeight;
		} else {
			let dWeight = (this.getWeight(true) - 200) / (528 - 200);
			return 115 + 53 * dWeight;
		}
	}

	setSelectedApproachFlapSpeed(s) {
		let flap = NaN;
		let speed = NaN;
		if (s) {
			let sSplit = s.split('/');
			flap = parseInt(sSplit[0]);
			speed = parseInt(sSplit[1]);
		}
		if (isFinite(flap) || isFinite(speed)) {
			if (isFinite(flap) && flap >= 0 && flap < 60) {
				this.selectedApproachFlap = flap;
			}
			if (isFinite(speed) && speed >= 10 && speed < 300) {
				this.selectedApproachSpeed = speed;
			}
			return true;
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}

	clearDisplay() {
		super.clearDisplay();
		this.onPrevPage = EmptyCallback.Void;
		this.onNextPage = EmptyCallback.Void;
	}

	getClimbThrustN1(temperature, altitude) {
		let lineIndex = 0;
		for (let i = 0; i < this._climbN1TempRow.length; i++) {
			lineIndex = i;
			if (temperature > this._climbN1TempRow[i]) {
				break;
			}
		}
		let rowIndex = Math.floor(altitude / 5000);
		rowIndex = Math.max(0, rowIndex);
		rowIndex = Math.min(rowIndex, this._climbN1Table[0].length - 1);
		return this._climbN1Table[lineIndex][rowIndex];
	}

	getTakeOffThrustN1(temperature, airportAltitude) {
		let lineIndex = 0;
		for (let i = 0; i < this._takeOffN1TempRow.length; i++) {
			lineIndex = i;
			if (temperature > this._takeOffN1TempRow[i]) {
				break;
			}
		}
		let rowIndex = Math.floor(airportAltitude / 1000) + 2;
		rowIndex = Math.max(0, rowIndex);
		rowIndex = Math.min(rowIndex, this._takeOffN1Table[0].length - 1);
		return this._takeOffN1Table[lineIndex][rowIndex];
	}

	getThrustTakeOffMode() {
		return this._thrustTakeOffMode;
	}

	setThrustTakeOffMode(m) {
		if (m >= 0 && m <= 2) {
			this._thrustTakeOffMode = m;
		}
	}

	getThrustCLBMode() {
		return this._thrustCLBMode;
	}

	setThrustCLBMode(m) {
		if (m >= 0 && m <= 2) {
			this._thrustCLBMode = m;
		}
	}

	getThrustTakeOffTemp() {
		return this._thrustTakeOffTemp;
	}

	setThrustTakeOffTemp(s) {
		let v = parseFloat(s);
		if (isFinite(v)) {
			let oat = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
			if (v >= oat && v < 80) {
				this._thrustTakeOffTemp = v;
				return true;
			}
			this.showErrorMessage('OUT OF RANGE');
			return false;
		}
		this.showErrorMessage(this.defaultInputErrorMessage);
		return false;
	}

	getThrustTakeOffLimit() {
		let airport = this.flightPlanManager.getOrigin();
		if (airport) {
			let altitude = airport.infos.coordinates.alt;
			return this.getTakeOffThrustN1(this.getThrustTakeOffTemp(), altitude) - this.getThrustTakeOffMode() * 10;
		}
		return 100;
	}

	getThrustClimbLimit() {
		let altitude = Simplane.getAltitude();
		let temperature = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		return this.getClimbThrustN1(temperature, altitude) - this.getThrustCLBMode() * 8.6;
	}

	onEvent(_event) {
		if (_event.indexOf('AP_ALT_INTERVENTION') != -1) {

			SimVar.SetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number', 1);

			let shouldOverrideCruiseAltitude = false;
			let altitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
			if (altitude >= this.cruiseFlightLevel * 100 && this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
				shouldOverrideCruiseAltitude = true;
				SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 0);
			}

			if (altitude < this.cruiseFlightLevel * 100 && this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {
				shouldOverrideCruiseAltitude = true;
				SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 0);
			}

			if (altitude <= this.cruiseFlightLevel * 100 && SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_AVAILABLE', 'Number') && !SimVar.GetSimVarValue('L:B78XH_DESCENT_NOW_ACTIVATED', 'Number')) {
				this.currentFlightPhase = FlightPhase.FLIGHT_PHASE_DESCENT;
				SimVar.SetSimVarValue('L:B78XH_DESCENT_NOW_ACTIVATED', 'Number', 1);
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
				return;
			}

			if (SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number') && !shouldOverrideCruiseAltitude) {
				SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 0);
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
				return;
			}

			if (SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number')) {
				SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
				return;
			}
			SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'number', 1);
		}
		super.onEvent(_event);
	}

	updateAutopilot() {
		let now = performance.now();
		let dt = now - this._lastUpdateAPTime;
		this._lastUpdateAPTime = now;
		if (isFinite(dt)) {
			this.updateAutopilotCooldown -= dt;
		}
		if (SimVar.GetSimVarValue('L:AIRLINER_FMC_FORCE_NEXT_UPDATE', 'number') === 1) {
			SimVar.SetSimVarValue('L:AIRLINER_FMC_FORCE_NEXT_UPDATE', 'number', 0);
			this.updateAutopilotCooldown = -1;
		}
		if (this.updateAutopilotCooldown < 0) {
			let currentApMasterStatus = SimVar.GetSimVarValue('AUTOPILOT MASTER', 'boolean');
			if (currentApMasterStatus != this._apMasterStatus) {
				this._apMasterStatus = currentApMasterStatus;
				this._forceNextAltitudeUpdate = true;
			}
			this._apHasDeactivated = !currentApMasterStatus && this._previousApMasterStatus;
			this._apHasActivated = currentApMasterStatus && !this._previousApMasterStatus;
			this._previousApMasterStatus = currentApMasterStatus;
			let currentAThrMasterStatus = Simplane.getAutoPilotThrottleActive(1);
			if (currentAThrMasterStatus != this._aThrStatus) {
				this._aThrStatus = currentAThrMasterStatus;
			}
			this._aThrHasActivated = currentAThrMasterStatus && !this._previousAThrStatus;
			this._previousAThrStatus = currentAThrMasterStatus;
			if (this.currentFlightPhase <= FlightPhase.FLIGHT_PHASE_TAKEOFF) {
				let n1 = this.getThrustTakeOffLimit() / 100;
				SimVar.SetSimVarValue('AUTOPILOT THROTTLE MAX THRUST', 'number', n1);
			}
			if (this._apHasActivated) {
				if (!this.getIsVNAVArmed() && !this.getIsVNAVActive()) {
					this.activateSPD();
					this.activateVSpeed();
				} else {
					this.activateVNAV();
				}
				if (!this.getIsLNAVArmed() && !this.getIsLNAVActive()) {
					this.activateHeadingHold();
				} else {
					this.activateLNAV();
				}
			}
			if (this._aThrHasActivated) {
				if (this.getIsSPDActive()) {
					this.activateSPD();
				}
			}
			if (!this.getIsAltitudeHoldActive()) {
				Coherent.call('AP_ALT_VAR_SET_ENGLISH', 1, Simplane.getAutoPilotDisplayedAltitudeLockValue(), this._forceNextAltitudeUpdate);
			}
			let vRef = 0;
			if (this.currentFlightPhase >= FlightPhase.FLIGHT_PHASE_DESCENT) {
				vRef = 1.3 * Simplane.getStallSpeed();
			}
			SimVar.SetSimVarValue('L:AIRLINER_VREF_SPEED', 'knots', vRef);
			if (this._pendingLNAVActivation) {
				let altitude = Simplane.getAltitudeAboveGround();
				if (altitude > 50) {
					this._pendingLNAVActivation = false;
					this.doActivateLNAV();
				}
			}
			if (this._pendingVNAVActivation) {
				let altitude = Simplane.getAltitudeAboveGround();
				if (altitude > 400) {
					this._pendingVNAVActivation = false;
					this.doActivateVNAV();
				}
			}
			if (SimVar.GetSimVarValue('L:AP_VNAV_ACTIVE', 'number') === 1) {
				let targetAltitude = Simplane.getAutoPilotAltitudeLockValue();
				let altitude = Simplane.getAltitude();
				let deltaAltitude = Math.abs(targetAltitude - altitude);
				if (deltaAltitude > 1000) {
					if (!Simplane.getAutoPilotFLCActive()) {
						SimVar.SetSimVarValue('K:FLIGHT_LEVEL_CHANGE_ON', 'Number', 1);
					}
				}
			}
			if (this.getIsFLCHActive()) {
				let targetAltitude = Simplane.getAutoPilotAltitudeLockValue();
				let altitude = Simplane.getAltitude();
				let deltaAltitude = Math.abs(targetAltitude - altitude);
				if (deltaAltitude < 150) {
					this.activateAltitudeHold(true);
				}
			}
			if (this.getIsVSpeedActive()) {
				let targetAltitude = Simplane.getAutoPilotAltitudeLockValue();
				let altitude = Simplane.getAltitude();
				let deltaAltitude = Math.abs(targetAltitude - altitude);
				if (deltaAltitude < 150) {
					this.activateAltitudeHold(true);
				}
			}
			if (this._pendingHeadingSelActivation) {
				let altitude = Simplane.getAltitudeAboveGround();
				if (altitude > 400) {
					this._pendingHeadingSelActivation = false;
					this.doActivateHeadingSel();
				}
			}
			if (this._pendingSPDActivation) {
				let altitude = Simplane.getAltitudeAboveGround();
				if (altitude > 400) {
					this._pendingSPDActivation = false;
					this.doActivateSPD();
				}
			}
			if (Simplane.getAutoPilotGlideslopeActive()) {
				if (this.getIsVNAVActive()) {
					this.deactivateVNAV();
				}
				if (this.getIsVSpeedActive()) {
					this.deactivateVSpeed();
				}
				if (this.getIsAltitudeHoldActive()) {
					this.deactivateAltitudeHold();
				}
				this.activateSPD();
				if (SimVar.GetSimVarValue('AUTOPILOT ALTITUDE LOCK', 'Boolean')) {
					SimVar.SetSimVarValue('K:AP_PANEL_ALTITUDE_HOLD', 'Number', 1);
				}
			}
			let currentAltitude = Simplane.getAltitude();
			let groundSpeed = Simplane.getGroundSpeed();
			let apTargetAltitude = Simplane.getAutoPilotAltitudeLockValue('feet');
			let planeHeading = Simplane.getHeadingMagnetic();
			let planeCoordinates = new LatLong(SimVar.GetSimVarValue('PLANE LATITUDE', 'degree latitude'), SimVar.GetSimVarValue('PLANE LONGITUDE', 'degree longitude'));
			if (this.getIsVNAVActive()) {
				let prevWaypoint = this.flightPlanManager.getPreviousActiveWaypoint();
				let nextWaypoint = this.flightPlanManager.getActiveWaypoint();
				if (nextWaypoint && (nextWaypoint.legAltitudeDescription === 3 || nextWaypoint.legAltitudeDescription === 4)) {
					let selectedAltitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
					if (!this.flightPlanManager.getIsDirectTo() &&
						isFinite(nextWaypoint.legAltitude1) &&
						nextWaypoint.legAltitude1 < 20000 &&
						nextWaypoint.legAltitude1 > selectedAltitude &&
						Simplane.getAltitude() > nextWaypoint.legAltitude1 - 200) {
						Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, nextWaypoint.legAltitude1, this._forceNextAltitudeUpdate);
						this._forceNextAltitudeUpdate = false;
						SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 1);
					} else {
						let altitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
						if (isFinite(altitude)) {
							Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, this.cruiseFlightLevel * 100, this._forceNextAltitudeUpdate);
							this._forceNextAltitudeUpdate = false;
							SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
						}
					}
				} else {

					let altitude = Simplane.getAutoPilotSelectedAltitudeLockValue('feet');
					if (isFinite(altitude)) {
						/**
						 * TODO: Temporary level off during climb
						 */

						let isLevelOffActive = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number');
						if ((altitude < this.cruiseFlightLevel * 100 || isLevelOffActive) && this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
							if (Simplane.getAutoPilotAltitudeLockActive()) {
								SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 1);
							}
							if (!isLevelOffActive) {
								Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, altitude, this._forceNextAltitudeUpdate);
								this._forceNextAltitudeUpdate = false;
								SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
							}
						} else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT || this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
							/**
							 * Descent new implementation
							 */

							let nextAltitude = (isFinite(nextWaypoint.legAltitude1) ? Math.round(nextWaypoint.legAltitude1) : (isFinite(nextWaypoint.altitudeinFP) ? Math.round(nextWaypoint.altitudeinFP) : NaN));
							let selectedAltitude = altitude;
							this._selectedAltitude = altitude;
							let shouldEnableLevelOff = null;
							let needUpdateAltitude = false;
							let targetAltitude = NaN;

							if (nextAltitude >= selectedAltitude) {
								shouldEnableLevelOff = false;
								targetAltitude = nextAltitude;
							} else if (nextAltitude < selectedAltitude) {
								shouldEnableLevelOff = true;
								targetAltitude = selectedAltitude;
							}

							this._descentTargetAltitude = targetAltitude;

							if (this._lastDescentTargetAltitude !== this._descentTargetAltitude) {
								this._lastDescentTargetAltitude = this._descentTargetAltitude;
								needUpdateAltitude = true;
							}

							if (this._lastSelectedAltitude !== this._selectedAltitude) {
								this._lastSelectedAltitude = this._selectedAltitude;
								needUpdateAltitude = true;
							}

							let altitudeInterventionPushed = SimVar.GetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number');

							if (altitudeInterventionPushed) {
								needUpdateAltitude = true;
								SimVar.SetSimVarValue('L:B78XH_DESCENT_ALTITUDE_INTERVENTION_PUSHED', 'Number', 0);
							}


							if (Simplane.getAutoPilotAltitudeLockActive()) {
								if (shouldEnableLevelOff) {
									SimVar.SetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number', 1);
								}
							}

							let isLevelOffActive = SimVar.GetSimVarValue(B78XH_LocalVariables.VNAV.CLIMB_LEVEL_OFF_ACTIVE, 'Number');

							if (!isLevelOffActive || altitudeInterventionPushed) {
								if (isFinite(targetAltitude) && needUpdateAltitude) {
									Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, targetAltitude, this._forceNextAltitudeUpdate);
									this._forceNextAltitudeUpdate = false;
									SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
								}
							}

						} else {
							Coherent.call('AP_ALT_VAR_SET_ENGLISH', 2, this.cruiseFlightLevel * 100, this._forceNextAltitudeUpdate);
							this._forceNextAltitudeUpdate = false;
							SimVar.SetSimVarValue('L:AP_CURRENT_TARGET_ALTITUDE_IS_CONSTRAINT', 'number', 0);
						}
					}
				}
			} else if (!this.getIsFLCHActive() && this.getIsSPDActive()) {
				this.setAPSpeedHoldMode();
			}
			if (this.getIsVNAVArmed() && !this.getIsVNAVActive()) {
				if (Simplane.getAutoPilotThrottleArmed()) {
					if (!this._hasSwitchedToHoldOnTakeOff) {
						let speed = Simplane.getIndicatedSpeed();
						if (speed > 80) {
							Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.HOLD);
							this._hasSwitchedToHoldOnTakeOff = true;
						}
					}
				}
			}
			if (this._isHeadingHoldActive) {
				Coherent.call('HEADING_BUG_SET', 2, this._headingHoldValue);
			}
			if (!this.flightPlanManager.isActiveApproach() && this.currentFlightPhase != FlightPhase.FLIGHT_PHASE_APPROACH) {
				let activeWaypoint = this.flightPlanManager.getActiveWaypoint();
				let nextActiveWaypoint = this.flightPlanManager.getNextActiveWaypoint();
				if (activeWaypoint && nextActiveWaypoint) {
					let pathAngle = nextActiveWaypoint.bearingInFP - activeWaypoint.bearingInFP;
					while (pathAngle < 180) {
						pathAngle += 360;
					}
					while (pathAngle > 180) {
						pathAngle -= 360;
					}
					let absPathAngle = 180 - Math.abs(pathAngle);
					let airspeed = Simplane.getIndicatedSpeed();
					if (airspeed < 400) {
						let turnRadius = airspeed * 360 / (1091 * 0.36 / airspeed) / 3600 / 2 / Math.PI;
						let activateDistance = Math.pow(90 / absPathAngle, 1.6) * turnRadius * 1.2;
						let distanceToActive = Avionics.Utils.computeGreatCircleDistance(planeCoordinates, activeWaypoint.infos.coordinates);
						if (distanceToActive < activateDistance) {
							this.flightPlanManager.setActiveWaypointIndex(this.flightPlanManager.getActiveWaypointIndex() + 1);
						}
					}
				}
			}
			SimVar.SetSimVarValue('SIMVAR_AUTOPILOT_AIRSPEED_MIN_CALCULATED', 'knots', Simplane.getStallProtectionMinSpeed());
			SimVar.SetSimVarValue('SIMVAR_AUTOPILOT_AIRSPEED_MAX_CALCULATED', 'knots', Simplane.getMaxSpeed(Aircraft.AS01B));

			/**
			 * Commented out. This is ASOBO implementation and we could not find any information about this behavior in FCOM.
			 * This cause overriding CRZ altitude by MCP everytime when you touch altitude knob.
			 * Normal behavior should be wait for pushing Altitude Intervention and then override CRZ altitude.
			 */
			/*
			if (this.getIsVNAVActive()) {
				let altitude = Simplane.getAltitude();
				let targetAltitude = Simplane.getAutoPilotAltitudeLockValue('feet');
				let delta = Math.abs(targetAltitude - altitude);
				if (delta > 400) {
					this.activateAltitudeSel();
				}
			}
			*/
			if (this.currentFlightPhase > FlightPhase.FLIGHT_PHASE_CLIMB) {
				let altitude = Simplane.getAltitudeAboveGround();
				if (altitude < 20) {
					this.deactivateSPD();
				}
			}
			if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_TAKEOFF) {
				if (this.getIsVNAVActive()) {
					let speed = this.determineClimbSpeed();
					this.setAPManagedSpeed(speed, Aircraft.AS01B);
				} else {
					this._fmcCommandClimbSpeedType = null;
					this._lastFmcCommandClimbSpeedType = null;
				}
			} else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB) {
				if (this.getIsVNAVActive()) {
					let speed = this.determineClimbSpeed();
					this.setAPManagedSpeed(speed, Aircraft.AS01B);
					let altitude = Simplane.getAltitudeAboveGround();
					let n1 = 100;
					if (altitude < this.thrustReductionAltitude) {
						n1 = this.getThrustTakeOffLimit() / 100;
					} else {
						n1 = this.getThrustClimbLimit() / 100;
					}
					SimVar.SetSimVarValue('AUTOPILOT THROTTLE MAX THRUST', 'number', n1);
				} else {
					this._fmcCommandClimbSpeedType = null;
					this._lastFmcCommandClimbSpeedType = null;
				}
			} else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CRUISE) {

				if (this._fmcCommandClimbSpeedType || this._lastFmcCommandClimbSpeedType) {
					this._fmcCommandClimbSpeedType = null;
					this._lastFmcCommandClimbSpeedType = null;
				}

				if (this.getIsVNAVActive()) {
					let speed = this.determineCruiseSpeed();
					let altitude = Simplane.getAltitudeAboveGround();

					this.setAPManagedSpeed(speed, Aircraft.AS01B);
					let n1 = 100;
					if (altitude < this.thrustReductionAltitude) {
						n1 = this.getThrustTakeOffLimit() / 100;
					} else {
						n1 = this.getThrustClimbLimit() / 100;
					}
					SimVar.SetSimVarValue('AUTOPILOT THROTTLE MAX THRUST', 'number', n1);
				} else {
					this._fmcCommandCruiseSpeedType = null;
					this._lastFmcCommandCruiseSpeedType = null;
				}
			} else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_DESCENT) {
				if (this._fmcCommandClimbSpeedType || this._lastFmcCommandClimbSpeedType || this._fmcCommandCruiseSpeedType || this._lastFmcCommandCruiseSpeedType) {
					this._fmcCommandClimbSpeedType = null;
					this._lastFmcCommandClimbSpeedType = null;
					this._fmcCommandCruiseSpeedType = null;
					this._lastFmcCommandCruiseSpeedType = null;
				}

				if (this.getIsVNAVActive()) {
					let speed = this.getDesManagedSpeed();
					this.setAPManagedSpeed(speed, Aircraft.AS01B);
				}
			} else if (this.currentFlightPhase === FlightPhase.FLIGHT_PHASE_APPROACH) {
				if (this.getIsVNAVActive()) {
					let speed = this.getManagedApproachSpeed();
					this.setAPManagedSpeed(speed, Aircraft.AS01B);
				}
				if (Simplane.getAutoPilotThrottleActive()) {
					let altitude = Simplane.getAltitudeAboveGround();
					if (altitude < 25) {
						if (Simplane.getEngineThrottleMode(0) != ThrottleMode.IDLE) {
							Coherent.call('GENERAL_ENG_THROTTLE_MANAGED_MODE_SET', ThrottleMode.IDLE);
						}
					}
				}
			}
			/** Default ASOBO implementation */
			//this._execLight.style.backgroundColor = this.getIsRouteActivated() ? '#00ff00' : 'black';
			/** Heavy implementation (left exec and FMC exec are synchronized) */
			if (this.getIsRouteActivated() || this._shouldBeExecEmisssive) {
				this._execLight.style.backgroundColor = '#00ff00';
			} else {
				this._execLight.style.backgroundColor = 'black';
			}
			this.updateAutopilotCooldown = this._apCooldown;
		}
	}

	determineClimbSpeed() {
		let speed = {
			SPEED_RESTRICTION: (this.climbSpeedRestriction && this.shouldFMCCommandSpeedRestriction() ? this.climbSpeedRestriction.speed : null),
			SPEED_TRANSITION: (!this._climbSpeedTransitionDeleted ? this.getCrzManagedSpeed() : null),
			SPEED_SELECTED: (this.preSelectedClbSpeed ? this.preSelectedClbSpeed : null),
			SPEED_ECON: this.getEconClbManagedSpeed()
		};

		this._lastFmcCommandClimbSpeedType = this._fmcCommandClimbSpeedType;

		let commandedSpeedKey = Object.keys(speed).filter(key => !!speed[key]).reduce((accumulator, value) => {
			return speed[value] < speed[accumulator] ? value : accumulator;
		}, 'SPEED_ECON');
		this._fmcCommandClimbSpeedType = commandedSpeedKey;

		if (this._lastFmcCommandClimbSpeedType !== this._fmcCommandClimbSpeedType) {
			SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'Number', 1);
		}

		return speed[commandedSpeedKey];
	}

	determineCruiseSpeed() {
		let speed = {
			SPEED_SELECTED: (this.preSelectedCrzSpeed ? this.preSelectedCrzSpeed : null),
			SPEED_ECON: this.getEconCrzManagedSpeed()
		};

		let commandedSpeedKey = 'SPEED_ECON';

		if (speed.SPEED_SELECTED) {
			commandedSpeedKey = 'SPEED_SELECTED';
		}

		this._lastFmcCommandCruiseSpeedType = this._fmcCommandCruiseSpeedType;


		this._fmcCommandCruiseSpeedType = commandedSpeedKey;

		if (this._lastFmcCommandCruiseSpeedType !== this._fmcCommandCruiseSpeedType) {
			SimVar.SetSimVarValue('L:FMC_UPDATE_CURRENT_PAGE', 'Number', 1);
		}

		return speed[commandedSpeedKey];
	}

	shouldFMCCommandSpeedRestriction() {
		let planeAltitude = Simplane.getAltitude();
		if (this.climbSpeedRestriction.speed && isFinite(this.climbSpeedRestriction.speed) && this.climbSpeedRestriction.altitude && isFinite(this.climbSpeedRestriction.altitude)) {
			if (this.climbSpeedRestriction.altitude > planeAltitude) {
				return true;
			}
		}
		return false;
	}

	getSpeedRestrictionSpeed() {
		return this.climbSpeedRestriction.speed || null;
	}

	getSpeedRestrictionAltitude() {
		return this.climbSpeedRestriction.altitude || null;
	}

	updateSideButtonActiveStatus() {
		for (let i = 0; i < this._leftKeyElements.length; i++) {
			if (this.onLeftInput[i]) {
				this._leftKeyElements[i].classList.add('active');
			} else {
				this._leftKeyElements[i].classList.remove('active');
			}
		}
		for (let i = 0; i < this._rightKeyElements.length; i++) {
			if (this.onRightInput[i]) {
				this._rightKeyElements[i].classList.add('active');
			} else {
				this._rightKeyElements[i].classList.remove('active');
			}
		}
	}

	generateLineSelectionElement(parent, isRightSide) {
		let btnH = 0.8;
		let btnW = 0.13;
		let zoneH = 0.5;
		let zoneW = 0.77;
		let h = 60;
		let w = 300;
		let btnHPx = Math.floor(btnH * h);
		let btnWPx = Math.floor(btnW * w);
		let zoneHPx = Math.floor(zoneH * h);
		let zoneWPx = Math.floor(zoneW * w);
		let dH = Math.floor((btnHPx - zoneHPx) * 0.5);
		let x0 = Math.floor((w - btnWPx - zoneWPx) * 0.5);
		let y0 = Math.floor((h - btnHPx) * 0.5);
		let container = document.createElementNS(Avionics.SVG.NS, 'svg');
		parent.appendChild(container);
		container.setAttribute('width', w.toFixed(0));
		container.setAttribute('height', h.toFixed(0));
		container.setAttribute('viewbox', '0 0 ' + w + ' ' + h);
		let path = document.createElementNS(Avionics.SVG.NS, 'path');
		container.appendChild(path);
		let d = 'M ' + x0 + ' ' + y0 + ' ';
		d += 'l ' + btnWPx + ' 0 ';
		d += 'l 0 ' + dH + ' ';
		d += 'l ' + (zoneWPx + 8) + ' 0 ';
		d += 'l 0 ' + zoneHPx + ' ';
		d += 'l -' + (zoneWPx + 8) + ' 0 ';
		d += 'l 0 ' + dH + ' ';
		d += 'l -' + btnWPx + ' 0 Z';
		path.setAttribute('d', d);
		path.setAttribute('fill', 'none');
		path.setAttribute('stroke-width', '3');
		path.setAttribute('stroke', 'magenta');
		if (isRightSide) {
			path.setAttribute('transform', 'translate(' + w + ', 0) scale(-1, 1)');
		}
		if (container instanceof SVGSVGElement) {
			container.style.position = 'fixed';
			container.style.zIndex = '1';
			return container;
		}
	}

	generateHTMLLayout(parent) {
		let x = parseInt(this.style.left);
		let y = parseInt(this.style.top);
		for (let i = 0; i < 6; i++) {
			let lineSelection = this.generateLineSelectionElement(parent);
			lineSelection.style.top = (y + Math.floor(89 + i * 54)) + 'px';
			lineSelection.style.left = (x + 4) + 'px';
			lineSelection.style.opacity = '0';
			let ii = i;
			lineSelection.addEventListener('mouseenter', () => {
				if (this.onLeftInput[ii]) {
					lineSelection.style.opacity = '1';
				}
			});
			lineSelection.addEventListener('mouseleave', () => {
				lineSelection.style.opacity = '0';
			});
			lineSelection.addEventListener('mouseup', () => {
				if (this.onLeftInput[ii]) {
					this.onLeftInput[ii]();
				}
			});
		}
		for (let i = 0; i < 6; i++) {
			let lineSelection = this.generateLineSelectionElement(parent, true);
			lineSelection.style.top = (y + Math.floor(89 + i * 54)) + 'px';
			lineSelection.style.left = (x + 340) + 'px';
			lineSelection.style.opacity = '0';
			let ii = i;
			lineSelection.addEventListener('mouseenter', () => {
				if (this.onRightInput[ii]) {
					lineSelection.style.opacity = '1';
				}
			});
			lineSelection.addEventListener('mouseleave', () => {
				lineSelection.style.opacity = '0';
			});
			lineSelection.addEventListener('mouseup', () => {
				if (this.onRightInput[ii]) {
					this.onRightInput[ii]();
				}
			});
		}
		let fmsPrevPageElement = this.getChildById('.fms-prev-page');
		fmsPrevPageElement.addEventListener('mouseenter', () => {
			fmsPrevPageElement.style.border = '2px solid magenta';
		});
		fmsPrevPageElement.addEventListener('mouseleave', () => {
			fmsPrevPageElement.style.border = '';
		});
		let fmsNextPageElement = this.getChildById('.fms-next-page');
		fmsNextPageElement.addEventListener('mouseenter', () => {
			fmsNextPageElement.style.border = '2px solid magenta';
		});
		fmsNextPageElement.addEventListener('mouseleave', () => {
			fmsNextPageElement.style.border = '';
		});
		return;
	}

	setPageCurrent(value) {
		if (typeof (value) === 'number') {
			this._pageCurrent = value;
		} else if (typeof (value) === 'string') {
			this._pageCurrent = parseInt(value);
		}
		let content = '';
		if (isFinite(this._pageCurrent) && isFinite(this._pageCount)) {
			if (this._pageCurrent > 0) {
				if (this._pageCount > 0) {
					content = this._pageCurrent + '/' + this._pageCount;
				}
			}
		}
		this._pageCurrentElement.textContent = content;
	}

	setPageCount(value) {
		if (typeof (value) === 'number') {
			this._pageCount = value;
		} else if (typeof (value) === 'string') {
			this._pageCount = parseInt(value);
		}
		let content = '';
		if (isFinite(this._pageCurrent) && isFinite(this._pageCount)) {
			if (this._pageCurrent > 0) {
				if (this._pageCount > 0) {
					content = this._pageCurrent + '/' + this._pageCount;
				}
			}
		}
		this._pageCurrentElement.textContent = content;
	}

	getOrSelectWaypointByIdent(ident, callback) {
		this.dataManager.GetWaypointsByIdent(ident).then((waypoints) => {
			if (!waypoints || waypoints.length === 0) {
				return callback(undefined);
			}
			if (waypoints.length === 1) {
				return callback(waypoints[0]);
			}
			B787_10_FMC_SelectWptPage.ShowPage(this, waypoints, callback);
		});
	}
}

B787_10_FMC._MonthOfYear = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
B787_10_FMC._v1s = [
	[130, 156],
	[128, 154],
	[127, 151],
	[125, 149],
	[123, 147],
	[122, 145],
	[121, 143],
	[120, 143],
	[120, 143],
	[120, 142],
	[119, 142],
	[119, 142],
	[119, 142],
	[119, 141],
	[118, 141],
	[118, 141],
	[118, 140],
	[118, 140],
	[117, 140],
	[117, 140]
];
B787_10_FMC._vRs = [
	[130, 158],
	[128, 156],
	[127, 154],
	[125, 152],
	[123, 150],
	[122, 148],
	[121, 147],
	[120, 146],
	[120, 146],
	[120, 145],
	[119, 145],
	[119, 144],
	[119, 144],
	[119, 143],
	[118, 143],
	[118, 142],
	[118, 142],
	[118, 141],
	[117, 141],
	[117, 140]
];
B787_10_FMC._v2s = [
	[135, 163],
	[133, 160],
	[132, 158],
	[130, 157],
	[129, 155],
	[127, 153],
	[127, 151],
	[126, 150],
	[125, 150],
	[125, 149],
	[124, 149],
	[124, 148],
	[124, 148],
	[123, 147],
	[123, 146],
	[123, 146],
	[123, 145],
	[122, 145],
	[122, 144],
	[121, 144]
];
registerInstrument('b787-10-fmc', B787_10_FMC);
//# sourceMappingURL=B787_10_FMC.js.map