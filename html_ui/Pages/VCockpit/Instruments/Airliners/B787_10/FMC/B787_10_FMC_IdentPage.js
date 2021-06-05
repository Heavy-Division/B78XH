class B787_10_FMC_IdentPage {
	static ShowPage1(fmc) {
		fmc.clearDisplay();
		B787_10_FMC_IdentPage._updateCounter = 0;
		fmc.pageUpdate = () => {
			if (B787_10_FMC_IdentPage._updateCounter >= 50) {
				B787_10_FMC_IdentPage.ShowPage1(fmc);
			} else {
				B787_10_FMC_IdentPage._updateCounter++;
			}
		};

		let model = SimVar.GetSimVarValue('ATC MODEL', 'string', 'FMC');
		if (!model) {
			model = 'unkn.';
		}
		let date = fmc.getNavDataDateRange();
		fmc.setTemplate([
			['IDENT'],
			['MODEL', 'ENGINES'],
			['787-10', 'GEnx-2B67B'],
			['NAV DATA', 'ACTIVE'],
			['AIRAC', date.toString()],
			['DRAG/FF'],
			[''],
			['OP PROGRAM', 'CO DATA'],
			[fmc.fmcManVersion, 'VS1001'],
			['OPC'],
			[fmc.fmcBakVersion, ''],
			['--------------------------------------'],
			['\<INDEX', '<POS INIT']
		]);
		if (fmc.urlConfig.index == 1) {
			fmc.onLeftInput[5] = () => {
				B787_10_FMC_InitRefIndexPage.ShowPage1(fmc);
			};
			fmc.onRightInput[5] = () => {
				B787_10_FMC_PosInitPage.ShowPage1(fmc);
			};
		}
		fmc.updateSideButtonActiveStatus();

		if (!fmc.fmcManVersion.includes('HD') || !fmc.fmcBakVersion.includes('HD')) {
			fmc.registerPeriodicPageRefresh(() => {
				B787_10_FMC_IdentPage.ShowPage1(fmc);
				return true;
			}, 100, false);
		}
	}
}

B787_10_FMC_IdentPage._updateCounter = 0;
//# sourceMappingURL=B787_10_FMC_IdentPage.js.map