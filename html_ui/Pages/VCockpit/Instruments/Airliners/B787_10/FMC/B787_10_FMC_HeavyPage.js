class B787_10_FMC_HeavyPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		fmc.setTemplate([
			['HEAVY MENU'],
			[''],
			['', '<Payload Manager'],
			[''],
			['', '<SimRate Manager'],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			[''],
			['']
		]);
		fmc.onRightInput[0] = () => {
			new B787_10_FMC_PayloadManagerPage(fmc).showPage()
		};
		fmc.onRightInput[1] = () => {
			new B787_10_FMC_SimRateManagerPage(fmc).showPage();
		};

		fmc.updateSideButtonActiveStatus();
	}
}