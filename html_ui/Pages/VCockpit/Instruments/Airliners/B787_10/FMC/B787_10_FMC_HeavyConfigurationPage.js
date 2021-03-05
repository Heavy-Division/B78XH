Include.addScript('/Heavy/Utils/HeavyDataStorage.js');

class B787_10_FMC_HeavyConfigurationPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		fmc.setTemplate([
			['HEAVY CONFIGURATION'],
			[''],
			[''],
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


		fmc.onLeftInput[5] = () => {
			B787_10_FMC_HeavyPage.ShowPage1(fmc);
		}

		fmc.updateSideButtonActiveStatus();
	}
}