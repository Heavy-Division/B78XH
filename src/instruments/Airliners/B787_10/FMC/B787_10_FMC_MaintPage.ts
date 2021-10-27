class B787_10_FMC_MaintPage {
	static ShowPage1(fmc: B787_10_FMC) {
		fmc.clearDisplay();
		fmc.setTemplate([
			['MAINT'],
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
			['\<INDEX']
		]);
		fmc.onLeftInput[5] = () => {
			B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
		};
	}
}