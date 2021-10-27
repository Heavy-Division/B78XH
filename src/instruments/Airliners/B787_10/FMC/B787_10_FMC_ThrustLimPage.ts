class B787_10_FMC_ThrustLimPage {
	static _updateCounter = 0;

	static ShowPage1(fmc: B787_10_FMC) {
		fmc.clearDisplay();

		B787_10_FMC_ThrustLimPage._updateCounter = 0;
		fmc.pageUpdate = () => {
			if (B787_10_FMC_ThrustLimPage._updateCounter >= 50) {
				B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
			} else {
				B787_10_FMC_ThrustLimPage._updateCounter++;
			}
		};

		fmc.refreshPageCallback = () => {
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};

		let selectedTempCell;
		let selectedTemp = fmc.getThrustTakeOffTemp();
		if (selectedTemp) {
			selectedTempCell = fmc.makeSettable(String(selectedTemp));
		} else {
			selectedTempCell = fmc.makeSettable('--');
		}

		selectedTempCell = selectedTempCell + '°';


		fmc.onLeftInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();

			/**
			 * TODO: USE DELETE const instead???
			 */
			if (value === 'DELETE') {
				SimVar.SetSimVarValue('L:B78XH_THRUST_ASSUMED_TEMPERATURE', 'Number', -1000);
				SimVar.SetSimVarValue('H:AS01B_MFD_1_TAKEOFF_MODES_UPDATED', 'Number', 1);
				SimVar.SetSimVarValue('H:AS01B_MFD_2_TAKEOFF_MODES_UPDATED', 'Number', 1);
				fmc._thrustTakeOffTemp = NaN;
				B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
			} else if (value === '') {
				let origin = fmc.flightPlanManager.getOrigin();
				if (origin) {
					let oatValue = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
					let elevation = Math.round(parseFloat(origin.infos.oneWayRunways[0].elevation) * 3.28);
					let assumendTemp = Math.round(((((15 - (elevation / 1000 * 1.98)) + oatValue) * 1.25) - 1));
					if (fmc.setThrustTakeOffTemp(assumendTemp)) {
						B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
					}
				}
			} else {
				if (fmc.setThrustTakeOffTemp(value)) {
					B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
				}
			}
		};

		let toN1Cell = fastToFixed(fmc.getThrustTakeOffLimit(), 1) + '%';
		let oatValue = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		let oatCell = fastToFixed(oatValue, 1) + '°';
		let thrustTOMode = fmc.getThrustTakeOffMode();
		let thrustClimbMode = fmc.getThrustCLBMode();
		fmc.onLeftInput[1] = () => {
			fmc.setThrustTakeOffMode(0);
			fmc.setThrustCLBMode(0);
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};
		fmc.onLeftInput[2] = () => {
			fmc.setThrustTakeOffMode(1);
			fmc.setThrustCLBMode(1);
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};
		fmc.onLeftInput[3] = () => {
			fmc.setThrustTakeOffMode(2);
			fmc.setThrustCLBMode(2);
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};
		fmc.onRightInput[1] = () => {
			fmc.setThrustCLBMode(0);
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};
		fmc.onRightInput[2] = () => {
			fmc.setThrustCLBMode(1);
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};
		fmc.onRightInput[3] = () => {
			fmc.setThrustCLBMode(2);
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};

		let toN1CellTitle;
		switch (thrustTOMode) {
			case 0:
				toN1CellTitle = 'TO N1';
				break;
			case 1:
				toN1CellTitle = 'TO 1 N1';
				break;
			case 2:
				toN1CellTitle = 'TO 2 N1';
				break;
			default:
				toN1CellTitle = 'TO N1';
		}

		let thrustClimbModeCell0 = '';
		let thrustClimbModeCell1 = '';
		let thrustClimbModeCell2 = '';
		switch (thrustClimbMode) {
			case 0:
				thrustClimbModeCell0 = (fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB ? '<SEL>' : '<ARM>');
				break;
			case 1:
				thrustClimbModeCell1 = (fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB ? '<SEL>' : '<ARM>');
				break;
			case 2:
				thrustClimbModeCell2 = (fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB ? '<SEL>' : '<ARM>');
				break;
			default:
				toN1CellTitle = 'TO N1';
		}

		let separator = '__FMCSEPARATOR';
		if (!fmc.dataHolder.preFlightDataHolder.completed && !fmc.dataHolder.preFlightDataHolder.finished && !fmc.dataHolder.preFlightDataHolder.thrustLim.completed) {
			separator = '--------------------------------PRE-FLT';
		}

		fmc.setTemplate([
			['THRUST LIM'],
			['SEL/OAT', toN1CellTitle],
			[selectedTempCell + '[size=medium-size]C[/size]/' + oatCell + '[size=medium-size]C[/size]', toN1Cell],
			[''],
			['\<TO', 'CLB>', (thrustTOMode === 0 ? '<SEL>' : ''), thrustClimbModeCell0],
			['TO 1'],
			['\<-10%', 'CLB 1>', (thrustTOMode === 1 ? '<SEL>' : ''), thrustClimbModeCell1],
			['TO 2'],
			['\<-20%', 'CLB 2>', (thrustTOMode === 2 ? '<SEL>' : ''), thrustClimbModeCell2],
			[''],
			[''], //['\<TO-B'],
			[separator],
			['\<INDEX', 'TAKEOFF>']
		]);

		/**
		 * TODO: Really want to have these low level things here??
		 */
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
			B787_10_FMC_TakeOffRefPage.ShowPage1(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}
}