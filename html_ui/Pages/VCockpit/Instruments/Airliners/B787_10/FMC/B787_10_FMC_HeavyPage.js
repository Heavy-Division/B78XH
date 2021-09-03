class B787_10_FMC_HeavyPage {

	static ShowPage1(fmc) {
		fmc.clearDisplay();
		let rows = [
			['HEAVY MENU'],
			[''],
			['', ''],
			[''],
			['', ''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['', 'CONFIGURATION>']
		];

		if (!B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
			rows[2] = ['', 'IRS Menu>'];
			rows[4] = ['', 'Payload Manager>'];
			//rows[6] = ['', 'SimRate Manager>'];

			fmc.onRightInput[0] = () => {
				new B787_10_FMC_HeavyIRSPage(fmc).showPage();
			};

			fmc.onRightInput[1] = () => {
				new B787_10_FMC_PayloadManagerPage(fmc).showPage();
			};
			/*
			fmc.onRightInput[2] = () => {
				new B787_10_FMC_SimRateManagerPage(fmc).showPage();
			};
			 */
		}

		fmc.onRightInput[5] = () => {
			B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
		};

		fmc.setTemplate(
			rows
		);

		fmc.updateSideButtonActiveStatus();
	}
}

B787_10_FMC_HeavyPage.WITHOUT_MANAGERS = false;