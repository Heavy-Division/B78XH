import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_InitRefIndexPage} from './B787_10_FMC_InitRefIndexPage';

export class B787_10_FMC_PosInitPage {
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
		fmc.cleanUpPage();
		fmc._renderer.renderTitle('POS INIT');
		fmc._renderer.renderPages(1, 3);
		fmc._renderer.render([
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
			['<INDEX', 'ROUTE>']
		]);
		fmc._renderer.rsk(1).event = () => {
			fmc.inOut = fmc.lastPos;
		};
		fmc._renderer.lsk(2).event = async () => {
			let value = fmc.inOut;
			fmc.inOut = '';
			if (await fmc.tryUpdateRefAirport(value)) {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			}
		};
		fmc._renderer.rsk(2).event = () => {
			fmc.inOut = refAirportCoordinates;
		};
		fmc._renderer.lsk(3).event = async () => {
			let value = fmc.inOut;
			fmc.inOut = '';
			if (fmc.tryUpdateGate(value)) {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			}
		};
		fmc._renderer.rsk(4).event = () => {
			fmc.inOut = currPos;
		};
		fmc._renderer.lsk(5).event = async () => {
			let value = fmc.inOut;
			fmc.inOut = '';
			if (await fmc.tryUpdateHeading(value)) {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			}
		};
		fmc._renderer.rsk(5).event = async () => {
			let value = fmc.inOut;
			fmc.inOut = '';
			if (await fmc.tryUpdateIrsCoordinatesDisplay(value)) {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			}
		};
		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc._renderer.rsk(6).event = () => {
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
	}

	static ShowPage2(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
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
			['<PURGE', '<INHIBIT'],
			[''],
			['<INDEX', '<BRG/DIST']
		]);
		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc._renderer.rsk(6).event = () => {
		};
		fmc.onPrevPage = () => {
			B787_10_FMC_PosInitPage.ShowPage1(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_PosInitPage.ShowPage3(fmc);
		};
	}

	static ShowPage3(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
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
			['<INDEX', '<LAT/LON']
		]);
		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
		fmc._renderer.rsk(6).event = () => {
		};
		fmc.onPrevPage = () => {
			B787_10_FMC_PosInitPage.ShowPage2(fmc);
		};
		fmc.onNextPage = () => {
			B787_10_FMC_PosInitPage.ShowPage1(fmc);
		};
	}
}