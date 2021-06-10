class B787_10_FMC_ThrustLimPage {
	static ShowPage1(fmc) {
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
		if(selectedTemp){
			selectedTempCell = '[settable]' + selectedTemp + '[/settable]';
		} else {
			selectedTempCell = '[settable]--[/settable]';
		}
		selectedTempCell = selectedTempCell + '°';
		fmc.onLeftInput[0] = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if(value === 'DELETE'){
				fmc._thrustTakeOffTemp = NaN;
				B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
				return;
			}
			if (fmc.setThrustTakeOffTemp(value)) {
				B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
			}
		};
		let toN1Cell = fmc.getThrustTakeOffLimit().toFixed(1) + '%';
		let oatValue = SimVar.GetSimVarValue('AMBIENT TEMPERATURE', 'celsius');
		let oatCell = oatValue.toFixed(1) + '°';
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
				thrustClimbModeCell0 = (fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB ? '<SEL>' : '<ARM>')
				break;
			case 1:
				thrustClimbModeCell1 = (fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB ? '<SEL>' : '<ARM>')
				break;
			case 2:
				thrustClimbModeCell2 = (fmc.currentFlightPhase === FlightPhase.FLIGHT_PHASE_CLIMB ? '<SEL>' : '<ARM>')
				break;
			default:
				toN1CellTitle = 'TO N1';
		}

		let separator = '__FMCSEPARATOR';
		if(!fmc.fmcPreFlightComplete.completed && !fmc.fmcPreFlightComplete.finished && !fmc.fmcPreFlightComplete.thrust.completed){
			separator = '--------------------------------PRE-FLT';
		}

		fmc.setTemplate([
			['THRUST LIM'],
			['SEL/OAT', toN1CellTitle],
			[selectedTempCell + '[size=medium-size]C[/size]/' + oatCell + '[size=medium-size]C[/size]', toN1Cell],
			[''],
			['\<TO', '<CLB', (thrustTOMode === 0 ? '<SEL>' : ''), thrustClimbModeCell0],
			['TO 1'],
			['\<-10%', '<CLB 1', (thrustTOMode === 1 ? '<SEL>' : ''), thrustClimbModeCell1],
			['TO 2'],
			['\<-20%', '<CLB 2', (thrustTOMode === 2 ? '<SEL>' : ''), thrustClimbModeCell2],
			[''],
			[''], //['\<TO-B'],
			[separator],
			['\<INDEX', '<TAKEOFF']
		]);

		if(fmc.fmcPreFlightComplete.completed && !fmc.fmcPreFlightComplete.finished){
			let fmsPreFlightElement = document.createElement("div");
			fmsPreFlightElement.classList.add('fms-preflight');
			fmsPreFlightElement.setAttribute('style', 'display: block; position: absolute; background-color: #1daa05; height: 22px; width: 255px; font-size: 15px; text-align: center; border-radius: 11px; top: -5px; left: 107px; padding-top: 4px;')
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

B787_10_FMC_ThrustLimPage._updateCounter = 0;

//# sourceMappingURL=B787_10_FMC_ThrustLimPage.js.map