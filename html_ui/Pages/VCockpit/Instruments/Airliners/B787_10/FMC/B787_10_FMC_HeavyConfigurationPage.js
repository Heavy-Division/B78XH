Include.addScript('/Heavy/Utils/HeavyDataStorage.js');

class B787_10_FMC_HeavyConfigurationPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		fmc.setTemplate([
			['HEAVY CONFIGURATION'],
			[''],
			['', '<SimBrief'],
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

		this.setupInputHandlers(fmc);

		fmc.updateSideButtonActiveStatus();
	}

	static setupInputHandlers(fmc){
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_HeavyPage.ShowPage1(fmc);
		}

		fmc.onRightInput[0] = () => {
			new B787_10_FMC_SimBriefConfigurationPage(fmc).showPage();
		}
	}
}