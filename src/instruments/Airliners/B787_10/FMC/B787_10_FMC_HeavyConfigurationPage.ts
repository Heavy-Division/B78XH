class B787_10_FMC_HeavyConfigurationPage {
	static ShowPage1(fmc: B787_10_FMC) {
		fmc.clearDisplay();

		let fpSyncCell = '';

		console.log('STRATEGY: ' + HeavyDivision.configuration.activeFlightPlanSynchronizationStrategy());
		switch (HeavyDivision.configuration.activeFlightPlanSynchronizationStrategy()) {
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
		let unitsCell = (HeavyDivision.configuration.useImperial() ? '[color=green]IMPERIAL[/color]←→[size=small]METRIC[/size]>' : '[size=small]IMPERIAL[/size]←→[color=green]METRIC[/color]>');
		fmc.setTemplate([
			['HEAVY CONFIGURATION'],
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

		fmc.updateSideButtonActiveStatus();
	}

	static setupInputHandlers(fmc: B787_10_FMC) {
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_HeavyPage.ShowPage1(fmc);
		};

		fmc.onRightInput[0] = () => {
			new B787_10_FMC_SimBriefConfigurationPage(fmc).showPage();
		};


		fmc.onRightInput[1] = () => {
			switch (HeavyDivision.configuration.activeFlightPlanSynchronizationStrategy()) {
				case 0:
					HeavyDataStorage.set('FP_SYNCHRONIZATION_STRATEGY', '1');
					break;
				case 1:
					HeavyDataStorage.set('FP_SYNCHRONIZATION_STRATEGY', '0');
					break;
				case 2:
					HeavyDataStorage.set('FP_SYNCHRONIZATION_STRATEGY', '0');
					break;
				case 3:
					HeavyDataStorage.set('FP_SYNCHRONIZATION_STRATEGY', '0');
					break;
			}
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		};


		fmc.onRightInput[2] = () => {
			if (HeavyDivision.configuration.useImperial()) {
				HeavyDataStorage.set('USE_IMPERIAL', '0');
			} else {
				HeavyDataStorage.set('USE_IMPERIAL', '1');
			}
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		};
	}

	static isSimBriefFilled() {
		let username = HeavyDataStorage.get('SIMBRIEF_USERNAME', '');
		let userid = HeavyDataStorage.get('SIMBRIEF_USERID', '');

		return (username !== '' || userid !== '');
	}
}