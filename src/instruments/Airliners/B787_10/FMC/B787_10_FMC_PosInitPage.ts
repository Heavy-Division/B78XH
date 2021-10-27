class B787_10_FMC_PosInitPage {
	static ShowPage1(fmc: B787_10_FMC) {
		let currPos = new LatLong(SimVar.GetSimVarValue('GPS POSITION LAT', 'degree latitude'), SimVar.GetSimVarValue('GPS POSITION LON', 'degree longitude')).toDegreeString();
		console.log(currPos);
		let date = new Date();
		let dateString = fastToFixed(date.getHours(), 0).padStart(2, '0') + fastToFixed(date.getMinutes(), 0).padStart(2, '0') + 'z';
		let lastPos = '';
		if (fmc.lastPos) {
			lastPos = fmc.lastPos;
		}
		let refAirport = '□□□□';
		if (fmc.refAirport && fmc.refAirport.ident) {
			refAirport = fmc.refAirport.ident;
		}
		let refAirportCoordinates = '';
		if (fmc.refAirport && fmc.refAirport.infos && fmc.refAirport.infos.coordinates) {
			refAirportCoordinates = fmc.refAirport.infos.coordinates.toDegreeString();
		}
		let gate = '-----';
		if (fmc.refGate) {
			gate = fmc.refGate;
		}
		let heading = '---°';
		if (fmc.refHeading) {
			heading = fastToFixed(fmc.refHeading, 0).padStart(3, '0') + '°';
		}
		let irsPos = '□□□°□□.□ □□□□°□□.□';
		if (fmc.initCoordinates) {
			irsPos = fmc.initCoordinates;
		}
		fmc.clearDisplay();
		fmc.setTemplate([
			['POS INIT', '1', '3'],
			['', 'LAST POS'],
			['', lastPos],
			['REF AIRPORT'],
			[refAirport, refAirportCoordinates],
			['GATE'],
			[gate],
			['UTC (GPS)', 'GPS POS'],
			[dateString, currPos],
			['SET HDG', 'SET IRS POS'],
			[heading, irsPos],
			['__FMCSEPARATOR'],
			['\<INDEX', 'ROUTE>']
		]);
		fmc.onRightInput[0] = () => {
			fmc.inOut = fmc.lastPos;
		};
		fmc.onLeftInput[1] = async () => {
			let value = fmc.inOut;
			fmc.inOut = '';
			if (await fmc.tryUpdateRefAirport(value)) {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			}
		};
		fmc.onRightInput[1] = () => {
			fmc.inOut = refAirportCoordinates;
		};
		fmc.onLeftInput[2] = async () => {
			let value = fmc.inOut;
			fmc.inOut = '';
			if (fmc.tryUpdateGate(value)) {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			}
		};
		fmc.onRightInput[3] = () => {
			fmc.inOut = currPos;
		};
		fmc.onLeftInput[4] = async () => {
			let value = fmc.inOut;
			fmc.inOut = '';
			if (await fmc.tryUpdateHeading(value)) {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			}
		};
		fmc.onRightInput[4] = async () => {
			let value = fmc.inOut;
			fmc.inOut = '';
			if (await fmc.tryUpdateIrsCoordinatesDisplay(value)) {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			}
		};
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc.onRightInput[5] = () => {
			/**
			 * TODO
			 */
			//B787_10_FMC_RoutePage.ShowPage1(fmc);
		};
		fmc.onPrevPage = () => {
			B787_10_FMC_PosInitPage.ShowPage3(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_PosInitPage.ShowPage2(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}

	static ShowPage2(fmc: B787_10_FMC) {
		fmc.clearDisplay();
		fmc.setTemplate([
			['POS REF', '2', '3'],
			['FMC POS (GPS L)', 'GS'],
			[''],
			['IRS(3)'],
			[''],
			['RNP/ACTUAL', 'DME DME'],
			[''],
			[''],
			[''],
			['-----------------', 'GPS NAV'],
			['\<PURGE', '<INHIBIT'],
			[''],
			['\<INDEX', '<BRG/DIST']
		]);
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc.onRightInput[5] = () => {
		};
		fmc.onPrevPage = () => {
			B787_10_FMC_PosInitPage.ShowPage1(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_PosInitPage.ShowPage3(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}

	static ShowPage3(fmc: B787_10_FMC) {
		fmc.clearDisplay();
		fmc.setTemplate([
			['POS REF', '2', '3'],
			['IRS L', 'GS'],
			['000°/0.0NM', '290KT'],
			['IRS C', 'GS'],
			['000°/0.0NM', '290KT'],
			['IRS R', 'GS'],
			['000°/0.0NM', '290KT'],
			['GPS L', 'GS'],
			['000°/0.0NM', '290KT'],
			['GPS R', 'GS'],
			['000°/0.0NM', '290KT'],
			['__FMCSEPARATOR'],
			['\<INDEX', '<LAT/LON']
		]);
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc.onRightInput[5] = () => {
		};
		fmc.onPrevPage = () => {
			B787_10_FMC_PosInitPage.ShowPage2(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_PosInitPage.ShowPage1(fmc);
		};
		fmc.updateSideButtonActiveStatus();
	}
}