Include.addScript('/Heavy/Utils/HeavyDataStorage.js');

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
			['', '<CONFIGURATION']
		];

		console.log(HeavyDataStorage.get('DISABLE_MANAGERS_FOREVER'))

		if (!B787_10_FMC_HeavyPage.WITHOUT_MANAGERS) {
			if (HeavyDataStorage.get('DISABLE_MANAGERS_FOREVER', 'false') == 'false') {

				rows[2] = ['', '<Payload Manager'];
				rows[4] = ['', '<SimRate Manager'];

				fmc.onRightInput[0] = () => {
					new B787_10_FMC_PayloadManagerPage(fmc).showPage();
				};
				fmc.onRightInput[1] = () => {
					new B787_10_FMC_SimRateManagerPage(fmc).showPage();
				};
			}

			fmc.onRightInput[5] = () => {
				B787_10_FMC_HeavyConfigurationPage.ShowPage1(fmc);
			};
		}

		fmc.setTemplate(
			rows
		);

		fmc.updateSideButtonActiveStatus();
	}
}

B787_10_FMC_HeavyPage.WITHOUT_MANAGERS = false