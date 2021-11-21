import {B787_10_FMC} from './B787_10_FMC';
import {B787_10_FMC_HeavyPage} from './B787_10_FMC_HeavyPage';
import {B787_10_FMC_SimBriefConfigurationPage} from './B787_10_FMC_SimBriefConfigurationPage';
import * as HDSDK from './../../hdsdk/index';

export class B787_10_FMC_HeavyConfigurationPage {
	static ShowPage1(fmc: B787_10_FMC) {
		fmc.cleanUpPage();

		let fpSyncCell = '';

		switch (HDSDK.HeavyDivision.Configuration.activeFlightPlanSynchronizationStrategy()) {
			case 0:
				fpSyncCell = '[color=green]None[/color]/[size=small]OneWay[/size]>';
				break;
			case 1:
				fpSyncCell = '[size=small]None[/size]/[color=green]OneWay[/color]>';
				break;
			case 2:
				fpSyncCell = '[color=green]None[/color]/[size=small]OneWay[/size]>';
				break;
			case 3:
				fpSyncCell = '[color=green]None[/color]/[size=small]OneWay[/size]>';
				break;
		}

		let simBriefCell = (this.isSimBriefFilled() ? '[color=green]FILLED[/color]>' : '[color=red]NOT FILLED[/color]>');
		let unitsCell = (HDSDK.HeavyDivision.Configuration.useImperial() ? '[color=green]IMPERIAL[/color]←→[size=small]METRIC[/size]>' : '[size=small]IMPERIAL[/size]←→[color=green]METRIC[/color]>');

		fmc._renderer.renderTitle('HEAVY CONFIGURATION');
		fmc._renderer.render([
			['', 'SimBrief'],
			['', simBriefCell],
			['', 'FP SYNC STRATEGY'],
			['', fpSyncCell],
			['', 'UNITS'],
			['', unitsCell],
			[''],
			[''],
			[''],
			[''],
			[''],
			['<BACK']
		]);

		this.setupInputHandlers(fmc);

	}

	static setupInputHandlers(fmc: B787_10_FMC) {
		fmc._renderer.lsk(6).event = () => {
			B787_10_FMC_HeavyPage.ShowPage1(fmc);
		};

		fmc._renderer.rsk(1).event = () => {
			new B787_10_FMC_SimBriefConfigurationPage(fmc).showPage();
		};


		fmc._renderer.rsk(2).event = () => {
			switch (HDSDK.HeavyDivision.Configuration.activeFlightPlanSynchronizationStrategy()) {
				case 0:
					HDSDK.HeavyDataStorage.set('FP_SYNCHRONIZATION_STRATEGY', '1');
					break;
				case 1:
					HDSDK.HeavyDataStorage.set('FP_SYNCHRONIZATION_STRATEGY', '0');
					break;
				case 2:
					HDSDK.HeavyDataStorage.set('FP_SYNCHRONIZATION_STRATEGY', '0');
					break;
				case 3:
					HDSDK.HeavyDataStorage.set('FP_SYNCHRONIZATION_STRATEGY', '0');
					break;
			}
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		};


		fmc._renderer.rsk(3).event = () => {
			if (HDSDK.HeavyDivision.Configuration.useImperial()) {
				HDSDK.HeavyDataStorage.set('USE_IMPERIAL', '0');
			} else {
				HDSDK.HeavyDataStorage.set('USE_IMPERIAL', '1');
			}
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		};
	}

	static isSimBriefFilled() {
		let username = HDSDK.HeavyDataStorage.get('SIMBRIEF_USERNAME', '');
		let userid = HDSDK.HeavyDataStorage.get('SIMBRIEF_USERID', '');

		return (username !== '' || userid !== '');
	}
}