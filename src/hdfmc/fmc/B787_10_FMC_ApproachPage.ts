import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_InitRefIndexPage} from './B787_10_FMC_InitRefIndexPage';
import {B787_10_FMC_ThrustLimPage} from './B787_10_FMC_ThrustLimPage';
import * as HDSDK from './../../hdsdk/index';

export class B787_10_FMC_ApproachPage {
	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();
		let landingWeightCell = '';
		let flaps20Cell = '';
		let flaps25Cell = '';
		let flaps30Cell = '';
		let flaps20VRefCell = '';
		let flaps25VRefCell = '';
		let flaps30VRefCell = '';
		const useImperial = HDSDK.HeavyDivision.Configuration.useImperial();
		let landingWeight = fmc.getWeight(useImperial);
		if (isFinite(landingWeight)) {
			landingWeightCell = landingWeight.toFixed(1);
			flaps20Cell = '20°';
			flaps25Cell = '25°';
			flaps30Cell = '30°';
			let flaps20Speed = fmc.speedManager.getVRef(7);
			if (isFinite(flaps20Speed)) {
				flaps20VRefCell = flaps20Speed.toFixed(0) + 'KT';
				fmc._renderer.rsk(1).event = () => {
					fmc.inOut = '20/' + flaps20Speed.toFixed(0);
				};
			}
			let flaps25Speed = fmc.speedManager.getVRef(8);
			if (isFinite(flaps25Speed)) {
				flaps25VRefCell = flaps25Speed.toFixed(0) + 'KT';
				fmc._renderer.rsk(2).event = () => {
					fmc.inOut = '25/' + flaps25Speed.toFixed(0);
				};
			}
			let flaps30Speed = fmc.speedManager.getVRef(9);
			if (isFinite(flaps30Speed)) {
				flaps30VRefCell = flaps30Speed.toFixed(0) + 'KT';
				fmc._renderer.rsk(3).event = () => {
					fmc.inOut = '30/' + flaps30Speed.toFixed(0);
				};
			}
		}
		let finalCell = '-----';
		let runwayLengthCell = '---';
		let approach = fmc.flightPlanManager.getApproach();
		let destination = fmc.flightPlanManager.getDestination();


		if (destination && destination.ident) {
			finalCell = destination.ident + ' ';
		}

		if (approach && approach.name) {
			if (finalCell === '-----') {
				finalCell = '';
			}
			finalCell = finalCell + Avionics.Utils.formatRunway(approach.name);
			let approachRunway = fmc.flightPlanManager.getApproachRunway();
			if (approachRunway) {
				runwayLengthCell = ' ' + (approachRunway.length * 3.2808399).toFixed(0) + 'FT ' + approachRunway.length.toFixed(0) + 'M';
			}
		}
		let selectedFlapSpeedCell = '';
		if (isFinite(fmc.selectedApproachFlap)) {
			selectedFlapSpeedCell = fmc.selectedApproachFlap.toFixed(0) + '°';
		} else {
			selectedFlapSpeedCell = '---';
		}
		selectedFlapSpeedCell += '/ ';
		if (isFinite(fmc.selectedApproachSpeed)) {
			selectedFlapSpeedCell += fmc.selectedApproachSpeed.toFixed(0) + 'KT';
		} else {
			selectedFlapSpeedCell += '---';
		}
		fmc._renderer.rsk(4).event = () => {
			let value = fmc.inOut;
			fmc.clearUserInput();
			if (fmc.setSelectedApproachFlapAndVREFSpeed(value)) {
				B787_10_FMC_ApproachPage.ShowPage1(fmc);
			}
		};

		fmc._renderer.renderTitle('APPROACH REF');
		fmc._renderer.render([
			['GROSS WT', '', 'FLAPS', 'VREF'],
			[landingWeightCell, '', flaps20Cell, flaps20VRefCell],
			[''],
			['', '', flaps25Cell, flaps25VRefCell],
			['LANDING REF'],
			['<[size=small]QFE[/size]←→[color=green]QNH[/color]', '', flaps30Cell, flaps30VRefCell],
			[finalCell, 'FLAP/SPD'],
			[runwayLengthCell, selectedFlapSpeedCell],
			[''],
			[''],
			['__FMCSEPARATOR'],
			['<INDEX', 'THRUST LIM>']
		]);

		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};

		fmc._renderer.rsk(6).event = () => {
			B787_10_FMC_ThrustLimPage.ShowPage1(fmc);
		};
	}
}