Include.addScript('/Heavy/Utils/HeavyDataStorage.js');

class B787_10_FMC_HeavyConfigurationPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		fmc.setTemplate([
			['HEAVY CONFIGURATION'],
			[''],
			['', '<(Disable managers (FOREVER'],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['<BACK']
		]);

		fmc.onRightInput[0] = () => {
			HeavyDataStorage.set("DISABLE_MANAGERS_FOREVER", "true");
			B787_10_FMC_HeavyPage.ShowPage1(fmc);
		};

		fmc.onLeftInput[5] = () => {
			B787_10_FMC_HeavyPage.ShowPage1(fmc);
		}

		fmc.updateSideButtonActiveStatus();
	}
}